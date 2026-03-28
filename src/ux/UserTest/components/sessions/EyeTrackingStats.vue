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
        <h3 class="text-h5 font-weight-bold mb-1">{{ $t('EyeTrackingStats.title') }}</h3>
        <div class="text-body-2 text-grey">
          {{ $t('EyeTrackingStats.subtitle') }}
        </div>
      </v-col>
      <v-col cols="auto">
        <v-chip
          :color="isAnalyzing ? 'grey' : hasError ? 'red-darken-2' : qualityColor"
          variant="flat"
          prepend-icon="mdi-eye"
        >
          {{
            isAnalyzing
              ? $t('EyeTrackingStats.analyzing')
              : hasError
              ? $t('EyeTrackingStats.analysisFailed')
              : qualityLabel
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
          {{ $t('EyeTrackingStats.analyzingGaze') }}
        </div>
        <div class="mt-1 text-body-2 text-grey-darken-1">
          {{ $t('EyeTrackingStats.loadingSubtitle') }}
        </div>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-row v-else-if="hasError" justify="center" align="center" class="my-12">
      <v-col cols="auto" class="text-center">
        <v-icon size="64" color="red-darken-2">mdi-alert-circle-outline</v-icon>
        <div class="mt-3 text-body-1 font-weight-medium">{{ $t('EyeTrackingStats.analysisFailed') }}</div>
        <div class="mt-1 text-body-2 text-grey-darken-1">
          {{ $t('EyeTrackingStats.errorMsg') }}
        </div>
      </v-col>
    </v-row>

    <!-- Results -->
    <v-row v-else>
      <!-- Quality Summary -->
      <v-col cols="12">
        <v-card
          :class="['pa-4', 'elevation-2', 'rounded-xl', 'quality-border']"
          :style="{ borderLeft: `4px solid ${qualityColor}` }"
        >
          <v-row align="center">
            <v-col cols="auto">
              <v-icon :color="qualityColor" size="40">
                {{ qualityIcon }}
              </v-icon>
            </v-col>
            <v-col>
              <div class="text-h6 font-weight-bold">{{ $t('EyeTrackingStats.calibrationQuality') }}</div>
              <div class="text-body-2 text-grey">{{ qualityDescription }}</div>
            </v-col>
            <v-col cols="auto">
              <v-chip :color="qualityColor" variant="elevated" size="large">
                {{ qualityLabel }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Summary Metrics -->
      <v-col v-for="metric in summaryMetrics" :key="metric.label" cols="12" sm="6" md="3">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="font-weight-medium text-grey-darken-1">{{
              metric.label
            }}</span>
            <v-icon :color="metric.color">{{ metric.icon }}</v-icon>
          </div>
          <div class="text-h6 font-weight-bold">{{ metric.value }}</div>
          <div class="text-caption text-grey">{{ metric.rating }}</div>
          <v-progress-linear
            :model-value="metric.progress"
            :color="metric.color"
            height="6"
            class="mt-2"
            rounded
          />
        </v-card>
      </v-col>

      <!-- Drift Status -->
      <v-col v-if="driftStatus" cols="12" md="6">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="font-weight-medium text-grey-darken-1">{{ $t('EyeTrackingStats.driftStatus') }}</span>
            <v-icon :color="driftStatus.color">{{ driftStatus.icon }}</v-icon>
          </div>
          <div class="text-h6 font-weight-bold">{{ driftStatus.label }}</div>
          <div v-if="driftStatus.driftVector" class="text-caption text-grey">
            Offset: {{ driftStatus.driftVector.x.toFixed(1) }}, {{ driftStatus.driftVector.y.toFixed(1) }} px
          </div>
          <div class="mt-2">
            <v-chip
              v-if="driftStatus.recommendation !== 'none'"
              :color="driftStatus.recommendation === 'recalibrate' ? 'orange' : 'blue'"
              size="small"
              variant="tonal"
            >
              {{ driftStatus.recommendation }}
            </v-chip>
          </div>
        </v-card>
      </v-col>

      <!-- Filter Status -->
      <v-col v-if="filterInfo" cols="12" md="6">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="font-weight-medium text-grey-darken-1">{{ $t('EyeTrackingStats.activeFilter') }}</span>
            <v-icon color="green">mdi-filter</v-icon>
          </div>
          <div class="text-h6 font-weight-bold">{{ filterInfo.type }}</div>
          <div class="text-caption text-grey">
            {{ filterInfo.enabled ? 'Enabled' : 'Disabled' }}
          </div>
        </v-card>
      </v-col>

      <!-- Visualization -->
      <v-col cols="12" md="12">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">
            {{ $t('EyeTrackingStats.predictionOverview') }}
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
              {{ $t('EyeTrackingStats.predictionPoints') }}
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
              {{ $t('EyeTrackingStats.heatmap') }}
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
              {{ $t('EyeTrackingStats.freeEye') }}
            </v-btn>
          </v-btn-toggle>
        </v-card>
      </v-col>

      <!-- Insights -->
      <v-col cols="12" md="12">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">{{ $t('EyeTrackingStats.keyInsights') }}</h4>
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
  () => store.state.Tests?.Test?.calibrationConfig || {},
)
const selectedView = ref('precision')
const predictedData = ref(null)
const isAnalyzing = ref(true)
const hasError = ref(false)

// Accuracy metrics from advanced framework
const accuracyMetrics = ref(null)
const precisionValue = ref(null)
const accuracyValue = ref(null)
const rmsErrorValue = ref(null)
const dataLossValue = ref(null)
const driftStatus = ref(null)
const filterInfo = ref(null)

const totalPredictions = ref(0)
const insights = ref([])
const summaryMetrics = ref([])

// Quality computation
const qualityLabel = computed(() => {
  if (accuracyMetrics.value) {
    const ratings = {
      good: 'Good Quality',
      acceptable: 'Acceptable',
      poor: 'Poor Quality'
    }
    return ratings[accuracyMetrics.value.overall] || 'Unknown'
  }
  return 'Analysis Complete'
})

const qualityColor = computed(() => {
  if (accuracyMetrics.value) {
    const colors = {
      good: 'green',
      acceptable: 'orange',
      poor: 'red'
    }
    return colors[accuracyMetrics.value.overall] || 'grey'
  }
  return 'primary'
})

const qualityIcon = computed(() => {
  if (accuracyMetrics.value) {
    const icons = {
      good: 'mdi-check-circle',
      acceptable: 'mdi-alert-circle',
      poor: 'mdi-close-circle'
    }
    return icons[accuracyMetrics.value.overall] || 'mdi-help-circle'
  }
  return 'mdi-eye'
})

const qualityDescription = computed(() => {
  if (!accuracyMetrics.value) return $t('EyeTrackingStats.noCalibrationData')
  const m = accuracyMetrics.value
  return `Precision: ${m.precision?.value?.toFixed(2) || 'N/A'}° | Accuracy: ${m.accuracy?.value?.toFixed(2) || 'N/A'}°`
})

watch(selectedView, (value) => emit('view-changed', value))

onMounted(async () => {
  try {
    // Skip redundant metrics calculation during session analytics to avoid misleading accuracy data
    // as targets are unknown during the test session. Rely on calibration results instead.
    
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
        console.error('Failed to parse JSON response:', parseErr)
        hasError.value = true
        isAnalyzing.value = false
        return
      }
    }

    predictedData.value = data

    processAnalytics(predictedData.value)
    emit('predictions-ready', predictedData.value)
  } catch (err) {
    console.error('Eye tracking error:', err)
    predictedData.value = null
    hasError.value = true
  } finally {
    isAnalyzing.value = false
  }
})

