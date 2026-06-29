<script setup>
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">C</span>
        <span class="logo-text">Consist SD</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/dashboard" class="nav-item">
        <span class="icon">📊</span> Дашборд
      </router-link>
      
      <router-link to="/incidents" class="nav-item">
        <span class="icon">📋</span> Заявки
      </router-link>

      <router-link to="/software" class="nav-item">
        <span class="icon">💻</span> Учет ПО
      </router-link>

      <router-link v-if="authStore.isAdmin" to="/users" class="nav-item">
        <span class="icon">👥</span> Пользователи
      </router-link>

      <router-link to="/analytics" class="nav-item">
        <span class="icon">📈</span> Аналитика
      </router-link>

      <router-link to="/settings" class="nav-item">
        <span class="icon">⚙️</span> Настройки
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-role">
          {{ authStore.user?.role === 'ADMIN' ? 'Администратор' : authStore.user?.role === 'ENGINEER' ? 'Инженер' : 'Аналитик' }}
        </div>
        <div class="user-name">{{ authStore.user?.name || authStore.user?.email || authStore.user?.role }}</div>
      </div>
      
      <button class="btn-action theme-toggle">
        <span class="icon">🎨</span> Тема
      </button>
      
      <button @click="handleLogout" class="btn-action btn-logout">
        <span class="icon">🚪</span> Выйти
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* Цветовая палитра под твой скриншот */
.sidebar {
  width: 260px;
  height: 100vh;
  background-color: #111827; /* Темно-синий фон */
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #1f2937;
  font-family: system-ui, -apple-system, sans-serif;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #1f2937;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  background: #3b82f6;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #f9fafb;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  color: #d1d5db;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: #1f2937;
  color: #f9fafb;
}

/* Активная вкладка из скриншота */
.nav-item.router-link-active {
  background-color: #3b82f6; 
  color: #ffffff;
}

.icon {
  font-size: 1.2rem;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid #1f2937;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-info {
  margin-bottom: 0.5rem;
}

.user-role {
  font-weight: 700;
  color: #f9fafb;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
}

.user-name {
  font-size: 0.85rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #374151;
  background: transparent;
  color: #d1d5db;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #1f2937;
  color: #f9fafb;
}

.btn-logout:hover {
  background: #7f1d1d;
  color: #fca5a5;
  border-color: #991b1b;
}
</style>