<template>
  <div class="game-page">
    <n-card class="game-card">
      <div class="game-container">
        <h1 class="page-title">Pic Roulette</h1>

        <div class="image-container">
          <div class="image-wrapper">
            <img
              :src="gameStore.currentImage?.file?.url || '/empty_space.gif'"
              alt="Game Image"
              class="responsive-image"
            />
          </div>
        </div>
      </div>
    </n-card>

    <div class="voting-btns">
      <n-button
        class="button-3D button-3D-colorfull"
        v-for="(user, index) in gameStore.userList"
        :key="index"
        secondary
        :ref="user.id"
        :id="user.id"
        :type="
          idReveal
            ? user?.name === gameStore.currentImage?.name
              ? 'success'
              : 'error'
            : 'default'
        "
        @click="sendResponse(user.name)"
      >
        <n-ellipsis style="max-width: 10rem">
          {{ `${user.emoji} ${user.name.split("_")[0]}` }}
        </n-ellipsis>
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, watch } from "vue";
import { useUserStore } from "@/stores/user";
import { useGameStore } from "@/stores/game";
import { useSocketStore } from "@/stores/socket";

// state

const userStore = useUserStore();
const gameStore = useGameStore();
const socketStore = useSocketStore();

// TODO sent score to server for loss prevention

const idReveal = ref(false);
let timeoutId = null;

// template refs (for dynamic refs like :ref="el => setBtnRef(id, el)")
// const btnRefs = new Map();

// const setBtnRef = (id, el) => {
//   if (el) btnRefs.set(id, el);
//   else btnRefs.delete(id);
// };

// start (restart) timer

const startInactivityTimeout = () => {
  stopInactivityTimeout(); // stop prevoius timer

  idReveal.value = false;

  timeoutId = setTimeout(() => {
    // user responded too late
    sendResponse("");
  }, 5000); // 5 sec
};

// Stop timer
const stopInactivityTimeout = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
};

// // Reset timer (stop + restart)
// const resetInactivityTimeout = () => {
//   stopInactivityTimeout();
//   startInactivityTimeout();
// };

// methods
const sendResponse = (vote) => {
  stopInactivityTimeout();

  if (idReveal.value) return;

  idReveal.value = true;

  const img = gameStore.currentImage;

  // if (img.name) {

  //   const rightBtn = btnRefs.get(img.id); // this is a component instance or an element (depends on how you bind ref)
  //   const el = rightBtn?.$el ?? rightBtn; // supports both component refs and element refs
  //   if (el?.scrollIntoView) el.scrollIntoView(false);
  // }

  if (vote === img?.name) userStore.scoreIncrease();

  setTimeout(() => {
    socketStore.socket.emit("userVote", userStore.user.score);
  }, 3000); // 3 sec
};

watch(
  () => gameStore.currentImage,
  () => {
    startInactivityTimeout();
  },
  { deep: true }
);

//  Cleanup
onBeforeUnmount(() => {
  stopInactivityTimeout();
});
</script>

<style lang="scss">
.game-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;

  .game-card {
    max-width: 100rem;
    width: 100%;
    margin: 0 auto;
    padding: 1rem;

    .game-container {
      display: flex;
      flex-direction: column;
      align-items: center;

      .page-title {
        font-size: clamp(2rem, 4vw, 2.4rem);
        text-align: center;
        margin-bottom: 1rem;
      }

      .image-container {
        width: 100%;
        display: flex;
        justify-content: center;

        .image-wrapper {
          width: 100%;
          max-width: 70rem; // Limit maximum width for larger screens
          height: 60vh; // Max height is 60% of the viewport height
          display: flex;
          justify-content: center;
          align-items: center;
          // background-color: #f5f5f5;
          border-radius: 0.8rem;
          overflow: hidden;

          img {
            width: 70vw; // 70% of the viewport width
            height: auto; // Maintain aspect ratio
            max-height: 100%; // Ensure image doesn't exceed the max height
            object-fit: contain; // Preserve aspect ratio without distortion
          }
        }
      }
    }
  }

  .voting-btns {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    max-width: 70rem; // Converted from 700px
    padding: 1rem;
    overflow: hidden;
    overflow-y: scroll;

    scrollbar-width: none;

    // Hide scrollbar in Firefox
    &::-webkit-scrollbar {
      display: none; // Hide scrollbar in webkit-based browsers
    }
  }
}

// Adjustments for responsiveness
@media (max-width: 76.8rem) {
  // Converted from 768px
  .game-page {
    gap: 1.5rem;

    .voting-btns {
      gap: 0.75rem;
      padding: 0.5rem;
    }
  }
}
</style>
