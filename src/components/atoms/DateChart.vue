<template>
  <div class="chart-wrapper-enhanced">
    <Line
      :key="chartKey"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const props = defineProps({
  taskAnswers: {
    type: Array,
    default: () => [],
  },
});

const chartKey = ref(0);
const isDataReady = ref(false);

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Answers',
      data: [],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      pointBackgroundColor: '#3B82F6',
      pointBorderColor: '#FFFFFF',
      pointHoverBackgroundColor: '#1E40AF',
      pointHoverBorderColor: '#FFFFFF',
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBorderWidth: 3,
      borderWidth: 3,
      fill: true,
      tension: 0.4,
    },
  ],
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#1F2937',
        usePointStyle: true,
        padding: 20,
        font: {
          size: 14,
          weight: '600',
        },
      },
    },
    tooltip: {
      backgroundColor: '#FFFFFF',
      titleColor: '#1F2937',
      bodyColor: '#1F2937',
      borderColor: '#3B82F6',
      borderWidth: 2,
      cornerRadius: 12,
      displayColors: true,
      padding: 16,
      titleFont: {
        size: 14,
        weight: 'bold',
      },
      bodyFont: {
        size: 13,
      },
      callbacks: {
        title: (tooltipItems) => {
          const timestamp = tooltipItems[0].parsed.x;
          const date = new Date(timestamp);
          return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        },
      },
    },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'week',
        displayFormats: {
          week: 'dd/MM',
        },
      },
      title: {
        display: true,
        text: 'Timeline',
        color: '#6B7280',
        font: {
          size: 14,
          weight: '600',
        },
        padding: 20,
      },
      grid: {
        display: true,
        color: 'rgba(59, 130, 246, 0.1)',
        lineWidth: 1,
      },
      ticks: {
        color: '#6B7280',
        font: {
          size: 12,
          weight: '500',
        },
        padding: 10,
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Number of Answers',
        color: '#6B7280',
        font: {
          size: 14,
          weight: '600',
        },
        padding: 20,
      },
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(59, 130, 246, 0.1)',
        lineWidth: 1,
      },
      ticks: {
        color: '#6B7280',
        font: {
          size: 12,
          weight: '500',
        },
        stepSize: 0.5,
        padding: 10,
      },
    },
  },
  elements: {
    line: {
      borderJoinStyle: 'round',
      borderCapStyle: 'round',
    },
  },
});

const processDataForChart = () => {
  if (!props.taskAnswers || props.taskAnswers.length === 0) {
    chartData.value.datasets[0].data = [];
    chartData.value.labels = [];
    chartOptions.value.scales.y.suggestedMax = 1;
    isDataReady.value = false;
    return;
  }

  const currentDate = new Date();
  const oneMonthsAgo = new Date(currentDate);
  oneMonthsAgo.setMonth(currentDate.getMonth() - 1);

  const filtered = props.taskAnswers.filter(a => a.lastUpdate && !isNaN(new Date(a.lastUpdate).getTime()));
  const validAnswers = filtered.filter(a => {
    const date = new Date(a.lastUpdate);
    return date >= oneMonthsAgo && date <= currentDate;
  });

  const testsPerDay = {};
  const iterator = new Date(oneMonthsAgo);
  while (iterator <= currentDate) {
    const dateStr = iterator.toISOString().split('T')[0];
    testsPerDay[dateStr] = 0;
    iterator.setDate(iterator.getDate() + 1);
  }

  validAnswers.forEach(a => {
    const dateStr = new Date(a.lastUpdate).toISOString().split('T')[0];
    if (testsPerDay[dateStr] !== undefined) {
      testsPerDay[dateStr]++;
    }
  });

  chartData.value.labels = Object.keys(testsPerDay).map(date => new Date(date));
  chartData.value.datasets[0].data = Object.values(testsPerDay);

  const max = Math.max(...Object.values(testsPerDay));
  chartOptions.value.scales.y.suggestedMax = max + 1;
  isDataReady.value = true;
  chartKey.value++;
};

watch(
  () => props.taskAnswers,
  () => {
    processDataForChart();
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.chart-wrapper-enhanced {
  height: 100%;
  width: 100%;
  position: relative;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  padding: 1rem;
}
</style>