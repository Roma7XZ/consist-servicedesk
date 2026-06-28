<script setup>
import { useAuthStore } from '../stores/authStore';
import AnalyticsDashboard from '../components/AnalyticsDashboard.vue';

const authStore = useAuthStore();
</script>

<template>
  <div class="dashboard-view">
    <header class="page-header">
      <h2>Сводная аналитика</h2>
      <p class="subtitle">Статистика обращений и загруженность системы</p>
    </header>

    <AnalyticsDashboard v-if="authStore.isAdmin || authStore.isAnalyst" />
    
    <div v-else class="state-panel">
      У вашей учетной записи нет прав для просмотра аналитического раздела.
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
  margin: 0;
  font-size: 1.05rem;
}

.state-panel {
  padding: 3rem;
  text-align: center;
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border);
  color: var(--text-muted);
}
</style>