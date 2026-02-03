<template>
  <v-card class="fill-height" style="border-radius: 0;">
    <v-container fluid class="pa-6 fill-height" style="overflow-y: auto;">
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
        <!-- Average SA Score -->
        <v-col cols="12" md="3" class="d-flex">
          <v-card class="pa-6 text-left" elevation="2" style="border-radius: 12px; width: 100%;">
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
              <div class="pa-3" style="background: #e3f2fd; border-radius: 8px;">
                <v-icon size="24" color="info">
                  mdi-chart-areaspline
                </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- Average Demand -->
        <v-col cols="12" md="3" class="d-flex">
          <v-card class="pa-6 text-left" elevation="2" style="border-radius: 12px; width: 100%;">
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
              <div class="pa-3" style="background: #fff3e0; border-radius: 8px;">
                <v-icon size="24" color="warning">
                  mdi-arrow-up-bold
                </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- Average Supply -->
        <v-col cols="12" md="3" class="d-flex">
          <v-card class="pa-6 text-left" elevation="2" style="border-radius: 12px; width: 100%;">
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">
                  Average Supply
                </div>
                <div class="text-h4 font-weight-bold text-success mb-1">
                  {{ analytics.averageSupply.toFixed(1) }}
                </div>
                <div class="text-caption text-grey">
                  Arousal + Concentration + Division + Spare Capacity
                </div>
              </div>
              <div class="pa-3" style="background: #e8f5e8; border-radius: 8px;">
                <v-icon size="24" color="success">
                  mdi-arrow-down-bold
                </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- Average Understanding -->
        <v-col cols="12" md="3" class="d-flex">
          <v-card class="pa-6 text-left" elevation="2" style="border-radius: 12px; width: 100%;">
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">
                  Average Understanding
                </div>
                <div class="text-h4 font-weight-bold text-purple mb-1">
                  {{ analytics.averageUnderstanding.toFixed(1) }}
                </div>
                <div class="text-caption text-grey">
                  Information Quantity + Information Quality + Familiarity
                </div>
              </div>
              <div class="pa-3" style="background: #f3e5f5; border-radius: 8px;">
                <v-icon size="24" color="purple">
                  mdi-brain
                </v-icon>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Dimension Breakdown Charts -->
      <v-row class="mb-2">
        <v-col cols="12">
          <v-card elevation="2" style="border-radius: 12px;">
            <v-card-title class="text-h5 pa-5">
              SART Dimension Breakdown
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row>
                <!-- Radar Chart -->
                <v-col cols="12" md="6">
                  <div class="chart-container">
                    <h3 class="text-h6 mb-4">
                      Average Scores by Dimension (1-7 scale)
                    </h3>
                    <canvas ref="radarCanvas" style="max-height: 400px;" />
                  </div>
                </v-col>

                <!-- Grouped Horizontal Bar Chart -->
                <v-col cols="12" md="6">
                  <div class="dimension-bars-container">
                    <h3 class="text-h6 mb-4">
                      Dimension Comparison by Category
                    </h3>

                    <v-expansion-panels variant="accordion">
                      <!-- Demand Dimensions Group -->
                      <v-expansion-panel class="mb-2" elevation="1">
                        <v-expansion-panel-title>
                          <div class="d-flex align-center justify-space-between" style="width: 100%;">
                            <div class="d-flex align-center">
                              <v-chip color="warning" variant="tonal" size="small" class="mr-2">
                                <v-icon start size="small">
                                  mdi-arrow-up-bold
                                </v-icon>
                                Demand
                              </v-chip>
                              <span class="text-caption text-grey">(3 dimensions)</span>
                            </div>
                            <v-chip color="warning" variant="flat" size="small" class="mr-8">
                              Avg: {{ analytics.averageDemand.toFixed(1) }}
                            </v-chip>
                          </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div class="dimension-bars pt-3">
                            <div v-for="dimension in demandDimensions" :key="dimension.key" class="dimension-row mb-3">
                              <div class="d-flex align-center">
                                <div class="dimension-label" style="min-width: 180px; max-width: 180px;">
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
class="progress-bar" :style="{
                                      width: `${(analytics.dimensionAverages[dimension.key] / 7) * 100}%`,
                                      backgroundColor: getGroupColor('demand'),
                                      borderRadius: '20px',
                                      height: '24px',
                                      position: 'relative',
                                      minWidth: '40px'
                                    }">
                                      <span
