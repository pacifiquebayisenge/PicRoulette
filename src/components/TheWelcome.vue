<template>
  <div class="home-component">
    <header>
      <h1>TEST</h1>
    </header>

    <!-- Ask for the user's name if not yet set -->
    <div v-if="!user" class="container">
      <n-input v-model:value="name" type="text" size="large" :maxlength="15"
        :placeholder="getPlaceholder || 'Enter your name'" />
      <n-button @click="connectToSocket">Connect</n-button>
    </div>

    <!-- Show the comment input if connected -->
    <div v-if="user" class="container">
      <n-input v-model:value="comment" type="textarea" placeholder="Enter your comment" :maxlength="150" :autosize="{
        minRows: 2,
        maxRows: 3
      }" />
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

      <n-upload :disabled="successUpload >= 15" :min="5" :multiple="true" :show-file-list="false"
        @change="handleImageUpload" accept="image/*">
        <n-button>Upload File</n-button>
      </n-upload>

    </div>



    <div v-if="user" class="progress-container">
      <n-progress v-if="uploadProgress" type="line" color="#36ad6a" :percentage="uploadProgress"
        indicator-placement="inside" processing />
      Images Uploaded {{ successUpload }}
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

          <n-tag class="state-tag" :bordered="false" round :type="user.state === 'Ready' ? 'success' : 'warning'">
            {{ user.state }}
          </n-tag>
        </div>
      </div>


    </div>
  </div>
</template>

<script>
import { h, nextTick } from 'vue'; // Import h function
// import { io } from 'socket.io-client';
import { useNotification } from 'naive-ui';
import { namelist } from '@/data/names';
import UserAlert from './alerts/UserAlert.vue';
import { toRaw } from 'vue';
import { MAX_IMAGE_UPLOAD } from '@/constants';
import socketService from '@/services/socketService';
import userService from '@/services/userService';
import gameService from '@/services/gameSercive';

