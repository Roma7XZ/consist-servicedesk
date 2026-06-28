import { defineStore } from 'pinia';
import api from '../plugins/axios'; // Правильный импорт нашего перехватчика
import { getErrorMessage } from '../services/api';

export const useIncidentStore = defineStore('incidentStore', {
  state: () => ({
    incidents: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchIncidents() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/incidents');
        this.incidents = response.data;
      } catch (error) {
        console.error(error);
        this.error = getErrorMessage(error, 'Не удалось загрузить инциденты');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createIncident(incidentData) {
      this.error = null;

      try {
        const response = await api.post('/incidents', incidentData);
        // Добавляем в начало списка
        this.incidents.unshift(response.data);
        return response.data;
      } catch (error) {
        console.error(error);
        this.error = getErrorMessage(error, 'Ошибка при создании заявки');
        throw error;
      }
    },

    async updateIncident(id, data) {
      this.error = null;

      try {
        const response = await api.patch(`/incidents/${id}`, data);

        const index = this.incidents.findIndex(
          (incident) => incident.id === id
        );

        if (index !== -1) {
          this.incidents[index] = response.data;
        }

        return response.data;
      } catch (error) {
        console.error(error);
        this.error = getErrorMessage(error, 'Ошибка при обновлении заявки');
        throw error;
      }
    },

    async deleteIncident(id) {
      this.error = null;

      try {
        await api.delete(`/incidents/${id}`);

        this.incidents = this.incidents.filter(
          (incident) => incident.id !== id
        );
      } catch (error) {
        console.error(error);
        this.error = getErrorMessage(error, 'Ошибка при удалении заявки');
        throw error;
      }
    },

    clearIncidents() {
      this.incidents = [];
      this.error = null;
      this.loading = false;
    },
  },
});