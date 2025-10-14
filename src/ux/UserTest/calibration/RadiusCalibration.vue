<template>
    <v-row class="d-flex align-center">
        <v-col cols="10">
            <v-slider v-model="radius" :min="10" :max="35" label="Radius" />
        </v-col>
        <v-col cols="2" style="max-width: 100%; max-height: 100%; display: flex; align-items: stretch;">
            <canvas ref="radCanvas" style="width: 100%; height: 100%;"></canvas>
        </v-col>
    </v-row>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import EyeCalibrationSettings from '../models/EyeCalibrationSettings'

const store = useStore()
const radCanvas = ref(null)

const radius = ref(20)

const pointColor = computed({
    get: () => store.getters.test.calibrationConfig.pointColor ?? '#000000FF',
    set: (value) => {
        const calibrationConfig = new EyeCalibrationSettings({
            ...store.getters.test.calibrationConfig,
            pointColor: value
        })
        store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)
        drawBall(radius.value, value)
    }
})

watch(radius, (newRadius) => {
    const calibrationConfig = new EyeCalibrationSettings({
        ...store.getters.test.calibrationConfig,
        radius: newRadius
    })
    store.commit('SET_CALIBRATION_CONFIG', calibrationConfig)
    drawBall(newRadius, pointColor.value)
})

watch(pointColor, (newColor) => {
    drawBall(radius.value, newColor)
})

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

onMounted(() => {
    radius.value = store.getters.test.calibrationConfig.radius ?? 20
    drawBall(radius.value, pointColor.value)
})
</script>