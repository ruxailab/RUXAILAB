<template>
  <v-row class="d-flex align-center" no-gutters>
    <v-col cols="10">
      <v-tooltip
        :text="$t('EyeTrackingConfig.tooltips.radius')"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-slider
            v-bind="props"
            v-model="radius"
            :min="10"
            :max="35"
            step="1"
            :label="$t('EyeTrackingConfig.labels.radius')"
            thumb-label
          />
        </template>
      </v-tooltip>
    </v-col>

    <v-col cols="2" class="d-flex justify-center">
      <canvas ref="radCanvas" style="width: 100%; height: 150px"></canvas>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import EyeCalibrationSettings from '../../models/EyeCalibrationSettings'

const store = useStore()

// --- UI References ---
const radCanvas = ref(null)

// --- State Management ---
const radius = ref(20)

/**
 * Computed Property: Point Color
 * Syncs the calibration point color with the global store.
 * Updates the canvas preview immediately upon color change.
 */
const pointColor = computed({
  get: () => store.getters.test?.calibrationConfig?.pointColor ?? '#000000FF',
  set: (value) => {
    const calibrationConfig = new EyeCalibrationSettings({
      ...store.getters.test.calibrationConfig,
      pointColor: value,
    })
    store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)
    drawBall(radius.value, value)
  },
})

watch(radius, (newRadius) => {
  const calibrationConfig = new EyeCalibrationSettings({
    ...store.getters.test.calibrationConfig,
    radius: newRadius,
  })
  store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)
  drawBall(newRadius, pointColor.value)
})

// Watch for Color changes to re-draw the canvas
watch(pointColor, () => {
  drawBall(radius.value, pointColor.value)
})

/**
 * Canvas Rendering Logic:
 * Draws a dual-circle target on the canvas to represent the calibration point.
 * @param {number} r - The radius of the outer circle.
 * @param {string} color - The fill color for the outer circle.
 */
const drawBall = (r, color) => {
  if (!radCanvas.value) return
  const canvas = radCanvas.value
  const ctx = canvas.getContext('2d')

  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.beginPath()
  ctx.arc(centerX, centerY, r * 2, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()

  ctx.beginPath()
  ctx.arc(centerX, centerY, (r / 3) * 2, 0, 2 * Math.PI)
  ctx.fillStyle = 'red'
  ctx.fill()
  ctx.closePath()
}

// --- Lifecycle ---
onMounted(() => {
  radius.value = store.getters.test?.calibrationConfig?.radius ?? 20
  drawBall(radius.value, pointColor.value)
})
</script>
