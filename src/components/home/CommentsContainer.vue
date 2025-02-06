<template>
  <!-- Show the comment input if connected -->

  <div class="container">
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
    <n-button class="button-3D">Send Comment</n-button>

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
</template>

<script>
export default {
  name: "CommentsContainer",
  data() {
    return {
      name: "",
      comment: "",
      comments: [],
      activeUsers: [],

      user: null,
    };
  },

  methods: {
    // Send a comment to the server
    // sendComment() {
    //   if (this.comment) {
    //     this.socket.emit("comment", {
    //       id: this.user.id,
    //       name: this.user.name,
    //       emoji: this.user.emoji,
    //       message: this.comment,
    //     });
    //     this.comment = ""; // Clear the input after sending
    //   }
    // },
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
</style>
