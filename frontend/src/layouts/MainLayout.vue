<script setup>
import { computed } from 'vue'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.utilisateur)

const userName = computed(() => {
  if (!user.value) return 'Utilisateur connecté'

  return (
    user.value.nom_utilisateur ||
    user.value.nom ||
    user.value.email_utilisateur ||
    user.value.email ||
    'Utilisateur connecté'
  )
})

const userRole = computed(() => {
  if (!user.value) return 'Compte utilisateur'

  if (user.value.nom_role) return user.value.nom_role
  if (user.value.role === 1) return 'Administrateur'
  if (user.value.role === 2) return 'Secrétariat'
  if (user.value.role === 3) return 'Chef de département'

  return 'Compte utilisateur'
})

const userInitials = computed(() => {
  if (!userName.value) return 'U'

  return userName.value
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div>
        <div class="brand">
          <img
            src="../layouts/Logo_de_l'Université_Marie-et-Louis-Pasteur.png"
            alt="Logo IUT"
            class="brand-logo"
          />
        </div>

        <nav class="menu">
          <router-link to="/dashboard">
            <i class="pi pi-th-large"></i>
            <span>Dashboard</span>
          </router-link>

          <router-link to="/dossiers">
            <i class="pi pi-calendar"></i>
            <span>Gestion des absences</span>
          </router-link>

          <router-link to="/actions">
            <i class="pi pi-clipboard"></i>
            <span>Suivi administratif</span>
          </router-link>

          <router-link to="/convocations">
            <i class="pi pi-file"></i>
            <span>Convocations</span>
          </router-link>

          <router-link to="/historique">
            <i class="pi pi-bell"></i>
            <span>Historique</span>
          </router-link>
        </nav>
      </div>

      <div class="user-box">
        <Avatar
          :label="userInitials"
          shape="circle"
          size="large"
        />

        <div class="user-info">
          <strong>{{ userName }}</strong>
          <p>{{ userRole }}</p>
        </div>

        <Button
          icon="pi pi-sign-out"
          text
          severity="secondary"
          @click="logout"
        />
      </div>
    </aside>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  background: #f8fafc;
  color: #020617;
}

.sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px;
}

.brand-logo {
  max-width: 200px;
  max-height: 90px;
  object-fit: contain;
}

.logo {
  width: 70px;
  height: 50px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand h2 {
  margin: 0;
  font-size: 20px;
}

.brand p {
  margin: 4px 0 0;
  color: #64748b;
}

.menu {
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu a {
  height: 60px;
  padding: 0 22px;
  border-radius: 12px;
  color: #334155;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 20px;
}

.menu a i {
  font-size: 22px;
}

.menu a:hover {
  background: #f1f5f9;
}

.menu a.router-link-active {
  background: #fee2e2;
  color: #e53935;
}

.user-box {
  height: 118px;
  border-top: 1px solid #e5e7eb;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-box strong {
  font-size: 16px;
  display: block;
}

.user-box p {
  margin: 4px 0 0;
  color: #64748b;
}

.content {
  flex: 1;
  min-width: 0;
  padding: 32px;
}
</style>