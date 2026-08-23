<script setup>
import { ref, onMounted } from 'vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'

import api from '../services/api'

const actions = ref([])
const toast = useToast()
const router = useRouter()

const showDialog = ref(false)
const selectedAction = ref(null)
const showEditDialog = ref(false)
const actionForm = ref({})

const loadActions = async () => {
  const response = await api.get('/actions', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })

  actions.value = response.data
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}

const getStatusSeverity = (statut) => {
  if (statut === 'A_TRAITER') return 'warning'
  if (statut === 'ENVOYEE') return 'info'
  if (statut === 'RECUE') return 'success'
  if (statut === 'TERMINEE') return 'secondary'
  return 'secondary'
}

const getNiveauSeverity = (niveau) => {
  if (niveau === 'RAPPEL') return 'info'
  if (niveau === 'AVERTISSEMENT') return 'warning'
  if (niveau === 'SANCTION') return 'danger'
  return 'secondary'
}

const voirAction = (action) => {
    selectedAction.value = action
    showDialog.value = true
}

const traiterAction = async (action) => {
  if (action.niveau_alerte === 'SANCTION') {
    localStorage.setItem(
      'convocation_prefill',
      JSON.stringify({
        id_dossier: action.id_dossier,
        id_action: action.id_action,
        nom_etudiant: action.nom_etudiant,
        prenom_etudiant: action.prenom_etudiant,
        motif: `Convocation suite au seuil de sanction pour ${action.nom_etudiant} ${action.prenom_etudiant}.`
      })
    )
  }

  await api.put(
    `/actions/${action.id_action}`,
    {
      statut_action: 'TERMINEE',
      accuse_reception: action.accuse_reception,
      remise_main_propre: action.remise_main_propre,
      signature_action: action.signature_action,
      commentaire_action: action.commentaire_action
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )

  toast.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Action traitée avec succès',
    life: 3000
  })

  await loadActions()
}
const modifierAction = (action) => {
  actionForm.value = { ...action }
  showEditDialog.value = true
}

const preparerCourrier = (action) => {

  localStorage.setItem(
    'courrier_prefill',
    JSON.stringify({
      id_dossier: action.id_dossier,
      id_action: action.id_action,
      niveau: action.niveau_alerte,
      nom: action.nom_etudiant,
      prenom: action.prenom_etudiant
    })
  )

  router.push('/convocations')
}

const sauvegarderAction = async () => {
  if (!actionForm.value.id_action) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: "ID de l'action introuvable.",
      life: 3000
    })
    return
  }

  await api.put(
    `/actions/${actionForm.value.id_action}`,
    {
      statut_action: actionForm.value.statut_action,
      accuse_reception: actionForm.value.accuse_reception || false,
      remise_main_propre: actionForm.value.remise_main_propre || false,
      signature_action: actionForm.value.signature_action || false,
      commentaire_action: actionForm.value.commentaire_action || '',
      moyenEnvoi: actionForm.value.moyenEnvoi || ''
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )

  toast.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Action mise à jour.',
    life: 3000
  })

  showEditDialog.value = false
  await loadActions()
}

