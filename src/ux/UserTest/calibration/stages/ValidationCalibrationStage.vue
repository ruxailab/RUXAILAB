<template>
  <div class="validation-calibration-stage">
    <!-- Instructions -->
    <div v-if="!isValidating && !isComplete" class="instructions">
      <h3>{{ $t('eyeTracking.calibration.validation.title') || 'Validation' }}</h3>
      <p>{{ $t('eyeTracking.calibration.validation.instructions') || 'Look at each point. Your accuracy will be measured.' }}</p>
      <v-btn color="primary" @click="startValidation">
        {{ $t('eyeTracking.calibration.startValidation') || 'Start Validation' }}
      </v-btn>
    </div>

    <!-- Validation canvas -->
    <div v-show="isValidating" class="validation-canvas-container">
      <canvas ref="canvasRef" class="validation-canvas" />
    </div>

    <!-- Results -->
    <div v-if="isComplete" class="validation-results">
      <div class="result-header">
        <v-icon v-if="isValid" color="success" size="48">mdi-check-circle</v-icon>
        <v-icon v-else color="error" size="48">mdi-close-circle</v-icon>
        <h3>{{ isValid ? 'Validation Passed' : 'Validation Failed' }}</h3>
      </div>

      <div v-if="metrics" class="metrics-grid">
        <div class="metric-card" :class="metrics.precision.rating">
          <div class="metric-label">Precision</div>
          <div class="metric-value">{{ formatDegrees(metrics.precision.value) }}</div>
          <div class="metric-rating">{{ metrics.precision.rating }}</div>
        </div>

        <div class="metric-card" :class="metrics.accuracy.rating">
          <div class="metric-label">Accuracy</div>
          <div class="metric-value">{{ formatDegrees(metrics.accuracy.value) }}</div>
          <div class="metric-rating">{{ metrics.accuracy.rating }}</div>
        </div>

        <div class="metric-card" :class="metrics.rmsError.rating">
          <div class="metric-label">RMS Error</div>
          <div class="metric-value">{{ formatPixels(metrics.rmsError.value) }}</div>
          <div class="metric-rating">{{ metrics.rmsError.rating }}</div>
        </div>

        <div class="metric-card" :class="metrics.dataLoss.rating">
          <div class="metric-label">Data Loss</div>
          <div class="metric-value">{{ formatPercent(metrics.dataLoss.value) }}</div>
          <div class="metric-rating">{{ metrics.dataLoss.rating }}</div>
        </div>
      </div>

      <div class="result-actions">
        <v-btn v-if="!isValid" color="warning" @click="emit('retry')">
          {{ $t('eyeTracking.calibration.retry') || 'Retry Calibration' }}
        </v-btn>
        <v-btn color="primary" @click="emit('complete', { isValid, metrics, samples })">
          {{ isValid ? 'Continue' : 'Continue Anyway' }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AccuracyMetrics from '../metrics/AccuracyMetrics.js'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  initialCalibration: {
    type: Object,
    required: true
  },
  screenDimensions: {
    type: Object,
    default: () => ({ width: 1920, height: 1080 })
  }
})

const emit = defineEmits(['complete', 'retry'])

// Refs
const canvasRef = ref(null)
const ctx = ref(null)

// State
const isValidating = ref(false)
const isComplete = ref(false)
const isValid = ref(false)
const validationPoints = ref([])
const samples = ref([])
const metrics = ref(null)

// Config
const numValidationPoints = 5 // Number of intermediate targets

// Computed
const accuracyMetrics = computed(() => {
  return new AccuracyMetrics({
    screenWidth: props.screenDimensions.width,
    screenHeight: props.screenDimensions.height
  })
})

// Generate validation points (intermediate positions not used in initial calibration)
const generateValidationPoints = () => {
  const points = []
  const offset = props.config.offset || 100
  const width = props.screenDimensions.width - offset * 2
  const height = props.screenDimensions.height - offset * 2

  // Create 5 intermediate points (quarter positions)
  const quarterPositions = [
    { x: offset + width * 0.25, y: offset + height * 0.25 },
    { x: offset + width * 0.75, y: offset + height * 0.25 },
    { x: offset + width * 0.5, y: offset + height * 0.5 },
    { x: offset + width * 0.25, y: offset + height * 0.75 },
    { x: offset + width * 0.75, y: offset + height * 0.75 }
  ]

  return quarterPositions.map((pos, index) => ({
    ...pos,
    index
  }))
}

