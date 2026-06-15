<script setup>
import { ref, onMounted } from 'vue'

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag'

import api from '../services/api'

const convocations = ref([])

const loadConvocations = async () => {
    const response = await api.get('/convocations', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })

    convocations.value = response.data
}

const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR')
}

const getSeverity = (statut) => {
    if (statut === 'EN_ATTENTE') return 'warning'
    if (statut === 'ENVOYEE') return 'info'
    if (statut === 'SIGNEE') return 'success'
    return 'secondary'
}

onMounted(loadConvocations)
</script>

<template>
    <h1>Convocations</h1>

    <DataTable
        :value="convocations"
        paginator
        :rows="10"
        stripedRows
    >
        <Column
            field="id_convocation"
            header="ID"
        />

        <Column
            field="nom_etudiant"
            header="Nom"
        />

        <Column
            field="prenom_etudiant"
            header="Prénom"
        />

        <Column
            field="motif"
            header="Motif"
        />

        <Column header="Date">
            <template #body="slotProps">
                {{ formatDate(slotProps.data.date_heure) }}
            </template>
        </Column>
    </DataTable>
</template>