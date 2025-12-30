<template>
  <v-card
    class="fill-height"
    style="border-radius: 0;"
  >
    <v-container
      fluid
      class="pa-6 fill-height"
      style="overflow-y: auto;"
    >
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-h3 font-weight-bold text-primary">
          SART Analytics
        </h1>
        <p class="text-h6 text-grey-darken-1">
          Situation Awareness insights based on Situation Awareness Rating Technique
        </p>
      </div>

      <!-- Overview Cards -->
      <v-row class="mb-0">
        <v-col
          cols="12"
          md="4"
          class="d-flex"
        >
          <v-card
            class="pa-6 text-left"
            elevation="2"
            style="border-radius: 12px; width: 100%;"
          >
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">
                  Average SA Score
                </div>
                <div class="text-h2 font-weight-bold text-info mb-1">
                  {{ analytics.averageSAScore.toFixed(1) }}
                </div>
                <div class="text-caption text-grey">
                  {{ getSALevel(analytics.averageSAScore) }}
                </div>
              </div>
              <div
                class="pa-3"
                style="background: #e3f2fd; border-radius: 8px;"
              >
                <v-icon
                  size="24"
                  color="info"
                >
                  mdi-chart-areaspline
                </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="4"
          class="d-flex"
        >
          <v-card
            class="pa-6 text-left"
            elevation="2"
            style="border-radius: 12px; width: 100%;"
          >
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">
                  Average Demand
                </div>
                <div class="text-h4 font-weight-bold text-warning mb-1">
                  {{ analytics.averageDemand.toFixed(1) }}
                </div>
                <div class="text-caption text-grey">
                  Instability + Complexity + Variability
                </div>
              </div>
              <div
                class="pa-3"
                style="background: #fff3e0; border-radius: 8px;"
              >
                <v-icon
                  size="24"
                  color="warning"
                >
                  mdi-arrow-up-bold
                </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="4"
          class="d-flex"
        >
          <v-card
            class="pa-6 text-left"
            elevation="2"
            style="border-radius: 12px; width: 100%;"
          >
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">
                  Average Supply
                </div>
                <div class="text-h4 font-weight-bold text-success mb-1">
                  {{ analytics.averageSupply.toFixed(1) }}
                </div>
                <div class="text-caption text-grey">
                  Arousal + Spare Capacity + Concentration + Division + Info Quantity + Info Quality + Familiarity
                </div>
              </div>
              <div
                class="pa-3"
                style="background: #e8f5e8; border-radius: 8px;"
              >
                <v-icon
                  size="24"
                  color="success"
                >
                  mdi-arrow-down-bold
                </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Dimension Breakdown Charts -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card
            elevation="2"
            style="border-radius: 12px;"
          >
            <v-card-title class="text-h5 pa-5">
              SART Dimension Breakdown
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row>
                <!-- Radar Chart -->
                <v-col
                  cols="12"
                  md="6"
                >
                  <div class="chart-container">
                    <h3 class="text-h6 mb-4">
                      Average Scores by Dimension (1-7 scale)
                    </h3>
                    <canvas
                      ref="radarCanvas"
                      style="max-height: 400px;"
                    />
                  </div>
                </v-col>

                <!-- Horizontal Bar Chart -->
                <v-col
                  cols="12"
                  md="6"
                >
                  <div class="dimension-bars-container">
                    <h3 class="text-h6 mb-4">
                      Dimension Comparison
                    </h3>
                    <div
                      class="dimension-bars"
                      style="height: 500px; display: flex; flex-direction: column; justify-content: space-around;"
                    >
                      <div
                        v-for="(dimension, index) in sartDimensions"
                        :key="dimension.key"
                        class="dimension-row"
                        :style="{ marginBottom: index < sartDimensions.length - 1 ? '8px' : '0' }"
                      >
                        <div class="d-flex align-center">
                          <div
                            class="dimension-label"
                            style="min-width: 180px; max-width: 180px;"
                          >
                            <div class="font-weight-medium text-truncate" :title="dimension.label">
                              {{ dimension.label }}
                            </div>
                            <div class="text-caption text-grey text-truncate">
                              {{ getDimensionLevel(analytics.dimensionAverages[dimension.key]) }}
                            </div>
                          </div>
                          <div class="flex-grow-1 mx-4">
                            <div class="progress-container">
                              <div
                                class="progress-bar"
                                :style="{
                                  width: `${(analytics.dimensionAverages[dimension.key] / 7) * 100}%`,
                                  backgroundColor: getDimensionColor(analytics.dimensionAverages[dimension.key]),
                                  borderRadius: '20px',
                                  height: '32px',
                                  position: 'relative',
                                  minWidth: '40px'
                                }"
                              >
                                <span
                                  class="progress-text"
                                  style="
                                    position: absolute;
                                    left: 50%;
                                    top: 50%;
                                    transform: translate(-50%, -50%);
                                    color: white;
                                    font-weight: bold;
                                    font-size: 12px;
                                    padding: 0 8px;
                                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                                  "
                                >
                                  {{ analytics.dimensionAverages[dimension.key].toFixed(1) }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div
                            class="score-display text-h6 font-weight-bold text-right"
                            style="min-width: 60px;"
                          >
                            {{ analytics.dimensionAverages[dimension.key].toFixed(1) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Individual SART Table -->
      <v-row>
        <v-col cols="12">
          <v-card
            elevation="2"
            style="border-radius: 12px;"
          >
            <v-card-title class="text-h5 pa-5">
              <v-icon
                start
                color="primary"
              >
                mdi-table
              </v-icon>
              Individual SART Scores
            </v-card-title>

            <!-- Data Table -->
            <v-data-table
              :headers="tableHeaders"
              :items="analytics.responses"
              :items-per-page="10"
              class="elevation-0"
            >
              <template #item.user="{ item }">
                <div>
                  <div class="font-weight-medium">
                    {{ item.name }}
                  </div>
                </div>
              </template>

              <template #item.demand="{ item }">
                <v-chip
                  :color="getDemandColor(item.demand)"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ item.demand.toFixed(1) }}
                </v-chip>
              </template>

              <template #item.supply="{ item }">
                <v-chip
                  :color="getSupplyColor(item.supply)"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ item.supply.toFixed(1) }}
                </v-chip>
              </template>

              <template #item.saScore="{ item }">
                <v-chip
                  :color="getSAColor(item.saScore)"
                  variant="tonal"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ item.saScore.toFixed(1) }}
                </v-chip>
              </template>

              <template #item.actions="{ item }">
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  @click="openDetailsModal(item)"
                >
                  <v-icon start>
                    mdi-eye
                  </v-icon>
                  View Details
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Details Modal -->
      <v-dialog
        v-model="detailsModal"
        max-width="800px"
      >
        <v-card
          v-if="selectedResponse"
          style="border-radius: 12px;"
        >
          <v-card-title class="d-flex justify-space-between align-center pa-6 pb-4">
            <div>
              <div class="text-h5 font-weight-bold mb-1">
                SART Response Details
              </div>
              <div class="text-body-2 text-grey-darken-1">
                {{ selectedResponse.name }}
              </div>
            </div>
            <v-btn
              icon
              variant="text"
              @click="detailsModal = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-6">
            <!-- Overall SA Score -->
            <div class="mb-6">
              <div class="d-flex justify-space-between align-center">
                <div class="text-body-1 text-grey-darken-1">
                  Situation Awareness Score
                </div>
                <div class="d-flex align-center">
                  <span class="text-h4 font-weight-bold text-primary mr-2">
                    {{ selectedResponse.saScore.toFixed(1) }}
                  </span>
                  <v-chip
                    :color="getSAColor(selectedResponse.saScore)"
                    size="small"
                    class="ml-3"
                  >
                    {{ getSALevel(selectedResponse.saScore) }}
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- Demand and Supply Summary -->
            <v-row class="mb-6">
              <v-col cols="6">
                <div class="summary-card pa-4" style="background: #fff3e0; border-radius: 8px;">
                  <div class="text-caption text-grey-darken-1 mb-1">
                    Demand Score
                  </div>
                  <div class="text-h3 font-weight-bold text-warning">
                    {{ selectedResponse.demand.toFixed(1) }}
                  </div>
                  <div class="text-caption text-grey">
                    Instability + Complexity + Variability
                  </div>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="summary-card pa-4" style="background: #e8f5e8; border-radius: 8px;">
                  <div class="text-caption text-grey-darken-1 mb-1">
                    Supply Score
                  </div>
                  <div class="text-h3 font-weight-bold text-success">
                    {{ selectedResponse.supply.toFixed(1) }}
                  </div>
                  <div class="text-caption text-grey">
                    Arousal + Spare Capacity + Concentration + Division + Info Quantity + Info Quality + Familiarity
                  </div>
                </div>
              </v-col>
            </v-row>

            <v-divider class="mb-6" />

            <!-- Individual Dimension Scores -->
            <div class="mb-6">
              <h3 class="text-h6 mb-4">
                Dimension Breakdown (1-7 scale)
              </h3>
              <v-row>
                <v-col
                  v-for="dimension in sartDimensions"
                  :key="dimension.key"
                  cols="12"
                  md="6"
                >
                  <div
                    class="dimension-detail pa-4"
                    style="border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;"
                  >
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div class="font-weight-medium">
                        {{ dimension.label }}
                      </div>
                      <v-chip
                        :color="getDimensionColor(selectedResponse.sartAnswers[dimension.key])"
                        size="small"
                      >
                        {{ selectedResponse.sartAnswers[dimension.key] }}
                      </v-chip>
                    </div>
                    <div class="text-caption text-grey mb-2">
                      {{ dimension.description }}
                    </div>
                    <v-progress-linear
                      :model-value="(selectedResponse.sartAnswers[dimension.key] / 7) * 100"
                      :color="getDimensionColor(selectedResponse.sartAnswers[dimension.key])"
                      height="8"
                      rounded
                    />
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </v-card>
</template>

