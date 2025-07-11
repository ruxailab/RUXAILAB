<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-h3 font-weight-bold text-primary mb-2">
        SUS Analytics
      </h1>
      <p class="text-h6 text-grey-darken-1">
        System Usability Scale feedback from all participants
      </p>
    </div>

    <!-- Overview Cards -->
    <v-row class="mb-8">
      <v-col cols="12" md="4">
        <v-card class="pa-6 text-left" elevation="2" style="border-radius: 12px;">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Average SUS Score
              </div>
              <div class="text-h2 font-weight-bold text-warning mb-1">
                {{ analytics.averageScore }}
              </div>
              <div class="text-caption text-grey">
                out of 100
              </div>
            </div>
            <div class="pa-3" style="background: #e3f2fd; border-radius: 8px;">
              <v-icon size="24" color="primary">
                mdi-trending-up
              </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card class="pa-6 text-left" elevation="2" style="border-radius: 12px;">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Total Respondents
              </div>
              <div class="text-h2 font-weight-bold text-secondary mb-1">
                {{ analytics.totalRespondents }}
              </div>
              <div class="text-caption text-grey">
                participants
              </div>
            </div>
            <div class="pa-3" style="background: #e8f5e8; border-radius: 8px;">
              <v-icon size="24" color="success">
                mdi-account-group
              </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card class="pa-6 text-left" elevation="2" style="border-radius: 12px;">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Score Range
              </div>
              <div class="text-h2 font-weight-bold text-info mb-1">
                {{ analytics.minScore }} - {{ analytics.maxScore }}
              </div>
              <div class="text-caption text-grey">
                min | max
              </div>
            </div>
            <div class="pa-3" style="background: #f3e5f5; border-radius: 8px;">
              <v-icon size="24" color="purple">
                mdi-chart-bar
              </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Score Distribution Chart -->
    <v-row class="mb-8">
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px;">
          <v-card-title class="text-h5 pb-2">
            SUS Score Distribution
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <!-- Histogram Chart -->
              <v-col cols="12" md="6">
                <div class="chart-container">
                  <h3 class="text-h6 mb-4">Score Distribution Histogram</h3>
                  <canvas ref="histogramCanvas" style="max-height: 300px;"></canvas>
                </div>
              </v-col>
              
              <!-- Horizontal Bar Distribution -->
              <v-col cols="12" md="6">
                <div class="chart-container rating-chart-container">
                  <h3 class="text-h6 mb-4">Rating Categories</h3>
                  <div class="distribution-chart" style="height: 300px; display: flex; flex-direction: column; justify-content: space-around;">
                    <div 
                      v-for="(item, index) in distributionData" 
                      :key="index"
                      class="distribution-row"
                      style="margin-bottom: 20px;"
                    >
                      <div class="d-flex align-center">
                        <div class="rating-label" style="width: 80px;">
                          {{ item.label }}
                        </div>
                        <div class="flex-grow-1 mx-4">
                          <div class="progress-container">
                            <div 
                              class="progress-bar"
                              :style="{
                                width: `${item.percentage}%`,
                                backgroundColor: item.color,
                                borderRadius: '20px',
                                height: '32px',
                                position: 'relative',
                                minWidth: item.count > 0 ? '40px' : '0px'
                              }"
                            >
                              <span 
                                v-if="item.count > 0"
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
                                {{ item.count }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="score-range text-caption text-grey" style="width: 60px; text-align: right;">
                          {{ item.range }}
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

    <!-- Individual Scores Table -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px;">
          <v-card-title class="text-h5 pb-2">
            <v-icon left color="primary">mdi-table</v-icon>
            Individual Scores
          </v-card-title>
          
          <!-- Filter Controls -->
          <v-card-text class="pb-0">
            <v-row align="center">
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedRatingFilter"
                  :items="ratingFilterOptions"
                  label="Filter by Rating"
                  clearable
                  variant="outlined"
                  density="compact"
                >
                  <template v-slot:prepend-inner>
                    <v-icon>mdi-filter</v-icon>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-range-slider
                  v-model="scoreRange"
                  :min="0"
                  :max="100"
                  :step="5"
                  label="Score Range"
                  thumb-label="always"
                  class="mt-4"
                ></v-range-slider>
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
            <template v-slot:item.user="{ item }">
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
              </div>
            </template>
            
            <template v-slot:item.susScore="{ item }">
              <v-chip
                :color="getRatingColor(getSUSRating(item.susScore))"
                size="small"
                class="font-weight-bold"
              >
                {{ item.susScore }}
              </v-chip>
            </template>
            
            <template v-slot:item.rating="{ item }">
              <v-chip
                :color="getRatingColor(getSUSRating(item.susScore))"
                variant="tonal"
                size="small"
              >
                {{ getSUSRating(item.susScore) }}
              </v-chip>
            </template>
            
            <template v-slot:item.actions="{ item }">
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="openDetailsModal(item)"
              >
                <v-icon left>mdi-eye</v-icon>
                View Details
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Details Modal -->
    <v-dialog v-model="detailsModal" max-width="700px">
      <v-card v-if="selectedResponse" style="border-radius: 12px;">
        <v-card-title class="d-flex justify-space-between align-center pa-6 pb-4">
          <div>
            <div class="text-h5 font-weight-bold mb-1">SUS Response Details</div>
            <div class="text-body-2 text-grey-darken-1">
              {{ selectedResponse.name }}
            </div>
          </div>
          <v-btn icon variant="text" @click="detailsModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-card-text class="pa-6">
          <!-- Final SUS Score -->
          <div class="mb-6">
            <div class="d-flex justify-space-between align-center">
              <div class="text-body-1 text-grey-darken-1">Final SUS Score</div>
              <div class="d-flex align-center">
                <span class="text-h4 font-weight-bold text-primary mr-2">
                  {{ selectedResponse.susScore }}.0
                </span>
                <span class="text-h6 text-grey">/ 100</span>
                <v-chip
                  :color="getRatingColor(getSUSRating(selectedResponse.susScore))"
                  size="small"
                  class="ml-3"
                >
                  {{ getSUSRating(selectedResponse.susScore) }}
                </v-chip>
              </div>
            </div>
          </div>

          <v-divider class="mb-6"></v-divider>

          <!-- Individual Responses -->
          <div>
            <h3 class="text-h6 mb-4">Individual Responses</h3>
            <div class="responses-list">
              <div
                v-for="(question, index) in susQuestions"
                :key="index"
                class="response-item mb-4 pa-4"
                style="border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;"
              >
                <div class="d-flex justify-space-between align-start mb-3">
                  <div class="question-text flex-grow-1 pr-4">
                    <strong>Q{{ index + 1 }}:</strong> {{ question }}
                  </div>
                  <div class="response-score d-flex align-center">
                    <span class="text-h5 font-weight-bold mr-2">
                      {{ selectedResponse.susAnswers[index] }}
                    </span>
                    <v-chip
                      :color="getResponseColor(selectedResponse.susAnswers[index])"
                      size="small"
                      variant="tonal"
                    >
                      {{ getResponseLabel(selectedResponse.susAnswers[index]) }}
                    </v-chip>
                  </div>
                </div>
                <div class="text-caption text-grey d-flex justify-space-between">
                  <span>1 = Strongly Disagree</span>
                  <span>5 = Strongly Agree</span>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { getSUSRating, getRatingColor, calculateSUSScore } from '@/utils/susCalculator'
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
import { useStore } from 'vuex';

const store = useStore();

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
)

