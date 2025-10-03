<template>
  <Bar
    :data="chartData"
    :options="chartOptions"
    style="height: 400px;"
  />
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale
)

const props = defineProps({
  labels: {
    type: String,
    default: 'Data One'
  },
  data: {
    type: Array,
    default: () => []
  },
  legend: {
    type: String,
    default: 'Legend'
  }
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.legend,
      backgroundColor: '#f87979',
      data: props.data
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}
</script>