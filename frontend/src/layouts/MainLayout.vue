<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const theme = ref(localStorage.getItem('theme') || 'light');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme.value;
  localStorage.setItem('theme', theme.value);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="app-wrapper">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-icon small">C</div>
        <span class="logo-text">Consist SD</span>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-btn"><span class="icon">📊</span> Дашборд</router-link>
        <router-link to="/incidents" class="nav-btn"><span class="icon">📋</span> Заявки</router-link>
        
        <router-link to="/users" class="nav-btn"><span class="icon">👥</span> Пользователи</router-link>
        <router-link to="/settings" class="nav-btn"><span class="icon">⚙️</span> Настройки</router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <strong>{{ authStore.user?.name }}</strong>
          <small>{{ authStore.user?.role }}</small>
        </div>
        <button class="action-btn" @click="toggleTheme">🎨 Тема</button>
        <button class="action-btn danger" @click="handleLogout">🚪 Выйти</button>
      </div>
    </aside>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

.sidebar {
  width: 260px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--border);
}

.logo-icon.small {
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: bold;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: var(--surface-hover);
}

.nav-btn.router-link-active {
  background: var(--primary-soft);
  color: var(--primary);
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  color: var(--text);
}

.action-btn {
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.action-btn.danger {
  color: var(--danger);
  border-color: var(--danger-soft);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}
</style>