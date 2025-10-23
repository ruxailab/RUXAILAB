<template>
    <canvas ref="canvas" class="overlay-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue"

const props = defineProps({
    videoRef: { type: Object, required: true },
    predictedData: { type: Array, default: () => [] },
    isPlaying: { type: Boolean, default: false }
})

const canvas = ref(null)
let ctx = null
let animationFrame = null
let i = 0
let tStart = null
let normalized = []
let resizeObs = null

const DURATION = 350

function lerp(a, b, t) { return a + (b - a) * t }

function drawPoint(x, y) {
    ctx.beginPath()
    ctx.arc(x * canvas.value.width, y * canvas.value.height, 8, 0, 2 * Math.PI)
    ctx.fillStyle = "rgba(255,0,0,0.8)"
    ctx.fill()
}

function animateSmooth(timestamp) {
    if (!normalized.length) return
    if (!tStart) tStart = timestamp
    const current = normalized[i]
    const next = normalized[i + 1] || normalized[0]
    const t = Math.min((timestamp - tStart) / DURATION, 1)

    const cx = lerp(current.x, next.x, t)
    const cy = lerp(current.y, next.y, t)

    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
    drawPoint(cx, cy)

    if (t >= 1) {
        i = (i + 1) % normalized.length
        tStart = timestamp
    }

    if (props.isPlaying) animationFrame = requestAnimationFrame(animateSmooth)
}

async function resizeCanvas() {
    await nextTick()
    const video = props.videoRef?.value
    if (!video || !canvas.value) return

    // ⚠️ Usar o wrapper do vídeo, não o <video> diretamente
    const wrapper = video.parentElement
    const rect = wrapper.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    // Estilo (CSS pixels)
    canvas.value.style.width = `${rect.width}px`
    canvas.value.style.height = `${rect.height}px`

    // Buffer interno (device pixels)
    canvas.value.width = Math.round(rect.width * dpr)
    canvas.value.height = Math.round(rect.height * dpr)

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

onMounted(() => {
    ctx = canvas.value.getContext("2d")
    const video = props.videoRef?.value

    // Observa o wrapper (mantém em sync com layout Vuetify)
    if (video) {
        const wrapper = video.parentElement
        resizeCanvas()
        resizeObs = new ResizeObserver(resizeCanvas)
        resizeObs.observe(wrapper)
    }

    window.addEventListener("resize", resizeCanvas)
})

watch(() => props.predictedData, (val) => {
    if (!val || !val.length) return
    normalized = val.map(p => ({
        x: (p.predicted_x ?? p.x) / (p.screen_width || 1),
        y: (p.predicted_y ?? p.y) / (p.screen_height || 1)
    }))
}, { immediate: true })

watch(() => props.isPlaying, (playing) => {
    if (playing) {
        cancelAnimationFrame(animationFrame)
        tStart = null
        animationFrame = requestAnimationFrame(animateSmooth)
    } else {
        cancelAnimationFrame(animationFrame)
        tStart = null
    }
})

onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrame)
    window.removeEventListener("resize", resizeCanvas)
    if (resizeObs) resizeObs.disconnect()
})
</script>

<style scoped>
.overlay-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 999;
}
</style>
