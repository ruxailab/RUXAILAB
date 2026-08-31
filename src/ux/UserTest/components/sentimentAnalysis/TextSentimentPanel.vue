<template>
  <v-card
    variant="outlined"
    elevation="2"
    rounded="xl"
    class="pa-4 overflow-y-auto"
  >
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col cols="auto">
        <h3 class="text-h5 font-weight-bold mb-1">
          Transcription Sentiment Analysis
        </h3>
        <div class="text-body-2 text-grey">
          Tone insights based on spoken feedback in the task audio
        </div>
      </v-col>
      <v-spacer />
      <v-col v-if="hasResults" cols="auto">
        <v-btn
          variant="outlined"
          :disabled="isAnalyzing"
          @click="startAnalysis()"
        >
          <span class="sr-only">Re-analyze Audio</span>
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-chip
          :color="statusChipColor"
          variant="flat"
          append-icon="mdi-microphone-message"
        >
          {{ statusLabel }}
        </v-chip>
      </v-col>
    </v-row>

    <v-row
      v-if="!isAnalyzing && !hasResults"
      justify="center"
      align="center"
      class="my-12"
    >
      <v-col cols="12" md="8" class="text-center">
        <div class="idle-icon-wrap mb-4">
          <v-icon size="72" color="primary" icon="mdi-microphone-message" />
        </div>
        <div class="text-body-1 font-weight-medium mb-1">
          Ready to analyze transcription sentiment
        </div>
        <div class="text-body-2 text-grey-darken-1 mb-6">
          Processing starts only when you click the button below. This may take
          1–2 minutes.
        </div>
        <v-btn
          color="primary"
          size="large"
          :disabled="!canStartAnalysis"
          @click="startAnalysis()"
        >
          <v-icon start>mdi-play</v-icon>
          Start Transcription Sentiment Analysis
        </v-btn>
        <div
          v-if="!canStartAnalysis"
          class="mt-3 text-body-2 text-grey-darken-1"
        >
          Audio recording or session identifiers are not available for this
          task.
        </div>
        <v-alert
          v-if="analysisError"
          type="error"
          variant="tonal"
          class="mt-4 text-left"
        >
          {{ analysisError }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else-if="isAnalyzing" justify="center" align="center" class="my-12">
      <v-col cols="auto" class="text-center">
        <v-progress-circular indeterminate size="64" color="primary" />
        <div class="mt-3 text-body-1 font-weight-medium">
          Analyzing transcription sentiment...
        </div>
        <div class="mt-1 text-body-2 text-grey-darken-1">
          This may take 1–2 minutes
        </div>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-if="analysisError" cols="12">
        <v-alert type="error" variant="tonal">
          {{ analysisError }}
        </v-alert>
      </v-col>

      <v-col
        v-for="metric in summaryMetrics"
        :key="metric.label"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card class="pa-4" elevation="2" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="font-weight-medium text-grey-darken-1">
              {{ metric.label }}
            </span>
            <v-icon :color="metric.color">{{ metric.icon }}</v-icon>
          </div>
          <div class="text-h6 font-weight-bold">{{ metric.value }}</div>
          <v-progress-linear
            :model-value="metric.progress"
            :color="metric.color"
            height="6"
            class="mt-2"
            rounded
          />
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">
            Sentiment Distribution
          </h4>
          <div
            v-for="bar in distributionBars"
            :key="bar.label"
            class="mb-3"
          >
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>{{ bar.label }}</span>
              <span class="font-weight-medium">{{ bar.value }}%</span>
            </div>
            <v-progress-linear
              :model-value="bar.value"
              :color="bar.color"
              height="10"
              rounded
            />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">Key Insights</h4>
          <v-row>
            <v-col v-for="(insight, index) in insights" :key="index" cols="12">
              <v-alert
                :type="insight.type"
                variant="tonal"
                class="rounded-xl"
                border="start"
                :border-color="insight.color"
              >
                <v-icon class="mr-2" :color="insight.color">{{
                  insight.icon
                }}</v-icon>
                <span class="font-weight-medium">{{ insight.text }}</span>
              </v-alert>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { analyzeTextSentimentTask } from '@/app/services/textSentiment/TextSentimentService'
import SentimentController from '@/ai/sentiment/SentimentController'

const store = useStore()
const sentimentController = new SentimentController()
const emit = defineEmits(['saved'])
const props = defineProps({
  audioUrl: { type: String, default: null },
  sentimentDocId: { type: String, default: null },
  legacyTextResults: { type: Object, default: null },
  testAnswer: { type: Object, default: null },
  selectedTask: { type: Number, default: 0 },
  answersDocId: { type: String, default: '' },
  userDocId: { type: String, default: '' },
  taskId: { type: [String, Number], default: null },
  studyId: { type: String, default: null },
})

const isAnalyzing = ref(false)
const hasResults = ref(false)
const analysisError = ref(null)
const summaryMetrics = ref([])
const insights = ref([])
const distributionBars = ref([])

const canStartAnalysis = computed(
  () =>
    Boolean(props.audioUrl) &&
    Boolean(props.answersDocId) &&
    Boolean(props.userDocId) &&
    props.taskId != null &&
    props.taskId !== '',
)

const statusLabel = computed(() => {
  if (isAnalyzing.value) return 'Analyzing...'
  if (hasResults.value) return 'Analysis Complete'
  return 'Waiting to start'
})

const statusChipColor = computed(() => {
  if (isAnalyzing.value) return 'grey'
  if (hasResults.value) return 'primary'
  return 'blue-grey'
})

onMounted(() => {
  loadExistingResults()
})

watch(
  () => [
    props.selectedTask,
    props.taskId,
    props.audioUrl,
    props.sentimentDocId,
    props.legacyTextResults,
    props.testAnswer,
  ],
  () => {
    if (!isAnalyzing.value) {
      loadExistingResults()
    }
  },
)

function resetResultsUi() {
  hasResults.value = false
  analysisError.value = null
  summaryMetrics.value = []
  insights.value = []
  distributionBars.value = []
}

function resolveTaskFromTestAnswer() {
  const tasks = props.testAnswer?.tasks
  if (!tasks || typeof tasks !== 'object') return null

  if (props.taskId != null && props.taskId !== '') {
    const byTaskId = tasks[props.taskId] ?? tasks[String(props.taskId)]
    if (byTaskId) return byTaskId
  }

  return tasks[props.selectedTask] ?? tasks[String(props.selectedTask)] ?? null
}

function resolveSentimentDocId() {
  if (props.sentimentDocId) return props.sentimentDocId
  const task = resolveTaskFromTestAnswer()
  return task?.sentimentDocId || null
}

function resolveLegacyTextResults() {
  if (props.legacyTextResults) return props.legacyTextResults
  const task = resolveTaskFromTestAnswer()
  return task?.textSentimentResults || null
}

async function loadExistingResults() {
  const sentimentDocId = resolveSentimentDocId()

  if (sentimentDocId) {
    try {
      const sentiment = await sentimentController.getById(sentimentDocId)
      const existingResults = sentiment?.text ?? null
      if (existingResults) {
        updateUI(existingResults)
        hasResults.value = true
        isAnalyzing.value = false
        analysisError.value = null
        return
      }
    } catch (err) {
      console.error('Failed to load text sentiment document:', err)
    }
  }

  const legacyResults = resolveLegacyTextResults()
  if (legacyResults && typeof legacyResults === 'object') {
    updateUI(legacyResults)
    hasResults.value = true
    isAnalyzing.value = false
    analysisError.value = null
    return
  }

  resetResultsUi()
  isAnalyzing.value = false
}

async function startAnalysis() {
  if (!canStartAnalysis.value) {
    analysisError.value =
      'Missing session identifiers or audio recording for this task.'
    return
  }

  try {
    isAnalyzing.value = true
    analysisError.value = null

    const result = await analyzeTextSentimentTask({
      answersDocId: props.answersDocId,
      userDocId: props.userDocId,
      taskId: String(props.taskId),
      studyId: props.studyId || undefined,
    })

    const text = result?.text
    if (!text) {
      throw new Error('Text sentiment response did not include results.')
    }

    updateUI(text)
    hasResults.value = true

    await store.dispatch('getCurrentTestAnswerDoc')
    emit('saved', result)
  } catch (err) {
    console.error('Text sentiment analysis failed:', err.message || err)
    analysisError.value =
      err?.message || 'Failed to process transcription sentiment analysis.'
  } finally {
    isAnalyzing.value = false
  }
}

function updateUI(data) {
  const positive = Number(data.Positive) || 0
  const neutral = Number(data.Neutral) || 0
  const negative = Number(data.Negative) || 0
  const sampleCount = Number(data.sampleCount) || 0

  const scores = [
    ['Positive', positive],
    ['Neutral', neutral],
    ['Negative', negative],
  ]
  scores.sort((a, b) => b[1] - a[1])
  const dominant = scores[0]

  summaryMetrics.value = [
    {
      label: 'Dominant Tone',
      value: `${dominant[0]} (${dominant[1]}%)`,
      progress: dominant[1],
      color: getToneColor(dominant[0]),
      icon: getToneIcon(dominant[0]),
    },
    {
      label: 'Positive',
      value: `${positive}%`,
      progress: positive,
      color: 'light-green-darken-2',
      icon: 'mdi-trending-up',
    },
    {
      label: 'Neutral',
      value: `${neutral}%`,
      progress: neutral,
      color: 'blue-grey',
      icon: 'mdi-minus',
    },
    {
      label: 'Negative',
      value: `${negative}%`,
      progress: negative,
      color: 'red',
      icon: 'mdi-trending-down',
    },
  ]

  distributionBars.value = [
    { label: 'Positive', value: positive, color: 'light-green-darken-2' },
    { label: 'Neutral', value: neutral, color: 'blue-grey' },
    { label: 'Negative', value: negative, color: 'red' },
  ]

  generateInsights({ positive, neutral, negative, sampleCount, dominant })
}

function generateInsights({ positive, neutral, negative, sampleCount, dominant }) {
  insights.value = []

  const toneMessages = {
    Positive:
      'Positive tone dominates the spoken feedback, suggesting satisfaction or smooth task progress.',
    Neutral:
      'Neutral tone prevails, indicating matter-of-fact commentary without strong emotional charge.',
    Negative:
      'Negative tone stands out, pointing to friction, confusion, or dissatisfaction during the task.',
  }

  insights.value.push({
    text:
      toneMessages[dominant[0]] ||
      `Dominant tone: ${dominant[0]} (${dominant[1]}%).`,
    color: getToneColor(dominant[0]),
    icon: getToneIcon(dominant[0]),
    type: getToneType(dominant[0]),
  })

  if (positive > negative) {
    insights.value.push({
      text: `Overall spoken mood leans positive (${positive}% positive vs ${negative}% negative).`,
      color: 'light-green-darken-2',
      icon: 'mdi-trending-up',
      type: 'success',
    })
  } else if (negative > positive) {
    insights.value.push({
      text: `Negative speech prevails (${negative}% negative vs ${positive}% positive). Review moments of hesitation or frustration.`,
      color: 'red',
      icon: 'mdi-trending-down',
      type: 'error',
    })
  } else {
    insights.value.push({
      text: `Balanced spoken sentiment — positive and negative tones are evenly distributed.`,
      color: 'blue-grey',
      icon: 'mdi-balance-scale',
      type: 'info',
    })
  }

  if (sampleCount > 0 && insights.value.length < 2) {
    insights.value.push({
      text: `Based on ${sampleCount} utterance${sampleCount === 1 ? '' : 's'} from the task audio.`,
      color: 'blue-grey',
      icon: 'mdi-microphone-outline',
      type: 'info',
    })
  }

  insights.value = insights.value.slice(0, 2)
}

function getToneColor(tone) {
  const colors = {
    Positive: 'light-green-darken-2',
    Neutral: 'blue-grey',
    Negative: 'red',
  }
  return colors[tone] || 'grey'
}

function getToneIcon(tone) {
  const icons = {
    Positive: 'mdi-emoticon-happy-outline',
    Neutral: 'mdi-emoticon-neutral-outline',
    Negative: 'mdi-emoticon-sad-outline',
  }
  return icons[tone] || 'mdi-emoticon-outline'
}

function getToneType(tone) {
  const types = {
    Positive: 'success',
    Neutral: 'info',
    Negative: 'error',
  }
  return types[tone] || 'info'
}
</script>

<style scoped>
.idle-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.1);
}
</style>
