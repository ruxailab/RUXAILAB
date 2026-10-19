<template>
  <div class="bg-background pa-2 pa-md-3">
    <!-- Filtros dinámicos -->
    <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
      <div class="d-flex align-center mb-3 flex-wrap button-bar">
        <v-text-field
          v-model="searchTerm"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          variant="outlined"
          :placeholder="$t('analytics.searchByName')"
          class="flex-grow-1"
        />
        <v-btn
          color="primary"
          class="search-btn"
          prepend-icon="mdi-magnify"
          @click="triggerSearch"
        >
          {{ $t('analytics.search') }}
        </v-btn>
        <v-btn
          color="primary"
          class="search-btn"
          prepend-icon="mdi-filter-remove"
          :disabled="!hasActiveFilters"
          @click="resetFilters"
        >
          {{ $t('analytics.reset') }}
        </v-btn>

        <v-btn
          color="info"
          class="search-btn"
          prepend-icon="mdi-download"
          @click="downloadPdfResume"
        >
          {{ $t('analytics.downloadResume') }}
        </v-btn>

        <v-btn
          :color="showFilters ? 'primary' : 'grey'"
          variant="tonal"
          icon
          size="small"
          :title="
            showFilters
              ? $t('analytics.hideFilters')
              : $t('analytics.showFilters')
          "
          @click="toggleFilters"
        >
          <v-icon>{{
            showFilters ? 'mdi-filter-off-outline' : 'mdi-filter-variant'
          }}</v-icon>
        </v-btn>
      </div>

      <v-expand-transition>
        <div v-show="showFilters">
          <v-row dense>
            <v-col
              v-for="def in filterDefinitions"
              :key="'filter-' + def.index"
              cols="12"
              sm="6"
              md="3"
            >
              <!-- Label / tooltip above field -->
              <v-tooltip v-if="(def.title || '').length > 42" location="top">
                <template #activator="{ props }">
                  <div class="filter-label truncate-2" v-bind="props">
                    {{ def.title }}
                  </div>
                </template>
                <span class="text-wrap">{{ def.title }}</span>
              </v-tooltip>
              <div v-else class="filter-label truncate-2">
                {{ def.title }}
              </div>
              <!-- Categórico (multi-select) -->
              <v-select
                v-if="def.isCategorical && def.items.length"
                v-model="selectedFilters[def.index]"
                :items="def.items"
                multiple
                chips
                clearable
                density="compact"
                variant="outlined"
                hide-details
                class="filter-field"
                @update:model-value="(val) => onFilterChange(def.index, val)"
              />
              <!-- Texto libre / numérico (match contiene) -->
              <v-text-field
                v-else
                v-model="selectedFilters[def.index]"
                density="compact"
                variant="outlined"
                hide-details
                clearable
                class="filter-field"
              />
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </v-card>

    <!-- UX Metrics Row (ahora primera fila) -->
    <v-row>
      <v-col cols="12" md="4">
        <UxMetricCard
          :value="`${calculateEffectiveness().toFixed(1)}%`"
          :label="$t('analytics.effectiveness')"
          color="success"
          icon="mdi-target-account"
          :description="$t('analytics.effectivenessDescription')"
          :progress="calculateEffectiveness()"
        />
      </v-col>
      <v-col cols="12" md="4">
        <UxMetricCard
          :value="`${calculateEfficiency().tasksPerMinute} ${$t('analytics.taskRateUnit')}`"
          :label="$t('analytics.efficiency')"
          color="info"
          icon="mdi-speedometer"
          :description="
            $t('analytics.efficiencyDescription', {
              avgTime: calculateEfficiency().avgTime,
            })
          "
          :progress="Math.min(calculateEfficiency().score * 10, 100)"
        />
      </v-col>
      <v-col cols="12" md="4">
        <UxMetricCard
          :value="`${getAverageSatisfaction().toFixed(1)}`"
          :label="$t('analytics.satisfaction')"
          color="warning"
          icon="mdi-heart"
          :description="$t('analytics.satisfactionDescription')"
          :progress="getAverageSatisfaction()"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6">
        <v-card
          class="pa-4 pa-md-6 elevation-4 rounded-xl h-100 conclusion-card"
        >
          <div class="d-flex justify-space-between align-start mb-6">
            <div>
              <div class="d-flex align-center mb-3">
                <v-icon color="primary" size="28" class="me-3">
                  mdi-target
                </v-icon>
                <h3 class="text-h5 font-weight-medium text-on-surface">
                  {{ $t('analytics.conclusionRate') }}
                </h3>
              </div>
              <div class="text-h2 font-weight-bold text-primary mb-2">
                {{ parseFloat(getConclusionAverage()).toFixed(2) }}%
              </div>
            </div>
            <div class="text-end">
              <v-chip color="success" variant="flat" size="small" class="mb-2">
                <v-icon start size="16"> mdi-trending-up </v-icon>
                Max {{ parseFloat(maxProgressPerTask()).toFixed(2) }}%
              </v-chip>
              <br />
              <v-chip color="error" variant="flat" size="small">
                <v-icon start size="16"> mdi-trending-down </v-icon>
                Min {{ parseFloat(minProgressPerTask()).toFixed(2) }}%
              </v-chip>
            </div>
          </div>

          <v-progress-linear
            :model-value="getConclusionAverage()"
            color="primary"
            height="12"
            rounded
            class="mb-6 progress-glow"
          />

          <v-divider class="mb-6" />

          <div class="d-flex justify-space-between">
            <div class="text-center">
              <div class="text-h4 font-weight-bold text-secondary mb-1">
                {{ getTestsInProgress().totalInProgress }}
              </div>
              <p class="text-body-2 text-medium-emphasis">
                {{ $t('analytics.testsInProgress') }}
              </p>
            </div>
            <v-divider vertical class="mx-4" />
            <div class="text-center">
              <div class="text-h4 font-weight-bold text-accent mb-1">16m</div>
              <p class="text-body-2 text-medium-emphasis">
                {{ $t('analytics.totalDuration') }}
              </p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" lg="6">
        <v-row class="h-100">
          <v-col cols="6">
            <UxMetricCard
              :value="calculateAverageTime().formatedTime"
              :label="$t('analytics.avgTimePerTask')"
              color="primary"
              icon="mdi-clock-fast"
              :description="$t('analytics.efficientTaskCompletion')"
              :progress="Math.min(calculateEfficiency().score * 10, 100)"
              :show-progress="false"
            />
          </v-col>
          <v-col cols="6">
            <UxMetricCard
              v-if="testStructure?.userTasks && taskAnswers.length"
              :value="findLongestTask().averageTime.formatedTime"
              :label="$t('analytics.longestTask')"
              color="error"
              icon="mdi-timer-alert"
              :description="`${$t('analytics.taskLabel')}: ${findLongestTask().taskName}`"
              :progress="Math.min(longestTaskProgressValue, 100)"
              :show-progress="false"
            >
              <template #description>
                <span class="text-caption text-medium-emphasis">
                  {{ $t('analytics.taskLabel') }}:
                  <strong>"{{ findLongestTask().taskName }}"</strong>
                </span>
              </template>
            </UxMetricCard>
          </v-col>
          <v-col cols="6">
            <UxMetricCard
              :value="getTotalAnswers()"
              :label="$t('analytics.totalAnswers')"
              color="success"
              icon="mdi-check-circle"
              :description="`+${getTasksTodayCount()}/${$t('analytics.day')}`"
              :progress="
                Math.min(
                  (getTotalAnswers() /
                    Math.max(filteredSessions.length || 1, 1)) *
                    100,
                  100,
                )
              "
              :show-progress="false"
            >
              <template #description>
                <div class="d-flex align-center text-caption text-success">
                  <v-icon color="success" size="16" class="me-1">
                    mdi-trending-up
                  </v-icon>
                  <span
                    >+{{ getTasksTodayCount() }}/{{ $t('analytics.day') }}</span
                  >
                </div>
              </template>
            </UxMetricCard>
          </v-col>
          <v-col cols="6">
            <UxMetricCard
              :value="$t('analytics.evaluator')"
              :label="$t('analytics.latestUser')"
              color="accent"
              icon="mdi-account-circle"
              :description="getFormattedDate(getLatestResponse().lastUpdate)"
              :progress="100"
              :show-progress="false"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Task Performance Charts -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="pa-4 pa-md-6 elevation-4 rounded-xl">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
                {{ $t('analytics.taskPerformance') }}
              </h3>
              <p class="text-body-1 text-medium-emphasis">
                {{ $t('analytics.taskPerformanceDescription') }}
              </p>
              <p class="text-caption text-medium-emphasis mt-2">
                {{ $t('analytics.taskPerformanceFormula') }}
              </p>
            </div>
          </div>

          <v-row>
            <v-col
              v-for="taskStat in taskPerformanceCards"
              :key="taskStat.taskId"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                class="pa-3 pa-sm-4 elevation-4 rounded-xl task-chart-card"
              >
                <div class="text-center mb-4">
                  <h4 class="text-h6 font-weight-bold mb-2">
                    {{ taskStat.taskName }}
                  </h4>
                </div>

                <div class="task-donut-row">
                  <div class="task-donut-item">
                    <v-chip
                      :color="
                        taskStat.successRate >= 70
                          ? 'success'
                          : taskStat.successRate >= 50
                            ? 'warning'
                            : 'error'
                      "
                      variant="tonal"
                      size="small"
                    >
                      {{ taskStat.successRate.toFixed(1) }}%
                      {{ $t('analytics.effectiveness') }}
                    </v-chip>
                    <div class="chart-container-small">
                      <canvas
                        :id="'task-chart-' + taskStat.taskId"
                        class="task-chart"
                        width="120"
                        height="120"
                      />
                    </div>
                  </div>
                  <div class="task-donut-item">
                    <v-chip
                      :color="
                        getEfficiencyPercentageColor(
                          taskStat.relativeEfficiencyPercentage,
                        )
                      "
                      variant="tonal"
                      size="small"
                    >
                      {{
                        taskStat.relativeEfficiencyPercentage === null
                          ? $t('analytics.noData')
                          : `${taskStat.relativeEfficiencyPercentage.toFixed(1)}%`
                      }}
                      {{ $t('analytics.relativeEfficiency') }}
                    </v-chip>
                    <div class="chart-container-small">
                      <canvas
                        :id="'task-efficiency-chart-' + taskStat.taskId"
                        class="task-chart"
                        width="120"
                        height="120"
                      />
                    </div>
                  </div>
                </div>

                <div class="task-outcome-summary">
                  <div class="task-outcome-item">
                    <div class="d-flex align-center">
                      <div class="legend-dot bg-success mr-2" />
                      <span>{{ $t('analytics.successCount') }}</span>
                    </div>
                    <strong>{{ taskStat.success }}</strong>
                  </div>
                  <div class="task-outcome-item">
                    <div class="d-flex align-center">
                      <div class="legend-dot bg-error mr-2" />
                      <span>{{ $t('analytics.couldNotFinish') }}</span>
                    </div>
                    <strong>{{ taskStat.couldNotFinish }}</strong>
                  </div>
                  <div class="task-outcome-item">
                    <div class="d-flex align-center">
                      <div class="legend-dot bg-grey mr-2" />
                      <span>{{ $t('analytics.notStarted') }}</span>
                    </div>
                    <strong>{{ taskStat.notStarted }}</strong>
                  </div>
                </div>

                <div
                  class="text-caption text-medium-emphasis text-uppercase mt-4"
                >
                  {{ $t('analytics.taskTimingMetrics') }}
                </div>
                <div class="task-timing-details">
                  <div class="task-timing-detail">
                    <span class="task-timing-detail-label text-medium-emphasis">
                      {{ $t('analytics.taskEfficiency') }}
                    </span>
                    <strong class="task-timing-detail-value">
                      {{
                        taskStat.efficiency === null
                          ? $t('analytics.noData')
                          : taskStat.efficiency.toFixed(4)
                      }}
                    </strong>
                  </div>
                  <div class="task-timing-detail">
                    <span class="task-timing-detail-label text-medium-emphasis">
                      {{ $t('analytics.averageTaskTime') }}
                    </span>
                    <strong class="task-timing-detail-value">
                      {{
                        taskStat.averageTimeMinutes === null
                          ? $t('analytics.noData')
                          : formatTimeDetailedFromMs(
                              taskStat.averageTimeMinutes * 60000,
                            ).formatedTime
                      }}
                    </strong>
                  </div>
                  <div class="task-timing-detail">
                    <span class="task-timing-detail-label text-medium-emphasis">
                      {{ $t('analytics.estimatedTime') }}
                    </span>
                    <strong class="task-timing-detail-value">
                      {{
                        taskStat.estimatedTimeMinutes === null
                          ? $t('analytics.noEstimate')
                          : formatTimeDetailedFromMs(
                              taskStat.estimatedTimeMinutes * 60000,
                            ).formatedTime
                      }}
                    </strong>
                  </div>
                  <div class="task-timing-detail">
                    <span class="task-timing-detail-label text-medium-emphasis">
                      {{ $t('analytics.timeDifference') }}
                    </span>
                    <strong class="task-timing-detail-value">
                      {{
                        taskStat.timeDifferenceMinutes === null
                          ? $t('analytics.noData')
                          : formatTimeDifference(taskStat.timeDifferenceMinutes)
                      }}
                    </strong>
                  </div>
                  <div class="task-timing-detail">
                    <span class="task-timing-detail-label text-medium-emphasis">
                      {{ $t('analytics.estimateComparison') }}
                    </span>
                    <v-chip
                      size="small"
                      variant="tonal"
                      :color="getEstimateStatusColor(taskStat.comparisonStatus)"
                    >
                      {{ $t(`analytics.${taskStat.comparisonStatus}`) }}
                    </v-chip>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <div class="mt-8">
            <h4 class="text-h6 font-weight-bold mb-5">
              {{ $t('analytics.taskEfficiencyChart') }}
            </h4>
            <p class="text-caption text-medium-emphasis mb-3">
              {{ $t('analytics.taskEfficiencyChartFormula') }}
            </p>
            <div class="analytics-bar-chart analytics-bar-chart-scroll">
              <div
                class="analytics-bar-chart-content"
                :style="{
                  '--chart-min-width': `${taskTimingStats.length * 80}px`,
                }"
              >
                <Bar
                  :data="taskEfficiencyChartData"
                  :options="taskEfficiencyChartOptions"
                />
              </div>
            </div>
          </div>

          <div class="mt-8">
            <h4 class="text-h6 font-weight-bold mb-5">
              {{ $t('analytics.taskTimeVsEstimate') }}
            </h4>
            <p class="text-caption text-medium-emphasis mb-3">
              {{ $t('analytics.taskTimeVsEstimateFormula') }}
            </p>
            <div class="analytics-bar-chart analytics-bar-chart-scroll">
              <div
                class="analytics-bar-chart-content"
                :style="{
                  '--chart-min-width': `${taskDefinitions.length * 80}px`,
                }"
              >
                <Bar
                  :data="taskTimeComparisonChartData"
                  :options="taskTimeComparisonChartOptions"
                />
              </div>
            </div>
          </div>

          <div class="mt-8">
            <h4 class="text-h6 font-weight-bold mb-5">
              {{ $t('analytics.taskTimeByUser') }}
            </h4>
            <p class="text-caption text-medium-emphasis mb-3">
              {{ $t('analytics.taskTimeByUserFormula') }}
            </p>
            <div class="analytics-bar-chart analytics-bar-chart-scroll">
              <div
                class="analytics-bar-chart-content"
                :style="{
                  '--chart-min-width': `${filteredSessions.length * 80}px`,
                }"
              >
                <Bar
                  :data="timeByUserChartData"
                  :options="timeByUserChartOptions"
                />
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mostrar todas las preguntas del pre-form -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="pa-4 pa-md-6 elevation-4 rounded-xl">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
                {{ $t('analytics.preTest') }}
              </h3>
              <p class="text-body-1 text-medium-emphasis">
                {{ $t('analytics.preTestDescription') }}
              </p>
            </div>
          </div>
          <v-row>
            <template v-for="(q, idx) in testStructure?.preTest || []">
              <v-col
                v-if="
                  Array.isArray(q.selectionFields) &&
                  q.selectionFields.length > 0
                "
                :key="'pre-sel-' + (q.title || q.question || idx)"
                cols="12"
                md="6"
                lg="4"
              >
                <SelectionPieChart
                  :question-title="q.title || q.question"
                  :options="q.selectionFields"
                  :counts="getPreSelectionCounts(idx)"
                  :canvas-id="'pretest-selection-chart-' + idx"
                  :chart-colors="chartColors"
                />
              </v-col>
              <v-col
                v-else
                :key="'pre-com-' + (q.title || q.question || idx)"
                cols="12"
              >
                <CommentListCard
                  :question-title="q.title || q.question"
                  :answer="getPreTextAnswers(idx)"
                />
              </v-col>
            </template>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mostrar todas las preguntas del post-form -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="pa-4 pa-md-6 elevation-4 rounded-xl">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
                {{ $t('analytics.postTest') }}
              </h3>
              <p class="text-body-1 text-medium-emphasis">
                {{ $t('analytics.postTestDescription') }}
              </p>
            </div>
          </div>
          <v-row>
            <template
              v-for="(q, idx) in filteredSessions[0]?.postTestAnswer || []"
            >
              <v-col
                v-if="
                  Array.isArray(q.selectionFields) &&
                  q.selectionFields.length > 0
                "
                :key="'sel-' + (q.question || idx)"
                cols="12"
                md="6"
                lg="4"
              >
                <SelectionPieChart
                  :question-title="q.title || q.question"
                  :options="q.selectionFields"
                  :counts="getSelectionCounts(idx)"
                  :canvas-id="'posttest-selection-chart-' + idx"
                  :chart-colors="chartColors"
                />
              </v-col>
              <v-col v-else :key="'com-' + (q.question || idx)" cols="12">
                <CommentListCard
                  :question-title="q.title || q.question"
                  :answer="q.answer"
                />
              </v-col>
            </template>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Chart Section -->
    <AnswersTimeline
      :task-answers="filteredSessions"
      @refresh="onRefreshTimeline"
      @export="onExportTimeline"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { formatTimeDetailedFromMs } from '@/shared/utils/timeUtils'
