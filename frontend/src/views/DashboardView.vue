<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const stats = ref({})

const loadDashboard = async () => {
    try {
        const response = await api.get('/dashboard', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })

        stats.value = response.data
    } catch (error) {
        console.error(error)
    }
}

onMounted(loadDashboard)
</script>


<template>
    <h1>Dashboard</h1>

    <div class="cards">

        <div class="card">
            <h3>Etudiants</h3>
            <p>{{ stats.etudiants }}</p>
        </div>

        <div class="card">
            <h3>Absences</h3>
            <p>{{ stats.absences }}</p>
        </div>

        <div class="card">
            <h3>Dossiers</h3>
            <p>{{ stats.dossiers }}</p>
        </div>

        <div class="card">
            <h3>Actions</h3>
            <p>{{ stats.actions }}</p>
        </div>

        <div class="card">
            <h3>Convocations</h3>
            <p>{{ stats.convocations }}</p>
        </div>

        <div class="card">
            <h3>Historique</h3>
            <p>{{ stats.historique }}</p>
        </div>
    </div>
</template>

<style scoped>
.cards {
  display: grid;

  grid-template-columns:
    repeat(auto-fit, minmax(220px,1fr));

  gap: 20px;

  margin-top: 20px;
}

.card {
  background: white;

  border-radius: 15px;

  padding: 20px;

  box-shadow: 0 2px 10px rgba(0,0,0,.1);
}
</style>