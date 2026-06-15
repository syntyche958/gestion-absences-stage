<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/Tag'
import api from '../services/api'

const actions = ref([])

const loadActions = async () => {
    const response = await api.get('/actions', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })

    actions.value = response.data
}

const getSeverity = (statut) => {
    if (statut === 'A_TRAITER') return 'warning'
    if (statut === 'ENVOYEE') return 'info'
    if (statut === 'RECUE') return 'success'
    if (statut === 'TERMINEE') return 'secondary'
    return 'secondary'
}

onMounted(loadActions)
</script>

<template>
    <h1>Actions administratives</h1>

    <DataTable :value="actions" paginator :rows="10" stripedRows>
        <Column
            field="id_action"
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
            field="niveau_alerte"
            header="Niveau" 
        />
        <Column
            field="type_action"
            header="Type d'action" 
        />
        <Column
            field="moyenEnvoi"
            header="Moyen d'envoi" 
        />
        <Column header="Statut">
            <template #body="slotProps">
                <Tag
                    :value="slotProps.data.statut_action"
                    :severity="getSeverity(slotProps.data.statut_action)"
                />
            </template>
        </Column>
    </DataTable>
</template>