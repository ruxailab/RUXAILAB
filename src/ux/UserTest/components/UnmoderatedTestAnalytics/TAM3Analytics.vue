<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-h3 font-weight-bold text-primary">TAM-3 Analytics</h1>
      <p class="text-h6 text-grey-darken-1">
        Comprehensive Technology Acceptance Model - Individual Differences &
        System Characteristics
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
                Self-Efficacy
              </div>
              <div class="text-h4 font-weight-bold text-info mb-1">
                {{ analytics.averageSelfEfficacy }}
              </div>
              <div class="text-caption text-grey">avg score</div>
            </div>
            <div class="pa-2" style="background: #e1f5fe; border-radius: 8px">
              <v-icon size="20" color="info"> mdi-account-check </v-icon>
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
              <div class="text-caption text-grey-darken-1 mb-1">Enjoyment</div>
              <div class="text-h4 font-weight-bold text-pink mb-1">
                {{ analytics.averageEnjoyment }}
              </div>
              <div class="text-caption text-grey">avg score</div>
            </div>
            <div class="pa-2" style="background: #fce4ec; border-radius: 8px">
              <v-icon size="20" color="pink"> mdi-heart </v-icon>
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
                Playfulness
              </div>
              <div class="text-h4 font-weight-bold text-orange mb-1">
                {{ analytics.averagePlayfulness }}
              </div>
              <div class="text-caption text-grey">avg score</div>
            </div>
            <div class="pa-2" style="background: #fff3e0; border-radius: 8px">
              <v-icon size="20" color="orange"> mdi-gamepad-variant </v-icon>
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
                Anxiety Level
              </div>
              <div class="text-h4 font-weight-bold text-error mb-1">
                {{ analytics.averageAnxiety }}
              </div>
              <div class="text-caption text-grey">avg score</div>
            </div>
            <div class="pa-2" style="background: #ffebee; border-radius: 8px">
              <v-icon size="20" color="error"> mdi-alert-circle </v-icon>
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

    <!-- Comprehensive Construct Analysis -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            TAM-3 Comprehensive Construct Analysis
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <!-- Radar Chart -->
              <v-col cols="12" md="8">
                <div class="chart-container">
                  <h3 class="text-h6 mb-4">All Construct Scores Overview</h3>
                  <canvas ref="radarCanvas" style="max-height: 500px" />
                </div>
              </v-col>

              <!-- Top Constructs -->
              <v-col cols="12" md="4">
                <div class="top-constructs-container">
                  <h3 class="text-h6 mb-4">Highest Scoring Constructs</h3>
                  <div
                    v-for="(construct, index) in topConstructs"
                    :key="construct.key"
                    class="construct-item mb-3 pa-3"
                    style="
                      border: 1px solid #e0e0e0;
                      border-radius: 8px;
                      background: #fafafa;
                    "
                  >
                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <div class="font-weight-medium text-body-2">
                          #{{ index + 1 }} {{ construct.label }}
                        </div>
                        <div class="text-caption text-grey">
                          {{ getScoreLevel(construct.score) }}
                        </div>
                      </div>
                      <v-chip
                        :color="getScoreColor(construct.score)"
                        size="small"
                        class="font-weight-bold"
                      >
                        {{ construct.score }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Individual Differences Analysis -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            Individual Differences Factors
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <v-col
                v-for="individualConstruct in individualDifferencesConstructs"
                :key="individualConstruct.key"
                cols="12"
                md="3"
              >
                <v-card
                  class="pa-4 text-center"
                  :color="individualConstruct.color"
                  variant="tonal"
                  style="border-radius: 8px"
                >
                  <v-icon
                    :color="individualConstruct.color"
                    size="32"
                    class="mb-2"
                  >
                    {{ individualConstruct.icon }}
                  </v-icon>
                  <div class="text-h6 font-weight-bold mb-2">
                    {{ individualConstruct.label }}
                  </div>
                  <div
                    class="text-h4 font-weight-bold mb-2"
                    :class="`text-${individualConstruct.color}`"
                  >
                    {{ analytics.constructAverages[individualConstruct.key] }}
                  </div>
                  <div class="text-body-2">
                    {{
                      getScoreLevel(
                        analytics.constructAverages[individualConstruct.key],
                      )
                    }}
                  </div>
                  <div class="text-caption text-grey mt-2">
                    {{ individualConstruct.description }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- System Characteristics Analysis -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            System Characteristics & Quality Factors
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <v-col
                v-for="systemConstruct in systemCharacteristicsConstructs"
                :key="systemConstruct.key"
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
                      :color="systemConstruct.color"
                      size="32"
                      class="mb-2"
                    >
                      {{ systemConstruct.icon }}
                    </v-icon>
                    <div class="text-h6 font-weight-bold mb-2">
                      {{ systemConstruct.label }}
                    </div>
                    <div
                      class="text-h4 font-weight-bold mb-2"
                      :class="`text-${systemConstruct.color}`"
                    >
                      {{ analytics.constructAverages[systemConstruct.key] }}
                    </div>
                    <div class="text-body-2 text-grey">
                      {{
                        getScoreLevel(
                          analytics.constructAverages[systemConstruct.key],
                        )
                      }}
                    </div>
                    <div class="text-caption text-grey mt-2">
                      {{ systemConstruct.description }}
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
            Individual TAM-3 Responses
          </v-card-title>

          <!-- Filter Controls -->
          <v-card-text class="pb-0">
            <v-row align="center">
              <v-col cols="12" md="3">
                <v-select
                  v-model="selectedPersonalityFilter"
                  :items="personalityFilterOptions"
                  label="Filter by Personality"
                  clearable
                  variant="outlined"
                  density="compact"
                >
                  <template #prepend-inner>
                    <v-icon>mdi-filter</v-icon>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="3">
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
              <v-col cols="12" md="3">
                <v-range-slider
                  v-model="selfEfficacyRange"
                  :min="1"
                  :max="7"
                  :step="0.1"
                  label="Self-Efficacy Range"
                  thumb-label="always"
                  class="mt-4"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-range-slider
                  v-model="anxietyRange"
                  :min="1"
                  :max="7"
                  :step="0.1"
                  label="Anxiety Range"
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

            <template #item.selfEfficacy="{ item }">
              <v-chip
                :color="
                  getScoreColor(item.constructScores.computerSelfEfficacy)
                "
                size="small"
                class="font-weight-bold"
              >
                {{ item.constructScores.computerSelfEfficacy }}
              </v-chip>
            </template>

            <template #item.anxiety="{ item }">
              <v-chip
                :color="getAnxietyColor(item.constructScores.computerAnxiety)"
                size="small"
                class="font-weight-bold"
              >
                {{ item.constructScores.computerAnxiety }}
              </v-chip>
            </template>

            <template #item.playfulness="{ item }">
              <v-chip
                :color="getScoreColor(item.constructScores.computerPlayfulness)"
                size="small"
                class="font-weight-bold"
              >
                {{ item.constructScores.computerPlayfulness }}
              </v-chip>
            </template>

            <template #item.enjoyment="{ item }">
              <v-chip
                :color="getScoreColor(item.constructScores.perceivedEnjoyment)"
                size="small"
                class="font-weight-bold"
              >
                {{ item.constructScores.perceivedEnjoyment }}
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
    <v-dialog v-model="detailsModal" max-width="1200px">
      <v-card v-if="selectedResponse" style="border-radius: 12px">
        <v-card-title
          class="d-flex justify-space-between align-center pa-6 pb-4"
        >
          <div>
            <div class="text-h5 font-weight-bold">TAM-3 Response Details</div>
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

          <!-- All Constructs -->
          <div>
            <h3 class="text-h6 mb-4">All TAM-3 Constructs</h3>
            <v-row>
              <v-col
                v-for="construct in allTam3Constructs"
                :key="construct.key"
                cols="12"
                md="4"
              >
                <div
                  class="construct-detail pa-3"
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
                    <v-chip
                      :color="
                        construct.key === 'computerAnxiety'
                          ? getAnxietyColor(
                              selectedResponse.constructScores[construct.key],
                            )
                          : getScoreColor(
                              selectedResponse.constructScores[construct.key],
                            )
                      "
                      size="small"
                    >
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
                      construct.key === 'computerAnxiety'
                        ? getAnxietyLevel(
                            selectedResponse.constructScores[construct.key],
                          )
                        : getScoreLevel(
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
const selectedPersonalityFilter = ref(null)
const acceptanceRange = ref([1, 7])
const selfEfficacyRange = ref([1, 7])
const anxietyRange = ref([1, 7])
const radarCanvas = ref(null)
let radarChart = null

const tableHeaders = [
  { title: 'User', key: 'user', sortable: true },
  { title: 'Self-Efficacy', key: 'selfEfficacy', sortable: true },
  { title: 'Anxiety', key: 'anxiety', sortable: true },
  { title: 'Playfulness', key: 'playfulness', sortable: true },
  { title: 'Enjoyment', key: 'enjoyment', sortable: true },
  { title: 'Overall', key: 'overallAcceptance', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

const personalityFilterOptions = [
  { title: 'All Personalities', value: null },
  { title: 'High Self-Efficacy (5.0+)', value: 'high-efficacy' },
  { title: 'Low Self-Efficacy (<4.0)', value: 'low-efficacy' },
  { title: 'High Anxiety (5.0+)', value: 'high-anxiety' },
  { title: 'Low Anxiety (<3.0)', value: 'low-anxiety' },
  { title: 'High Playfulness (5.0+)', value: 'high-playfulness' },
  { title: 'Low Playfulness (<4.0)', value: 'low-playfulness' },
]

const individualDifferencesConstructs = [
  {
    key: 'computerSelfEfficacy',
    label: 'Self-Efficacy',
    color: 'info',
    icon: 'mdi-account-check',
    description: 'Confidence in computer abilities',
  },
  {
    key: 'computerAnxiety',
    label: 'Computer Anxiety',
    color: 'error',
    icon: 'mdi-alert-circle',
    description: 'Fear or apprehension about computers',
  },
  {
    key: 'computerPlayfulness',
    label: 'Playfulness',
    color: 'orange',
    icon: 'mdi-gamepad-variant',
    description: 'Spontaneous and creative computer use',
  },
  {
    key: 'perceivedEnjoyment',
    label: 'Enjoyment',
    color: 'pink',
    icon: 'mdi-heart',
    description: 'Pleasure derived from system use',
  },
]

const systemCharacteristicsConstructs = [
  {
    key: 'outputQuality',
    label: 'Output Quality',
    color: 'purple',
    icon: 'mdi-star',
    description: 'Quality of system output',
  },
  {
    key: 'resultDemonstrability',
    label: 'Result Demonstrability',
    color: 'orange',
    icon: 'mdi-presentation',
    description: 'Tangibility of system results',
  },
  {
    key: 'objectiveUsability',
    label: 'Objective Usability',
    color: 'teal',
    icon: 'mdi-cog',
    description: 'Actual system usability',
  },
]

const allTam3Constructs = [
  {
    key: 'perceivedUsefulness',
    label: 'Perceived Usefulness',
    color: 'primary',
  },
  {
    key: 'perceivedEaseOfUse',
    label: 'Perceived Ease of Use',
    color: 'success',
  },
  { key: 'subjectiveNorm', label: 'Subjective Norm', color: 'info' },
  { key: 'image', label: 'Image', color: 'pink' },
  { key: 'jobRelevance', label: 'Job Relevance', color: 'warning' },
  { key: 'outputQuality', label: 'Output Quality', color: 'purple' },
  {
    key: 'resultDemonstrability',
    label: 'Result Demonstrability',
    color: 'orange',
  },
  {
    key: 'computerSelfEfficacy',
    label: 'Computer Self-Efficacy',
    color: 'info',
  },
  {
    key: 'perceptionOfExternalControl',
    label: 'External Control',
    color: 'cyan',
  },
  { key: 'computerAnxiety', label: 'Computer Anxiety', color: 'error' },
  {
    key: 'computerPlayfulness',
    label: 'Computer Playfulness',
    color: 'orange',
  },
  { key: 'perceivedEnjoyment', label: 'Perceived Enjoyment', color: 'pink' },
  { key: 'objectiveUsability', label: 'Objective Usability', color: 'teal' },
]

const test = computed(() => store.getters.test.testStructure)
const testAnswerDocument = computed(
  () => store.getters.visibleUserAnswers || {},
)

const tam3Data = computed(() => {
  return Object.values(testAnswerDocument.value || {}).flatMap((item) => {
    return Object.values(item.tasks || {})
      .filter(
        (task) => test.value?.userTasks[task.taskId]?.taskType === 'tam-3',
      )
      .filter((task) => task.tamAnswers && task.tamAnswers.version === 'tam-3')
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
          console.warn('Error calculating TAM-3 scores:', error)
          return null
        }
      })
      .filter(Boolean)
  })
})

const analytics = computed(() => {
  if (tam3Data.value.length === 0) {
    return {
      averageAcceptance: 0,
      totalRespondents: 0,
      averageSelfEfficacy: 0,
      averageEnjoyment: 0,
      averagePlayfulness: 0,
      averageAnxiety: 0,
      constructAverages: {},
    }
  }

  const acceptanceScores = tam3Data.value.map((r) => r.overallAcceptance)
  const averageAcceptance =
    Math.round(
      (acceptanceScores.reduce((sum, score) => sum + score, 0) /
        acceptanceScores.length) *
        10,
    ) / 10

  // Calculate construct averages
  const constructAverages = {}
  allTam3Constructs.forEach((construct) => {
    const scores = tam3Data.value
      .map((r) => r.constructScores[construct.key])
      .filter((score) => score !== undefined)
    if (scores.length > 0) {
      constructAverages[construct.key] =
        Math.round(
          (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10,
        ) / 10
    }
  })

  return {
    averageAcceptance,
    totalRespondents: tam3Data.value.length,
    averageSelfEfficacy: constructAverages.computerSelfEfficacy || 0,
    averageEnjoyment: constructAverages.perceivedEnjoyment || 0,
    averagePlayfulness: constructAverages.computerPlayfulness || 0,
    averageAnxiety: constructAverages.computerAnxiety || 0,
    constructAverages,
  }
})

const topConstructs = computed(() => {
  return Object.entries(analytics.value.constructAverages)
    .map(([key, score]) => ({
      key,
      label: CONSTRUCT_LABELS[key] || key,
      score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
})

const filteredResponses = computed(() => {
  let filtered = tam3Data.value

  if (selectedPersonalityFilter.value) {
    switch (selectedPersonalityFilter.value) {
      case 'high-efficacy':
        filtered = filtered.filter(
          (response) => response.constructScores.computerSelfEfficacy >= 5.0,
        )
        break
      case 'low-efficacy':
        filtered = filtered.filter(
          (response) => response.constructScores.computerSelfEfficacy < 4.0,
        )
        break
      case 'high-anxiety':
        filtered = filtered.filter(
          (response) => response.constructScores.computerAnxiety >= 5.0,
        )
        break
      case 'low-anxiety':
        filtered = filtered.filter(
          (response) => response.constructScores.computerAnxiety < 3.0,
        )
        break
      case 'high-playfulness':
        filtered = filtered.filter(
          (response) => response.constructScores.computerPlayfulness >= 5.0,
        )
        break
      case 'low-playfulness':
        filtered = filtered.filter(
          (response) => response.constructScores.computerPlayfulness < 4.0,
        )
        break
    }
  }

  filtered = filtered.filter(
    (response) =>
      response.overallAcceptance >= acceptanceRange.value[0] &&
      response.overallAcceptance <= acceptanceRange.value[1] &&
      response.constructScores.computerSelfEfficacy >=
        selfEfficacyRange.value[0] &&
      response.constructScores.computerSelfEfficacy <=
        selfEfficacyRange.value[1] &&
      response.constructScores.computerAnxiety >= anxietyRange.value[0] &&
      response.constructScores.computerAnxiety <= anxietyRange.value[1],
  )

  return filtered
})

const radarData = computed(() => {
  // Use a subset of constructs for readability
  const displayConstructs = [
    'perceivedUsefulness',
    'perceivedEaseOfUse',
    'subjectiveNorm',
    'computerSelfEfficacy',
    'computerAnxiety',
    'computerPlayfulness',
    'perceivedEnjoyment',
    'objectiveUsability',
  ]

  return {
    labels: displayConstructs.map((key) => {
      const labels = {
        perceivedUsefulness: 'Usefulness',
        perceivedEaseOfUse: 'Ease of Use',
        subjectiveNorm: 'Social Norm',
        computerSelfEfficacy: 'Self-Efficacy',
        computerAnxiety: 'Anxiety',
        computerPlayfulness: 'Playfulness',
        perceivedEnjoyment: 'Enjoyment',
        objectiveUsability: 'Usability',
      }
      return labels[key] || key
    }),
    datasets: [
      {
        label: 'Average Scores',
        data: displayConstructs.map(
          (key) => analytics.value.constructAverages[key] || 0,
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
          return `${context.label}: ${context.parsed.r}/7`
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

function getAnxietyColor(score) {
  // For anxiety, lower is better
  if (score <= 2) return 'success'
  if (score <= 3) return 'info'
  if (score <= 4) return 'warning'
  if (score <= 5) return 'orange'
  return 'error'
}

function getScoreLevel(score) {
  if (score >= 6) return 'High'
  if (score >= 5) return 'Moderate-High'
  if (score >= 4) return 'Neutral'
  if (score >= 3) return 'Moderate-Low'
  return 'Low'
}

function getAnxietyLevel(score) {
  // For anxiety, lower is better
  if (score <= 2) return 'Very Low'
  if (score <= 3) return 'Low'
  if (score <= 4) return 'Moderate'
  if (score <= 5) return 'High'
  return 'Very High'
}

function createRadarChart() {
  if (radarCanvas.value && tam3Data.value.length > 0) {
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

.construct-item {
  transition: all 0.2s ease;
}

.construct-item:hover {
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

.top-constructs-container {
  min-height: 500px;
}
</style>
