<template>
  <div>
    <!-- User Usability Test -->
    <div v-if="testAnswerDocument.type === STUDY_TYPES.USER">
      <!-- Moderated Test -->
      <div v-if="testDocument.subType === USER_STUDY_SUBTYPES.MODERATED">
        <UserModeratedSentiment />
      </div>

      <!-- Un-moderated Test -->
      <div v-else class="pa-4">
        <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
          <div class="d-flex align-center mb-3 flex-wrap button-bar">
            <v-text-field
              v-model="searchTerm"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              hide-details
              variant="outlined"
              placeholder="Search by task name"
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
                <v-col cols="12" sm="6" md="4">
                  <div class="filter-label truncate-2">Task</div>
                  <v-select
                    v-model="selectedTaskFilter"
                    :items="taskFilterOptions"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="filter-field"
                  />
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <div class="filter-label truncate-2">Signal</div>
                  <v-select
                    v-model="selectedSignalFilter"
                    :items="signalFilterOptions"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="filter-field"
                  />
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <div class="filter-label truncate-2">User</div>
                  <v-select
                    v-model="selectedUserFilter"
                    :items="userFilterOptions"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="filter-field"
                  />
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>
        </v-card>

        <v-row dense class="mb-4">
          <v-col
            v-for="card in summaryHighlights"
            :key="card.title"
            cols="12"
            sm="6"
            md="3"
            class="coming-soon-wrapper"
          >
            <v-chip
              color="warning"
              size="small"
              variant="outlined"
              class="coming-soon-badge"
            >
              Coming Soon
            </v-chip>
            <div class="coming-soon-overlay h-100">
              <UxMetricCard
                :value="card.metric"
                :label="card.title"
                :color="card.color"
                :icon="card.icon"
                :description="card.description"
                :progress="card.progress"
              >
                <template #value>
                  <div
                    class="summary-highlight-value mb-2"
                    :class="card.valueClass"
                  >
                    {{ card.value }}
                  </div>
                  <div
                    class="summary-highlight-metric"
                    :class="card.metricClass"
                  >
                    {{ card.metric }}
                  </div>
                </template>

                <template #label>
                  <span
                    class="text-overline font-weight-bold text-medium-emphasis"
                  >
                    {{ card.title }}
                  </span>
                </template>
                <template #description>
                  <span class="kpi-description-clamp">
                    {{ card.description }}
                  </span>
                </template>
              </UxMetricCard>
            </div>
          </v-col>
        </v-row>

        <div class="mb-4 px-2">
          <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
            Sentiment Overview
          </h3>
          <p class="text-body-1 text-medium-emphasis mb-0">
            Facial and transcript sentiment distribution across recorded tasks.
          </p>
        </div>

        <v-row dense class="mb-4">
          <v-col
            v-if="showFacialSignal"
            cols="12"
            :md="showSingleSignal ? 12 : 6"
            class="coming-soon-wrapper"
          >
            <v-chip
              color="warning"
              size="small"
              variant="outlined"
              class="coming-soon-badge"
            >
              Coming Soon
            </v-chip>
            <div class="coming-soon-overlay">
              <SelectionPieChart
                question-title="Facial Sentiment"
                :options="sentimentOptions"
                :counts="facialSentimentCounts"
                canvas-id="facial-sentiment-chart"
                :chart-colors="sentimentChartColors"
                :show-percentages="true"
              />
            </div>
          </v-col>

          <v-col
            v-if="showTextSignal"
            cols="12"
            :md="showSingleSignal ? 12 : 6"
            class="coming-soon-wrapper"
          >
            <v-chip
              color="warning"
              size="small"
              variant="outlined"
              class="coming-soon-badge"
            >
              Coming Soon
            </v-chip>
            <div class="coming-soon-overlay">
              <SelectionPieChart
                question-title="Text Sentiment"
                :options="sentimentOptions"
                :counts="textSentimentCounts"
                canvas-id="text-sentiment-chart"
                :chart-colors="sentimentChartColors"
                :show-percentages="true"
              />
            </div>
          </v-col>
        </v-row>

        <v-card elevation="2" style="border-radius: 12px" class="mb-4 pa-6">
          <div class="mb-4 d-flex justify-space-between align-center">
            <h4 class="font-weight-bold mb-2">Sentiment by Task</h4>
            <v-chip color="warning" size="small" variant="outlined">
              Coming Soon
            </v-chip>
          </div>

          <div class="coming-soon-overlay">
            <v-alert
              v-if="sentimentByTask.length === 0"
              type="info"
              variant="tonal"
              class="mb-0"
            >
              No tasks with webcam or audio recording enabled in this test.
            </v-alert>

            <v-data-table
              v-else
              :headers="visibleTaskSentimentHeaders"
              :items="filteredSentimentByTask"
              :items-per-page="10"
              class="elevation-0"
            >
              <template #item.task="{ item }">
                <div class="font-weight-medium">Task {{ item.number }}</div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ item.name }}
                </div>
              </template>

              <template #item.facial="{ item }">
                <div class="sentiment-table-cell py-2">
                  <v-progress-linear
                    :model-value="item.facialPositive"
                    color="success"
                    bg-color="error"
                    bg-opacity="0.2"
                    height="10"
                    rounded
                    class="mb-2"
                  />
                  <div
                    class="d-flex justify-space-between text-caption text-medium-emphasis"
                  >
                    <span>Positive {{ item.facialPositive }}%</span>
                    <span>Negative {{ item.facialNegative }}%</span>
                  </div>
                </div>
              </template>

              <template #item.text="{ item }">
                <div class="sentiment-table-cell py-2">
                  <v-progress-linear
                    :model-value="item.textPositive"
                    color="success"
                    bg-color="error"
                    bg-opacity="0.2"
                    height="10"
                    rounded
                    class="mb-2"
                  />
                  <div
                    class="d-flex justify-space-between text-caption text-medium-emphasis"
                  >
                    <span>Positive {{ item.textPositive }}%</span>
                    <span>Negative {{ item.textNegative }}%</span>
                  </div>
                </div>
              </template>
            </v-data-table>
          </div>
        </v-card>
      </div>
    </div>

    <!-- Heuristic Test -->
    <div v-else>
      <h6>Sorry Sentiment Analysis isn't available for Heuristic tests</h6>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import UserModeratedSentiment from '@/ux/UserTest/components/sentimentAnalysis/UserModeratedSentiment.vue'
