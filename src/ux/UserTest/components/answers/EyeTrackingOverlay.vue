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
let rafId = null

function lerp(a, b, t) {
  return a + (b - a) * t
}

function findPointIndex(currentMs) {
  let left = 0
  let right = normalized.length - 1

  while (left <= right) {
    const mid = (left + right) >> 1

    if (normalized[mid].t <= currentMs) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return Math.max(0, Math.min(right, normalized.length - 1))
}

function drawFreeEye(cx, cy) {
  const W = canvas.value.width
  const H = canvas.value.height

  ctx.beginPath()
  ctx.arc(cx * W, cy * H, 8, 0, 2 * Math.PI)
  ctx.fillStyle = 'rgba(255,0,0,0.85)'
  ctx.fill()
}

function drawPrecisionPoints(cx, cy) {
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

  if (visiblePoints.length > 0) {
    const last = visiblePoints[visiblePoints.length - 1]
    ctx.moveTo(last.x * W, last.y * H)
    ctx.lineTo(cx * W, cy * H)
  }

  ctx.stroke()

  visiblePoints.forEach((p) => {
    ctx.beginPath()
    ctx.arc(p.x * W, p.y * H, 4, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(0,200,255,0.7)'
    ctx.fill()
  })

  // Current interpolated gaze head
  ctx.beginPath()
  ctx.arc(cx * W, cy * H, 7, 0, 2 * Math.PI)
  ctx.fillStyle = 'rgba(0,255,255,1)'
  ctx.fill()
}

function drawHeatmapPoint(x, y) {
  const radius = 24
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, 'rgba(255,0,0,0.06)')
  gradient.addColorStop(0.5, 'rgba(255,150,0,0.04)')
  gradient.addColorStop(1, 'rgba(255,255,0,0.001)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fill()
}

function drawHeatmap() {
  const W = canvas.value.width
  const H = canvas.value.height
  const visible = normalized.slice(0, i + 1)
  const step = Math.max(1, Math.floor(visible.length / 400))
  for (let idx = 0; idx < visible.length; idx += step) {
    drawHeatmapPoint(visible[idx].x * W, visible[idx].y * H)
  }
}

function renderFrame() {
  if (!ctx || !normalized.length || !canvas.value) return

  const video = props.videoRef
  const timeInSeconds =
    video && !video.paused ? video.currentTime : props.currentTime
  const currentMs = timeInSeconds * 1000

  i = findPointIndex(currentMs)

  const current = normalized[i]
  const next = normalized[i + 1] || current

  const duration = next.t - current.t
  const rawT = duration > 0 ? (currentMs - current.t) / duration : 0
  const t = Math.max(0, Math.min(1, rawT))

  const cx = lerp(current.x, next.x, t)
  const cy = lerp(current.y, next.y, t)

  const W = canvas.value.width
  const H = canvas.value.height
  ctx.clearRect(0, 0, W, H)

  if (props.viewMode === 'free') {
    drawFreeEye(cx, cy)
  } else if (props.viewMode === 'precision') {
    drawPrecisionPoints(cx, cy)
  } else {
    drawHeatmap()
  }
}

function startAnimationLoop() {
  if (rafId) return
  const loop = () => {
    renderFrame()
    if (props.isPlaying || (props.videoRef && !props.videoRef.paused)) {
      rafId = requestAnimationFrame(loop)
    } else {
      rafId = null
    }
  }
  rafId = requestAnimationFrame(loop)
}

function stopAnimationLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
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

  if (ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    renderFrame()
  }
}

onMounted(() => {
  ctx = canvas.value?.getContext ? canvas.value.getContext('2d') : null

  const video = props.videoRef
  if (!video) return

  if (typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(resizeCanvas)
    resizeObs.observe(video.parentElement || video)
  }

  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()

  if (props.isPlaying) {
    startAnimationLoop()
  } else {
    renderFrame()
  }
})

watch(
  () => props.predictedData,
  (val) => {
    if (!val?.length) {
      normalized = []
      if (ctx && canvas.value) {
        ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
      }
      return
    }

    const t0 = val[0].timestamp

    normalized = val.map((p) => {
      const rawX = p.predicted_x ?? p.x
      const rawY = p.predicted_y ?? p.y

      return {
        x: rawX / (p.screen_width || 1),
        y: rawY / (p.screen_height || 1),
        t: p.timestamp - t0,
      }
    })

    renderFrame()
  },
  { immediate: true },
)

watch(
  () => props.videoRef,
  (video) => {
    if (!video || !canvas.value) return

    resizeCanvas()

    if (resizeObs) resizeObs.disconnect()

    if (typeof ResizeObserver !== 'undefined') {
      resizeObs = new ResizeObserver(resizeCanvas)
      resizeObs.observe(video.parentElement || video)
    }
  },
  { immediate: true },
)

watch(
  () => props.currentTime,
  () => {
    if (!props.isPlaying) {
      renderFrame()
    }
  },
)

watch(
  () => props.isPlaying,
  (playing) => {
    if (playing) {
      startAnimationLoop()
    } else {
      stopAnimationLoop()
      renderFrame()
    }
  },
  { immediate: true },
)

watch(
  () => props.viewMode,
  () => {
    renderFrame()
  },
)

onBeforeUnmount(() => {
  stopAnimationLoop()
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
