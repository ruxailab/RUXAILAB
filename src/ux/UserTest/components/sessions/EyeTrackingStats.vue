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
        <h3 class="text-h5 font-weight-bold mb-1">Eye Tracking Analytics</h3>
        <div class="text-body-2 text-grey">
          Gaze precision and prediction insights
        </div>
      </v-col>
      <v-col cols="auto">
        <v-chip
          :color="isAnalyzing ? 'grey' : hasError ? 'red-darken-2' : 'primary'"
          variant="flat"
          prepend-icon="mdi-eye"
        >
          {{
            isAnalyzing
              ? 'Analyzing...'
              : hasError
              ? 'Analysis Failed'
              : 'Analysis Completed'
          }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row
      v-if="isAnalyzing && !hasError"
      justify="center"
      align="center"
      class="my-12"
    >
      <v-col cols="auto" class="text-center">
        <v-progress-circular indeterminate size="64" color="primary" />
        <div class="mt-3 text-body-1 font-weight-medium">
          Analyzing gaze data...
        </div>
        <div class="mt-1 text-body-2 text-grey-darken-1">
          This may take a few seconds
        </div>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-row v-else-if="hasError" justify="center" align="center" class="my-12">
      <v-col cols="auto" class="text-center">
        <v-icon size="64" color="red-darken-2">mdi-alert-circle-outline</v-icon>
        <div class="mt-3 text-body-1 font-weight-medium">Analysis failed</div>
        <div class="mt-1 text-body-2 text-grey-darken-1">
          Could not process gaze data. Please try again later.
        </div>
      </v-col>
    </v-row>

    <!-- Results -->
    <v-row v-else>
      <!-- Summary Metrics -->
      <v-col v-for="metric in summaryMetrics" :key="metric.label" cols="12">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="font-weight-medium text-grey-darken-1">{{
              metric.label
            }}</span>
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

      <!-- Visualization -->
      <v-col cols="12" md="12">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">
            Prediction Overview
          </h4>

          <v-btn-toggle
            v-model="selectedView"
            class="mb-2 d-flex justify-space-between"
            divided
            mandatory
          >
            <v-btn
              value="precision"
              variant="outlined"
              :color="
                selectedView === 'precision'
                  ? 'blue-darken-2'
                  : 'blue-lighten-3'
              "
              class="px-8 py-3 rounded-lg font-weight-medium"
            >
              <v-icon
                start
                :color="
                  selectedView === 'precision'
                    ? 'blue-darken-2'
                    : 'blue-lighten-3'
                "
              >
                mdi-crosshairs-gps
              </v-icon>
              Prediction Points
            </v-btn>

            <v-btn
              value="heatmap"
              variant="outlined"
              :color="
                selectedView === 'heatmap'
                  ? 'orange-darken-2'
                  : 'orange-lighten-3'
              "
              class="px-8 py-3 rounded-lg font-weight-medium"
            >
              <v-icon
                start
                :color="
                  selectedView === 'heatmap'
                    ? 'orange-darken-2'
                    : 'orange-lighten-3'
                "
              >
                mdi-fire
              </v-icon>
              Heatmap
            </v-btn>

            <v-btn
              value="free"
              variant="outlined"
              :color="
                selectedView === 'free' ? 'red-darken-2' : 'red-lighten-3'
              "
              class="px-8 py-3 rounded-lg font-weight-medium"
            >
              <v-icon
                start
                :color="
                  selectedView === 'free' ? 'red-darken-2' : 'red-lighten-3'
                "
              >
                mdi-eye
              </v-icon>
              Free Eye
            </v-btn>
          </v-btn-toggle>
        </v-card>
      </v-col>

      <!-- Insights -->
      <v-col cols="12" md="12">
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
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'

const props = defineProps({
  irisData: { type: Array, required: true },
  userId: { type: String, required: true },
})

const emit = defineEmits(['predictions-ready', 'view-changed'])
const store = useStore()

const calibrationConfig = computed(
  () => store.state.Tests.Test.calibrationConfig || {},
)
const selectedView = ref('precision')
const predictedData = ref(null)
const isAnalyzing = ref(true)
const hasError = ref(false)

const insights = ref([])
const summaryMetrics = ref([])

watch(selectedView, (value) => emit('view-changed', value))

onMounted(async () => {
  try {
    console.log(calibrationConfig)

    const res = await axios.post(
      process.env.VUE_APP_EYE_LAB_BACKEND_URL + '/api/session/batch_predict',
      {
        k: calibrationConfig.value.pointNumber,
        screen_height: 1080,
        screen_width: 1920,
        iris_tracking_data: props.irisData,
        calib_id: props.userId,
      },
      { headers: { 'Content-Type': 'application/json' } },
    )

    let data = res.data

    // FIX 1: Handle string responses by parsing JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (parseErr) {
        console.error('❌ Failed to parse JSON response:', parseErr)
        hasError.value = true
        isAnalyzing.value = false
        return
      }
    }

    predictedData.value = data

    processAnalytics(predictedData.value)
    emit('predictions-ready', predictedData.value)
  } catch (err) {
    console.error('❌ Eye tracking error:', err)
    predictedData.value = null
    hasError.value = true
  } finally {
    isAnalyzing.value = false
  }
})

