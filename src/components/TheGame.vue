<template>
    <div class="game-container">
        <h1 class="page-title">Game</h1>

        <div class="image-container">
            <img :src="currentImageobject?.file?.url" alt="Responsive Image" class="responsive-image" />
        </div>

        <div class="voting-btns">
            <n-button v-for="(user, index) in userList" :key="index" secondary :ref="user.id" :id="user.id"
                :type="idReveal ? user?.id === currentImageobject?.id ? 'success' : 'error' : 'default'"
                @click="sendResponse(user.id)" class="send-response-btn">
                <n-ellipsis style="max-width: 10rem">
                    {{ `${user.emoji} ${user.name}` }}
                </n-ellipsis>
            </n-button>

        </div>

    </div>
</template>

<script>
import gameService from '@/services/gameSercive';
import socketService from '@/services/socketService';
import userService from '@/services/userService';


export default {
    data() {
        return {
            socket: null,
            user: null,
            userList: [],
            currentImageobject: null,
            idReveal: false,
            score: 0

        };
    },
    mounted() {
        this.user = userService.getUser();
        this.socket = socketService.getSocket();
        this.userList = gameService.getUserList()

        this.socket.on('game-image', (data) => {
            this.idReveal = false
            this.currentImageobject = data
        });

        this.socket.on('game-end', () => {
            this.socket.emit('score', { ...this.user, score: this.score })
            this.$router.push('/score')
        });

        // Check if socket is connected
        if (this.socket) {
            console.log('Socket connected:', this.socket.id);
        } else {
            console.log('Socket is not connected.');
        }
    },
    methods: {
        sendResponse(vote) {
            if (this.idReveal) return
            this.idReveal = true

            const rightBtn = this.$refs[this.currentImageobject.id];

            if (rightBtn && rightBtn.$el) {
                rightBtn.$el.scrollIntoView(false);
            }

            vote === this.currentImageobject.id ? this.score += 10 : null

            setTimeout(() => {

                const response = {
                    vote,
                    ...this.user,
                };
                this.socket.emit('image-response', response);
            }, 3000);

        },
    },
    beforeUnmount() {
        // Optional: Disconnect when the component is destroyed (if necessary)
        // socketService.disconnect();
    },
};
</script>

<style lang="scss">
.game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    min-height: 90vh;
    overflow: hidden;

    .page-title {
        font-size: 24px;
        text-align: center;
    }

    .image-container {
        width: 100%;
        display: flex;
        justify-content: center;
        margin: 2.5rem 0;

        img.responsive-image {
            width: inherit;
            height: 450px;
            object-fit: contain;
        }
    }



    .voting-btns {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1.5rem;
        overflow: scroll;
        overflow-y: scroll;
        width: 80%;
        scrollbar-width: none;
        max-height: 20rem;

        /* Hide scrollbar in Firefox */
        &::-webkit-scrollbar {
            display: none;
            /* Hide scrollbar in webkit-based browsers like Chrome, Safari */
        }

        .send-response-btn {

            border: solid #b9baba 0.125rem;

            span span span {


                font-weight: bold;
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