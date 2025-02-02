<template>
  <div class="option-component">
    <header>
      <h1>Options</h1>
    </header>
    <div class="content">
      <p>Notification</p>
      <n-space align="center" item-style="display: flex;">
        <n-switch v-model:value="pushPermission" />
      </n-space>
    </div>
    <div class="info"></div>
    <div>
      <n-button class="button-3D">Back</n-button>
    </div>
  </div>
</template>

<script>
import { useNotification } from "naive-ui";

export default {
  components: {},
  data() {
    return {
      pushPermission: false,
    };
  },
  setup() {
    // Initialize useNotification inside the setup function
    const notification = useNotification();

    // Return the notification instance to be used in the component's methods
    return {
      notification,
    };
  },
};
</script>

<style lang="scss">
.option-component {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    margin: 3rem 0;
  }
}
</style>
