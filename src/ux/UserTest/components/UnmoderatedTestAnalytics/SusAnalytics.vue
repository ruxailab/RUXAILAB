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

    <v-row class="mb-2">
      <v-col cols="12">
        <v-card elevation="2" style="border-radius: 12px">
          <v-card-title class="text-h5 pb-2">
            {{ $t('analytics.sus.interpretations.title') }}
          </v-card-title>
          <v-card-text>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ $t('analytics.sus.interpretations.description') }}
            </p>

            <v-alert
              v-if="!analytics.totalRespondents"
              type="info"
              variant="tonal"
              class="mb-4"
            >
              {{ $t('analytics.sus.interpretations.noData') }}
            </v-alert>

            <v-row>
              <v-col
                v-for="visualization in susInterpretationVisualizations"
                :key="visualization.key"
                cols="12"
              >
                <v-card variant="outlined" class="pa-4">
                  <div
                    class="d-flex flex-wrap justify-space-between align-center ga-2 mb-4"
                  >
                    <div class="flex-grow-1">
                      <h3 class="text-subtitle-1 font-weight-bold">
                        {{
                          $t(
                            `analytics.sus.interpretations.methods.${visualization.key}.title`,
                          )
                        }}
                      </h3>
                      <p class="text-caption text-medium-emphasis mb-0">
                        {{
                          $t(
                            `analytics.sus.interpretations.methods.${visualization.key}.description`,
                          )
                        }}
                      </p>
                    </div>
                    <div class="d-flex align-center ga-2">
                      <v-chip
                        v-if="analytics.totalRespondents"
                        color="primary"
                        variant="tonal"
                        size="small"
                      >
                        {{
                          $t(
                            `analytics.sus.interpretations.methods.${visualization.key}.result`,
                            {
                              score: analytics.averageScore,
                              category: $t(
                                `analytics.sus.interpretations.categories.${getActiveInterpretationSegment(visualization).category}`,
                              ),
                            },
                          )
                        }}
                      </v-chip>
                      <v-menu>
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-dots-vertical"
                            size="small"
                            variant="text"
                            :aria-label="
                              $t('analytics.sus.interpretations.exportOptions')
                            "
                          />
                        </template>
                        <v-list density="compact">
                          <v-list-item
                            prepend-icon="mdi-download"
                            :title="
                              $t('analytics.sus.interpretations.downloadSvg')
                            "
                            @click="downloadInterpretationSvg(visualization)"
                          />
                          <v-list-item
                            prepend-icon="mdi-code-braces"
                            :title="
                              $t('analytics.sus.interpretations.exportLatex')
                            "
                            @click="openInterpretationLatex(visualization)"
                          />
                        </v-list>
                      </v-menu>
                    </div>
                  </div>

                  <div class="sus-interpretation-chart">
                    <div
                      class="sus-interpretation-track"
                      role="list"
                      :aria-label="
                        $t(
                          `analytics.sus.interpretations.methods.${visualization.key}.title`,
                        )
                      "
                    >
                      <div
                        v-for="segment in visualization.segments"
                        :key="`${segment.category}-${segment.min}-${segment.max}`"
                        class="sus-interpretation-segment"
                        :class="{
                          'sus-interpretation-segment--active':
                            analytics.totalRespondents &&
                            isActiveInterpretationSegment(
                              visualization,
                              segment,
                            ),
                        }"
                        :style="{ flex: `${segment.width} 1 0%` }"
                        :title="`${$t(`analytics.sus.interpretations.categories.${segment.category}`)} — ${segment.min}–${segment.max}`"
                        :aria-label="`${$t(`analytics.sus.interpretations.categories.${segment.category}`)} — ${segment.min}–${segment.max}`"
                        role="listitem"
                      >
                        <span
                          v-if="segment.width >= 8"
                          class="sus-interpretation-segment-label"
                        >
                          {{
                            $t(
                              `analytics.sus.interpretations.categories.${segment.category}`,
                            )
                          }}
                        </span>
                      </div>
                      <div
                        v-if="
                          analytics.totalRespondents &&
                          visualization.key !== 'percentileRank'
                        "
                        class="sus-interpretation-marker"
                        :style="{
                          left: `${analytics.averageScore}%`,
                        }"
                        aria-hidden="true"
                      />
                    </div>
                    <div class="sus-interpretation-axis" aria-hidden="true">
                      <span v-for="tick in scoreAxisLabels" :key="tick">
                        {{ tick }}
                      </span>
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{
                        $t(
                          `analytics.sus.interpretations.${visualization.axisLabel}`,
                        )
                      }}
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <a
              class="text-caption"
              href="https://measuringu.com/interpret-sus-score/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ $t('analytics.sus.interpretations.reference') }}
            </a>
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
    <v-dialog v-model="interpretationLatexDialog" max-width="800">
      <v-card>
        <v-card-title>
          {{ $t('analytics.sus.interpretations.latexTitle') }}
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="interpretationLatex"
            readonly
            rows="12"
            auto-grow
            variant="outlined"
            :label="$t('analytics.sus.interpretations.latexLabel')"
          />
          <v-alert
            v-if="latexCopyStatus"
            :type="latexCopyStatus === 'copied' ? 'success' : 'error'"
            variant="tonal"
            class="mt-2"
          >
            {{
              $t(
                `analytics.sus.interpretations.${latexCopyStatus === 'copied' ? 'latexCopied' : 'latexCopyFailed'}`,
              )
            }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="interpretationLatexDialog = false">
            {{ $t('analytics.sus.interpretations.close') }}
          </v-btn>
          <v-btn color="primary" @click="copyInterpretationLatex">
            {{ $t('analytics.sus.interpretations.copyLatex') }}
          </v-btn>
        </v-card-actions>
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
const interpretationLatexDialog = ref(false)
const interpretationLatex = ref('')
const latexCopyStatus = ref('')
const selectedRatingFilter = ref(null)
const scoreRange = ref([0, 100])
const dialogMaxWidth = 800
const scoreAxisLabels = [0, 25, 50, 75, 100]
const susInterpretationVisualizations = [
  {
    key: 'percentileRank',
    axisLabel: 'percentileAxis',
    segments: [
      {
        min: 0,
        max: 25,
        category: 'percentile0to1',
        resultRange: '0–1.9',
        width: 2,
      },
      {
        min: 25.1,
        max: 51.6,
        category: 'percentile2to14',
        resultRange: '2–14',
        width: 13,
      },
      {
        min: 51.7,
        max: 62.6,
        category: 'percentile15to34',
        resultRange: '15–34',
        width: 20,
      },
      {
        min: 62.7,
        max: 64.9,
        category: 'percentile35to40',
        resultRange: '35–40',
        width: 6,
      },
      {
        min: 65,
        max: 71,
        category: 'percentile41to59',
        resultRange: '41–59',
        width: 19,
      },
      {
        min: 71.1,
        max: 72.5,
        category: 'percentile60to64',
        resultRange: '60–64',
        width: 5,
      },
      {
        min: 72.6,
        max: 74,
        category: 'percentile65to69',
        resultRange: '65–69',
        width: 5,
      },
      {
        min: 74.1,
        max: 77.1,
        category: 'percentile70to79',
        resultRange: '70–79',
        width: 10,
      },
      {
        min: 77.2,
        max: 78.8,
        category: 'percentile80to84',
        resultRange: '80–84',
        width: 5,
      },
      {
        min: 78.9,
        max: 80.7,
        category: 'percentile85to89',
        resultRange: '85–89',
        width: 5,
      },
      {
        min: 80.8,
        max: 84,
        category: 'percentile90to95',
        resultRange: '90–95',
        width: 6,
      },
      {
        min: 84.1,
        max: 100,
        category: 'percentile96to100',
        resultRange: '96–100',
        width: 4,
      },
    ],
  },
  {
    key: 'curvedGradingScale',
    axisLabel: 'scoreAxis',
    segments: [
      { min: 0, max: 51.6, category: 'gradeF', width: 51.7 },
      { min: 51.7, max: 62.6, category: 'gradeD', width: 11 },
      { min: 62.7, max: 64.9, category: 'gradeCMinus', width: 2.3 },
      { min: 65, max: 71, category: 'gradeC', width: 6.1 },
      { min: 71.1, max: 72.5, category: 'gradeCPlus', width: 1.5 },
      { min: 72.6, max: 74, category: 'gradeBMinus', width: 1.5 },
      { min: 74.1, max: 77.1, category: 'gradeB', width: 3.1 },
      { min: 77.2, max: 78.8, category: 'gradeBPlus', width: 1.7 },
      { min: 78.9, max: 80.7, category: 'gradeAMinus', width: 1.9 },
      { min: 80.8, max: 84, category: 'gradeA', width: 3.3 },
      { min: 84.1, max: 100, category: 'gradeAPlus', width: 15.9 },
    ],
  },
  {
    key: 'adjectiveRating',
    axisLabel: 'scoreAxis',
    segments: [
      { min: 0, max: 25, category: 'worstImaginable', width: 25 },
      { min: 25.1, max: 51.6, category: 'poorAdjective', width: 26.7 },
      { min: 51.7, max: 62.6, category: 'okAdjective', width: 11 },
      { min: 62.7, max: 71, category: 'noAdjective', width: 8.4 },
      { min: 71.1, max: 72.5, category: 'goodAdjective', width: 1.5 },
      { min: 72.6, max: 80.7, category: 'noAdjective', width: 8.2 },
      { min: 80.8, max: 84, category: 'excellentAdjective', width: 3.3 },
      { min: 84.1, max: 100, category: 'bestImaginable', width: 15.9 },
    ],
  },
  {
    key: 'acceptabilityRanges',
    axisLabel: 'scoreAxis',
    segments: [
      { min: 0, max: 62.6, category: 'notAcceptable', width: 62.7 },
      { min: 62.7, max: 71, category: 'marginal', width: 8.4 },
      { min: 71.1, max: 100, category: 'acceptable', width: 28.9 },
    ],
  },
  {
    key: 'npsCategories',
    axisLabel: 'scoreAxis',
    segments: [
      { min: 0, max: 62.6, category: 'detractor', width: 62.7 },
      { min: 62.7, max: 78.8, category: 'passive', width: 16.2 },
      { min: 78.9, max: 100, category: 'promoter', width: 21.1 },
    ],
  },
]

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
    averageScore: scores.length
      ? Math.round(
          (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10,
        ) / 10
      : 0,
    totalRespondents: tasksArray.value.length,
    minScore: scores.length ? Math.min(...scores) : 0,
    maxScore: scores.length ? Math.max(...scores) : 0,
  }
})

