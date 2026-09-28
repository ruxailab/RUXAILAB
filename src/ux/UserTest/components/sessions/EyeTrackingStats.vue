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
        <h3 class="text-h5 font-weight-bold mb-1">
          {{ $t('eyeTracking.stats.eyeTrackingAnalytics') }}
        </h3>

        <div class="text-body-2 text-grey">
          {{ $t('eyeTracking.stats.gazePrecisionAndPredictionInsights') }}
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
              ? $t('eyeTracking.stats.analyzing')
              : hasError
                ? $t('eyeTracking.stats.analysisFailed')
                : $t('eyeTracking.stats.analysisCompleted')
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
          {{ $t('eyeTracking.stats.analyzingGazeData') }}
        </div>

        <div class="mt-1 text-body-2 text-grey-darken-1">
          {{ $t('eyeTracking.stats.analysisMayTakeSeconds') }}
        </div>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-row v-else-if="hasError" justify="center" align="center" class="my-12">
      <v-col cols="auto" class="text-center">
        <v-icon size="64" color="red-darken-2">
          mdi-alert-circle-outline
        </v-icon>

        <div class="mt-3 text-body-1 font-weight-medium">
          {{ $t('eyeTracking.stats.analysisFailed') }}
        </div>

        <div class="mt-1 text-body-2 text-grey-darken-1">
          {{ $t('eyeTracking.stats.couldNotProcessGazeData') }}
        </div>
      </v-col>
    </v-row>

    <!-- Results -->
    <v-row v-else>
      <!-- Visualization -->
      <v-col cols="12">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">
            {{ $t('eyeTracking.stats.predictionOverview') }}
          </h4>

          <v-btn-toggle
            v-model="selectedView"
            class="prediction-view-toggle"
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
              class="prediction-view-btn rounded-lg font-weight-medium"
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

              {{ $t('eyeTracking.stats.predictionPoints') }}
            </v-btn>

            <v-btn
              value="heatmap"
              variant="outlined"
              :color="
                selectedView === 'heatmap'
                  ? 'orange-darken-2'
                  : 'orange-lighten-3'
              "
              class="prediction-view-btn rounded-lg font-weight-medium"
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

              {{ $t('eyeTracking.stats.heatmap') }}
            </v-btn>

            <v-btn
              value="free"
              variant="outlined"
              :color="
                selectedView === 'free' ? 'red-darken-2' : 'red-lighten-3'
              "
              class="prediction-view-btn rounded-lg font-weight-medium"
            >
              <v-icon
                start
                :color="
                  selectedView === 'free' ? 'red-darken-2' : 'red-lighten-3'
                "
              >
                mdi-eye
              </v-icon>

              {{ $t('eyeTracking.stats.freeEye') }}
            </v-btn>
          </v-btn-toggle>
        </v-card>
      </v-col>

      <!-- Insights -->
      <v-col cols="12">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">
            {{ $t('eyeTracking.stats.keyInsights') }}
          </h4>

          <v-row>
            <v-col v-for="(insight, index) in insights" :key="index" cols="12">
              <v-alert
                :type="insight.type"
                variant="tonal"
                class="rounded-xl"
                border="start"
                :border-color="insight.color"
              >
                <v-icon class="mr-2" :color="insight.color">
                  {{ insight.icon }}
                </v-icon>

                <span class="font-weight-medium">
                  {{ insight.text }}
                </span>
              </v-alert>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Calibration Metrics -->
      <v-col
        v-for="metric in calibrationMetrics"
        :key="metric.label"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="pa-4 h-100" elevation="2" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="font-weight-medium text-grey-darken-1">
              {{ metric.label }}
            </span>

            <v-icon :color="metric.color">
              {{ metric.icon }}
            </v-icon>
          </div>

          <div class="text-h6 font-weight-bold">
            {{ metric.value }}
          </div>

          <div
            v-if="metric.description"
            class="text-caption text-grey-darken-1 mt-1"
          >
            {{ metric.description }}
          </div>

          <v-progress-linear
            v-if="metric.progress !== null"
            :model-value="metric.progress"
            :color="metric.color"
            height="6"
            class="mt-3"
            rounded
          />
        </v-card>
      </v-col>

      <!-- Session Metrics -->
      <v-col
        v-for="metric in sessionMetrics"
        :key="metric.label"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="pa-4 h-100" elevation="2" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="font-weight-medium text-grey-darken-1">
              {{ metric.label }}
            </span>

            <v-icon :color="metric.color">
              {{ metric.icon }}
            </v-icon>
          </div>

          <div class="text-h6 font-weight-bold">
            {{ metric.value }}
          </div>

          <div
            v-if="metric.description"
            class="text-caption text-grey-darken-1 mt-1"
          >
            {{ metric.description }}
          </div>

          <v-progress-linear
            v-if="metric.progress !== null"
            :model-value="metric.progress"
            :color="metric.color"
            height="6"
            class="mt-3"
            rounded
          />
        </v-card>
      </v-col>

      <!-- Session Statistics -->
      <v-col cols="12">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h4 class="text-subtitle-1 font-weight-medium">
                {{ $t('eyeTracking.stats.sessionStatistics') }}
              </h4>

              <div class="text-caption text-grey-darken-1">
                {{ $t('eyeTracking.stats.predictedGazeDataOverview') }}
              </div>
            </div>

            <v-icon color="primary"> mdi-chart-line </v-icon>
          </div>

          <v-row>
            <v-col cols="12" sm="6" md="3">
              <div class="text-body-2 text-grey-darken-1">
                {{ $t('eyeTracking.stats.averageGaze') }}
              </div>

              <div class="text-subtitle-1 font-weight-bold mt-1">
                {{ sessionStats.averageGaze }}
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-body-2 text-grey-darken-1">
                {{ $t('eyeTracking.stats.horizontalRange') }}
              </div>

              <div class="text-subtitle-1 font-weight-bold mt-1">
                {{ sessionStats.horizontalRange }}
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-body-2 text-grey-darken-1">
                {{ $t('eyeTracking.stats.verticalRange') }}
              </div>

              <div class="text-subtitle-1 font-weight-bold mt-1">
                {{ sessionStats.verticalRange }}
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="text-body-2 text-grey-darken-1">
                {{ $t('eyeTracking.stats.predictionRate') }}
              </div>

              <div class="text-subtitle-1 font-weight-bold mt-1">
                {{ sessionStats.predictionRate }}
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Calibration Details -->
      <v-col v-if="calibrationPoints.length" cols="12">
        <v-card class="pa-4" elevation="2" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h4 class="text-subtitle-1 font-weight-medium">
                {{ $t('eyeTracking.stats.calibrationPoints') }}
              </h4>

              <div class="text-caption text-grey-darken-1">
                {{ $t('eyeTracking.stats.calibrationTargetError') }}
              </div>
            </div>

            <v-icon color="primary"> mdi-crosshairs-gps </v-icon>
          </div>

          <v-row>
            <v-col
              v-for="(point, index) in calibrationPoints"
              :key="`${point.target_x}-${point.target_y}`"
              cols="12"
              sm="6"
              md="4"
              lg="2"
            >
              <v-card variant="outlined" class="pa-3 h-100" rounded="lg">
                <div class="text-caption text-grey-darken-1">
                  {{
                    $t('eyeTracking.stats.point', {
                      number: index + 1,
                    })
                  }}
                </div>

                <div class="text-body-2 font-weight-medium mt-1">
                  {{ averageGazeTarget(point.target_x, point.target_y) }}
                </div>

                <v-divider class="my-2" />

                <div class="text-caption text-grey-darken-1">
                  {{ $t('eyeTracking.stats.meanError') }}
                </div>

                <div class="text-subtitle-1 font-weight-bold">
                  {{ formatPixels(point.mean_error_px) }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import EyeTrackerController from '@/ux/UserTest/controllers/EyeTrackerController.js'

const props = defineProps({
  irisData: {
    type: Array,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['predictions-ready', 'view-changed'])

const store = useStore()
const study = computed(() => store.state.Tests.Test)

const selectedView = ref('precision')
const predictedData = ref(null)
const isAnalyzing = ref(true)
const hasError = ref(false)

const totalPredictions = ref(0)
const insights = ref([])
const calibrationMetrics = ref([])
const sessionMetrics = ref([])
const calibrationPoints = ref([])

const sessionStats = ref({
  averageGaze: '--',
  horizontalRange: '--',
  verticalRange: '--',
  predictionRate: '--',
})

watch(selectedView, (value) => emit('view-changed', value))

onMounted(async () => {
  try {
    const data = await new EyeTrackerController().getLastCalibAndPredict(
      props.userId,
      study.value.id,
      props.irisData,
    )

    predictedData.value = data

    processAnalytics(predictedData.value)

    emit('predictions-ready', predictedData.value.predictions)
  } catch {
    predictedData.value = null
    hasError.value = true
  } finally {
    isAnalyzing.value = false
  }
})

function averageGazeTarget(x, y) {
  return `${Math.round(x)} x ${Math.round(y)}`
}

function processAnalytics(data) {
  const predictions = Array.isArray(data?.predictions) ? data.predictions : []

  const calibration = data?.metrics?.calibration || {}

  if (predictions.length === 0) {
    hasError.value = true
    return
  }

  totalPredictions.value = predictions.length

  processCalibrationMetrics(calibration)
  processSessionMetrics(predictions)
  generateInsights({
    calibration,
    predictions,
  })
}

function processCalibrationMetrics(calibration) {
  const meanError = Number(calibration.mean_error_px)
  const medianError = Number(calibration.median_error_px)
  const rmse = Number(calibration.rmse_px)
  const horizontalMae = Number(calibration.horizontal_mae_px)
  const verticalMae = Number(calibration.vertical_mae_px)

  const quality = calibration.quality || 'Unknown'

  calibrationPoints.value = Array.isArray(calibration.points_detail)
    ? calibration.points_detail
    : []

  calibrationMetrics.value = [
    {
      label: 'Mean Error',
      value: formatPixels(meanError),
      progress: calculateErrorProgress(meanError),
      color: getErrorColor(meanError),
      icon: 'mdi-target',
      description: 'Average distance from the target point',
    },
    {
      label: 'Calibration Quality',
      value: quality,
      progress: getQualityProgress(quality),
      color: getQualityColor(quality),
      icon: 'mdi-check-decagram',
      description: 'Overall calibration performance',
    },
    {
      label: 'Median Error',
      value: formatPixels(medianError),
      progress: null,
      color: 'blue-darken-2',
      icon: 'mdi-chart-bell-curve',
      description: 'Median distance from the target',
    },
    {
      label: 'RMSE',
      value: formatPixels(rmse),
      progress: null,
      color: 'deep-purple-darken-2',
      icon: 'mdi-chart-line',
      description: 'Penalizes larger prediction errors',
    },
    {
      label: 'Horizontal Error',
      value: formatPixels(horizontalMae),
      progress: null,
      color: 'teal-darken-2',
      icon: 'mdi-arrow-left-right',
      description: 'Mean absolute error on the X axis',
    },
    {
      label: 'Vertical Error',
      value: formatPixels(verticalMae),
      progress: null,
      color: 'cyan-darken-2',
      icon: 'mdi-arrow-up-down',
      description: 'Mean absolute error on the Y axis',
    },
  ]
}

function processSessionMetrics(predictions) {
  const validPredictions = predictions.filter(
    (item) =>
      Number.isFinite(Number(item.predicted_x)) &&
      Number.isFinite(Number(item.predicted_y)),
  )

  const validCount = validPredictions.length

  const xs = validPredictions.map((item) => Number(item.predicted_x))

  const ys = validPredictions.map((item) => Number(item.predicted_y))

  const screenWidth = Number(
    validPredictions.find((item) => Number(item.screen_width))?.screen_width,
  )

  const screenHeight = Number(
    validPredictions.find((item) => Number(item.screen_height))?.screen_height,
  )

  const averageX = calculateMean(xs)
  const averageY = calculateMean(ys)

  const minX = xs.length ? Math.min(...xs) : 0
  const maxX = xs.length ? Math.max(...xs) : 0

  const minY = ys.length ? Math.min(...ys) : 0
  const maxY = ys.length ? Math.max(...ys) : 0

  const horizontalRange = maxX - minX
  const verticalRange = maxY - minY

  const dispersion = calculateDispersion(xs, ys, averageX, averageY)

  const predictionRate = calculatePredictionRate(predictions)

  sessionStats.value = {
    averageGaze:
      Number.isFinite(averageX) && Number.isFinite(averageY)
        ? `${Math.round(averageX)} × ${Math.round(averageY)} px`
        : '--',

    horizontalRange: Number.isFinite(horizontalRange)
      ? `${Math.round(horizontalRange)} px`
      : '--',

    verticalRange: Number.isFinite(verticalRange)
      ? `${Math.round(verticalRange)} px`
      : '--',

    predictionRate: predictionRate ? `${predictionRate.toFixed(1)} Hz` : '--',
  }

  const validPercentage = calculatePercentage(validCount, predictions.length)

  sessionMetrics.value = [
    {
      label: 'Total Predictions',
      value: predictions.length,
      progress: null,
      color: 'indigo-darken-2',
      icon: 'mdi-eye-outline',
      description: 'Predicted gaze samples',
    },
    {
      label: 'Valid Predictions',
      value: `${validCount} (${validPercentage}%)`,
      progress: validPercentage,
      color: 'green-darken-2',
      icon: 'mdi-check-circle-outline',
      description: 'Predictions with valid coordinates',
    },
    {
      label: 'Gaze Dispersion',
      value: Number.isFinite(dispersion)
        ? `${Math.round(dispersion)} px`
        : '--',
      progress: calculateDispersionProgress(
        dispersion,
        screenWidth,
        screenHeight,
      ),
      color: getDispersionColor(dispersion, screenWidth, screenHeight),
      icon: 'mdi-bullseye-arrow',
      description: 'Average distance from the mean gaze position',
    },
    {
      label: 'Screen Coverage',
      value: calculateScreenCoverage(
        horizontalRange,
        verticalRange,
        screenWidth,
        screenHeight,
      ),
      progress: null,
      color: 'deep-purple-darken-2',
      icon: 'mdi-monitor-screenshot',
      description: 'Approximate area explored by gaze',
    },
  ]
}

function calculateMean(values) {
  if (!values.length) {
    return NaN
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function calculatePercentage(value, total) {
  if (!total) {
    return 0
  }

  return Number(((value / total) * 100).toFixed(1))
}

function calculateDispersion(xs, ys, meanX, meanY) {
  if (!xs.length || !ys.length) {
    return NaN
  }

  const distances = xs.map((x, index) => {
    const y = ys[index]

    return Math.sqrt(Math.pow(x - meanX, 2) + Math.pow(y - meanY, 2))
  })

  return calculateMean(distances)
}

function calculatePredictionRate(predictions) {
  const timestamps = predictions
    .map((item) => Number(item.timestamp))
    .filter((timestamp) => Number.isFinite(timestamp))

  if (timestamps.length < 2) {
    return null
  }

  const firstTimestamp = Math.min(...timestamps)
  const lastTimestamp = Math.max(...timestamps)

  const durationSeconds = (lastTimestamp - firstTimestamp) / 1000

  if (durationSeconds <= 0) {
    return null
  }

  return predictions.length / durationSeconds
}

function calculateScreenCoverage(
  horizontalRange,
  verticalRange,
  screenWidth,
  screenHeight,
) {
  if (
    !Number.isFinite(horizontalRange) ||
    !Number.isFinite(verticalRange) ||
    !screenWidth ||
    !screenHeight
  ) {
    return '--'
  }

  const coverage =
    (horizontalRange / screenWidth) * (verticalRange / screenHeight) * 100

  return `${Math.min(100, Math.max(0, coverage)).toFixed(1)}%`
}

function calculateDispersionProgress(dispersion, screenWidth, screenHeight) {
  if (!Number.isFinite(dispersion) || !screenWidth || !screenHeight) {
    return 0
  }

  const diagonal = Math.sqrt(
    Math.pow(screenWidth, 2) + Math.pow(screenHeight, 2),
  )

  if (!diagonal) {
    return 0
  }

  return Math.min(100, (dispersion / diagonal) * 100)
}

function getDispersionColor(dispersion, screenWidth, screenHeight) {
  if (!Number.isFinite(dispersion) || !screenWidth || !screenHeight) {
    return 'grey'
  }

  const diagonal = Math.sqrt(
    Math.pow(screenWidth, 2) + Math.pow(screenHeight, 2),
  )

  const ratio = dispersion / diagonal

  if (ratio < 0.05) {
    return 'green-darken-2'
  }

  if (ratio < 0.12) {
    return 'orange-darken-2'
  }

  return 'red-darken-2'
}

function calculateErrorProgress(error) {
  if (!Number.isFinite(error)) {
    return null
  }

  return Math.max(0, Math.min(100, 100 - (error / 200) * 100))
}

function getErrorColor(error) {
  if (!Number.isFinite(error)) {
    return 'grey'
  }

  if (error <= 40) {
    return 'green-darken-2'
  }

  if (error <= 75) {
    return 'orange-darken-2'
  }

  return 'red-darken-2'
}

function getQualityColor(quality) {
  switch (quality) {
    case 'Excellent':
      return 'green-darken-2'

    case 'Good':
      return 'light-green-darken-2'

    case 'Fair':
      return 'orange-darken-2'

    case 'Poor':
      return 'red-darken-2'

    default:
      return 'grey'
  }
}

function getQualityProgress(quality) {
  switch (quality) {
    case 'Excellent':
      return 100

    case 'Good':
      return 80

    case 'Fair':
      return 55

    case 'Poor':
      return 25

    default:
      return 0
  }
}

function formatPixels(value) {
  if (!Number.isFinite(Number(value))) {
    return '--'
  }

  return `${Number(value).toFixed(1)} px`
}

function generateInsights({ calibration, predictions }) {
  const generatedInsights = []

  const quality = calibration.quality
  const meanError = Number(calibration.mean_error_px)
  const medianError = Number(calibration.median_error_px)
  const rmse = Number(calibration.rmse_px)

  if (quality === 'Excellent') {
    generatedInsights.push({
      type: 'success',
      color: 'green-darken-2',
      icon: 'mdi-check-circle',
      text: `Excellent calibration quality — the average gaze error was ${formatPixels(meanError)}.`,
    })
  } else if (quality === 'Good') {
    generatedInsights.push({
      type: 'success',
      color: 'green-darken-2',
      icon: 'mdi-check-circle',
      text: `Good calibration quality — the average gaze error was ${formatPixels(meanError)}.`,
    })
  } else if (quality === 'Fair') {
    generatedInsights.push({
      type: 'warning',
      color: 'orange-darken-2',
      icon: 'mdi-alert-circle',
      text: `Fair calibration quality — the average gaze error was ${formatPixels(meanError)}.`,
    })
  } else if (quality === 'Poor') {
    generatedInsights.push({
      type: 'error',
      color: 'red-darken-2',
      icon: 'mdi-alert-circle-outline',
      text: `Calibration quality may need improvement — the average gaze error was ${formatPixels(meanError)}.`,
    })
  }

  if (Number.isFinite(medianError) && Number.isFinite(meanError)) {
    generatedInsights.push({
      type: 'info',
      color: 'blue-darken-2',
      icon: 'mdi-chart-bell-curve',
      text: `The median calibration error was ${formatPixels(medianError)}, compared with a mean error of ${formatPixels(meanError)}.`,
    })
  }

  if (Number.isFinite(rmse) && Number.isFinite(meanError) && rmse > meanError) {
    generatedInsights.push({
      type: 'info',
      color: 'deep-purple-darken-2',
      icon: 'mdi-chart-line',
      text: `The RMSE was ${formatPixels(rmse)}, indicating that some calibration predictions had larger errors than the average.`,
    })
  }

  if (predictions.length > 0) {
    generatedInsights.push({
      type: 'info',
      color: 'indigo-darken-2',
      icon: 'mdi-eye-outline',
      text: `The session contains ${predictions.length.toLocaleString()} predicted gaze samples.`,
    })
  }

  insights.value = generatedInsights
}
</script>

<style scoped>
.prediction-view-toggle {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 8px;
}

.prediction-view-btn {
  flex: 1 1 180px;
  min-width: 0;
}

@media (max-width: 600px) {
  .prediction-view-btn {
    flex: 1 1 100%;
  }
}
</style>