function processAnalytics(data) {
  const predictions = Array.isArray(data) ? data : []

  if (predictions.length === 0) {
    console.warn('No predictions data available')
    hasError.value = true
    return
  }

  totalPredictions.value = predictions.length

  // Build summary metrics
  summaryMetrics.value = [
    {
      label: 'Total Predictions',
      value: totalPredictions.value,
      progress: Math.min(totalPredictions.value / 3, 100),
      color: 'indigo-darken-2',
      icon: 'mdi-eye-outline',
      rating: ''
    },
    {
      label: 'Precision',
      value: accuracyMetrics.value?.precision?.value
        ? `${accuracyMetrics.value.precision.value.toFixed(2)}°`
        : 'N/A',
      progress: accuracyMetrics.value?.precision?.value
        ? Math.max(0, 100 - accuracyMetrics.value.precision.value * 50)
        : 50,
      color: getMetricColor(accuracyMetrics.value?.precision?.rating),
      icon: 'mdi-crosshairs-gps',
      rating: accuracyMetrics.value?.precision?.rating || ''
    },
    {
      label: 'Accuracy',
      value: accuracyMetrics.value?.accuracy?.value
        ? `${accuracyMetrics.value.accuracy.value.toFixed(2)}°`
        : 'N/A',
      progress: accuracyMetrics.value?.accuracy?.value
        ? Math.max(0, 100 - accuracyMetrics.value.accuracy.value * 30)
        : 50,
      color: getMetricColor(accuracyMetrics.value?.accuracy?.rating),
      icon: 'mdi-target',
      rating: accuracyMetrics.value?.accuracy?.rating || ''
    },
    {
      label: 'RMS Error',
      value: accuracyMetrics.value?.rmsError?.value
        ? `${accuracyMetrics.value.rmsError.value.toFixed(1)}px`
        : 'N/A',
      progress: accuracyMetrics.value?.rmsError?.value
        ? Math.max(0, 100 - accuracyMetrics.value.rmsError.value)
        : 50,
      color: getMetricColor(accuracyMetrics.value?.rmsError?.rating),
      icon: 'mdi-chart-line',
      rating: accuracyMetrics.value?.rmsError?.rating || ''
    }
  ]

  // Build insights
  buildInsights()
}

