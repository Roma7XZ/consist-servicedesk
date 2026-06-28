import { defineStore } from 'pinia';
import api from '../plugins/axios'; // Правильный импорт нашего перехватчика
import { getErrorMessage } from '../services/api';

const readUserFromStorage = () => {
  try {
    const rawUser = localStorage.getItem('auth_user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    token: localStorage.getItem('auth_token'),
    user: readUserFromStorage(),
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isAnalyst: (state) => state.user?.role === 'ANALYST',
    isEngineer: (state) => state.user?.role === 'ENGINEER',
  },

  actions: {
    setAuth({ token, user }) {
      this.token = token;
      this.user = user;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    },

    clearAuth() {
      this.token = null;
      this.user = null;
      this.error = null;

      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/auth/login', credentials);
        this.setAuth(response.data);
        return response.data;
      } catch (error) {
        this.error = getErrorMessage(error, 'Не удалось войти');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loadMe() {
      if (!this.token) {
        return null;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/auth/me');
        this.user = response.data;
        localStorage.setItem('auth_user', JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        this.clearAuth();
        this.error = getErrorMessage(error, 'Сессия истекла');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.clearAuth();
    },
  },
});