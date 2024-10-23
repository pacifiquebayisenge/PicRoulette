<template>
    <div class="score-container">
        <h1 class="page-title">Score</h1>

        <div class="score-results">
            <div class="user-tag" v-for="(user, index) in userList" :key="index">
                {{ `${(index + 1)}. ${user.emoji} ${user.name} ` }}
                <n-tag :bordered="false" :color="index === 0 ? { color: '#FFD700', textColor: '#8B7500', borderColor: '#DAA520' }
                    : index === 1 ? { color: '#C0C0C0', textColor: '#333', borderColor: '#A9A9A9' }
                        : index === 2 ? { color: '#CD7F32', textColor: '#5A3D1E', borderColor: '#8C6239' }
                            : undefined">
                    {{ user.score }}
                </n-tag>
            </div>
        </div>


        <n-button @click="restart">
            Restart Game
        </n-button>

    </div>
</template>

<script>
import socketService from '@/services/socketService';
import userService from '@/services/userService';

export default {
    data() {
        return {
            socket: null,
            user: null,
            userList: [],
            currentImageobject: null

        };
    },
    mounted() {
        this.user = userService.getUser();
        this.socket = socketService.getSocket();


        // Check if socket is connected
        if (this.socket) {
            console.log('Socket connected:', this.socket.id);
        } else {
            console.log('Socket is not connected.');
        }

        // Listen for disconnect event
        this.socket.on('gameResults', (data) => {
            // console.log(data)
            console.log(data)
            this.userList = data

        });
    },
    methods: {
        restart() {
            this.$router.push('/')
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
    min-height: 90vh;
    overflow: hidden;

    .page-title {
        font-size: 24px;
        text-align: center;
    }

    .score-results {
        max-height: 35rem;
        overflow: hidden;
        overflow-y: scroll;
        padding: 3rem;

        scrollbar-width: none;

        /* Hide scrollbar in Firefox */
        &::-webkit-scrollbar {
            display: none;
            /* Hide scrollbar in webkit-based browsers like Chrome, Safari */
        }

        div.user-tag {
            font-weight: bold;
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            justify-content: center;
            align-items: center;
            font-size: 1.8rem;

            div.n-tag {
                padding: 0.5rem 2rem;
                height: fit-content;

                span {
                    font-weight: bold;
                }
            }
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