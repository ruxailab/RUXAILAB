<template>
  <div class="initial-calibration-stage">
    <!-- Instructions -->
    <div class="instructions" v-if="!isCalibrating && !isComplete">
      <h3>{{ $t('eyeTracking.calibration.initial.title') || 'Eye Calibration' }}</h3>
      <p>{{ $t('eyeTracking.calibration.initial.instructions') || 'Look at each point as it appears and keep your head still.' }}</p>
      <v-btn color="primary" @click="startCalibration">
        {{ $t('eyeTracking.calibration.start') || 'Start Calibration' }}
      </v-btn>
    </div>

    <!-- Calibration canvas -->
    <div v-show="isCalibrating" class="calibration-canvas-container">
      <canvas ref="canvasRef" class="calibration-canvas" />
    </div>

    <!-- Progress -->
    <div v-if="isCalibrating" class="progress-info">
      <span>{{ currentPointIndex + 1 }} / {{ pointPositions.length }}</span>
      <v-progress-linear :value="progress" height="8" rounded />
    </div>

    <!-- Quality per point -->
    <div v-if="showQualityPerPoint && pointQuality.length > 0" class="point-quality-list">
      <div
        v-for="(quality, index) in pointQuality"
        :key="index"
        :class="['quality-item', quality.rating]"
      >
        Point {{ index + 1 }}: {{ quality.label }}
      </div>
    </div>

    <!-- Complete state -->
    <div v-if="isComplete" class="completion-info">
      <v-icon color="success" size="48">mdi-check-circle</v-icon>
      <h3>{{ $t('eyeTracking.calibration.complete') || 'Calibration Complete' }}</h3>
      <p v-if="overallQuality">{{ $t('eyeTracking.calibration.quality') || 'Quality' }}: {{ overallQuality }}</p>
      <div v-if="metrics" class="metrics-summary">
        <div>Precision: {{ formatDegrees(metrics.precision) }}</div>
        <div>Accuracy: {{ formatDegrees(metrics.accuracy) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import AccuracyMetrics from '../metrics/AccuracyMetrics.js'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  screenDimensions: {
    type: Object,
    default: () => ({ width: 1920, height: 1080 })
  }
})

const emit = defineEmits(['complete', 'pointCollected', 'qualityUpdate'])

// Refs
const canvasRef = ref(null)
const ctx = ref(null)

// State
const isCalibrating = ref(false)
const isComplete = ref(false)
const currentPointIndex = ref(0)
const pointPositions = ref([])
const pointQuality = ref([])
const collectedSamples = ref([])
const pointStartTime = ref(null)
let collectionTimerId = null

// Config
const showQualityPerPoint = computed(() => props.config.enableAdaptiveSampling ?? true)
const qualityThreshold = computed(() => props.config.qualityThreshold || 0.7)

// Metrics
const accuracyMetrics = ref(null)

// Computed
const progress = computed(() => {
  if (pointPositions.value.length === 0) return 0
  return ((currentPointIndex.value + 1) / pointPositions.value.length) * 100
})

const overallQuality = computed(() => {
  if (pointQuality.value.length === 0) return null
  const goodCount = pointQuality.value.filter(q => q.rating === 'good').length
  const acceptableCount = pointQuality.value.filter(q => q.rating === 'acceptable').length
  if (goodCount === pointQuality.value.length) return 'good'
  if (goodCount + acceptableCount === pointQuality.value.length) return 'acceptable'
  return 'poor'
})

const metrics = computed(() => {
  if (collectedSamples.value.length === 0) return null
  return accuracyMetrics.value?.computePrecision(
    collectedSamples.value.map(s => ({ x: s.gazeX, y: s.gazeY }))
  )
})

// Generate calibration points
const generatePointPositions = () => {
  const positions = []
  const pointNumber = props.config.pointNumber || 9 // Default 9-point grid
  const offset = props.config.offset || 100
  const width = props.screenDimensions.width - offset * 2
  const height = props.screenDimensions.height - offset * 2

  if (pointNumber === 9) {
    // 3x3 grid
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        positions.push({
          x: offset + (width / 2) * col,
          y: offset + (height / 2) * row,
          index: row * 3 + col
        })
      }
    }
  } else if (pointNumber === 13) {
    // 3x3 with corners
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        positions.push({
          x: offset + (width / 2) * col,
          y: offset + (height / 2) * row,
          index: row * 3 + col
        })
      }
    }
    // Add corners
    positions.push({ x: offset, y: offset, index: 9 })
    positions.push({ x: props.screenDimensions.width - offset, y: offset, index: 10 })
    positions.push({ x: offset, y: props.screenDimensions.height - offset, index: 11 })
    positions.push({ x: props.screenDimensions.width - offset, y: props.screenDimensions.height - offset, index: 12 })
  } else {
    // Generic grid
    const cols = Math.ceil(Math.sqrt(pointNumber))
    const rows = Math.ceil(pointNumber / cols)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (positions.length >= pointNumber) break
        positions.push({
          x: offset + (width / (cols - 1 || 1)) * col,
          y: offset + (height / (rows - 1 || 1)) * row,
          index: row * cols + col
        })
      }
    }
  }

  return positions
}

// Canvas setup
const setupCanvas = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  canvas.width = props.screenDimensions.width
  canvas.height = props.screenDimensions.height
  ctx.value = canvas.getContext('2d')
}