<script setup>
import { ref, computed, nextTick, watchEffect } from 'vue'
import { getSARTData, sartDimensions, getSALevel, getSAColor, getDimensionColor } from '@/ux/UserTest/utils/sartData'
import { useStore } from 'vuex'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController
} from 'chart.js'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController
)

const store = useStore()

const analytics = ref({
  averageSAScore: 0,
  totalRespondents: 0,
  highestSADimension: '',
  lowestSADimension: '',
  dimensionAverages: {},
  averageDemand: 0,
  averageSupply: 0,
  responses: []
})

const detailsModal = ref(false)
const selectedResponse = ref(null)
const radarCanvas = ref(null)
let radarChart = null

const tableHeaders = [
  { title: 'User', key: 'user', sortable: true },
  { title: 'Demand', key: 'demand', sortable: true },
  { title: 'Supply', key: 'supply', sortable: true },
  { title: 'SA Score', key: 'saScore', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const test = computed(() => store.getters.test?.testStructure || {})
const testAnswerDocument = computed(() => store.getters.visibleUserAnswers || {});

// Get SART responses from test answers
const sartData = computed(() => Object.values(testAnswerDocument.value || {}).flatMap((item, index) => {
  return Object.values(item.tasks || {})
    .filter(task => test.value?.userTasks?.[task.taskId]?.taskType === "sart")
    .filter(task => task.sartAnswers && typeof task.sartAnswers === 'object')
    .map((task) => {
      return {
        ...task,
        name: item.fullName || `Participant ${index + 1}`,
        sartAnswers: task.sartAnswers || {}
      }
    })
}))

const radarData = computed(() => {
  return {
    labels: sartDimensions.map(d => d.label),
    datasets: [{
      label: 'Average Dimension Score',
      data: sartDimensions.map(d => analytics.value.dimensionAverages[d.key] || 0),
      backgroundColor: 'rgba(33, 150, 243, 0.2)',
      borderColor: 'rgba(33, 150, 243, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(33, 150, 243, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(33, 150, 243, 1)',
      pointRadius: 4,
      pointBorderWidth: 2,
      pointHoverRadius: 6
    }]
  }
})

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${context.label}: ${context.parsed.r.toFixed(1)}/7`
        }
      }
    }
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 7,
      ticks: { stepSize: 1 },
      grid: { color: 'rgba(0, 0, 0, 0.1)' },
      angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
    }
  }
}

function openDetailsModal(response) {
  selectedResponse.value = response
  detailsModal.value = true
}

function getDemandColor(score) {
  if (score >= 18) return 'error'
  if (score >= 15) return 'warning'
  if (score >= 12) return 'info'
  return 'success'
}

function getSupplyColor(score) {
  if (score >= 42) return 'success'
  if (score >= 35) return 'info'
  if (score >= 28) return 'warning'
  return 'error'
}

function getDimensionLevel(score) {
  if (score >= 6) return 'High'
  if (score >= 4) return 'Moderate'
  return 'Low'
}

function createRadarChart() {
  if (radarCanvas.value) {
    if (radarChart) {
      radarChart.destroy()
    }
    const ctx = radarCanvas.value.getContext('2d')
    if (ctx) {
      radarChart = new ChartJS(ctx, {
        type: 'radar',
        data: radarData.value,
        options: radarOptions
      })
    }
  }
}

watchEffect(async () => {
  analytics.value = getSARTData(sartData.value)
  await nextTick()
  createRadarChart()
})
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.v-chip {
  font-weight: 600;
}

.dimension-bars {
  width: 100%;
  padding: 20px 0;
}

.dimension-row {
  width: 100%;
}

.progress-container {
  background-color: #f5f5f5;
  border-radius: 20px;
  height: 32px;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dimension-label {
  font-size: 14px;
}

.dimension-detail {
  background: #fafafa !important;
  border: 1px solid #e0e0e0 !important;
  transition: all 0.2s ease;
}

.dimension-detail:hover {
  background: #f0f0f0 !important;
  border-color: #d0d0d0 !important;
}

.chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container canvas {
  flex-grow: 1;
}

.dimension-bars-container {
  min-height: 500px;
}

.summary-card {
  height: 100%;
}
</style>