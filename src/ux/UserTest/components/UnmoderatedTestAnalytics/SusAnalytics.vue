<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-h3 font-weight-bold text-primary">
        {{ $t('analytics.sus.title') }}
      </h1>
      <p class="text-h6 text-grey-darken-1">
        {{ $t('analytics.sus.description') }}
      </p>
    </div>

    <!-- Overview Cards -->
    <v-row class="mb-2">
      <v-col cols="12" sm="6" md="3" class="d-flex">
        <v-card
          class="pa-6 text-left flex-grow-1"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                {{ $t('analytics.sus.averageScore') }}
              </div>
              <div class="text-h2 font-weight-bold text-warning mb-1">
                {{ analytics.averageScore }}
              </div>
              <div class="text-caption text-grey">
                {{ $t('analytics.sus.outOf100') }}
              </div>
            </div>
            <div class="pa-3" style="background: #fff3e0; border-radius: 8px">
              <v-icon size="24" color="warning"> mdi-trending-up </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3" class="d-flex">
        <v-card
          class="pa-6 text-left flex-grow-1"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                {{ $t('analytics.sus.minimumScore') }}
              </div>
              <div class="text-h2 font-weight-bold text-blue mb-1">
                {{ analytics.minScore }}
              </div>
            </div>
            <div class="pa-3" style="background: #e3f2fd; border-radius: 8px">
              <v-icon size="24" color="blue"> mdi-arrow-down-bold </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3" class="d-flex">
        <v-card
          class="pa-6 text-left flex-grow-1"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                {{ $t('analytics.sus.maximumScore') }}
              </div>
              <div class="text-h2 font-weight-bold text-purple mb-1">
                {{ analytics.maxScore }}
              </div>
            </div>
            <div class="pa-3" style="background: #f3e5f5; border-radius: 8px">
              <v-icon size="24" color="purple"> mdi-arrow-up-bold </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3" class="d-flex">
        <v-card
          class="pa-6 text-left flex-grow-1"
          elevation="2"
          style="border-radius: 12px"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey-darken-1 mb-1">
                {{ $t('analytics.sus.totalRespondents') }}
              </div>
              <div class="text-h2 font-weight-bold text-green mb-1">
                {{ analytics.totalRespondents }}
              </div>
              <div class="text-caption text-grey">
                {{ $t('analytics.sus.participants') }}
              </div>
            </div>
            <div class="pa-3" style="background: #e8f5e8; border-radius: 8px">
              <v-icon size="24" color="success"> mdi-account-group </v-icon>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Score Distribution Chart -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            {{ $t('analytics.sus.scoreDistribution') }}
          </v-card-title>
          <v-card-text class="pa-6">
            <v-row>
              <!-- Histogram Chart -->
              <v-col cols="12" md="6">
                <SusHistogramChart
                  :scores="tasksArray.map((r) => r.susScore)"
                />
              </v-col>

              <!-- Horizontal Bar Distribution -->
              <v-col cols="12" md="6">
                <SusRatingChart :scores="tasksArray.map((r) => r.susScore)" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Individual Scores Table -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            <v-icon start color="primary"> mdi-table </v-icon>
            {{ $t('analytics.sus.individualScores') }}
          </v-card-title>

          <!-- Filter Controls -->
          <v-card-text class="pb-0">
            <v-row align="center">
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedRatingFilter"
                  :items="ratingFilterOptions"
                  :label="$t('analytics.sus.filterByRating')"
                  clearable
                  variant="outlined"
                  density="compact"
                >
                  <template #prepend-inner>
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
                  :label="$t('analytics.sus.scoreRange')"
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
                {{ translateRating(getSUSRating(item.susScore)) }}
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
                {{ $t('analytics.sus.viewDetails') }}
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Details Modal -->
    <v-dialog v-model="detailsModal" :max-width="dialogMaxWidth">
      <v-card v-if="selectedResponse" style="border-radius: 12px">
        <v-card-title
          class="d-flex justify-space-between align-center pa-6 pb-4"
        >
          <div>
            <div class="text-h5 font-weight-bold">
              {{ $t('analytics.sus.responseDetails') }}
            </div>
            <div class="text-body-3 text-grey-darken-1">
              {{ selectedResponse.name }}
            </div>
          </div>
          <v-btn icon variant="text" @click="detailsModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <!-- Final SUS Score -->
          <div class="mb-0">
            <div class="d-flex justify-space-between align-center">
              <div class="text-body-1 text-grey-darken-1">
                {{ $t('analytics.sus.finalScore') }}
              </div>
              <div class="d-flex align-center">
                <span class="text-h4 font-weight-bold text-primary mr-2">
                  {{ selectedResponse.susScore.toFixed(1) }}
                </span>
                <span class="text-h6 text-grey">
                  {{ $t('analytics.sus.scoreDenominator') }}
                </span>
                <v-chip
                  :color="
                    getRatingColor(getSUSRating(selectedResponse.susScore))
                  "
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
              {{ $t('analytics.sus.individualResponses') }}
            </h3>
            <div class="responses-list">
              <div
                v-for="(question, index) in susQuestions"
                :key="question"
                class="response-item mb-2 pa-4"
                style="
                  border: 1px solid #e0e0e0;
                  border-radius: 8px;
                  background: #fafafa;
                "
              >
                <div
                  class="d-flex justify-space-between align-center d-sm-flex flex-column flex-sm-row"
                >
                  <div
                    class="question-text flex-grow-1 pr-4 d-flex align-center mb-2 mb-sm-0"
                  >
                    <strong>
                      {{
                        $t('analytics.sus.questionNumber', {
                          number: index + 1,
                        })
                      }}:
                    </strong>
                    {{ $t(`analytics.sus.questions.${question}`) }}
                  </div>
                  <div class="response-score d-flex align-center">
                    <span class="text-h5 font-weight-bold mr-2">
                      {{ selectedResponse.susAnswers[index] }}
                    </span>
                    <v-chip
                      :color="
                        getResponseColor(selectedResponse.susAnswers[index])
                      "
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
import { useI18n } from 'vue-i18n'
import {
  getSUSRating,
  getRatingColor,
  calculateSUSScore,
} from '../../utils/susCalculator'
import { useStore } from 'vuex'
import SusHistogramChart from '@/ux/UserTest/SusHistogramChart.vue'
import SusRatingChart from '@/ux/UserTest/SusRatingChart.vue'

