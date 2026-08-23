<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'

const stats = ref({})
const actions = ref([])
const convocations = ref([])

const loadDashboard = async () => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }

  const statsResponse = await api.get('/dashboard', { headers })
  const actionsResponse = await api.get('/actions', { headers })
  const convocationsResponse = await api.get('/convocations', { headers })

  stats.value = statsResponse.data
  actions.value = actionsResponse.data
  convocations.value = convocationsResponse.data
}

const actionsATraiter = computed(() => {
  return actions.value
    .filter(action => action.statut_action !== 'TERMINEE')
    .slice(0, 5)
})

const convocationsEnAttente = computed(() => {
  return convocations.value
    .filter(convocation =>
      convocation.statut_convoc !== 'ENVOYEE' &&
      convocation.statut_convoc !== 'SIGNEE' &&
      convocation.statut_convoc !== 'ANNULEE'
    )
    .slice(0, 5)
})

const formatDate = (date) => {
  if (!date) return 'À planifier'
  return new Date(date).toLocaleDateString('fr-FR')
}

onMounted(loadDashboard)
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Accueil</h1>
      <p>Vue d'ensemble du suivi administratif des absences</p>
    </div>

    <div class="date-box">
      <span>Aujourd'hui</span>
      <strong>
        {{
          new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        }}
      </strong>
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
        <p>Absences injustifiées</p>
        <h2>{{ stats.absences_injustifiees }}</h2>
      </div>
      <div class="icon orange">
        <i class="pi pi-calendar-times"></i>
      </div>
    </div>

    <div class="stat-card">
      <div>
        <p>Dossiers ouverts</p>
        <h2>{{ stats.dossiers_ouverts }}</h2>
      </div>
      <div class="icon green">
        <i class="pi pi-folder"></i>
      </div>
    </div>

    <div class="stat-card">
      <div>
        <p>Actions administratives</p>
        <h2>{{ stats.actions_a_traiter }}</h2>
      </div>
      <div class="icon red">
        <i class="pi pi-exclamation-triangle"></i>
      </div>
    </div>

    <div class="stat-card">
      <div>
        <p>Convocations</p>
        <h2>{{ stats.convocations_en_attente }}</h2>
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

  <div class="dashboard-grid">
    <div class="panel">
      <div class="panel-header">
        <h3>Actions à traiter</h3>
        <span>{{ actionsATraiter.length }}</span>
      </div>

      <div
        v-for="action in actionsATraiter"
        :key="action.id_action"
        class="list-item"
      >
        <div>
          <strong>
            {{ action.nom_etudiant }}
            {{ action.prenom_etudiant }}
          </strong>
          <p>{{ action.type_action }}</p>
        </div>

        <span class="status warning">
          {{ action.statut_action }}
        </span>
      </div>

      <p
        v-if="actionsATraiter.length === 0"
        class="empty"
      >
        Aucune action à traiter.
      </p>
    </div>

    <div class="panel">
      <div class="panel-header">
        <h3>Convocations en attente</h3>
        <span>{{ convocationsEnAttente.length }}</span>
      </div>

      <div
        v-for="convocation in convocationsEnAttente"
        :key="convocation.id_convocation"
        class="list-item"
      >
        <div>
          <strong>
            {{ convocation.nom_etudiant }}
            {{ convocation.prenom_etudiant }}
          </strong>
          <p>{{ formatDate(convocation.date_heure) }}</p>
        </div>

        <span class="status info">
          {{ convocation.statut_convoc }}
        </span>
      </div>

      <p
        v-if="convocationsEnAttente.length === 0"
        class="empty"
      >
        Aucune convocation en attente.
      </p>
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
  font-size: 18px;
}

.date-box {
  text-align: right;
}

.date-box span {
  color: #64748b;
  display: block;
}

.date-box strong {
  font-size: 20px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
}

.stat-card h2 {
  margin: 12px 0 0;
  font-size: 38px;
}

.icon {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.panel {
  background: white;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  padding: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.panel-header h3 {
  margin: 0;
}

.panel-header span {
  background: #eaf2ff;
  color: #0b63ff;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 600;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #e5e7eb;
}

.list-item:first-of-type {
  border-top: none;
}

.list-item strong {
  display: block;
}

.list-item p {
  margin: 6px 0 0;
  color: #64748b;
}

.status {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.status.warning {
  background: #fff7ed;
  color: #f97316;
}

.status.info {
  background: #eaf2ff;
  color: #0b63ff;
}

.empty {
  color: #64748b;
}
</style>