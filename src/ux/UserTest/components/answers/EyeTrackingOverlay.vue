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
let animationFrame = null
let i = 0
let tStart = null
let normalized = []
let resizeObs = null
let heatmapData = []

const DURATION = 450
const FREE_TRAIL_LENGTH = 20
const FADE_WINDOW = 40

function lerp(a, b, t) {
  return a + (b - a) * t
}

function drawFreeEye(cx, cy, opacity = 1) {
  ctx.beginPath()
  ctx.arc(cx * canvas.value.width, cy * canvas.value.height, 8, 0, 2 * Math.PI)
  ctx.fillStyle = `rgba(255, 0, 0, ${(opacity * 0.8).toFixed(2)})`
  ctx.fill()
}

function drawPrecisionPoints(cx, cy) {
  // Draw path segments with per-segment opacity fade (newer = brighter)
  for (let j = 0; j < i; j++) {
    const a = normalized[j]
    const b = normalized[j + 1] || a
    const age = i - j
    const opacity =
      age <= FADE_WINDOW ? Math.max(0.08, 1 - age / FADE_WINDOW) : 0.08
    ctx.lineWidth = 2
    ctx.strokeStyle = `rgba(0, 200, 255, ${opacity.toFixed(2)})`
    ctx.beginPath()
    ctx.moveTo(a.x * canvas.value.width, a.y * canvas.value.height)
    ctx.lineTo(b.x * canvas.value.width, b.y * canvas.value.height)
    ctx.stroke()
  }

  // Live segment from last known point to current interpolated position
  if (normalized[i]) {
    const prev = normalized[i]
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(0, 200, 255, 1.0)'
    ctx.beginPath()
    ctx.moveTo(prev.x * canvas.value.width, prev.y * canvas.value.height)
    ctx.lineTo(cx * canvas.value.width, cy * canvas.value.height)
    ctx.stroke()
  }

  // Dots: faded for older points, bright for current
  normalized.slice(0, i + 1).forEach((p, idx) => {
    const age = i - idx
    const opacity =
      age <= FADE_WINDOW ? Math.max(0.15, 1 - age / FADE_WINDOW) : 0.15
    ctx.beginPath()
    ctx.arc(
      p.x * canvas.value.width,
      p.y * canvas.value.height,
      idx === i ? 7 : 4,
      0,
      2 * Math.PI,
    )
    ctx.fillStyle =
      idx === i
        ? 'rgba(0, 255, 255, 1)'
        : `rgba(0, 200, 255, ${opacity.toFixed(2)})`
    ctx.fill()
  })

  // White cursor at live interpolated position
  ctx.beginPath()
  ctx.arc(cx * canvas.value.width, cy * canvas.value.height, 6, 0, 2 * Math.PI)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.fill()
}

function drawHeatmapPoint(x, y) {
  const radius = 60
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, 'rgba(255, 0,   0,   0.35)')
  gradient.addColorStop(0.4, 'rgba(255, 80,  0,   0.20)')
  gradient.addColorStop(0.7, 'rgba(255, 200, 0,   0.10)')
  gradient.addColorStop(1, 'rgba(255, 255, 0,   0.00)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fill()
}

function drawHeatmap() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  heatmapData.forEach((p) =>
    drawHeatmapPoint(p.x * canvas.value.width, p.y * canvas.value.height),
  )
}

function animateSmooth(timestamp) {
  if (!ctx || !normalized.length) return
  if (!tStart) tStart = timestamp
  const current = normalized[i]
  const next = normalized[i + 1] || normalized[0]
  const t = Math.min((timestamp - tStart) / DURATION, 1)
  const cx = lerp(current.x, next.x, t)
  const cy = lerp(current.y, next.y, t)

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  if (props.viewMode === 'free') drawFreeEye(cx, cy)
  else if (props.viewMode === 'precision') drawPrecisionPoints(cx, cy)
  else if (props.viewMode === 'heatmap') {
    heatmapData.push({ x: cx, y: cy })
    drawHeatmap()
  }

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

  const wrapper = video.parentElement
  const rect = wrapper.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  canvas.value.style.width = `${rect.width}px`
  canvas.value.style.height = `${rect.height}px`

  canvas.value.width = rect.width * dpr
  canvas.value.height = rect.height * dpr

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  console.log(
    dpr,
    rect.width,
    rect.height,
    canvas.value.width,
    canvas.value.height,
  )
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  const video = props.videoRef?.value
  if (video) {
    resizeCanvas()
    resizeObs = new ResizeObserver(resizeCanvas)
    resizeObs.observe(video.parentElement)
  }
  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()
})

watch(
  () => props.predictedData,
  (val) => {
    if (!val?.length) return

    console.log('[Overlay] typeof:', typeof val, 'Array?', Array.isArray(val))

    const t0 = val[0].timestamp // timestamp inicial absoluto
    normalized = val.map((p) => ({
      x: (p.predicted_x ?? p.x) / (p.screen_width || 1),
      y: (p.predicted_y ?? p.y) / (p.screen_height || 1),
      t: p.timestamp - t0, // tempo relativo em ms
    }))

    heatmapData = []
    console.log(
      '[Overlay] Normalização concluída:',
      normalized.length,
      'pontos. Último t =',
      normalized.at(-1)?.t,
    )
  },
  { immediate: true },
)

watch(
  () => props.isPlaying,
  (playing) => {
    if (!ctx) return
    cancelAnimationFrame(animationFrame)
    tStart = null
    if (playing) animationFrame = requestAnimationFrame(animateSmooth)
  },
)

watch(
  () => props.currentTime,
  (time) => {
    if (!ctx || !normalized.length) return

    const currentMs = time * 1000
    const nextIdx = normalized.findIndex((p) => p.t > currentMs)
    i = nextIdx === -1 ? normalized.length - 1 : Math.max(0, nextIdx - 1)

    console.log(
      '[Overlay] currentTime →',
      time.toFixed(2),
      's | currentMs =',
      currentMs,
      '| index =',
      i,
    )

    // Loga o timestamp real do ponto
    const currentPoint = props.predictedData[i]
    if (currentPoint) {
      console.log('[Overlay] ponto atual:', {
        timestamp: currentPoint.timestamp,
        x: currentPoint.predicted_x,
        y: currentPoint.predicted_y,
      })
    } else {
      console.warn('[Overlay] Nenhum ponto encontrado pra esse tempo!')
    }

    const visiblePoints = normalized.slice(0, i + 1)
    console.log('[Overlay] total de pontos desenhados:', visiblePoints.length)

    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    if (props.viewMode === 'free') {
      const trail = visiblePoints.slice(-FREE_TRAIL_LENGTH)
      trail.forEach((p, idx) => {
        const opacity = (idx + 1) / trail.length
        drawFreeEye(p.x, p.y, opacity)
      })
    } else if (props.viewMode === 'precision') {
      drawPrecisionPoints(normalized[i].x, normalized[i].y)
    } else if (props.viewMode === 'heatmap') {
      heatmapData = visiblePoints
      drawHeatmap()
    }
  },
)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
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
