<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import api from '../plugins/axios';
import { getErrorMessage } from '../services/api';

const authStore = useAuthStore();

const users = ref([]);
const loading = ref(false);
const error = ref(null);
const showForm = ref(false);
const submitting = ref(false);

const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'ENGINEER'
});

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get('/users');
    users.value = response.data;
  } catch (err) {
    error.value = getErrorMessage(err, 'Не удалось загрузить список пользователей');
  } finally {
    loading.value = false;
  }
};

const submitUser = async () => {
  if (!newUser.value.name || !newUser.value.email || !newUser.value.password) return;
  
  submitting.value = true;
  try {
    const response = await api.post('/auth/register', newUser.value);
    
    // Добавляем созданного пользователя в таблицу визуально
    users.value.unshift({ ...response.data, status: 'Активен' });
    
    // Сброс формы
    newUser.value = { name: '', email: '', password: '', role: 'ENGINEER' };
    showForm.value = false;
  } catch (err) {
    alert(getErrorMessage(err, 'Не удалось создать пользователя'));
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  if (authStore.isAdmin) {
    fetchUsers();
  }
});
</script>

<template>
  <div class="users-view">
    <header class="page-header">
      <div>
        <h2>Сотрудники и доступы</h2>
        <p class="subtitle">Управление учетными записями пользователей системы</p>
      </div>
      
      <button 
        v-if="authStore.isAdmin" 
        class="btn-primary"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'К списку сотрудников' : '➕ Добавить пользователя' }}
      </button>
    </header>

    <div v-if="!authStore.isAdmin" class="state-panel error">
      У вас нет прав для просмотра этого раздела. Доступ разрешен только администраторам.
    </div>

    <template v-else>
      <transition name="fade" mode="out-in">
        <div v-if="showForm" class="form-container" key="form">
          <form @submit.prevent="submitUser" class="modern-form">
            <div class="form-group">
              <label for="name">ФИО сотрудника</label>
              <input id="name" v-model.trim="newUser.name" type="text" placeholder="Например: Иванов Иван Иванович" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email">Корпоративный Email</label>
                <input id="email" v-model.trim="newUser.email" type="email" placeholder="ivanov@consist.local" required />
              </div>

              <div class="form-group">
                <label for="role">Роль в системе</label>
                <select id="role" v-model="newUser.role">
                  <option value="ADMIN">Администратор</option>
                  <option value="ENGINEER">Инженер</option>
                  <option value="ANALYST">Аналитик</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="password">Временный пароль</label>
              <input id="password" v-model="newUser.password" type="password" placeholder="Минимум 6 символов" minlength="6" required />
            </div>

            <div class="form-actions">
              <button class="btn-secondary" type="button" @click="showForm = false">Отмена</button>
              <button class="btn-primary" type="submit" :disabled="submitting">
                {{ submitting ? 'Создание...' : 'Зарегистрировать' }}
              </button>
            </div>
          </form>
        </div>

        <div v-else class="table-container" key="list">
          <div v-if="loading" class="state-panel">Загрузка данных из базы...</div>
          <div v-else-if="error" class="state-panel error">{{ error }}</div>
          
          <table v-else class="corporate-table">
            <thead>
              <tr>
                <th>Сотрудник</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="user-cell">
                    <div class="avatar-mini">{{ user.name.charAt(0) }}</div>
                    <strong>{{ user.name }}</strong>
                  </div>
                </td>
                <td class="text-muted">{{ user.email }}</td>
                <td>
                  <span class="role-badge" :class="user.role.toLowerCase()">
                    {{ user.role === 'ADMIN' ? 'Администратор' : user.role === 'ENGINEER' ? 'Инженер' : 'Аналитик' }}
                  </span>
                </td>
                <td>
                  <span class="status-dot" :class="{ active: user.status === 'Активен' }"></span>
                  {{ user.status }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </transition>
    </template>
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

.user-cell { display: flex; align-items: center; gap: 0.75rem; }
.avatar-mini { width: 32px; height: 32px; background: var(--primary-soft); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem; }
.text-muted { color: var(--text-muted); }

.role-badge { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 999px; background: var(--surface-hover); border: 1px solid var(--border); }
.role-badge.admin { background: var(--danger-soft); color: var(--danger); border-color: transparent; }
.role-badge.engineer { background: var(--primary-soft); color: var(--primary); border-color: transparent; }
.role-badge.analyst { background: #fef3c7; color: #d97706; border-color: transparent; }

.status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); margin-right: 0.5rem; }
.status-dot.active { background: var(--success); }

.state-panel { padding: 3rem; text-align: center; color: var(--text-muted); }
.state-panel.error { background: var(--danger-soft); color: var(--danger); border: 1px dashed var(--danger); border-radius: var(--radius-lg); }

.btn-primary, .btn-secondary { padding: 0.75rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; border: none; cursor: pointer; }
.btn-primary { background: var(--primary); color: white; }
.btn-secondary { background: var(--surface-hover); color: var(--text); border: 1px solid var(--border); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>