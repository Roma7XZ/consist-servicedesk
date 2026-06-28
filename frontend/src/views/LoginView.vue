<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { getErrorMessage } from '../services/api';

const authStore = useAuthStore();
const router = useRouter();

const loginForm = ref({
  email: 'admin@consist.local',
  password: 'admin12345',
});

const submittingLogin = ref(false);

const submitLogin = async () => {
  submittingLogin.value = true;
  try {
    await authStore.login({
      email: loginForm.value.email.trim(),
      password: loginForm.value.password,
    });
    
    // После успешного входа перенаправляем в систему
    router.push('/incidents');
  } catch (error) {
    alert(getErrorMessage(error, 'Не удалось войти'));
  } finally {
    submittingLogin.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="brand">
      <div class="logo-icon">C</div>
      <h1>Consist ServiceDesk</h1>
      <p>Вход в корпоративную систему</p>
    </div>

    <div class="auth-card">
      <form @submit.prevent="submitLogin">
        <div class="form-group">
          <label for="email">Электронная почта</label>
          <input
            id="email"
            v-model.trim="loginForm.email"
            type="email"
            placeholder="admin@consist.local"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <button class="btn-primary w-full" type="submit" :disabled="submittingLogin">
          {{ submittingLogin ? 'Авторизация...' : 'Войти в систему' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.brand {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: var(--primary);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  margin: 0 auto 1rem;
}

.brand h1 {
  font-size: 1.75rem;
  margin: 0 0 0.5rem;
  color: var(--text);
}

.brand p {
  color: var(--text-muted);
  margin: 0;
}

.auth-card {
  background: var(--surface);
  padding: 2.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
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

input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg);
  color: var(--text);
}

.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.875rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.w-full {
  width: 100%;
}
</style>