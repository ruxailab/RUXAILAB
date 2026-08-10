<template>
  <div class="pa-1">
    <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
      <div class="d-flex align-center flex-wrap button-bar">
        <v-text-field
          v-model="searchTerm"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          variant="outlined"
          placeholder="Search by task or keyword"
          class="flex-grow-1"
        />
        <v-btn
          color="primary"
          class="search-btn"
          prepend-icon="mdi-magnify"
          @click="triggerSearch"
        >
          Search
        </v-btn>
        <v-btn
          color="primary"
          class="search-btn"
          prepend-icon="mdi-filter-remove"
          :disabled="!hasActiveSearch"
          @click="resetSearch"
        >
          Reset
        </v-btn>
      </div>

      <v-row dense class="mt-1">
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
    </v-card>

    <v-row dense class="mb-4">
      <v-col
        v-for="card in summaryCards"
        :key="card.label"
        cols="12"
        sm="6"
        md="3"
      >
        <UxMetricCard
          :value="card.value"
          :label="card.label"
          :color="card.color"
          :icon="card.icon"
          :description="card.description"
          :progress="card.progress"
        />
      </v-col>
    </v-row>

    <v-row dense class="mb-4">
      <v-col cols="12" md="4">
        <SelectionPieChart
          question-title="Feedback Tone"
          :options="sentimentOptions"
          :counts="sentimentCounts"
          canvas-id="transcriptions-sentiment-chart"
          :chart-colors="sentimentChartColors"
        />
      </v-col>

      <v-col cols="12" md="8">
        <v-card elevation="2" style="border-radius: 12px" class="h-100 pa-6">
          <div class="d-flex justify-space-between align-center">
            <h4 class="font-weight-bold">Top Keywords</h4>
          </div>
          <div>
            <div class="word-cloud-wrap">
              <VueWordCloud
                :words="filteredKeywordCloudWords"
                :color="([, weight]) => getKeywordColor(weight)"
                font-family="Roboto"
                :font-size-ratio="4"
                style="height: 240px; width: 100%"
              />
            </div>
            <div class="d-flex flex-wrap ga-2 mt-3">
              <v-chip
                v-for="keyword in filteredTopKeywords"
                :key="keyword.word"
                size="x-small"
                color="primary"
                variant="tonal"
              >
                {{ keyword.word }} ({{ keyword.count }})
              </v-chip>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="2" style="border-radius: 12px" class="mb-4 pa-6">
      <div class="mb-4 d-flex justify-space-between align-center">
        <h4 class="font-weight-bold mb-2">
          <v-icon start color="primary">mdi-table</v-icon>
          Task-Level Transcription Analytics
        </h4>
      </div>
      <div>
        <v-alert
          v-if="filteredTaskStats.length === 0"
          type="info"
          variant="tonal"
          class="mb-0"
        >
          No tasks with audio recording enabled in this test.
        </v-alert>

        <v-data-table
          v-else
          :headers="taskTableHeaders"
          :items="filteredTaskStats"
          :items-per-page="10"
          class="elevation-0"
        >
          <template #item.taskName="{ item }">
            <div class="font-weight-medium">{{ item.taskName }}</div>
          </template>

          <template #item.duration="{ item }">
            <v-chip size="small" color="primary" variant="tonal">
              {{ item.duration }}
            </v-chip>
          </template>

          <template #item.words="{ item }">
            <span class="font-weight-medium">{{ item.words }}</span>
          </template>

          <template #item.longPauses="{ item }">
            <v-chip size="x-small" color="warning" variant="tonal">
              {{ item.longPauses }}
            </v-chip>
          </template>

          <template #item.negativeStatements="{ item }">
            <v-chip size="x-small" color="error" variant="tonal">
              {{ item.negativeStatements }}
            </v-chip>
          </template>

          <template #item.sentiment="{ item }">
            <v-chip size="x-small" :color="item.sentimentColor" variant="tonal">
              {{ item.sentiment }}
            </v-chip>
          </template>
        </v-data-table>
      </div>
    </v-card>

    <v-row dense class="mb-4">
      <v-col cols="12" md="6">
        <v-card elevation="2" style="border-radius: 12px" class="h-100 pa-6">
          <div class="mb-4 d-flex justify-space-between align-center">
            <h4 class="font-weight-bold mb-2">UX Signals</h4>
            <v-chip
              color="primary"
              size="small"
              variant="outlined"
              class="chip-responsive mb-2"
            >
              <v-icon
                icon="mdi-clock-outline"
                size="small"
                class="d-none d-sm-inline me-1"
              />
              Coming Soon
            </v-chip>
          </div>
          <div class="coming-soon-overlay">
            <v-expansion-panels
              v-model="openSignalPanels"
              multiple
              variant="accordion"
              elevation="0"
            >
              <v-expansion-panel
                v-for="(signal, index) in uxSignals"
                :key="signal.label"
                :value="index"
              >
                <v-expansion-panel-title>
                  <div
                    class="d-flex align-center justify-space-between w-100 pr-2"
                  >
                    <div class="d-flex align-center ga-2">
                      <v-icon :color="signal.color" size="18">{{
                        signal.icon
                      }}</v-icon>
                      <span class="font-weight-medium">{{ signal.label }}</span>
                    </div>
                    <v-chip size="small" :color="signal.color" variant="tonal">
                      {{ signal.count }}
                    </v-chip>
                  </div>
                </v-expansion-panel-title>

                <v-expansion-panel-text>
                  <div
                    v-for="item in signal.items"
                    :key="`${signal.label}-${item.time}-${item.quote}`"
                    class="signal-item py-2"
                  >
                    <div class="d-flex align-center ga-2 mb-1">
                      <v-chip size="x-small" color="grey" variant="tonal">
                        {{ item.time }}
                      </v-chip>
                      <span class="text-caption text-medium-emphasis">{{
                        item.task
                      }}</span>
                    </div>
                    <div class="text-body-2 text-grey-darken-2">
                      "{{ item.quote }}"
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="2" style="border-radius: 12px" class="h-100 pa-6">
          <div class="mb-4 d-flex justify-space-between align-center">
            <h4 class="font-weight-bold mb-2">AI Session Summary</h4>
            <v-chip
              color="primary"
              size="small"
              variant="outlined"
              class="chip-responsive mb-2"
            >
              <v-icon
                icon="mdi-clock-outline"
                size="small"
                class="d-none d-sm-inline me-1"
              />
              Coming Soon
            </v-chip>
          </div>
          <div class="coming-soon-overlay">
            <p class="text-body-2 mb-3">
              The participant completed all tasks with generally
              neutral-positive sentiment. Most hesitation appeared around
              navigation and checkout-related wording. Positive feedback
              concentrated on search and filtering interactions.
            </p>
            <v-alert
              type="info"
              variant="tonal"
              density="comfortable"
              class="text-body-2"
            >
              AI-generated analysis: review with video and transcript evidence
              before final conclusions.
            </v-alert>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import VueWordCloud from 'vuewordcloud'
