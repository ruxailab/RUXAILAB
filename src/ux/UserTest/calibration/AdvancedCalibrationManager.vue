<template>
  <div class="advanced-calibration-manager">
    <!-- Stage indicator -->
    <div class="stage-indicator" v-if="showStageIndicator">
      <div
        v-for="(stage, index) in stages"
        :key="stage.id"
        :class="['stage-dot', { active: currentStageIndex === index, completed: currentStageIndex > index }]"
        @click="goToStage(index)"
      >
        <span class="stage-number">{{ index + 1 }}</span>
        <span class="stage-label">{{ stage.label }}</span>
      </div>
    </div>

    <!-- Stage components -->
    <div class="calibration-content">
      <InitialCalibrationStage
        v-if="currentStage === 'initial'"
        ref="initialStageRef"
        :config="calibrationConfig"
        :screenDimensions="screenDimensions"
        @complete="onInitialComplete"
        @pointCollected="onPointCollected"
      />

      <ValidationCalibrationStage
        v-else-if="currentStage === 'validation'"
        ref="validationStageRef"
        :config="calibrationConfig"
        :initialCalibration="calibrationResult"
        :screenDimensions="screenDimensions"
        @complete="onValidationComplete"
        @retry="onValidationRetry"
      />

      <DriftCalibrationStage
        v-else-if="currentStage === 'driftReference'"
        ref="driftStageRef"
        :config="calibrationConfig"
        :calibrationResult="calibrationResult"
        :screenDimensions="screenDimensions"
        @complete="onDriftComplete"
        @skip="onDriftSkip"
      />
    </div>

    <!-- Quality indicator -->
    <div v-if="showQualityIndicator" class="quality-indicator">
      <span :class="['quality-badge', qualityRating]">
        {{ qualityLabel }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import InitialCalibrationStage from './stages/InitialCalibrationStage.vue'
import ValidationCalibrationStage from './stages/ValidationCalibrationStage.vue'
import DriftCalibrationStage from './stages/DriftCalibrationStage.vue'
import CalibrationResult from '../models/CalibrationResult.js'
import AccuracyMetrics from './metrics/AccuracyMetrics.js'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  screenDimensions: {
    type: Object,
    default: () => ({ width: 1920, height: 1080 })
  },
  showStageIndicator: {
    type: Boolean,
    default: true
  },
  showQualityIndicator: {
    type: Boolean,
    default: true
  },
  autoAdvance: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'complete',
  'stageChange',
  'pointCollected',
  'metricsComputed',
  'qualityUpdate',
  'error'
])

// Stage definitions
const stages = [
  { id: 'initial', label: 'Calibration', enabled: true },
  { id: 'validation', label: 'Validation', enabled: true },
  { id: 'driftReference', label: 'Drift Reference', enabled: true }
]

// State
const currentStageIndex = ref(0)
const calibrationResult = ref(null)
const accuracyMetrics = ref(null)
const initialStageRef = ref(null)
const validationStageRef = ref(null)
const driftStageRef = ref(null)

const calibrationConfig = computed(() => props.config)

// Computed
const currentStage = computed(() => stages[currentStageIndex.value].id)

const qualityRating = computed(() => {
  if (!calibrationResult.value) return 'unknown'
  return calibrationResult.value.qualityRating
})

const qualityLabel = computed(() => {
  const labels = {
    good: 'Good Quality',
    acceptable: 'Acceptable',
    poor: 'Poor Quality',
    unknown: 'Not Assessed'
  }
  return labels[qualityRating.value]
})

// Watch for stage changes
watch(currentStageIndex, (newIndex) => {
  emit('stageChange', {
    stage: stages[newIndex].id,
    index: newIndex
  })
})

// Initialize calibration
onMounted(() => {
  initializeCalibration()
})

const initializeCalibration = () => {
  calibrationResult.value = new CalibrationResult({
    settings: props.config,
    deviceInfo: {
      hardwareSource: props.config.hardwareSource || 'WEBCAM',
      screenWidth: props.screenDimensions.width,
      screenHeight: props.screenDimensions.height
    }
  })

  accuracyMetrics.value = new AccuracyMetrics({
    screenWidth: props.screenDimensions.width,
    screenHeight: props.screenDimensions.height
  })
}

