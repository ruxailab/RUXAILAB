<template>
  <div>
    <!-- User Usability Test -->
    <div v-if="isUserStudy">
      <!-- Moderated Test -->
      <div v-if="isModeratedUserStudy">
        <UserModeratedSentiment />
      </div>

      <!-- Un-moderated Test -->
      <div v-else class="pa-1">
        <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
          <div class="d-flex align-center mb-3 flex-wrap button-bar">
            <v-text-field
              v-model="searchTerm"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              hide-details
              variant="outlined"
              :placeholder="$t('analytics.sentiment.searchByTask')"
              class="flex-grow-1"
            />
            <v-btn
              color="primary"
              class="search-btn"
              prepend-icon="mdi-filter-remove"
              :disabled="!hasActiveFilters"
              @click="resetFilters"
            >
              {{ $t('analytics.reset') }}
            </v-btn>
          </div>

          <v-row dense class="mt-1">
            <v-col cols="12" sm="6" md="4">
              <div class="filter-label truncate-2">
                {{ $t('analytics.sentiment.task') }}
              </div>
              <v-select
                v-model="selectedTaskFilter"
                :items="taskFilterOptions"
                item-title="title"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                class="filter-field"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <div class="filter-label truncate-2">
                {{ $t('analytics.sentiment.signal') }}
              </div>
              <v-select
                v-model="selectedSignalFilter"
                :items="signalFilterOptions"
                item-title="title"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                class="filter-field"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <div class="filter-label truncate-2">
                {{ $t('analytics.sentiment.user') }}
              </div>
              <v-select
                v-model="selectedUserFilter"
                :items="userFilterOptions"
                item-title="title"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                class="filter-field"
              />
            </v-col>
          </v-row>
        </v-card>

        <v-alert
          v-if="loadError"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="loadError = null"
        >
          {{ loadError }}
        </v-alert>

        <div v-if="loading || userMetricsLoading" class="mb-4">
          <v-row dense class="mb-4">
            <v-col
              v-for="n in 4"
              :key="`skel-card-${n}`"
              cols="12"
              sm="6"
              md="3"
            >
              <v-skeleton-loader type="card" />
            </v-col>
          </v-row>
          <v-skeleton-loader type="article, table" />
        </div>

        <template v-else>
          <v-card
            v-if="!hasAnalyticsData"
            class="mb-4 pa-6 text-center analytics-empty-card"
            variant="outlined"
          >
            <h4 class="text-h6 font-weight-medium mb-2">
              {{ $t('analytics.sentiment.emptyTitle') }}
            </h4>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ emptyDashboardMessage }}
            </p>
          </v-card>

          <div :class="{ 'analytics-disabled': !hasAnalyticsData }">
          <v-row dense class="mb-4">
            <v-col
              v-for="card in summaryHighlights"
              :key="card.id"
              cols="12"
              sm="6"
              :md="summaryColMd"
            >
              <UxMetricCard
                :value="card.metric"
                :label="card.title"
                :color="card.color"
                :icon="card.icon"
                :description="card.description"
                :progress="card.progress"
                :disabled="!hasAnalyticsData"
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
            </v-col>
          </v-row>

          <div class="mb-4 px-2">
            <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
              {{ $t('analytics.sentiment.overviewTitle') }}
            </h3>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('analytics.sentiment.overviewSubtitle') }}
            </p>
          </div>

          <v-row dense class="mb-4">
            <v-col
              v-if="showFacialSignal"
              cols="12"
              :md="showSingleSignal ? 12 : 6"
            >
              <SelectionPieChart
                :question-title="$t('analytics.sentiment.facialSentiment')"
                :options="sentimentOptions"
                :option-labels="sentimentOptionLabels"
                :counts="facialSentimentCounts"
                canvas-id="facial-sentiment-chart"
                :chart-colors="sentimentChartColors"
                :values-are-percentages="true"
                :is-empty="!hasFacialPieData"
                :empty-label="$t('analytics.sentiment.noData')"
                :disabled="!hasAnalyticsData"
              />
            </v-col>

            <v-col
              v-if="showTextSignal"
              cols="12"
              :md="showSingleSignal ? 12 : 6"
            >
              <SelectionPieChart
                :question-title="$t('analytics.sentiment.textSentiment')"
                :options="sentimentOptions"
                :option-labels="sentimentOptionLabels"
                :counts="textSentimentCounts"
                canvas-id="text-sentiment-chart"
                :chart-colors="sentimentChartColors"
                :values-are-percentages="true"
                :is-empty="!hasTextPieData"
                :empty-label="$t('analytics.sentiment.noData')"
                :disabled="!hasAnalyticsData"
              />
            </v-col>
          </v-row>

          <v-card elevation="2" style="border-radius: 12px" class="mb-4 pa-6">
            <div class="mb-4 d-flex justify-space-between align-center">
              <h4 class="font-weight-bold mb-2">
                <v-icon start color="primary">mdi-table</v-icon>
                {{ $t('analytics.sentiment.byTask') }}
              </h4>
            </div>

            <v-data-table
              :headers="visibleTaskSentimentHeaders"
              :items="filteredSentimentByTask"
              :items-per-page="10"
              class="elevation-0"
            >
              <template #no-data>
                <div
                  v-if="hasAnalyticsData"
                  class="text-medium-emphasis pa-4"
                >
                  {{ emptyTaskTableMessage }}
                </div>
              </template>
              <template #item.task="{ item }">
                <div class="font-weight-medium">
                  {{ $t('analytics.sentiment.taskNumber', { number: item.number }) }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ item.name }}
                </div>
              </template>

              <template #item.facial="{ item }">
                <SentimentStackCell
                  :has-data="item.hasFacialData"
                  :positive="item.facialPositive"
                  :neutral="item.facialNeutral"
                  :negative="item.facialNegative"
                />
              </template>

              <template #item.text="{ item }">
                <SentimentStackCell
                  :has-data="item.hasTextData"
                  :positive="item.textPositive"
                  :neutral="item.textNeutral"
                  :negative="item.textNegative"
                />
              </template>
            </v-data-table>
          </v-card>
          </div>
        </template>
      </div>
    </div>

    <!-- Heuristic Test -->
    <div v-else>
      <h6>{{ $t('analytics.sentiment.heuristicUnavailable') }}</h6>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import UserModeratedSentiment from '@/ux/UserTest/components/sentimentAnalysis/UserModeratedSentiment.vue'
