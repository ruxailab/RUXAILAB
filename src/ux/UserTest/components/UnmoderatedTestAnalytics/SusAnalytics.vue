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
                {{ formatSUSScore(analytics.averageScore, locale) }}
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
          <div class="d-flex align-center justify-space-between pa-4 pb-2">
            <div class="d-flex align-center flex-wrap ga-3">
              <h2 class="text-h5">
                {{ $t('analytics.sus.interpretations.title') }}
              </h2>
              <v-chip
                v-if="analytics.totalRespondents"
                color="warning"
                variant="tonal"
                size="small"
              >
                {{ $t('analytics.sus.averageScore') }}:
                {{ formatSUSScore(analytics.averageScore, locale) }}
              </v-chip>
            </div>
            <div class="d-flex align-center">
              <v-tooltip
                :text="$t('analytics.sus.interpretations.description')"
                location="top"
                max-width="360"
              >
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-help-circle-outline"
                    size="small"
                    variant="text"
                    :aria-label="
                      $t('analytics.sus.interpretations.description')
                    "
                  />
                </template>
              </v-tooltip>
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
                    :title="$t('analytics.sus.interpretations.downloadSvg')"
                    @click="downloadInterpretationSvg"
                  />
                  <v-list-item
                    prepend-icon="mdi-code-braces"
                    :title="$t('analytics.sus.interpretations.exportLatex')"
                    @click="openInterpretationLatex"
                  />
                </v-list>
              </v-menu>
            </div>
          </div>
          <v-card-text class="pa-4 pt-0">
            <v-alert
              v-if="!analytics.totalRespondents"
              type="info"
              variant="tonal"
              class="mb-3"
            >
              {{ $t('analytics.sus.interpretations.noData') }}
            </v-alert>

            <div class="sus-interpretation-scroll">
              <div class="sus-interpretation-content">
                <div class="sus-interpretation-list">
                  <div class="sus-interpretation-names">
                    <div
                      v-for="visualization in susInterpretationVisualizations"
                      :key="visualization.key"
                      class="sus-interpretation-name"
                    >
                      <span class="text-body-2 font-weight-medium">
                        {{
                          $t(
                            `analytics.sus.interpretations.methods.${visualization.key}.title`,
                          )
                        }}
                      </span>
                      <v-tooltip
                        :text="
                          $t(
                            `analytics.sus.interpretations.methods.${visualization.key}.description`,
                          )
                        "
                        location="top"
                        max-width="360"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-help-circle-outline"
                            size="x-small"
                            variant="text"
                            :aria-label="
                              $t(
                                `analytics.sus.interpretations.methods.${visualization.key}.description`,
                              )
                            "
                          />
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                  <div class="sus-interpretation-tracks">
                    <div
                      v-for="visualization in susInterpretationVisualizations"
                      :key="visualization.key"
                      class="sus-interpretation-track"
                      role="list"
                      :aria-label="
                        $t(
                          `analytics.sus.interpretations.methods.${visualization.key}.title`,
                        )
                      "
                    >
                      <v-tooltip
                        v-for="(segment, index) in visualization.segments"
                        :key="`${segment.category}-${segment.min}-${segment.max}`"
                        :text="
                          getInterpretationTooltip(
                            segment,
                            locale,
                            (category) =>
                              $t(
                                `analytics.sus.interpretations.categories.${category}`,
                              ),
                          )
                        "
                        location="top"
                      >
                        <template #activator="{ props }">
                          <div
                            v-bind="props"
                            class="sus-interpretation-segment"
                            :class="{
                              'sus-interpretation-segment--active':
                                analytics.totalRespondents &&
                                isActiveInterpretationSegment(
                                  visualization,
                                  segment,
                                ),
                            }"
                            :style="{
                              flex: `${segment.width} 1 0%`,
                              backgroundColor: getInterpretationColor(
                                visualization,
                                index,
                              ),
                            }"
                            :aria-label="
                              getInterpretationTooltip(
                                segment,
                                locale,
                                (category) =>
                                  $t(
                                    `analytics.sus.interpretations.categories.${category}`,
                                  ),
                              )
                            "
                            role="listitem"
                          >
                            <span
                              v-if="
                                segment.width >= 8 ||
                                (visualization.key === 'curvedGradingScale' &&
                                  segment.width >= 3)
                              "
                              class="sus-interpretation-segment-label"
                            >
                              {{
                                $t(
                                  `analytics.sus.interpretations.categories.${segment.category}`,
                                )
                              }}
                            </span>
                          </div>
                        </template>
                      </v-tooltip>
                    </div>
                    <div
                      v-if="analytics.totalRespondents"
                      class="sus-interpretation-marker"
                      :style="{ left: `${analytics.averageScore}%` }"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div class="sus-interpretation-axis-row">
                  <span class="text-caption font-weight-medium">
                    {{ $t('analytics.sus.interpretations.scoreAxisTitle') }}
                  </span>
                  <div class="sus-interpretation-axis" aria-hidden="true">
                    <span
                      v-for="tick in scoreAxisLabels"
                      :key="tick"
                      :style="{ left: `${tick}%` }"
                    >
                      {{ tick }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <a
              class="text-caption d-inline-block mt-4"
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
                <!-- <span class="text-h4 font-weight-bold text-primary mr-2">
                  {{ formatSUSScore(selectedResponse.susScore, locale) }}
                </span> -->
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
import {
  SUS_INTERPRETATION_VISUALIZATIONS,
  formatSUSScore,
  getActiveInterpretationSegment as findActiveInterpretationSegment,
  getInterpretationRange,
  getInterpretationTooltip,
} from '../../utils/susInterpretations'
import { useStore } from 'vuex'
import SusHistogramChart from '@/ux/UserTest/SusHistogramChart.vue'
import SusRatingChart from '@/ux/UserTest/SusRatingChart.vue'

const store = useStore()
const { t, locale } = useI18n()

const detailsModal = ref(false)
const selectedResponse = ref(null)
const interpretationLatexDialog = ref(false)
const interpretationLatex = ref('')
const latexCopyStatus = ref('')
const selectedRatingFilter = ref(null)
const scoreRange = ref([0, 100])
const dialogMaxWidth = 800
const scoreAxisLabels = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
const susInterpretationVisualizations = SUS_INTERPRETATION_VISUALIZATIONS

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
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0,
    totalRespondents: tasksArray.value.length,
    minScore: scores.length ? Math.min(...scores) : 0,
    maxScore: scores.length ? Math.max(...scores) : 0,
  }
})

