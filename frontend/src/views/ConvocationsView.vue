<script setup>
import { ref, onMounted, computed } from 'vue'
import CourrierAR from '../components/courriers/CourrierAR.vue'
import CourrierMainPropre from '../components/courriers/CourrierMainPropre.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import DatePicker from 'primevue/datepicker'
import RadioButton from 'primevue/radiobutton'
import { useToast } from 'primevue/usetoast'

import api from '../services/api'

const toast = useToast()

const convocations = ref([])
const dossiers = ref([])
const search = ref('')

const showDialog = ref(false)
const showEditDialog = ref(false)
const showCreateDialog = ref(false)
const ouvertureDepuisWorkflow = ref(false)

const selectedConvocation = ref(null)
const convocationForm = ref({})

const responsables = [
  'Chef de département',
  'Directeur des études',
  'Directeur IUT'
]

const statutsConvocation = [
  'GENEREE',
  'A_VALIDER',
  'VALIDEE',
  'ENVOYEE',
  'SIGNEE',
  'ANNULEE'
]

const nouvelleConvocation = ref({
  date_heure: null,
  heure: '',
  statut_convoc: 'GENEREE',
  motif: '',
  signature: false,
  commentaire_convoc: '',
  id_utilisateur: 1,
  id_dossier: null,
  id_action: null
})

const filteredConvocations = computed(() => {
  return convocations.value.filter((convocation) => {
    const texte = `
      ${convocation.nom_etudiant || ''}
      ${convocation.prenom_etudiant || ''}
      ${convocation.motif || ''}
      ${convocation.statut_convoc || ''}
      ${convocation.mode_envoi || ''}
    `.toLowerCase()

    return texte.includes(search.value.toLowerCase())
  })
})

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

const loadConvocations = async () => {
  const response = await api.get('/convocations', {
    headers: getHeaders()
  })

  convocations.value = response.data
}

const loadDossiers = async () => {
  const response = await api.get('/dossiers', {
    headers: getHeaders()
  })

  dossiers.value = response.data.filter(
    dossier =>
      dossier.statut_dossier === 'EN_COURS' &&
      dossier.niveau_alerte === 'SANCTION'
  )
}

const formatDate = (date) => {
  if (!date) return 'À planifier'
  return new Date(date).toLocaleString('fr-FR')
}