import UxMetricCard from '../answers/UxMetricCard.vue'
import CommentListCard from '../answers/CommentListCard.vue'
import SelectionPieChart from '../answers/SelectionPieChart.vue'
import AnswersTimeline from '../answers/AnswersTimeline.vue'
import { calculateSUSScore } from '../../utils/susCalculator'
import { getNASATLXData } from '../../utils/nasaTlxData'
import { useFilterDefinitions } from './useFilterDefinitions'
import { exportStudySummary } from '@/shared/utils/studySummaryExport'
import { showError } from '@/shared/utils/toast'
import { requestStudySummaryPdf } from '@/shared/services/studySummaryService'
import { recordReportDownload } from '@/shared/services/auditTrailService'

ChartJS.register(
  BarElement,
  CategoryScale,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
)

// Declaraciones reactivas primero para evitar errores de acceso antes de inicialización
const testTasks = ref([])
const taskAnswers = ref([])

// Filtering system
const searchTerm = ref('')
const selectedFilters = ref({})
const showFilters = ref(true)
const ALL_VALUE = '__ALL__'

// Colores para el gráfico
const chartColors = [
  '#42A5F5',
  '#66BB6A',
  '#FFA726',
  '#AB47BC',
  '#EC407A',
  '#FF7043',
  '#26A69A',
  '#D4E157',
]

