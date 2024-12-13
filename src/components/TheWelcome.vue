<template>
  <n-card>
    <div class="home-component">
      <header>
        <h1>Pic Roulette</h1>
      </header>

      <!-- Ask for the user's name if not yet set -->
      <div v-if="!user" class="container">
        <n-input
          v-model:value="name"
          type="text"
          size="large"
          :maxlength="15"
          :placeholder="getPlaceholder || 'Enter your name'"
        />
        <n-button @click="connectToSocket">Connect</n-button>
      </div>

      <!-- Show the comment input if connected -->
      <div v-if="user" class="container">
        <n-input
          v-model:value="comment"
          type="textarea"
          placeholder="Enter your comment"
          :maxlength="150"
          :autosize="{
            minRows: 2,
            maxRows: 3,
          }"
        />
        <n-button @click="sendComment">Send Comment</n-button>

        <!-- Display comments -->
        <div class="chat-container" ref="chatContainer">
          <div v-for="(comment, index) in comments" :key="index" class="chat-body">
            <div>
              <n-ellipsis style="max-width: 12rem">
                {{ comment.emoji }} {{ comment.name }}
              </n-ellipsis>
            </div>

            <div>
              <n-gradient-text :type="comment.id === user.id ? 'success' : 'info'">
                {{ comment.message }}
              </n-gradient-text>
            </div>
          </div>
        </div>
      </div>

      <div v-if="user" class="images-container">
        <h2>Upload images</h2>

        <n-upload
          :disabled="successUpload >= 15"
          :min="5"
          :multiple="true"
          :show-file-list="false"
          @change="handleImageUpload"
          accept="image/*"
        >
          <n-button>Upload File</n-button>
        </n-upload>
      </div>

      <div v-if="user" class="progress-container">
        <div v-if="processLabel && !serverUploadProgress">🍲 Cooking the images 🍳</div>
        <n-progress v-if="processLabel && !serverUploadProgress" type="line" :percentage="webUploadProgress" color="#67a8f3" :show-indicator="false" />
        <n-progress
          v-if="serverUploadProgress"
          type="line"
          color="#36ad6a"
          :percentage="serverUploadProgress"
          indicator-placement="inside"
          processing
        />
        <div>Images Uploaded {{ successUpload }}</div>
      </div>

      <!-- Display active users count and names -->
      <div v-if="activeUsers.length" class="active-users-container">
        <h2>Active Users ({{ activeUsers.length }}):</h2>

        <div>
          <div v-for="(user, index) in activeUsers" :key="index" class="user-component">
            <div>{{ user.emoji }}</div>

            <div>
              <n-ellipsis style="max-width: 12rem">
                {{ user.name }}
              </n-ellipsis>
            </div>

            <n-tag
              class="state-tag"
              :bordered="false"
              round
              :type="user.state === 'Ready' ? 'success' : 'warning'"
            >
              {{ user.state }}
            </n-tag>
          </div>
        </div>
      </div>
    </div>
  </n-card>
</template>

<script>
import { h, nextTick } from "vue"; // Import h function
// import { io } from 'socket.io-client';
import { useNotification } from "naive-ui";
import { namelist } from "@/data/names";
import UserAlert from "./alerts/UserAlert.vue";
import { toRaw } from "vue";
import { MAX_IMAGE_UPLOAD } from "@/constants";
import socketService from "@/services/socketService";
import userService from "@/services/userService";
import gameService from "@/services/gameSercive";