import SentimentStackCell from '@/ux/UserTest/components/sentimentAnalysis/SentimentStackCell.vue'
import UxMetricCard from '@/ux/UserTest/components/answers/UxMetricCard.vue'
import SelectionPieChart from '@/shared/components/charts/SelectionPieChart.vue'
import SentimentAnalyticsController from '@/ai/sentiment/SentimentAnalyticsController'
import {
  aggregateSentimentContributions,
  bucketHasData,
  bucketToCounts,
  dominantColor,
  emptySignalSlice,
  sliceHasData,
  toTaskAnalyticsKey,
} from '@/ai/sentiment/sentimentAnalyticsUtils'
import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
  normalizeStudyType,
} from '@/shared/constants/methodDefinitions'

const ALL_TASKS = 'all'
const ALL_USERS = 'all'
const ALL_SIGNALS = 'all'

const props = defineProps({
  taskDefinitions: {
    type: Array,
    default: () => [],
  },
})

const store = useStore()
const { t } = useI18n()
const analyticsController = new SentimentAnalyticsController()

const testDocument = computed(() => store.getters.test)
const visibleUserAnswers = computed(
  () => store.getters.visibleUserAnswers || {},
)
const testAnswerDocument = computed(
  () => store.state.Answer.testAnswerDocument || {},
)

const isUserStudy = computed(() => {
  const type =
    testAnswerDocument.value?.type || testDocument.value?.testType || ''
  return normalizeStudyType(type) === STUDY_TYPES.USER
})

const isModeratedUserStudy = computed(
  () => testDocument.value?.subType === USER_STUDY_SUBTYPES.MODERATED,
)

const answersDocId = computed(
  () =>
    store.getters.test?.answersDocId || testAnswerDocument.value?.id || null,
)

