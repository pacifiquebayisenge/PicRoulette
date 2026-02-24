<template>
  <div class="images-container">
    <n-upload
      :disabled="isDisabled"
      :min="5"
      :max="getMaxImgCount"
      :multiple="true"
      :show-file-list="false"
      @change="handleImageUpload"
      accept="image/*"
    >
      <n-button class="button-3D" :bordered="false">Upload</n-button>
    </n-upload>
  </div>

  <n-button
    v-if="socketStore.socket && uploadStore.uploadedCount"
    class="button-3D button-3D--water"
    :bordered="false"
    @click="readyState"
    >Ready</n-button
  >

  <div class="progress-container">
    <!-- Conversion -->
    <div v-if="uploadStore.isConverting">🍲 Cooking the images 🍳</div>

    <n-progress
      type="line"
      v-if="uploadStore.isConverting"
      :percentage="uploadStore.conversionProgress"
      :show-indicator="false"
      processing
    />

    <!-- Upload -->
    <div v-if="uploadStore.isUploading">⬆️ Uploading...</div>

    <n-progress
      type="line"
      :percentage="uploadStore.uploadProgress"
      indicator-placement="inside"
      processing
    />

    <!-- Optional overall progress -->
    <!-- <n-progress
      v-if="uploadStore.isConverting || uploadStore.isUploading"
      type="line"
      :percentage="uploadStore.totalProgress"
      :show-indicator="false"
      processing
    /> -->

    <!-- <div>Converted {{ uploadStore.convertedCount }} / {{ uploadStore.total }}</div> -->
    <div v-if="uploadStore.uploadedCount">
      Uploaded {{ uploadStore.uploadedCount }} / {{ uploadStore.total }}
    </div>

    <div v-if="uploadStore.error" style="margin-top: 8px">❌ {{ uploadStore.error }}</div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { MAX_IMAGE_UPLOAD } from "@/constants";
import { useUploadStore } from "@/stores/upload";
import { useUserStore } from "@/stores/user";
import { useSocketStore } from "@/stores/socket";
import { v4 as uuid } from "uuid";

const props = defineProps({
  username: { type: String, default: undefined },
});

const uploadStore = useUploadStore();
const socketStore = useSocketStore();
const userStore = useUserStore();
const uniqueSuffix = uuid();

// computed
const getMaxImgCount = computed(() => MAX_IMAGE_UPLOAD);

const isDisabled = computed(() => {
  const alreadyUploaded = uploadStore.uploadedCount ?? 0;

  const isBusy = uploadStore.isConverting || uploadStore.isUploading;
  const reachedLimit = alreadyUploaded >= getMaxImgCount.value;
  const missingInput = !props.username;

  return isBusy || reachedLimit || missingInput;
});

async function handleImageUpload(data) {
  if (!props.username) return;

  // way to combine the image with the user during the game
  const tag = `${props.username}_${uniqueSuffix}`;

  const image = {
    file: data.file.file,
    id: uuid(),
    tag,
  };

  try {
    await uploadStore.convertAndUpload(tag, image, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.7,
    });
  } catch (e) {
    // uploadStore.error is already set in the store
    console.error(e);
  }
}

function readyState() {
  console.log("eee");
  socketStore.socket.emit("userReady", userStore.user);
}
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
