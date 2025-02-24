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
      <div class="setting-item">
        <p>Random player alert (test)</p>
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
import { h } from "vue";
import { useNotification } from "naive-ui";
import appVersion from "@/utils/version";
import {
  subToPushNotifs,
  checkSubToPushNotif,
  unsubOfPushNotif,
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
    this.checkDeviceNotifPermisson();
  },
  methods: {
    async checkDeviceNotifPermisson() {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return;
      }

      this.pushPermission = Notification.permission;

      if (this.pushPermission === "denied") {
        console.log("Notifications were previously denied");
        return;
      }

      if (this.pushPermission === "granted") {
        console.log("Device notifications already permitted");
        await this.checkPushSubscription();
        return;
      }
    },

    async checkPushSubscription() {
      const response = await checkSubToPushNotif();

      console.log(
        response
          ? "Subscribed to push notifcations"
          : "Not subscribed to push notifcations"
      );

      this.pushPermission = response;
    },

    async requestNotificationPermission() {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const response = await subToPushNotifs();

        if (response) {
          this.pushPermissionAlert(true);
          this.pushPermission = true;
          console.log(response);
        }
      } else {
        console.log("not granted");
        this.pushPermission = false;
        this.pushPermissionAlert(false);
      }
    },

    async checkAndDeleteSubscription() {
      const response = await unsubOfPushNotif();

      if (response) {
        console.log(response);
        this.pushPermission = false;
        this.pushPermissionAlert(false);
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
            title: val ? "😁 Notifications 😁" : "😞 Notifications 😞",
            message: val
              ? " we will keep in touch "
              : " We won't bother you any longer... ",
            alertType: val ? "success" : "error",
          }),
        duration: 3000,
        closable: false,
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
    flex-direction: column;
    margin: 2rem 0;
    gap: 1rem;

    .setting-item {
      display: grid;
      grid-template-columns: 2fr auto;
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
