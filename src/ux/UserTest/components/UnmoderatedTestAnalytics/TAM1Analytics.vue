<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-h3 font-weight-bold text-primary">TAM-1 Analytics</h1>
      <p class="text-h6 text-grey-darken-1">
        Original Technology Acceptance Model - Perceived Usefulness & Ease of
        Use
      </p>
    </div>

    <!-- Overview Cards -->
    <v-row class="mb-2">
      <v-col cols="12" md="3">
        <v-card
          class="pa-6 text-left"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Avg Usefulness
              </div>
              <div class="text-h2 font-weight-bold text-primary mb-1">
                {{ analytics.averageUsefulness }}
              </div>
              <div class="text-caption text-grey">out of 7.0</div>
            </div>
            <div class="pa-3" style="background: #e3f2fd; border-radius: 8px">
              <v-icon size="24" color="primary"> mdi-star </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card
          class="pa-6 text-left"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Avg Ease of Use
              </div>
              <div class="text-h2 font-weight-bold text-success mb-1">
                {{ analytics.averageEaseOfUse }}
              </div>
              <div class="text-caption text-grey">out of 7.0</div>
            </div>
            <div class="pa-3" style="background: #e8f5e8; border-radius: 8px">
              <v-icon size="24" color="success"> mdi-hand-heart </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card
          class="pa-6 text-left"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Total Respondents
              </div>
              <div class="text-h2 font-weight-bold text-info mb-1">
                {{ analytics.totalRespondents }}
              </div>
              <div class="text-caption text-grey">participants</div>
            </div>
            <div class="pa-3" style="background: #e1f5fe; border-radius: 8px">
              <v-icon size="24" color="info"> mdi-account-group </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card
          class="pa-6 text-left"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Correlation
              </div>
              <div class="text-h2 font-weight-bold text-warning mb-1">
                {{ analytics.correlation }}
              </div>
              <div class="text-caption text-grey">PU vs PEOU</div>
            </div>
            <div class="pa-3" style="background: #fff3e0; border-radius: 8px">
              <v-icon size="24" color="warning"> mdi-chart-line </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Charts -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            Perceived Usefulness vs Ease of Use Analysis
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <!-- Scatter Plot -->
              <v-col cols="12" md="6">
                <div class="chart-container">
                  <h3 class="text-h6 mb-4">
                    Usefulness vs Ease of Use Scatter Plot
                  </h3>
                  <canvas ref="scatterCanvas" style="max-height: 400px" />
                </div>
              </v-col>

              <!-- Distribution Histograms -->
              <v-col cols="12" md="6">
                <div class="chart-container">
                  <h3 class="text-h6 mb-4">Score Distributions</h3>
                  <canvas ref="histogramCanvas" style="max-height: 400px" />
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quadrant Analysis -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            TAM-1 Quadrant Analysis
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <v-col
                v-for="quadrant in quadrantAnalysis"
                :key="quadrant.name"
                cols="12"
                md="3"
              >
                <v-card
                  class="pa-4 text-center"
                  :color="quadrant.color"
                  variant="tonal"
                  style="border-radius: 8px"
                >
                  <div class="text-h6 font-weight-bold mb-2">
                    {{ quadrant.name }}
                  </div>
                  <div class="text-h4 font-weight-bold mb-2">
                    {{ quadrant.count }}
                  </div>
                  <div class="text-body-2 mb-2">
                    {{ quadrant.percentage }}% of responses
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    {{ quadrant.description }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Individual Responses Table -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            <v-icon start color="primary"> mdi-table </v-icon>
            Individual TAM-1 Responses
          </v-card-title>

          <!-- Filter Controls -->
          <v-card-text class="pb-0">
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedQuadrantFilter"
                  :items="quadrantFilterOptions"
                  label="Filter by Quadrant"
                  clearable
                  variant="outlined"
                  density="compact"
                >
                  <template #prepend-inner>
                    <v-icon>mdi-filter</v-icon>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-range-slider
                  v-model="usefulnessRange"
                  :min="1"
                  :max="7"
                  :step="0.1"
                  label="Usefulness Range"
                  thumb-label="always"
                  class="mt-4"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-range-slider
                  v-model="easeOfUseRange"
                  :min="1"
                  :max="7"
                  :step="0.1"
                  label="Ease of Use Range"
                  thumb-label="always"
                  class="mt-4"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <!-- Data Table -->
          <v-data-table
            :headers="tableHeaders"
            :items="filteredResponses"
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

            <template #item.usefulness="{ item }">
              <v-chip
                :color="getScoreColor(item.constructScores.perceivedUsefulness)"
                size="small"
                class="font-weight-bold"
              >
                {{ item.constructScores.perceivedUsefulness }}
              </v-chip>
            </template>

            <template #item.easeOfUse="{ item }">
              <v-chip
                :color="getScoreColor(item.constructScores.perceivedEaseOfUse)"
                size="small"
                class="font-weight-bold"
              >
                {{ item.constructScores.perceivedEaseOfUse }}
              </v-chip>
            </template>

            <template #item.quadrant="{ item }">
              <v-chip
                :color="getQuadrantColor(item.quadrant)"
                variant="tonal"
                size="small"
              >
                {{ item.quadrant }}
              </v-chip>
            </template>

            <template #item.overallAcceptance="{ item }">
              <v-chip
                :color="getScoreColor(item.overallAcceptance)"
                size="small"
                class="font-weight-bold"
              >
                {{ item.overallAcceptance }}
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
            <div class="text-h5 font-weight-bold">TAM-1 Response Details</div>
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
          <!-- Construct Scores -->
          <div class="mb-6">
            <v-row>
              <v-col cols="12" md="6">
                <div
                  class="construct-detail pa-4"
                  style="
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    background: #e3f2fd;
                  "
                >
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="font-weight-medium">Perceived Usefulness</div>
                    <v-chip color="primary" size="small">
                      {{ selectedResponse.constructScores.perceivedUsefulness }}
                    </v-chip>
                  </div>
                  <v-progress-linear
                    :model-value="
                      (selectedResponse.constructScores.perceivedUsefulness /
                        7) *
                      100
                    "
                    color="primary"
                    height="8"
                    rounded
                  />
                  <div class="text-caption text-grey mt-1">
                    {{
                      getScoreLevel(
                        selectedResponse.constructScores.perceivedUsefulness,
                      )
                    }}
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div
                  class="construct-detail pa-4"
                  style="
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    background: #e8f5e8;
                  "
                >
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="font-weight-medium">Perceived Ease of Use</div>
                    <v-chip color="success" size="small">
                      {{ selectedResponse.constructScores.perceivedEaseOfUse }}
                    </v-chip>
                  </div>
                  <v-progress-linear
                    :model-value="
                      (selectedResponse.constructScores.perceivedEaseOfUse /
                        7) *
                      100
                    "
                    color="success"
                    height="8"
                    rounded
                  />
                  <div class="text-caption text-grey mt-1">
                    {{
                      getScoreLevel(
                        selectedResponse.constructScores.perceivedEaseOfUse,
                      )
                    }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <v-divider class="mb-6" />

          <!-- Quadrant Analysis -->
          <div class="mb-6">
            <h3 class="text-h6 mb-4">Quadrant Analysis</h3>
            <v-alert
              :color="getQuadrantColor(selectedResponse.quadrant)"
              variant="tonal"
              class="mb-4"
            >
              <div class="font-weight-medium mb-2">
                {{ selectedResponse.quadrant }}
              </div>
              <div class="text-body-2">
                {{ getQuadrantDescription(selectedResponse.quadrant) }}
              </div>
            </v-alert>
          </div>

          <!-- Overall Acceptance -->
          <div>
            <div class="d-flex justify-space-between align-center">
              <div class="text-body-1 text-grey-darken-1">
                Overall Technology Acceptance
              </div>
              <div class="d-flex align-center">
                <span class="text-h4 font-weight-bold text-primary mr-2">
                  {{ selectedResponse.overallAcceptance }}
                </span>
                <span class="text-h6 text-grey">/ 7.0</span>
                <v-chip
                  :color="getScoreColor(selectedResponse.overallAcceptance)"
                  size="small"
                  class="ml-3"
                >
                  {{ getScoreLevel(selectedResponse.overallAcceptance) }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, nextTick, watchEffect } from 'vue'
import { useStore } from 'vuex'
import {
  calculateTAMScores,
  calculateOverallAcceptance,
} from '../../utils/tamCalculator'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
  BarController,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
  BarController,
)

const store = useStore()

const detailsModal = ref(false)
const selectedResponse = ref(null)
const selectedQuadrantFilter = ref(null)
const usefulnessRange = ref([1, 7])
const easeOfUseRange = ref([1, 7])
const scatterCanvas = ref(null)
const histogramCanvas = ref(null)
let scatterChart = null
let histogramChart = null

const tableHeaders = [
  { title: 'User', key: 'user', sortable: true },
  { title: 'Usefulness', key: 'usefulness', sortable: true },
  { title: 'Ease of Use', key: 'easeOfUse', sortable: true },
  { title: 'Quadrant', key: 'quadrant', sortable: true },
  { title: 'Overall', key: 'overallAcceptance', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

const quadrantFilterOptions = [
  { title: 'All Quadrants', value: null },
  { title: 'High-High', value: 'High-High' },
  { title: 'High-Low', value: 'High-Low' },
  { title: 'Low-High', value: 'Low-High' },
  { title: 'Low-Low', value: 'Low-Low' },
]

const test = computed(() => store.getters.test.testStructure)
const testAnswerDocument = computed(
  () => store.getters.visibleUserAnswers || {},
)

const tam1Data = computed(() => {
  return Object.values(testAnswerDocument.value || {}).flatMap((item) => {
    return Object.values(item.tasks || {})
      .filter(
        (task) => test.value?.userTasks[task.taskId]?.taskType === 'tam-1',
      )
      .filter((task) => task.tamAnswers && task.tamAnswers.version === 'tam-1')
      .map((task) => {
        try {
          const constructScores = calculateTAMScores(task.tamAnswers)
          const overallAcceptance = calculateOverallAcceptance(
            constructScores,
            task.tamAnswers.version,
          )

          // Determine quadrant
          const usefulness = constructScores.perceivedUsefulness
          const easeOfUse = constructScores.perceivedEaseOfUse
          const quadrant = getQuadrant(usefulness, easeOfUse)

          return {
            ...task,
            constructScores,
            overallAcceptance: Math.round(overallAcceptance * 10) / 10,
            quadrant,
            name: item.fullName,
          }
        } catch (error) {
          console.warn('Error calculating TAM-1 scores:', error)
          return null
        }
      })
      .filter(Boolean)
  })
})

const analytics = computed(() => {
  if (tam1Data.value.length === 0) {
    return {
      averageUsefulness: 0,
      averageEaseOfUse: 0,
      totalRespondents: 0,
      correlation: 0,
    }
  }

  const usefulnessScores = tam1Data.value.map(
    (r) => r.constructScores.perceivedUsefulness,
  )
  const easeOfUseScores = tam1Data.value.map(
    (r) => r.constructScores.perceivedEaseOfUse,
  )

  const averageUsefulness =
    Math.round(
      (usefulnessScores.reduce((sum, score) => sum + score, 0) /
        usefulnessScores.length) *
        10,
    ) / 10
  const averageEaseOfUse =
    Math.round(
      (easeOfUseScores.reduce((sum, score) => sum + score, 0) /
        easeOfUseScores.length) *
        10,
    ) / 10

  // Calculate correlation coefficient
  const correlation = calculateCorrelation(usefulnessScores, easeOfUseScores)

  return {
    averageUsefulness,
    averageEaseOfUse,
    totalRespondents: tam1Data.value.length,
    correlation: Math.round(correlation * 100) / 100,
  }
})

const quadrantAnalysis = computed(() => {
  const quadrants = {
    'High-High': {
      count: 0,
      color: 'success',
      description: 'High acceptance likely',
    },
    'High-Low': {
      count: 0,
      color: 'warning',
      description: 'Useful but difficult',
    },
    'Low-High': { count: 0, color: 'info', description: 'Easy but not useful' },
    'Low-Low': {
      count: 0,
      color: 'error',
      description: 'Low acceptance likely',
    },
  }

  tam1Data.value.forEach((response) => {
    quadrants[response.quadrant].count++
  })

  const total = tam1Data.value.length

  return Object.entries(quadrants).map(([name, data]) => ({
    name,
    count: data.count,
    percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
    color: data.color,
    description: data.description,
  }))
})

const filteredResponses = computed(() => {
  let filtered = tam1Data.value

  if (selectedQuadrantFilter.value) {
    filtered = filtered.filter(
      (response) => response.quadrant === selectedQuadrantFilter.value,
    )
  }

  filtered = filtered.filter(
    (response) =>
      response.constructScores.perceivedUsefulness >=
        usefulnessRange.value[0] &&
      response.constructScores.perceivedUsefulness <=
        usefulnessRange.value[1] &&
      response.constructScores.perceivedEaseOfUse >= easeOfUseRange.value[0] &&
      response.constructScores.perceivedEaseOfUse <= easeOfUseRange.value[1],
  )

  return filtered
})

const scatterData = computed(() => {
  const data = tam1Data.value.map((r) => ({
    x: r.constructScores.perceivedEaseOfUse,
    y: r.constructScores.perceivedUsefulness,
    label: r.name,
    quadrant: r.quadrant,
  }))

  // Color points by quadrant
  const colors = {
    'High-High': 'rgba(76, 175, 80, 0.8)',
    'High-Low': 'rgba(255, 152, 0, 0.8)',
    'Low-High': 'rgba(33, 150, 243, 0.8)',
    'Low-Low': 'rgba(244, 67, 54, 0.8)',
  }

  return {
    datasets: [
      {
        label: 'Participants',
        data: data,
        backgroundColor: data.map((point) => colors[point.quadrant]),
        borderColor: data.map((point) =>
          colors[point.quadrant].replace('0.8', '1'),
        ),
        borderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 10,
      },
    ],
  }
})

const histogramData = computed(() => {
  const usefulnessScores = tam1Data.value.map(
    (r) => r.constructScores.perceivedUsefulness,
  )
  const easeOfUseScores = tam1Data.value.map(
    (r) => r.constructScores.perceivedEaseOfUse,
  )

  // Create bins for histogram
  const bins = [1, 2, 3, 4, 5, 6, 7]
  const usefulnessCounts = bins.map(
    (bin) =>
      usefulnessScores.filter((score) => Math.floor(score) === bin).length,
  )
  const easeOfUseCounts = bins.map(
    (bin) =>
      easeOfUseScores.filter((score) => Math.floor(score) === bin).length,
  )

  return {
    labels: bins.map((bin) => `${bin}.0`),
    datasets: [
      {
        label: 'Perceived Usefulness',
        data: usefulnessCounts,
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1,
      },
      {
        label: 'Perceived Ease of Use',
        data: easeOfUseCounts,
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1,
      },
    ],
  }
})

const scatterOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: function (context) {
          return context[0].raw.label || 'Participant'
        },
        label: function (context) {
          return [
            `Ease of Use: ${context.parsed.x}`,
            `Usefulness: ${context.parsed.y}`,
            `Quadrant: ${context.raw.quadrant}`,
          ]
        },
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'Perceived Ease of Use' },
      min: 1,
      max: 7,
      grid: {
        color: function (context) {
          return context.tick.value === 4
            ? 'rgba(0, 0, 0, 0.3)'
            : 'rgba(0, 0, 0, 0.1)'
        },
      },
    },
    y: {
      title: { display: true, text: 'Perceived Usefulness' },
      min: 1,
      max: 7,
      grid: {
        color: function (context) {
          return context.tick.value === 4
            ? 'rgba(0, 0, 0, 0.3)'
            : 'rgba(0, 0, 0, 0.1)'
        },
      },
    },
  },
}

const histogramOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top' },
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${context.parsed.y} responses`
        },
      },
    },
  },
  scales: {
    x: { title: { display: true, text: 'Score Range' } },
    y: { title: { display: true, text: 'Number of Responses' } },
  },
}

function getQuadrant(usefulness, easeOfUse) {
  const usefulnessHigh = usefulness >= 4
  const easeOfUseHigh = easeOfUse >= 4

  if (usefulnessHigh && easeOfUseHigh) return 'High-High'
  if (usefulnessHigh && !easeOfUseHigh) return 'High-Low'
  if (!usefulnessHigh && easeOfUseHigh) return 'Low-High'
  return 'Low-Low'
}

function calculateCorrelation(x, y) {
  const n = x.length
  if (n === 0) return 0

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
  )

  return denominator === 0 ? 0 : numerator / denominator
}

function openDetailsModal(response) {
  selectedResponse.value = response
  detailsModal.value = true
}

function getScoreColor(score) {
  if (score >= 6) return 'success'
  if (score >= 5) return 'info'
  if (score >= 4) return 'warning'
  if (score >= 3) return 'orange'
  return 'error'
}

function getScoreLevel(score) {
  if (score >= 6) return 'High'
  if (score >= 5) return 'Moderate-High'
  if (score >= 4) return 'Neutral'
  if (score >= 3) return 'Moderate-Low'
  return 'Low'
}

function getQuadrantColor(quadrant) {
  const colors = {
    'High-High': 'success',
    'High-Low': 'warning',
    'Low-High': 'info',
    'Low-Low': 'error',
  }
  return colors[quadrant] || 'grey'
}

function getQuadrantDescription(quadrant) {
  const descriptions = {
    'High-High':
      'Both usefulness and ease of use are rated highly. Strong technology acceptance expected.',
    'High-Low':
      'High usefulness but low ease of use. Users see value but find it difficult to use.',
    'Low-High':
      "Low usefulness but high ease of use. Easy to use but users don't see much value.",
    'Low-Low':
      'Both usefulness and ease of use are rated low. Poor technology acceptance expected.',
  }
  return descriptions[quadrant] || 'Unknown quadrant'
}

function createScatterChart() {
  if (scatterCanvas.value && tam1Data.value.length > 0) {
    if (scatterChart) {
      scatterChart.destroy()
    }
    const ctx = scatterCanvas.value.getContext('2d')
    if (ctx) {
      scatterChart = new ChartJS(ctx, {
        type: 'scatter',
        data: scatterData.value,
        options: scatterOptions,
      })
    }
  }
}

function createHistogramChart() {
  if (histogramCanvas.value && tam1Data.value.length > 0) {
    if (histogramChart) {
      histogramChart.destroy()
    }
    const ctx = histogramCanvas.value.getContext('2d')
    if (ctx) {
      histogramChart = new ChartJS(ctx, {
        type: 'bar',
        data: histogramData.value,
        options: histogramOptions,
      })
    }
  }
}

watchEffect(async () => {
  await nextTick()
  createScatterChart()
  createHistogramChart()
})
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
}

.v-chip {
  font-weight: 600;
}

.construct-detail {
  transition: all 0.2s ease;
}

.construct-detail:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container canvas {
  flex-grow: 1;
}
</style>
