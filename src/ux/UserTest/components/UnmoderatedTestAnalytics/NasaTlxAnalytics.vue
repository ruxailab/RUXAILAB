<template>
  <v-card class="fill-height">
    <v-container fluid class="pa-0 fill-height" style="overflow-y: auto">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-h3 font-weight-bold text-primary">
          NASA TLX Analytics
        </h1>
        <p class="text-h6 text-grey-darken-1">
          Participant workload insights based on NASA Task Load Index
        </p>
      </div>

      <!-- Overview Cards -->
      <v-row class="mb-0">
        <v-col cols="12" md="4" class="d-flex">
          <v-card
            class="pa-6 text-left"
            elevation="2"
            style="border-radius: 12px; width: 100%"
          >
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">
                  Average Overall Workload
                </div>
                <div class="text-h2 font-weight-bold text-warning mb-1">
                  {{ analytics.averageOverallScore || 0 }}
                </div>
                <div class="text-caption text-grey">out of 100</div>
              </div>
              <div class="pa-3" style="background: #fff3e0; border-radius: 8px">
                <v-icon size="24" color="warning"> mdi-brain </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4" class="d-flex">
          <v-card
            class="pa-6 text-left"
            elevation="2"
            style="border-radius: 12px; width: 100%"
          >
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">
                  Most Stressful Dimension
                </div>
                <div class="text-h5 font-weight-bold text-error mb-1">
                  {{ analytics.mostStressfulDimension || 'N/A' }}
                </div>
                <div class="text-caption text-grey">highest average score</div>
              </div>
              <div class="pa-3" style="background: #ffebee; border-radius: 8px">
                <v-icon size="24" color="error"> mdi-alert-circle </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4" class="d-flex">
          <v-card
            class="pa-6 text-left"
            elevation="2"
            style="border-radius: 12px; width: 100%"
          >
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">
                  Least Stressful Dimension
                </div>
                <div class="text-h5 font-weight-bold text-success mb-1">
                  {{ analytics.leastStressfulDimension || 'N/A' }}
                </div>
                <div class="text-caption text-grey">lowest average score</div>
              </div>
              <div class="pa-3" style="background: #e8f5e8; border-radius: 8px">
                <v-icon size="24" color="success"> mdi-check-circle </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Dimension Breakdown Charts -->
      <v-row class="mb-8">
        <v-col cols="12">
          <v-card elevation="2" style="border-radius: 12px">
            <v-card-title class="text-h5 pa-5">
              Workload Dimension Breakdown
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row>
                <!-- Radar Chart -->
                <v-col cols="12" md="6">
                  <div class="chart-container">
                    <h3 class="text-h6 mb-4">Average Scores by Dimension</h3>
                    <canvas ref="radarCanvas" style="max-height: 400px" />
                  </div>
                </v-col>

                <!-- Horizontal Bar Chart -->
                <v-col cols="12" md="6">
                  <div class="dimension-bars-container">
                    <h3 class="text-h6 mb-4">Dimension Comparison</h3>
                    <div
                      class="dimension-bars"
                      style="
                        height: 400px;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-around;
                      "
                    >
                      <div
                        v-for="dimension in tlxDimensions"
                        :key="dimension.key"
                        class="dimension-row"
                        style="margin-bottom: 16px"
                      >
                        <div class="d-flex align-center">
                          <div class="dimension-label" style="width: 120px">
                            <div class="font-weight-medium">
                              {{ dimension.label }}
                            </div>
                            <div class="text-caption text-grey">
                              {{
                                getWorkloadLevel(
                                  analytics.dimensionAverages[dimension.key],
                                )
                              }}
                            </div>
                          </div>
                          <div class="flex-grow-1 mx-4">
                            <div class="progress-container">
                              <div
                                class="progress-bar"
                                :style="{
                                  width: `${
                                    analytics.dimensionAverages[dimension.key]
                                  }%`,
                                  backgroundColor: dimension.color,
                                  borderRadius: '20px',
                                  height: '32px',
                                  position: 'relative',
                                  minWidth: '40px',
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
                                  "
                                >
                                  {{
                                    analytics.dimensionAverages[dimension.key]
                                  }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div
                            class="score-display text-h6 font-weight-bold"
                            style="width: 60px; text-align: right"
                          >
                            {{ analytics.dimensionAverages[dimension.key] }}
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

      <!-- Individual TLX Table -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="2" style="border-radius: 12px">
            <v-card-title class="text-h5 pa-5">
              <v-icon start color="primary"> mdi-table </v-icon>
              Individual TLX Scores
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

              <template #item.mentalDemand="{ item }">
                <v-chip
                  :color="getWorkloadColor(item.nasaTlxAnswers.mentalDemand)"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ item.nasaTlxAnswers.mentalDemand }}
                </v-chip>
              </template>

              <template #item.physicalDemand="{ item }">
                <v-chip
                  :color="getWorkloadColor(item.nasaTlxAnswers.physicalDemand)"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ item.nasaTlxAnswers.physicalDemand }}
                </v-chip>
              </template>

              <template #item.temporalDemand="{ item }">
                <v-chip
                  :color="getWorkloadColor(item.nasaTlxAnswers.temporalDemand)"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ item.nasaTlxAnswers.temporalDemand }}
                </v-chip>
              </template>

              <template #item.performance="{ item }">
                <v-chip
                  :color="getPerformanceColor(item.nasaTlxAnswers.performance)"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ item.nasaTlxAnswers.performance }}
                </v-chip>
              </template>

              <template #item.effort="{ item }">
                <v-chip
                  :color="getWorkloadColor(item.nasaTlxAnswers.effort)"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ item.nasaTlxAnswers.effort }}
                </v-chip>
              </template>

              <template #item.frustration="{ item }">
                <v-chip
                  :color="getWorkloadColor(item.nasaTlxAnswers.frustration)"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ item.nasaTlxAnswers.frustration }}
                </v-chip>
              </template>

              <template #item.overallScore="{ item }">
                <v-chip
                  :color="getWorkloadColor(item.overallScore)"
                  variant="tonal"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ item.overallScore }}
                </v-chip>
              </template>

              <template #item.actions="{ item }">
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  @click="openDetailsModal(item)"
                >
                  <v-icon start> mdi-eye </v-icon>
                  View Details
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Details Modal -->
      <v-dialog v-model="detailsModal" max-width="800px">
        <v-card v-if="selectedResponse" style="border-radius: 12px">
          <v-card-title
            class="d-flex justify-space-between align-center pa-6 pb-4"
          >
            <div>
              <div class="text-h5 font-weight-bold mb-1">
                NASA TLX Response Details
              </div>
              <div class="text-body-2 text-grey-darken-1">
                {{ selectedResponse.name }}
              </div>
            </div>
            <v-btn icon variant="text" @click="detailsModal = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-6">
            <!-- Overall Score -->
            <div class="mb-6">
              <div class="d-flex justify-space-between align-center">
                <div class="text-body-1 text-grey-darken-1">
                  Overall Workload Score
                </div>
                <div class="d-flex align-center">
                  <span class="text-h4 font-weight-bold text-primary mr-2">
                    {{ selectedResponse.overallScore }}
                  </span>
                  <span class="text-h6 text-grey">/ 100</span>
                  <v-chip
                    :color="getWorkloadColor(selectedResponse.overallScore)"
                    size="small"
                    class="ml-3"
                  >
                    {{ getWorkloadLevel(selectedResponse.overallScore) }}
                  </v-chip>
                </div>
              </div>
            </div>

            <v-divider class="mb-6" />

            <!-- Individual Dimension Scores -->
            <div class="mb-6">
              <h3 class="text-h6 mb-4">Dimension Breakdown</h3>
              <v-row>
                <v-col
                  v-for="dimension in tlxDimensions"
                  :key="dimension.key"
                  cols="12"
                  md="6"
                >
                  <div
                    class="dimension-detail pa-4"
                    style="
                      border: 1px solid #e0e0e0;
                      border-radius: 8px;
                      background: #fafafa;
                    "
                  >
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div class="font-weight-medium">
                        {{ dimension.label }}
                      </div>
                      <v-chip
                        :color="
                          dimension.key === 'performance'
                            ? getPerformanceColor(
                                selectedResponse.nasaTlxAnswers[dimension.key],
                              )
                            : getWorkloadColor(
                                selectedResponse.nasaTlxAnswers[dimension.key],
                              )
                        "
                        size="small"
                      >
                        {{ selectedResponse.nasaTlxAnswers[dimension.key] }}
                      </v-chip>
                    </div>
                    <div class="text-caption text-grey mb-2">
                      {{ dimension.description }}
                    </div>
                    <v-progress-linear
                      :model-value="
                        selectedResponse.nasaTlxAnswers[dimension.key]
                      "
                      :color="dimension.color"
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
import { getNASATLXData, tlxDimensions } from '@/ux/UserTest/utils/nasaTlxData'
import { useStore } from 'vuex'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController,
} from 'chart.js'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController,
)