const extraireHeure = (date) => {
  if (!date) return ''

  const d = new Date(date)
  const heures = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${heures}:${minutes}`
}

const formatDateForBackend = (date, heure) => {
  if (!date) return null

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const heureFinale = heure || '00:00'

  return `${year}-${month}-${day} ${heureFinale}:00`
}

const getSeverity = (statut) => {
  if (statut === 'GENEREE') return 'secondary'
  if (statut === 'A_VALIDER') return 'warning'
  if (statut === 'VALIDEE') return 'info'
  if (statut === 'ENVOYEE') return 'info'
  if (statut === 'SIGNEE') return 'success'
  if (statut === 'ANNULEE') return 'danger'
  return 'secondary'
}

const getTotalAbsencesCourrier = (convocation) => {
  return (
    convocation.seuil ||
    convocation.total_injustifiees ||
    convocation.total_absences_traitees ||
    'X'
  )
}

const getObjetCourrier = (convocation) => {
  const total = getTotalAbsencesCourrier(convocation)

  if (convocation.objet) return convocation.objet

  if (convocation.niveau_alerte === 'RAPPEL' || convocation.type_courrier === 'Rappel') {
    return `Rappel à l'obligation d'assiduité suite à ${total} absence(s) injustifiée(s)`
  }

  if (
    convocation.niveau_alerte === 'AVERTISSEMENT' ||
    convocation.type_courrier === 'Avertissement'
  ) {
    return `Avertissement à la suite de ${total} absence(s) injustifiée(s)`
  }

  if (convocation.niveau_alerte === 'SANCTION') {
    return 'Convocation Direction / Moyennes des UE non calculées'
  }

  return convocation.motif || ''
}

const construireConvocationPreview = (convocation) => {
  const objet = getObjetCourrier(convocation)

  return {
    ...convocation,
    objet,
    motif: convocation.motif || objet,
    seuil: getTotalAbsencesCourrier(convocation)
  }
}

const voirConvocation = (convocation) => {
  selectedConvocation.value = construireConvocationPreview(convocation)
  showDialog.value = true
}

const ouvrirModification = (convocation) => {
  convocationForm.value = {
    ...convocation,
    date_heure: convocation.date_heure ? new Date(convocation.date_heure) : null,
    heure: extraireHeure(convocation.date_heure),
    lieu: convocation.lieu || '',
    commentaire_interne: convocation.commentaire_interne || '',
    mode_envoi: convocation.mode_envoi || 'Courrier recommandé avec AR',
    type_courrier: convocation.type_courrier || 'Avertissement',
    responsable: convocation.responsable || 'Chef de département',
    objet: getObjetCourrier(convocation),
    motif: convocation.motif || getObjetCourrier(convocation),
    seuil: getTotalAbsencesCourrier(convocation)
  }

  showEditDialog.value = true
}

const modifierConvocation = async () => {
  
  const dateBackend = formatDateForBackend(
    convocationForm.value.date_heure,
    convocationForm.value.heure
  )

  await api.put(
    `/convocations/${convocationForm.value.id_convocation}`,
    {
      date_heure: dateBackend,
      statut_convoc: convocationForm.value.statut_convoc,
      motif: convocationForm.value.motif,
      signature: convocationForm.value.signature,
      commentaire_convoc: convocationForm.value.commentaire_convoc,
      lieu: convocationForm.value.lieu,
      mode_envoi: convocationForm.value.mode_envoi,
      commentaire_interne: convocationForm.value.commentaire_interne,
      responsable: convocationForm.value.responsable
    },
    {
      headers: getHeaders()
    }
  )

  selectedConvocation.value = {
    ...convocationForm.value,
    date_heure: dateBackend
  }

  toast.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Courrier modifié avec succès',
    life: 3000
  })

  showEditDialog.value = false
  ouvertureDepuisWorkflow.value = false
  await loadConvocations()
}

const envoyerCourrier = async (convocation) => {
  if (!confirm('Confirmer l’envoi de ce courrier ?')) return

  await api.put(
    `/convocations/${convocation.id_convocation}`,
    {
      date_heure: convocation.date_heure,
      statut_convoc: 'ENVOYEE',
      motif: convocation.motif,
      signature: convocation.signature,
      commentaire_convoc: convocation.commentaire_convoc,
      lieu: convocation.lieu,
      mode_envoi: convocation.mode_envoi,
      commentaire_interne: convocation.commentaire_interne,
      responsable: convocation.responsable
    },
    {
      headers: getHeaders()
    }
  )

  toast.add({
    severity: 'success',
    summary: 'Courrier envoyé',
    detail: 'Le statut du courrier est passé à ENVOYEE.',
    life: 3000
  })

  ouvertureDepuisWorkflow.value = false
  await loadConvocations()
}

const ouvrirCreation = () => {
  nouvelleConvocation.value = {
    date_heure: null,
    heure: '',
    statut_convoc: 'GENEREE',
    motif: '',
    signature: false,
    commentaire_convoc: '',
    id_utilisateur: 1,
    id_dossier: null,
    id_action: null
  }

  showCreateDialog.value = true
}

const creerConvocation = async () => {
  try {
    await api.post(
      '/convocations',
      {
        date_heure: formatDateForBackend(
          nouvelleConvocation.value.date_heure,
          nouvelleConvocation.value.heure
        ),
        statut_convoc: nouvelleConvocation.value.statut_convoc,
        motif: nouvelleConvocation.value.motif,
        signature: nouvelleConvocation.value.signature,
        commentaire_convoc: nouvelleConvocation.value.commentaire_convoc,
        id_utilisateur: nouvelleConvocation.value.id_utilisateur,
        id_dossier: nouvelleConvocation.value.id_dossier
      },
      {
        headers: getHeaders()
      }
    )

    toast.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Courrier créé avec succès',
      life: 3000
    })

    showCreateDialog.value = false
    await loadConvocations()
  } catch (error) {
    toast.add({
      severity: 'warn',
      summary: 'Attention',
      detail: error.response?.data?.message || 'Impossible de créer le courrier',
      life: 3000
    })
  }
}

const supprimerConvocation = async (convocation) => {
  if (!confirm('Voulez-vous vraiment supprimer ce courrier ?')) return

  await api.delete(`/convocations/${convocation.id_convocation}`, {
    headers: getHeaders()
  })

  toast.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Courrier supprimé avec succès',
    life: 3000
  })

  await loadConvocations()
}

const ouvrirDepuisSuiviAdministratif = async () => {
  const prefill = localStorage.getItem('courrier_prefill')
  if (!prefill) return

  const data = JSON.parse(prefill)

  await loadConvocations()

  let courrierExiste = convocations.value.find(
    c => c.id_dossier === data.id_dossier
  )

  if (!courrierExiste) {
    await api.post(
      '/convocations',
      {
        date_heure: null,
        statut_convoc: 'GENEREE',
        motif:
          data.niveau === 'RAPPEL'
            ? "Rappel à l'obligation d'assiduité"
            : "Avertissement à la suite d'absences injustifiées.",
        signature: false,
        commentaire_convoc: '',
        id_utilisateur: 1,
        id_dossier: data.id_dossier,
        mode_envoi:
          data.niveau === 'RAPPEL'
            ? 'Mail'
            : 'Courrier recommandé avec AR',
        type_courrier:
          data.niveau === 'RAPPEL'
            ? 'Rappel'
            : 'Avertissement',
        responsable:
          data.niveau === 'RAPPEL'
            ? 'Directeur des études'
            : 'Chef de département'
      },
      {
        headers: getHeaders()
      }
    )

    await loadConvocations()

    courrierExiste = convocations.value.find(
      c => c.id_dossier === data.id_dossier
    )
  }

  if (courrierExiste) {
    ouvertureDepuisWorkflow.value = true
    ouvrirModification(courrierExiste)
  }

  localStorage.removeItem('courrier_prefill')
}

onMounted(async () => {
  await loadConvocations()
  await loadDossiers()
  await ouvrirDepuisSuiviAdministratif()
})
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Courriers administratifs</h1>
      <p>Préparation et suivi des courriers liés aux absences</p>
    </div>
  </div>

  <div v-if="!ouvertureDepuisWorkflow">
    <div class="filters">
      <InputText
        v-model="search"
        placeholder="Rechercher un courrier..."
      />
    </div>

    <div class="table-card">
      <DataTable
        :value="filteredConvocations"
        paginator
        :rows="10"
        stripedRows
      >
        <Column header="Étudiant">
          <template #body="slotProps">
            <strong>
              {{ slotProps.data.nom_etudiant }}
              {{ slotProps.data.prenom_etudiant }}
            </strong>
          </template>
        </Column>

        <Column header="Type de courrier">
          <template #body="slotProps">
            <span v-if="slotProps.data.type_courrier">
              {{ slotProps.data.type_courrier }}
            </span>
            <span v-else>
              {{ slotProps.data.motif }}
            </span>
          </template>
        </Column>

        <Column header="Mode d'envoi">
          <template #body="slotProps">
            {{ slotProps.data.mode_envoi || 'À définir' }}
          </template>
        </Column>

        <Column header="Date">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.date_heure) }}
          </template>
        </Column>

        <Column header="Statut">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.statut_convoc"
              :severity="getSeverity(slotProps.data.statut_convoc)"
            />
          </template>
        </Column>

        <Column header="Signature">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.signature ? 'Signée' : 'Non signée'"
              :severity="slotProps.data.signature ? 'success' : 'warning'"
            />
          </template>
        </Column>

        <Column header="Actions">
          <template #body="slotProps">
            <div class="action-buttons">
              <Button
                icon="pi pi-eye"
                rounded
                text
                @click="voirConvocation(slotProps.data)"
              />

              <Button
                icon="pi pi-pencil"
                rounded
                text
                severity="warning"
                @click="ouvrirModification(slotProps.data)"
              />

              <Button
                v-if="slotProps.data.statut_convoc !== 'ENVOYEE'"
                icon="pi pi-send"
                rounded
                text
                severity="success"
                @click="envoyerCourrier(slotProps.data)"
              />

              <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                @click="supprimerConvocation(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog
    v-model:visible="showEditDialog"
    modal
    header="Préparer le courrier administratif"
    :style="{ width: '800px' }"
  >
    <div class="form-grid">
      <div>
        <label>Date du courrier</label>
        <DatePicker
          v-model="convocationForm.date_heure"
          dateFormat="dd/mm/yy"
          showIcon
          placeholder="Choisir une date"
        />
      </div>

      <div>
        <label>Statut</label>
        <Select
          v-model="convocationForm.statut_convoc"
          :options="statutsConvocation"
          placeholder="Choisir un statut"
        />
      </div>

      <div class="full">
        <label>Responsable</label>
        <Select
          v-model="convocationForm.responsable"
          :options="responsables"
          placeholder="Choisir un responsable"
        />
      </div>

      <div class="full">
        <label>Mode d'envoi</label>

        <div class="radio-group">
          <div class="radio-item">
            <RadioButton
              v-model="convocationForm.mode_envoi"
              inputId="ar"
              value="Courrier recommandé avec AR"
            />
            <label for="ar">Courrier recommandé avec AR</label>
          </div>

          <div class="radio-item">
            <RadioButton
              v-model="convocationForm.mode_envoi"
              inputId="mainPropre"
              value="Remise en main propre"
            />
            <label for="mainPropre">Remise en main propre</label>
          </div>
        </div>
      </div>

      <div class="full">
        <label>Objet du courrier</label>
        <InputText
          v-model="convocationForm.objet"
          placeholder="Objet du courrier"
        />
      </div>

      <div>
        <label>Signature</label>
        <div class="checkbox-line">
          <Checkbox
            v-model="convocationForm.signature"
            binary
          />
          <span>Courrier signé</span>
        </div>
      </div>

      <div class="full">
        <label>Motif visible dans le courrier</label>
        <Textarea
          v-model="convocationForm.motif"
          rows="3"
          autoResize
        />
      </div>

      <div class="full">
        <label>Commentaire visible dans le courrier</label>
        <Textarea
          v-model="convocationForm.commentaire_convoc"
          rows="3"
          autoResize
        />
      </div>

      <div class="full">
        <label>Commentaire interne</label>
        <Textarea
          v-model="convocationForm.commentaire_interne"
          rows="3"
          autoResize
          placeholder="Visible uniquement par l'administration"
        />
      </div>
    </div>

    <template #footer>
      <Button
        label="Annuler"
        severity="secondary"
        outlined
        @click="showEditDialog = false"
      />

      <Button
        label="Enregistrer"
        icon="pi pi-check"
        @click="modifierConvocation"
      />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="showDialog"
    modal
    header="Aperçu du courrier"
    :style="{ width: '900px' }"
  >
    <CourrierAR
      v-if="selectedConvocation?.mode_envoi === 'Courrier recommandé avec AR'"
      :convocation="selectedConvocation"
    />

    <CourrierMainPropre
      v-else
      :convocation="selectedConvocation"
    />
  </Dialog>
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

.filters {
  display: flex;
  margin-bottom: 24px;
}

.filters :deep(.p-inputtext) {
  width: 420px;
}

.table-card {
  background: white;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
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

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
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
.form-grid :deep(.p-textarea),
.form-grid :deep(.p-datepicker) {
  width: 100%;
}

.full {
  grid-column: 1 / -1;
}

.checkbox-line,
.radio-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
}
</style>