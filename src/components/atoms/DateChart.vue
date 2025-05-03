<script setup>
import { ref, computed, onMounted } from 'vue'
import { Line, mixins } from 'vue-chartjs'

const props = defineProps({
  taskAnswers: {
    type: Array,
    default: () => [],
  },
})

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Answers',
      data: [],
      borderColor: 'orange',
      borderWidth: 1,
      fill: true,
    },
  ],
})

// Chart options
const chartOptions = ref({
  scales: {
    xAxes: [
      {
        type: 'time',
        time: {
          unit: 'week',
          displayFormats: {
            week: 'DD/MM',
          },
        },
        title: {
          display: true,
          text: 'Data',
        },
      },
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
  responsive: true,
  maintainAspectRatio: false,
})

// Process data for chart
const processDataForChart = () => {
  const currentDate = new Date()
  const monthsAgo = new Date(currentDate)
  monthsAgo.setMonth(currentDate.getMonth() - 2)

  const validAnswers = props.taskAnswers.filter((answer) => answer.lastUpdate)
  const filteredAnswers = validAnswers
    .filter((answer) => new Date(answer.lastUpdate) >= monthsAgo)
    .sort((a, b) => new Date(a.lastUpdate) - new Date(b.lastUpdate))

  const testsPerDay = {}
  const currentDateIterator = new Date(monthsAgo)

  // Initialize testsPerDay with zero for all days in the period
  while (currentDateIterator <= currentDate) {
    const dateKey = currentDateIterator.toISOString().split('T')[0]
    testsPerDay[dateKey] = 0
    currentDateIterator.setDate(currentDateIterator.getDate() + 1)
  }

  // Fill testsPerDay with actual data
  filteredAnswers.forEach((answer) => {
    const dateKey = new Date(answer.lastUpdate).toISOString().split('T')[0]
    testsPerDay[dateKey]++
  })

  chartData.value.labels = Object.keys(testsPerDay)
  chartData.value.datasets[0].data = Object.values(testsPerDay)

  // Calculate max tests and add padding
  const maxTests = Math.max(...chartData.value.datasets[0].data)
  const suggestedMax = maxTests + 1

  // Update y-axis ticks
  chartOptions.value.scales.yAxes[0].ticks.suggestedMax = suggestedMax
}

// Render chart on mount
onMounted(() => {
  processDataForChart()
  // Note: vue-chartjs Line component handles rendering via its internal logic
  // If explicit rendering is needed, ensure the Line component is used in the template
})
</script>

<style scoped>
/* Adicione estilos específicos do componente aqui se necessário */
</style>