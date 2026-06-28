import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import router from '../router';

// Создаем единый экземпляр для всего приложения
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Перехватчик ЗАПРОСОВ: автоматически добавляет токен, если он есть
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Перехватчик ОТВЕТОВ: ловит ошибку 401 (Истек токен) и выкидывает на логин
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;