const searchTerm = ref('')
const selectedTaskFilter = ref(ALL_TASKS)
const selectedSignalFilter = ref(ALL_SIGNALS)
const selectedUserFilter = ref(ALL_USERS)

const loading = ref(false)
const userMetricsLoading = ref(false)
const loadError = ref(null)
const aggregatedAnalytics = ref(null)
const userSentimentDocs = ref([])
let userSentimentRequestToken = 0

const hasActiveFilters = computed(() => {
  return (
    !!searchTerm.value.trim() ||
    selectedTaskFilter.value !== ALL_TASKS ||
    selectedSignalFilter.value !== ALL_SIGNALS ||
    selectedUserFilter.value !== ALL_USERS
  )
})

const resetFilters = () => {
  searchTerm.value = ''
  selectedTaskFilter.value = ALL_TASKS
  selectedSignalFilter.value = ALL_SIGNALS
  selectedUserFilter.value = ALL_USERS
}

const sentimentOptions = ['Positive', 'Neutral', 'Negative']
const sentimentOptionLabels = computed(() => ({
  Positive: t('analytics.sentiment.positive'),
  Neutral: t('analytics.sentiment.neutral'),
  Negative: t('analytics.sentiment.negative'),
}))
const signalFilterOptions = computed(() => [
  { title: t('analytics.sentiment.allSignals'), value: ALL_SIGNALS },
  { title: t('analytics.sentiment.facial'), value: 'facial' },
  { title: t('analytics.sentiment.text'), value: 'text' },
])
const sentimentChartColors = ['#22C55E', '#94A3B8', '#EF4444']

const recordingTaskRows = computed(() => {
  const sourceTasks = Array.isArray(props.taskDefinitions)
    ? props.taskDefinitions
    : []

  return sourceTasks
    .map((task, index) => ({ task, index }))
    .filter(({ task }) => Boolean(task?.hasAudioRecord || task?.hasCamRecord))
    .map(({ task, index }) => ({
      taskId: String(index),
      taskNumber: index + 1,
      taskName:
        task?.taskName ||
        task?.name ||
        t('analytics.sentiment.taskNumber', { number: index + 1 }),
      analyticsKey: toTaskAnalyticsKey(index),
    }))
})

const taskFilterOptions = computed(() => [
  { title: t('analytics.sentiment.allTasks'), value: ALL_TASKS },
  ...recordingTaskRows.value.map((task) => ({
    title: t('analytics.sentiment.taskNumberName', {
      number: task.taskNumber,
      name: task.taskName,
    }),
    value: task.taskId,
  })),
])

const userFilterOptions = computed(() => {
  const options = [
    { title: t('analytics.sentiment.allUsers'), value: ALL_USERS },
  ]

  for (const [userDocId, session] of Object.entries(visibleUserAnswers.value)) {
    const title =
      session?.fullName ||
      session?.email ||
      session?.userDocId ||
      userDocId ||
      t('analytics.sentiment.userFallback')
    options.push({ title, value: String(userDocId) })
  }

  return options
})

const userSentimentPointers = computed(() => {
  const pointers = []

  for (const [userDocId, session] of Object.entries(visibleUserAnswers.value)) {
    const sessionTasks = session?.tasks || {}

    for (const [taskId, taskAnswer] of Object.entries(sessionTasks)) {
      const sentimentDocId = taskAnswer?.sentimentDocId
      if (!sentimentDocId) continue

      pointers.push({
        userDocId: String(userDocId),
        taskId: String(taskId),
        sentimentDocId: String(sentimentDocId),
      })
    }
  }

  return pointers
})

const userScopedAnalytics = computed(() => {
  if (selectedUserFilter.value === ALL_USERS) return null
  return aggregateSentimentContributions(userSentimentDocs.value)
})

const soleVisibleUserId = computed(() => {
  const ids = Object.keys(visibleUserAnswers.value)
  return ids.length === 1 ? String(ids[0]) : null
})

const usesAggregatedForSelectedUser = computed(
  () =>
    Boolean(soleVisibleUserId.value) &&
    String(selectedUserFilter.value) === soleVisibleUserId.value,
)

const activeAnalytics = computed(() => {
  if (
    selectedUserFilter.value === ALL_USERS ||
    usesAggregatedForSelectedUser.value
  ) {
    return aggregatedAnalytics.value
  }
  return userScopedAnalytics.value
})

