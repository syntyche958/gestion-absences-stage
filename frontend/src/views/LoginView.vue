<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import api from '../services/api'
import { useAuthStore } from '../stores/auth.store'

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
    <div class="auth-card">
      <div class="info-section">
        <img
          src="../layouts/Logo_de_l'Université_Marie-et-Louis-Pasteur.png"
          alt="Logo université"
          class="univ-logo"
        />

        <h2>Application de suivi des absences</h2>

        <p>
          Espace réservé au personnel administratif pour le suivi des absences,
          des seuils et des démarches administratives.
        </p>

        <ul>
          <li>Suivi des absences étudiantes</li>
          <li>Détection des seuils administratifs</li>
          <li>Gestion des convocations et historiques</li>
        </ul>
      </div>

      <div class="form-section">
        <h1>Connexion</h1>
        <p>Accès à l’espace administratif</p>

        <div class="form-group">
          <label>Email</label>
          <InputText
            v-model="email"
            placeholder="admin@iut.fr"
          />
        </div>

        <div class="form-group">
          <label>Mot de passe</label>
          <Password
            v-model="motDePasse"
            toggleMask
            :feedback="false"
            placeholder="Mot de passe"
          />
        </div>

        <p v-if="erreur" class="error">
          {{ erreur }}
        </p>

        <Button
          label="Se connecter"
          icon="pi pi-sign-in"
          :loading="loading"
          @click="login"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.auth-card {
  width: 950px;
  min-height: 560px;
  background: white;
  border-radius: 24px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
}

.info-section {
  padding: 45px 55px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.univ-logo {
  width: 280px;
  max-height: 120px;
  object-fit: contain;
  margin-bottom: 22px;
}

.info-section h2 {
  margin: 0 0 12px;
  color: #111827;
  font-size: 32px;
  line-height: 1.15;
}

.info-section p {
  margin: 0;
  color: #475569;
  line-height: 1.55;
  font-size: 17px;
}

.info-section ul {
  margin: 18px 0 0;
  padding-left: 22px;
  color: #334155;
  line-height: 1.8;
  font-size: 16px;
}

.form-section {
  padding: 55px 45px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-section h1 {
  margin: 0 0 10px;
  color: #e6332a;
  font-size: 38px;
  line-height: 1.1;
}

.form-section > p {
  margin: 0 0 26px;
  color: #64748b;
  font-size: 17px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 22px;
  gap: 8px;
}

.form-group label {
  font-weight: 700;
  color: #111827;
}

.form-group :deep(.p-inputtext),
.form-group :deep(.p-password),
.form-group :deep(.p-password-input) {
  width: 100%;
}

.error {
  color: #dc2626 !important;
  font-weight: 700;
  margin: 0 0 14px !important;
}

:deep(.p-button) {
  width: fit-content;
  margin-top: 8px;
  background: #ef3b2d;
  border-color: #ef3b2d;
}

:deep(.p-button:hover),
:deep(.p-button:enabled:hover) {
  background: #d93025;
  border-color: #d93025;
}

:deep(.p-button:focus) {
  box-shadow: 0 0 0 2px rgba(239, 59, 45, 0.25);
}

@media (max-width: 850px) {
  .auth-card {
    width: 100%;
    grid-template-columns: 1fr;
  }

  .info-section {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
}
</style>