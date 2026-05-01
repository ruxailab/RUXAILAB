<template>
  <v-card class="pa-6 elevation-3 rounded-xl chart-card">
    <div class="mb-4">
      <h4 class="text-h6 font-weight-bold mb-2">
        {{ questionTitle }}
      </h4>
    </div>
    <div class="chart-container-small mb-4">
      <canvas :id="canvasId" width="180" height="180" />
    </div>
    <div>
      <div
        v-for="(option, idx) in options"
        :key="option"
        class="d-flex align-center mb-1"
      >
        <div
          :style="{
            background: chartColors[idx % chartColors.length],
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            marginRight: '8px',
          }"
        />
        <span>
          {{ option }} ({{ counts[option] || 0 }})
          <template v-if="showPercentages">
            - {{ optionPercent(option) }}%
          </template>
        </span>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  questionTitle: String,
  options: Array,
  counts: Object,
  canvasId: String,
  chartColors: {
    type: Array,
    default: () => [
      '#42A5F5',
      '#66BB6A',
      '#FFA726',
      '#AB47BC',
      '#EC407A',
      '#FF7043',
      '#26A69A',
      '#D4E157',
    ],
  },
  showPercentages: {
    type: Boolean,
    default: false,
  },
})

const getTotal = () => Object.values(props.counts || {}).reduce((a, b) => a + b, 0)

const optionPercent = (option) => {
  const total = getTotal()
  if (!total) return '0.0'
  const value = props.counts?.[option] || 0
  return ((value * 100) / total).toFixed(1)
}

const drawPercentLabel = (ctx, option, startAngle, endAngle) => {
  const total = getTotal()
  if (!total) return

  const value = props.counts?.[option] || 0
  if (!value) return

  const percentage = (value * 100) / total
  if (percentage < 6) return

  const midAngle = (startAngle + endAngle) / 2
  const labelRadius = 62
  const x = 90 + Math.cos(midAngle) * labelRadius
  const y = 90 + Math.sin(midAngle) * labelRadius

  ctx.save()
  ctx.fillStyle = '#1f2937'
  ctx.font = '600 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${percentage.toFixed(0)}%`, x, y)
  ctx.restore()
}

const drawChart = () => {
  nextTick(() => {
    const canvas = document.getElementById(props.canvasId)
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const total = getTotal()
    if (!total) return
    let start = -0.5 * Math.PI
    props.options.forEach((opt, idx) => {
      const count = props.counts[opt] || 0
      const angle = (count / total) * 2 * Math.PI
      const end = start + angle
      ctx.beginPath()
      ctx.moveTo(90, 90)
      ctx.arc(90, 90, 80, start, end)
      ctx.closePath()
      ctx.fillStyle = props.chartColors[idx % props.chartColors.length]
      ctx.fill()

      if (props.showPercentages) {
        drawPercentLabel(ctx, opt, start, end)
      }

      start = end
    })
    // Círculo central blanco (donut)
    ctx.beginPath()
    ctx.arc(90, 90, 45, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
  })
}

watch(() => [props.options, props.counts], drawChart, {
  immediate: true,
  deep: true,
})
onMounted(drawChart)
</script>

<style scoped>
.chart-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.chart-container-small {
  height: 150px;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
