<script>
import { RouterView } from 'vue-router';
</script>

<template>
    <div class="layout">
        <aside class="sidebar">
            <h2>Gestion Absences</h2>

            <router-link to="/dashboard">Dashboard</router-link>

            <router-link to="/dossiers">Dossiers</router-link>

            <router-link to="/actions">Actions</router-link>

            <router-link to="/convocations">Convocations</router-link>

            <router-link to="/historique">Historique</router-link>
        </aside>

        <main class="content">
            <RouterView/>
        </main>
    </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: #1e3a8a;
  color: white;
  padding: 20px;

  display: flex;
  flex-direction: column;
  gap: 15px;
}

.sidebar a {
  color: white;
  text-decoration: none;
}

.content {
  flex: 1;
  padding: 25px;
}
</style>