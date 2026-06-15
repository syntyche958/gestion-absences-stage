<script setup>
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

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
          <div class="logo">
            <i class="pi pi-graduation-cap"></i>
          </div>
          <div>
            <h2>IUT Nord Franche-Comté</h2>
            <p>Gestion administrative des suivis d'absences</p>
          </div>
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
            <span>Notifications</span>
            <span class="badge">5</span>
          </router-link>

          <router-link to="/administration">
            <i class="pi pi-cog"></i>
            <span>Administration</span>
          </router-link>
        </nav>
      </div>

      <div class="user-box">
        <Avatar label="MP" shape="circle" size="large" />
        <div>
          <strong>admin</strong>
          <p>Administrateur</p>
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
  height: 128px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 28px;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #2f7df6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
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
  padding: 28px 2px;
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
  position: relative;
}

.menu a i {
  font-size: 22px;
}

.menu a:hover {
  background: #f1f5f9;
}

.menu a.router-link-active {
  background: #eaf2ff;
  color: #0b63ff;
}

.badge {
  margin-left: auto;
  background: #ff2d3f;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.user-box {
  height: 118px;
  border-top: 1px solid #e5e7eb;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-box strong {
  font-size: 18px;
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