const detailsModal = ref(false)
const selectedResponse = ref(null)
const selectedRatingFilter = ref(null)
const scoreRange = ref([0, 100])

const histogramCanvas = ref(null)
let histogramChart = null

const tableHeaders = [
  { title: 'User', key: 'user', sortable: true },
  { title: 'SUS Score', key: 'susScore', sortable: true },
  { title: 'Rating', key: 'rating', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const ratingFilterOptions = [
  { title: 'All Ratings', value: null },
  { title: 'Excellent (80+)', value: 'Excellent' },
  { title: 'Good (68-79)', value: 'Good' },
  { title: 'OK (51-67)', value: 'OK' },
  { title: 'Poor (0-50)', value: 'Poor' }
]

const susQuestions = [
    "I think that I would like to use this system frequently.",
    "I found the system unnecessarily complex.",
    "I thought the system was easy to use.",
    "I think that I would need the support of a technical person to be able to use this system.",
    "I found the various functions in this system were well integrated.",
    "I thought there was too much inconsistency in this system.",
    "I would imagine that most people would learn to use this system very quickly.",
    "I found the system very cumbersome to use.",
    "I felt very confident using the system.",
    "I needed to learn a lot of things before I could get going with this system."
];

const testAnswerDocument = computed(() => store.getters.testAnswerDocument?.taskAnswers || {});
const tasksArray = computed(() => {
  return Object.values(testAnswerDocument.value).flatMap((item, index) => {
    return Object.values(item.tasks || {})
      .filter(task => Array.isArray(task.susAnswers) && task.susAnswers.length === 10)
      .map(task => ({
        ...task,
        susScore: calculateSUSScore(task.susAnswers),
        name: item.fullName
      }))
  })
})
console.log(tasksArray.value)
const analytics = computed(() => {
    const scores = tasksArray.value.map(r => r.susScore)
    return {
        averageScore: Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10,
        totalRespondents: tasksArray.value.length,
        minScore: Math.min(...scores),
        maxScore: Math.max(...scores),
    }
})

const filteredResponses = computed(() => {
  let filtered = tasksArray.value

  if (selectedRatingFilter.value) {
    filtered = filtered.filter(response => getSUSRating(response.susScore) === selectedRatingFilter.value)
  }

  filtered = filtered.filter(response => response.susScore >= scoreRange.value[0] && response.susScore <= scoreRange.value[1])

  return filtered
})

const distributionData = computed(() => {
  const scores = tasksArray.value.map(r => r.susScore)
  const total = scores.length

  const ranges = [
    { label: 'Poor', range: '0-51', min: 0, max: 51, color: '#f44336' },
    { label: 'OK', range: '52-67', min: 52, max: 67, color: '#ff9800' },
    { label: 'Good', range: '68-83', min: 68, max: 83, color: '#2196f3' },
    { label: 'Excellent', range: '84-100', min: 84, max: 100, color: '#4caf50' }
  ]

  const maxCount = Math.max(...ranges.map(range => scores.filter(score => score >= range.min && score <= range.max).length))

  return ranges.map(range => {
    const count = scores.filter(score => score >= range.min && score <= range.max).length
    return {
      ...range,
      count,
      percentage: maxCount > 0 ? (count / maxCount) * 100 : 0
    }
  })
})

const histogramData = computed(() => {
  const scores = tasksArray.value.map(r => r.susScore)
  const buckets = [
    { label: '0-19', min: 0, max: 19, color: '#f44336' },
    { label: '20-39', min: 20, max: 39, color: '#f44336' },
    { label: '40-59', min: 40, max: 59, color: '#ff9800' },
    { label: '60-79', min: 60, max: 79, color: '#2196f3' },
    { label: '80-100', min: 80, max: 100, color: '#4caf50' }
  ]

  const bucketCounts = buckets.map(bucket => scores.filter(score => score >= bucket.min && score <= bucket.max).length)

  return {
    labels: buckets.map(b => b.label),
    datasets: [{
      label: 'Number of Users',
      data: bucketCounts,
      backgroundColor: buckets.map(b => b.color + '80'),
      borderColor: buckets.map(b => b.color),
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
    }]
  }
})

const histogramOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: function(context) {
          return `Score Range: ${context[0].label}`
        },
        label: function(context) {
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
        callback: function(value) {
          return Number.isInteger(value) ? value : ''
        }
      }
    }
  }
}

