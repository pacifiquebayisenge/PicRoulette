<template>
  <div class="option-component">
    <header>
      <h1>Options</h1>
    </header>
    <div class="content">
      <div class="setting-item">
        <p>Notifications</p>
        <n-space align="center">
          <n-switch @update:value="handlePushNotifs" v-model:value="pushPermission" />
        </n-space>
      </div>
    </div>
    <div class="info">
      <p>Pic Roulette v{{ appVersion }}</p>
      <p>Pacifique Stormz</p>
    </div>
    <div>
      <n-button class="button-3D" @click="goBack">Back</n-button>
    </div>
  </div>
</template>

<script>
import { h } from "vue"; // Import h function
import { useNotification } from "naive-ui";
import appVersion from "@/utils/version";
import {
  subscribeToPushNotifications,
  unsubscribeOfPushNotifications,
} from "@/utils/subscribePushNotifications";
import UserAlert from "@/components/alerts/UserAlert.vue";

export default {
  data() {
    return {
      pushPermission: false,
      appVersion,
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

  mounted() {
    this.checkNotificationPermission();
  },
  methods: {
    checkNotificationPermission() {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return;
      }

      this.pushPermission = Notification.permission;

      if (this.pushPermission === "denied") {
        console.log("Notifications were previously denied");
        this.pushPermission = false;
        return;
      }

      if (this.pushPermission === "granted") {
        console.log("Notifications already permitted");
        this.pushPermission = true;
        return;
      }
    },

    async checkPushSubscription() {},

    async requestNotificationPermission() {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          this.pushPermission = true;
          this.pushPermissionAlert(true);
          const response = await subscribeToPushNotifications();
          console.log(response);
        } else {
          console.log("not granted");
          this.pushPermission = false;
          this.pushPermissionAlert(false);
        }
      } catch (error) {
        console.log("Error:", error);
      }
    },

    // Check if the service worker has a push subscription
    async checkAndDeleteSubscription() {
      try {
        // Ensure the service worker is available
        if ("serviceWorker" in navigator && "PushManager" in window) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (!registration) {
            console.log("Service worker not registered.");
            return;
          }

          const subscription = await registration.pushManager.getSubscription();

          // Check if there is an existing subscription
          if (subscription) {
            console.log("Existing subscription found, deleting...");

            // Unsubscribe and delete the subscription
            await subscription.unsubscribe();
            const response = await unsubscribeOfPushNotifications(subscription);

            console.log(response);
            this.pushPermission = false;
            this.pushPermissionAlert(false);
          } else {
            console.log("No existing subscription found.");
          }
        } else {
          console.log("Service Worker or PushManager is not supported.");
        }
      } catch (error) {
        console.error("Error while checking and deleting subscription:", error);
      }
    },

    async handlePushNotifs(val) {
      val
        ? await this.requestNotificationPermission()
        : await this.checkAndDeleteSubscription();
    },

    pushPermissionAlert(val) {
      this.notification.create({
        content: () =>
          h(UserAlert, {
            title: "Notifications",
            message: val
              ? "😁 we will keep in touch 😁"
              : "😞 We won't bother you any longer... 😞",
            alertType: val ? "success" : "error",
          }),
        duration: 3000,
        closable: false, // optional, duration in milliseconds
      });
    },

    // emit event to parent
    goBack() {
      this.$emit("back-clicked");
    },
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
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 2rem 0;

    .setting-item {
      display: grid;
      grid-template-columns: auto auto;
      align-items: center;
      gap: 2rem;

      p {
        margin: 0;
        white-space: nowrap;
      }
    }
  }

  .info {
    margin: 1.5rem 0;

    p {
      text-align: center;
    }
  }
}
</style>
