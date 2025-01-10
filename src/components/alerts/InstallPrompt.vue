<template>
  <n-modal
    v-model:show="showInstallPrompt"
    preset="dialog"
    :show-icon="false"
    title="Install App"
    closable
    @close="handleClose"
  >
    <template #header>
      <div class="flex items-center">
        <n-icon size="24" class="mr-2">
          <download-cloud />
        </n-icon>
        Install Our App
      </div>
    </template>

    <div class="py-2">
      Install our app for a better experience with offline access and faster loading
      times.
    </div>

    <template #action>
      <n-button type="primary" @click="handleInstall" :loading="installing">
        Install Now
      </n-button>
    </template>
  </n-modal>
</template>

<script>
import { ref, onMounted } from "vue";
import { NModal, NButton, NIcon } from "naive-ui";

export default {
  name: "InstallPrompt",
  components: {
    NModal,
    NButton,
    NIcon,
  },
  setup() {
    const deferredPrompt = ref(null);
    const showInstallPrompt = ref(false);
    const isInstalled = ref(false);
    const installing = ref(false);

    const checkInstallation = async () => {
      // Check if app is installed via display-mode
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone
      ) {
        isInstalled.value = true;
        showInstallPrompt.value = false;
        return;
      }

      // Additional check for installed PWAs
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          for (const registration of registrations) {
            if (registration.scope === window.location.origin + "/") {
              isInstalled.value = true;
              showInstallPrompt.value = false;
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error checking installation status:", error);
      }
    };

    const handleInstall = async () => {
      if (!deferredPrompt.value) {
        return;
      }

      installing.value = true;

      try {
        // Show the install prompt
        deferredPrompt.value.prompt();
        const { outcome } = await deferredPrompt.value.userChoice;

        console.log(
          outcome === "accepted"
            ? "User accepted the install prompt"
            : "User dismissed the install prompt"
        );

        if (outcome === "accepted") {
          showInstallPrompt.value = false;
          isInstalled.value = true;
        }
      } catch (error) {
        console.error("Error handling installation:", error);
      } finally {
        installing.value = false;
        // Clear the deferred prompt
        deferredPrompt.value = null;
      }
    };

    const handleClose = () => {
      showInstallPrompt.value = false;
    };

    onMounted(async () => {
      // Check initial installation status
      await checkInstallation();

      // Listen for beforeinstallprompt event
      window.addEventListener("beforeinstallprompt", (event) => {
        // Prevent the mini-infobar from appearing on mobile
        event.preventDefault();

        // Store the event for later use
        deferredPrompt.value = event;

        // Only show prompt if not already installed
        if (!isInstalled.value) {
          showInstallPrompt.value = true;
        }
      });

      // Listen for successful installation
      window.addEventListener("appinstalled", () => {
        showInstallPrompt.value = false;
        isInstalled.value = true;
        console.log("App was successfully installed");
      });
    });

    return {
      showInstallPrompt,
      installing,
      handleInstall,
      handleClose,
    };
  },
};
</script>
