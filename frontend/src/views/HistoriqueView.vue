<script setup>
import { ref, onMounted } from 'vue'
import Tag from 'primevue/tag'
import api from '../services/api'

const historiques = ref([])

const loadHistorique = async () => {
  const response = await api.get('/historique', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })

  historiques.value = response.data
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('fr-FR')
}

const getIcon = (action) => {
  if (action?.includes('CREATION')) return 'pi pi-plus'
  if (action?.includes('MODIFICATION')) return 'pi pi-pencil'
  if (action?.includes('SUPPRESSION')) return 'pi pi-trash'
  if (action?.includes('CONVOCATION')) return 'pi pi-envelope'
  return 'pi pi-bell'
}

const getSeverity = (action) => {
  if (action?.includes('CREATION')) return 'success'
  if (action?.includes('MODIFICATION')) return 'warning'
  if (action?.includes('SUPPRESSION')) return 'danger'
  if (action?.includes('CONVOCATION')) return 'info'
  return 'secondary'
}

onMounted(loadHistorique)
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Notifications</h1>
      <p>Historique des actions réalisées dans l'application</p>
    </div>
  </div>

  <div class="timeline-card">
    <div
      v-for="item in historiques"
      :key="item.id_historique"
      class="timeline-item"
    >
      <div class="timeline-icon">
        <i :class="getIcon(item.action_effectuee)"></i>
      </div>

      <div class="timeline-content">
        <div class="timeline-top">
          <div>
            <h3>{{ item.action_effectuee }}</h3>
            <p>{{ item.description }}</p>
          </div>

          <Tag
            :value="item.action_effectuee"
            :severity="getSeverity(item.action_effectuee)"
          />
        </div>

        <div class="timeline-meta">
          <span>
            <i class="pi pi-user"></i>
            {{ item.nom_utilisateur }}
            {{ item.prenom_utilisateur }}
          </span>

          <span>
            <i class="pi pi-clock"></i>
            {{ formatDate(item.date_action) }}
          </span>
        </div>
      </div>
    </div>

    <p
      v-if="historiques.length === 0"
      class="empty"
    >
      Aucune notification pour le moment.
    </p>
  </div>
</template>

<style scoped>
.page-header {
  background: white;
  margin: -32px -32px 28px;
  padding: 32px 40px;
  border-bottom: 1px solid #e5e7eb;
}

.page-header h1 {
  margin: 0;
  font-size: 30px;
}

.page-header p {
  margin: 8px 0 0;
  color: #64748b;
}

.timeline-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 24px;
}

.timeline-item {
  display: flex;
  gap: 18px;
  padding: 20px 0;
  border-bottom: 1px solid #e5e7eb;
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-icon {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: #eaf2ff;
  color: #0b63ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
}

.timeline-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.timeline-top h3 {
  margin: 0;
  font-size: 18px;
}

.timeline-top p {
  margin: 8px 0 0;
  color: #475569;
}

.timeline-meta {
  margin-top: 12px;
  display: flex;
  gap: 22px;
  color: #64748b;
  font-size: 14px;
}

.timeline-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

:deep(.p-tag) {
  border-radius: 999px;
}

.empty {
  color: #64748b;
}
</style>