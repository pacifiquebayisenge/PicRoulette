import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
    state: () => ({
        user: {
            id: null,
            name: null,
            emoji: null,
            score: 0,
            state: null,
        },
    }),

    getters: {
        // returns true if user is set
        isAuthenticated: (state) => state.user.id !== null,
        getName: (state) => state.user.name.split("_")[0],
    },

    actions: {
        setUser(userData) {
            this.user = { ...userData };
        },

        scoreIncrease() {
            this.user.score = this.user.score + 10;
        },

        clearUser() {
            this.user = {
                id: null,
                name: null,
                emoji: null,
                score: 0,
                state: null,
            };
        },
    },
});
