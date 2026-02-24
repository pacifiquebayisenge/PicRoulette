export function compressAndConvertToWebP(file, { maxWidth = 800, maxHeight = 800, quality = 0.7 } = {}) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.src = url

        img.onload = () => {
            URL.revokeObjectURL(url)

            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            let { width, height } = img

            if (width > height && width > maxWidth) {
                height *= maxWidth / width
                width = maxWidth
            } else if (height > maxHeight) {
                width *= maxHeight / height
                height = maxHeight
            }

            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)

            canvas.toBlob(
                (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
                "image/webp",
                quality
            )
        }

        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error("Image load error"))
        }
    })
}
