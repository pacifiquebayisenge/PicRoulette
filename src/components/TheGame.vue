<template>
  <div class="game-page">
    <n-card class="game-card">
      <div class="game-container">
        <h1 class="page-title">Game</h1>

        <div class="image-container">
          <div class="image-wrapper">
            <img
              v-if="currentImageobject?.file?.url"
              :src="currentImageobject?.file?.url"
              alt="Game Image"
              class="responsive-image"
            />
          </div>
        </div>
      </div>
    </n-card>

    <div class="voting-btns">
      <n-button
        v-for="(user, index) in userList"
        :key="index"
        secondary
        :ref="user.id"
        :id="user.id"
        :type="
          idReveal
            ? user?.id === currentImageobject?.id
              ? 'success'
              : 'error'
            : 'default'
        "
        @click="sendResponse(user.id)"
        class="send-response-btn"
      >
        <n-ellipsis style="max-width: 10rem">
          {{ `${user.emoji} ${user.name}` }}
        </n-ellipsis>
      </n-button>
    </div>
  </div>
</template>

<script>
import gameService from "@/services/gameSercive";
import socketService from "@/services/socketService";
import userService from "@/services/userService";

export default {
  data() {
    return {
      socket: null,
      user: null,
      userList: [],
      currentImageobject: null,
      idReveal: false,
      score: 0,
    };
  },
  mounted() {
    this.user = userService.getUser();
    this.socket = socketService.getSocket();
    this.userList = gameService.getUserList();

    this.socket.on("game-image", (data) => {
      this.idReveal = false;
      console.log(data);
      this.currentImageobject = data;
    });

    this.socket.on("game-end", () => {
      this.socket.emit("score", { ...this.user, score: this.score });
      this.$router.push("/score");
    });

    // Check if socket is connected
    if (this.socket) {
      console.log("Socket connected:", this.socket.id);
    } else {
      console.log("Socket is not connected.");
    }
  },
  methods: {
    sendResponse(vote) {
      if (this.idReveal) return;
      this.idReveal = true;

      const rightBtn = this.$refs[this.currentImageobject.id];

      if (rightBtn && rightBtn.$el) {
        rightBtn.$el.scrollIntoView(false);
      }

      vote === this.currentImageobject.id ? (this.score += 10) : null;

      setTimeout(() => {
        const response = {
          vote,
          ...this.user,
        };
        this.socket.emit("image-response", response);
      }, 1000);
    },
  },
  beforeUnmount() {
    // Optional: Disconnect when the component is destroyed (if necessary)
    // socketService.disconnect();
  },
};
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
        font-size: clamp(2rem, 4vw, 2.4rem); // Already in rem
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
          background-color: #f5f5f5;
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

    .send-response-btn {
      position: relative;
      padding: 0.75rem 1.5rem;
      background: #ffffff;
      border: 0.2rem solid #b9baba; // Converted from 2px
      border-radius: 0.8rem; // Converted from 8px
      transform: translateY(-0.4rem); // Converted from -4px
      transition: all 0.1s ease;

      // 3D effect
      box-shadow: 0 0.4rem 0 #b9baba, 0 0.4rem 0.6rem rgba(0, 0, 0, 0.1); // Converted from 4px and 6px

      &:hover {
        transform: translateY(-0.5rem); // Converted from -5px
        box-shadow: 0 0.5rem 0 #b9baba, 0 0.5rem 0.6rem rgba(0, 0, 0, 0.1); // Converted from 5px and 6px
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 0 0 #b9baba, 0 0 0 rgba(0, 0, 0, 0.1);
      }

      // Success state with lighter green
      &.n-button--success-type {
        background: #cceada;
        border-color: #aad3bb;
        color: #2c7a4d; // Darker text for contrast
        box-shadow: 0 0.4rem 0 #aad3bb, 0 0.4rem 0.6rem rgba(0, 0, 0, 0.1); // Converted from 4px and 6px

        &:hover {
          box-shadow: 0 0.5rem 0 #aad3bb, 0 0.5rem 0.6rem rgba(0, 0, 0, 0.1); // Converted from 5px and 6px
        }

        &:active {
          box-shadow: 0 0 0 #aad3bb, 0 0 0 rgba(0, 0, 0, 0.1);
        }
      }

      // Error state
      &.n-button--error-type {
        background: #ffd6d6;
        border-color: #ffb3b3;
        color: #d03050;
        box-shadow: 0 0.4rem 0 #ffb3b3, 0 0.4rem 0.6rem rgba(0, 0, 0, 0.1); // Converted from 4px and 6px

        &:hover {
          box-shadow: 0 0.5rem 0 #ffb3b3, 0 0.5rem 0.6rem rgba(0, 0, 0, 0.1); // Converted from 5px and 6px
        }

        &:active {
          box-shadow: 0 0 0 #ffb3b3, 0 0 0 rgba(0, 0, 0, 0.1);
        }
      }

      .n-ellipsis span {
        font-weight: bold;
      }
    }
  }
}

// Adjustments for responsiveness
@media (max-width: 76.8rem) {
  // Converted from 768px
  .game-page {
    gap: 1rem;

    .voting-btns {
      gap: 0.75rem;
      padding: 0.5rem;
    }
  }
}
</style>