// Stage completion handlers
const onInitialComplete = (data) => {
  calibrationResult.value.setInitialStage(data)

  // Compute initial metrics
  if (data.samples && data.samples.length > 0) {
    const transformedSamples = data.samples.map((s) => ({
      target: { x: s.targetX, y: s.targetY },
      gaze: { x: s.gazeX, y: s.gazeY }
    }))
    const metrics = accuracyMetrics.value.computeAll({
      samples: transformedSamples,
      totalExpected: props.config.pointNumber * props.config.samplePerPoint,
      totalActual: data.samples.length
    })

    calibrationResult.value.metrics = {
      precision: metrics.precision.value,
      accuracy: metrics.accuracy.value,
      rmsError: metrics.rmsError.value,
      dataLoss: metrics.dataLoss.value
    }

    emit('metricsComputed', metrics)
  }

  emit('qualityUpdate', {
    stage: 'initial',
    quality: calibrationResult.value.qualityRating
  })

  // Advance to next stage
  if (props.autoAdvance && stages[currentStageIndex.value + 1]?.enabled) {
    currentStageIndex.value++
  }
}

const onValidationComplete = (data) => {
  calibrationResult.value.setValidationStage(data)

  // Update metrics from validation
  calibrationResult.value.metrics = {
    ...calibrationResult.value.metrics,
    ...data.metrics
  }

  calibrationResult.value.qualityRating =
    data.isValid && data.metrics && typeof data.metrics.overall !== 'undefined'
      ? data.metrics.overall
      : 'poor'

  emit('metricsComputed', data.metrics)
  emit('qualityUpdate', {
    stage: 'validation',
    quality: calibrationResult.value.qualityRating,
    isValid: data.isValid
  })

  // Advance to next stage
  if (props.autoAdvance && stages[currentStageIndex.value + 1]?.enabled) {
    currentStageIndex.value++
  }
}

const onValidationRetry = () => {
  // Reset and go back to initial stage
  currentStageIndex.value = 0
  calibrationResult.value = new CalibrationResult({
    settings: props.config,
    deviceInfo: {
      hardwareSource: props.config.hardwareSource || 'WEBCAM',
      screenWidth: props.screenDimensions.width,
      screenHeight: props.screenDimensions.height
    }
  })
}

const onDriftComplete = (data) => {
  calibrationResult.value.setDriftReferenceStage(data)
  finishCalibration()
}

const onDriftSkip = () => {
  finishCalibration()
}

const finishCalibration = () => {
  calibrationResult.value.status = 'completed'
  emit('complete', calibrationResult.value)
}

// Point collection handler
const onPointCollected = (pointData) => {
  calibrationResult.value.addCalibrationPoint(pointData)
  emit('pointCollected', pointData)
}

// Navigation
const goToStage = (index) => {
  // Only allow going back, not forward
  if (index < currentStageIndex.value && stages[index]?.enabled) {
    currentStageIndex.value = index
  }
}

// Manual control methods
const start = () => {
  currentStageIndex.value = 0
  initializeCalibration()
}

const next = () => {
  if (currentStageIndex.value < stages.length - 1) {
    currentStageIndex.value++
  }
}

const previous = () => {
  if (currentStageIndex.value > 0) {
    currentStageIndex.value--
  }
}

const reset = () => {
  currentStageIndex.value = 0
  initializeCalibration()
}

// Expose methods for parent component
defineExpose({
  start,
  next,
  previous,
  reset,
  getResult: () => calibrationResult.value,
  getMetrics: () => calibrationResult.value?.metrics
})
</script>

<style scoped>
.advanced-calibration-manager {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.stage-indicator {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stage-dot {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 50%;
  background: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stage-dot.active {
  background: #1976d2;
  color: white;
}

.stage-dot.completed {
  background: #4caf50;
  color: white;
}

.stage-number {
  font-weight: bold;
}

.stage-label {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.calibration-content {
  width: 100%;
}

.quality-indicator {
  margin-top: 1rem;
}

.quality-badge {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: bold;
}

.quality-badge.good {
  background: #4caf50;
  color: white;
}

.quality-badge.acceptable {
  background: #ff9800;
  color: white;
}

.quality-badge.poor {
  background: #f44336;
  color: white;
}

.quality-badge.unknown {
  background: #9e9e9e;
  color: white;
}
</style>
