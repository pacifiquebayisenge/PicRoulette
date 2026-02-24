
import { defineStore } from 'pinia'
import { socketService } from '@/services/socketService'
import { useUserStore } from '@/stores/user'
import { useGameStore } from '@/stores/game'
import router from "@/router"

export const useSocketStore = defineStore('socket', {

    state: () => ({
        socket: null,
        listenersBound: false,
        connected: false,
        messages: []

    }),

    actions: {
        connect(username) {
            if (!username) return

            this.socket = socketService.connect(username)

            if (!this.listenersBound) {
                this.bindListeners()
                this.listenersBound = true
            }

            return this.socket
        },


        sendMessage(message) {
            socketService.emit('message', message)
        },

        bindListeners() {
            const userStore = useUserStore()
            const gameStore = useGameStore()

            // Listen for invalid name error from the server
            this.socket.on("invalid", (data) => {
                console.log(data)
            });

            // Listen for game already started state from the server
            this.socket.on("gameAlreadyStarted", (data) => {
                console.log(data)
            });

            // Listen for room full state from the server
            this.socket.on("roomFull", (data) => {
                console.log(data)
            });

            // Listen for user info from the server
            this.socket.on("userInfo", (data) => {
                userStore.setUser({
                    id: data.id,
                    name: data.name,
                    emoji: data.emoji,
                    state: data.state,
                    score: data.score,
                })
            });

            // Listen for active users update from the server
            this.socket.on("activeUsers", (data) => {
                gameStore.setUserList(data.users)
            });

            // Listen for all user ready state from server
            this.socket.on("allReady", () => {
                router.push("/game");
            });

            // Listen for the next image to display to all users 
            this.socket.on("nextImage", (data) => {
                gameStore.currentImage = data
            });

            // // Listen for comments from the server
            // this.socket.on("comment", async (data) => {
            //     console.log('New comment: ', data)
            // });

            // Listen for game end event
            this.socket.on("gameEnd", () => {
                // sent user score to server

                this.socket.emit('score', userStore.user)
            });

            // Listen for game result event
            this.socket.on("gameResults", (data) => {

                console.log(data)
                gameStore.userList = data
                router.push('/score')
            });

            this.socket.on('disconnect', () => {
                this.connected = false
            })

            this.socket.on("disconnected", (data) => {
                console.log("Disconnected from server ", data);


                const index = gameStore.userList.findIndex((u) => u.id === data.id);

                if (index === -1) return null;

                gameStore.userList.splice(index, 1);
            });
        },

        disconnect() {
            this.socket.disconnect()
            this.connected = false
            this.messages = []
        }
    }
})