function isActiveInterpretationSegment(visualization, segment) {
  const score = analytics.value.averageScore
  return score >= segment.min && score <= segment.max
}

function getActiveInterpretationSegment(visualization) {
  return visualization.segments.find((segment) =>
    isActiveInterpretationSegment(visualization, segment),
  )
}

const interpretationColors = [
  '#f4a261',
  '#e9c46a',
  '#8abf88',
  '#f4a261',
  '#e9c46a',
  '#8abf88',
]

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const escapeLatex = (value) =>
  String(value).replace(/[\\&%$#_{}~^]/g, (character) => {
    const replacements = {
      '\\': '\\textbackslash{}',
      '&': '\\&',
      '%': '\\%',
      $: '\\$',
      '#': '\\#',
      _: '\\_',
      '{': '\\{',
      '}': '\\}',
      '~': '\\textasciitilde{}',
      '^': '\\textasciicircum{}',
    }
    return replacements[character]
  })

const getInterpretationTitle = (visualization) =>
  t(`analytics.sus.interpretations.methods.${visualization.key}.title`)

const getInterpretationCategory = (segment) =>
  t(`analytics.sus.interpretations.categories.${segment.category}`)

function downloadInterpretationSvg(visualization) {
  const width = 960
  const left = 24
  const trackWidth = width - left * 2
  const trackY = 68
  const trackHeight = 38
  const score = analytics.value.averageScore
  const activeSegment = getActiveInterpretationSegment(visualization)
  const resultText = analytics.value.totalRespondents
    ? t(`analytics.sus.interpretations.methods.${visualization.key}.result`, {
        score,
        category: getInterpretationCategory(activeSegment),
      })
    : t('analytics.sus.interpretations.noData')
  const widthTotal = visualization.segments.reduce(
    (sum, segment) => sum + segment.width,
    0,
  )
  let currentX = left
  const segmentMarkup = visualization.segments
    .map((segment, index) => {
      const segmentWidth = (trackWidth * segment.width) / widthTotal
      const active =
        segment === activeSegment && analytics.value.totalRespondents
      const category = escapeXml(getInterpretationCategory(segment))
      const rect = `<rect x="${currentX}" y="${trackY}" width="${segmentWidth}" height="${trackHeight}" fill="${interpretationColors[index % interpretationColors.length]}" stroke="${active ? '#172554' : '#ffffff'}" stroke-width="${active ? 4 : 1}"><title>${category}: ${segment.min}–${segment.max}</title></rect>`
      const label =
        segmentWidth >= 76
          ? `<text x="${currentX + segmentWidth / 2}" y="${trackY + 24}" text-anchor="middle" font-size="13" font-weight="600" fill="#172b4d">${category}</text>`
          : ''
      currentX += segmentWidth
      return `${rect}${label}`
    })
    .join('')
  const scoreMarker =
    analytics.value.totalRespondents && visualization.key !== 'percentileRank'
      ? `<line x1="${left + (trackWidth * score) / 100}" y1="${trackY - 8}" x2="${left + (trackWidth * score) / 100}" y2="${trackY + trackHeight + 8}" stroke="#172554" stroke-width="3"/>`
      : ''
  const axis = [0, 25, 50, 75, 100]
    .map((tick) => {
      const x = left + (trackWidth * tick) / 100
      return `<line x1="${x}" y1="${trackY + trackHeight + 14}" x2="${x}" y2="${trackY + trackHeight + 22}" stroke="#64748b"/><text x="${x}" y="${trackY + trackHeight + 42}" text-anchor="middle" font-size="13" fill="#172b4d">${tick}</text>`
    })
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="160" viewBox="0 0 ${width} 160"><rect width="100%" height="100%" fill="#ffffff"/><text x="${left}" y="30" font-size="20" font-weight="700" fill="#172b4d">${escapeXml(getInterpretationTitle(visualization))}</text><text x="${width - left}" y="30" text-anchor="end" font-size="14" fill="#475569">${escapeXml(resultText)}</text>${segmentMarkup}${scoreMarker}<line x1="${left}" y1="${trackY + trackHeight + 14}" x2="${width - left}" y2="${trackY + trackHeight + 14}" stroke="#64748b"/>${axis}<text x="${left}" y="154" font-size="12" fill="#475569">${escapeXml(t(`analytics.sus.interpretations.${visualization.axisLabel}`))}</text></svg>`
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const fileName = getInterpretationTitle(visualization)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  link.href = url
  link.download = `sus-${fileName || visualization.key}.svg`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

function openInterpretationLatex(visualization) {
  const activeSegment = getActiveInterpretationSegment(visualization)
  const widthTotal = visualization.segments.reduce(
    (sum, segment) => sum + segment.width,
    0,
  )
  let currentX = 0
  const segmentCommands = visualization.segments
    .map((segment, index) => {
      const segmentWidth = (100 * segment.width) / widthTotal
      const color = interpretationColors[index % interpretationColors.length]
        .slice(1)
        .match(/.{2}/g)
        .map((channel) => Number.parseInt(channel, 16))
      const active =
        segment === activeSegment && analytics.value.totalRespondents
      const category = escapeLatex(getInterpretationCategory(segment))
      const commands = [
        `\\definecolor{sussegment${index}}{RGB}{${color.join(',')}}`,
        `\\filldraw[fill=sussegment${index},draw=${active ? 'black,line width=1pt' : 'white'}] (${currentX.toFixed(2)},0) rectangle ++(${segmentWidth.toFixed(2)},0.38);`,
        segmentWidth >= 9
          ? `\\node[font=\\scriptsize,align=center,text width=${Math.max(segmentWidth - 1, 3).toFixed(2)}cm] at (${(currentX + segmentWidth / 2).toFixed(2)},0.19) {${category}};`
          : '',
      ].filter(Boolean)
      currentX += segmentWidth
      return commands.join('\n')
    })
    .join('\n')
  const marker =
    analytics.value.totalRespondents && visualization.key !== 'percentileRank'
      ? `\\draw[black,line width=1.2pt] (${analytics.value.averageScore},-0.12) -- (${analytics.value.averageScore},0.5);`
      : ''
  const result = analytics.value.totalRespondents
    ? t(`analytics.sus.interpretations.methods.${visualization.key}.result`, {
        score: analytics.value.averageScore,
        category: getInterpretationCategory(activeSegment),
      })
    : t('analytics.sus.interpretations.noData')
  const title = escapeLatex(getInterpretationTitle(visualization))

  interpretationLatex.value = [
    '% Requires \\usepackage{tikz}',
    '\\begin{tikzpicture}[x=0.08cm,y=1cm]',
    `\\node[anchor=west,font=\\bfseries] at (0,1.05) {${title}};`,
    `\\node[anchor=east,font=\\small] at (100,1.05) {${escapeLatex(result)}};`,
    segmentCommands,
    marker,
    '\\draw (0,-0.12) -- (100,-0.12);',
    ...scoreAxisLabels.map(
      (tick) =>
        `\\draw (${tick},-0.12) -- (${tick},-0.22) node[below,font=\\scriptsize] {${tick}};`,
    ),
    `\\node[anchor=west,font=\\scriptsize] at (0,-0.62) {${escapeLatex(t(`analytics.sus.interpretations.${visualization.axisLabel}`))}};`,
    '\\end{tikzpicture}',
  ]
    .filter(Boolean)
    .join('\n')
  latexCopyStatus.value = ''
  interpretationLatexDialog.value = true
}

async function copyInterpretationLatex() {
  try {
    await navigator.clipboard.writeText(interpretationLatex.value)
    latexCopyStatus.value = 'copied'
  } catch {
    latexCopyStatus.value = 'copyFailed'
  }
}

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

.sus-interpretation-chart {
  max-width: 100%;
}

.sus-interpretation-track {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 44px;
  align-items: stretch;
  overflow: hidden;
  border-radius: 5px;
  background: #f1f3f5;
}

.sus-interpretation-segment {
  display: flex;
  min-width: 0;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(255, 255, 255, 0.8);
  background: #d9e2ec;
  color: #172b4d;
  transition:
    filter 0.15s ease,
    box-shadow 0.15s ease;
}

.sus-interpretation-segment:nth-child(3n + 1) {
  background-color: #f4a261;
}

.sus-interpretation-segment:nth-child(3n + 2) {
  background-color: #e9c46a;
}

.sus-interpretation-segment:nth-child(3n) {
  background-color: #8abf88;
}

.sus-interpretation-segment--active {
  z-index: 1;
  filter: saturate(1.2);
  box-shadow: inset 0 0 0 3px #172554;
}

.sus-interpretation-segment-label {
  overflow: hidden;
  padding: 2px;
  font-size: 0.7rem;
  font-weight: 700;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sus-interpretation-marker {
  position: absolute;
  z-index: 2;
  top: 0;
  bottom: 0;
  border-left: 2px solid #172554;
  pointer-events: none;
}

.sus-interpretation-axis {
  display: flex;
  justify-content: space-between;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.75rem;
}

@media (max-width: 600px) {
  .sus-interpretation-segment-label {
    display: none;
  }
}
</style>
