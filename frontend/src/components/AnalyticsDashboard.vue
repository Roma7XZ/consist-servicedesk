<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { useIncidentStore } from '../stores/incidentStore';

const incidentStore = useIncidentStore();

// Ссылки на элементы <canvas> в HTML
const statusChartRef = ref(null);
const categoryChartRef = ref(null);

// Переменные для хранения экземпляров графиков
let statusChart = null;
let categoryChart = null;

// Функция для перерисовки графиков
const renderCharts = () => {
  if (!incidentStore.incidents.length) return;

  // 1. Подготавливаем данные (считаем количество)
  const statusCounts = { 'Открыт': 0, 'В работе': 0, 'Решен': 0, 'Закрыт': 0 };
  const categoryCounts = { 'ПО': 0, 'Оборудование': 0, 'Сеть': 0, 'ИБ': 0 };

  incidentStore.incidents.forEach(inc => {
    if (statusCounts[inc.status] !== undefined) statusCounts[inc.status]++;
    if (categoryCounts[inc.category] !== undefined) categoryCounts[inc.category]++;
  });

  // Уничтожаем старые графики перед отрисовкой новых (чтобы не наслаивались)
  if (statusChart) statusChart.destroy();
  if (categoryChart) categoryChart.destroy();

  // 2. Рисуем график по статусам (Bar Chart)
  statusChart = new Chart(statusChartRef.value, {
    type: 'bar',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        label: 'Количество заявок',
        data: Object.values(statusCounts),
        backgroundColor: ['#60a5fa', '#fbb32a', '#34d399', '#9ca3af'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Заявки по статусам', font: { size: 16 } }
      }
    }
  });

  // 3. Рисуем график по категориям (Doughnut Chart)
  categoryChart = new Chart(categoryChartRef.value, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categoryCounts),
      datasets: [{
        data: Object.values(categoryCounts),
        backgroundColor: ['#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Распределение по категориям', font: { size: 16 } }
      }
    }
  });
};

// Следим за изменениями в Pinia: если массив заявок изменится, перерисовываем!
watch(() => incidentStore.incidents, renderCharts, { deep: true });

// Рисуем графики при первой загрузке компонента
onMounted(() => {
  // Небольшая задержка, чтобы DOM успел отрендерить canvas
  setTimeout(renderCharts, 100);
});
</script>

<template>
  <div class="analytics-panel">
    <div class="chart-container">
      <canvas ref="statusChartRef"></canvas>
    </div>
    <div class="chart-container">
      <canvas ref="categoryChartRef"></canvas>
    </div>
  </div>
</template>

<style scoped>
.analytics-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.chart-container {
  flex: 1;
  min-width: 300px;
  position: relative;
  height: 300px;
  display: flex;
  justify-content: center;
}
</style>