export default {
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
      totalFiles: 0, // total images user want to upload
      imagePreviews: [], // Stores the base64 image previews
      processLabel: false,
      webUploadProgress: 0,
      serverUploadProgress: 0,
      successUpload: 0, // total images successfully uploaded,
      reconnect: false,
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
  },
  mounted() {
    if (userService.getUser().name) {
      this.reconnectToSocket();
    }
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
          this.updateOverallProgress();
        });

        // Listen for active users update from the server
        this.socket.on("userImgCount", (data) => {
          this.successUpload = data.split(" ").at(-1);
          if (this.successUpload < 5) this.minImagesRequired();
          this.imagePreviews = [];
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
    },

    reconnectToSocket() {
      this.reconnect = true;
      if (!userService.getUser().name) return;
      this.user = userService.getUser();
      this.name = this.user.name;

      this.socket = socketService.getSocket();

      this.totalFiles = 0;
      this.imagePreviews = [];
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

    async handleImageUpload(data) {
      this.processLabel = true;

      const noDupliList = data.fileList.filter(
        (file, index, self) => index === self.findIndex((f) => f.name === file.name)
      );

      // Get the total number of files
      const files = noDupliList.slice(0, MAX_IMAGE_UPLOAD);
      this.totalFiles = files.length;

      // Array to hold promises for file reading
      const filePromises = [];

      for (const file of files) {
        if (!file.file.type.startsWith("image/")) {
          console.error("File is not an image:", file.name);
          continue; // Use continue instead of return to process other files
        }

        const reader = new FileReader();
        const filePromise = new Promise((resolve, reject) => {
          reader.onload = (e) => {
            // Create an image element
            const img = new Image();
            img.src = e.target.result;

            img.onload = async () => {
              try {
                // Compress and convert the image to webp blob
                const compressedImage = await this.compressAndConvertToWebP(img);

                if (
                  !this.imagePreviews.find(
                    (img) => img.imageName === file.name.replace(/\.\w+$/, ".webp")
                  )
                ) {
                  this.imagePreviews.push({
                    ...this.user,
                    imageName: file.name.replace(/\.\w+$/, ".webp"),
                    image: compressedImage, // Use the compressed image
                    type: compressedImage.type,
                  });
                }
                resolve(); // Resolve the promise once the file is processed
              } catch (error) {
                reject(error); // Reject the promise if an error occurs during compression
              }
            };

            img.onerror = (error) => {
              reject(new Error(`Failed to load image: ${error.message}`)); // Provide more detailed error info
            };
          };

          reader.onerror = (error) => {
            reject(new Error(`Failed to read file: ${error.message}`)); // Provide more detailed error info
          };

          reader.readAsDataURL(file.file);
        });

        filePromises.push(filePromise);
      }

      await Promise.all(filePromises);

      this.webUploadProgress = (filePromises.length / this.totalFiles) * 100

      // console.log((filePromises.length / this.totalFiles) * 100 + " %");

      // Console log statements
      if (filePromises.length === this.totalFiles) {
        this.sendToServer();
      }
    },

    compressAndConvertToWebP(img) {
      return new Promise((resolve, reject) => {
        // Create a canvas to compress the image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions
        const MAX_WIDTH = 800; // Adjust this value as needed
        const MAX_HEIGHT = 800; // Adjust this value as needed
        let width = img.width;
        let height = img.height;

        // Calculate the new dimensions while maintaining the aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        // Resize the canvas
        canvas.width = width;
        canvas.height = height;

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert the canvas to WebP format and resolve with Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob from canvas."));
              return;
            }

            // Resolve the promise with the Blob
            resolve(blob);
          },
          "image/webp",
          0.7
        ); // Convert to WebP
      });
    },

    async sendToServer() {
      // If the requirement is met, emit the images to the socket server
      await this.socket.emit("imageUploaded", toRaw(this.imagePreviews));
    },

    updateOverallProgress() {
      this.serverUploadProgress = Math.trunc((this.successUpload / this.totalFiles) * 100);



      // Cap the progress at 100% once all uploads are done
      if (this.serverUploadProgress >= 100) {
        this.serverUploadProgress = 100;
      }
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
.progress-container {
  margin: 1rem 0;
}

.progress-bar {
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 5px;
  height: 1rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}

.n-card {
  filter: drop-shadow(5px 6px 11px #515151);
}

h1 {
  background: rgb(103, 168, 244);
  background: -moz-linear-gradient(
    270deg,
    rgba(103, 168, 244, 1) 0%,
    rgba(66, 211, 146, 1) 78%
  );
  background: -webkit-linear-gradient(
    270deg,
    rgba(103, 168, 244, 1) 0%,
    rgba(66, 211, 146, 1) 78%
  );
  background: linear-gradient(
    270deg,
    rgba(103, 168, 244, 1) 0%,
    rgba(66, 211, 146, 1) 78%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#67a8f4", endColorstr="#42d392", GradientType=1);

  /* Text-specific properties */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  /* Hides the actual color and shows only the gradient */
}

.home-component {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .container {
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

  .images-container {
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

  .active-users-container {
    h2 {
      text-align: center;
    }

    & > div {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      overflow-y: scroll;
      max-height: 20rem;
      padding: 1rem;

      &::-webkit-scrollbar {
        display: none;
        /* Hide the scrollbar */
      }

      -ms-overflow-style: none;
      scrollbar-width: none;

      .user-component {
        padding: 0.5rem;
        margin: 0 0.5rem;
        display: flex;
        flex-direction: column;
        align-content: center;
        justify-content: center;
        width: fit-content;

        div {
          text-align: center;

          &:first-child {
            font-size: 2rem;
          }

          &:not(:first-child),
          &:not(:first-child) span {
            font-weight: bold;
          }

          &:last-child {
            margin-top: 0.5rem;
          }
        }

        .state-tag {
          display: flex;
          justify-content: center;
        }
      }
    }
  }
}

img {
  width: 50rem;
}
</style>
