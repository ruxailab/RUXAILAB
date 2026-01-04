<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-h3 font-weight-bold text-primary">TAM-2 Analytics</h1>
      <p class="text-h6 text-grey-darken-1">
        Extended Technology Acceptance Model - Social Influence & Cognitive
        Processes
      </p>
    </div>

    <!-- Overview Cards -->
    <v-row class="mb-2">
      <v-col cols="12" md="2">
        <v-card
          class="pa-4 text-left"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Avg Acceptance
              </div>
              <div class="text-h4 font-weight-bold text-success mb-1">
                {{ analytics.averageAcceptance }}
              </div>
              <div class="text-caption text-grey">out of 7.0</div>
            </div>
            <div class="pa-2" style="background: #e8f5e8; border-radius: 8px">
              <v-icon size="20" color="success"> mdi-thumb-up </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card
          class="pa-4 text-left"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Social Influence
              </div>
              <div class="text-h4 font-weight-bold text-info mb-1">
                {{ analytics.averageSocialInfluence }}
              </div>
              <div class="text-caption text-grey">avg score</div>
            </div>
            <div class="pa-2" style="background: #e1f5fe; border-radius: 8px">
              <v-icon size="20" color="info"> mdi-account-group </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card
          class="pa-4 text-left"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Job Relevance
              </div>
              <div class="text-h4 font-weight-bold text-warning mb-1">
                {{ analytics.averageJobRelevance }}
              </div>
              <div class="text-caption text-grey">avg score</div>
            </div>
            <div class="pa-2" style="background: #fff3e0; border-radius: 8px">
              <v-icon size="20" color="warning"> mdi-briefcase </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card
          class="pa-4 text-left"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Output Quality
              </div>
              <div class="text-h4 font-weight-bold text-purple mb-1">
                {{ analytics.averageOutputQuality }}
              </div>
              <div class="text-caption text-grey">avg score</div>
            </div>
            <div class="pa-2" style="background: #f3e5f5; border-radius: 8px">
              <v-icon size="20" color="purple"> mdi-star </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card
          class="pa-4 text-left"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">Image</div>
              <div class="text-h4 font-weight-bold text-pink mb-1">
                {{ analytics.averageImage }}
              </div>
              <div class="text-caption text-grey">avg score</div>
            </div>
            <div class="pa-2" style="background: #fce4ec; border-radius: 8px">
              <v-icon size="20" color="pink"> mdi-image </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="2">
        <v-card
          class="pa-4 text-left"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Respondents
              </div>
              <div class="text-h4 font-weight-bold text-primary mb-1">
                {{ analytics.totalRespondents }}
              </div>
              <div class="text-caption text-grey">participants</div>
            </div>
            <div class="pa-2" style="background: #e3f2fd; border-radius: 8px">
              <v-icon size="20" color="primary"> mdi-account-multiple </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Construct Comparison Charts -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            TAM-2 Construct Analysis
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <!-- Radar Chart -->
              <v-col cols="12" md="6">
                <div class="chart-container">
                  <h3 class="text-h6 mb-4">Average Construct Scores</h3>
                  <canvas ref="radarCanvas" style="max-height: 400px" />
                </div>
              </v-col>

              <!-- Correlation Matrix -->
              <v-col cols="12" md="6">
                <div class="correlation-container">
                  <h3 class="text-h6 mb-4">Construct Correlations</h3>
                  <div class="correlation-matrix">
                    <v-row
                      v-for="(construct1, i) in tam2Constructs"
                      :key="construct1.key"
                      class="mb-2"
                    >
                      <v-col cols="4" class="text-body-2 font-weight-medium">
                        {{ construct1.shortLabel }}
                      </v-col>
                      <v-col cols="8">
                        <div class="d-flex">
                          <div
                            v-for="(construct2, j) in tam2Constructs"
                            :key="construct2.key"
                            class="correlation-cell"
                            :style="{
                              backgroundColor: getCorrelationColor(
                                analytics.correlationMatrix[construct1.key]?.[
                                  construct2.key
                                ] || 0,
                              ),
                              color:
                                Math.abs(
                                  analytics.correlationMatrix[construct1.key]?.[
                                    construct2.key
                                  ] || 0,
                                ) > 0.5
                                  ? 'white'
                                  : 'black',
                            }"
                          >
                            {{
                              Math.round(
                                (analytics.correlationMatrix[construct1.key]?.[
                                  construct2.key
                                ] || 0) * 100,
                              ) / 100
                            }}
                          </div>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Social Influence Analysis -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            Social Influence Factors
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <v-col
                v-for="socialConstruct in socialInfluenceConstructs"
                :key="socialConstruct.key"
                cols="12"
                md="4"
              >
                <v-card
                  class="pa-4"
                  variant="outlined"
                  style="border-radius: 8px"
                >
                  <div class="text-center">
                    <v-icon
                      :color="socialConstruct.color"
                      size="32"
                      class="mb-2"
                    >
                      {{ socialConstruct.icon }}
                    </v-icon>
                    <div class="text-h6 font-weight-bold mb-2">
                      {{ socialConstruct.label }}
                    </div>
                    <div
                      class="text-h4 font-weight-bold mb-2"
                      :class="`text-${socialConstruct.color}`"
                    >
                      {{ analytics.constructAverages[socialConstruct.key] }}
                    </div>
                    <div class="text-body-2 text-grey">
                      {{
                        getScoreLevel(
                          analytics.constructAverages[socialConstruct.key],
                        )
                      }}
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
            Individual TAM-2 Responses
          </v-card-title>

          <!-- Filter Controls -->
          <v-card-text class="pb-0">
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedConstructFilter"
                  :items="constructFilterOptions"
                  label="Filter by Construct Level"
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
              <v-col cols="12" md="4">
                <v-range-slider
                  v-model="socialInfluenceRange"
                  :min="1"
                  :max="7"
                  :step="0.1"
                  label="Social Influence Range"
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

            <template #item.socialInfluence="{ item }">
              <v-chip
                :color="getScoreColor(item.socialInfluenceScore)"
                size="small"
                class="font-weight-bold"
              >
                {{ item.socialInfluenceScore }}
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
    <v-dialog v-model="detailsModal" max-width="1000px">
      <v-card v-if="selectedResponse" style="border-radius: 12px">
        <v-card-title
          class="d-flex justify-space-between align-center pa-6 pb-4"
        >
          <div>
            <div class="text-h5 font-weight-bold">TAM-2 Response Details</div>
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
                  :color="getScoreColor(selectedResponse.overallAcceptance)"
                  size="small"
                  class="ml-3"
                >
                  {{ getScoreLevel(selectedResponse.overallAcceptance) }}
                </v-chip>
              </div>
            </div>
          </div>

          <v-divider class="mb-6" />

          <!-- Core TAM Constructs -->
          <div class="mb-6">
            <h3 class="text-h6 mb-4">Core TAM Constructs</h3>
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
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- TAM-2 Extended Constructs -->
          <div>
            <h3 class="text-h6 mb-4">TAM-2 Extended Constructs</h3>
            <v-row>
              <v-col
                v-for="construct in tam2ExtendedConstructs"
                :key="construct.key"
                cols="12"
                md="4"
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
                    <div class="font-weight-medium text-body-2">
                      {{ construct.label }}
                    </div>
                    <v-chip :color="construct.color" size="small">
                      {{ selectedResponse.constructScores[construct.key] }}
                    </v-chip>
                  </div>
                  <v-progress-linear
                    :model-value="
                      (selectedResponse.constructScores[construct.key] / 7) *
                      100
                    "
                    :color="construct.color"
                    height="6"
                    rounded
                  />
                  <div class="text-caption text-grey mt-1">
                    {{
                      getScoreLevel(
                        selectedResponse.constructScores[construct.key],
                      )
                    }}
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

