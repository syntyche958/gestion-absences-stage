import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        utilisateur: JSON.parse(localStorage.getItem('utilisateur')) || null
    }),

    actions: {
        setAuth(token, utilisateur) {
            this.token = token
            this.utilisateur = utilisateur

            localStorage.setItem('token', token)
            localStorage.setItem('utilisateur', JSON.stringify(utilisateur))
        },

        logout() {
            this.token = null
            this.utilisateur = null

            localStorage.removeItem('token')
            localStorage.removeItem('utilisateur')
        }
    }
})