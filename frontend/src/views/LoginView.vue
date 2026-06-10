<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import api from '../services/api'
import { useAuthStore } from '../stores/auth.store';

const email = ref('')
const motDePasse = ref('')
const erreur = ref('')
const loading = ref(false)

const router = useRouter()
const authStore = useAuthStore()

const login = async () => {
    erreur.value = ''
    loading.value = true

    try {
        const response = await api.post('/auth/login', {
            email_utilisateur: email.value,
            mot_de_passe: motDePasse.value
        })

        authStore.setAuth(response.data.token, response.data.utilisateur)

        router.push('/dashboard')
    } catch (error) {
        erreur.value = 'Email ou mot de passe incorrect'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="login-page">
        <div class="login-card">
            <h1>Gestion des absences</h1>
            <p>Connexion à l'espace administratif</p>

            <div class="form-group">
                <label>Email</label>
                <InputText v-model="email" placeholder="admin@iut.fr" />
            </div>

            <div class="form-group">
                <label>Mot de passe</label>
                <Password
                    v-model="motDePasse"
                    toggleMask
                    :feedback="false"
                    placeholder="Mot de Passe"
                />
            </div>

            <p v-if="erreur" class="error">{{ erreur }}</p>

            <Button
                label="Se connecter"
                icon="pi pi-sign-in"
                :loading="loading"
                @click="login"
            />
        </div>
    </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef6ff;
}

.login-card {
  width: 380px;
  padding: 32px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

h1 {
  margin-bottom: 8px;
  color: #1e3a8a;
}

p {
  color: #64748b;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin: 18px 0;
  gap: 8px;
}

.error {
  color: #dc2626;
  margin-bottom: 12px;
}
</style>