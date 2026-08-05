<script setup>
import { ref } from 'vue'

import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Tag from 'primevue/tag'

const activeTab = ref('0')

const roles = [
  {
    nom: 'Secrétaire',
    description: 'Gestion du suivi administratif courant.',
    permissions: [
      'Consulter les absences',
      'Consulter les dossiers administratifs',
      'Préparer et envoyer les courriers administratifs',
      'Consulter l’historique administratif'
    ]
  },
  {
    nom: 'Chef de département / Direction',
    description: 'Supervision et validation des actions importantes.',
    permissions: [
      'Consulter tous les dossiers',
      'Valider les décisions importantes',
      'Superviser les courriers administratifs',
      'Clôturer un dossier'
    ]
  }
]

const seuils = [
  {
    nom: 'Rappel',
    valeur: 2,
    description: 'Déclenchement d’un rappel d’assiduité.'
  },
  {
    nom: 'Avertissement',
    valeur: 4,
    description: 'Déclenchement d’un avertissement administratif.'
  },
  {
    nom: 'Sanction',
    valeur: 5,
    description: 'Transmission du dossier à la direction.'
  }
]

const infosApplication = [
  { label: 'Version', valeur: '1.0' },
  { label: 'Année universitaire', valeur: '2025-2026' },
  { label: 'Frontend', valeur: 'Vue.js / PrimeVue' },
  { label: 'Backend', valeur: 'Node.js / Express' },
  { label: 'Base de données', valeur: 'PostgreSQL' },
  { label: 'Source des absences', valeur: 'ScoDoc simulé' },
  { label: 'Authentification', valeur: 'Locale actuellement / CAS prévu' },
  { label: 'Département', valeur: 'Informatique - IUT Nord Franche-Comté' }
]
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Administration</h1>
      <p>Paramètres généraux de l'application</p>
    </div>
  </div>

  <div class="summary-card">
    <div>
      <h2>Application de suivi administratif des absences</h2>
      <p>
        Module de configuration et de consultation des paramètres utilisés
        dans le suivi des absences injustifiées.
      </p>
    </div>

    <Tag value="Version 1.0" severity="info" />
  </div>

  <div class="admin-card">
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="0">Utilisateurs</Tab>
        <Tab value="1">Rôles et permissions</Tab>
        <Tab value="2">Seuils</Tab>
        <Tab value="3">Application</Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="0">
          <h2>Utilisateurs</h2>

          <p class="muted">
            L’authentification actuelle est une simulation locale.
            Dans une version finale, les comptes pourraient être gérés
            par le CAS universitaire.
          </p>

          <div class="info-box">
            <strong>Secrétaire</strong>
            <p>Utilisateur chargé du suivi administratif quotidien.</p>
            <Tag value="Rôle actif" severity="success" />
          </div>

          <div class="info-box">
            <strong>Chef de département / Direction</strong>
            <p>Utilisateur chargé de la supervision et des validations importantes.</p>
            <Tag value="Rôle prévu" severity="info" />
          </div>
        </TabPanel>

        <TabPanel value="1">
          <h2>Rôles et permissions</h2>

          <div
            v-for="role in roles"
            :key="role.nom"
            class="role-card"
          >
            <h3>{{ role.nom }}</h3>
            <p>{{ role.description }}</p>

            <ul>
              <li
                v-for="permission in role.permissions"
                :key="permission"
              >
                {{ permission }}
              </li>
            </ul>
          </div>
        </TabPanel>

        <TabPanel value="2">
          <h2>Seuils administratifs</h2>

          <p class="muted">
            Les seuils permettent de déterminer automatiquement le niveau
            de traitement administratif à appliquer à un étudiant.
          </p>

          <div class="seuil-grid">
            <div
              v-for="seuil in seuils"
              :key="seuil.nom"
              class="seuil-card"
            >
              <h3>{{ seuil.nom }}</h3>
              <strong>{{ seuil.valeur }}</strong>
              <span>absence(s) injustifiée(s)</span>
              <p>{{ seuil.description }}</p>
            </div>
          </div>

          <div class="workflow-box">
            <h3>Logique métier appliquée</h3>

            <div class="workflow-line">
              <span>2 absences</span>
              <i class="pi pi-arrow-right"></i>
              <strong>Rappel d’assiduité</strong>
            </div>

            <div class="workflow-line">
              <span>4 absences</span>
              <i class="pi pi-arrow-right"></i>
              <strong>Avertissement administratif</strong>
            </div>

            <div class="workflow-line">
              <span>5 absences</span>
              <i class="pi pi-arrow-right"></i>
              <strong>Sanction / Direction</strong>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="3">
          <h2>Configuration de l'application</h2>

          <div class="settings-grid">
            <div
              v-for="info in infosApplication"
              :key="info.label"
            >
              <strong>{{ info.label }}</strong>
              <p>{{ info.valeur }}</p>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
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

.page-header p,
.muted {
  margin-top: 8px;
  color: #64748b;
}

.summary-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 24px 28px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-card h2 {
  margin: 0;
}

.summary-card p {
  margin: 8px 0 0;
  color: #64748b;
}

.admin-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 28px;
}

h2 {
  margin-top: 0;
}

.info-box,
.role-card,
.seuil-card,
.workflow-box,
.settings-grid div {
  background: #f8fafc;
  border-radius: 14px;
  padding: 18px;
  margin-top: 18px;
}

.info-box p,
.role-card p,
.seuil-card p,
.settings-grid p {
  color: #64748b;
}

.role-card ul {
  margin-bottom: 0;
}

.role-card li {
  margin: 8px 0;
}

.seuil-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.seuil-card strong {
  display: block;
  font-size: 38px;
  color: #e6332a;
}

.seuil-card span {
  color: #64748b;
  font-size: 14px;
}

.workflow-box {
  margin-top: 28px;
}

.workflow-line {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-top: 1px solid #e5e7eb;
}

.workflow-line:first-of-type {
  border-top: none;
}

.workflow-line span {
  color: #64748b;
  min-width: 110px;
}

.workflow-line i {
  color: #e6332a;
}

.workflow-line strong {
  color: #111827;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

:deep(.p-tab-active) {
  color: #e6332a;
}

:deep(.p-tablist-active-bar) {
  background: #e6332a;
}
</style>