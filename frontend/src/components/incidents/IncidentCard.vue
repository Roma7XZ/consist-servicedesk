<script setup>
import { useAuthStore } from '../../stores/authStore';
import { STATUSES, PRIORITIES } from '../../constants/incidentStatus';

const props = defineProps({
  incident: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update-status', 'delete']);
const authStore = useAuthStore();

const onStatusChange = (event) => {
  emit('update-status', props.incident, event.target.value);
};

const onDelete = () => {
  emit('delete', props.incident);
};
</script>

<template>
  <article class="incident-card">
    <div class="card-header">
      <div class="tags">
        <span class="priority" :class="{
          low: incident.priority === PRIORITIES.LOW,
          medium: incident.priority === PRIORITIES.MEDIUM,
          high: incident.priority === PRIORITIES.HIGH,
          critical: incident.priority === PRIORITIES.CRITICAL,
        }">
          {{ incident.priority }}
        </span>
        <span class="status-badge" :data-status="incident.status">{{ incident.status }}</span>
      </div>
      <span class="date">{{ new Date(incident.createdAt).toLocaleDateString() }}</span>
    </div>

    <h3 class="card-title">{{ incident.title }}</h3>
    <p class="description">{{ incident.description || 'Описание отсутствует' }}</p>

    <div class="card-footer">
      <div class="meta-info">
        <span class="category-tag">{{ incident.category }}</span>
        <span v-if="incident.author" class="author">От: {{ incident.author.name }}</span>
      </div>

      <div v-if="authStore.isAdmin || authStore.isAnalyst" class="actions">
        <select class="status-select" :value="incident.status" @change="onStatusChange">
          <option v-for="status in Object.values(STATUSES)" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
        <button v-if="authStore.isAdmin" class="btn-icon-danger" @click="onDelete" title="Удалить">
          🗑️
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* Сюда переносим все стили .incident-card, .card-header, .priority и т.д. из IncidentsView.vue */
.incident-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}
.incident-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.tags { display: flex; gap: 0.5rem; }
.priority { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 999px; text-transform: uppercase; }
.priority.low { background: #dcfce7; color: #166534; }
.priority.medium { background: #fef3c7; color: #92400e; }
.priority.high { background: #ffedd5; color: #c2410c; }
.priority.critical { background: #fee2e2; color: #991b1b; }
.status-badge { font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 999px; background: var(--surface-hover); border: 1px solid var(--border); color: var(--text-muted); }
.status-badge[data-status="Открыт"] { background: var(--primary-soft); color: var(--primary); border-color: transparent; }
.status-badge[data-status="В работе"] { background: #fef3c7; color: #d97706; border-color: transparent; }
.status-badge[data-status="Решен"] { background: #dcfce7; color: #10b981; border-color: transparent; }
.date { font-size: 0.8rem; color: var(--text-muted); }
.card-title { margin: 0 0 0.5rem; font-size: 1.15rem; color: var(--text); line-height: 1.4; }
.description { color: var(--text-muted); font-size: 0.95rem; line-height: 1.5; margin: 0 0 1.5rem; flex: 1; }
.card-footer { border-top: 1px solid var(--border); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; }
.meta-info { display: flex; flex-direction: column; gap: 0.25rem; }
.category-tag { font-size: 0.8rem; font-weight: 600; color: var(--primary); }
.author { font-size: 0.8rem; color: var(--text-muted); }
.actions { display: flex; align-items: center; gap: 0.5rem; }
.status-select { padding: 0.4rem; font-size: 0.85rem; }
.btn-icon-danger { padding: 0.4rem; border-radius: var(--radius-md); background: var(--danger-soft); color: var(--danger); border: none; cursor: pointer; }
.btn-icon-danger:hover { background: #fca5a5; }
</style>