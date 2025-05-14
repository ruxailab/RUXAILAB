<template>
  <div
    v-if="isDataReady"
    style="height: 400px;"
  >
    <Line
      :key="chartKey"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
  <div v-else>
    Loading...
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  TimeScale
);

const props = defineProps({
  taskAnswers: {
    type: Array,
    default: () => [],
  },
});

const isDataReady = ref(false);
const chartKey = ref(0); // To force chart re-render

const chartData = ref({
  datasets: [
    {
      label: 'Answers',
      data: [],
      borderColor: 'orange',
      borderWidth: 1,
      fill: true,
      tension: 0.2,
      pointRadius: 3,
    },
  ],
});

const chartOptions = ref({
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
        text: 'Date',
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 0.2,
      },
    },
  },
  responsive: true,
  maintainAspectRatio: false,
});

const processDataForChart = () => {
  if (!props.taskAnswers || props.taskAnswers.length === 0) {
    console.warn('taskAnswers is empty or undefined');
    chartData.value.datasets[0].data = [];
    chartOptions.value.scales.y.suggestedMax = 1;
    isDataReady.value = false;
    return;
  }

  const currentDate = new Date();
  const twoMonthsAgo = new Date(currentDate);
  twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

  const filtered = props.taskAnswers.filter(a => a.lastUpdate && !isNaN(new Date(a.lastUpdate).getTime()));
  const validAnswers = filtered.filter(a => {
    const date = new Date(a.lastUpdate);
    return date >= twoMonthsAgo && date <= currentDate;
  });

  const testsPerDay = {};
  const iterator = new Date(twoMonthsAgo);
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

  chartData.value.datasets[0].data = Object.entries(testsPerDay).map(([date, count]) => ({
    x: new Date(date),
    y: count,
  }));

  const max = Math.max(...Object.values(testsPerDay));
  chartOptions.value.scales.y.suggestedMax = max + 1;
  isDataReady.value = true;
  chartKey.value++; // Force chart re-render
};

watch(
  () => props.taskAnswers,
  (newValue) => {
    console.log('taskAnswers updated:', newValue);
    processDataForChart();
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
/* Add component-specific styles here if needed */
</style>