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

import { useToast } from 'primevue/usetoast'

import api from '../services/api'

const router = useRouter()
const toast = useToast()

const dossiers = ref([])
const search = ref('')
const semestre = ref(null)
const groupe = ref(null)
const notificationsEtudiant = ref([])

const showDialog = ref(false)
const selectedStudent = ref(null)
const absencesEtudiant = ref([])
const actionsEtudiant = ref([])
const convocationsEtudiant = ref([])
const historiqueEtudiant = ref([])
const dossiersEtudiant = ref([])

const semestres = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']
const groupes = ['BUT1','BUT2', 'BUT3']

const getStatutDossier = (dossier) =>{
 const total = Number(dossier.total_injustifiees || 0)

 if(total >= 5) return 'SANCTION'
 if(total >= 4) return 'AVERTISSEMENT'
 if(total >= 2) return 'RAPPEL'

 return 'NORMAL'

}

const loadDossiers = async () => {
  const response = await api.get('/absences/suivi', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })

  dossiers.value = response.data
}

const notificationsParcours = computed(() => {
  return getChronologieMetier()
    .filter(event => event.titre?.startsWith('Notification'))
    .map(event => ({
      type_notif: event.titre.replace('Notification : ', ''),
      message_notif: event.description,
      date_envoi: new Date()
    }))
})

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

const getChronologie = (etudiant) => {
  const total = Number(etudiant.total_injustifiees)

  return [
    {
      titre: 'Rappel',
      seuil: '2 absences inustifiées',
      fait: total >= 2
    },
    {
      titre: 'Avertissement',
      seuil: '4 absences inustifiées',
      fait: total >= 4
    },
    {
      titre: 'Sanction',
      seuil: '5 absences inustifiées',
      fait: total >= 5
    },
    {
      titre: 'Démissionnaire de fait',
      seuil: '5 jours ouvrés d’absences',
      fait: false
    }
  ]
}

const getChronologieMetier = () => {
  const events = []
  const total = Number(selectedStudent.value?.total_injustifiees || 0)

  const actionsTriees = [...actionsEtudiant.value].sort(
    (a, b) => Number(a.seuil || 0) - Number(b.seuil || 0)
  )

  let dernierTotal = 0

  if (actionsTriees.length > 0) {
    actionsTriees.forEach((action) => {
      const totalAction = Number(action.seuil || 0)
      const nouvellesAbsences = totalAction - dernierTotal

      if (nouvellesAbsences > 0) {
        events.push({
          titre: `Notification : +${nouvellesAbsences} absence(s)`,
          description: `L'étudiant est passé de ${dernierTotal} à ${totalAction} absence(s) injustifiée(s).`,
          statut: 'Cumul détecté',
          type: 'warning',
          fait: true
        })
      }

      events.push({
        titre: action.type_action,
        description: `${action.type_action} déclenché à ${totalAction} absence(s) injustifiée(s).`,
        statut: action.statut_action || 'Créé',
        type: action.type_action?.toLowerCase().includes('rappel')
          ? 'success'
          : action.type_action?.toLowerCase().includes('avertissement')
            ? 'warning'
            : 'danger',
        fait: true
      })

      dernierTotal = totalAction
    })

    return events
  }

  if (total >= 2) {
    events.push({
      titre: "Rappel d'assiduité",
      description: `L'étudiant a atteint le seuil du rappel avec ${total} absence(s) injustifiée(s).`,
      statut: 'À traiter',
      type: 'warning',
      fait: true
    })
  }

  if (total >= 4) {
    events.push({
      titre: 'Avertissement',
      description: `L'étudiant a dépassé le rappel et atteint le niveau avertissement avec ${total} absence(s).`,
      statut: 'À traiter',
      type: 'warning',
      fait: true
    })
  }

  if (total >= 5) {
    events.push({
      titre: 'Sanction / Direction',
      description: `L'étudiant a atteint le niveau sanction avec ${total} absence(s) injustifiée(s).`,
      statut: 'À traiter',
      type: 'danger',
      fait: true
    })
  }

  if (events.length === 0) {
    events.push({
      titre: 'Aucun seuil atteint',
      description: `Total actuel : ${total} absence(s) injustifiée(s).`,
      statut: 'À surveiller',
      type: 'disabled',
      fait: false
    })
  }

  return events
}

