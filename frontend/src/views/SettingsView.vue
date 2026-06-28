<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

// Локальное состояние настроек
const theme = ref(localStorage.getItem('theme') || 'light');
const emailNotifications = ref(true);

const saveSettings = () => {
  // Применяем тему к документу и сохраняем в localStorage
  document.documentElement.dataset.theme = theme.value;
  localStorage.setItem('theme', theme.value);
  
  // Имитация сохранения остальных настроек
  alert('Настройки успешно сохранены!');
};
</script>

<template>
  <div class="settings-view">
    <header class="page-header">
      <h2>Настройки системы</h2>
      <p class="subtitle">Управление профилем и параметрами приложения</p>
    </header>

    <div class="settings-grid">
      <section class="settings-card">
        <h3>Профиль пользователя</h3>
        <div class="form-group">
          <label>Имя</label>
          <input type="text" :value="authStore.user?.name" disabled class="disabled-input" />
          <small class="help-text">Изменение имени доступно только администратору.</small>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" :value="authStore.user?.email" disabled class="disabled-input" />
        </div>
        <div class="form-group">
          <label>Роль в системе</label>
          <input type="text" :value="authStore.user?.role" disabled class="disabled-input" />
        </div>
      </section>

      <section class="settings-card">
        <h3>Параметры отображения</h3>
        <div class="form-group">
          <label>Тема оформления</label>
          <select v-model="theme" class="select-input">
            <option value="light">Светлая тема (По умолчанию)</option>
            <option value="dark">Тёмная тема</option>
          </select>
        </div>

        <h3 class="mt-4">Уведомления</h3>
        <div class="toggle-group">
          <label class="toggle-label">
            <input type="checkbox" v-model="emailNotifications" class="toggle-checkbox" />
            <span class="toggle-text">Получать уведомления на Email при изменении статуса заявок</span>
          </label>
        </div>

        <div class="form-actions">
          <button class="btn-primary" @click="saveSettings">Сохранить изменения</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 2rem;
  color: var(--text);
  margin: 0 0 0.5rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.05rem;
  margin: 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.settings-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.settings-card h3 {
  margin: 0 0 1.5rem;
  color: var(--text);
  font-size: 1.25rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.75rem;
}

.mt-4 {
  margin-top: 2.5rem !important;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text);
  font-size: 0.95rem;
}

input[type="text"],
input[type="email"],
.select-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg);
  color: var(--text);
  transition: border-color 0.2s;
}

.disabled-input {
  background: var(--surface-soft) !important;
  color: var(--text-muted) !important;
  cursor: not-allowed;
}

.help-text {
  display: block;
  margin-top: 0.4rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

/* Кастомный чекбокс-тогл */
.toggle-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  font-weight: normal;
}

.toggle-checkbox {
  width: 20px;
  height: 20px;
  accent-color: var(--primary);
  cursor: pointer;
}

.toggle-text {
  color: var(--text);
  line-height: 1.4;
}

.form-actions {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  text-align: right;
}

.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: var(--primary-hover);
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>