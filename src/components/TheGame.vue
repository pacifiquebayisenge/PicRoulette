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
  gap: 3rem;

  // Card styling to limit width
  .game-card {
    max-width: 1000px;
    margin: 0 auto;

    @media (max-width: 1300px) {
      margin: 0 2rem;
    }

    @media (max-width: 768px) {
      margin: 0 1rem;
    }

    .game-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
      padding: 1rem;

      .page-title {
        font-size: clamp(20px, 4vw, 24px);
        text-align: center;
        margin-bottom: 0.5rem;
      }

      .image-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin: 0.5rem 0;
        padding: 0.5rem;
      }

      .image-wrapper {
        width: 100%;
        max-width: 700px; // Maximum width of the image container
        aspect-ratio: 16 / 9; // Maintain a consistent aspect ratio
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f5f5f5; // Light background to show image bounds
        border-radius: 8px;
        overflow: hidden;
      }

      .responsive-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        display: block;
      }
    }
  }

  //   .voting-btns {
  //     display: flex;
  //     flex-wrap: wrap;
  //     justify-content: center;
  //     gap: 1rem;
  //     width: 100%;
  //     max-width: 700px; // Match image container max-width
  //     margin-top: 1.5rem;
  //     overflow-y: auto;
  //     max-height: 15vh;
  //     padding: 0.5rem;
  //     scrollbar-width: none;

  //     &::-webkit-scrollbar {
  //       display: none;
  //     }

  //     .send-response-btn {
  //       border: solid #b9baba 0.125rem;
  //       min-width: 120px;

  //       span span span {
  //         font-weight: bold;
  //       }
  //     }
  //   }

  .voting-btns {
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

      span span span {
        font-weight: bold;
      }
    }
  }
}

// Responsive breakpoints
@media (min-width: 1024px) {
  .game-container {
    .image-wrapper {
      min-height: 300px;
      max-height: 400px;
    }

    .voting-btns {
      max-height: 12vh;
    }
  }
}

@media (max-width: 768px) {
  .game-container {
    .image-wrapper {
      aspect-ratio: 4 / 3; // Slightly different aspect ratio for mobile
      min-height: 300px;
      max-height: 450px;
    }

    .voting-btns {
      width: 100%;
      max-height: 25vh;
      gap: 0.75rem;
    }
  }
}

// Small screens
@media (max-width: 480px) {
  .game-container {
    .image-wrapper {
      min-height: 250px;
      max-height: 350px;
    }
  }
}
</style>
