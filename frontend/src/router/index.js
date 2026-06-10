import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import DossiersView from '../views/DossiersView.vue'
import ActionsView from '../views/ActionView.vue'
import ConvocationsView from '../views/ConvocationsView.vue'
import HistoriqueView from '../views/HistoriqueView.vue'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: LoginView
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        component: DashboardView
      },
      {
        path: 'dossiers',
        component: DossiersView
      },
      {
        path: 'actions',
        component: ActionsView
      },
      {
        path: 'convocations',
        component: ConvocationsView
      },
      {
        path: 'historique',
        component: HistoriqueView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router