import UxMetricCard from '@/ux/UserTest/components/answers/UxMetricCard.vue'
import SelectionPieChart from '@/shared/components/charts/SelectionPieChart.vue'
import { useI18n } from 'vue-i18n'
import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'

const props = defineProps({
  taskDefinitions: {
    type: Array,
    default: () => [],
  },
})

const store = useStore()
const { t } = useI18n()

const testDocument = computed(() => store.getters.test)
const visibleUserAnswers = computed(
  () => store.getters.visibleUserAnswers || {},
)

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument)

const searchTerm = ref('')
const showFilters = ref(true)
const selectedTaskFilter = ref('All Tasks')
const selectedSignalFilter = ref('All Signals')
const selectedUserFilter = ref('All Users')

const hasActiveFilters = computed(() => {
  return (
    !!searchTerm.value.trim() ||
    selectedTaskFilter.value !== 'All Tasks' ||
    selectedSignalFilter.value !== 'All Signals' ||
    selectedUserFilter.value !== 'All Users'
  )
})

const resetFilters = () => {
  searchTerm.value = ''
  selectedTaskFilter.value = 'All Tasks'
  selectedSignalFilter.value = 'All Signals'
  selectedUserFilter.value = 'All Users'
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const triggerSearch = () => {
  /* no-op: kept for UX consistency with other analytics tabs */
}

const sentimentOptions = ['Positive', 'Neutral', 'Negative']
const signalFilterOptions = ['All Signals', 'Facial', 'Text']
const userFilterOptions = computed(() => {
  const users = Object.values(visibleUserAnswers.value)
    .map((session, index) => {
      const label =
        session.fullName ||
        session.email ||
        session.userDocId ||
        `User ${index + 1}`
      return label
    })
    .filter(Boolean)

  return ['All Users', ...new Set(users)]
})

const sentimentChartColors = ['#22C55E', '#0EA5E9', '#EF4444']

const facialSentimentCounts = {
  Positive: 32,
  Neutral: 51,
  Negative: 17,
}

const textSentimentCounts = {
  Positive: 58,
  Neutral: 27,
  Negative: 15,
}

const criticalTaskIndex = 3

const summaryHighlights = computed(() => [
  {
    title: 'Overall Sentiment',
    value: 'Positive',
    metric: '68%',
    color: 'success',
    icon: 'mdi-chart-line',
    progress: 68,
    valueClass: 'text-success',
    metricClass: 'text-success',
    description: 'Combined facial and transcript sentiment across the session.',
  },
  {
    title: 'Facial Sentiment',
    value: 'Neutral',
    metric: '52%',
    color: 'info',
    icon: 'mdi-emoticon-neutral-outline',
    progress: 52,
    valueClass: 'text-info',
    metricClass: 'text-info',
    description: 'Most common facial expression pattern across recorded tasks.',
  },
  {
    title: 'Text Sentiment',
    value: 'Positive',
    metric: '64%',
    color: 'success',
    icon: 'mdi-text-box-check-outline',
    progress: 64,
    valueClass: 'text-success',
    metricClass: 'text-success',
    description: 'Transcript sentiment trend across participant comments.',
  },
  {
    title: 'Warning',
    value: `Task ${Math.min(criticalTaskIndex + 1, recordingTasks.value.length || criticalTaskIndex + 1)}`,
    metric: '41%',
    color: 'warning',
    icon: 'mdi-alert-circle-outline',
    progress: 41,
    valueClass: 'text-warning-darken-2',
    metricClass: 'text-error',
    description: 'Task with the highest concentration of negative signals.',
  },
])

const fallbackTaskNames = [
  'Find Product',
  'View Product',
  'Add to Cart',
  'Checkout',
]

const recordingTasks = computed(() => {
  const tasks = Array.isArray(props.taskDefinitions)
    ? props.taskDefinitions
    : []

  const filteredTasks = tasks
    .map((task, index) => ({
      ...task,
      originalIndex: index,
    }))
    .filter((task) => Boolean(task?.hasAudioRecord || task?.hasCamRecord))

  if (filteredTasks.length) {
    return filteredTasks
  }

  if (tasks.length) {
    return []
  }

  return fallbackTaskNames.map((taskName, index) => ({
    taskName,
    originalIndex: index,
    hasAudioRecord: true,
    hasCamRecord: true,
  }))
})

const sentimentByTask = computed(() => {
  const templates = [
    {
      facialPositive: 64,
      facialNegative: 18,
      textPositive: 78,
      textNegative: 10,
    },
    {
      facialPositive: 56,
      facialNegative: 20,
      textPositive: 66,
      textNegative: 14,
    },
    {
      facialPositive: 44,
      facialNegative: 26,
      textPositive: 58,
      textNegative: 18,
    },
    {
      facialPositive: 31,
      facialNegative: 41,
      textPositive: 34,
      textNegative: 37,
    },
  ]

  return recordingTasks.value.map((task, index) => ({
    number: task.originalIndex + 1,
    name: task?.taskName || task?.name || `Task ${task.originalIndex + 1}`,
    task: `Task ${task.originalIndex + 1}`,
    ...templates[index % templates.length],
  }))
})

const taskFilterOptions = computed(() => [
  'All Tasks',
  ...sentimentByTask.value.map((task) => `Task ${task.number}`),
])

const filteredSentimentByTask = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()

  return sentimentByTask.value.filter((task) => {
    const matchesSearch =
      !term ||
      task.name.toLowerCase().includes(term) ||
      `task ${task.number}`.toLowerCase().includes(term)

    const matchesTask =
      selectedTaskFilter.value === 'All Tasks' ||
      selectedTaskFilter.value === `Task ${task.number}`

    return matchesSearch && matchesTask
  })
})

