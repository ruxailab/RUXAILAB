<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  labels: {
    type: Array,
    required: true,
    default: () => []
  },
  data: {
    type: Array,
    required: true,
    default: () => []
  }
})

const chartRef = ref(null)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scale: {
    ticks: {
      suggestedMin: 0,
      suggestedMax: Math.max(...props.data),
      display: true
    }
  },
  legend: {
    display: true,
    labels: {
      fontFamily: 'Roboto',
      fontStyle: 'bold',
      fontSize: 20
    }
  }
}

const chartData = {
  labels: props.labels,
  datasets: [
    {
      label: 'Importance',
      backgroundColor: 'rgba(249, 152, 38, 0.24)',
      borderColor: 'rgba(255, 81, 47, 1)',
      pointBackgroundColor: 'rgba(255, 81, 47, 1)',
      data: props.data
    }
  ]
}

watch(
  () => props.data,
  () => {
    if (chartRef.value) {
      chartRef.value.update()
    }
  },
  { deep: true }
)

onMounted(() => {
  // Assuming a canvas element exists in the parent component
  const canvas = document.getElementById('radar-chart') // Adjust ID as needed
  if (canvas && chartRef.value) {
    chartRef.value.renderChart(chartData, chartOptions)
  }
})
</script>