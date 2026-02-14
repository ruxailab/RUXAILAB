<template>
  <div>
    <Radar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Radar } from 'vue-chartjs'
import { ref, computed, watch } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
} from 'chart.js'
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
)

const props = defineProps({
  labels: {
    type: Array,
    required: true,
    default: () => [],
  },
  data: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Usability Percentage ',
      backgroundColor: 'rgba(249, 152, 38, 0.24)',
      borderColor: 'rgba(255, 81, 47, 1)',
      pointBackgroundColor: 'rgba(255, 81, 47, 1)',
      data: props.data,
    },
  ],
}))

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scale: {
    ticks: {
      suggestedMin: 0,
      suggestedMax: 100,
    },
  },
})

const chartInstance = ref(null)
watch(
  () => props.data,
  () => {
    if (chartInstance.value) {
      chartInstance.value.update()
    }
  },
  { deep: true },
)

// onMounted(() => {
//   // The Radar component handles rendering internally
// })
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
