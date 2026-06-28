<script setup>
import { ref } from 'vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';

const activeTab = ref('0')

const roles = [
    {
        nom: 'Secrétaire',
        description: 'Gestion du suivi adminidtratif courant',
        Permissions: [
            'Consulter les absences',
            'Consulter les dossiers administratifs',
            'Preparer et envoyer les convocations',
            'Consulter l@historique'
        ]
    },

    {
        nom: 'chef direction',
        description: 'Supervision et validation des actions importantes',
        Permissions: [
            'Consulter tous les dossiers',
            'Valider les décisons importantes',
            'Superviser les convocations',
            'cloturer un dossier'
        ]
    }
]

const seuil = [
    { nom: 'Rappel', valeur: 2, description: 'Rappel Aassiduité'},
    { nom: 'Avertissement', valeur: 4, description: 'Avetissement administratif'},
    { nom: 'Sanction', valeur: 5, description: 'Convocation ou sanction à traiter'},
]
</script>

<template>
    <div class="page-header">
        <div>
            <h1>Adlinistration</h1>
            <p>Paramètres généraux de l'application</p>
        </div>
    </div>

    <div class="admin-card">
        <Tabs v-model:value="activeTab">
            <TabList>
                <Tab value="0">Utilisateurs</Tab>
                <Tab value="1">Rôles et permissions</Tab>
                <Tab value="2">Seuils et parametres</Tab>
            </TabList>

            <TabPanels>
                <TabPanel value="0">
                    <h2>Utilisateur</h2>
                    <p class="muted">
                        L'authentification actuelle est une simulation locale.
                        Dans une version finale, les comptes pourraient être géré par le CAS universitaire.
                    </p>

                    <div class="info_box">
                        <strong>Secrétaire</strong>
                        <p>Utilisateur chargé du suivi administratif quoitidien.</p>
                        <Tag value="Rôle actif" severity="success"/>
                    </div>

                    <div class="info_box">
                        <strong>chef de direction</strong>
                        <p>Utilisateur chargé de la supervision et des validations importantes.</p>
                        <Tag value="Rôle prévu" severity="info"/>
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
                                v-for="permission in permissions"
                            >
                                {{ permission }}
                            </li>
                        </ul>
                    </div>
                </TabPanel>

                <TabPanel value="2">
                    <h2>Seuils administratifs</h2>
                    <div class="seuil-grid">
                        <div
                        v-for="seuil in seuils"
                        :key="seuil.nom"
                        class="seuil-card"
                        >
                            <h3>{{ seuil.nom }}</h3>
                            <strong>{{ seuil.valeur }}</strong>
                            <p>{{ seuil.description }}</p>
                        </div>
                    </div>

                    <h2 class="section-title">Paramètres généraux</h2>

                    <div class="settings-grid">
                        <div>
                            <strong>Année universitaire</strong>
                            <p>2025-2026</p>
                        </div>

                        <div>
                            <strong>Source des absences</strong>
                            <p>ScoDoc</p>
                        </div>

                        <div>
                            <strong>Authentification</strong>
                            <p>CAS universitaire prévu / simulation locale actuelle</p>
                        </div>

                        <div>
                            <strong>Email expéditeur</strong>
                            <p>secretariat-info@iut.fr</p>
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
  font-size: 34px;
  color: #e6332a;
}

.section-title {
  margin-top: 32px;
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