<template>
  <v-card
    variant="outlined"
    elevation="2"
    rounded="xl"
    class="pa-4 overflow-y-auto"
  >
    <!-- Header -->
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col cols="auto">
        <h3 class="text-h5 font-weight-bold mb-1">Facial Sentiment Analysis</h3>
        <div class="text-body-2 text-grey">
          Emotion insights based on facial expressions
        </div>
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn variant="outlined" :disabled="isAnalyzing" @click="analyzeVideo">
          <span class="sr-only">Re-analyze Video</span>
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-chip
          :color="isAnalyzing ? 'grey' : 'primary'"
          variant="flat"
          append-icon="mdi-face-recognition"
        >
          {{ isAnalyzing ? 'Analyzing...' : 'Analysis Complete' }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="isAnalyzing" justify="center" align="center" class="my-12">
      <v-col cols="auto" class="text-center">
        <v-progress-circular indeterminate size="64" color="primary" />
        <div class="mt-3 text-body-1 font-weight-medium">
          Analyzing emotions...
        </div>
        <div class="mt-1 text-body-2 text-grey-darken-1">
          This may take 1–2 minutes
        </div>
      </v-col>
    </v-row>

    <!-- Result -->
    <!-- Result -->
    <v-row v-else>
      <!-- Summary Metrics -->
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

      <!-- Charts and Insights -->
      <v-col cols="12" md="6">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">
            Overall Emotion Profile
          </h4>
          <div class="chart-wrapper">
            <Radar :data="radarData" :options="radarOptions" height="260" />
          </div>
        </v-card>
      </v-col>

      <!-- Insights -->
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
import { Radar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
} from 'chart.js'
import axios from 'axios'
import { useStore } from 'vuex'
import UserStudyEvaluatorAnswer from '../../models/UserStudyEvaluatorAnswer'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
)

const store = useStore()
const props = defineProps({
  videoElement: { type: HTMLVideoElement, default: null },
  webcamVideoUrl: { type: String, default: null },
  testAnswer: { type: Object, default: null },
  selectedTask: { type: Number, default: 0 },
})

const isAnalyzing = ref(true)
const summaryMetrics = ref([])
const insights = ref([])
const radarData = ref({
  labels: [
    'Happy',
    'Sad',
    'Angry',
    'Surprised',
    'Neutral',
    'Disgusted',
    'Fearful',
  ],
  datasets: [
    {
      label: 'Emotion Intensity',
      data: [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(103, 58, 183, 0.2)',
      borderColor: '#673ab7',
      borderWidth: 2,
    },
  ],
})

const radarOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: { stepSize: 20 },
      grid: { color: '#E0E0E0' },
    },
  },
  plugins: {
    legend: { display: false },
  },
})

const test = computed(() => store.getters.test)

onMounted(() => {
  checkExistingResults()
})

watch(
  () => radarData.value.datasets[0].data,
  (newData) => {
    const maxValue = Math.max(...newData)
    radarOptions.value.scales.r.max = maxValue
  },
)

function checkExistingResults() {
  const existingResults =
    props.testAnswer?.tasks?.[props.selectedTask]?.facialSentimentResults
  if (existingResults) {
    updateUI(existingResults)
    isAnalyzing.value = false // Stop analyzing if results already exist
  } else {
    const videoPath = extractVideoNameFromUrl(props.webcamVideoUrl)
    if (videoPath) {
      analyzeVideo(videoPath)
    }
  }
}

function extractVideoNameFromUrl(url) {
  try {
    const path = url.split('/o/')[1].split('?')[0]
    return decodeURIComponent(path)
  } catch {
    console.warn('URL inválida:', url)
    return null
  }
}

const analyzeVideo = async (videoPath) => {
  try {
    isAnalyzing.value = true
    const res = await axios.post(
      process.env.VUE_APP_FACIAL_SENTIMENT_API_BASE_URL + '/process_video',
      {
        video_name: videoPath,
      },
    )

    const data = res.data.emotions
    updateUI(data)

    // clone the full testAnswer and insert sentiment for the selected task
    const clonedTestAnswer = JSON.parse(JSON.stringify(props.testAnswer || {}))
    clonedTestAnswer.tasks = clonedTestAnswer.tasks || []
    clonedTestAnswer.tasks[props.selectedTask] =
      clonedTestAnswer.tasks[props.selectedTask] || {}
    clonedTestAnswer.tasks[props.selectedTask].facialSentimentResults = data

    await store.dispatch('saveTestAnswer', {
      data: new UserStudyEvaluatorAnswer(clonedTestAnswer),
      answersDocId: test.value.answersDocId,
      testType: test.value.testType,
    })
    await store.dispatch('getCurrentTestAnswerDoc')
  } catch (err) {
    console.error('❌ Erro ao enviar caminho do vídeo:', err.message || err)
  } finally {
    isAnalyzing.value = false
  }
}