// Encuentra todas las preguntas de selección
computed(() => {
  if (!taskAnswers.value.length || !taskAnswers.value[0].postTestAnswer)
    return []
  return taskAnswers.value[0].postTestAnswer.filter(
    (q) => Array.isArray(q.selectionFields) && q.selectionFields.length > 0,
  )
})

// Devuelve los recuentos de respuestas para una pregunta de selección específica (por índice)
function getSelectionCounts(questionIdx) {
  const counts = {}
  const q = filteredSessions.value[0]?.postTestAnswer?.[questionIdx]
  if (!q) return counts
  q.selectionFields.forEach((opt) => {
    counts[opt] = 0
  })
  filteredSessions.value.forEach((ans) => {
    if (
      ans.postTestAnswer &&
      ans.postTestAnswer[questionIdx] &&
      ans.postTestAnswer[questionIdx].answer
    ) {
      const answer = ans.postTestAnswer[questionIdx].answer
      if (Array.isArray(answer)) {
        answer.forEach((a) => {
          if (counts[a] !== undefined) counts[a]++
        })
      } else if (counts[answer] !== undefined) {
        counts[answer]++
      }
    }
  })
  return counts
}

function getPreSelectionCounts(questionIdx) {
  const counts = {}
  if (!testStructure.value?.preTest?.[questionIdx]?.selectionFields)
    return counts
  const options = testStructure.value.preTest[questionIdx].selectionFields
  options.forEach((opt) => {
    counts[opt] = 0
  })
  filteredSessions.value.forEach((ans) => {
    const answerObj = ans.preTestAnswer?.[questionIdx]
    if (answerObj && answerObj.answer !== undefined) {
      const answer = answerObj.answer
      if (Array.isArray(answer)) {
        answer.forEach((a) => {
          if (counts[a] !== undefined) counts[a]++
        })
      } else if (counts[answer] !== undefined) {
        counts[answer]++
      }
    }
  })
  return counts
}