class="progress-text" style="
                                          position: absolute;
                                          left: 50%;
                                          top: 50%;
                                          transform: translate(-50%, -50%);
                                          color: white;
                                          font-weight: bold;
                                          font-size: 11px;
                                          padding: 0 6px;
                                          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                                        ">
                                        {{ analytics.dimensionAverages[dimension.key].toFixed(1) }}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div
class="score-display text-body-1 font-weight-bold text-right"
                                  style="min-width: 50px;">
                                  {{ analytics.dimensionAverages[dimension.key].toFixed(1) }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>

                      <!-- Supply Dimensions Group -->
                      <v-expansion-panel class="mb-2" elevation="1">
                        <v-expansion-panel-title>
                          <div class="d-flex align-center justify-space-between" style="width: 100%;">
                            <div class="d-flex align-center">
                              <v-chip color="success" variant="tonal" size="small" class="mr-2">
                                <v-icon start size="small">
                                  mdi-arrow-down-bold
                                </v-icon>
                                Supply
                              </v-chip>
                              <span class="text-caption text-grey">(4 dimensions)</span>
                            </div>
                            <v-chip color="success" variant="flat" size="small" class="mr-8 font-weight-bold">
                              Avg: {{ analytics.averageSupply.toFixed(1) }}
                            </v-chip>
                          </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div class="dimension-bars pt-3">
                            <div v-for="dimension in supplyDimensions" :key="dimension.key" class="dimension-row mb-3">
                              <div class="d-flex align-center">
                                <div class="dimension-label" style="min-width: 180px; max-width: 180px;">
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
class="progress-bar" :style="{
                                      width: `${(analytics.dimensionAverages[dimension.key] / 7) * 100}%`,
                                      backgroundColor: getGroupColor('supply'),
                                      borderRadius: '20px',
                                      height: '24px',
                                      position: 'relative',
                                      minWidth: '40px'
                                    }">
                                      <span
class="progress-text" style="
                                          position: absolute;
                                          left: 50%;
                                          top: 50%;
                                          transform: translate(-50%, -50%);
                                          color: white;
                                          font-weight: bold;
                                          font-size: 11px;
                                          padding: 0 6px;
                                          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                                        ">
                                        {{ analytics.dimensionAverages[dimension.key].toFixed(1) }}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div
class="score-display text-body-1 font-weight-bold text-right"
                                  style="min-width: 50px;">
                                  {{ analytics.dimensionAverages[dimension.key].toFixed(1) }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>

                      <!-- Understanding Dimension Group -->
                      <v-expansion-panel elevation="1">
                        <v-expansion-panel-title>
                          <div class="d-flex align-center justify-space-between" style="width: 100%;">
                            <div class="d-flex align-center">
                              <v-chip color="purple" variant="tonal" size="small" class="mr-2">
                                <v-icon start size="small">
                                  mdi-brain
                                </v-icon>
                                Understanding
                              </v-chip>
                              <span class="text-caption text-grey">(3 dimensions)</span>
                            </div>
                            <v-chip color="purple" variant="flat" size="small" class="mr-8 font-weight-bold">
                              Avg: {{ analytics.averageUnderstanding.toFixed(1) }}
                            </v-chip>
                          </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div class="dimension-bars pt-3">
                            <div
v-for="dimension in understandingDimensions" :key="dimension.key"
                              class="dimension-row mb-3">
                              <div class="d-flex align-center">
                                <div class="dimension-label" style="min-width: 180px; max-width: 180px;">
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
class="progress-bar" :style="{
                                      width: `${(analytics.dimensionAverages[dimension.key] / 7) * 100}%`,
                                      backgroundColor: getGroupColor('understanding'),
                                      borderRadius: '20px',
                                      height: '24px',
                                      position: 'relative',
                                      minWidth: '40px'
                                    }">
                                      <span
class="progress-text" style="
                                          position: absolute;
                                          left: 50%;
                                          top: 50%;
                                          transform: translate(-50%, -50%);
                                          color: white;
                                          font-weight: bold;
                                          font-size: 11px;
                                          padding: 0 6px;
                                          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                                        ">
                                        {{ analytics.dimensionAverages[dimension.key].toFixed(1) }}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div
