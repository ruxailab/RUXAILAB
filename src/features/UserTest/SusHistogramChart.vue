<template>
  <div class="chart-container">
    <h3 class="text-h6 mb-4">
      Score Distribution Histogram
    </h3>
    <canvas
      ref="histogramCanvas"
      style="max-height: 300px;"
    />
  </div>
</template>

<script setup>
import { onMounted, nextTick, ref, watch } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  scores: {
    type: Array,
    required: true
  }
})

const histogramCanvas = ref(null)
let histogramChart = null

const histogramOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: function (context) {
          return `Score Range: ${context[0].label}`
        },
        label: function (context) {
          const count = context.parsed.y
          return `${count} user${count !== 1 ? 's' : ''}`
        }
      }
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'SUS Score Ranges',
        font: { size: 14, weight: 'bold' }
      },
      grid: { display: false }
    },
    y: {
      title: {
        display: true,
        text: 'Number of Users',
        font: { size: 14, weight: 'bold' }
      },
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        callback: function (value) {
          return Number.isInteger(value) ? value : ''
        }
      }
    }
  }
}

function getHistogramData(scores) {
  const buckets = [
    { label: '0-19', min: 0, max: 19, color: '#f44336' },
    { label: '20-39', min: 20, max: 39, color: '#f44336' },
    { label: '40-59', min: 40, max: 59, color: '#ff9800' },
    { label: '60-79', min: 60, max: 79, color: '#2196f3' },
    { label: '80-100', min: 80, max: 100, color: '#4caf50' }
  ]

  const bucketCounts = buckets.map(bucket =>
    scores.filter(score => score >= bucket.min && score <= bucket.max).length
  )

  return {
    labels: buckets.map(b => b.label),
    datasets: [{
      label: 'Number of Users',
      data: bucketCounts,
      backgroundColor: buckets.map(b => b.color + '80'),
      borderColor: buckets.map(b => b.color),
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false
    }]
  }
}

function createHistogramChart() {
  if (histogramCanvas.value) {
    if (histogramChart) histogramChart.destroy()
    const ctx = histogramCanvas.value.getContext('2d')
    if (ctx) {
      histogramChart = new ChartJS(ctx, {
        type: 'bar',
        data: getHistogramData(props.scores),
        options: histogramOptions
      })
    }
  }
}

watch(() => props.scores, () => {
  nextTick(() => {
    createHistogramChart()
  })
})

onMounted(async () => {
  await nextTick()
  createHistogramChart()
})
</script>

<style scoped>
.chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container canvas {
  flex-grow: 1;
}
</style>
