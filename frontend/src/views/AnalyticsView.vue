<script setup>
import { useAuthStore } from '../stores/authStore';
import AnalyticsDashboard from '../components/AnalyticsDashboard.vue';

const authStore = useAuthStore();
</script>

<template>
  <div class="view-container">
    <header class="page-header">
      <h2>Расширенная аналитика</h2>
      <p class="subtitle">Детальный отчет по инцидентам и загруженности отдела</p>
    </header>

    <div class="content">
      <AnalyticsDashboard v-if="authStore.isAdmin || authStore.isAnalyst" />
      
      <div v-else class="empty-state">
        <span class="icon">🔒</span>
        <h3>Доступ закрыт</h3>
        <p>У вашей роли нет прав для просмотра аналитических данных.</p>
      </div>
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
}
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
}
.empty-state .icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}
.empty-state h3 { color: var(--text); margin-bottom: 0.5rem; }
.empty-state p { color: var(--text-muted); }
</style>