function getPreTextAnswers(questionIdx) {
  const list = []
  filteredSessions.value.forEach((ans) => {
    const a = ans.preTestAnswer?.[questionIdx]?.answer
    if (a !== undefined && a !== null && a !== '') list.push(a)
  })
  return list
}

const store = useStore()
const { t } = useI18n()

const test = computed(() => store.getters.test)
const user = computed(() => store.getters.user)
const testStructure = computed(() => store.state.Tests.Test.testStructure)
const answers = computed(() => {
  if (!store.getters.visibleUserAnswers) return {}
  return store.getters.visibleUserAnswers
})

// Filter definitions based on pre-test questions
const { filterDefinitions } = useFilterDefinitions({
  testStructure,
  answers,
  ALL_VALUE,
})

// Check if there are active filters
const hasActiveFilters = computed(() => {
  const someFilters = Object.entries(selectedFilters.value).some(([_k, v]) => {
    if (Array.isArray(v)) return v.length && !v.includes(ALL_VALUE)
    return !!v // texto
  })
  return someFilters || !!searchTerm.value.trim()
})

// Filtered sessions based on search term and filters
const filteredSessions = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return Object.values(answers.value).filter((session) => {
    if (term) {
      const name = (session.fullName || '').toLowerCase()
      const email = (session.email || '').toLowerCase()
      if (!name.includes(term) && !email.includes(term)) return false
    }
    return filterDefinitions.value.every((def) => {
      const sel = selectedFilters.value[def.index]
      // Sin filtro aplicado
      if (
        sel === undefined ||
        sel === null ||
        sel === '' ||
        (Array.isArray(sel) && (sel.length === 0 || sel.includes(ALL_VALUE)))
      )
        return true
      const ans = session.preTestAnswer?.[def.index]?.answer || ''
      if (def.isCategorical) {
        return Array.isArray(sel) ? sel.includes(ans) : true
      } else {
        // texto libre: substring case-insensitive
        if (typeof sel === 'string')
          return ans.toString().toLowerCase().includes(sel.toLowerCase())
        return true
      }
    })
  })
})
const averageTimePerTask = computed(() => {
  let totalTasks = 0
  let totalTaskTime = 0

  if (!filteredSessions.value.length) return 0

  filteredSessions.value.forEach((answer) => {
    Object.values(answer.tasks || {}).forEach((task) => {
      totalTaskTime += task.taskTime
      totalTasks++
    })
  })

  return totalTasks === 0 ? 0 : totalTaskTime / totalTasks
})

const downloadPdfResume = async () => {
  recordReportDownload(test.value?.id).catch(() => {})
  try {
    await exportStudySummary({
      study: test.value,
      user: user.value,
      answers: answers.value,
      notifyDenied: showError,
      requestPdf: () => requestStudySummaryPdf(test.value.id),
      savePdf: (pdf, filename) => {
        const blob = new Blob([pdf], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        window.URL.revokeObjectURL(url)
      },
    })
  } catch {
    showError('Unable to generate the summary PDF.')
  }
}

const findLongestTask = () => {
  if (!filteredSessions.value.length) {
    return { taskName: 'Task', averageTime: formatTimeDetailedFromMs(0) }
  }

  const taskAverages = {}

  filteredSessions.value.forEach((answer) => {
    if (!answer.tasks) return
    for (const taskId in answer.tasks) {
      const taskTime = answer.tasks[taskId]?.taskTime ?? 0

      if (!taskAverages[taskId]) {
        taskAverages[taskId] = { totalTime: taskTime, count: 1 }
      } else {
        taskAverages[taskId].totalTime += taskTime
        taskAverages[taskId].count++
      }
    }
  })

  for (const taskId in taskAverages) {
    taskAverages[taskId].averageTime =
      taskAverages[taskId].totalTime / taskAverages[taskId].count
  }

  let longestTask = null
  let longestAverageTime = 0

  for (const taskId in taskAverages) {
    if (taskAverages[taskId].averageTime > longestAverageTime) {
      longestAverageTime = taskAverages[taskId].averageTime
      longestTask = taskId
    }
  }

  return {
    taskName: resolveTaskName(longestTask),
    averageTime: formatTimeDetailedFromMs(longestAverageTime),
  }
}

const calculateAverageTime = () => {
  return formatTimeDetailedFromMs(averageTimePerTask.value)
}

const getConclusionAverage = () => {
  if (!filteredSessions.value.length) return 0

  let eachConclusion = 0
  let totalAnswers = 0
  filteredSessions.value.forEach((answer) => {
    eachConclusion += answer.progress
    totalAnswers++
  })
  return eachConclusion / totalAnswers
}

const getTestsInProgress = () => {
  if (!filteredSessions.value.length)
    return { totalInProgress: 0, totalCompleted: 0 }

  let totalProgress = 0
  let totalCompleted = 0
  filteredSessions.value.forEach((answer) => {
    if (answer.submitted) {
      totalCompleted++
    } else {
      totalProgress++
    }
  })
  return {
    totalInProgress: totalProgress,
    totalCompleted: totalCompleted,
  }
}

const maxProgressPerTask = () => {
  if (!filteredSessions.value.length) return 0

  const progressArray = filteredSessions.value.map((answer) => answer.progress)
  return Math.max(...progressArray)
}

const minProgressPerTask = () => {
  if (!filteredSessions.value.length) return 0

  const progressArray = filteredSessions.value.map((answer) => answer.progress)
  return Math.min(...progressArray)
}

const getTotalAnswers = () => {
  return filteredSessions.value.length
}

const getLatestResponse = () => {
  if (!filteredSessions.value.length)
    return { cooperatorEmail: '', lastUpdate: '' }

  let latestResponse = filteredSessions.value[0].userDocId
  let lastUpdate = filteredSessions.value[0].lastUpdate

  filteredSessions.value.forEach((answer) => {
    if (answer.lastUpdate > filteredSessions.value[0].lastUpdate) {
      latestResponse = answer.userDocId
      lastUpdate = answer.lastUpdate
    }
  })

  return {
    cooperatorEmail: getCooperatorEmail(latestResponse),
    lastUpdate: lastUpdate,
  }
}

const getTasksTodayCount = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let tasksToday = 0

  filteredSessions.value.forEach((answer) => {
    const answerDate = new Date(answer.lastUpdate)
    answerDate.setHours(0, 0, 0, 0)

    if (answerDate.getTime() === today.getTime()) {
      tasksToday++
    }
  })

  return tasksToday
}

