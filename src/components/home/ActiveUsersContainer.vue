<template>
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
</template>

<script>
export default {
  props: {
    activeUsers: {
      typeof: {},
      default: null,
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss">
.active-users-container {
  margin-top: 2rem;

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

    -webkit-filter: drop-shadow(5px 7px 7px #515151);
    filter: drop-shadow(5px 7px 7px #515151);
    transform: translateZ(0);

    &::-webkit-scrollbar {
      display: none;
      /* Hide the scrollbar */
    }

    -ms-overflow-style: none;
    scrollbar-width: none;

    .user-component {
      padding: 1rem;
      margin: 0.5rem;
      display: flex;
      flex-direction: column;
      align-content: center;
      justify-content: center;
      width: fit-content;

      background-color: whitesmoke;
      border-radius: 10px;

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
</style>
