<template>
  <v-row class="d-flex align-center">
    <v-col cols="8">
      <v-slider v-model="offset" :min="100" :max="300" step="5" thumb-label>
        <template #label>
          <div class="d-flex align-center">
            Offset
            <v-tooltip
              content-class="modern-tooltip"
              location="top"
              max-width="300"
              text="Defines the inner margin (in pixels) of the calibration area relative to the screen edges. This prevents targets from being rendered in non-trackable peripheral zones."
            >
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  size="x-small"
                  color="primary"
                  icon="mdi-information-outline"
                  class="ml-2"
                ></v-icon>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-slider>
    </v-col>

    <v-col
      cols="4"
      style="
        max-width: 100%;
        max-height: 100%;
        display: flex;
        align-items: stretch;
      "
    >
      <canvas ref="offCanvas" style="width: 100%; height: 100%"></canvas>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import EyeCalibrationSettings from '../models/EyeCalibrationSettings'

const store = useStore()
const offCanvas = ref(null)

// --- Computed Properties: Synced with Vuex Store ---

const offset = computed({
  get: () => store.getters.test?.calibrationConfig?.offset ?? 100,
  set: (val) => {
    const config = new EyeCalibrationSettings({
      ...store.getters.test.calibrationConfig,
      offset: val,
    })
    store.commit('SET_CALIBRATION_CONFIG', config)
    drawOffset()
  },
})

const pointNumber = computed({
  get: () => store.getters.test?.calibrationConfig?.pointNumber ?? 8,
  set: (val) => {
    const config = new EyeCalibrationSettings({
      ...store.getters.test.calibrationConfig,
      pointNumber: val,
    })
    store.commit('SET_CALIBRATION_CONFIG', config)
    drawOffset()
  },
})

const backgroundColor = computed({
  get: () =>
    store.getters.test?.calibrationConfig?.backgroundColor ?? '#FFFFFFFF',
  set: (val) => {
    const config = new EyeCalibrationSettings({
      ...store.getters.test.calibrationConfig,
      backgroundColor: val,
    })
    store.commit('SET_CALIBRATION_CONFIG', config)
    drawOffset()
  },
})

// --- Logic & Helper Functions ---

/**
 * Initializes calibration configuration from the store.
 */
const getCalibrationConfig = () => {
  const calibrationConfig =
    store.getters.test.calibrationConfig instanceof EyeCalibrationSettings
      ? store.getters.test.calibrationConfig
      : new EyeCalibrationSettings()

  store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)

  offset.value = calibrationConfig.offset ?? 100
  pointNumber.value = calibrationConfig.pointNumber ?? 8
  backgroundColor.value = calibrationConfig.backgroundColor ?? '#FFFFFFFF'
}

/**
 * Updates the global store and includes the calculated point pattern.
 */
const updateCalibrationConfig = (pattern = null) => {
  const calibrationConfig = new EyeCalibrationSettings({
    ...store.getters.test.calibrationConfig,
    offset: offset.value,
    pointNumber: pointNumber.value,
    backgroundColor: backgroundColor.value,
    ...(pattern && { pattern }),
  })

  store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)
}

/**
 * Math Logic: Generates X,Y coordinates for calibration targets based on point count.
 * Matches specific patterns (2, 3, 4, 5, 6, 7, 8, 9 points).
 */
const generatePoints = (offsetX, offsetY, width, height, pointNum) => {
  const possiblePatterns = [
    [
      { x: offsetX, y: height - offsetY },
      { x: width - offsetX, y: offsetY },
    ],
    [
      { x: offsetX, y: height - offsetY },
      { x: width / 2, y: height / 2 },
      { x: width - offsetX, y: offsetY },
    ],
    [
      { x: offsetX, y: offsetY },
      { x: width - offsetX, y: offsetY },
      { x: offsetX, y: height - offsetY },
      { x: width - offsetX, y: height - offsetY },
    ],
    [
      { x: offsetX, y: offsetY },
      { x: width - offsetX, y: offsetY },
      { x: width / 2, y: height / 2 },
      { x: offsetX, y: height - offsetY },
      { x: width - offsetX, y: height - offsetY },
    ],
    [
      { x: offsetX, y: offsetY },
      { x: offsetX, y: height / 2 },
      { x: offsetX, y: height - offsetY },
      { x: width - offsetX, y: offsetY },
      { x: width - offsetX, y: height / 2 },
      { x: width - offsetX, y: height - offsetY },
    ],
    [
      { x: offsetX, y: offsetY },
      { x: offsetX, y: height / 2 },
      { x: offsetX, y: height - offsetY },
      { x: width / 2, y: height / 2 },
      { x: width - offsetX, y: offsetY },
      { x: width - offsetX, y: height / 2 },
      { x: width - offsetX, y: height - offsetY },
    ],
    [
      { x: offsetX, y: offsetY },
      { x: offsetX, y: height / 2 },
      { x: offsetX, y: height - offsetY },
      { x: width / 2, y: offsetY },
      { x: width / 2, y: height - offsetY },
      { x: width - offsetX, y: offsetY },
      { x: width - offsetX, y: height / 2 },
      { x: width - offsetX, y: height - offsetY },
    ],
    [
      { x: offsetX, y: offsetY },
      { x: offsetX, y: height / 2 },
      { x: offsetX, y: height - offsetY },
      { x: width / 2, y: offsetY },
      { x: width / 2, y: height / 2 },
      { x: width / 2, y: height - offsetY },
      { x: width - offsetX, y: offsetY },
      { x: width - offsetX, y: height / 2 },
      { x: width - offsetX, y: height - offsetY },
    ],
  ]
  return possiblePatterns.find((p) => p.length === pointNum) || []
}

/**
 * Rendering Logic:
 * Scales the true screen coordinates to fit the small preview canvas.
 */
const drawOffset = () => {
  if (!offCanvas.value) return

  const canvas = offCanvas.value
  const ctx = canvas.getContext('2d')

  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight

  // Calculate scaling factors relative to user's screen size
  const xFac = canvas.width / window.innerWidth
  const yFac = canvas.height / window.innerHeight

  const trueOffsetX = offset.value * xFac
  const trueOffsetY = offset.value * yFac

  // Points for local preview canvas
  const canvasCalib = generatePoints(
    trueOffsetX,
    trueOffsetY,
    canvas.width,
    canvas.height,
    pointNumber.value,
  )

  // Points for actual calibration (full screen)
  const trueCalib = generatePoints(
    offset.value,
    offset.value,
    window.innerWidth,
    window.innerHeight,
    pointNumber.value,
  )

  updateCalibrationConfig(trueCalib)

  // Drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = backgroundColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'red'
  canvasCalib.forEach((point) => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()
  })
}

// --- Watchers & Lifecycle ---

watch([offset, pointNumber, backgroundColor], () => {
  drawOffset()
})

onMounted(() => {
  getCalibrationConfig()
  drawOffset()
})
</script>
