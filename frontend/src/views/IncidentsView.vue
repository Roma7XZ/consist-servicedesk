<script setup>
// ДОБАВЛЕН ИМПОРТ onMounted
import { ref, computed, onMounted } from 'vue'; 
import { useAuthStore } from '../stores/authStore';
import { useIncidentStore } from '../stores/incidentStore';
import { getErrorMessage } from '../services/api';
import IncidentCard from '../components/incidents/IncidentCard.vue'

const authStore = useAuthStore();
const incidentStore = useIncidentStore();

// Управление видимостью формы
const showForm = ref(false);
const submittingIncident = ref(false);

// ВАЖНО: Запрашиваем данные с бэкенда при загрузке страницы!
onMounted(async () => {
  try {
    // Вызываем метод загрузки из твоего store
    await incidentStore.fetchIncidents(); 
  } catch (error) {
    console.error('Ошибка при первичной загрузке заявок:', error);
  }
});

const getEmptyIncident = () => ({
  title: '',
  description: '',
  category: 'ПО',
  priority: 'Средний',
});

const newIncident = ref(getEmptyIncident());

const isIncidentFormValid = computed(() => {
  return (
    newIncident.value.title.trim().length > 0 &&
    newIncident.value.description.trim().length > 0
  );
});

const submitIncident = async () => {
  if (!isIncidentFormValid.value) {
    alert('Заполни заголовок и описание.');
    return;
  }

  submittingIncident.value = true;

  try {
    await incidentStore.createIncident({
      ...newIncident.value,
      title: newIncident.value.title.trim(),
      description: newIncident.value.description.trim(),
    });

    const { category, priority } = newIncident.value;
    newIncident.value = { ...getEmptyIncident(), category, priority };
    
    // Скрываем форму после успешного создания
    showForm.value = false;
  } catch (error) {
    alert(getErrorMessage(error, 'Не удалось создать заявку'));
  } finally {
    submittingIncident.value = false;
  }
};

const updateStatus = async (incident, status) => {
  try {
    await incidentStore.updateIncident(incident.id, { status });
  } catch (error) {
    alert(getErrorMessage(error, 'Не удалось изменить статус'));
  }
};

const deleteIncident = async (incident) => {
  const confirmed = confirm(`Удалить заявку "${incident.title}"?`);
  if (!confirmed) return;

  try {
    await incidentStore.deleteIncident(incident.id);
  } catch (error) {
    alert(getErrorMessage(error, 'Не удалось удалить заявку'));
  }
};
</script>

<template>
  <div class="incidents-view">
    <header class="page-header">
      <div>
        <h2>Управление заявками</h2>
        <p class="subtitle">Текущие инциденты и запросы на обслуживание</p>
      </div>
      
      <button 
        class="btn-primary" 
        @click="showForm = !showForm"
      >
        {{ showForm ? 'Вернуться к списку' : '➕ Создать заявку' }}
      </button>
    </header>

    <transition name="fade" mode="out-in">
      <div v-if="showForm" class="form-container" key="form">
        <form @submit.prevent="submitIncident" class="modern-form">
          <div class="form-group">
            <label for="title">Краткий заголовок</label>
            <input
              id="title"
              v-model.trim="newIncident.title"
              type="text"
              maxlength="200"
              placeholder="Например: Не работает печать на принтере"
              required
            />
          </div>

          <div class="form-group">
            <label for="description">Подробное описание</label>
            <textarea
              id="description"
              v-model.trim="newIncident.description"
              rows="5"
              maxlength="2000"
              placeholder="Опишите шаги, приводящие к ошибке..."
              required
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category">Категория системы</label>
              <select id="category" v-model="newIncident.category">
                <option>ПО</option>
                <option>Оборудование</option>
                <option>Сеть</option>
                <option>ИБ</option>
              </select>
            </div>

            <div class="form-group">
              <label for="priority">Уровень критичности</label>
              <select id="priority" v-model="newIncident.priority">
                <option>Низкий</option>
                <option>Средний</option>
                <option>Высокий</option>
                <option>Критический</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-secondary" type="button" @click="showForm = false">Отмена</button>
            <button class="btn-primary" type="submit" :disabled="submittingIncident || !isIncidentFormValid">
              {{ submittingIncident ? 'Отправка...' : 'Зарегистрировать' }}
            </button>
          </div>
        </form>
      </div>

      <div v-else class="list-container" key="list">
        <div v-if="incidentStore.loading" class="state-panel loading">
          Загрузка данных с сервера...
        </div>
        
        <div v-else-if="incidentStore.error" class="state-panel error">
          {{ incidentStore.error }}
        </div>
        
        <div v-else-if="!incidentStore.incidents.length" class="state-panel empty">
          Заявок пока нет. Все системы работают штатно.
        </div>

        <div v-else class="incidents-grid">
          <IncidentCard 
            v-for="incident in incidentStore.incidents" 
            :key="incident.id" 
            :incident="incident"
            @update-status="updateStatus"
            @delete="deleteIncident"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 2rem;
  color: var(--text);
  margin: 0 0 0.5rem;
  letter-spacing: -0.025em;
}

