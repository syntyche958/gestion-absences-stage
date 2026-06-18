<script setup>
import { ref, onMounted } from 'vue'

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

import api from '../services/api'

const convocations = ref([])
const showDialog = ref(false)
const showEditDialog = ref(false)
const selectedConvocation = ref(null)
const convocationForm = ref({})
const showCreateDialog = ref(false)

const nouvelleConvocation = ref({
    date_heure: null,
    heure: '',
    statut_convoc: 'Generée',
    motif: '',
    signature: false,
    commentaire_convoc: '',
    id_utilisateur: 1,
    id_dossier: null
})

const dossiers = ref([])

const loadDossiers = async () => {
    const response = await api.get('/dossiers', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })

    dossiers.value = response.data
}

const statutsConvocation = [
  'CREER',
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
    heure: extraireHeure(convocation.date_heure)
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
        id_dossier: null
    }
    
    showCreateDialog.value = true
}

const creerConvocation = async () => {  
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
    }
  )

  showCreateDialog.value = false
  await loadConvocations()
}

onMounted(() => {
    loadConvocations()
    loadDossiers()
})
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Convocations</h1>
      <p>Gestion des convocations générées après les seuils d'absences</p>
    </div>

    <Button
      label="Nouvelle convocation"
      icon="pi pi-plus"
      @click="ouvrirCreation"
    />
  </div>

  <div class="table-card">
    <DataTable
      :value="convocations"
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
        </template>
      </Column>
    </DataTable>
  </div>

  <Dialog
        v-model:visible="showDialog"
        modal
        header="Détail de la convocation"
        :style="{ width: '750px' }"
    >
    <div
      v-if="selectedConvocation"
      class="detail-grid"
    >
      <div>
            <strong>Étudiant</strong>
            <p>
                {{ selectedConvocation.nom_etudiant }}
                {{ selectedConvocation.prenom_etudiant }}
            </p>
      </div>

      <div>
            <strong>Statut</strong>
            <p>{{ selectedConvocation.statut_convoc }}</p>
      </div>

      <div>
            <strong>Date</strong>
            <p>{{ formatDate(selectedConvocation.date_heure) }}</p>
      </div>

      <div>
            <strong>Niveau d'alerte</strong>
            <p>{{ selectedConvocation.niveau_alerte }}</p>
      </div>

      <div>
            <strong>Signature</strong>
            <p>{{ selectedConvocation.signature ? 'Oui' : 'Non' }}</p>
      </div>

      <div>
            <strong>Utilisateur responsable</strong>
            <p>
                {{ selectedConvocation.nom_utilisateur }}
                {{ selectedConvocation.prenom_utilisateur }}
            </p>
      </div>
    </div>

    <div
      v-if="selectedConvocation"
      class="commentaire-box"
    >
      <strong>Motif</strong>
      <p>{{ selectedConvocation.motif }}</p>

      <strong>Commentaire</strong>
      <p>
        {{
          selectedConvocation.commentaire_convoc ||
          'Aucun commentaire'
        }}
      </p>
    </div>
  </Dialog>

  <Dialog
    v-model:visible="showEditDialog"
    modal
    header="Modifier la convocation"
    :style="{ width: '750px' }"
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

                <span>
                    Convocation signée
                </span>
            </div>
        </div>

        <div class="full">
            <label>Motif</label>

            <Textarea
                v-model="convocationForm.motif"
                rows="4"
                autoResize
            />
        </div>

        <div class="full">
            <label>Commentaire</label>

            <Textarea
                v-model="convocationForm.commentaire_convoc"
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
                <template #option=""slotProps>
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
</style>