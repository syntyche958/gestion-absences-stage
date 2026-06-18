<script setup>
import { ref, onMounted, computed } from 'vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog  from 'primevue/dialog'

import api from '../services/api'

const dossiers = ref([])
const search = ref('')
const semestre = ref(null)
const groupe = ref(null)

const showDialog = ref(false)
const selectedStudent = ref(null)
const absencesEtudiant = ref([])

const semestres = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']
const groupes = ['BUT1-A', 'BUT1-C', 'BUT2-A', 'BUT2-B', 'BUT3-A']


const loadDossiers = async () => {
  const response = await api.get('/absences/suivi', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })

  dossiers.value = response.data
}

const filteredDossiers = computed(() => {
  return dossiers.value.filter((dossier) => {
    const fullName = `${dossier.nom_etudiant} ${dossier.prenom_etudiant}`.toLowerCase()

    const matchSearch =
      !search.value ||
      fullName.includes(search.value.toLowerCase())

    const matchSemestre =
      !semestre.value ||
      dossier.semestre === semestre.value

    const matchGroupe =
      !groupe.value ||
      dossier.groupe_td === groupe.value

    return matchSearch && matchSemestre && matchGroupe
  })
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const getStatut = (total) => {
    if (total >= 5) return 'SANCTION'
    if (total >= 4) return 'AVERTISSEMENT'
    if (total >= 2) return 'RAPPEL'
    return 'NORMAL'
}

const getSeverity = (niveau) => {
  if (niveau === 'RAPPEL') return 'info'
  if (niveau === 'AVERTISSEMENT') return 'warning'
  if (niveau === 'SANCTION') return 'danger'
  return 'secondary'
}

const getInitiales = (dossier) => {
  return `${dossier.nom_etudiant?.[0] || ''}${dossier.prenom_etudiant?.[0] || ''}`
}

const voirEtudiant = async (etudiant) => {
    selectedStudent.value = etudiant
    showDialog.value = true

    const response = await api.get(`/absences/etudiant/${etudiant.id_etudiant}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })

    absencesEtudiant.value =response.data
}

onMounted(loadDossiers)
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Gestion des absences</h1>
      <p>Suivi détaillé des dossiers administratifs</p>
    </div>

    <Button
      label="Ajouter une absence"
      icon="pi pi-plus"
    />
  </div>

  <div class="filters">
    <InputText
      v-model="search"
      placeholder="Rechercher un étudiant..."
    />

    <i class="pi pi-filter filter-icon"></i>

    <Select
      v-model="semestre"
      :options="semestres"
      placeholder="Tous les semestres"
      showClear
    />

    <Select
      v-model="groupe"
      :options="groupes"
      placeholder="Tous les groupes"
      showClear
    />

    <Button
      label="Exporter"
      icon="pi pi-download"
      outlined
    />
  </div>

  <div class="table-card">
    <DataTable
      :value="filteredDossiers"
      paginator
      :rows="10"
      stripedRows
    >
      <Column header="Étudiant">
        <template #body="slotProps">
          <div class="student-cell">
            <div class="avatar">
              {{ getInitiales(slotProps.data) }}
            </div>

            <div>
              <strong>
                {{ slotProps.data.nom_etudiant }}
                {{ slotProps.data.prenom_etudiant }}
              </strong>
              <small>{{ slotProps.data.semestre }}</small>
            </div>
          </div>
        </template>
      </Column>

      <Column field="groupe_td" header="Groupe" />

      <Column field="semestre" header="Semestre" />
      
      <Column header="Statut">
        <template #body="slotProps">
            <Tag
                :value="getStatut(Number(slotProps.data.total_absences))"
                :severity="
                    getSeverity(
                        getStatut(Number(slotProps.data.total_absences))
                    )
                "
            />
        </template>
     </Column>

      <Column field="total_absences" header="Total absences" />

      <Column header="Actions">
            <template #body="slotProps">
                <Button
                    icon="pi pi-eye"
                    rounded
                    text
                    @click="voirEtudiant(slotProps.data)"
                />
            </template>
        </Column>
    </DataTable>
  </div>
   <Dialog
        v-model:visible="showDialog"
        modal
        header="Fiche étudiant"
        :sytle="{width: '900px'}"
    >
        <div v-if="selectedStudent" class="student-detail">
            <div class="detail-avatar">
                {{ getInitiales(selectedStudent) }}
            </div>
            <h2>
                {{ selectedStudent.nom_etudiant }}
                {{ selectedStudent.prenom_etudiant }}
            </h2>

            <Tag
                :value="getStatut(Number(selectedStudent.total_absences))"
                :severity="getSeverity(getStatut(Number(selectedStudent.total_absences)))"
            />

           <div class="detail-grid">
                <div>
                    <strong>Groupe</strong>
                    <p>{{ selectedStudent.groupe_td }}</p>
                </div>

                <div>
                    <strong>TP</strong>
                    <p>{{ selectedStudent.groupe_tp }}</p>
                </div>

                <div>
                    <strong>Semestre</strong>
                    <p>{{ selectedStudent.semestre }}</p>
                </div>

                <div>
                    <strong>Total absences</strong>
                    <p>{{ selectedStudent.total_absences }}</p>
                </div>
            </div>
        </div>

        <h3>Liste des absences</h3>
        <DataTable
            :value="absencesEtudiant"
            :rows="5"
            paginator
            stripedRows
        >
            <Column header="Date">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.date_absence) }}
                </template>
            </Column>

            <Column header="Justifiée">
                <template #body="slotProps">
                    <Tag
                        :value="slotProps.data.justifiee ? 'Oui' : 'Non'"
                        :severity="slotProps.data.justifiee ? 'success' : 'danger'"
                    />
                </template>
            </Column>

            <Column field="motif" header="Motif"/>
        </DataTable>
    </Dialog>
</template>

<style scoped>
.page-header {
  background: white;
  margin: -32px -32px 28px;
  padding: 32px 40px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  font-size: 30px;
}

.page-header p {
  margin: 8px 0 0;
  color: #64748b;
}

.filters {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
}

.filters :deep(.p-inputtext) {
  width: 420px;
}

.filters :deep(.p-select) {
  width: 220px;
}

.filter-icon {
  color: #94a3b8;
  font-size: 22px;
}

.table-card {
  background: white;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: #dbeafe;
  color: #0b63ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.student-cell strong {
  display: block;
  font-size: 16px;
}

.student-cell small {
  color: #64748b;
}

:deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #64748b;
  text-transform: uppercase;
  font-size: 13px;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 18px 16px;
}

:deep(.p-tag) {
  border-radius: 999px;
  padding: 6px 12px;
}

.student-detail {
  text-align: center;
}

.detail-avatar {
  width: 70px;
  height: 70px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #dbeafe;
  color: #0b63ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 25px;
}

.detail-grid div {
    background: #f8fafc;
    padding: 15px;
    border-radius: 12px;
}

.detail-grid strong {
    color: #64748b;
    font-size: 14px;
}

.detail-grid p {
    margin-top: 8px;
    font-size: 18px;
    font-weight: 600;
}
</style>