.subtitle {
  color: var(--text-muted);
  margin: 0;
  font-size: 1.05rem;
}

/* =========================================
   ФОРМА
   ========================================= */
.form-container {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  max-width: 800px;
  box-shadow: var(--shadow-sm);
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text);
  font-size: 0.95rem;
}

input, textarea, select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg);
  color: var(--text);
  transition: all 0.2s;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
  background: var(--surface);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--primary-hover); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary { background: var(--surface-hover); color: var(--text); border: 1px solid var(--border); }
.btn-secondary:hover { background: var(--border); }

/* =========================================
   СОСТОЯНИЯ ЗАГРУЗКИ
   ========================================= */
.state-panel {
  padding: 3rem;
  text-align: center;
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border);
  color: var(--text-muted);
}

.state-panel.error {
  color: var(--danger);
  border-color: var(--danger);
  background: var(--danger-soft);
}

/* =========================================
   КАРТОЧКИ ИНЦИДЕНТОВ
   ========================================= */
.incidents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.incident-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.incident-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tags { display: flex; gap: 0.5rem; }

.priority {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  text-transform: uppercase;
}
.priority.low { background: #dcfce7; color: #166534; }
.priority.medium { background: #fef3c7; color: #92400e; }
.priority.high { background: #ffedd5; color: #c2410c; }
.priority.critical { background: #fee2e2; color: #991b1b; }

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  color: var(--text-muted);
}
.status-badge[data-status="Открыт"] { background: var(--primary-soft); color: var(--primary); border-color: transparent; }
.status-badge[data-status="В работе"] { background: #fef3c7; color: #d97706; border-color: transparent; }
.status-badge[data-status="Решен"] { background: #dcfce7; color: #10b981; border-color: transparent; }

.date { font-size: 0.8rem; color: var(--text-muted); }

.card-title {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  color: var(--text);
  line-height: 1.4;
}

.description {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1.5rem;
  flex: 1;
}

.card-footer {
  border-top: 1px solid var(--border);
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-info { display: flex; flex-direction: column; gap: 0.25rem; }
.category-tag { font-size: 0.8rem; font-weight: 600; color: var(--primary); }
.author { font-size: 0.8rem; color: var(--text-muted); }

.actions { display: flex; align-items: center; gap: 0.5rem; }
.status-select { padding: 0.4rem; font-size: 0.85rem; }
.btn-icon-danger {
  padding: 0.4rem;
  border-radius: var(--radius-md);
  background: var(--danger-soft);
  color: var(--danger);
  border: none;
  cursor: pointer;
}
.btn-icon-danger:hover { background: #fca5a5; }

/* Анимации */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>