<template>
  <div class="drift-calibration-stage">
    <!-- Instructions -->
    <div v-if="!isActive && !isComplete" class="instructions">
      <h3>{{ $t('eyeTracking.calibration.drift.title') || 'Drift Reference' }}</h3>
      <p>{{ $t('eyeTracking.calibration.drift.instructions') || 'A small reference point will appear at the center. This helps detect drift during the session.' }}</p>
      <v-btn color="primary" @click="startDriftReference">
        {{ $t('eyeTracking.calibration.startDriftReference') || 'Start Drift Reference' }}
      </v-btn>
      <v-btn variant="text" @click="emit('skip')" style="margin-left: 1rem;">
        {{ $t('eyeTracking.calibration.skip') || 'Skip' }}
      </v-btn>
    </div>

    <!-- Drift reference canvas -->
    <div v-show="isActive" class="drift-canvas-container">
      <canvas ref="canvasRef" class="drift-canvas" />
    </div>

    <!-- Drift monitoring -->
    <div v-if="isActive && driftStatus" class="drift-status">
      <div :class="['drift-indicator', driftStatus.status]">
        <span class="drift-label">Drift Status:</span>
        <span class="drift-value">{{ driftStatus.label }}</span>
      </div>
      <div v-if="driftStatus.driftVector" class="drift-vector">
        Offset: {{ driftStatus.driftVector.x.toFixed(1) }}, {{ driftStatus.driftVector.y.toFixed(1) }} px
      </div>
    </div>

    <!-- Complete state -->
    <div v-if="isComplete" class="completion-info">
      <v-icon color="success" size="48">mdi-check-circle</v-icon>
      <h3>Drift Reference Set</h3>
      <p>Calibration is ready for the session.</p>
      <v-btn color="primary" @click="emit('complete', driftData)">
        {{ $t('eyeTracking.calibration.continue') || 'Continue' }}
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import DriftDetector from '../metrics/DriftDetector.js'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  calibrationResult: {
    type: Object,
    required: true
  },
  screenDimensions: {
    type: Object,
    default: () => ({ width: 1920, height: 1080 })
  }
})

const emit = defineEmits(['complete', 'skip', 'driftUpdate'])

// Refs
const canvasRef = ref(null)
const ctx = ref(null)

// State
const isActive = ref(false)
const isComplete = ref(false)
const driftDetector = ref(null)
const driftStatus = ref(null)
const driftData = ref(null)
const referencePosition = ref(null)
let monitoringInterval = null

// Computed
const centerPosition = computed(() => ({
  x: props.screenDimensions.width / 2,
  y: props.screenDimensions.height / 2
}))

// Canvas setup
const setupCanvas = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  canvas.width = props.screenDimensions.width
  canvas.height = props.screenDimensions.height
  ctx.value = canvas.getContext('2d')
}

// Draw drift reference point
const drawReferencePoint = (position, isActivePoint = true) => {
  if (!ctx.value) return

  const { x, y } = position

  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // Background
  ctx.value.fillStyle = props.config.backgroundColor || '#FFFFFF'
  ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // Small reference point at center
  const radius = 8
  const color = isActivePoint ? '#4caf50' : '#9e9e9e'

  // Outer ring
  ctx.value.beginPath()
  ctx.value.arc(x, y, radius + 4, 0, Math.PI * 2)
  ctx.value.strokeStyle = color
  ctx.value.lineWidth = 2
  ctx.value.stroke()

  // Inner dot
  ctx.value.beginPath()
  ctx.value.arc(x, y, radius, 0, Math.PI * 2)
  ctx.value.fillStyle = color
  ctx.value.fill()
}

// Initialize drift detector
const initializeDriftDetector = () => {
  const driftConfig = props.config.driftThreshold || {}

  driftDetector.value = new DriftDetector({
    velocityThreshold: driftConfig.velocityThreshold || 50,
    accelerationThreshold: driftConfig.accelerationThreshold || 100,
    positionDriftThreshold: driftConfig.positionDriftThreshold || 100,
    driftWindow: driftConfig.driftWindow || 300000
  })

  // Set baseline from calibration
  driftDetector.value.setBaseline(
    {
      centerPosition: centerPosition.value,
      screenWidth: props.screenDimensions.width,
      screenHeight: props.screenDimensions.height
    },
    Date.now()
  )
}

// Start drift reference
const startDriftReference = () => {
  isActive.value = true
  isComplete.value = false
  referencePosition.value = centerPosition.value

  initializeDriftDetector()

  // Draw reference point
  drawReferencePoint(referencePosition.value, true)

  // Start monitoring
  monitoringInterval = setInterval(monitorDrift, 1000)
}

// Monitor drift
const monitorDrift = () => {
  if (!driftDetector.value || !isActive.value) return

  // In real implementation, this would receive actual gaze data from IrisTracker
  // For now, we'll simulate with the reference point position
  const currentGaze = {
    x: referencePosition.value.x,
    y: referencePosition.value.y,
    timestamp: Date.now()
  }

  driftDetector.value.addGazePoint(currentGaze)

  // Check for drift
  const result = driftDetector.value.detectDrift()
  driftStatus.value = {
    status: result.driftDetected ? 'drifted' : 'stable',
    label: result.driftDetected ? 'Drift Detected' : 'Stable',
    driftVector: result.driftVector,
    recommendation: result.recommendation
  }

  emit('driftUpdate', driftStatus.value)

  // If significant drift detected, show warning
  if (result.driftDetected && result.driftProbability > 0.8) {
    showDriftWarning()
  }
}

// Show drift warning
const showDriftWarning = () => {
  // Flash the reference point
  if (ctx.value) {
    drawReferencePoint(referencePosition.value, false)
    setTimeout(() => {
      if (isActive.value) {
        drawReferencePoint(referencePosition.value, true)
      }
    }, 200)
  }
}

// Complete drift reference
const completeDriftReference = () => {
  isActive.value = false
  isComplete.value = true

  if (monitoringInterval) {
    clearInterval(monitoringInterval)
    monitoringInterval = null
  }

  driftData.value = {
    referencePosition: referencePosition.value,
    baselineTimestamp: Date.now(),
    driftDetectorState: driftDetector.value?.getState(),
    monitorDuration: isActive.value ? Date.now() - referencePosition.value : 0
  }

  // Clear canvas
  if (ctx.value) {
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }
}

// Skip drift reference
const skipDriftReference = () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
    monitoringInterval = null
  }
  emit('skip')
}

// Lifecycle
onMounted(() => {
  setupCanvas()
})

onBeforeUnmount(() => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
  }
})
</script>

<style scoped>
.drift-calibration-stage {
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

.drift-canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.drift-canvas {
  border: 1px solid #e0e0e0;
  background: white;
}

.drift-status {
  margin-top: 1rem;
  text-align: center;
}

.drift-indicator {
  display: inline-flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
}

.drift-indicator.stable {
  background: #e8f5e9;
  color: #2e7d32;
}

.drift-indicator.drifted {
  background: #fff3e0;
  color: #f57c00;
}

.drift-indicator.warning {
  background: #ffebee;
  color: #c62828;
}

.drift-label {
  font-weight: bold;
}

.drift-vector {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.completion-info {
  text-align: center;
  padding: 2rem;
}

.completion-info h3 {
  margin-top: 1rem;
}
</style>
