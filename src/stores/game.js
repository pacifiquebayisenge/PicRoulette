import { defineStore } from "pinia"

export const useGameStore = defineStore("game", {

    state: () => ({
        userList: [],
        gameResult: null,
        currentImage: null
    }),

    getters: {
        usersCount: (state) => state.userList.length
    },

    actions: {
        setUserList(userList) {
            this.userList = userList
        },
        setCurrentImage(data) {
            this.currentImage = data
        },
        addUser(user) {
            this.userList.push(user)
        },

        removeUser(userId) {
            this.userList = this.userList.filter(u => u.id !== userId)
        },

        clearUsers() {
            this.userList = []
        }
    }
})