onMounted(loadActions)
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Suivi administratif</h1>
      <p>Suivi des actions générées après les seuils d'absences</p>
    </div>
  </div>

  <div class="table-card">
    <DataTable
      :value="actions"
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

      <Column header="Niveau">
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.niveau_alerte"
            :severity="getNiveauSeverity(slotProps.data.niveau_alerte)"
          />
        </template>
      </Column>

      <Column header="Type d'action">
        <template #body="slotProps">
          <span v-if="slotProps.data.niveau_alerte === 'RAPPEL'">
            Rappel de l'obligation d'assiduité
          </span>

          <span v-if="slotProps.data.niveau_alerte === 'AVERTISSEMENT'">
            Avertissement
          </span>

          <span v-if="slotProps.data.niveau_alerte === 'SANCTION'">
           Convocation direction / moyennes des UE non calculées
          </span>
        </template>
      </Column>
      
      <Column header="Moyen d'envoi">
        <template #body="slotProps">
          <span v-if="slotProps.data.niveau_alerte === 'RAPPEL'">
           Mail par le Directeur des Etudes 
          </span>

          <span v-if="slotProps.data.niveau_alerte === 'AVERTISSEMENT'">
            Courier recommandé avec AR ou remise en main propre
          </span>

          <span v-if="slotProps.data.niveau_alerte === 'SANCTION'">
           Lettre recommandée avec avis de réception / SAE
          </span>
        </template>
      </Column>

      <Column header="Date envoi">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.dateEnvoi) }}
        </template>
      </Column>

      <Column header="Statut">
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.statut_action"
            :severity="getStatusSeverity(slotProps.data.statut_action)"
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
              title="Voir le détail"
              v-tooltip.top="'Voir le détail'"
              @click="voirAction(slotProps.data)"
            />
            <Button
              
              icon="pi pi-pencil"
              rounded
              text
              title="Modifier l'action"
              v-tooltip.top="'Modifier l\'action'"
              severity="warning"
              @click="modifierAction(slotProps.data)"
            />

            <Button
              v-if="slotProps.data.niveau_alerte !== 'SANCTION'"
              icon="pi pi-file-edit"
              rounded
              text
              title="Préparer un courrier"
              v-tooltip.top="'Préparer un courrier'"
              severity="info"
              @click="preparerCourrier(slotProps.data)"
            />

            <Button
              v-if="slotProps.data.statut_action === 'A_TRAITER'"
              icon="pi pi-check"
              severity="success"
              rounded
              text
              title="Marquer comme traitée"
              v-tooltip.top="'Marquer comme traitée'"
              @click="traiterAction(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
  <Dialog
        v-model:visible="showDialog"
        modal
        header="Détail de l'action"
        :style="{ width: '700px' }"
    >
        <div v-if="selectedAction">

            <div class="detail-grid">

                <div>
                    <strong>Type d'action</strong>
                    <p>{{ selectedAction.niveau_alerte }}</p>
                </div>

                <div>
                    <strong>Statut</strong>
                    <p>{{ selectedAction.statut_action }}</p>
                </div>

                <div>
                    <strong>Moyen d'envoi</strong>
                    <p>{{ selectedAction.moyenEnvoi }}</p>
                </div>

                <div>
                    <strong>Date d'envoi</strong>
                    <p>{{ formatDate(selectedAction.dateEnvoi) }}</p>
                </div>

                <div>
                    <strong>Accusé réception</strong>
                    <p>
                        {{
                            selectedAction.accuse_reception
                            ? 'Oui'
                            : 'Non'
                        }}
                    </p>
                </div>

                <div>
                    <strong>Remise main propre</strong>
                    <p>
                        {{
                            selectedAction.remise_main_propre
                            ? 'Oui'
                            : 'Non'
                        }}
                    </p>
                </div>

                <div>
                    <strong>Signature</strong>
                    <p>
                        {{
                            selectedAction.signature_action
                            ? 'Oui'
                            : 'Non'
                        }}
                    </p>
                </div>

            </div>

            <div class="commentaire-box">
                <strong>Commentaire</strong>

                <p>
                    {{
                        selectedAction.commentaire_action ||
                        'Aucun commentaire'
                    }}
                </p>
            </div>

        </div>
    </Dialog>

    <Dialog
      v-model:visible="showEditDialog"
      modal
      header="Traiter le dossier administratif"
      :style="{ width: '700px' }"
    >
    <div class="form-grid">
      <div>
        <label>Statut</label>
        <Select
          v-model="actionForm.statut_action"
          :options="[
            'A_TRAITER',
            'EN_COURS',
            'TERMINEE'
          ]"
        />
      </div>

      <div>
        <label>Moyen d'envoi</label>

        <Select
            v-model="actionForm.moyenEnvoi"
            :options="[
              'Mail',
              'Courrier recommandé avec AR',
              'Remise en main propre'
            ]"
        />
      </div>

        <div>
          <label>Accusé réception</label>

          <Checkbox
            v-model="actionForm.accuse_reception"
            binary
          />
        </div>

        <div>
            <label>Remise main propre</label>

            <Checkbox
              v-model="actionForm.remise_main_propre"
              binary
            />
        </div>

        <div>
          <label>Signature</label>

          <Checkbox
            v-model="actionForm.signature_action"
            binary
          />
        </div>

        <div class="full">
          <label>Commentaire administratif</label>

          <Textarea
            v-model="actionForm.commentaire_action"
            rows="4"
          />
        </div>
      </div>

    <template #footer>

      <Button
        label="Annuler"
        outlined
        @click="showEditDialog=false"
      />

      <Button
        label="Enregistrer"
        icon="pi pi-check"
        @click="sauvegarderAction"
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
    grid-template-columns: repeat(2,1fr);
    gap: 20px;
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
    font-weight: 600;
}

.commentaire-box {
    margin-top: 20px;
    padding: 15px;
    border-radius: 12px;
    background: #f8fafc;
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

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

</style>