const store = useStore()
const { t } = useI18n()

const detailsModal = ref(false)
const selectedResponse = ref(null)
const selectedRatingFilter = ref(null)
const scoreRange = ref([0, 100])
const dialogMaxWidth = 800

const tableHeaders = computed(() => [
  { title: t('analytics.sus.user'), key: 'user', sortable: true },
  { title: t('analytics.sus.score'), key: 'susScore', sortable: true },
  { title: t('analytics.sus.rating'), key: 'rating', sortable: true },
  { title: t('analytics.sus.actions'), key: 'actions', sortable: false },
])

const ratingFilterOptions = computed(() => [
  { title: t('analytics.sus.allRatings'), value: null },
  { title: t('analytics.sus.ratings.excellent'), value: 'Excellent' },
  { title: t('analytics.sus.ratings.good'), value: 'Good' },
  { title: t('analytics.sus.ratings.ok'), value: 'OK' },
  { title: t('analytics.sus.ratings.poor'), value: 'Poor' },
])

const susQuestions = Array.from({ length: 10 }, (_, index) => index)

const testAnswerDocument = computed(
  () => store.getters.visibleUserAnswers || {},
)
const tasksArray = computed(() => {
  return Object.values(testAnswerDocument.value).flatMap((item) => {
    return Object.values(item.tasks || {})
      .filter(
        (task) =>
          Array.isArray(task.susAnswers) && task.susAnswers.length === 10,
      )
      .map((task) => ({
        ...task,
        susScore: calculateSUSScore(task.susAnswers),
        name: item.fullName,
      }))
  })
})
const analytics = computed(() => {
  const scores = tasksArray.value.map((r) => r.susScore)
  return {
    averageScore:
      Math.round(
        (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10,
      ) / 10,
    totalRespondents: tasksArray.value.length,
    minScore: Math.min(...scores),
    maxScore: Math.max(...scores),
  }
})

const filteredResponses = computed(() => {
  let filtered = tasksArray.value

  if (selectedRatingFilter.value) {
    filtered = filtered.filter(
      (response) =>
        getSUSRating(response.susScore) === selectedRatingFilter.value,
    )
  }

  filtered = filtered.filter(
    (response) =>
      response.susScore >= scoreRange.value[0] &&
      response.susScore <= scoreRange.value[1],
  )

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

function translateRating(rating) {
  const ratingKey = rating.toLowerCase()
  return t(`analytics.sus.ratings.${ratingKey}`)
}

function getResponseLabel(score) {
  switch (score) {
    case 5:
      return t('analytics.sus.responses.stronglyAgree')
    case 4:
      return t('analytics.sus.responses.agree')
    case 3:
      return t('analytics.sus.responses.neutral')
    case 2:
      return t('analytics.sus.responses.disagree')
    case 1:
      return t('analytics.sus.responses.stronglyDisagree')
    default:
      return t('analytics.sus.responses.unknown')
  }
}
</script>

<style scoped>
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