function detectFixations(predictions) {
  const SPATIAL_THRESHOLD = 50
  const MIN_DURATION = 200
  const SCREEN_W = predictions[0]?.screen_width || 1920
  const SCREEN_H = predictions[0]?.screen_height || 1080

  if (!predictions.length) return []

  const fixations = []
  let cluster = [predictions[0]]

  for (let k = 1; k < predictions.length; k++) {
    const p = predictions[k]
    const cx = cluster.reduce((s, q) => s + q.predicted_x, 0) / cluster.length
    const cy = cluster.reduce((s, q) => s + q.predicted_y, 0) / cluster.length
    const dx = p.predicted_x - cx
    const dy = p.predicted_y - cy

    if (Math.sqrt(dx * dx + dy * dy) <= SPATIAL_THRESHOLD) {
      cluster.push(p)
    } else {
      const duration =
        cluster[cluster.length - 1].timestamp - cluster[0].timestamp
      if (duration >= MIN_DURATION && cluster.length >= 3) {
        fixations.push({
          x: cx / SCREEN_W,
          y: cy / SCREEN_H,
          duration,
          pointCount: cluster.length,
        })
      }
      cluster = [p]
    }
  }

  // Finalize last cluster
  if (cluster.length >= 3) {
    const duration =
      cluster[cluster.length - 1].timestamp - cluster[0].timestamp
    if (duration >= MIN_DURATION) {
      const cx = cluster.reduce((s, q) => s + q.predicted_x, 0) / cluster.length
      const cy = cluster.reduce((s, q) => s + q.predicted_y, 0) / cluster.length
      fixations.push({
        x: cx / SCREEN_W,
        y: cy / SCREEN_H,
        duration,
        pointCount: cluster.length,
      })
    }
  }

  return fixations
}

function processAnalytics(data) {
  const predictions = Array.isArray(data) ? data : []

  if (predictions.length === 0) {
    console.warn('No predictions data available')
    hasError.value = true
    return
  }

  const total = predictions.length

  const fixations = detectFixations(predictions)
  const fixationCount = fixations.length
  const avgFixationDuration =
    fixationCount > 0
      ? Math.round(
          fixations.reduce((s, f) => s + f.duration, 0) / fixationCount,
        )
      : 0

  const GRID = 10
  const visitedCells = new Set()
  predictions.forEach((p) => {
    const col = Math.min(
      Math.floor((p.predicted_x / (p.screen_width || 1920)) * GRID),
      GRID - 1,
    )
    const row = Math.min(
      Math.floor((p.predicted_y / (p.screen_height || 1080)) * GRID),
      GRID - 1,
    )
    visitedCells.add(`${col},${row}`)
  })
  const coveragePct = Math.round((visitedCells.size / (GRID * GRID)) * 100)

  summaryMetrics.value = [
    {
      label: 'Total Predictions',
      value: total,
      progress: Math.min((total / 500) * 100, 100),
      color: 'indigo-darken-2',
      icon: 'mdi-eye-outline',
    },
    {
      label: 'Fixation Count',
      value: fixationCount,
      progress: Math.min((fixationCount / 30) * 100, 100),
      color: 'teal-darken-2',
      icon: 'mdi-eye-circle-outline',
    },
    {
      label: 'Avg Fixation Duration',
      value: `${avgFixationDuration} ms`,
      progress: Math.min((avgFixationDuration / 800) * 100, 100),
      color: 'deep-purple-darken-2',
      icon: 'mdi-timer-outline',
    },
    {
      label: 'Screen Coverage',
      value: `${coveragePct}%`,
      progress: coveragePct,
      color: 'green-darken-2',
      icon: 'mdi-grid',
    },
  ]

  const insightList = []

  if (fixationCount > 20) {
    insightList.push({
      type: 'success',
      color: 'green',
      icon: 'mdi-check-circle',
      text: `High engagement detected: ${fixationCount} fixations recorded.`,
    })
  } else if (fixationCount > 8) {
    insightList.push({
      type: 'info',
      color: 'blue',
      icon: 'mdi-information',
      text: `Moderate gaze stability: ${fixationCount} fixations detected.`,
    })
  } else {
    insightList.push({
      type: 'warning',
      color: 'orange',
      icon: 'mdi-alert',
      text: `Few fixations detected (${fixationCount}). User may have been scanning rapidly.`,
    })
  }

  if (avgFixationDuration > 400) {
    insightList.push({
      type: 'info',
      color: 'deep-purple',
      icon: 'mdi-timer-sand',
      text: `Long average fixation duration (${avgFixationDuration} ms): user focused on specific areas.`,
    })
  }

  if (coveragePct > 60) {
    insightList.push({
      type: 'success',
      color: 'teal',
      icon: 'mdi-view-grid',
      text: `Good screen coverage (${coveragePct}%): gaze explored most of the viewport.`,
    })
  } else if (coveragePct < 30) {
    insightList.push({
      type: 'warning',
      color: 'orange',
      icon: 'mdi-view-grid-outline',
      text: `Limited screen coverage (${coveragePct}%): gaze was concentrated in a narrow region.`,
    })
  }

  insights.value = insightList
}
</script>
