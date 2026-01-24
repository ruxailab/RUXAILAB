<template>
  <v-container
    fluid
    class="pa-6"
  >
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-h3 font-weight-bold text-primary">
        SUS Analytics
      </h1>
      <p class="text-h6 text-grey-darken-1">
        System Usability Scale feedback from all participants
      </p>
    </div>

    <!-- Overview Cards -->
    <v-row class="mb-2">
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          class="pa-6 text-left"
          elevation="2"
          style="border-radius: 12px;"
        >
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
            <div
              class="pa-3"
              style="background: #e3f2fd; border-radius: 8px;"
            >
              <v-icon
                size="24"
                color="primary"
              >
                mdi-trending-up
              </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          class="pa-6 text-left"
          elevation="2"
          style="border-radius: 12px;"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Total Respondents
              </div>
              <div class="text-h2 font-weight-bold text-green mb-1">
                {{ analytics.totalRespondents }}
              </div>
              <div class="text-caption text-grey">
                participants
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
                mdi-account-group
              </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          class="pa-6 text-left"
          elevation="2"
          style="border-radius: 12px;"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                Score Range
              </div>
              <div class="text-h2 font-weight-bold text-purple mb-1">
                {{ analytics.minScore }} - {{ analytics.maxScore }}
              </div>
              <div class="text-caption text-grey">
                min | max
              </div>
            </div>
            <div
              class="pa-3"
              style="background: #f3e5f5; border-radius: 8px;"
            >
              <v-icon
                size="24"
                color="purple"
              >
                mdi-chart-bar
              </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Score Distribution Chart -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card
          elevation="2"
          style="border-radius: 12px;"
        >
          <v-card-title class="text-h5 pb-2">
            SUS Score Distribution
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <!-- Histogram Chart -->
              <v-col
                cols="12"
                md="6"
              >
                <SusHistogramChart :scores="tasksArray.map(r => r.susScore)" />
              </v-col>

              <!-- Horizontal Bar Distribution -->
              <v-col
                cols="12"
                md="6"
              >
                <SusRatingChart :scores="tasksArray.map(r => r.susScore)" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Individual Scores Table -->
    <v-row>
      <v-col cols="12">
        <v-card
          elevation="2"
          style="border-radius: 12px;"
        >
          <v-card-title class="text-h5 pb-2">
            <v-icon
              start
              color="primary"
            >
              mdi-table
            </v-icon>
            Individual Scores
          </v-card-title>

          <!-- Filter Controls -->
          <v-card-text class="pb-0">
            <v-row align="center">
              <v-col
                cols="12"
                md="6"
              >
                <v-select
                  v-model="selectedRatingFilter"
                  :items="ratingFilterOptions"
                  label="Filter by Rating"
                  clearable
                  variant="outlined"
                  density="compact"
                >
                  <template #prepend-inner>
                    <v-icon>mdi-filter</v-icon>
                  </template>
                </v-select>
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-range-slider
                  v-model="scoreRange"
                  :min="0"
                  :max="100"
                  :step="5"
                  label="Score Range"
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

            <template #item.susScore="{ item }">
              <v-chip
                :color="getRatingColor(getSUSRating(item.susScore))"
                size="small"
                class="font-weight-bold"
              >
                {{ item.susScore }}
              </v-chip>
            </template>

            <template #item.rating="{ item }">
              <v-chip
                :color="getRatingColor(getSUSRating(item.susScore))"
                variant="tonal"
                size="small"
              >
                {{ getSUSRating(item.susScore) }}
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
      :max-width="dialogMaxWidth"
    >
      <v-card
        v-if="selectedResponse"
        style="border-radius: 12px;"
      >
        <v-card-title class="d-flex justify-space-between align-center pa-6 pb-4">
          <div>
            <div class="text-h5 font-weight-bold">
              SUS Response Details
            </div>
            <div class="text-body-3 text-grey-darken-1">
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
          <!-- Final SUS Score -->
          <div class="mb-0">
            <div class="d-flex justify-space-between align-center">
              <div class="text-body-1 text-grey-darken-1">
                Final SUS Score
              </div>
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
        </v-card-text>


        <v-card-text class="pa-6">
          <!-- Individual Responses -->
          <div>
            <h3 class="text-h6 mb-4">
              Individual Responses
            </h3>
            <div class="responses-list">
              <div
                v-for="(question, index) in susQuestions"
                :key="index"
                class="response-item mb-2 pa-4"
                style="border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;"
              >
                <div class="d-flex justify-space-between align-center d-sm-flex flex-column flex-sm-row">
                  <div class="question-text flex-grow-1 pr-4 d-flex align-center mb-2 mb-sm-0">
                    <strong>Q{{ index + 1 }}: </strong>  {{ question }}
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
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getSUSRating, getRatingColor, calculateSUSScore } from '../../utils/susCalculator'
import { useStore } from 'vuex';
import SusHistogramChart from '@/ux/UserTest/SusHistogramChart.vue';
import SusRatingChart from '@/ux/UserTest/SusRatingChart.vue';

const store = useStore();

const detailsModal = ref(false)
const selectedResponse = ref(null)
const selectedRatingFilter = ref(null)
const scoreRange = ref([0, 100])
const dialogMaxWidth = 800

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

const testAnswerDocument = computed(() => store.getters.visibleUserAnswers || {});
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
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
}

.v-chip {
  font-weight: 600;
}

.response-item {
  background: #fafafa !important;
  border: 1px solid #e0e0e0 !important;
}

.question-text {
  line-height: 1.4;
}

.response-score {
  min-width: 120px;
  justify-content: flex-end;
}
</style>
