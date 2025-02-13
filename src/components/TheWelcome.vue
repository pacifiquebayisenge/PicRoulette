<template>
  <div class="home-component">
    <n-card>
      <div v-if="!showOptions" class="connect-container">
        <header>
          <h1>Pic Roulette</h1>
        </header>

        <!-- Ask for the user's name if not yet set -->
        <div v-if="!user" class="name-container">
          <n-input
            v-model:value="name"
            type="text"
            size="large"
            :maxlength="15"
            :placeholder="getPlaceholder || 'Enter your name'"
          />
          <n-button
            class="button-3D button-3D-colorfull"
            success
            :bordered="false"
            @click="connectToSocket"
            >Connect</n-button
          >
          <n-button
            class="button-3D button-3D-colorfull"
            success
            :bordered="false"
            @click="handleBack"
            >Options</n-button
          >
        </div>

        <!-- <CommentsContainer /> -->

        <ImagesContainer v-if="user" :user="user" :socket="socket" />
      </div>

      <OptionsContainer v-if="showOptions" @back-clicked="handleBack" />
    </n-card>

    <ActiveUsersContainer v-if="activeUsers.length" :active-users="activeUsers" />
  </div>
</template>

<script>
import { h, nextTick } from "vue"; // Import h function
import { useNotification } from "naive-ui";
import { namelist } from "@/data/names";
import UserAlert from "./alerts/UserAlert.vue";
import socketService from "@/services/socketService";
import userService from "@/services/userService";
import gameService from "@/services/gameService";
import { subToPushNotifs, unsubOfPushNotif } from "@/utils/subscribePushNotifications";
import OptionsContainer from "./home/OptionsContainer.vue";
import ImagesContainer from "./home/ImagesContainer.vue";
import ActiveUsersContainer from "./home/ActiveUsersContainer.vue";