function isActiveInterpretationSegment(visualization, segment) {
  return (
    findActiveInterpretationSegment(
      visualization,
      analytics.value.averageScore,
    ) === segment
  )
}

function getActiveInterpretationSegment(visualization) {
  return findActiveInterpretationSegment(
    visualization,
    analytics.value.averageScore,
  )
}

const interpretationColors = [
  '#f2c5c2',
  '#f3cec4',
  '#f4d8c6',
  '#f5e1c9',
  '#f5eacb',
  '#f1edcf',
  '#e6eccf',
  '#d9e9ce',
  '#cde5ce',
  '#c0e0cb',
  '#afd9c5',
  '#9fd1bd',
]

function getInterpretationColor(visualization, index) {
  const palettePosition =
    (index / Math.max(visualization.segments.length - 1, 1)) *
    (interpretationColors.length - 1)
  return interpretationColors[Math.round(palettePosition)]
}

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

function downloadInterpretationSvg() {
  const width = 1200
  const left = 280
  const right = 28
  const trackWidth = width - left - right
  const top = 72
  const rowHeight = 60
  const trackHeight = 34
  const height = top + rowHeight * susInterpretationVisualizations.length + 76
  const score = analytics.value.averageScore
  const rows = susInterpretationVisualizations
    .map((visualization, rowIndex) => {
      const trackY = top + rowIndex * rowHeight
      const activeSegment = getActiveInterpretationSegment(visualization)
      const widthTotal = visualization.segments.reduce(
        (sum, segment) => sum + segment.width,
        0,
      )
      let currentX = left
      const segments = visualization.segments
        .map((segment, index) => {
          const segmentWidth = (trackWidth * segment.width) / widthTotal
          const active =
            segment === activeSegment && analytics.value.totalRespondents
          const category = escapeXml(getInterpretationCategory(segment))
          const rect = `<rect x="${currentX}" y="${trackY}" width="${segmentWidth}" height="${trackHeight}" fill="${getInterpretationColor(visualization, index)}" stroke="${active ? '#334155' : '#ffffff'}" stroke-width="${active ? 3 : 1}"><title>${category}: ${escapeXml(getInterpretationRange(segment, locale.value))}</title></rect>`
          const label =
            segmentWidth >= 76
              ? `<text x="${currentX + segmentWidth / 2}" y="${trackY + 22}" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">${category}</text>`
              : ''
          currentX += segmentWidth
          return `${rect}${label}`
        })
        .join('')
      const title = escapeXml(getInterpretationTitle(visualization))
      return `<text x="${left - 14}" y="${trackY + 21}" text-anchor="end" font-size="14" font-weight="600" fill="#334155">${title}</text>${segments}`
    })
    .join('')
  const scoreMarker = analytics.value.totalRespondents
    ? `<line x1="${left + (trackWidth * score) / 100}" y1="${top - 4}" x2="${left + (trackWidth * score) / 100}" y2="${top + rowHeight * (susInterpretationVisualizations.length - 1) + trackHeight + 4}" stroke="#172554" stroke-width="2"/>`
    : ''
  const axisY = top + rowHeight * susInterpretationVisualizations.length + 8
  const axis = scoreAxisLabels
    .map((tick) => {
      const x = left + (trackWidth * tick) / 100
      return `<line x1="${x}" y1="${axisY}" x2="${x}" y2="${axisY + 8}" stroke="#64748b"/><text x="${x}" y="${axisY + 26}" text-anchor="middle" font-size="13" fill="#334155">${tick}</text>`
    })
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#ffffff"/><text x="24" y="36" font-size="22" font-weight="700" fill="#172b4d">${escapeXml(t('analytics.sus.interpretations.title'))}</text>${rows}${scoreMarker}<line x1="${left}" y1="${axisY}" x2="${width - right}" y2="${axisY}" stroke="#64748b"/>${axis}<text x="${left}" y="${height - 12}" text-anchor="middle" font-size="13" font-weight="600" fill="#475569">${escapeXml(t('analytics.sus.interpretations.scoreAxisTitle'))}</text></svg>`
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const fileName = t('analytics.sus.interpretations.title')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  link.href = url
  link.download = `sus-${fileName || 'five-ways'}.svg`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

function openInterpretationLatex() {
  const left = 32
  const rowGap = 0.9
  const trackHeight = 0.38
  const title = escapeLatex(t('analytics.sus.interpretations.title'))
  const commands = [
    '% Requires \\usepackage{tikz,xcolor}',
    '\\begin{tikzpicture}[x=0.12cm,y=1cm,font=\\sffamily\\scriptsize]',
    `\\node[anchor=west,font=\\bfseries\\large] at (0,1.1) {${title}};`,
  ]

  susInterpretationVisualizations.forEach((visualization, rowIndex) => {
    const y = -rowIndex * rowGap
    const activeSegment = getActiveInterpretationSegment(visualization)
    const widthTotal = visualization.segments.reduce(
      (sum, segment) => sum + segment.width,
      0,
    )
    let currentX = left

    commands.push(
      `\\node[anchor=east,align=right,text width=3.5cm] at (${left - 2},${y + trackHeight / 2}) {${escapeLatex(getInterpretationTitle(visualization))}};`,
    )

    visualization.segments.forEach((segment, index) => {
      const segmentWidth = (100 * segment.width) / widthTotal
      const color = getInterpretationColor(visualization, index)
        .slice(1)
        .match(/.{2}/g)
        .map((channel) => Number.parseInt(channel, 16))
      const colorName = `sussegment${rowIndex}_${index}`
      const active =
        segment === activeSegment && analytics.value.totalRespondents
      const category = escapeLatex(getInterpretationCategory(segment))
      commands.push(
        `\\definecolor{${colorName}}{RGB}{${color.join(',')}}`,
        `\\filldraw[fill=${colorName},draw=${active ? 'black,line width=1pt' : 'white'}] (${currentX.toFixed(2)},${y.toFixed(2)}) rectangle ++(${segmentWidth.toFixed(2)},${trackHeight});`,
      )
      if (segmentWidth >= 9) {
        commands.push(
          `\\node[align=center,text width=${Math.max(segmentWidth - 1, 3).toFixed(2)}cm] at (${(currentX + segmentWidth / 2).toFixed(2)},${(y + trackHeight / 2).toFixed(2)}) {${category}};`,
        )
      }
      currentX += segmentWidth
    })
  })

  if (analytics.value.totalRespondents) {
    const scoreX = left + analytics.value.averageScore
    const lastRowY = -(susInterpretationVisualizations.length - 1) * rowGap
    commands.push(
      `\\draw[black,line width=1.2pt] (${scoreX},${(lastRowY - 0.08).toFixed(2)}) -- (${scoreX},${(trackHeight + 0.08).toFixed(2)});`,
    )
  }

  const axisY = -(susInterpretationVisualizations.length - 1) * rowGap - 0.25
  commands.push(
    `\\draw (${left},${axisY}) -- (${left + 100},${axisY});`,
    ...scoreAxisLabels.map(
      (tick) =>
        `\\draw (${left + tick},${axisY}) -- (${left + tick},${axisY - 0.1}) node[below] {${tick}};`,
    ),
    `\\node[anchor=north] at (${left + 50},${axisY - 0.42}) {${escapeLatex(t('analytics.sus.interpretations.scoreAxisTitle'))}};`,
    '\\end{tikzpicture}',
  )
  interpretationLatex.value = [...commands].join('\n')
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

.sus-interpretation-scroll {
  max-width: 100%;
  overflow-x: auto;
  padding-bottom: 4px;
}

.sus-interpretation-content {
  min-width: 860px;
}

.sus-interpretation-list {
  display: grid;
  grid-template-columns: 240px minmax(600px, 1fr);
  column-gap: 12px;
}

.sus-interpretation-names,
.sus-interpretation-tracks {
  display: grid;
  grid-template-rows: repeat(5, 36px);
  row-gap: 5px;
}

.sus-interpretation-tracks {
  position: relative;
}

.sus-interpretation-name {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 2px;
}

.sus-interpretation-name > span {
  min-width: 0;
}

.sus-interpretation-track {
  display: flex;
  width: 100%;
  min-height: 36px;
  align-items: stretch;
  overflow: hidden;
  border-radius: 4px;
  background: #e8edf2;
}

.sus-interpretation-segment {
  display: flex;
  min-width: 0;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(255, 255, 255, 0.75);
  color: #202b38;
  transition:
    filter 0.15s ease,
    box-shadow 0.15s ease;
}

.sus-interpretation-segment--active {
  z-index: 1;
  filter: saturate(1.12);
  box-shadow: inset 0 0 0 2px #172554;
}

.sus-interpretation-segment-label {
  overflow: hidden;
  padding: 1px;
  font-size: 0.65rem;
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
  left: 0;
  border-left: 2px solid #172554;
  pointer-events: none;
}

.sus-interpretation-axis {
  position: relative;
  display: block;
  height: 24px;
  padding-top: 8px;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.75rem;
}

.sus-interpretation-axis::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  border-top: 1px solid #64748b;
  content: '';
}

.sus-interpretation-axis > span {
  position: absolute;
  top: 8px;
  transform: translateX(-50%);
  white-space: nowrap;
}

.sus-interpretation-axis > span:first-child {
  transform: none;
}

.sus-interpretation-axis > span:last-child {
  transform: translateX(-100%);
}

.sus-interpretation-axis > span::before {
  position: absolute;
  top: -8px;
  left: 50%;
  height: 6px;
  border-left: 1px solid #64748b;
  content: '';
}

.sus-interpretation-axis > span:first-child::before {
  left: 0;
}

.sus-interpretation-axis > span:last-child::before {
  right: 0;
  left: auto;
}

.sus-interpretation-axis-row {
  display: grid;
  grid-template-columns: 240px minmax(600px, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.sus-interpretation-axis-row > span {
  text-align: right;
  padding-right: 4px;
}

@media (max-width: 600px) {
  .sus-interpretation-name {
    font-size: 0.75rem;
  }
}
</style>