// Draw calibration point
const drawPoint = (position, isActive = false) => {
  if (!ctx.value) return

  const { x, y } = position
  const radius = props.config.radius || 20
  const color = props.config.pointColor || '#000000'

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

// Start calibration
const startCalibration = () => {
  accuracyMetrics.value = new AccuracyMetrics({
    screenWidth: props.screenDimensions.width,
    screenHeight: props.screenDimensions.height
  })

  pointPositions.value = generatePointPositions()
  pointQuality.value = []
  collectedSamples.value = []
  currentPointIndex.value = 0
  isCalibrating.value = true
  isComplete.value = false

  showCurrentPoint()
}

// Show current point
const showCurrentPoint = () => {
  if (currentPointIndex.value >= pointPositions.value.length) {
    finishCalibration()
    return
  }

  const position = pointPositions.value[currentPointIndex.value]
  drawPoint(position, true)
  pointStartTime.value = Date.now()

  // Collect samples for this point
  collectSamplesForPoint(position)
}

// Collect samples for a point
const collectSamplesForPoint = async (position) => {
  const samplesPerPoint = props.config.samplePerPoint || 90
  const msPerCapture = props.config.msPerCapture || 100
  const samples = []
  let sampleCount = 0

  const collect = () => {
    if (sampleCount >= samplesPerPoint) {
      evaluatePointQuality(position, samples)
      return
    }

    // In a real implementation, this would receive data from IrisTracker
    // For now, we fall back to simulation only behind a dev/test flag
    if (props.config.devMode) {
      const randomValue = window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
      const noise = randomValue * 20 - 10;
      samples.push({
        x: position.x + noise,
        y: position.y + noise,
        timestamp: Date.now()
      });
    }
    
    emit('pointCollected', {
      targetX: position.x,
      targetY: position.y,
      targetIndex: position.index,
      timestamp: Date.now()
    })

    sampleCount++

    collectionTimerId = setTimeout(collect, msPerCapture)
  }

  // Start collection after a brief delay
  collectionTimerId = setTimeout(collect, 500)
}

// Evaluate quality of collected samples for a point
const evaluatePointQuality = (position, samples) => {
  // Calculate quality metrics for this point
  if (samples.length === 0) {
    pointQuality.value.push({ rating: 'poor', label: 'No data' })
    moveToNextPoint()
    return
  }

  // Calculate standard deviation (precision indicator)
  let sumX = 0, sumY = 0
  for (const s of samples) {
    sumX += s.x
    sumY += s.y
  }
  const meanX = sumX / samples.length
  const meanY = sumY / samples.length

  let sumSqDist = 0
  for (const s of samples) {
    const dx = s.x - meanX
    const dy = s.y - meanY
    sumSqDist += dx * dx + dy * dy
  }
  const variance = sumSqDist / samples.length
  const stdDev = Math.sqrt(variance)

  // Convert to degrees (rough approximation)
  const stdDevDegrees = stdDev * 0.1 // Simplified conversion

  // Rate quality
  let rating, label
  if (stdDevDegrees < 0.5) {
    rating = 'good'
    label = `Excellent (${stdDevDegrees.toFixed(2)}°)`
  } else if (stdDevDegrees < 1.0) {
    rating = 'acceptable'
    label = `Good (${stdDevDegrees.toFixed(2)}°)`
  } else {
    rating = 'poor'
    label = `Poor (${stdDevDegrees.toFixed(2)}°)`
  }

  pointQuality.value.push({
    rating,
    label,
    samples: samples.length,
    stdDev,
    position
  })

  // Store samples with target info
  for (const s of samples) {
    collectedSamples.value.push({
      targetX: position.x,
      targetY: position.y,
      targetIndex: position.index,
      gazeX: s.x,
      gazeY: s.y,
      timestamp: s.timestamp
    })
  }

  // Emit quality update
  emit('qualityUpdate', {
    pointIndex: currentPointIndex.value,
    rating,
    quality: pointQuality.value[pointQuality.value.length - 1]
  })

  moveToNextPoint()
}

// Move to next point
const moveToNextPoint = () => {
  currentPointIndex.value++

  if (currentPointIndex.value >= pointPositions.value.length) {
    finishCalibration()
  } else {
    showCurrentPoint()
  }
}

// Finish calibration
const finishCalibration = () => {
  isCalibrating.value = false
  isComplete.value = true

  // Clear canvas
  if (ctx.value) {
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }

  // Emit completion
  emit('complete', {
    pointPositions: pointPositions.value,
    samples: collectedSamples.value,
    pointQuality: pointQuality.value,
    overallQuality: overallQuality.value,
    metrics: metrics.value
  })
}

// Utility
const formatDegrees = (value) => {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(2)}°`
}

// Lifecycle
onMounted(() => {
  setupCanvas()
})

onBeforeUnmount(() => {
  if (collectionTimerId) {
    clearTimeout(collectionTimerId)
    collectionTimerId = null
  }
})
</script>

<style scoped>
.initial-calibration-stage {
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

.instructions h3 {
  margin-bottom: 1rem;
}

.calibration-canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.calibration-canvas {
  border: 1px solid #e0e0e0;
  background: white;
}

.progress-info {
  margin-top: 1rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.point-quality-list {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.quality-item {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.quality-item.good {
  background: #4caf50;
  color: white;
}

.quality-item.acceptable {
  background: #ff9800;
  color: white;
}

.quality-item.poor {
  background: #f44336;
  color: white;
}

.completion-info {
  text-align: center;
  padding: 2rem;
}

.metrics-summary {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #666;
}
</style>