export default {
  data() {
    return {
      socket: null,
      name: '',
      comment: '',
      comments: [],
      activeUsers: [],
      isLoading: false,
      user: null,
      namelist,
      totalFiles: 0, // total images user want to upload 
      imagePreviews: [], // Stores the base64 image previews
      uploadProgress: 0,
      successUpload: 0, // total images successfully uploaded
    };
  },
  setup() {
    // Initialize useNotification inside the setup function
    const notification = useNotification();

    // Return the notification instance to be used in the component's methods
    return {
      notification
    };
  },

  computed: {
    getPlaceholder() {
      const randomIndex = Math.floor(Math.random() * this.namelist.length);
      return this.namelist[randomIndex]; // return the random name

    }
  },

  methods: {
    // Connect to the socket server and pass the username
    connectToSocket() {
      if (this.name) {
        this.isLoading = true
        this.socket = socketService.connect(this.name)

        // Listen for user info from the server
        this.socket.on('userInfo', (data) => {
          this.isLoading = false;
          userService.setUser(data.name, data.id, data.emoji, data.imageCount)
          this.user = userService.getUser(); // Store user info received from the server
          this.userJoinedAlert(this.user)
          // this.$router.push('/game')
        });

        // Handle connection error
        this.socket.on('connect_error', (error) => {
          this.isLoading = false; // Stop loading
          console.error('Connection failed:', error);
        });

        // Listen for comments from the server
        this.socket.on('comment', async (data) => {
          this.comments.push(data);

          await nextTick()
          const chatContainer = this.$refs.chatContainer;
          chatContainer.scrollTop = chatContainer.scrollHeight + 10000;
        });

        // Listen for active users update from the server
        this.socket.on('activeUsers', (data) => {
          gameService.setUserList(data.users)
          this.activeUsers = gameService.getUserList()
        });

        // Listen for active users update from the server
        this.socket.on('newImage', (data) => {
          // TODO: notif when upload went succesfull
          console.log(data)
        });

        // Listen for active users update from the server
        this.socket.on('userImgCount', (data) => {
          this.successUpload = data.split(' ').at(-1)
          if (this.successUpload < 5) this.minImagesRequired()
          this.imagePreviews = []
        });

        // Listen for disconnect event
        this.socket.on('allReady', (data) => {
          console.log(data)
          this.$router.push('/game')

        });

        // Listen for disconnect event
        this.socket.on('disconnected', (data) => {
          this.userLeftAlert(data)
          console.log('Disconnected from server');
        });
      }
    },

    // Send a comment to the server
    sendComment() {
      if (this.comment) {
        this.socket.emit('comment', {
          id: this.user.id,
          name: this.user.name,
          emoji: this.user.emoji,
          message: this.comment,
        });
        this.comment = ''; // Clear the input after sending
      }
    },

    userJoinedAlert(user) {
      // Use the notification instance from setup
      this.notification.create({
        content: () => h(UserAlert, {
          user,
          alertType: 'success'
        }),
        duration: 3000,
        closable: false // optional, duration in milliseconds
      });
    },

    userLeftAlert(user) {
      // Use the notification instance from setup
      this.notification.create({
        content: () => h(UserAlert, {
          user,
          alertType: 'error'
        }),
        duration: 3000,
        closable: false // optional, duration in milliseconds
      });
    },

    minImagesRequired() {
      this.notification.create({
        content: () => h(UserAlert, {
          message: 'A minimun of 5 images is required',
          alertType: 'error'
        }),
        duration: 3000,
        closable: false // optional, duration in milliseconds
      });
    },

    ImagesAlreadyUsed() {
      this.notification.create({
        content: () => h(UserAlert, {
          message: 'This image has already been used for this session',
          alertType: 'error'
        }),
        duration: 3000,
        closable: false // optional, duration in milliseconds
      });
    },

    async handleImageUpload(data) {
      // Total progress of all files
      this.uploadProgress = 0;

      const noDupliList = data.fileList.filter((file, index, self) =>
        index === self.findIndex((f) => (
          f.name === file.name
        ))
      );

      // Get the total number of files
      this.totalFiles = noDupliList.slice(0, MAX_IMAGE_UPLOAD).length

      const files = noDupliList.slice(0, MAX_IMAGE_UPLOAD)

      // Array to hold promises for file reading
      const filePromises = [];

      files.forEach(file => {
        if (!file.file.type.startsWith('image/')) {
          console.error("File is not an image:", file.name);
          return;
        }

        const reader = new FileReader();
        const filePromise = new Promise((resolve, reject) => {
          reader.onprogress = (e) => {
            if (e.lengthComputable) {
              const fileProgress = (e.loaded / e.total) * 100;
              this.updateOverallProgress(fileProgress, this.totalFiles); // Update overall progress
            }
          };

          reader.onload = (e) => {

            // Create an image element
            const img = new Image();
            img.src = e.target.result;

            img.onload = async () => {
              // Create a canvas to compress the image
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

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

              // Compress and convert the image to base64
              const compressedImage = canvas.toDataURL(file.file.type, 0.7); // 0.7 is the quality (0 to 1)

              if (!this.imagePreviews.find(img => img.imageName === file.name)) {
                this.imagePreviews.push({
                  ...this.user,
                  imageName: file.name,
                  image: compressedImage, // Use the compressed image
                  type: file.type
                });
              }
              resolve(); // Resolve the promise once the file is processed
            };

            img.onerror = (error) => {
              reject(error); // Reject the promise in case of error
            };
          };

          reader.onerror = (error) => {
            reject(error); // Reject the promise in case of error
          };

          reader.readAsDataURL(file.file);
        });

        filePromises.push(filePromise);
      });


      await Promise.all(filePromises)

      // console.log('filePromises', filePromises.length)
      // console.log('totalFiles', this.totalFiles)
      if (filePromises.length === this.totalFiles) {
        await this.sendToServer()
      }
    },

    async sendToServer() {

      // If the requirement is met, emit the images to the socket server
      await this.socket.emit('imageUploaded', toRaw(this.imagePreviews));


    },

    updateOverallProgress(fileProgress, totalFiles) {
      // Accumulate the overall progress based on the progress of each file
      this.uploadProgress += (fileProgress / totalFiles);

      // Cap the progress at 100% once all uploads are done
      if (this.uploadProgress >= 100) {
        this.uploadProgress = 100;
      }
      // console.log(`Overall Progress: ${this.uploadProgress}%`);
    }

  },

  beforeUnmount() {
    // Clean up the socket connection
    // if (this.socket) {
    //   this.socket.disconnect();
    // }
  }
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

  .chat-container {
    width: 100%;
    padding: 1rem;
    max-height: 30rem;
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

    .n-progress .n-progress-graph-line-indicator {
      text-align: center !important;
    }

  }



  .active-users-container {

    h2 {
      text-align: center;
    }

    &>div {
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