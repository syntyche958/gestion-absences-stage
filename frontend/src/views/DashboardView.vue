<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const stats = ref({})

const loadDashboard = async () => {
  const response = await api.get('/dashboard', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  stats.value = response.data
}

onMounted(loadDashboard)
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Dashboard</h1>
      <p>Vue d'ensemble du suivi administratif des absences</p>
    </div>

    <div class="date-box">
      <span>Aujourd'hui</span>
      <strong>{{ new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) }}</strong>
    </div>
  </div>

  <div class="cards">
    <div class="stat-card">
      <div>
        <p>Total étudiants</p>
        <h2>{{ stats.etudiants }}</h2>
      </div>
      <div class="icon blue">
        <i class="pi pi-users"></i>
      </div>
    </div>

    <div class="stat-card">
      <div>
        <p>Absences totales</p>
        <h2>{{ stats.absences }}</h2>
      </div>
      <div class="icon orange">
        <i class="pi pi-calendar-times"></i>
      </div>
    </div>

    <div class="stat-card">
      <div>
        <p>Dossiers ouverts</p>
        <h2>{{ stats.dossiers }}</h2>
      </div>
      <div class="icon green">
        <i class="pi pi-file"></i>
      </div>
    </div>

    <div class="stat-card">
      <div>
        <p>Actions administratives</p>
        <h2>{{ stats.actions }}</h2>
      </div>
      <div class="icon red">
        <i class="pi pi-exclamation-triangle"></i>
      </div>
    </div>

    <div class="stat-card">
      <div>
        <p>Convocations</p>
        <h2>{{ stats.convocations }}</h2>
      </div>
      <div class="icon blue">
        <i class="pi pi-envelope"></i>
      </div>
    </div>

    <div class="stat-card">
      <div>
        <p>Historique</p>
        <h2>{{ stats.historique }}</h2>
      </div>
      <div class="icon green">
        <i class="pi pi-history"></i>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  background: white;
  margin: -32px -32px 32px;
  padding: 36px 50px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
}

.page-header p {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 20px;
}

.date-box {
  text-align: right;
}

.date-box span {
  color: #64748b;
  display: block;
}

.date-box strong {
  font-size: 22px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 28px;
  max-width: 900px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card p {
  margin: 0;
  color: #64748b;
  font-size: 20px;
}

.stat-card h2 {
  margin: 14px 0 0;
  font-size: 42px;
}

.icon {
  width: 74px;
  height: 74px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.blue {
  background: #eaf2ff;
  color: #0b63ff;
}

.orange {
  background: #fff1e6;
  color: #ff5b00;
}

.green {
  background: #e9fbea;
  color: #00a843;
}

.red {
  background: #ffecec;
  color: #ef233c;
}
</style>