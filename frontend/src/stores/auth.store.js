import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {

    state: () => ({
        token: localStorage.getItem('token') || null,
        utilisateur: null
    }),

    actions: {

        setAuth(token, utilisateur) {
            this.token = token;
            this.utilisateur = utilisateur;

            localStorage.setItem('token', token);
        },

        logout () {
            this.token = null;
            this.utilisateur = null;

            localStorage.removeItem('token');
        }
    }
});