const store = useStore()

const analytics = ref({
  averageOverallScore: 0,
  totalRespondents: 0,
  mostStressfulDimension: '',
  leastStressfulDimension: '',
  dimensionAverages: {
    mentalDemand: 0,
    physicalDemand: 0,
    temporalDemand: 0,
    performance: 0,
    effort: 0,
    frustration: 0,
  },
  responses: [],
})

const detailsModal = ref(false)
const selectedResponse = ref(null)
const radarCanvas = ref(null)
let radarChart = null

const tableHeaders = [
  { title: 'User', key: 'user', sortable: true },
  { title: 'Mental', key: 'mentalDemand', sortable: true },
  { title: 'Physical', key: 'physicalDemand', sortable: true },
  { title: 'Temporal', key: 'temporalDemand', sortable: true },
  { title: 'Performance', key: 'performance', sortable: true },
  { title: 'Effort', key: 'effort', sortable: true },
  { title: 'Frustration', key: 'frustration', sortable: true },
  { title: 'Overall', key: 'overallScore', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

const test = computed(() => store.getters.test.testStructure)
const testAnswerDocument = computed(
  () => store.getters.visibleUserAnswers || {},
)
const nasaTlxData = computed(() =>
  Object.values(testAnswerDocument.value || {}).flatMap((item) => {
    return Object.values(item.tasks || {})
      .filter(
        (task) => test.value?.userTasks[task.taskId]?.taskType === 'nasa-tlx',
      )
      .filter(
        (task) =>
          task.nasaTlxAnswers && typeof task.nasaTlxAnswers === 'object',
      )
      .map((task) => {
        const scores = Object.values(task.nasaTlxAnswers)
        return {
          ...task,
          overallScore:
            scores.length > 0
              ? Math.round(
                  (scores.reduce((sum, score) => sum + score, 0) /
                    scores.length) *
                    10,
                ) / 10
              : 0,
          name: item.fullName,
        }
      })
  }),
)

const radarData = computed(() => {
  return {
    labels: tlxDimensions.map((d) => d.label),
    datasets: [
      {
        label: 'Average Workload',
        data: tlxDimensions.map(
          (d) => analytics.value.dimensionAverages[d.key],
        ),
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(33, 150, 243, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(33, 150, 243, 1)',
        pointRadius: 6,
        pointBorderWidth: 2,
        pointHoverRadius: 8,
      },
    ],
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
          return `${context.label}: ${context.parsed.r}/100`
        },
      },
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: { stepSize: 20 },
      grid: { color: 'rgba(0, 0, 0, 0.1)' },
      angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
    },
  },
}

function openDetailsModal(response) {
  selectedResponse.value = response
  detailsModal.value = true
}

function getWorkloadColor(score) {
  if (score >= 80) return 'error'
  if (score >= 60) return 'warning'
  if (score >= 40) return 'info'
  return 'success'
}

function getPerformanceColor(score) {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
}

function getWorkloadLevel(score) {
  if (score >= 80) return 'Very High'
  if (score >= 60) return 'High'
  if (score >= 40) return 'Moderate'
  if (score >= 20) return 'Low'
  return 'Very Low'
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
        options: radarOptions,
      })
    }
  }
}

watchEffect(async () => {
  analytics.value = getNASATLXData(nasaTlxData.value)
  await nextTick()
  createRadarChart()
})
</script>

<style scoped>
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
  min-height: 400px;
}
</style>
