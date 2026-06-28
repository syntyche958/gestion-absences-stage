<script setup>
import { ref, onMounted, computed } from 'vue'

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
import {useToast} from 'primevue/usetoast'

import api from '../services/api'

const convocations = ref([])
const showDialog = ref(false)
const showEditDialog = ref(false)
const selectedConvocation = ref(null)
const convocationForm = ref({})
const showCreateDialog = ref(false)
const toast = useToast()
const search = ref('')

const filteredConvocations = computed(() => {
  return convocations.value.filter((convocation)=>{
    const texte = `
      ${convocation.nom_etudiant || ''}
      ${convocation.prenom_etudiant || ''}
      ${convocation.motif || ''}
      ${convocation.statut_convoc || ''}
    `
      .toLowerCase()

      return texte.includes(search.value.toLowerCase())
  })
})

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

const dossiers = ref([])

const loadDossiers = async () => {
    const response = await api.get('/dossiers', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })

    dossiers.value = response.data.filter(
      dossier =>
        dossier.statut_dossier === 'EN_COURS' &&
        dossier.niveau_alerte === 'SANCTION'
    )
}

const statutsConvocation = [
  'GENEREE',
  'A_VALIDER',
  'VALIDEE',
  'ENVOYEE',
  'SIGNEE',
  'ANNULEE'
]

const loadConvocations = async () => {
  const response = await api.get('/convocations', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })

  convocations.value = response.data
}

const formatDate = (date) => {
  if (!date) return 'À planifier'
  return new Date(date).toLocaleString('fr-FR')
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

const extraireHeure = (date) => {
  if (!date) return ''

  const d = new Date(date)

  const heures = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${heures}:${minutes}`
}

const voirConvocation = (convocation) => {
  selectedConvocation.value = convocation
  showDialog.value = true
}

const ouvrirModification = (convocation) => {
  convocationForm.value = {
    ...convocation,
    date_heure: convocation.date_heure
      ? new Date(convocation.date_heure)
      : null,
    heure: extraireHeure(convocation.date_heure),
    lieu: convocation.lieu || 'Bureau du chef de département',
    disponibilites: convocation.disponibilites || '',
    commentaire_interne: convocation.commentaire_interne || ''
  }

  showEditDialog.value = true
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

const modifierConvocation = async () => {
  await api.put(
    `/convocations/${convocationForm.value.id_convocation}`,
    {
      date_heure: formatDateForBackend(
        convocationForm.value.date_heure,
        convocationForm.value.heure
      ),
      statut_convoc: convocationForm.value.statut_convoc,
      motif: convocationForm.value.motif,
      signature: convocationForm.value.signature,
      commentaire_convoc: convocationForm.value.commentaire_convoc
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )

  toast.add({
    severity: 'success',
    summary: 'succès',
    detail: 'Convocation modifiée avec succès',
    life: 3000
  })

  showEditDialog.value = false
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
    await api.post('/convocations', {
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
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (nouvelleConvocation.value.id_action) {
      await api.put(
        `/actions/${nouvelleConvocation.value.id_action}`, 
        {
          statut_action: 'TERMINEE',
          accuse_reception: false,
          remise_main_propre: false,
          signature_action: false,
          commentaire_action: 'ACtion terminée après création de ma convocation.'
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
    }

    toast.add({
      severity: 'success',
      summary: 'succès',
      detail: 'Convocation créée avec succès',
      life: 3000
    })

    showCreateDialog.value = false
    await loadConvocations()
  } catch (error) {
    toast.add({
      severity: 'warn',
      summary: 'Attention',
      detail: error.response?.data?.message || 'Impossible de créer la convocation',
      life: 3000
    })
  }
}

const supprimerCOnvocation = async (convocation) =>{
  if (!confirm('Voulez-vous vraiment supprimer cette convocation ?')) {
    return
  }

  await api.delete(`/convocations/${convocation.id_convocation}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })

  toast.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Convocation supprimée avec succès',
    life: 3000
  })

  await loadConvocations()
}