const activeSlice = computed(() => {
  const analytics = activeAnalytics.value
  if (!analytics) return emptySignalSlice()

  if (selectedTaskFilter.value !== ALL_TASKS) {
    const key = toTaskAnalyticsKey(selectedTaskFilter.value)
    return analytics.tasks?.[key] || emptySignalSlice()
  }

  return analytics.general || emptySignalSlice()
})

const overallBucket = computed(() => {
  if (selectedSignalFilter.value === 'facial') {
    return activeSlice.value.bySignal.facial
  }
  if (selectedSignalFilter.value === 'text') {
    return activeSlice.value.bySignal.text
  }
  return activeSlice.value.combined
})

const hasAnalyticsData = computed(() => {
  if (selectedSignalFilter.value === 'facial') {
    return bucketHasData(activeSlice.value.bySignal.facial)
  }
  if (selectedSignalFilter.value === 'text') {
    return bucketHasData(activeSlice.value.bySignal.text)
  }
  return sliceHasData(activeSlice.value)
})

const formatDominant = (bucket) => {
  const dominant = bucket?.dominant
  if (!dominant) return '—'
  const key = String(dominant).toLowerCase()
  if (key === 'positive' || key === 'neutral' || key === 'negative') {
    return t(`analytics.sentiment.${key}`)
  }
  return dominant
}

const formatPercent = (bucket) => {
  const dominant = bucket?.dominant
  if (!dominant) return '0%'
  return `${Number(bucket[dominant]) || 0}%`
}

const highlightColorClass = (colorName) => {
  if (colorName === 'success') return 'text-success'
  if (colorName === 'error') return 'text-error'
  if (colorName === 'info') return 'text-info'
  if (colorName === 'warning') return 'text-warning-darken-2'
  return 'text-medium-emphasis'
}

const taskBucketSource = computed(() => activeAnalytics.value?.tasks || {})

const warningTask = computed(() => {
  const buckets = taskBucketSource.value
  let worst = null

  for (const task of recordingTaskRows.value) {
    const slice = buckets[task.analyticsKey] || emptySignalSlice()
    const bucket =
      selectedSignalFilter.value === 'facial'
        ? slice.bySignal.facial
        : selectedSignalFilter.value === 'text'
          ? slice.bySignal.text
          : slice.combined

    if (!bucket?.sampleCount) continue

    const negative = Number(bucket.Negative) || 0
    if (negative <= 0) continue
    if (!worst || negative > worst.negative) {
      worst = { task, negative, bucket }
    }
  }

  return worst
})

const overallDescription = computed(() => {
  if (selectedSignalFilter.value === 'facial') {
    return t('analytics.sentiment.overallFacialDescription')
  }
  if (selectedSignalFilter.value === 'text') {
    return t('analytics.sentiment.overallTextDescription')
  }
  return t('analytics.sentiment.overallDescription')
})

