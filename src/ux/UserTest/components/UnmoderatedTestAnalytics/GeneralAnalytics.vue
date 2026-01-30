<template>
  <div class="bg-background">
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
    <v-row class="">
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
          :value="`${calculateEfficiency().tasksPerMinute} t/min`"
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
        <v-card class="pa-8 elevation-4 rounded-xl h-100 conclusion-card">
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
              <p class="text-body-1 text-medium-emphasis">
                {{ $t('analytics.perfectCompletionRate') }}
              </p>
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
            <v-card class="pa-6 elevation-3 rounded-xl h-100 stat-card">
              <div class="d-flex align-center mb-4">
                <v-avatar color="primary" size="48" class="me-3">
                  <v-icon color="white" size="24"> mdi-clock-fast </v-icon>
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold text-primary">
                    {{ calculateAverageTime().formatedTime }}
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ $t('analytics.avgTimePerTask') }}
                  </p>
                </div>
              </div>
              <p class="text-caption text-medium-emphasis">
                {{ $t('analytics.efficientTaskCompletion') }}
              </p>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card
              v-if="testStructure?.userTasks && taskAnswers.length"
              class="pa-6 elevation-3 rounded-xl h-100 stat-card"
            >
              <div class="d-flex align-center mb-4">
                <v-avatar color="error" size="48" class="me-3">
                  <v-icon color="white" size="24"> mdi-timer-alert </v-icon>
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold text-error">
                    {{ findLongestTask().averageTime.formatedTime }}
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ $t('analytics.longestTask') }}
                  </p>
                </div>
              </div>
              <p class="text-caption text-medium-emphasis">
                {{ $t('analytics.taskLabel') }}:
                <strong>"{{ findLongestTask().taskName }}"</strong>
              </p>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card class="pa-6 elevation-3 rounded-xl h-100 stat-card">
              <div class="d-flex align-center mb-4">
                <v-avatar color="success" size="48" class="me-3">
                  <v-icon color="white" size="24"> mdi-check-circle </v-icon>
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold text-success">
                    {{ getTotalAnswers() }}
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ $t('analytics.totalAnswers') }}
                  </p>
                </div>
              </div>
              <div class="d-flex align-center">
                <v-icon color="success" size="16" class="me-1">
                  mdi-trending-up
                </v-icon>
                <span class="text-caption text-success"
                  >+{{ getTasksTodayCount() }}/{{ $t('analytics.day') }}</span
                >
              </div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card class="pa-6 elevation-3 rounded-xl h-100 stat-card">
              <div class="d-flex align-center mb-4">
                <v-avatar color="accent" size="48" class="me-3">
                  <v-icon color="white" size="24"> mdi-account-circle </v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-1 font-weight-bold text-accent">
                    {{ $t('analytics.evaluator') }}
                  </div>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ $t('analytics.latestUser') }}
                  </p>
                </div>
              </div>
              <p class="text-caption text-medium-emphasis">
                {{ getFormattedDate(getLatestResponse().lastUpdate) }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Chart Section -->
    <AnswersTimeline
      :task-answers="filteredSessions"
      @refresh="onRefreshTimeline"
      @export="onExportTimeline"
    />

    <!-- Task Performance Charts -->
    <v-row class="mb-8">
      <v-col cols="12">
        <v-card flat class="pa-8">
          <div class="d-flex justify-space-between align-center mb-6">
            <div>
              <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
                {{ $t('analytics.taskPerformance') }}
              </h3>
              <p class="text-body-1 text-medium-emphasis">
                {{ $t('analytics.taskPerformanceDescription') }}
              </p>
            </div>
          </div>

          <v-row>
            <v-col
              v-for="taskStat in getTasksPerformance()"
              :key="taskStat.taskId"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                class="pa-4 elevation-2 rounded-lg task-chart-card"
                variant="outlined"
              >
                <div class="text-center mb-4">
                  <h4 class="text-h6 font-weight-bold mb-2">
                    {{ taskStat.taskName }}
                  </h4>
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
                    {{ $t('analytics.success') }}
                  </v-chip>
                </div>

                <div class="chart-container-small mb-4">
                  <canvas
                    :id="'task-chart-' + taskStat.taskId"
                    class="task-chart"
                    width="120"
                    height="120"
                  />
                </div>

                <div class="d-flex justify-space-between text-body-2">
                  <div class="d-flex align-center">
                    <div class="legend-dot bg-success mr-2" />
                    <span
                      >{{ $t('analytics.successCount') }}:
                      {{ taskStat.success }}</span
                    >
                  </div>
                  <div class="d-flex align-center">
                    <div class="legend-dot bg-error mr-2" />
                    <span
                      >{{ $t('analytics.errors') }}: {{ taskStat.errors }}</span
                    >
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mostrar todas las preguntas del pre-form -->
    <v-row class="mb-8">
      <v-col cols="12">
        <v-card flat class="pa-8">
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
    <v-row class="mb-8">
      <v-col cols="12">
        <v-card flat class="pa-8">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { formatTimeDetailedFromMs } from '@/shared/utils/timeUtils'
import UxMetricCard from '../answers/UxMetricCard.vue'
import CommentListCard from '../answers/CommentListCard.vue'
import SelectionPieChart from '../answers/SelectionPieChart.vue'
import AnswersTimeline from '../answers/AnswersTimeline.vue'
import axios from 'axios'
import { calculateSUSScore } from '../../utils/susCalculator'
import { getNASATLXData } from '../../utils/nasaTlxData'
import { useFilterDefinitions } from './useFilterDefinitions'

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
useI18n()

const test = computed(() => store.getters.test)
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
  try {
    const response = await axios.post(
      process.env.VUE_APP_LARAVEL_PDF + '/generate-pdf',
      {
        payload: {
          title: test.value.testTitle || '',
          description: test.value.testDescription || '',
          type: test.value.testType || '',
          taskAnswers: answers.value,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'arraybuffer', // Recebe como binary
      },
    )

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${test.value.testTitle || 'resume'}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch {
    // Error generating PDF
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

  const taskMap = {}
  if (testStructure.value && Array.isArray(testStructure.value.userTasks)) {
    testStructure.value.userTasks.forEach((task) => {
      taskMap[task.taskId] = task
    })
  }

  return {
    taskName: taskMap[longestTask]?.taskName || 'Task',
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

  // ISO 9241-11/9241-210 Efficiency Formula:
  // Efficiency = Number of successfully completed tasks / Time spent on successful tasks
  // Convert to tasks per minute for better readability
  const efficiencyRatio =
    totalSuccessfulTaskTime > 0
      ? totalSuccessfulTasks / (totalSuccessfulTaskTime / 60000)
      : 0

  // Dynamic normalization based on actual efficiency ratio
  // Use logarithmic scale to better represent efficiency variations
  // Score = 10 * (1 - e^(-efficiency_ratio * scale_factor))
  const scaleFactor = 2 // Adjustable based on typical task complexity
  const normalizedScore =
    efficiencyRatio > 0
      ? Math.min(10, 10 * (1 - Math.exp(-efficiencyRatio * scaleFactor)))
      : 0

  return {
    score: normalizedScore,
    avgTime: avgTimeFormatted.formatedTime,
    tasksPerMinute: efficiencyRatio.toFixed(2),
    totalTasks: totalSuccessfulTasks,
    totalSuccessfulTime: formatTimeDetailedFromMs(totalSuccessfulTaskTime)
      .formatedTime,
    totalTime: formatTimeDetailedFromMs(totalTimeSpent).formatedTime,
  }
}

() => {
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
  // Recoger todos los taskId únicos presentes en filteredSessions
  const allTaskIds = new Set()
  filteredSessions.value.forEach((answer) => {
    if (answer.tasks) {
      Object.keys(answer.tasks).forEach((taskId) => allTaskIds.add(taskId))
    }
  })

  // Para cada taskId, calcular los datos reales
  const result = []
  allTaskIds.forEach((taskId) => {
    let success = 0
    let errors = 0
    let total = 0
    let taskName = taskId

    // Buscar el nombre de la tarea si está en testStructure
    if (testStructure.value && testStructure.value.userTasks) {
      const found = testStructure.value.userTasks.find(
        (t) => t.taskId === taskId,
      )
      if (found) taskName = found.taskName
    }

    filteredSessions.value.forEach((answer) => {
      if (answer.tasks && answer.tasks[taskId]) {
        total++
        const task = answer.tasks[taskId]
        if (task.completed && task.success !== false) {
          success++
        } else {
          errors++
        }
      }
    })

    result.push({
      taskId,
      taskName,
      success,
      errors,
      total,
      successRate: total === 0 ? 0 : (success / total) * 100,
    })
  })
  return result
}

const createTaskCharts = async () => {
  await nextTick()

  const tasksData = getTasksPerformance()

  tasksData.forEach((task) => {
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

  // Initialize all days
  const iterator = new Date(oneMonthAgo)
  while (iterator <= now) {
    const key = iterator.toISOString().split('T')[0]
    counts[key] = 0
    iterator.setDate(iterator.getDate() + 1)
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
  height: 150px;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-chart {
  max-width: 120px;
  max-height: 120px;
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