const voirEtudiant = async (etudiant) => {
  selectedStudent.value = etudiant
  showDialog.value = true

  const headers = {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }

  try {
    const absencesResponse = await api.get(
      `/absences/etudiant/${etudiant.id_etudiant}`,
      { headers }
    )

    absencesEtudiant.value = absencesResponse.data

    if (etudiant.id_dossier) {
      const dossiersResponse = await api.get('/dossiers', { headers })

      const tousLesDossiersEtudiant = dossiersResponse.data.filter(
        dossier => dossier.id_etudiant === etudiant.id_etudiant
      )

      const actionsResponses = await Promise.all(
        tousLesDossiersEtudiant.map(dossier =>
          api.get(`/actions/dossier/${dossier.id_dossier}`, { headers })
        )
      )

      actionsEtudiant.value = actionsResponses.flatMap(response => response.data)

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

      try {
        const notificationsResponse = await api.get(
          `/notifications/dossier/${etudiant.id_dossier}`,
          { headers }
        )

        notificationsEtudiant.value = notificationsResponse.data
      } catch (error) {
        notificationsEtudiant.value = []
      }
    } else {
      notificationsEtudiant.value = []
      actionsEtudiant.value = []
      convocationsEtudiant.value = []
      historiqueEtudiant.value = []
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(loadDossiers)
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Gestion des absences</h1>
      <p>Suivi détaillé des dossiers administratifs</p>
    </div>
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

    <!-- <Button
      label="Exporter"
      icon="pi pi-download"
      outlined
    />
    -->
    
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
                :value="getStatutDossier(slotProps.data)"
                :severity="
                    getSeverity(
                        getStatutDossier(slotProps.data)
                    )
                "
            />
        </template>
     </Column>

      <Column field="total_absences" header="Total absences" />
      <Column field="total_injustifiees" header="Injustifiées" />

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
          :value="getStatutDossier(selectedStudent)"
          :severity="getSeverity(getStatutDossier(selectedStudent))"
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

        <div class="timeline-card">
          <h3>Chronologie administrative</h3>

          <div
            v-if="selectedStudent && getChronologieMetier(selectedStudent).length === 0"
            class="empty-timeline"
          >
            Aucun événement administratif enregistré.
          </div>

          <div
            v-else
            class="timeline-pro"
          >
            <div
              v-for="event in getChronologieMetier()"
              :key="event.titre"
              class="timeline-pro-item"
            >
              <div
                class="timeline-icon"
                :class="event.type"
              >
                <i
                  class="pi"
                  :class="{
                    'pi-check' : event.fait,
                    'pi-clock': !event.fait
                  }"
                ></i>
              </div>

              <div class="timeline-content " :class="event.type">
                <div class="timeline-content-header">
                  <h4>{{ event.titre }}</h4>

                  <Tag
                    :value="event.statut"
                    :severity="
                      event.type === 'warning'
                        ? 'warning'
                        : event.type === 'danger'
                          ? 'danger'
                          : 'info'
                    "
                  />
                </div>

                <p>{{ event.description }}</p>

                <div class="timeline-meta">
                 <span> {{ event.statut }} </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3>Notifications du dossier</h3>

        <div class="notif-list">
          <div
            v-for="notification in notificationsParcours"
            :key="notification.message_notif"
            class="notif-item"
          >
            <i class="pi pi-bell"></i>

            <div>
              <strong>{{ notification.type_notif }}</strong>
              <p>{{ notification.message_notif }}</p>
              <small>{{ formatDate(notification.date_envoi) }}</small>
            </div>
          </div>

          <p v-if="notificationsParcours.length === 0" class="empty">
            Aucune notification pour ce dossier.
          </p>
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

.timeline-card {
  margin-top: 28px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 26px;
}

.timeline-card h3 {
  margin: 0 0 24px;
  font-size: 22px;
}

.timeline-pro {
  position: relative;
  display: grid;
  gap: 26px;
}

.timeline-pro::before {
  content: '';
  position: absolute;
  left: 28px;
  top: 20px;
  bottom: 20px;
  width: 2px;
  background: #e5e7eb;
}

.timeline-pro-item {
  position: relative;
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 18px;
  align-items: flex-start;
}

.timeline-icon {
  z-index: 1;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.timeline-icon.success {
  background: #dcfce7;
  color: #16a34a;
}

.timeline-icon.warning {
  background: #fef3c7;
  color: #d97706;
}

.timeline-icon.info {
  background: #dbeafe;
  color: #2563eb;
}

.timeline-icon.danger {
  background: #fee2e2;
  color: #dc2626;
}

.timeline-content {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
}

.timeline-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.timeline-content-header h4 {
  margin: 0;
  font-size: 18px;
}

.timeline-content p {
  margin: 10px 0 14px;
  color: #475569;
}

.timeline-meta {
  display: flex;
  gap: 10px;
  color: #64748b;
  font-size: 14px;
}

.empty-timeline {
  background: #f8fafc;
  color: #64748b;
  padding: 20px;
  border-radius: 12px;
}

.timeline-icon.disabled {
  background: #f1f5f9;
  color: #94a3b8;
}

.timeline-content.disabled {
  opacity: 0.65;
}

.notif-list {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

.notif-item {
  display: flex;
  gap: 14px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  padding: 14px;
  border-radius: 12px;
}

.notif-item i {
  color: #f97316;
  font-size: 20px;
}

.notif-item p {
  margin: 6px 0;
  color: #475569;
}

.notif-item small {
  color: #64748b;
}

.empty {
  color: #64748b;
}

</style>