const summaryHighlights = computed(() => {
  const overall = overallBucket.value
  const facial = activeSlice.value.bySignal.facial
  const text = activeSlice.value.bySignal.text
  const overallColor = dominantColor(overall.dominant)
  const facialColor = dominantColor(facial.dominant)
  const textColor = dominantColor(text.dominant)
  const warning = warningTask.value

  const cards = [
    {
      id: 'overall',
      title: t('analytics.sentiment.overall'),
      value: formatDominant(overall),
      metric: formatPercent(overall),
      color: overallColor,
      icon: 'mdi-chart-line',
      progress: Number(overall[overall.dominant]) || 0,
      valueClass: highlightColorClass(overallColor),
      metricClass: highlightColorClass(overallColor),
      description: overallDescription.value,
    },
    {
      id: 'facial',
      title: t('analytics.sentiment.facialSentiment'),
      value: formatDominant(facial),
      metric: formatPercent(facial),
      color: facialColor,
      icon: 'mdi-emoticon-neutral-outline',
      progress: Number(facial[facial.dominant]) || 0,
      valueClass: highlightColorClass(facialColor),
      metricClass: highlightColorClass(facialColor),
      description: t('analytics.sentiment.facialDescription'),
    },
    {
      id: 'text',
      title: t('analytics.sentiment.textSentiment'),
      value: formatDominant(text),
      metric: formatPercent(text),
      color: textColor,
      icon: 'mdi-text-box-check-outline',
      progress: Number(text[text.dominant]) || 0,
      valueClass: highlightColorClass(textColor),
      metricClass: highlightColorClass(textColor),
      description: t('analytics.sentiment.textDescription'),
    },
    {
      id: 'warning',
      title: t('analytics.sentiment.warning'),
      value: warning
        ? t('analytics.sentiment.taskNumber', {
            number: warning.task.taskNumber,
          })
        : '—',
      metric: warning ? `${warning.negative}%` : '—',
      color: warning ? 'warning' : 'grey',
      icon: 'mdi-alert-circle-outline',
      progress: warning?.negative || 0,
      valueClass: warning ? 'text-warning-darken-2' : 'text-medium-emphasis',
      metricClass: warning ? 'text-error' : 'text-medium-emphasis',
      description: t('analytics.sentiment.warningDescription'),
    },
  ]

  if (selectedSignalFilter.value === 'facial') {
    return cards.filter((card) => card.id !== 'text')
  }
  if (selectedSignalFilter.value === 'text') {
    return cards.filter((card) => card.id !== 'facial')
  }
  return cards
})

const summaryColMd = computed(() => {
  const count = summaryHighlights.value.length
  if (count >= 4) return 3
  if (count === 3) return 4
  return 6
})

const facialSentimentCounts = computed(() =>
  bucketToCounts(activeSlice.value.bySignal.facial),
)

const textSentimentCounts = computed(() =>
  bucketToCounts(activeSlice.value.bySignal.text),
)

const hasFacialPieData = computed(() =>
  bucketHasData(activeSlice.value.bySignal.facial),
)

const hasTextPieData = computed(() =>
  bucketHasData(activeSlice.value.bySignal.text),
)

const sentimentByTask = computed(() => {
  const buckets = taskBucketSource.value

  return recordingTaskRows.value.map((task) => {
    const slice = buckets[task.analyticsKey] || emptySignalSlice()
    const facial = slice.bySignal.facial
    const text = slice.bySignal.text

    return {
      number: task.taskNumber,
      name: task.taskName,
      taskId: task.taskId,
      task: `Task ${task.taskNumber}`,
      facialPositive: Number(facial.Positive) || 0,
      facialNeutral: Number(facial.Neutral) || 0,
      facialNegative: Number(facial.Negative) || 0,
      textPositive: Number(text.Positive) || 0,
      textNeutral: Number(text.Neutral) || 0,
      textNegative: Number(text.Negative) || 0,
      hasFacialData: bucketHasData(facial),
      hasTextData: bucketHasData(text),
    }
  })
})

const filteredSentimentByTask = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()

  return sentimentByTask.value.filter((task) => {
    const matchesTask =
      selectedTaskFilter.value === ALL_TASKS ||
      String(selectedTaskFilter.value) === String(task.taskId)

    if (!matchesTask) return false

    if (!term) return true

    return (
      task.name.toLowerCase().includes(term) ||
      t('analytics.sentiment.taskNumber', { number: task.number })
        .toLowerCase()
        .includes(term)
    )
  })
})

const emptyDashboardMessage = computed(() => {
  if (recordingTaskRows.value.length === 0) {
    return t('analytics.sentiment.emptyNoRecordingTasks')
  }
  if (hasActiveFilters.value) {
    return t('analytics.sentiment.emptyNoAnalyticsForFilters')
  }
  return t('analytics.sentiment.emptyAnalytics')
})

const emptyTaskTableMessage = computed(() => {
  if (recordingTaskRows.value.length === 0) {
    return t('analytics.sentiment.emptyNoRecordingTasks')
  }
  if (!hasAnalyticsData.value) {
    return t('analytics.sentiment.emptyNoAnalyticsForFilters')
  }
  return t('analytics.sentiment.emptyNoMatchingTasks')
})

