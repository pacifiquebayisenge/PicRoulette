<template>
  <n-card>
    <div class="score-container">
      <h1 class="page-title">Score</h1>

      <div class="score-results">
        <div class="user-tag" v-for="(user, index) in userList" :key="index">
          {{ `${index + 1}. ${user.emoji}` }}
          <n-ellipsis style="max-width: auto">
            {{ user.name }}
          </n-ellipsis>
          <n-tag
            :bordered="false"
            :color="
              index === 0
                ? { color: '#FFD700', textColor: '#8B7500', borderColor: '#DAA520' }
                : index === 1
                ? { color: '#C0C0C0', textColor: '#333', borderColor: '#A9A9A9' }
                : index === 2
                ? { color: '#CD7F32', textColor: '#5A3D1E', borderColor: '#8C6239' }
                : undefined
            "
          >
            {{ user.score }}
          </n-tag>
        </div>
      </div>

      <n-button class="button-3D" :bordered="false" @click="restart">
        Restart Game
      </n-button>
    </div>
  </n-card>
</template>

<script>
import socketService from "@/services/socketService";
import userService from "@/services/userService";

import confetti from "canvas-confetti";

export default {
  data() {
    return {
      socket: null,
      user: null,
      userList: [],
      currentImageobject: null,
    };
  },
  mounted() {
    this.user = userService.getUser();
    this.socket = socketService.getSocket();

    this.launchConfetti();

    // Check if socket is connected
    if (this.socket) {
      console.log("Socket connected:", this.socket.id);
    } else {
      console.log("Socket is not connected.");
    }

    // Listen for disconnect event
    this.socket.on("gameResults", (data) => {
      console.log(data);
      this.userList = data;
    });
  },
  methods: {
    launchConfetti() {
      confetti({
        particleCount: 200, // Number of particles
        spread: 90, // Spread of the confetti
        origin: { y: 0.6 }, // Launch point (y-axis: 0 = top, 1 = bottom)
      });
    },
    restart() {
      this.$router.push("/");
    },
  },
  beforeUnmount() {
    // Optional: Disconnect when the component is destroyed (if necessary)
    // socketService.disconnect();
  },
};
</script>

<style lang="scss">
.score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: 20px;
  max-height: 60vh;
  overflow: hidden;

  .page-title {
    font-size: 24px;
    text-align: center;
  }

  .score-results {
    max-height: 35rem;
    overflow: hidden;
    overflow-y: scroll;
    margin: 3rem;

    scrollbar-width: none;

    /* Hide scrollbar in Firefox */
    &::-webkit-scrollbar {
      display: none;
      /* Hide scrollbar in webkit-based browsers like Chrome, Safari */
    }

    div.user-tag {
      font-weight: bold;

      gap: 1rem;
      margin-bottom: 1rem;
      justify-content: center;
      align-items: center;
      font-size: 1.8rem;
      display: grid;
      grid-template-columns: auto 1fr auto;

      .n-ellipsis span,
      div.n-tag span {
        font-weight: bold;
      }

      div.n-tag {
        padding: 0.5rem 2rem;
        height: fit-content;
      }
    }
  }

  button {
    position: relative;
    padding: 0.75rem 1.5rem;
    background: #ffffff;
    border: 0.2rem solid #b9baba;
    border-radius: 0.8rem;
    transform: translateY(-0.4rem);
    transition: all 0.1s ease;
    box-shadow: 0 0.4rem 0 #b9baba, 0 0.4rem 0.6rem rgba(0, 0, 0, 0.1);

    &:hover {
      background: #ffffff; /* Force white background on hover */
      transform: translateY(-0.5rem);
      box-shadow: 0 0.5rem 0 #b9baba, 0 0.5rem 0.6rem rgba(0, 0, 0, 0.1);
    }

    &:active {
      background: #ffffff; /* Force white background on active */
      transform: translateY(0);
      box-shadow: 0 0 0 #b9baba, 0 0 0 rgba(0, 0, 0, 0.1);
    }

    .n-button__content {
      font-weight: bolder;
    }
  }
}

@media (min-width: 1024px) {
  img.responsive-image {
    height: 300px;
    /* Fixed height on desktop */
    object-fit: contain;
    /* Ensure the image fills the container */
  }

  .voting-btns {
    max-height: 15rem;
  }
}

@media (max-width: 768px) {
  img.responsive-image {
    height: 400px;
    object-fit: contain;
    width: inherit;
    /* Adjust image size for smaller screens */
  }

  .page-title {
    font-size: 20px;
  }

  .voting-btns {
    width: 110%;
    max-height: 20rem;
  }
}
</style>
