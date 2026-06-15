<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
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

onMounted(loadHistorique)
</script>

<template>
  <div>
    <h1>Historique</h1>

    <DataTable :value="historiques" paginator :rows="10" stripedRows>
      <Column field="id_historique" header="ID" />
      <Column field="nom_utilisateur" header="Utilisateur" />
      <Column field="prenom_utilisateur" header="Prénom" />
      <Column field="action_effectuee" header="Action" />
      <Column field="description" header="Description" />

      <Column header="Date">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.date_action) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>