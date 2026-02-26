import { defineStore } from "pinia"
import { supabase } from "@/services/supabaseClient"
import { compressAndConvertToWebP } from "@/utils/imageCompression"
import { useSocketStore } from "./socket"
import { MAX_IMAGE_UPLOAD } from "@/constants"
import { useUserStore } from "./user"

export const useUploadStore = defineStore("upload", {
    state: () => ({
        total: 0,

        // Conversion state
        isConverting: false,
        convertedCount: 0,

        // Upload state
        isUploading: false,
        uploadedCount: 0,

        // Optional: status / errors
        error: null,
    }),

    getters: {
        conversionProgress: (s) =>
            s.total === 0 ? 0 : Math.min(100, Math.round((s.convertedCount / s.total) * 100)),

        uploadProgress: (s) =>
            s.total === 0 ? 0 : Math.min(100, Math.round((s.uploadedCount / s.total) * 100)),

        // If you want ONE combined progress (conversion + upload)
        // each file has 2 phases: convert (50%) + upload (50%)
        totalProgress: (s) => {
            if (s.total === 0) return 0
            const perFileStepsDone = s.convertedCount + s.uploadedCount // max 2*total
            return Math.min(100, Math.round((perFileStepsDone / (2 * s.total)) * 100))
        },
    },

    actions: {
        reset() {
            this.isConverting = false
            this.convertedCount = 0

            this.isUploading = false

            this.error = null
        },
        resetUploadCount() {
            this.uploadedCount = 0
        },

        setTotal(totalImages = MAX_IMAGE_UPLOAD) {
            this.total = totalImages
        },

        async convertToWebpFile(inputFile, { maxWidth = 800, maxHeight = 800, quality = 0.7 } = {}) {
            const webpBlob = await compressAndConvertToWebP(inputFile, {
                maxWidth,
                maxHeight,
                quality,
            })

            const baseName = inputFile.name.replace(/\.[^/.]+$/, "")
            return new File([webpBlob], `${baseName}.webp`, { type: "image/webp" })
        },

        async convertAll(image, options) {
            this.isConverting = true
            this.convertedCount = 0

            const converted = []

            const webpFile = await this.convertToWebpFile(image.file, options)
            converted.push({ ...image, webpFile })

            this.convertedCount++

            this.isConverting = false
            return converted
        },

        async uploadSingleFile(webpFile, { id, tag }) {

            const safeName = webpFile.name.replaceAll(" ", "_")
            const path = `public/${tag}:${id}:${safeName}`

            const { error } = await supabase.storage
                .from(import.meta.env.VITE_STORAGE_BUCKET)
                .upload(path, webpFile, {
                    contentType: webpFile.type,
                    upsert: true,
                })

            if (error) throw error





            return path
        },

        async uploadAll(convertedImages) {
            this.isUploading = true

            const paths = []

            for (const img of convertedImages) {
                const path = await this.uploadSingleFile(img.webpFile, {
                    id: img.id,
                    tag: img.tag,
                })
                paths.push(path)
                this.uploadedCount++

            }


            this.isUploading = false
            return paths
        },

        async convertAndUpload(username, image, convertOptions) {
            const socketStore = useSocketStore()
            const userStore = useUserStore()
            this.reset()
            this.error = null


            try {
                const converted = await this.convertAll(image, convertOptions)

                /* 
                when ready to upload connect to server
                to show other user you're on your way 
                */
                socketStore.connect(username)
                socketStore.socket.emit("userUpload");


                const paths = await this.uploadAll(converted)


                socketStore.socket.emit("userWaiting", {
                    id: userStore.user.id,
                });

                return paths
            } catch (e) {
                this.isConverting = false
                this.isUploading = false
                this.error = e?.message ?? String(e)
                throw e
            }
        },
    },
})
