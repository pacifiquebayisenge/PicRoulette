<template>
  <n-notification-provider
    container-class="notification"
    :scrollable="false"
    :max="3"
    placement="bottom"
  >
    <RouterView />
  </n-notification-provider>
</template>

<style lang="scss"></style>

<script>
export default {
  mounted() {
    let deferredPrompt;

    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      console.log("APP.VUE App can be installed!");
      console.log(deferredPrompt);
    });
  },
};
</script>
