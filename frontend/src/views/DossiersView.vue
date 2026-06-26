<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog  from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import { useToast } from 'primevue/usetoast'

import api from '../services/api'

const router = useRouter()
const toast = useToast()

const dossiers = ref([])
const search = ref('')
const semestre = ref(null)
const groupe = ref(null)

const showDialog = ref(false)
const selectedStudent = ref(null)
const absencesEtudiant = ref([])
const showAbsenceDialog = ref(false)
const actionsEtudiant = ref([])
const convocationsEtudiant = ref([])
const historiqueEtudiant = ref([])

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

const convoquerEtudiant = async (etudiant) =>{
  try {
    const response = await api.get('/dossiers', {
      headers: {
        Authorization:`Bearer ${localStorage.getItem('token')}`
      }
    })

    const dossiersEtudiant = response.data.filter(
      dossier => 
        dossier.id_etudiant === etudiant.id_etudiant &&
        dossier.statut_dossier === 'EN_COURS' &&
        dossier.niveau_alerte === 'SANCTION'
    )

    if (dossiersEtudiant.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Impossible',
        detail: "Cet étudiant n'a pas de dossier SANCTION actif",
      })
      return
    }

    const dossierPrioritaire = dossiersEtudiant[dossiersEtudiant.length - 1]

    localStorage.setItem(
      'convocation_prefill',
      JSON.stringify({
        id_dossier: dossierPrioritaire.id_dossier,
        nom_etudiant: etudiant.nom_etudiant,
        prenom_etudiant: etudiant.prenom_etudiant,
        motif: `Convocation suite au suivi des absences ${etudiant.nom_etudiant} ${etudiant.prenom_etudiant}.`
      })
    )

    router.push('/convocations')
  } catch (error) {
    console.error(error)
    alert("Erreur lors de la préparation de la convocation.")
  }
}

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

  const headers = {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }

  const absencesResponse = await api.get(
    `/absences/etudiant/${etudiant.id_etudiant}`,
    { headers }
  )

  absencesEtudiant.value = absencesResponse.data

  if (etudiant.id_dossier) {
    const actionsResponse = await api.get(
      `/actions/dossier/${etudiant.id_dossier}`,
      { headers }
    )

    const convocationsResponse = await api.get(
      `/convocations/dossier/${etudiant.id_dossier}`,
      { headers }
    )

    const historiqueResponse = await api.get(
      `/historique/dossier/${etudiant.id_dossier}`,
      { headers }
    )

    actionsEtudiant.value = actionsResponse.data
    convocationsEtudiant.value = convocationsResponse.data
    historiqueEtudiant.value = historiqueResponse.data
  } else {
    actionsEtudiant.value = []
    convocationsEtudiant.value = []
    historiqueEtudiant.value = []
  }
}

const absenceForm = ref({
  date_absence: null,
  duree: 2,
  justifiee: false,
  motif:'',
  statut: 'enregistrée',
  id_etudiant: null
})

const ouvrirAjoutAbsence = () => {
  absenceForm.value = {
    date_absence: null,
    duree: 2,
    justifiee: false,
    motif: '',
    statut:'enregistrée',
    id_etudiant: null
  }

  showAbsenceDialog.value = true
}

