<template>
  <div class="images-container">
    <n-upload
      :disabled="successfulUploads >= getMaxImgCount"
      :min="5"
      :multiple="true"
      :show-file-list="false"
      @change="handleImageUpload"
      accept="image/*"
    >
      <n-button class="button-3D" :bordered="false">Upload</n-button>
    </n-upload>
  </div>

  <div class="progress-container">
    <div v-if="imgConversionLabel && !serverUploadProgress">🍲 Cooking the images 🍳</div>

    <n-progress
      v-if="imgConversionLabel && !serverUploadProgress"
      type="line"
      :percentage="imgConversionProgress"
      color="#67a8f3"
      :show-indicator="false"
      processing
    />

    <n-progress
      v-if="serverUploadProgress"
      type="line"
      color="#36ad6a"
      :percentage="100"
      indicator-placement="inside"
      processing
    />

    <div>Images Uploaded {{ successfulUploads }}</div>
  </div>
</template>

<script>
import { toRaw } from "vue";
import { MAX_IMAGE_UPLOAD } from "@/constants";
// eslint-disable-next-line no-unused-vars
import { imagesToServer } from "@/utils/imageHandler";
import supabaseService from "@/services/supabaseService";

export default {
  name: "ImagesContainer",

  props: {
    user: {
      type: {},
      default: null,
    },
    socket: {
      require: true,
      default: null,
    },
  },

  data() {
    return {
      rawImagesCount: 0,
      convertedImages: [], // Stores the converted images
      imgConversionLabel: false,
      imgConversionProgress: 0,
      serverUploadProgress: 0,
      successfulUploads: 0, // total images successfully uploaded,
    };
  },
  computed: {
    getMaxImgCount() {
      return MAX_IMAGE_UPLOAD;
    },
  },

  methods: {
    async handleImageUpload(data) {
      this.imgConversionLabel = true;

      const noDupliList = data.fileList.filter(
        (file, index, self) => index === self.findIndex((f) => f.name === file.name)
      );

      const files = noDupliList.slice(0, this.getMaxImgCount);
      this.rawImagesCount = files.length;

      const filePromises = files.map(async (file) => {
        if (!file.file.type.startsWith("image/")) {
          console.error("File is not an image:", file.name);
          return null;
        }

        try {
          const compressedImageBlob = await this.compressAndConvertToWebP(file.file);

          if (!compressedImageBlob) throw new Error("Compression failed");

          if (
            !this.convertedImages.find(
              (img) => img.name === file.name.replace(/\.\w+$/, ".webp")
            )
          ) {
            this.convertedImages.push({
              userId: toRaw(this.user).id,
              file: compressedImageBlob,
              name: file.name.replace(/\.\w+$/, ".webp"),
            });
          }
          this.updateConversionProgress(this.convertedImages.length);
        } catch (error) {
          console.error(`Error processing image ${file.name}:`, error.message);
        }
      });

      await Promise.all(filePromises);

      console.log(toRaw(this.convertedImages));
      if (filePromises.length === this.convertedImages.length) {
        this.sendToStorage();
      }
    },

    compressAndConvertToWebP(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let { width, height } = img;

          if (width > height && width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
            "image/webp",
            0.7
          );
        };

        img.onerror = (error) => reject(new Error(`Image load error: ${error.message}`));
      });
    },

    async sendToStorage() {
      this.serverUploadProgress = true;

      const response = await supabaseService.uploadImages(toRaw(this.convertedImages));

      this.successfulUploads = response;
      this.readyState();
      this.convertedImages = [];
    },

    updateConversionProgress(completed) {
      this.imgConversionProgress = Math.trunc((completed / this.rawImagesCount) * 100);

      // Cap the progress at 100% once all uploads are done
      if (this.imgConversionProgress >= 100) {
        this.imgConversionProgress = 100;
      }
    },

    readyState() {
      this.socket.emit("userReady", {
        id: this.user.id,
        imageCount: this.successfulUploads,
      });
    },
  },

  beforeUnmount() {
    // Clean up the socket connection
    // if (this.socket) {
    //   this.socket.disconnect();
    // }
  },
};
</script>

<style lang="scss">
.images-container {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 1rem;
  text-align: center;

  .n-progress .n-progress-graph-line-indicator {
    text-align: center !important;
  }
}
</style>