// Canvas setup
const setupCanvas = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  canvas.width = props.screenDimensions.width
  canvas.height = props.screenDimensions.height
  ctx.value = canvas.getContext('2d')
}

// Draw validation point
const drawPoint = (position, isActive = false) => {
  if (!ctx.value) return

  const { x, y } = position
  const radius = props.config.radius || 20
  const color = '#ff9800' // Orange for validation points

  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // Background
  ctx.value.fillStyle = props.config.backgroundColor || '#FFFFFF'
  ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // Outer circle
  ctx.value.beginPath()
  ctx.value.arc(x, y, radius + 5, 0, Math.PI * 2)
  ctx.value.strokeStyle = isActive ? '#1976d2' : color
  ctx.value.lineWidth = 3
  ctx.value.stroke()

  // Inner circle
  ctx.value.beginPath()
  ctx.value.arc(x, y, radius, 0, Math.PI * 2)
  ctx.value.fillStyle = isActive ? '#1976d2' : color
  ctx.value.fill()
}

// Start validation
const startValidation = () => {
  validationPoints.value = generateValidationPoints()
  samples.value = []
  isValidating.value = true
  isComplete.value = false

  showCurrentPoint()
}

// Show current point
const showCurrentPoint = () => {
  if (validationPoints.value.length === 0) {
    finishValidation()
    return
  }

  const position = validationPoints.value[0]
  drawPoint(position, true)

  // Collect samples
  collectSamplesForPoint(position)
}

// Collect samples for validation point
const collectSamplesForPoint = async (position) => {
  const samplesPerPoint = 30 // Fewer samples for validation
  const msPerCapture = props.config.msPerCapture || 100
  const pointSamples = []
  let sampleCount = 0

  const collect = () => {
    if (sampleCount >= samplesPerPoint) {
      // Store average gaze position for this target
      if (pointSamples.length > 0) {
        let sumX = 0, sumY = 0
        for (const s of pointSamples) {
          sumX += s.x
          sumY += s.y
        }
        samples.value.push({
          target: { x: position.x, y: position.y },
          gaze: { x: sumX / pointSamples.length, y: sumY / pointSamples.length }
        })
      }

      // Remove shown point and move to next
      validationPoints.value.shift()
      if (validationPoints.value.length > 0) {
        showCurrentPoint()
      } else {
        finishValidation()
      }
      return
    }

    // Emit for parent to provide gaze data
    // In real implementation, this would receive from IrisTracker

    sampleCount++
    setTimeout(collect, msPerCapture)
  }

  setTimeout(collect, 500)
}

// Finish validation
const finishValidation = () => {
  isValidating.value = false
  isComplete.value = true

  // Compute metrics
  if (samples.value.length > 0) {
    metrics.value = accuracyMetrics.value.computeAll({
      samples: samples.value,
      totalExpected: numValidationPoints * 30,
      totalActual: samples.value.reduce((sum, s) => sum + 30, 0)
    })

    // Determine validity based on thresholds
    const thresholds = props.config.validationThreshold || {}
    isValid.value =
      metrics.value.precision.rating !== 'poor' &&
      metrics.value.accuracy.rating !== 'poor' &&
      metrics.value.dataLoss.rating !== 'poor'
  } else {
    metrics.value = null
    isValid.value = false
  }

  // Clear canvas
  if (ctx.value) {
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }
}

// Utility functions
const formatDegrees = (value) => {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(2)}°`
}

const formatPixels = (value) => {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(1)}px`
}

const formatPercent = (value) => {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(1)}%`
}

// Lifecycle
onMounted(() => {
  setupCanvas()
})
</script>

<style scoped>
.validation-calibration-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 400px;
}

.instructions {
  text-align: center;
  padding: 2rem;
}

.validation-canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.validation-canvas {
  border: 1px solid #e0e0e0;
  background: white;
}

.validation-results {
  padding: 2rem;
  width: 100%;
  max-width: 600px;
}

.result-header {
  text-align: center;
  margin-bottom: 2rem;
}

.result-header h3 {
  margin-top: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.metric-card.good {
  background: #e8f5e9;
  border: 2px solid #4caf50;
}

.metric-card.acceptable {
  background: #fff3e0;
  border: 2px solid #ff9800;
}

.metric-card.poor {
  background: #ffebee;
  border: 2px solid #f44336;
}

.metric-label {
  font-size: 0.875rem;
  color: #666;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.metric-rating {
  text-transform: capitalize;
  font-size: 0.875rem;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>