class="score-display text-body-1 font-weight-bold text-right"
                                  style="min-width: 50px;">
                                  {{ analytics.dimensionAverages[dimension.key].toFixed(1) }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
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
          <v-card elevation="2" style="border-radius: 12px;">
            <v-card-title class="text-h5 pa-5">
              <v-icon start color="primary">
                mdi-table
              </v-icon>
              Individual SART Scores
            </v-card-title>

            <!-- Data Table -->
            <v-data-table :headers="tableHeaders" :items="analytics.responses" :items-per-page="10" class="elevation-0">
              <template #item.user="{ item }">
                <div>
                  <div class="font-weight-medium">
                    {{ item.name }}
                  </div>
                </div>
              </template>

              <template #item.demand="{ item }">
                <v-chip :color="getDemandColor(item.demand)" size="small" class="font-weight-bold">
                  {{ item.demand.toFixed(1) }}
                </v-chip>
              </template>

              <template #item.supply="{ item }">
                <v-chip :color="getSupplyColor(item.supply)" size="small" class="font-weight-bold">
                  {{ item.supply.toFixed(1) }}
                </v-chip>
              </template>

              <template #item.understanding="{ item }">
                <v-chip :color="getUnderstandingColor(item.understanding)" size="small" class="font-weight-bold">
                  {{ item.understanding.toFixed(1) }}
                </v-chip>
              </template>

              <template #item.saScore="{ item }">
                <v-chip color="getSAColor(item.saScore)" variant="tonal" size="small" class="font-weight-bold">
                  {{ item.saScore.toFixed(1) }}
                </v-chip>
              </template>

              <template #item.actions="{ item }">
                <v-btn color="primary" variant="outlined" size="small" @click="openDetailsModal(item)">
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
      <v-dialog v-model="detailsModal" max-width="800px">
        <v-card v-if="selectedResponse" style="border-radius: 12px;">
          <v-card-title class="d-flex justify-space-between align-center pa-6 pb-4">
            <div>
              <div class="text-h5 font-weight-bold mb-1">
                SART Response Details
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
                  <v-chip :color="getSAColor(selectedResponse.saScore)" size="small" class="ml-3">
                    {{ getSALevel(selectedResponse.saScore) }}
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- Demand, Supply, and Understanding Summary -->
            <v-row class="mb-6">
              <v-col cols="4">
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
              <v-col cols="4">
                <div class="summary-card pa-4" style="background: #e8f5e8; border-radius: 8px;">
                  <div class="text-caption text-grey-darken-1 mb-1">
                    Supply Score
                  </div>
                  <div class="text-h3 font-weight-bold text-success">
                    {{ selectedResponse.supply.toFixed(1) }}
                  </div>
                  <div class="text-caption text-grey">
                    Arousal + Concentration + Division + Spare Capacity
                  </div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="summary-card pa-4" style="background: #f3e5f5; border-radius: 8px;">
                  <div class="text-caption text-grey-darken-1 mb-1">
                    Understanding Score
                  </div>
                  <div class="text-h3 font-weight-bold text-purple">
                    {{ selectedResponse.understanding.toFixed(1) }}
                  </div>
                  <div class="text-caption text-grey">
                    Information Quantity + Information Quality + Familiarity
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
                <v-col v-for="dimension in sartDimensions" :key="dimension.key" cols="12" md="6">
                  <div
class="dimension-detail pa-4"
                    style="border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div class="font-weight-medium">
                        {{ dimension.label }}
                      </div>
                      <v-chip :color="getDimensionColor(selectedResponse.sartAnswers[dimension.key])" size="small">
                        {{ selectedResponse.sartAnswers[dimension.key] }}
                      </v-chip>
                    </div>
                    <div class="text-caption text-grey mb-2">
                      {{ dimension.description }}
                    </div>
                    <v-progress-linear
:model-value="(selectedResponse.sartAnswers[dimension.key] / 7) * 100"
                      :color="getGroupColor(getDimensionCategory(dimension.key))" height="8" rounded />
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
  averageDemand: 0,
  averageSupply: 0,
  averageUnderstanding: 0,
  totalRespondents: 0,
  highestSADimension: '',
  lowestSADimension: '',
  dimensionAverages: {},
  responses: []
})

