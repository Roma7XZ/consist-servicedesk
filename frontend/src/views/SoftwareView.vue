<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import api from '../plugins/axios';
import { getErrorMessage } from '../services/api';

const authStore = useAuthStore();

const softwareList = ref([]);
const loading = ref(false);
const error = ref(null);
const showForm = ref(false);
const submitting = ref(false);

// Состояние формы для новой записи
const newAsset = ref({
  name: '',
  version: '',
  type: 'ПО',
  licenseKey: '',
  status: 'Активна'
});

// Загрузка данных с бэкенда
const fetchSoftware = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get('/software');
    softwareList.value = response.data;
  } catch (err) {
    error.value = getErrorMessage(err, 'Не удалось загрузить реестр ПО');
  } finally {
    loading.value = false;
  }
};

// Отправка формы на сервер
const submitForm = async () => {
  if (!newAsset.value.name.trim()) return;
  
  submitting.value = true;
  try {
    const response = await api.post('/software', newAsset.value);
    softwareList.value.unshift(response.data); // Добавляем в начало таблицы
    
    // Сброс формы
    newAsset.value = { name: '', version: '', type: 'ПО', licenseKey: '', status: 'Активна' };
    showForm.value = false;
  } catch (err) {
    alert(getErrorMessage(err, 'Не удалось добавить позицию'));
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchSoftware();
});
</script>

<template>
  <div class="software-view">
    <header class="page-header">
      <div>
        <h2>Учет ПО и Оборудования</h2>
        <p class="subtitle">Реестр корпоративных лицензий, импортозамещенного софта и техники</p>
      </div>
      
      <button 
        v-if="authStore.isAdmin || authStore.isEngineer" 
        class="btn-primary"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'К списку ресурсов' : '➕ Добавить ресурс' }}
      </button>
    </header>

    <transition name="fade" mode="out-in">
      <div v-if="showForm" class="form-container" key="form">
        <form @submit.prevent="submitForm" class="modern-form">
          <div class="form-group">
            <label for="name">Название ПО или оборудования</label>
            <input id="name" v-model="newAsset.name" type="text" placeholder="Например: Astra Linux Special Edition" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="version">Версия / Модель</label>
              <input id="version" v-model="newAsset.version" type="text" placeholder="Например: 1.7" />
            </div>

            <div class="form-group">
              <label for="type">Тип ресурса</label>
              <select id="type" v-model="newAsset.type">
                <option>ПО</option>
                <option>Оборудование</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="key">Лицензионный ключ / Инвентарный номер</label>
            <input id="key" v-model="newAsset.licenseKey" type="text" placeholder="XXXX-XXXX-XXXX-XXXX или ИНВ-00234" />
          </div>

          <div class="form-actions">
            <button class="btn-secondary" type="button" @click="showForm = false">Отмена</button>
            <button class="btn-primary" type="submit" :disabled="submitting">
              {{ submitting ? 'Сохранение...' : 'Добавить в реестр' }}
            </button>
          </div>
        </form>
      </div>

      <div v-else class="table-container" key="list">
        <div v-if="loading" class="state-panel">Загрузка данных из реестра...</div>
        <div v-else-if="error" class="state-panel error">{{ error }}</div>
        <div v-else-if="!softwareList.length" class="state-panel">В реестре пока нет записей.</div>

        <table v-else class="corporate-table">
          <thead>
            <tr>
              <th>Наименование</th>
              <th>Версия/Модель</th>
              <th>Тип</th>
              <th>Лицензия / Инв. №</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in softwareList" :key="asset.id">
              <td><strong>{{ asset.name }}</strong></td>
              <td class="text-muted">{{ asset.version || '—' }}</td>
              <td>
                <span class="type-badge" :class="asset.type === 'ПО' ? 'soft' : 'hard'">
                  {{ asset.type }}
                </span>
              </td>
              <td class="license-cell"><code>{{ asset.licenseKey || 'Без ключа' }}</code></td>
              <td>
                <span class="status-tag" :data-status="asset.status">{{ asset.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
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
.page-header h2 { font-size: 2rem; color: var(--text); margin: 0 0 0.5rem; }
.subtitle { color: var(--text-muted); font-size: 1.05rem; margin: 0; }

.form-container {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  max-width: 700px;
  margin: 0 auto;
  box-shadow: var(--shadow-sm);
}
.form-group { margin-bottom: 1.5rem; }
.form-row { display: flex; gap: 1.5rem; }
.form-row .form-group { flex: 1; }
label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--text); }
input, select { width: 100%; padding: 0.875rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg); color: var(--text); }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }

.table-container { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); }
.corporate-table { width: 100%; border-collapse: collapse; text-align: left; }
.corporate-table th, .corporate-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); }
.corporate-table th { background: var(--surface-hover); color: var(--text-muted); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
.corporate-table tbody tr:hover { background: var(--surface-hover); }

.type-badge { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 999px; }
.type-badge.soft { background: var(--primary-soft); color: var(--primary); }
.type-badge.hard { background: #fef3c7; color: #d97706; }

.license-cell code { font-family: monospace; background: var(--bg); padding: 0.2rem 0.4rem; border-radius: 4px; color: var(--text); }
.status-tag { font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 999px; background: var(--border); color: var(--text-muted); }
.status-tag[data-status="Активна"] { background: #dcfce7; color: #10b981; }

.state-panel { padding: 3rem; text-align: center; color: var(--text-muted); }
.btn-primary, .btn-secondary { padding: 0.75rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; border: none; cursor: pointer; }
.btn-primary { background: var(--primary); color: white; }
.btn-secondary { background: var(--surface-hover); color: var(--text); border: 1px solid var(--border); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>