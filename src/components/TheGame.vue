<template>
  <div class="game-page">
    <n-card class="game-card">
      <div class="game-container">
        <h1 class="page-title">Game</h1>

        <div class="image-container">
          <div class="image-wrapper">
            <img
              :src="currentImageobject?.file?.url || '../../public/IRD_Banner.png'"
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
    max-width: 1000px;
    width: 100%;
    margin: 0 auto;
    padding: 1rem;

    .game-container {
      display: flex;
      flex-direction: column;
      align-items: center;

      .page-title {
        font-size: clamp(20px, 4vw, 24px);
        text-align: center;
        margin-bottom: 1rem;
      }

      .image-container {
        width: 100%;
        display: flex;
        justify-content: center;

        .image-wrapper {
          width: 100%;
          max-width: 700px;
          aspect-ratio: 16 / 9;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
        }

        .responsive-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
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
    max-width: 700px; // Match card width
    padding: 1rem;
    overflow: hidden;
    overflow-y: scroll;

    scrollbar-width: none;

    /* Hide scrollbar in Firefox */
    &::-webkit-scrollbar {
      display: none;
      /* Hide scrollbar in webkit-based browsers like Chrome, Safari */
    }

    .send-response-btn {
      position: relative;
      padding: 0.75rem 1.5rem;
      background: #ffffff;
      border: 2px solid #b9baba;
      border-radius: 8px;
      transform: translateY(-4px);
      transition: all 0.1s ease;

      // 3D effect
      box-shadow: 0 4px 0 #b9baba, 0 4px 6px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 0 #b9baba, 0 5px 6px rgba(0, 0, 0, 0.1);
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
        box-shadow: 0 4px 0 #aad3bb, 0 4px 6px rgba(0, 0, 0, 0.1);

        &:hover {
          box-shadow: 0 5px 0 #aad3bb, 0 5px 6px rgba(0, 0, 0, 0.1);
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
        box-shadow: 0 4px 0 #ffb3b3, 0 4px 6px rgba(0, 0, 0, 0.1);

        &:hover {
          box-shadow: 0 5px 0 #ffb3b3, 0 5px 6px rgba(0, 0, 0, 0.1);
        }

        &:active {
          box-shadow: 0 0 0 #ffb3b3, 0 0 0 rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}

// Adjustments for responsiveness
@media (max-width: 768px) {
  .game-page {
    gap: 1rem;

    .voting-btns {
      gap: 0.75rem;
      padding: 0.5rem;
    }
  }
}
</style>