const getCooperatorEmail = (userDocId) => {
  let cooperatorEmail = ''
  if (test.value.cooperators && Array.isArray(test.value.cooperators)) {
    for (const element of test.value.cooperators) {
      if (element.userDocId === userDocId) {
        cooperatorEmail = element.email
      }
    }
  }
  return cooperatorEmail
}

const getFormattedDate = (date) => {
  return new Date(date).toLocaleString()
}

// Filter methods
const onFilterChange = (idx, val) => {
  if (!val || !val.length) {
    selectedFilters.value[idx] = []
    return
  }
  if (val.includes(ALL_VALUE)) {
    selectedFilters.value[idx] = [ALL_VALUE]
  } else {
    selectedFilters.value[idx] = val
  }
}

const resetFilters = () => {
  selectedFilters.value = {}
  searchTerm.value = ''
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const triggerSearch = () => {
  /* no-op: computed already reacts; placeholder for future debounce */
}

// UX Metrics Functions
const calculateEffectiveness = () => {
  if (!filteredSessions.value.length) return 0

  let completedTasks = 0
  let totalTasks = 0

  filteredSessions.value.forEach((answer) => {
    totalTasks += Object.keys(answer.tasks || {}).length
    Object.values(answer.tasks || {}).forEach((task) => {
      if (task.completed) {
        completedTasks++
      }
    })
  })

  return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100
}

const calculateEfficiency = () => {
  if (!filteredSessions.value.length) return { score: 0, avgTime: '0 min 0 s' }

  let totalSuccessfulTasks = 0
  let totalSuccessfulTaskTime = 0 // in milliseconds - only time from successful tasks
  let totalTimeSpent = 0 // in milliseconds - time from all tasks (for reference)

  // Calculate total successful tasks and time spent on successful tasks only
  filteredSessions.value.forEach((answer) => {
    Object.values(answer.tasks || {}).forEach((task) => {
      totalTimeSpent += task.taskTime || 0
      // Count as successful if task is completed and not explicitly marked as failed
      if (task.completed && task.success !== false) {
        totalSuccessfulTasks++
        totalSuccessfulTaskTime += task.taskTime || 0
      }
    })
  })

  const avgTimeFormatted = formatTimeDetailedFromMs(
    totalSuccessfulTaskTime / Math.max(1, totalSuccessfulTasks),
  )

  const taskEfficiencyValues = taskTimingStats.value
    .map((stats) => stats.efficiency)
    .filter((efficiency) => efficiency !== null)
  const efficiencyPerMinute =
    taskEfficiencyValues.length > 0
      ? taskEfficiencyValues.reduce((sum, efficiency) => sum + efficiency, 0) /
        taskEfficiencyValues.length
      : 0

  // Dynamic normalization based on actual efficiency ratio
  // Use logarithmic scale to better represent efficiency variations
  // Score = 10 * (1 - e^(-efficiency_ratio * scale_factor))
  const scaleFactor = 2 // Adjustable based on typical task complexity
  const normalizedScore =
    efficiencyPerMinute > 0
      ? Math.min(10, 10 * (1 - Math.exp(-efficiencyPerMinute * scaleFactor)))
      : 0

  return {
    score: normalizedScore,
    avgTime: avgTimeFormatted.formatedTime,
    tasksPerMinute: efficiencyPerMinute.toFixed(4),
    totalTasks: totalSuccessfulTasks,
    totalSuccessfulTime: formatTimeDetailedFromMs(totalSuccessfulTaskTime)
      .formatedTime,
    totalTime: formatTimeDetailedFromMs(totalTimeSpent).formatedTime,
  }
}

;() => {
  if (!filteredSessions.value.length) return 0

  let totalSatisfaction = 0
  let ratingsCount = 0

  filteredSessions.value.forEach((answer) => {
    if (answer.satisfaction && typeof answer.satisfaction === 'number') {
      totalSatisfaction += answer.satisfaction
      ratingsCount++
    } else {
      // If no satisfaction data, simulate based on completion rate
      const userProgress = answer.progress
      const simulatedRating =
        userProgress >= 90
          ? 4.5
          : userProgress >= 70
            ? 4.0
            : userProgress >= 50
              ? 3.5
              : userProgress >= 30
                ? 3.0
                : 2.5
      totalSatisfaction += simulatedRating
      ratingsCount++
    }
  })

  return ratingsCount === 0 ? 0 : totalSatisfaction / ratingsCount
}

const getAverageSUSSatisfaction = (answersData) => {
  let totalSUS = 0
  let susCount = 0

  Object.values(answersData).forEach((item) => {
    if (!item.tasks) return
    Object.values(item.tasks).forEach((task) => {
      if (Array.isArray(task.susAnswers) && task.susAnswers.length === 10) {
        const susScore = calculateSUSScore(task.susAnswers)
        totalSUS += susScore
        susCount++
      }
    })
  })

  return susCount === 0 ? 0 : totalSUS / susCount
}

const getAverageSatisfaction = () => {
  let hasSUS = false
  let hasNASATLX = false
  let nasaTlxResponses = []

  Object.values(answers.value).forEach((item) => {
    if (!item.tasks) return
    Object.values(item.tasks).forEach((task) => {
      if (Array.isArray(task.susAnswers) && task.susAnswers.length === 10) {
        hasSUS = true
      }

      // Check if task is NASA-TLX type and has valid data
      if (
        testStructure.value?.userTasks?.[task.taskId]?.taskType ===
          'nasa-tlx' &&
        task.nasaTlxAnswers &&
        typeof task.nasaTlxAnswers === 'object'
      ) {
        // Check if nasaTlxAnswers has actual data (not empty object/array)
        const hasData = Array.isArray(task.nasaTlxAnswers)
          ? task.nasaTlxAnswers.length > 0
          : Object.keys(task.nasaTlxAnswers).length > 0

        if (hasData) {
          hasNASATLX = true
          const scores = Object.values(task.nasaTlxAnswers)
          nasaTlxResponses.push({
            ...task,
            overallScore:
              scores.length > 0
                ? Math.round(
                    (scores.reduce((sum, score) => sum + score, 0) /
                      scores.length) *
                      10,
                  ) / 10
                : 0,
            name: item.fullName,
            nasaTlxAnswers: task.nasaTlxAnswers,
          })
        }
      }
    })
  })

  if (hasSUS && !hasNASATLX) {
    return getAverageSUSSatisfaction(answers.value)
  }

  if (hasNASATLX && nasaTlxResponses.length > 0) {
    const tlxData = getNASATLXData(nasaTlxResponses)
    return tlxData.averageOverallScore
  }

  return 0
}

const getTasksPerformance = () => {
  const allTaskIds = new Set()
  filteredSessions.value.forEach((answer) => {
    if (answer.tasks) {
      Object.keys(answer.tasks).forEach((taskId) => allTaskIds.add(taskId))
    }
  })

  const tasks = taskDefinitions.value.length
    ? taskDefinitions.value.map((task, index) => ({
        task,
        taskId: task?.taskId ?? String(index),
        index,
      }))
    : [...allTaskIds].map((taskId) => ({
        task: null,
        taskId,
        index: Number(taskId),
      }))

  return tasks.map(({ task, taskId, index }) => {
    let success = 0
    let couldNotFinish = 0
    let notStarted = 0

    filteredSessions.value.forEach((answer) => {
      const taskAnswer = task
        ? getSessionTask(answer, task, index)
        : answer.tasks?.[taskId]

      if (taskAnswer?.completed && taskAnswer.success !== false) {
        success++
      } else if (
        taskAnswer?.attempted ||
        taskAnswer?.completed ||
        Number(taskAnswer?.taskTime) > 0
      ) {
        couldNotFinish++
      } else {
        notStarted++
      }
    })

    const total = filteredSessions.value.length

    return {
      taskId,
      taskName: task?.taskName || resolveTaskName(String(taskId)),
      success,
      couldNotFinish,
      notStarted,
      errors: couldNotFinish + notStarted,
      total,
      successRate: total === 0 ? 0 : (success / total) * 100,
    }
  })
}

const resolveTaskName = (taskId) => {
  const tasks = Array.isArray(testStructure.value?.userTasks)
    ? testStructure.value.userTasks
    : []

  if (!tasks.length) return taskId || 'Task'

  const byId = tasks.find((task) => task?.taskId === taskId)
  if (byId?.taskName) return byId.taskName

  const numericIndex = Number(taskId)
  if (Number.isInteger(numericIndex) && numericIndex >= 0) {
    const byIndex = tasks[numericIndex]
    if (byIndex?.taskName) return byIndex.taskName
  }

  return taskId || 'Task'
}

const taskDefinitions = computed(() =>
  Array.isArray(testStructure.value?.userTasks)
    ? testStructure.value.userTasks
    : [],
)

const getSessionTask = (session, task, index) =>
  session?.tasks?.[index] ??
  session?.tasks?.[String(index)] ??
  (task?.taskId != null ? session?.tasks?.[task.taskId] : null)

const getTaskTimeMinutes = (taskAnswer) => {
  const timeMs = Number(taskAnswer?.taskTime)
  return Number.isFinite(timeMs) && timeMs > 0 ? timeMs / 60000 : null
}

const getEstimatedTimeMinutes = (task) => {
  if (task?.estimatedTime === null || task?.estimatedTime === '') return null
  const time = Number(task?.estimatedTime)
  return Number.isFinite(time) && time >= 0 ? time : null
}

const taskTimingStats = computed(() =>
  taskDefinitions.value.map((task, index) => {
    let totalRecordedTimeMs = 0
    let totalSuccessfulTaskTimeMs = 0
    let recordedTaskCount = 0
    let sumIndividualEfficiency = 0

    filteredSessions.value.forEach((session) => {
      const taskAnswer = getSessionTask(session, task, index)
      if (!taskAnswer) return

      const taskTimeMs = Number(taskAnswer.taskTime)
      const hasValidTime = Number.isFinite(taskTimeMs) && taskTimeMs > 0

      if (hasValidTime) {
        totalRecordedTimeMs += taskTimeMs
        recordedTaskCount++
      }

      if (taskAnswer.completed && taskAnswer.success !== false) {
        if (hasValidTime) {
          totalSuccessfulTaskTimeMs += taskTimeMs
          sumIndividualEfficiency += 60000 / taskTimeMs
        }
      }
    })

    const averageTimeMinutes =
      recordedTaskCount > 0
        ? totalRecordedTimeMs / recordedTaskCount / 60000
        : null
    const estimatedTimeMinutes = getEstimatedTimeMinutes(task)
    const timeDifferenceMinutes =
      averageTimeMinutes !== null && estimatedTimeMinutes !== null
        ? averageTimeMinutes - estimatedTimeMinutes
        : null
    let comparisonStatus = 'noData'

    if (averageTimeMinutes !== null && estimatedTimeMinutes === null) {
      comparisonStatus = 'noEstimate'
    } else if (timeDifferenceMinutes !== null) {
      const roundedDifference =
        Math.round(averageTimeMinutes * 10) -
        Math.round(estimatedTimeMinutes * 10)
      comparisonStatus =
        roundedDifference < 0
          ? 'underEstimate'
          : roundedDifference > 0
            ? 'overEstimate'
            : 'withinEstimate'
    }

    return {
      taskId: task?.taskId ?? String(index),
      taskName: task?.taskName || resolveTaskName(String(index)),
      efficiency:
        recordedTaskCount > 0
          ? sumIndividualEfficiency / recordedTaskCount
          : null,
      relativeEfficiencyPercentage:
        totalRecordedTimeMs > 0
          ? (totalSuccessfulTaskTimeMs / totalRecordedTimeMs) * 100
          : null,
      averageTimeMinutes,
      estimatedTimeMinutes,
      timeDifferenceMinutes,
      comparisonStatus,
    }
  }),
)

const taskPerformanceCards = computed(() =>
  getTasksPerformance().map((performance) => {
    const taskIndex = taskDefinitions.value.findIndex(
      (task, index) =>
        (task?.taskId != null &&
          String(task.taskId) === String(performance.taskId)) ||
        String(index) === String(performance.taskId),
    )
    const timing = taskIndex >= 0 ? taskTimingStats.value[taskIndex] : null

    return {
      ...performance,
      efficiency: timing?.efficiency ?? null,
      relativeEfficiencyPercentage:
        timing?.relativeEfficiencyPercentage ?? null,
      averageTimeMinutes: timing?.averageTimeMinutes ?? null,
      estimatedTimeMinutes: timing?.estimatedTimeMinutes ?? null,
      timeDifferenceMinutes: timing?.timeDifferenceMinutes ?? null,
      comparisonStatus: timing?.comparisonStatus ?? 'noData',
    }
  }),
)

const taskEfficiencyChartData = computed(() => ({
  labels: taskTimingStats.value.map((_, index) => `T${index + 1}`),
  datasets: [
    {
      label: t('analytics.taskEfficiency'),
      data: taskTimingStats.value.map((stats) => stats.efficiency),
      backgroundColor: '#2563EB',
      borderRadius: 4,
    },
  ],
}))

const getEstimateStatusColor = (status) => {
  if (status === 'underEstimate') return 'info'
  if (status === 'withinEstimate') return 'success'
  if (status === 'overEstimate') return 'error'
  return 'grey'
}

const getEfficiencyPercentageColor = (relativeEfficiencyPercentage) => {
  if (relativeEfficiencyPercentage === null) return 'grey'
  if (relativeEfficiencyPercentage >= 100) return 'success'
  if (relativeEfficiencyPercentage >= 80) return 'warning'
  return 'error'
}

const formatTimeDifference = (minutes) =>
  `${minutes > 0 ? '+' : ''}${minutes.toFixed(1)} ${t('analytics.minutesShort')}`

const getUserIdentifier = (session, index) => ({
  identifier: `U${index + 1}`,
  name:
    session.fullName || t('analytics.participantNumber', { number: index + 1 }),
})

const taskTimeComparisonChartData = computed(() => {
  const tasks = taskDefinitions.value.map((task, index) => {
    const recordedTimes = filteredSessions.value
      .map((session) => getSessionTask(session, task, index))
      .map(getTaskTimeMinutes)
      .filter((time) => time !== null)

    return {
      name: task.taskName || resolveTaskName(String(index)),
      averageTime:
        recordedTimes.length > 0
          ? recordedTimes.reduce((total, time) => total + time, 0) /
            recordedTimes.length
          : null,
      estimatedTime: getEstimatedTimeMinutes(task),
    }
  })

  return {
    labels: tasks.map((_, index) => `T${index + 1}`),
    datasets: [
      {
        type: 'bar',
        label: t('analytics.averageCompletionTime'),
        data: tasks.map((task) => task.averageTime),
        itemNames: tasks.map((task) => task.name),
        backgroundColor: '#0F766E',
        borderRadius: 4,
      },
      {
        type: 'line',
        label: t('analytics.estimatedTime'),
        data: tasks.map((task) => task.estimatedTime),
        itemNames: tasks.map((task) => task.name),
        borderColor: '#D97706',
        backgroundColor: '#D97706',
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0,
        spanGaps: true,
      },
    ],
  }
})

const timeByUserChartData = computed(() => {
  const users = filteredSessions.value.map(getUserIdentifier)
  const datasets = taskDefinitions.value.flatMap((task, taskIndex) => {
    const taskIdentifier = `T${taskIndex + 1}`
    const color = chartColors[taskIndex % chartColors.length]
    const userNames = users.map((user) => user.name)
    const estimatedTime = getEstimatedTimeMinutes(task)

    return [
      {
        type: 'bar',
        label: taskIdentifier,
        data: filteredSessions.value.map((session) =>
          getTaskTimeMinutes(getSessionTask(session, task, taskIndex)),
        ),
        itemNames: userNames,
        backgroundColor: color,
        borderRadius: 4,
      },
      {
        type: 'line',
        label: t('analytics.estimatedTimeForTask', { task: taskIdentifier }),
        data: users.map(() => estimatedTime),
        itemNames: userNames,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        tension: 0,
        spanGaps: true,
      },
    ]
  })

  return {
    labels: users.map((user) => user.identifier),
    datasets,
  }
})

const sharedTimeScaleMax = computed(() => {
  const values = [
    ...taskTimeComparisonChartData.value.datasets.flatMap(
      (dataset) => dataset.data,
    ),
    ...timeByUserChartData.value.datasets.flatMap((dataset) => dataset.data),
  ].filter((value) => Number.isFinite(value))
  const maxValue = Math.max(0, ...values)

  return maxValue > 0 ? maxValue * 1.1 : 1
})

const tooltipTitle = (items) => {
  const item = items[0]
  const itemName = item?.dataset?.itemNames?.[item.dataIndex]
  return itemName ? `${item.label}: ${itemName}` : item.label
}

const taskEfficiencyChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { title: tooltipTitle } },
  },
  scales: {
    x: { title: { display: true, text: t('analytics.taskLabel') } },
    y: {
      beginAtZero: true,
      title: { display: true, text: t('analytics.taskEfficiency') },
    },
  },
}))

const taskTimeComparisonChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' },
    tooltip: { callbacks: { title: tooltipTitle } },
  },
  scales: {
    x: { title: { display: true, text: t('analytics.taskLabel') } },
    y: {
      type: 'linear',
      beginAtZero: true,
      max: sharedTimeScaleMax.value,
      title: { display: true, text: t('analytics.timeMinutes') },
    },
  },
}))

const timeByUserChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' },
    tooltip: { callbacks: { title: tooltipTitle } },
  },
  scales: {
    x: {
      type: 'category',
      title: { display: true, text: t('analytics.userLabel') },
      ticks: { autoSkip: true, maxRotation: 0 },
    },
    y: {
      type: 'linear',
      beginAtZero: true,
      max: sharedTimeScaleMax.value,
      title: { display: true, text: t('analytics.timeMinutes') },
    },
  },
}))

const drawEfficiencyDonutChart = (task) => {
  const canvas = document.getElementById(
    'task-efficiency-chart-' + (task.taskId || ''),
  )
  if (!canvas) return

  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 10
  const innerRadius = radius * 0.6
  const efficiency = task.relativeEfficiencyPercentage

  context.beginPath()
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI)
  context.arc(centerX, centerY, innerRadius, 2 * Math.PI, 0, true)
  context.closePath()
  context.fillStyle = '#e0e0e0'
  context.fill()

  if (Number.isFinite(efficiency)) {
    const progress = Math.min(Math.max(efficiency, 0), 100) / 100
    const endAngle = -Math.PI / 2 + progress * 2 * Math.PI

    context.beginPath()
    context.arc(centerX, centerY, radius, -Math.PI / 2, endAngle)
    context.arc(centerX, centerY, innerRadius, endAngle, -Math.PI / 2, true)
    context.closePath()
    context.fillStyle =
      efficiency >= 100 ? '#4CAF50' : efficiency >= 80 ? '#FFA726' : '#F44336'
    context.fill()
  }

  context.fillStyle = Number.isFinite(efficiency) ? '#333' : '#999'
  context.font = 'bold 14px Arial'
  context.textAlign = 'center'
  context.fillText(
    Number.isFinite(efficiency) ? `${efficiency.toFixed(0)}%` : '--',
    centerX,
    centerY + 5,
  )
}