const formatDateForBackend = (date) => {

  if (!date) return null

  const d = new Date(date)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const ajouterAbsence = async () => {
  if(!absenceForm.value.id_etudiant || !absenceForm.value.date_absence) {
    toast.add({
      severity:'warn',
      summary:'Attention',
      detail: 'Veuillez choisir un étudiant et une date.',
      life:3000
    })
    return
  }

  await api.post('/absences', {
    date_absence: formatDateForBackend(absenceForm.value.date_absence),
    duree: absenceForm.value.duree,
    justifiee: absenceForm.value.justifiee,
    motif: absenceForm.value.motif,
    statut: absenceForm.value.statut,
    id_etudiant: absenceForm.value.id_etudiant
  },{
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })

  toast.add({
    severity: 'success',
    summary: 'succès',
    detail: 'Absence ajoutée avec succès.',
    life:3000
  })

  showAbsenceDialog.value = false
  await loadDossiers()
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
      @click="ouvrirAjoutAbsence"
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
            <div class="avatar clickable"
              @click="convoquerEtudiant(slotProps.data)"
            >
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
                :value="getStatut(Number(slotProps.data.total_injustifiees))"
                :severity="
                    getSeverity(
                        getStatut(Number(slotProps.data.total_injustifiees))
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
    v-model:visible="showAbsenceDialog"
    modal
    header="Ajouter une absence"
    :style="{ width: '650px' }"
  >
    <div class="form-grid">
      <div class="full">
        <label>Etudiant</label>
        <Select
          v-model="absenceForm.id_etudiant"
          :options="dossiers"
          optionLabel="nom_etudiant"
          optionValue="id_etudiant"
          placeholder="Choisir un étudiant"
        >
          <template #option="slotProps">
            {{ slotProps.option.nom_etudiant }}
            {{ slotProps.option.prenom_etudiant }}
            -
            {{ slotProps.option.groupe_td }}
          </template>
        </Select>
      </div>

      <div>
        <label>Date d'absence</label>
        <DatePicker
          v-model="absenceForm.date_absence"
          dateFormat="dd/mm/yy"
          showIcon
          placeholder="Choisir une date"
        />
      </div>

      <div>
        <label>Durée</label>
        <InputNumber
          v-model="absenceForm.duree"
          :min="1"
          :max="8"
          suffix="h"
        />
      </div>

      <div>
        <label>Motif</label>
        <Textarea
          v-model="absenceForm.motif"
          rows="3"
          autoResize
          placeholder="Ex: absence injustifiée, maladie, rendez-vous..."
        />
      </div>

      <div class="checkbox-line full">
        <Checkbox
          v-model="absenceForm.justifiee"
          binary
        />
        <span>Absence justifiée</span>
      </div>
    </div>

    <template #footer>
      <Button
        label="Annuler"
        severity="secondary"
        outlined
        @click="showAbsenceDialog = false" 
      />

      <Button
        label="Ajouter"
        icon="pi pi-check"
        @click="ajouterAbsence"
      />
    </template>
  </Dialog>

    <Dialog
          v-model:visible="showDialog"
          modal
          header="Fiche étudiant"
          :style="{ width: '900px' }"
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
                :value="getStatut(Number(selectedStudent.total_injustifiees))"
                :severity="getSeverity(getStatut(Number(selectedStudent.total_injustifiees)))"
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
        <h3>Actions administratives</h3>
        <DataTable
          :value="actionsEtudiant"
          :rows="5"
          paginator
          stripedRows
        >
          <Column field="type_action" header="Type" />
          <Column field="moyenEnvoi" header="Moyen" />
          <Column field="statut_action" header="Statut" />
          <Column field="commentaire_action" header="Commentaire" />
        </DataTable>

        <h3>Convocations</h3>
        <DataTable
          :value="convocationsEtudiant"
          :rows="5"
          paginator
          stripedRows
        >
          <Column header="Date">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.date_heure) }}
            </template>
          </Column>

          <Column field="statut_convoc" header="Statut" />
          <Column field="motif" header="Motif" />
          <Column field="commentaire_convoc" header="Commentaire" />
        </DataTable>

        <h3>Historique administratif</h3>
        <DataTable
          :value="historiqueEtudiant"
          :rows="5"
          paginator
          stripedRows
        >
          <Column field="action_effectuee" header="Action" />
          <Column field="description" header="Description" />

          <Column header="Date">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.date_action) }}
            </template>
          </Column>
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

.clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.clickable:hover {
  transform: scale(1.06);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-grid label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #334155;
}

.form-grid :deep(.p-inputtext),
.form-grid :deep(.p-select),
.form-grid :deep(.p-datepicker),
.form-grid :deep(.p-inputnumber),
.form-grid :deep(.p-textarea) {
  width: 100%;
}

.full {
  grid-column: 1 / -1;
}

.checkbox-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

</style>