function openDetailsModal(response) {
  selectedResponse.value = response
  detailsModal.value = true
}

function getResponseColor(score) {
  if (score >= 4) return 'success'
  if (score >= 3) return 'info'
  if (score >= 2) return 'warning'
  return 'error'
}

function getResponseLabel(score) {
  switch (score) {
    case 5: return 'Strongly Agree'
    case 4: return 'Agree'
    case 3: return 'Neutral'
    case 2: return 'Disagree'
    case 1: return 'Strongly Disagree'
    default: return 'Unknown'
  }
}

function createHistogramChart() {
  if (histogramCanvas.value) {
    if (histogramChart) histogramChart.destroy()
    const ctx = histogramCanvas.value.getContext('2d')
    if (ctx) {
      histogramChart = new ChartJS(ctx, {
        type: 'bar',
        data: histogramData.value,
        options: histogramOptions
      })
    }
  }
}

onMounted(async () => {
  await nextTick()
  createHistogramChart()
})
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
}

.v-chip {
  font-weight: 600;
}

.distribution-chart {
  width: 100%;
}

.distribution-row {
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

.rating-label {
  font-weight: 500;
  font-size: 14px;
}

.response-item {
  background: #fafafa !important;
  border: 1px solid #e0e0e0 !important;
}.chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container canvas {
  flex-grow: 1;
}

.question-text {
  line-height: 1.4;
}

.response-score {
  min-width: 120px;
  justify-content: flex-end;
}

.chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container canvas {
  flex-grow: 1;
}

.rating-chart-container {
  min-height: 350px;
}

.distribution-chart {
  padding: 20px 0;
}

.progress-container {
  height: 32px !important;
}
</style>