function updateUI(data) {
  generateInsights(data)
  const dominant = Object.entries(data).reduce((a, b) => (b[1] > a[1] ? b : a))
  summaryMetrics.value = [
    {
      label: 'Dominant Emotion',
      value: `${dominant[0]} (${dominant[1]}%)`,
      progress: dominant[1],
      color: 'amber',
      icon: 'mdi-emoticon-happy',
    },
    {
      label: 'Neutrality',
      value: `${data.Neutral}%`,
      progress: data.Neutral,
      color: 'blue-grey',
      icon: 'mdi-minus',
    },
    {
      label: 'Positivity',
      value: `${data.Happy}%`,
      progress: data.Happy,
      color: 'light-green-darken-2',
      icon: 'mdi-trending-up',
    },
    {
      label: 'Negativity',
      value: `${data.Sad}%`,
      progress: data.Sad,
      color: 'red',
      icon: 'mdi-alert',
    },
  ]

  radarData.value.datasets[0].data = [
    data.Happy,
    data.Sad,
    data.Angry,
    data.Surprised,
    data.Neutral,
    data.Disgusted,
    data.Fearful,
  ]
}

function generateInsights(data) {
  insights.value = []

  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1])
  const [main, second] = sorted

  const total = Object.values(data).reduce((a, b) => a + b, 0)
  const normalized = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, Math.round((v / total) * 100)]),
  )

  const emotionMessages = {
    Happy:
      'High happiness detected, suggesting strong positive engagement and satisfaction.',
    Sad: 'Sadness is predominant, possibly indicating emotional discomfort or empathy.',
    Angry:
      'Anger dominates the reactions, pointing to frustration or disagreement.',
    Surprised:
      'Surprise stands out, reflecting unexpected or striking moments.',
    Neutral:
      'Neutrality prevails, showing composure or lack of strong emotional reaction.',
    Disgusted:
      'Disgust detected, which may suggest negative perception or aversion.',
    Fearful:
      'Fear dominates, suggesting tension or apprehension toward the content.',
  }

  insights.value.push({
    text:
      emotionMessages[main[0]] || `Dominant emotion: ${main[0]} (${main[1]}%).`,
    color: getEmotionColor(main[0]),
    icon: getEmotionIcon(main[0]),
    type: getEmotionType(main[0]),
  })

  if (second) {
    insights.value.push({
      text: `The secondary emotion is ${second[0]} (${
        second[1]
      }%), showing a mix of reactions alongside ${main[0].toLowerCase()}.`,
      color: getEmotionColor(second[0]),
      icon: getEmotionIcon(second[0]),
      type: 'info',
    })
  }

  const positive = normalized.Happy + normalized.Surprised
  const negative =
    normalized.Sad +
    normalized.Angry +
    normalized.Disgusted +
    normalized.Fearful

  const general = []

  if (positive > negative)
    general.push({
      text: `Overall mood leans positive (${positive}% positive vs ${negative}% negative emotions).`,
      color: 'light-green-darken-2',
      icon: 'mdi-trending-up',
      type: 'success',
    })
  else if (negative > positive)
    general.push({
      text: `Negative emotions prevail (${negative}% negative vs ${positive}% positive). Possible emotional resistance or discomfort detected.`,
      color: 'red',
      icon: 'mdi-trending-down',
      type: 'error',
    })
  else
    general.push({
      text: `Balanced emotional state detected — reactions are evenly distributed.`,
      color: 'blue-grey',
      icon: 'mdi-balance-scale',
      type: 'info',
    })

  if (normalized.Neutral > 50)
    general.push({
      text: `High neutrality (${normalized.Neutral}%) suggests calm attention or low emotional activation.`,
      color: 'blue-grey-darken-1',
      icon: 'mdi-emoticon-neutral-outline',
      type: 'info',
    })

  insights.value.push(...general)

  insights.value = insights.value.slice(0, 2)
}

function getEmotionColor(emotion) {
  const colors = {
    Happy: 'light-green-darken-2',
    Sad: 'red-darken-2',
    Angry: 'red-darken-2',
    Surprised: 'amber-darken-2',
    Neutral: 'blue-grey',
    Disgusted: 'brown-darken-1',
    Fearful: 'indigo-darken-2',
  }
  return colors[emotion] || 'grey'
}

function getEmotionIcon(emotion) {
  const icons = {
    Happy: 'mdi-emoticon-happy-outline',
    Sad: 'mdi-emoticon-sad-outline',
    Angry: 'mdi-emoticon-angry-outline',
    Surprised: 'mdi-emoticon-excited-outline',
    Neutral: 'mdi-emoticon-neutral-outline',
    Disgusted: 'mdi-emoticon-sick-outline',
    Fearful: 'mdi-emoticon-frown-outline',
  }
  return icons[emotion] || 'mdi-emoticon-outline'
}

function getEmotionType(emotion) {
  const types = {
    Happy: 'success',
    Sad: 'error',
    Angry: 'error',
    Surprised: 'warning',
    Neutral: 'info',
    Disgusted: 'error',
    Fearful: 'warning',
  }
  return types[emotion] || 'info'
}
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  aspect-ratio: 1;
  max-height: 280px;
}

.sentiment-panel {
  background-color: #fafafa;
  border-left: 1px solid #eee;
}

.panel-scroll {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 16px;
}
</style>
