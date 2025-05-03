<template>
  <div>
    <Bar
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartData = ref({
  labels: [
    'Yes',
    'Neither',
    'No',
    'Not applicable-It is not a problem',
    'Not answered'
  ],
  datasets: [
    {
      label: 'Quantity answers',
      backgroundColor: '#f87979',
      data: []
    }
  ]
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
})

const updateChart = (data) => {
  chartData.value = {
    labels: [
      'Yes',
      'Neither',
      'No',
      'Not applicable-It is not a problem',
      'Not answered'
    ],
    datasets: [
      {
        label: 'Quantity answers',
        backgroundColor: '#f87979',
        data
      }
    ]
  }
}

watch(
  () => props.data,
  (newData) => {
    updateChart(newData)
  },
  { deep: true }
)

onMounted(() => {
  updateChart(props.data)
})
</script>

<style scoped>
/* No styles were provided in the original, so keeping it empty but scoped */
</style>