<template>
  <n-modal
    v-model:show="isOpen"
    :closable="false"
    preset="dialog"
    bordered
    loading
    :showIcon="false"
  >
    <template #header>
      <div class="dialog-title">
        🥳
        <p>A new update</p>
        🎉
      </div>
    </template>

    <!-- Progress Bar -->
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
    </div>
  </n-modal>
</template>

<script>
import { NModal } from "naive-ui";

export default {
  name: "UpdatePrompt",

  components: {
    NModal,
  },

  data() {
    return {
      isOpen: false,
      resolvePrompt: null,
      autoCloseTimeout: null, // For storing the timeout ID
      progress: 0, // Progress percentage for the bar
    };
  },

  methods: {
    showPrompt(autoCloseSeconds = 5) {
      this.isOpen = true;
      this.progress = 0;

      // Update the progress bar every 100ms
      const interval = 100;
      const totalTicks = (autoCloseSeconds * 1000) / interval;
      let currentTick = 0;

      const updateProgress = () => {
        currentTick++;
        this.progress = (currentTick / totalTicks) * 100;
        if (currentTick >= totalTicks) {
          clearInterval(this.autoCloseTimeout);
          this.handleResponse(true); // Automatically respond with "Later"
        }
      };

      this.autoCloseTimeout = setInterval(updateProgress, interval);

      return new Promise((resolve) => {
        this.resolvePrompt = resolve;
      });
    },

    handleResponse(value) {
      this.isOpen = false;

      // Clear the timeout and reset progress
      if (this.autoCloseTimeout) {
        clearInterval(this.autoCloseTimeout);
        this.autoCloseTimeout = null;
      }
      this.progress = 0;

      if (this.resolvePrompt) {
        this.resolvePrompt(value);
        this.resolvePrompt = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.progress-bar-container {
  width: 100%;
  height: 5px;
  background-color: #f0f0f0; /* Light background for the container */
  overflow: hidden;
  border-radius: 2px;
  margin-bottom: 16px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(270deg, #67a8f4, #42d392 78%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#67a8f4", endColorstr="#42d392", GradientType=1);
  transition: width 100ms linear; /* Smooth progress effect */
  width: 0; /* Starts empty */
}

.dialog-title {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;

  p {
    font-weight: 400;
    font-family: Rammetto One, sans-serif;
    background: #67a8f4;
    background: -moz-linear-gradient(
      270deg,
      rgb(103, 168, 244) 0%,
      rgb(66, 211, 146) 78%
    );
    background: -webkit-linear-gradient(
      270deg,
      rgb(103, 168, 244) 0%,
      rgb(66, 211, 146) 78%
    );
    background: linear-gradient(270deg, #67a8f4, #42d392 78%);
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#67a8f4",endColorstr="#42d392",GradientType=1);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}
</style>
