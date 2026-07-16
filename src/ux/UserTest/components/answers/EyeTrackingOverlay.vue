<template>
  <canvas ref="canvas" class="overlay-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({
  videoRef: { type: Object, required: true },
  predictedData: { type: Array, default: () => [] },
  isPlaying: { type: Boolean, default: false },
  viewMode: { type: String, default: 'precision' }, // 'free' | 'precision' | 'heatmap'
  currentTime: { type: Number, default: 0 },
})

const canvas = ref(null)
let ctx = null
let i = 0
let normalized = []
let resizeObs = null
let heatmapData = []

function lerp(a, b, t) {
  return a + (b - a) * t
}

function findPointIndex(currentMs) {
  let left = 0
  let right = normalized.length - 1

  while (left <= right) {
    const mid = (left + right) >> 1

    if (normalized[mid].t < currentMs) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return Math.max(0, right)
}

function drawFreeEye(cx, cy) {
  const W = canvas.value.width
  const H = canvas.value.height

  ctx.beginPath()
  ctx.arc(cx * W, cy * H, 8, 0, 2 * Math.PI)
  ctx.fillStyle = 'rgba(255,0,0,0.8)'
  ctx.fill()
}
function drawPrecisionPoints() {
  const W = canvas.value.width
  const H = canvas.value.height

  const visiblePoints = normalized.slice(0, i + 1)

  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(0,200,255,0.6)'
  ctx.beginPath()

  for (let j = 0; j < visiblePoints.length - 1; j++) {
    const a = visiblePoints[j]
    const b = visiblePoints[j + 1]

    ctx.moveTo(a.x * W, a.y * H)
    ctx.lineTo(b.x * W, b.y * H)
  }

  ctx.stroke()

  visiblePoints.forEach((p, idx) => {
    ctx.beginPath()

    ctx.arc(
      p.x * W,
      p.y * H,
      idx === visiblePoints.length - 1 ? 7 : 4,
      0,
      2 * Math.PI,
    )

    ctx.fillStyle =
      idx === visiblePoints.length - 1
        ? 'rgba(0,255,255,1)'
        : 'rgba(0,200,255,0.7)'

    ctx.fill()
  })
}

function drawHeatmapPoint(x, y) {
  const radius = 20
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, 'rgba(255,0,0,0.03)')
  gradient.addColorStop(0.6, 'rgba(255,150,0,0.06)')
  gradient.addColorStop(1, 'rgba(255,255,0,0.0012)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fill()
}

function drawHeatmap() {
  const W = canvas.value.width
  const H = canvas.value.height
  ctx.clearRect(0, 0, W, H)
  heatmapData.forEach((p) => drawHeatmapPoint(p.x * W, p.y * H))
}

async function resizeCanvas() {
  await nextTick()

  const video = props.videoRef
  if (!video || !canvas.value) return
  const rect = video.getBoundingClientRect()

  canvas.value.style.width = `${rect.width}px`
  canvas.value.style.height = `${rect.height}px`

  canvas.value.width = rect.width
  canvas.value.height = rect.height

  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')

  const video = props.videoRef
  if (!video) return

  resizeObs = new ResizeObserver(resizeCanvas)
  resizeObs.observe(video.parentElement)

  window.addEventListener('resize', resizeCanvas)

  resizeCanvas()
})

watch(
  () => props.predictedData,
  (val) => {
    if (!val?.length) return

    const t0 = val[0].timestamp

    normalized = val.map((p, idx) => {
      const rawX = p.predicted_x ?? p.x
      const rawY = p.predicted_y ?? p.y

      const norm = {
        x: rawX / (p.screen_width || 1),
        y: rawY / (p.screen_height || 1),
        t: p.timestamp - t0,
      }

      return norm
    })

    heatmapData = []
  },
  { immediate: true },
)

watch(
  () => props.videoRef,
  (video) => {
    if (!video || !canvas.value) return

    resizeCanvas()

    if (resizeObs) resizeObs.disconnect()

    resizeObs = new ResizeObserver(resizeCanvas)
    resizeObs.observe(video)
  },
  { immediate: true },
)

watch(
  () => props.currentTime,
  (time) => {
    if (!ctx || !normalized.length) return

    const currentMs = time * 1000

    i = findPointIndex(currentMs)

    const current = normalized[i]
    const next = normalized[i + 1] || current

    const duration = next.t - current.t

    const t = duration > 0 ? (currentMs - current.t) / duration : 0

    const cx = lerp(current.x, next.x, t)
    const cy = lerp(current.y, next.y, t)

    const W = canvas.value.width
    const H = canvas.value.height
    ctx.clearRect(0, 0, W, H)

    if (props.viewMode === 'free') {
      drawFreeEye(cx, cy)
    } else if (props.viewMode === 'precision') {
      drawPrecisionPoints()
    } else {
      heatmapData.push({ x: cx, y: cy })

      if (heatmapData.length > 5000) {
        heatmapData.shift()
      }

      drawHeatmap()
    }
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
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