export default {
  components: { OptionsContainer, ImagesContainer, ActiveUsersContainer },
  data() {
    return {
      socket: null,
      name: "",
      comment: "",
      comments: [],
      activeUsers: [],
      isLoading: false,
      user: null,
      namelist,
      reconnect: false,
      pushPermission: "default",
      showOptions: false,
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

  computed: {
    getPlaceholder() {
      const randomIndex = Math.floor(Math.random() * this.namelist.length);
      return this.namelist[randomIndex]; // return the random name
    },
    // Add this new computed property
    notificationPermission() {
      return window.Notification?.permission || "default";
    },
  },

  mounted() {
    if (userService.getUser().name) {
      this.reconnectToSocket();
    }

    // Don't request immediately, just check current status
    this.checkNotificationPermission();
  },

  methods: {
    // Connect to the socket server and pass the username
    connectToSocket() {
      if (this.name) {
        if (!this.reconnect) {
          this.isLoading = true;
          this.socket = socketService.connect(this.name);
        }
        this.reconnect = false;

        // Listen for user info from the server
        this.socket.on("userInfo", (data) => {
          this.isLoading = false;
          userService.setUser(data.name, data.id, data.emoji, data.imageCount);
          this.user = userService.getUser(); // Store user info received from the server
          this.userJoinedAlert(this.user);
          // this.$router.push('/game')
        });

        // Handle connection error
        this.socket.on("connect_error", (error) => {
          this.isLoading = false; // Stop loading
          console.error("Connection failed:", error);
        });

        // Listen for comments from the server
        this.socket.on("comment", async (data) => {
          this.comments.push(data);

          await nextTick();
          const chatContainer = this.$refs.chatContainer;
          chatContainer.scrollTop = chatContainer.scrollHeight + 10000;
        });

        // Listen for active users update from the server
        this.socket.on("activeUsers", (data) => {
          gameService.setUserList(data.users);
          this.activeUsers = gameService.getUserList();
        });

        // Listen for active users update from the server
        this.socket.on("newImage", () => {
          // TODO: notif when upload went succesfull
          // console.log(data)

          this.successUpload += 1;
          this.updateServerProgress();
        });

        // Listen for active users update from the server
        this.socket.on("userImgCount", (data) => {
          this.successUpload = data.split(" ").at(-1);
          if (this.successUpload < 5) this.minImagesRequired();
          this.convertedImages = [];
        });

        // Listen for disconnect event
        this.socket.on("allReady", () => {
          // console.log(data)
          this.$router.push("/game");
        });

        // Listen for disconnect event
        this.socket.on("gameAlreadyStarted", (data) => {
          this.fullRoomAlert(data);
          console.log("Room is full");
        });

        // Listen for disconnect event
        this.socket.on("disconnected", (data) => {
          this.userLeftAlert(data);
          console.log("Disconnected from server");
        });
      }

      this.checkNotificationPermission();
    },

    reconnectToSocket() {
      this.reconnect = true;
      if (!userService.getUser().name) return;
      this.user = userService.getUser();
      this.name = this.user.name;

      this.socket = socketService.getSocket();

      this.convertedImages = [];
      this.successUpload = 0;
      this.connectToSocket();
      this.socket.emit("game-end");
    },

    // Send a comment to the server
    sendComment() {
      if (this.comment) {
        this.socket.emit("comment", {
          id: this.user.id,
          name: this.user.name,
          emoji: this.user.emoji,
          message: this.comment,
        });
        this.comment = ""; // Clear the input after sending
      }
    },

    userJoinedAlert(user) {
      // Use the notification instance from setup
      this.notification.create({
        content: () =>
          h(UserAlert, {
            user,
            alertType: "success",
          }),
        duration: 3000,
        closable: false, // optional, duration in milliseconds
      });
    },

    userLeftAlert(user) {
      // Use the notification instance from setup
      this.notification.create({
        content: () =>
          h(UserAlert, {
            user,
            alertType: "error",
          }),
        duration: 3000,
        closable: false, // optional, duration in milliseconds
      });
    },

    minImagesRequired() {
      this.notification.create({
        content: () =>
          h(UserAlert, {
            message: "A minimun of 5 images is required",
            alertType: "error",
          }),
        duration: 3000,
        closable: false, // optional, duration in milliseconds
      });
    },

    ImagesAlreadyUsed() {
      this.notification.create({
        content: () =>
          h(UserAlert, {
            message: "This image has already been used for this session",
            alertType: "error",
          }),
        duration: 3000,
        closable: false, // optional, duration in milliseconds
      });
    },

    fullRoomAlert(data) {
      this.notification.create({
        content: () =>
          h(UserAlert, {
            message: data.message,
            alertType: "error",
          }),
        duration: 3000,
        closable: false, // optional, duration in milliseconds
      });
    },

    checkNotificationPermission() {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return;
      }

      this.pushPermission = Notification.permission;

      if (this.pushPermission === "denied") {
        console.log("Notifications were previously denied");
        this.checkAndDeleteSubscription();
        return;
      }

      if (this.pushPermission === "granted") {
        console.log("Notifications already permitted");
        return;
      }

      console.log("Notification permission not decided yet");

      this.requestNotificationPermission();
    },

    async requestNotificationPermission() {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications");
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          this.pushPermission = permission;
          const response = await subToPushNotifs();
          console.log(response);
        } else {
          console.log("not granted");
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
            const response = await unsubOfPushNotif(subscription);

            console.log(response);
          } else {
            console.log("No existing subscription found.");
          }
        } else {
          console.log("Service Worker or PushManager is not supported.");
        }
      } catch (error) {
        console.log("Error while checking and deleting subscription:", error);
      }
    },

    handleBack() {
      this.showOptions = !this.showOptions;
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
.home-component {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .connect-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .name-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 1rem;
      gap: 2rem;
      width: 80%;
    }

    button span {
      font-weight: bolder;
    }
  }

  .chat-container {
    width: 100%;
    padding: 1rem;
    max-height: 15rem;
    overflow-y: scroll;

    &::-webkit-scrollbar {
      display: none;
      /* Hide the scrollbar */
    }

    -ms-overflow-style: none;
    scrollbar-width: none;

    .chat-body {
      display: flex;
      gap: 1rem;

      div:first-child {
        span {
          font-weight: bold;
        }
      }

      div:nth-child(2) {
        flex-grow: 1;

        span {
          word-wrap: break-word;
          word-break: break-all;
          overflow-wrap: break-word;
          white-space: normal;
        }
      }
    }
  }
}
</style>
