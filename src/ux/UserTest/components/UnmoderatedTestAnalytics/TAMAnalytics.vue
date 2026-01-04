<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-h3 font-weight-bold text-primary">TAM Analytics</h1>
      <p class="text-h6 text-grey-darken-1">
        Technology Acceptance Model feedback from all participants
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
                Average Acceptance
              </div>
              <div class="text-h2 font-weight-bold text-success mb-1">
                {{ analytics.averageAcceptance }}
              </div>
              <div class="text-caption text-grey">out of 7.0</div>
            </div>
            <div class="pa-3" style="background: #e8f5e8; border-radius: 8px">
              <v-icon size="24" color="success"> mdi-thumb-up </v-icon>
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
            <div class="pa-3" style="background: #e3f2fd; border-radius: 8px">
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
                TAM Versions Used
              </div>
              <div class="text-h2 font-weight-bold text-purple mb-1">
                {{ analytics.versionsUsed.length }}
              </div>
              <div class="text-caption text-grey">
                {{ analytics.versionsUsed.join(', ') }}
              </div>
            </div>
            <div class="pa-3" style="background: #f3e5f5; border-radius: 8px">
              <v-icon size="24" color="purple">
                mdi-format-list-numbered
              </v-icon>
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
                Highest Construct
              </div>
              <div class="text-h6 font-weight-bold text-warning mb-1">
                {{ analytics.highestConstruct.name }}
              </div>
              <div class="text-caption text-grey">
                {{ analytics.highestConstruct.score }} avg
              </div>
            </div>
            <div class="pa-3" style="background: #fff3e0; border-radius: 8px">
              <v-icon size="24" color="warning"> mdi-trending-up </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Core Constructs Comparison -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            Core TAM Constructs Comparison
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <!-- Perceived Usefulness vs Ease of Use Chart -->
              <v-col cols="12" md="6">
                <div class="chart-container">
                  <h3 class="text-h6 mb-4">
                    Perceived Usefulness vs Ease of Use
                  </h3>
                  <canvas ref="scatterCanvas" style="max-height: 400px" />
                </div>
              </v-col>

              <!-- Construct Averages Bar Chart -->
              <v-col cols="12" md="6">
                <div class="construct-bars-container">
                  <h3 class="text-h6 mb-4">Average Construct Scores</h3>
                  <div
                    class="construct-bars"
                    style="
                      height: 400px;
                      display: flex;
                      flex-direction: column;
                      justify-content: space-around;
                    "
                  >
                    <div
                      v-for="construct in displayedConstructs"
                      :key="construct.key"
                      class="construct-row"
                      style="margin-bottom: 16px"
                    >
                      <div class="d-flex align-center">
                        <div class="construct-label" style="width: 140px">
                          <div class="font-weight-medium text-body-2">
                            {{ construct.label }}
                          </div>
                          <div class="text-caption text-grey">
                            {{
                              getAcceptanceLevel(
                                analytics.constructAverages[construct.key],
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
                                  (analytics.constructAverages[construct.key] /
                                    7) *
                                  100
                                }%`,
                                backgroundColor: construct.color,
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
                                {{ analytics.constructAverages[construct.key] }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          class="score-display text-h6 font-weight-bold"
                          style="width: 60px; text-align: right"
                        >
                          {{ analytics.constructAverages[construct.key] }}
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

    <!-- Version Breakdown -->
    <v-row class="mb-2" v-if="analytics.versionBreakdown.length > 1">
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            TAM Version Comparison
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <v-col
                v-for="versionData in analytics.versionBreakdown"
                :key="versionData.version"
                cols="12"
                md="4"
              >
                <v-card
                  class="pa-4"
                  variant="outlined"
                  style="border-radius: 8px"
                >
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold text-primary mb-2">
                      {{ versionData.version.toUpperCase() }}
                    </div>
                    <div class="text-body-1 mb-2">
                      {{ versionData.count }} responses
                    </div>
                    <div class="text-h5 font-weight-bold text-success">
                      {{ versionData.averageAcceptance }} avg
                    </div>
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
            Individual TAM Responses
          </v-card-title>

          <!-- Filter Controls -->
          <v-card-text class="pb-0">
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedVersionFilter"
                  :items="versionFilterOptions"
                  label="Filter by TAM Version"
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
                <v-select
                  v-model="selectedAcceptanceFilter"
                  :items="acceptanceFilterOptions"
                  label="Filter by Acceptance Level"
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
                  v-model="acceptanceRange"
                  :min="1"
                  :max="7"
                  :step="0.1"
                  label="Acceptance Range"
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

            <template #item.version="{ item }">
              <v-chip
                :color="getVersionColor(item.tamAnswers.version)"
                size="small"
                class="font-weight-bold"
              >
                {{ item.tamAnswers.version.toUpperCase() }}
              </v-chip>
            </template>

            <template #item.overallAcceptance="{ item }">
              <v-chip
                :color="getAcceptanceColor(item.overallAcceptance)"
                size="small"
                class="font-weight-bold"
              >
                {{ item.overallAcceptance }}
              </v-chip>
            </template>

            <template #item.acceptanceLevel="{ item }">
              <v-chip
                :color="getAcceptanceColor(item.overallAcceptance)"
                variant="tonal"
                size="small"
              >
                {{ getAcceptanceLevel(item.overallAcceptance) }}
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
    <v-dialog v-model="detailsModal" max-width="900px">
      <v-card v-if="selectedResponse" style="border-radius: 12px">
        <v-card-title
          class="d-flex justify-space-between align-center pa-6 pb-4"
        >
          <div>
            <div class="text-h5 font-weight-bold">TAM Response Details</div>
            <div class="text-body-2 text-grey-darken-1">
              {{ selectedResponse.name }} -
              {{ selectedResponse.tamAnswers.version.toUpperCase() }}
            </div>
          </div>
          <v-btn icon variant="text" @click="detailsModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <!-- Overall Acceptance Score -->
          <div class="mb-6">
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
                  :color="
                    getAcceptanceColor(selectedResponse.overallAcceptance)
                  "
                  size="small"
                  class="ml-3"
                >
                  {{ getAcceptanceLevel(selectedResponse.overallAcceptance) }}
                </v-chip>
              </div>
            </div>
          </div>

          <v-divider class="mb-6" />

          <!-- Construct Scores -->
          <div>
            <h3 class="text-h6 mb-4">Construct Scores</h3>
            <v-row>
              <v-col
                v-for="(score, construct) in selectedResponse.constructScores"
                :key="construct"
                cols="12"
                md="6"
              >
                <div
                  class="construct-detail pa-4"
                  style="
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    background: #fafafa;
                  "
                >
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="font-weight-medium">
                      {{ getConstructLabel(construct) }}
                    </div>
                    <v-chip :color="getAcceptanceColor(score)" size="small">
                      {{ score }}
                    </v-chip>
                  </div>
                  <v-progress-linear
                    :model-value="(score / 7) * 100"
                    :color="getAcceptanceColor(score)"
                    height="8"
                    rounded
                  />
                  <div class="text-caption text-grey mt-1">
                    {{ getAcceptanceLevel(score) }}
                  </div>
                </div>
              </v-col>
            </v-row>
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
import { CONSTRUCT_LABELS } from '../../utils/tamData'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
)

const store = useStore()

const detailsModal = ref(false)
const selectedResponse = ref(null)
const selectedVersionFilter = ref(null)
const selectedAcceptanceFilter = ref(null)
const acceptanceRange = ref([1, 7])
const scatterCanvas = ref(null)
let scatterChart = null

const tableHeaders = [
  { title: 'User', key: 'user', sortable: true },
  { title: 'Version', key: 'version', sortable: true },
  { title: 'Acceptance', key: 'overallAcceptance', sortable: true },
  { title: 'Level', key: 'acceptanceLevel', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

const versionFilterOptions = [
  { title: 'All Versions', value: null },
  { title: 'TAM-1', value: 'tam-1' },
  { title: 'TAM-2', value: 'tam-2' },
  { title: 'TAM-3', value: 'tam-3' },
]

const acceptanceFilterOptions = [
  { title: 'All Levels', value: null },
  { title: 'High (6.0+)', value: 'High' },
  { title: 'Moderate-High (5.0-5.9)', value: 'Moderate-High' },
  { title: 'Neutral (4.0-4.9)', value: 'Neutral' },
  { title: 'Moderate-Low (3.0-3.9)', value: 'Moderate-Low' },
  { title: 'Low (1.0-2.9)', value: 'Low' },
]

const test = computed(() => store.getters.test.testStructure)
const testAnswerDocument = computed(
  () => store.getters.visibleUserAnswers || {},
)

const tamData = computed(() => {
  return Object.values(testAnswerDocument.value || {}).flatMap((item) => {
    return Object.values(item.tasks || {})
      .filter((task) =>
        test.value?.userTasks[task.taskId]?.taskType?.startsWith('tam-'),
      )
      .filter((task) => task.tamAnswers && typeof task.tamAnswers === 'object')
      .map((task) => {
        try {
          const constructScores = calculateTAMScores(task.tamAnswers)
          const overallAcceptance = calculateOverallAcceptance(
            constructScores,
            task.tamAnswers.version,
          )
          return {
            ...task,
            constructScores,
            overallAcceptance: Math.round(overallAcceptance * 10) / 10,
            name: item.fullName,
          }
        } catch (error) {
          console.warn('Error calculating TAM scores:', error)
          return null
        }
      })
      .filter(Boolean)
  })
})

const analytics = computed(() => {
  if (tamData.value.length === 0) {
    return {
      averageAcceptance: 0,
      totalRespondents: 0,
      versionsUsed: [],
      highestConstruct: { name: 'N/A', score: 0 },
      constructAverages: {},
      versionBreakdown: [],
    }
  }

  const acceptanceScores = tamData.value.map((r) => r.overallAcceptance)
  const averageAcceptance =
    Math.round(
      (acceptanceScores.reduce((sum, score) => sum + score, 0) /
        acceptanceScores.length) *
        10,
    ) / 10

  // Get unique versions used
  const versionsUsed = [
    ...new Set(tamData.value.map((r) => r.tamAnswers.version)),
  ]

  // Calculate construct averages across all responses
  const constructAverages = {}
  const allConstructs = new Set()
  tamData.value.forEach((response) => {
    Object.keys(response.constructScores).forEach((construct) =>
      allConstructs.add(construct),
    )
  })

  allConstructs.forEach((construct) => {
    const scores = tamData.value
      .filter((r) => r.constructScores[construct] !== undefined)
      .map((r) => r.constructScores[construct])
    if (scores.length > 0) {
      constructAverages[construct] =
        Math.round(
          (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10,
        ) / 10
    }
  })

  // Find highest construct
  const highestConstruct = Object.entries(constructAverages).reduce(
    (highest, [construct, score]) => {
      return score > highest.score
        ? { name: getConstructLabel(construct), score }
        : highest
    },
    { name: 'N/A', score: 0 },
  )

  // Version breakdown
  const versionBreakdown = versionsUsed.map((version) => {
    const versionResponses = tamData.value.filter(
      (r) => r.tamAnswers.version === version,
    )
    const versionAcceptanceScores = versionResponses.map(
      (r) => r.overallAcceptance,
    )
    const averageAcceptance =
      Math.round(
        (versionAcceptanceScores.reduce((sum, score) => sum + score, 0) /
          versionAcceptanceScores.length) *
          10,
      ) / 10

    return {
      version,
      count: versionResponses.length,
      averageAcceptance,
    }
  })

  return {
    averageAcceptance,
    totalRespondents: tamData.value.length,
    versionsUsed,
    highestConstruct,
    constructAverages,
    versionBreakdown,
  }
})

const displayedConstructs = computed(() => {
  const constructs = [
    {
      key: 'perceivedUsefulness',
      label: 'Perceived Usefulness',
      color: '#2196F3',
    },
    {
      key: 'perceivedEaseOfUse',
      label: 'Perceived Ease of Use',
      color: '#4CAF50',
    },
    { key: 'subjectiveNorm', label: 'Subjective Norm', color: '#FF9800' },
    { key: 'image', label: 'Image', color: '#9C27B0' },
    { key: 'jobRelevance', label: 'Job Relevance', color: '#F44336' },
    { key: 'outputQuality', label: 'Output Quality', color: '#00BCD4' },
    {
      key: 'resultDemonstrability',
      label: 'Result Demonstrability',
      color: '#795548',
    },
    {
      key: 'computerSelfEfficacy',
      label: 'Computer Self-Efficacy',
      color: '#607D8B',
    },
    {
      key: 'perceptionOfExternalControl',
      label: 'External Control',
      color: '#E91E63',
    },
    { key: 'computerAnxiety', label: 'Computer Anxiety', color: '#FF5722' },
    {
      key: 'computerPlayfulness',
      label: 'Computer Playfulness',
      color: '#8BC34A',
    },
    {
      key: 'perceivedEnjoyment',
      label: 'Perceived Enjoyment',
      color: '#FFEB3B',
    },
    {
      key: 'objectiveUsability',
      label: 'Objective Usability',
      color: '#3F51B5',
    },
  ]

  return constructs.filter(
    (construct) =>
      analytics.value.constructAverages[construct.key] !== undefined,
  )
})

const filteredResponses = computed(() => {
  let filtered = tamData.value

  if (selectedVersionFilter.value) {
    filtered = filtered.filter(
      (response) => response.tamAnswers.version === selectedVersionFilter.value,
    )
  }

  if (selectedAcceptanceFilter.value) {
    filtered = filtered.filter(
      (response) =>
        getAcceptanceLevel(response.overallAcceptance) ===
        selectedAcceptanceFilter.value,
    )
  }

  filtered = filtered.filter(
    (response) =>
      response.overallAcceptance >= acceptanceRange.value[0] &&
      response.overallAcceptance <= acceptanceRange.value[1],
  )

  return filtered
})

const scatterData = computed(() => {
  const data = tamData.value
    .filter(
      (r) =>
        r.constructScores.perceivedUsefulness &&
        r.constructScores.perceivedEaseOfUse,
    )
    .map((r) => ({
      x: r.constructScores.perceivedEaseOfUse,
      y: r.constructScores.perceivedUsefulness,
      label: r.name,
    }))

  return {
    datasets: [
      {
        label: 'Participants',
        data: data,
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
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
    },
    y: {
      title: { display: true, text: 'Perceived Usefulness' },
      min: 1,
      max: 7,
    },
  },
}

function openDetailsModal(response) {
  selectedResponse.value = response
  detailsModal.value = true
}

function getVersionColor(version) {
  const colors = {
    'tam-1': 'primary',
    'tam-2': 'success',
    'tam-3': 'warning',
  }
  return colors[version] || 'grey'
}

function getAcceptanceColor(score) {
  if (score >= 6) return 'success'
  if (score >= 5) return 'info'
  if (score >= 4) return 'warning'
  if (score >= 3) return 'orange'
  return 'error'
}

function getAcceptanceLevel(score) {
  if (score >= 6) return 'High'
  if (score >= 5) return 'Moderate-High'
  if (score >= 4) return 'Neutral'
  if (score >= 3) return 'Moderate-Low'
  return 'Low'
}

function getConstructLabel(construct) {
  return CONSTRUCT_LABELS[construct] || construct
}

function createScatterChart() {
  if (scatterCanvas.value && tamData.value.length > 0) {
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

watchEffect(async () => {
  await nextTick()
  createScatterChart()
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
  background: #fafafa !important;
  border: 1px solid #e0e0e0 !important;
  transition: all 0.2s ease;
}

.construct-detail:hover {
  background: #f0f0f0 !important;
  border-color: #d0d0d0 !important;
}

.construct-label {
  font-size: 14px;
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

.chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container canvas {
  flex-grow: 1;
}

.construct-bars-container {
  min-height: 400px;
}
</style>
