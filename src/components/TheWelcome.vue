<template>
  <div class="home-component">
    <n-card>
      <div class="connect-container">
        <header>
          <h1>Pic Roulette</h1>
        </header>

        <div class="name-container">
          <n-input
            v-model:value="name"
            v-if="!uploadStore.uploadedCount"
            type="text"
            size="large"
            :maxlength="15"
            :placeholder="getPlaceholder || 'Enter your name'"
          />

          <ImagesContainer :username="name" />

          <!-- <n-button
            class="button-3D button-3D-colorfull"
            :bordered="false"
            @click="connectToSocket"
            >Connect</n-button
          > -->

          <!-- <n-button
            class="button-3D button-3D-colorfull"
            :bordered="false"
            @click="handleBack"
            >Options</n-button
          > -->
        </div>

        <!-- <CommentsContainer /> -->
      </div>

      <!-- <OptionsContainer v-if="showSettings" @back-clicked="handleBack" /> -->
      <p class="app-version">v{{ appVersion }}</p>
    </n-card>

    <ActiveUsersContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, h } from "vue";
import { useNotification } from "naive-ui";
import { namelist } from "@/data/names";
import UserAlert from "./alerts/UserAlert.vue";
import ImagesContainer from "./ImagesContainer.vue";
import ActiveUsersContainer from "./ActiveUsersContainer.vue";
import { useUploadStore } from "@/stores/upload";
import { usePushNotifications } from "@/composables/usePushNotifications";
import appVersion from "@/utils/version";

const { checkPermission } = usePushNotifications();

// const socket = ref(null);
const name = ref("");
// const comment = ref("");
// const comments = ref([]);

const showSettings = ref(false);

// keep namelist available
const names = namelist;

// Naive UI notification instance
const notification = useNotification();

const uploadStore = useUploadStore();

// ---------- computed ----------
const getPlaceholder = computed(() => {
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
});

// ---------- lifecycle ----------
onMounted(() => {
  // Don't request immediately, just check current status
  checkPermission();
});

onBeforeUnmount(() => {
  // Clean up the socket connection (if you decide to)
  // if (socket.value) socket.value.disconnect()
});

// ---------- methods ----------

// function sendComment() {
//   if (!comment.value || !socket.value || !user.value) return;

//   socket.value.emit("comment", {
//     id: user.value.id,
//     name: user.value.name,
//     emoji: user.value.emoji,
//     message: comment.value,
//   });

//   comment.value = "";
// }

function userJoinedAlert(joinedUser) {
  notification.create({
    content: () =>
      h(UserAlert, {
        user: joinedUser,
        alertType: "success",
      }),
    duration: 3000,
    closable: false,
  });
}

function userLeftAlert(leftUser) {
  notification.create({
    content: () =>
      h(UserAlert, {
        user: leftUser,
        alertType: "error",
      }),
    duration: 3000,
    closable: false,
  });
}

function minImagesRequired() {
  notification.create({
    content: () =>
      h(UserAlert, {
        message: "A minimun of 5 images is required",
        alertType: "error",
      }),
    duration: 3000,
    closable: false,
  });
}

function ImagesAlreadyUsed() {
  notification.create({
    content: () =>
      h(UserAlert, {
        message: "This image has already been used for this session",
        alertType: "error",
      }),
    duration: 3000,
    closable: false,
  });
}

function fullRoomAlert(data) {
  notification.create({
    content: () =>
      h(UserAlert, {
        message: data.message,
        alertType: "error",
      }),
    duration: 3000,
    closable: false,
  });
}

function handleBack() {
  showSettings.value = !showSettings.value;
}
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

  .app-version {
    text-align: center;
    color: #dcdcdc;
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
