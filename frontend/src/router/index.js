import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '../views/loginView.vue';
import DashboardView from '../views/DashboardView.vue';
import { Component } from 'react';

const routes = [
    {
        path: '/',
        Component: LoginView
    },
    {
        path: '/dashboard',
        Component: DashboardView
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;