const createTaskCharts = async () => {
  await nextTick()

  const tasksData = taskPerformanceCards.value

  tasksData.forEach((task) => {
    drawEfficiencyDonutChart(task)

    // Usar el id único basado en el taskId
    const canvasId = 'task-chart-' + (task.taskId || '')
    const canvas = document.getElementById(canvasId)
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10
    const innerRadius = radius * 0.6

    if (!task.total || isNaN(task.successRate)) {
      // Draw empty donut (gray)
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.arc(centerX, centerY, innerRadius, 2 * Math.PI, 0, true)
      ctx.closePath()
      ctx.fillStyle = '#e0e0e0'
      ctx.fill()
      // Draw center text
      ctx.fillStyle = '#999'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('0%', centerX, centerY + 5)
      return
    }

    // Calculate angles
    const successAngle = (task.success / task.total) * 2 * Math.PI
    const errorAngle = (task.errors / task.total) * 2 * Math.PI

    // Draw success arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, successAngle)
    ctx.arc(centerX, centerY, innerRadius, successAngle, 0, true)
    ctx.closePath()
    ctx.fillStyle = '#4CAF50'
    ctx.fill()

    // Draw error arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, successAngle, successAngle + errorAngle)
    ctx.arc(
      centerX,
      centerY,
      innerRadius,
      successAngle + errorAngle,
      successAngle,
      true,
    )
    ctx.closePath()
    ctx.fillStyle = '#F44336'
    ctx.fill()

    // Draw center text
    ctx.fillStyle = '#333'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${task.successRate.toFixed(0)}%`, centerX, centerY + 5)
  })
}

watch(
  () => answers.value,
  (newAnswers) => {
    if (newAnswers && typeof newAnswers === 'object') {
      taskAnswers.value = Object.values(newAnswers)
      // Update charts when data changes
      setTimeout(() => createTaskCharts(), 500)
    }
  },
  { immediate: true },
)

watch(
  () => testStructure.value,
  (newVal) => {
    if (newVal && Array.isArray(newVal.userTasks)) {
      testTasks.value = newVal.userTasks.map((task) => task.taskName)
      // Update charts when structure changes
      setTimeout(() => createTaskCharts(), 500)
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (testStructure.value && Array.isArray(testStructure.value.userTasks)) {
    testStructure.value.userTasks.forEach((task, i) => {
      testTasks.value[i] = task.taskName
    })

    if (answers.value && typeof answers.value === 'object') {
      let c = 0
      for (const key in answers.value) {
        taskAnswers.value[c] = answers.value[key]
        c++
      }
    }
  }

  // Create initial charts
  setTimeout(() => createTaskCharts(), 1000)
})

// Refresh timeline data
const onRefreshTimeline = async () => {
  try {
    if (store.dispatch) {
      const possibleActions = [
        'getCurrentTestAnswerDoc',
        'Answer/getCurrentTestAnswerDoc',
        'Tests/fetchVisibleUserAnswers',
        'Tests/fetchAnswers',
        'fetchVisibleUserAnswers',
        'fetchAnswers',
      ]
      let dispatched = false
      for (const act of possibleActions) {
        try {
          await store.dispatch(act)
          dispatched = true
          break
        } catch {
          // Ignore and try next
        }
      }
      if (dispatched) {
        await nextTick()
        // recreate charts
        setTimeout(() => createTaskCharts(), 300)
        return
      }
    }

    // fallback to rebuild local cache from current store answers and force charts redraw
    taskAnswers.value =
      answers.value && typeof answers.value === 'object'
        ? Object.values(answers.value)
        : []
    await nextTick()
    setTimeout(() => createTaskCharts(), 300)
  } catch {
    // Refresh timeline failed
  }
}

// Download timeline data as CSV
const onExportTimeline = () => {
  if (!filteredSessions.value.length) return

  const now = new Date()
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(now.getMonth() - 1)

  const counts = {}

  for (let d = new Date(oneMonthAgo); d <= now; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0]
    counts[key] = 0
  }

  // Count answers per day
  filteredSessions.value.forEach((a) => {
    if (!a.lastUpdate) return
    const d = new Date(a.lastUpdate)
    if (d >= oneMonthAgo && d <= now) {
      const key = d.toISOString().split('T')[0]
      if (counts[key] !== undefined) counts[key]++
    }
  })

  // Build CSV
  const csv = [
    'Date,Number of Answers',
    ...Object.entries(counts).map(([date, count]) => `${date},${count}`),
  ].join('\n')

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = `answers_timeline_${Date.now()}.csv`
  a.click()

  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.chart-container-large {
  height: 400px;
  width: 100%;
  position: relative;
}

.progress-glow {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
}

.ux-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.task-chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
}

.chart-container-small {
  aspect-ratio: 1;
  width: min(120px, 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-donut-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-evenly;
  gap: 8px;
  margin-bottom: 16px;
}

.task-donut-item {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: center;
}

.task-donut-item :deep(.v-chip) {
  max-width: 100%;
  height: auto;
  min-height: 24px;
  white-space: normal;
  text-align: center;
}

.task-outcome-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  font-size: 0.75rem;
}

.task-outcome-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.analytics-bar-chart {
  position: relative;
  height: 320px;
  width: 100%;
}

.analytics-bar-chart-scroll {
  overflow-x: auto;
}

.analytics-bar-chart-content {
  position: relative;
  height: 100%;
  width: max(100%, var(--chart-min-width));
}

.task-timing-details {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.task-timing-detail {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.875rem;
}

.task-timing-detail-value {
  min-width: 0;
  overflow-wrap: anywhere;
  text-align: right;
}

.task-chart {
  display: block;
  width: 100%;
  height: 100%;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .text-h1 {
    font-size: 2.5rem !important;
  }
}

@media (max-width: 600px) {
  .chart-container-large {
    height: 300px;
  }

  .conclusion-card .text-h1 {
    font-size: 2rem !important;
  }
}

/* Filter styles */
.filter-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  line-height: 1.15;
  color: #475569;
}

.truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(11px * 1.15 * 2);
  max-height: calc(11px * 1.15 * 2);
}

.filter-field :deep(.v-field__input) {
  min-height: 36px;
}

.flex-grow-1 {
  flex: 1 1 auto;
  min-width: 240px;
}

.button-bar {
  gap: 14px;
}

.search-btn {
  min-width: 140px;
  height: 40px;
  font-weight: 600;
  letter-spacing: 0.3px;
}
</style>