import UxMetricCard from '../answers/UxMetricCard.vue'
import SelectionPieChart from '../answers/SelectionPieChart.vue'

const props = defineProps({
  taskNames: {
    type: Array,
    default: () => [],
  },
  taskDefinitions: {
    type: Array,
    default: () => [],
  },
})

const store = useStore()
const openSignalPanels = ref([])
const searchTerm = ref('')
const selectedTaskFilter = ref('All Tasks')
const selectedUserFilter = ref('All Users')

const visibleUserAnswers = computed(
  () => store.getters.visibleUserAnswers || {},
)

const hasActiveSearch = computed(
  () =>
    !!searchTerm.value.trim() ||
    selectedTaskFilter.value !== 'All Tasks' ||
    selectedUserFilter.value !== 'All Users',
)

const resetSearch = () => {
  searchTerm.value = ''
  selectedTaskFilter.value = 'All Tasks'
  selectedUserFilter.value = 'All Users'
}

const triggerSearch = () => {
  /* no-op: computed filtering reacts automatically */
}

const taskTableHeaders = [
  { title: 'Task', key: 'taskName', sortable: false },
  { title: 'Duration', key: 'duration', sortable: false },
  { title: 'Words', key: 'words', sortable: false },
  { title: 'Long Pauses', key: 'longPauses', sortable: false },
  { title: 'Negative Statements', key: 'negativeStatements', sortable: false },
  { title: 'Sentiment', key: 'sentiment', sortable: false },
]

const summaryCards = [
  {
    label: 'Session Duration',
    value: '12m 34s',
    color: 'primary',
    icon: 'mdi-timer-outline',
    description: 'Total time from first interaction to task completion.',
    progress: 78,
  },
  {
    label: 'Words Spoken',
    value: '1,247',
    color: 'info',
    icon: 'mdi-microphone-message',
    description: 'Approximate number of words detected in the session.',
    progress: 64,
  },
  {
    label: 'Speaking Time',
    value: '8m 42s',
    color: 'success',
    icon: 'mdi-account-voice',
    description: 'Amount of time with active participant speech.',
    progress: 69,
  },
  {
    label: 'Speech Rate',
    value: '143 wpm',
    color: 'warning',
    icon: 'mdi-speedometer',
    description: 'Average words-per-minute across speaking segments.',
    progress: 72,
  },
]

const sentimentOptions = ['Positive', 'Neutral', 'Negative']

const sentimentCounts = {
  Positive: 48,
  Neutral: 34,
  Negative: 18,
}

const sentimentChartColors = ['#22C55E', '#0EA5E9', '#EF4444']

