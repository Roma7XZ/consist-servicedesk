import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import IncidentsView from '../views/IncidentsView.vue';
import SoftwareView from '../views/SoftwareView.vue';
import UsersView from '../views/UsersView.vue';
import AnalyticsView from '../views/AnalyticsView.vue';
import SettingsView from '../views/SettingsView.vue';

const routes = [
  { path: '/', redirect: '/incidents' },
  { path: '/login', component: LoginView, meta: { layout: 'AuthLayout', requiresAuth: false } },
  { path: '/dashboard', component: DashboardView, meta: { layout: 'MainLayout', requiresAuth: true } },
  { path: '/incidents', component: IncidentsView, meta: { layout: 'MainLayout', requiresAuth: true } },
  { path: '/software', component: SoftwareView, meta: { layout: 'MainLayout', requiresAuth: true } },
  { path: '/users', component: UsersView, meta: { layout: 'MainLayout', requiresAuth: true } },
  { path: '/analytics', component: AnalyticsView, meta: { layout: 'MainLayout', requiresAuth: true } },
  { path: '/settings', component: SettingsView, meta: { layout: 'MainLayout', requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Защита маршрутов
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/incidents');
  } else {
    next();
  }
});

export default router;