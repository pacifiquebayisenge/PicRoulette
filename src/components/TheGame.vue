<template>
    <!-- <div class="game-component">
        <header>
            <h1>GAME</h1>
        </header>
        <div class="container">
            <div class="image-container">
                <n-image :src="currentImage" alt="Game Image" />
            </div>
        </div>
        <div class="action">
            <n-button @click="sendResponse">SEND RESPONSE</n-button>
        </div>
    </div> -->


    <div class="page-container">
        <h1 class="page-title">Page Title</h1>

        <div class="image-container">
            <img :src="currentImageobject?.file?.url" alt="Responsive Image" class="responsive-image" />
        </div>

        <div class="voting-btns">
            <n-button v-for="(user, index) in userList" :key="index" @click="sendResponse(user.id)"
                class="send-response-btn">
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
            currentImageobject: null

        };
    },
    mounted() {
        this.user = userService.getUser();
        this.socket = socketService.getSocket();
        this.userList = gameService.getUserList()

        this.socket.on('game-image', (data) => {
            console.log(data);
            this.currentImageobject = data
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
            const response = {
                vote,
                ...this.user,
            };
            this.socket.emit('image-response', response);
        },
    },
    beforeUnmount() {
        // Optional: Disconnect when the component is destroyed (if necessary)
        // socketService.disconnect();
    },
};
</script>

<style lang="scss">
.game-component {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 2.5rem 1rem;

    header {
        padding: 3rem 0;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 1rem;
        gap: 2rem;
        width: 80%;

        img {
            width: 100%;
            max-width: 40rem;
            height: auto;
        }
    }

    .action {
        margin-top: 5rem;
    }
}

.page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    min-height: 90vh;
    overflow: hidden;
}

.page-title {
    font-size: 24px;
    text-align: center;
}

.image-container {
    width: 100%;
    display: flex;
    justify-content: center;
}

img.responsive-image {
    width: unset;
    height: 450px;
    object-fit: contain;
    /* Adjust image size for smaller screens */


    /* Maximum width on desktop */

    /* Maintain aspect ratio by default */
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
}

.send-response-btn {
    margin-top: 0px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
}



@media (min-width: 1024px) {
    .responsive-image {

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
    .responsive-image {
        height: 400px;
        object-fit: contain;
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