const uxSignals = [
  {
    label: 'Confusion',
    count: 4,
    icon: 'mdi-alert-circle-outline',
    color: 'warning',
    items: [
      {
        time: '03:42',
        task: 'Task 2',
        quote: 'I thought the cart would be somewhere up here.',
      },
      {
        time: '05:19',
        task: 'Task 2',
        quote: 'Not sure if this is the final step or not.',
      },
      {
        time: '06:44',
        task: 'Task 3',
        quote: 'I am confused by these labels.',
      },
      {
        time: '08:07',
        task: 'Task 3',
        quote: 'Wait, where did the previous option go?',
      },
    ],
  },
  {
    label: 'Navigation Difficulty',
    count: 3,
    icon: 'mdi-map-marker-question-outline',
    color: 'warning',
    items: [
      {
        time: '02:58',
        task: 'Task 1',
        quote: 'I am clicking but not finding the category.',
      },
      {
        time: '04:11',
        task: 'Task 2',
        quote: 'This menu is hidden, I did not see it.',
      },
      {
        time: '07:03',
        task: 'Task 3',
        quote: 'I had to go back twice to continue.',
      },
    ],
  },
  {
    label: 'Positive Feedback',
    count: 6,
    icon: 'mdi-thumb-up-outline',
    color: 'success',
    items: [
      { time: '01:47', task: 'Task 1', quote: 'The search feels very quick.' },
      { time: '02:22', task: 'Task 1', quote: 'This filter is useful.' },
      { time: '04:56', task: 'Task 2', quote: 'The product cards are clear.' },
      {
        time: '06:10',
        task: 'Task 2',
        quote: 'Now this part is easy to follow.',
      },
      {
        time: '07:16',
        task: 'Task 3',
        quote: 'This filter actually helps a lot.',
      },
      {
        time: '08:33',
        task: 'Task 3',
        quote: 'I like the confirmation message here.',
      },
    ],
  },
  {
    label: 'Suggestions',
    count: 2,
    icon: 'mdi-lightbulb-on-outline',
    color: 'info',
    items: [
      {
        time: '05:43',
        task: 'Task 2',
        quote: 'Maybe add a shortcut button to checkout.',
      },
      {
        time: '08:49',
        task: 'Task 3',
        quote: 'A progress indicator would be great in this flow.',
      },
    ],
  },
  {
    label: 'Frustration',
    count: 2,
    icon: 'mdi-emoticon-sad-outline',
    color: 'error',
    items: [
      {
        time: '04:32',
        task: 'Task 2',
        quote: 'I do not understand where I am supposed to click here.',
      },
      {
        time: '06:51',
        task: 'Task 3',
        quote: 'This took longer than expected and felt repetitive.',
      },
    ],
  },
]

const topKeywords = [
  { word: 'checkout', count: 14 },
  { word: 'product', count: 12 },
  { word: 'search', count: 9 },
  { word: 'price', count: 8 },
  { word: 'shipping', count: 6 },
]

const filteredTopKeywords = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return topKeywords

  return topKeywords.filter((keyword) =>
    keyword.word.toLowerCase().includes(term),
  )
})

const filteredKeywordCloudWords = computed(() =>
  filteredTopKeywords.value.map((keyword) => [keyword.word, keyword.count]),
)

const getKeywordColor = (weight) => {
  if (weight >= 12) return '#0D47A1'
  if (weight >= 9) return '#1976D2'
  if (weight >= 7) return '#42A5F5'
  return '#90CAF9'
}

const statTemplates = [
  {
    duration: '2m 14s',
    words: 186,
    longPauses: 2,
    negativeStatements: 1,
    sentiment: 'Neutral',
    sentimentColor: 'info',
  },
  {
    duration: '3m 05s',
    words: 242,
    longPauses: 3,
    negativeStatements: 2,
    sentiment: 'Negative',
    sentimentColor: 'error',
  },
  {
    duration: '2m 41s',
    words: 209,
    longPauses: 1,
    negativeStatements: 0,
    sentiment: 'Positive',
    sentimentColor: 'success',
  },
]

const taskStats = computed(() => {
  const sourceTasks = Array.isArray(props.taskDefinitions)
    ? props.taskDefinitions
    : []

  const audioTasks = sourceTasks.filter((task) => Boolean(task?.hasAudioRecord))

  const names = audioTasks.length
    ? audioTasks.map((task, index) => task?.taskName || `Task ${index + 1}`)
    : []

  return names.map((taskName, index) => {
    const template = statTemplates[index % statTemplates.length]
    return {
      taskNumber: index + 1,
      taskName,
      ...template,
    }
  })
})

const taskFilterOptions = computed(() => [
  'All Tasks',
  ...taskStats.value.map((task) => `Task ${task.taskNumber}`),
])

const userFilterOptions = computed(() => {
  const users = Object.values(visibleUserAnswers.value)
    .map((session, index) => {
      return (
        session.fullName ||
        session.email ||
        session.userDocId ||
        `User ${index + 1}`
      )
    })
    .filter(Boolean)

  return ['All Users', ...new Set(users)]
})

const filteredTaskStats = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()

  return taskStats.value.filter((task) => {
    const matchesSearch = !term || task.taskName.toLowerCase().includes(term)
    const matchesTask =
      selectedTaskFilter.value === 'All Tasks' ||
      selectedTaskFilter.value === `Task ${task.taskNumber}`

    return matchesSearch && matchesTask
  })
})
</script>

<style scoped>
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

.word-cloud-wrap {
  border-radius: 12px;
  padding-right: 10px;
  padding-left: 10px;
  background: #ffffff;
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

.chip-responsive {
  font-size: 0.75rem;
  min-width: 95px;
}
</style>