function buildInsights() {
  insights.value = []

  if (!accuracyMetrics.value) return

  const m = accuracyMetrics.value

  if (m.precision?.rating === 'poor') {
    insights.value.push({
      type: 'error',
      color: 'red',
      icon: 'mdi-alert',
      text: 'Gaze precision is poor. Consider improving lighting or stabilizing head position.'
    })
  } else if (m.precision?.rating === 'good') {
    insights.value.push({
      type: 'success',
      color: 'green',
      icon: 'mdi-check',
      text: 'Excellent gaze stability during the session.'
    })
  }

  if (m.accuracy?.rating === 'poor') {
    insights.value.push({
      type: 'error',
      color: 'red',
      icon: 'mdi-alert',
      text: 'Gaze accuracy is low. Recalibration may improve results.'
    })
  } else if (m.accuracy?.rating === 'good') {
    insights.value.push({
      type: 'success',
      color: 'green',
      icon: 'mdi-check',
      text: 'Gaze tracking closely matches intended targets.'
    })
  }

  if (m.dataLoss?.value > 15) {
    insights.value.push({
      type: 'warning',
      color: 'orange',
      icon: 'mdi-alert-circle',
      text: `High data loss (${m.dataLoss.value.toFixed(1)}%). Check camera visibility.`
    })
  }

  if (insights.value.length === 0) {
    insights.value.push({
      type: 'info',
      color: 'blue',
      icon: 'mdi-information',
      text: 'Calibration quality is acceptable for research use.'
    })
  }
}

function getMetricColor(rating) {
  const colors = {
    good: 'green',
    acceptable: 'orange',
    poor: 'red'
  }
  return colors[rating] || 'grey'
}
</script>
