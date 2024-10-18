<template>
    <div class="game-component">
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
            currentImage: null
        };
    },
    mounted() {
        this.user = userService.getUser();
        this.socket = socketService.getSocket();

        this.socket.on('game-image', (data) => {
            console.log(data);
            this.currentImage = data.file.url
        });

        // Check if socket is connected
        if (this.socket) {
            console.log('Socket connected:', this.socket.id);
        } else {
            console.log('Socket is not connected.');
        }
    },
    methods: {
        sendResponse() {
            const response = {
                vote: 'test',
                ...this.user,
            };
            this.socket.emit('image-response', response);
        },
    },
    beforeUnmount() {
        // Optional: Disconnect when the component is destroyed (if necessary)
        socketService.disconnect();
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
</style>