const formatDateCourrier = (date) => {
  if (!date) return 'Date à planifier'

  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatHeureCourrier = (date) => {
  if (!date) return 'Heure à définir'

  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await loadConvocations()
  await loadDossiers()

  const prefill = localStorage.getItem('convocation_prefill')

  if (prefill) {
    const data = JSON.parse(prefill)

    nouvelleConvocation.value= {
      date_heure: null,
      heure: '',
      statut_convoc: 'GENEREE',
      motif: data.motif,
      signature: false,
      commentaire_convoc: '',
      id_utilisateur: 1,
      id_dossier: data.id_dossier,
      id_action: data.id_action
    }

    showCreateDialog.value=true
    localStorage.removeItem('convocation_prefill')
  }

})
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Convocations</h1>
      <p>Gestion des convocations générées après les seuils d'absences</p>
    </div>
  </div>

  <div class="filters">
    <InputText
      v-model ="search"
      placeholder="Rechercher une convocation..."
    />
    <!-- <Button
      label="Nouvelle convocation"
      icon="pi pi-plus"
      @click="ouvrirCreation"
    /> -->
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

      <Column field="motif" header="Motif" />

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
              icon="pi pi-trash"
              rounded
              text
              severity="danger"
              @click="supprimerCOnvocation(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>

  <Dialog
    v-model:visible="showEditDialog"
    modal
    header="Préparer la convocation"
    :style="{ width: '800px' }"
  >
    <div class="form-grid">
      <div>
        <label>Date de convocation</label>
        <DatePicker
          v-model="convocationForm.date_heure"
          dateFormat="dd/mm/yy"
          showIcon
          placeholder="Choisir une date"
        />
      </div>

      <div>
        <label>Heure</label>
        <InputText
          v-model="convocationForm.heure"
          placeholder="10:30"
        />
      </div>

      <div class="full">
        <label>Lieu</label>
        <InputText
          v-model="convocationForm.lieu"
          placeholder="Bureau du chef de département"
        />
      </div>

      <div class="full">
        <label>Disponibilités / créneaux proposés</label>
        <Textarea
          v-model="convocationForm.disponibilites"
          rows="3"
          autoResize
          placeholder="Ex : Lundi 10h-12h, mardi 14h-16h..."
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

      <div>
        <label>Signature</label>
        <div class="checkbox-line">
          <Checkbox
            v-model="convocationForm.signature"
            binary
          />
          <span>Convocation signée</span>
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
          placeholder="Ex : Merci de vous présenter avec vos justificatifs."
        />
      </div>

      <div class="full">
        <label>Commentaire interne</label>
        <Textarea
          v-model="convocationForm.commentaire_interne"
          rows="3"
          autoResize
          placeholder="Note interne, non visible dans le courrier."
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
    :style="{ width: '850px' }"
  >
    <div
      v-if="selectedConvocation"
      class="courrier-preview"
    >
      <p>
        Madame / Monsieur
        <strong>
          {{ selectedConvocation.prenom_etudiant }}
          {{ selectedConvocation.nom_etudiant }}
        </strong>
      </p>

      <h2>CONVOCATION</h2>

      <p>Madame, Monsieur,</p>

      <p>
        Nous vous informons que votre situation d’assiduité nécessite un entretien
        avec le département informatique.
      </p>

      <p>
        Motif :
        <strong>{{ selectedConvocation.motif }}</strong>
      </p>

      <div class="convocation-box">
        <strong>
          {{ formatDateCourrier(selectedConvocation.date_heure) }}
          à
          {{ formatHeureCourrier(selectedConvocation.date_heure) }}
        </strong>

        <p>
          Lieu :
          {{ selectedConvocation.lieu || 'Bureau du chef de département' }}
        </p>
      </div>

      <p>
        Votre présence est obligatoire. En cas d’absence non justifiée, des mesures
        administratives complémentaires pourront être prises.
      </p>

      <p v-if="selectedConvocation.commentaire_convoc">
        Commentaire :
        {{ selectedConvocation.commentaire_convoc }}
      </p>

      <p>
        Cordialement,
        <br />
        Le secrétariat pédagogique
      </p>
    </div>

    <template #footer>
      <Button
        label="Fermer"
        severity="secondary"
        outlined
        @click="showDialog = false"
      />

      <Button
        label="Télécharger PDF"
        icon="pi pi-download"
      />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="showCreateDialog"
    modal
    header="Nouvelle Convocation"
    :style="{width: '750px'}"
  >
    <div class="form-grid">
        <div class="full">
            <label>Dossier/ étudiant concerné</label>
            <Select
                v-model="nouvelleConvocation.id_dossier"
                :options="dossiers"
                optionLabel="nom_etudiant"
                optionValue="id_dossier"
                placeholder="Choisir un dossier"
            >
                <template #option="slotProps">
                    {{ slotProps.option.nom_etudiant }}
                    {{ slotProps.option.prenom_etudiant }}
                    -
                    {{ slotProps.option.niveau_alerte }}
                </template>

                <template #value="slotProps">
                    <span v-if="slotProps.value">
                        Dossier sélectionné
                    </span>
                    <span v-else>
                        Choisir un dossier
                    </span>
                </template>
            </Select>
        </div>

        <div>
            <label>Date de convocation</label>
            <DatePicker
                v-model="nouvelleConvocation.date_heure"
                dateFormat="dd/mm/yy"
                showIcon
                placeholder="Choisir une date"
            />
        </div>

        <div>
            <label>Heure</label>
            <InputText
                v-model="nouvelleConvocation.heure"
                placeholder="10:30"
            />
        </div>

        <div>
            <label>Statut</label>
            <Select
              v-model="nouvelleConvocation.statut_convoc"
              :options="statutsConvocation"
              placeholder="Choisir un statut"
              />
        </div>

          <div>
            <label>Signature</label>
            <div class="checkbox-line">
                <Checkbox
                    v-model="nouvelleConvocation.signature"
                    binary
                />
                <span>Convocation signée</span>
            </div>
        </div>

        <div class="full">
            <label>Motif</label>
            <Textarea
                v-model="nouvelleConvocation.motif"
                rows="4"
                autoResize
            />
        </div>

        <div class="full">
            <label>Commentaire</label>
            <Textarea
                v-model="nouvelleConvocation.commentaire_convoc"
                rows="4"
                autoResize
            />
        </div>
    </div>

    <template #footer>
        <Button
            label="Annuler"
            severity="secondary"
            outlined
            @click="showCreateDialog = false" 
        />

        <Button
            label="Créer"
            icon="pi pi-check"
            @click="creerConvocation"
        />
    </template>
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

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-grid div,
.commentaire-box {
  background: #f8fafc;
  padding: 15px;
  border-radius: 12px;
}

.detail-grid strong,
.commentaire-box strong {
  color: #64748b;
  font-size: 14px;
}

.detail-grid p,
.commentaire-box p {
  margin-top: 8px;
  font-weight: 600;
}

.commentaire-box {
  margin-top: 20px;
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

.form-grid :deep(.p-datepicker),
.form-grid :deep(.p-inputtext),
.form-grid :deep(.p-select),
.form-grid :deep(.p-textarea) {
    width: 100%;
}

.checkbox-line {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.filters {
  display: flex;
  margin-bottom: 24px;
}

.filters :deep(.p-inputtext) {
  width: 420px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.courrier-preview {
  padding: 28px 38px;
  background: white;
  color: #111827;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.7;
  font-size: 17px;
}

.courrier-preview h2 {
  text-align: center;
  margin: 32px 0;
  font-size: 24px;
  letter-spacing: 1px;
}

.convocation-box {
  margin: 28px 0;
  padding: 20px;
  border-radius: 12px;
  background: #eef6ff;
  text-align: center;
}

.convocation-box strong {
  display: block;
  font-size: 18px;
  margin-bottom: 8px;
}

.convocation-box p {
  margin: 0;
}
</style>