const detailsModal = ref(false)
const selectedResponse = ref(null)
const radarCanvas = ref(null)
let radarChart = null

// Updated table headers with Understanding column
const tableHeaders = [
  { title: 'User', key: 'user', sortable: true },
  { title: 'Demand', key: 'demand', sortable: true },
  { title: 'Supply', key: 'supply', sortable: true },
  { title: 'Understanding', key: 'understanding', sortable: true },
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
      // Calculate scores for each response
      const answers = task.sartAnswers || {}
      const demand = (answers.instability || 0) + (answers.complexity || 0) + (answers.variability || 0)
      const supply = (answers.arousal || 0) + (answers.concentration || 0) +
        (answers.division || 0) + (answers.spareCapacity || 0)
      const understanding = (answers.informationQuantity || 0) +
        (answers.informationQuality || 0) +
        (answers.familiarity || 0)
      const saScore = understanding - demand + supply

      return {
        ...task,
        name: item.fullName || `Participant ${index + 1}`,
        sartAnswers: answers,
        demand,
        supply,
        understanding,
        saScore
      }
    })
}))

// Filter dimensions by category
const demandDimensions = computed(() => {
  return sartDimensions.filter(dim => dim.category === 'demand')
})

const supplyDimensions = computed(() => {
  return sartDimensions.filter(dim => dim.category === 'supply')
})

const understandingDimensions = computed(() => {
  return sartDimensions.filter(dim => dim.category === 'understanding')
})

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

// FIXED: Correct demand score ranges (3-21: 3 dimensions × 1-7)
function getDemandColor(score) {
  if (score >= 18) return 'warning-darken-3'      // 18-21: Very high demand (bad)
  if (score >= 15) return 'warning-darken-2'   // 15-17.9: High demand
  if (score >= 9) return 'warning-darken-1'        // 9-14.9: Moderate demand
  return 'warning'                     // 3-8.9: Low demand (good)
}

// FIXED: Correct supply score ranges (4-28: 4 dimensions × 1-7)
function getSupplyColor(score) {
  // Score range: 4-28 (4 dimensions × 1-7)
  if (score >= 22) return 'green-lighten-3'    // 22-28: High supply (good)
  if (score >= 16) return 'green'       // 16-21.9: Moderate supply
  if (score >= 10) return 'green-darken-1'    // 10-15.9: Low supply
  return 'green-darken-2'                       // 4-9.9: Very low supply (bad)
}

// FIXED: Already correct, but adding comment for clarity
function getUnderstandingColor(score) {
  // Score range: 3-21 (3 dimensions × 1-7)
  if (score >= 18) return 'purple-lighten-1'  // 18-21: High understanding
  if (score >= 12) return 'purple'           // 12-17.9: Moderate understanding
  if (score >= 6) return 'purple-darken-2'  // 6-11.9: Low understanding
  return 'purple-darken-4'                  // 3-5.9: Very low understanding
}

function getDimensionLevel(score) {
  if (score >= 6) return 'High'
  if (score >= 4) return 'Moderate'
  return 'Low'
}

function getGroupColor(category) {
  switch (category) {
    case 'demand': return '#ff9800' // Orange
    case 'supply': return '#4caf50' // Green
    case 'understanding': return '#9c27b0' // Purple
    default: return '#757575' // Grey
  }
}

function getDimensionCategory(dimensionKey) {
  if (['instability', 'complexity', 'variability'].includes(dimensionKey)) return 'demand'
  if (['arousal', 'concentration', 'division', 'spareCapacity'].includes(dimensionKey)) return 'supply'
  if (['informationQuantity', 'informationQuality', 'familiarity'].includes(dimensionKey)) return 'understanding'
  return ''
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
.v-chip {
  font-weight: 600;
}

.dimension-bars {
  width: 100%;
  padding: 10px 0;
}

.dimension-row {
  width: 100%;
}

.progress-container {
  background-color: #f5f5f5;
  border-radius: 20px;
  height: 24px;
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
  min-height: 600px;
}

.summary-card {
  height: 100%;
}

.dimension-group {
  margin-bottom: 20px;
}

.group-header {
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}
</style>
