<script setup>
import { Bar } from 'vue-chartjs'
import { computed, defineProps, watch, onMounted, ref } from 'vue'

// Define props with the same structure as in the Options API
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

// Computed property for chart data
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

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}

// Reference to the Bar component instance
const barChart = ref(null)

// Function to render the chart
const renderChart = () => {
  if (barChart.value) {
    barChart.value.renderChart(chartData.value, chartOptions)
  }
}

// Watch for changes in data prop and re-render chart
watch(
  () => props.data,
  () => {
    renderChart()
  },
  { deep: true } // Deep watch to handle array changes
)

// Render chart on mount
onMounted(() => {
  renderChart()
})
</script>