const taskSentimentHeaders = computed(() => [
  { title: t('analytics.sentiment.task'), key: 'task', sortable: false },
  { title: t('analytics.sentiment.facial'), key: 'facial', sortable: false },
  { title: t('analytics.sentiment.text'), key: 'text', sortable: false },
])

const visibleTaskSentimentHeaders = computed(() => {
  if (selectedSignalFilter.value === 'facial') {
    return taskSentimentHeaders.value.filter((header) => header.key !== 'text')
  }

  if (selectedSignalFilter.value === 'text') {
    return taskSentimentHeaders.value.filter(
      (header) => header.key !== 'facial',
    )
  }

  return taskSentimentHeaders.value
})

const showFacialSignal = computed(
  () => selectedSignalFilter.value !== 'text',
)
const showTextSignal = computed(
  () => selectedSignalFilter.value !== 'facial',
)
const showSingleSignal = computed(
  () =>
    selectedSignalFilter.value === 'facial' ||
    selectedSignalFilter.value === 'text',
)

const loadAggregatedAnalytics = async () => {
  if (!answersDocId.value) {
    aggregatedAnalytics.value = null
    return
  }

  loading.value = true
  loadError.value = null

  try {
    aggregatedAnalytics.value = await analyticsController.getByAnswersDocId(
      answersDocId.value,
    )
  } catch (error) {
    console.error('Failed to load sentiment analytics:', error)
    loadError.value = t('analytics.sentiment.loadError')
    aggregatedAnalytics.value = null
  } finally {
    loading.value = false
  }
}

const loadUserSentimentDocs = async (userDocId) => {
  const requestToken = ++userSentimentRequestToken

  if (!userDocId || userDocId === ALL_USERS) {
    if (requestToken !== userSentimentRequestToken) return
    userSentimentDocs.value = []
    userMetricsLoading.value = false
    return
  }

  if (
    soleVisibleUserId.value &&
    String(userDocId) === soleVisibleUserId.value
  ) {
    if (requestToken !== userSentimentRequestToken) return
    userSentimentDocs.value = []
    userMetricsLoading.value = false
    return
  }

  const pointers = userSentimentPointers.value.filter(
    (pointer) => pointer.userDocId === String(userDocId),
  )

  userMetricsLoading.value = true
  try {
    let docs = []
    if (answersDocId.value) {
      try {
        docs = await analyticsController.getByAnswersDocIdAndUser(
          answersDocId.value,
          userDocId,
        )
      } catch (error) {
        console.error('Failed to query user sentiment documents:', error)
      }
    }

    if (docs.length === 0 && pointers.length > 0) {
      const fetched = await analyticsController.getByIds(
        pointers.map((pointer) => pointer.sentimentDocId),
      )
      const byId = Object.fromEntries(fetched.map((item) => [item.id, item]))
      docs = pointers
        .map((pointer) => {
          const item = byId[pointer.sentimentDocId]
          return {
            id: pointer.sentimentDocId,
            userDocId: pointer.userDocId,
            taskId: pointer.taskId,
            facial: item?.facial ?? null,
            text: item?.text ?? null,
          }
        })
        .filter((item) => item.facial || item.text)
    }

    if (requestToken !== userSentimentRequestToken) return
    userSentimentDocs.value = docs
  } catch (error) {
    if (requestToken !== userSentimentRequestToken) return
    console.error('Failed to load user sentiment documents:', error)
    loadError.value = t('analytics.sentiment.loadUserError')
    userSentimentDocs.value = []
  } finally {
    if (requestToken === userSentimentRequestToken) {
      userMetricsLoading.value = false
    }
  }
}

watch(answersDocId, async () => {
  await loadAggregatedAnalytics()
  if (selectedUserFilter.value !== ALL_USERS) {
    await loadUserSentimentDocs(selectedUserFilter.value)
  }
})

watch(selectedUserFilter, (userDocId) => {
  loadUserSentimentDocs(userDocId)
})

onMounted(() => {
  loadAggregatedAnalytics()
})
</script>

<style scoped>
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

.analytics-empty-card {
  border-radius: 12px;
  border-style: dashed;
  background: #f8fafc;
}

.analytics-disabled {
  filter: grayscale(0.35);
  pointer-events: none;
  user-select: none;
}
</style>