const detailsModal = ref(false)
const selectedResponse = ref(null)
const selectedConstructFilter = ref(null)
const acceptanceRange = ref([1, 7])
const socialInfluenceRange = ref([1, 7])
const radarCanvas = ref(null)
let radarChart = null

const tableHeaders = [
  { title: 'User', key: 'user', sortable: true },
  { title: 'Usefulness', key: 'usefulness', sortable: true },
  { title: 'Ease of Use', key: 'easeOfUse', sortable: true },
  { title: 'Social Influence', key: 'socialInfluence', sortable: true },
  { title: 'Overall', key: 'overallAcceptance', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

const constructFilterOptions = [
  { title: 'All Levels', value: null },
  { title: 'High Social Influence (5.0+)', value: 'high-social' },
  { title: 'Low Social Influence (<4.0)', value: 'low-social' },
  { title: 'High Job Relevance (5.0+)', value: 'high-job' },
  { title: 'Low Job Relevance (<4.0)', value: 'low-job' },
]

const tam2Constructs = [
  {
    key: 'perceivedUsefulness',
    label: 'Perceived Usefulness',
    shortLabel: 'PU',
    color: 'primary',
  },
  {
    key: 'perceivedEaseOfUse',
    label: 'Perceived Ease of Use',
    shortLabel: 'PEOU',
    color: 'success',
  },
  {
    key: 'subjectiveNorm',
    label: 'Subjective Norm',
    shortLabel: 'SN',
    color: 'info',
  },
  { key: 'image', label: 'Image', shortLabel: 'IMG', color: 'pink' },
  {
    key: 'jobRelevance',
    label: 'Job Relevance',
    shortLabel: 'JR',
    color: 'warning',
  },
  {
    key: 'outputQuality',
    label: 'Output Quality',
    shortLabel: 'OQ',
    color: 'purple',
  },
  {
    key: 'resultDemonstrability',
    label: 'Result Demonstrability',
    shortLabel: 'RD',
    color: 'orange',
  },
]

const socialInfluenceConstructs = [
  {
    key: 'subjectiveNorm',
    label: 'Subjective Norm',
    color: 'info',
    icon: 'mdi-account-group',
  },
  { key: 'image', label: 'Image', color: 'pink', icon: 'mdi-image' },
]

const tam2ExtendedConstructs = [
  { key: 'subjectiveNorm', label: 'Subjective Norm', color: 'info' },
  { key: 'image', label: 'Image', color: 'pink' },
  { key: 'jobRelevance', label: 'Job Relevance', color: 'warning' },
  { key: 'outputQuality', label: 'Output Quality', color: 'purple' },
  {
    key: 'resultDemonstrability',
    label: 'Result Demonstrability',
    color: 'orange',
  },
]

const test = computed(() => store.getters.test.testStructure)
const testAnswerDocument = computed(
  () => store.getters.visibleUserAnswers || {},
)

const tam2Data = computed(() => {
  return Object.values(testAnswerDocument.value || {}).flatMap((item) => {
    return Object.values(item.tasks || {})
      .filter(
        (task) => test.value?.userTasks[task.taskId]?.taskType === 'tam-2',
      )
      .filter((task) => task.tamAnswers && task.tamAnswers.version === 'tam-2')
      .map((task) => {
        try {
          const constructScores = calculateTAMScores(task.tamAnswers)
          const overallAcceptance = calculateOverallAcceptance(
            constructScores,
            task.tamAnswers.version,
          )

          // Calculate social influence composite score
          const socialInfluenceScore =
            Math.round(
              ((constructScores.subjectiveNorm + constructScores.image) / 2) *
                10,
            ) / 10

          return {
            ...task,
            constructScores,
            overallAcceptance: Math.round(overallAcceptance * 10) / 10,
            socialInfluenceScore,
            name: item.fullName,
          }
        } catch (error) {
          console.warn('Error calculating TAM-2 scores:', error)
          return null
        }
      })
      .filter(Boolean)
  })
})

const analytics = computed(() => {
  if (tam2Data.value.length === 0) {
    return {
      averageAcceptance: 0,
      totalRespondents: 0,
      averageSocialInfluence: 0,
      averageJobRelevance: 0,
      averageOutputQuality: 0,
      averageImage: 0,
      constructAverages: {},
      correlationMatrix: {},
    }
  }

  const acceptanceScores = tam2Data.value.map((r) => r.overallAcceptance)
  const averageAcceptance =
    Math.round(
      (acceptanceScores.reduce((sum, score) => sum + score, 0) /
        acceptanceScores.length) *
        10,
    ) / 10

  // Calculate construct averages
  const constructAverages = {}
  tam2Constructs.forEach((construct) => {
    const scores = tam2Data.value
      .map((r) => r.constructScores[construct.key])
      .filter((score) => score !== undefined)
    if (scores.length > 0) {
      constructAverages[construct.key] =
        Math.round(
          (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10,
        ) / 10
    }
  })

  // Calculate social influence metrics
  const socialInfluenceScores = tam2Data.value.map(
    (r) => r.socialInfluenceScore,
  )
  const averageSocialInfluence =
    Math.round(
      (socialInfluenceScores.reduce((sum, score) => sum + score, 0) /
        socialInfluenceScores.length) *
        10,
    ) / 10

  // Calculate correlation matrix
  const correlationMatrix = {}
  tam2Constructs.forEach((construct1) => {
    correlationMatrix[construct1.key] = {}
    tam2Constructs.forEach((construct2) => {
      const scores1 = tam2Data.value
        .map((r) => r.constructScores[construct1.key])
        .filter((score) => score !== undefined)
      const scores2 = tam2Data.value
        .map((r) => r.constructScores[construct2.key])
        .filter((score) => score !== undefined)

      if (
        scores1.length > 0 &&
        scores2.length > 0 &&
        scores1.length === scores2.length
      ) {
        correlationMatrix[construct1.key][construct2.key] =
          calculateCorrelation(scores1, scores2)
      } else {
        correlationMatrix[construct1.key][construct2.key] = 0
      }
    })
  })

  return {
    averageAcceptance,
    totalRespondents: tam2Data.value.length,
    averageSocialInfluence,
    averageJobRelevance: constructAverages.jobRelevance || 0,
    averageOutputQuality: constructAverages.outputQuality || 0,
    averageImage: constructAverages.image || 0,
    constructAverages,
    correlationMatrix,
  }
})

const filteredResponses = computed(() => {
  let filtered = tam2Data.value

  if (selectedConstructFilter.value) {
    switch (selectedConstructFilter.value) {
      case 'high-social':
        filtered = filtered.filter(
          (response) => response.socialInfluenceScore >= 5.0,
        )
        break
      case 'low-social':
        filtered = filtered.filter(
          (response) => response.socialInfluenceScore < 4.0,
        )
        break
      case 'high-job':
        filtered = filtered.filter(
          (response) => response.constructScores.jobRelevance >= 5.0,
        )
        break
      case 'low-job':
        filtered = filtered.filter(
          (response) => response.constructScores.jobRelevance < 4.0,
        )
        break
    }
  }

  filtered = filtered.filter(
    (response) =>
      response.overallAcceptance >= acceptanceRange.value[0] &&
      response.overallAcceptance <= acceptanceRange.value[1] &&
      response.socialInfluenceScore >= socialInfluenceRange.value[0] &&
      response.socialInfluenceScore <= socialInfluenceRange.value[1],
  )

  return filtered
})

const radarData = computed(() => {
  return {
    labels: tam2Constructs.map((c) => c.shortLabel),
    datasets: [
      {
        label: 'Average Scores',
        data: tam2Constructs.map(
          (c) => analytics.value.constructAverages[c.key] || 0,
        ),
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 2,
        pointBackgroundColor: tam2Constructs.map((c) => {
          const colors = {
            primary: '#2196F3',
            success: '#4CAF50',
            info: '#00BCD4',
            pink: '#E91E63',
            warning: '#FF9800',
            purple: '#9C27B0',
            orange: '#FF5722',
          }
          return colors[c.color] || '#2196F3'
        }),
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
          const construct = tam2Constructs[context.dataIndex]
          return `${construct.label}: ${context.parsed.r}/7`
        },
      },
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 7,
      ticks: { stepSize: 1 },
      grid: { color: 'rgba(0, 0, 0, 0.1)' },
      angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
    },
  },
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

function getCorrelationColor(correlation) {
  const abs = Math.abs(correlation)
  if (abs >= 0.7) return correlation > 0 ? '#4CAF50' : '#F44336'
  if (abs >= 0.5) return correlation > 0 ? '#8BC34A' : '#FF5722'
  if (abs >= 0.3) return correlation > 0 ? '#CDDC39' : '#FF9800'
  return '#E0E0E0'
}

function createRadarChart() {
  if (radarCanvas.value && tam2Data.value.length > 0) {
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

.correlation-matrix {
  max-height: 350px;
  overflow-y: auto;
}

.correlation-cell {
  width: 50px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
}

.correlation-container {
  min-height: 400px;
}
</style>