const taskSentimentHeaders = [
  { title: 'Task', key: 'task', sortable: false },
  { title: 'Facial', key: 'facial', sortable: false },
  { title: 'Text', key: 'text', sortable: false },
]

const visibleTaskSentimentHeaders = computed(() => {
  if (selectedSignalFilter.value === 'Facial') {
    return taskSentimentHeaders.filter((header) => header.key !== 'text')
  }

  if (selectedSignalFilter.value === 'Text') {
    return taskSentimentHeaders.filter((header) => header.key !== 'facial')
  }

  return taskSentimentHeaders
})

const showFacialSignal = computed(() => selectedSignalFilter.value !== 'Text')
const showTextSignal = computed(() => selectedSignalFilter.value !== 'Facial')
const showSingleSignal = computed(
  () =>
    selectedSignalFilter.value === 'Facial' ||
    selectedSignalFilter.value === 'Text',
)
</script>

<style scoped>
.coming-soon-wrapper {
  position: relative;
}

.coming-soon-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
}

.coming-soon-overlay {
  position: relative;
  opacity: 0.7;
  pointer-events: none;
}

.coming-soon-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 249, 250, 0.8);
  backdrop-filter: blur(0.5px);
  border-radius: 12px;
  z-index: 1;
}

.summary-highlight-value {
  font-size: 1.55rem;
  font-weight: 700;
  line-height: 1.2;
}

.summary-highlight-metric {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.1;
}

.kpi-description-clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.sentiment-table-cell {
  min-width: 220px;
}

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
