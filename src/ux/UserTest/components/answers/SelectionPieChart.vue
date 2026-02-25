<template>
  <v-card class="pa-6 elevation-3 rounded-xl chart-card">
    <div class="mb-4 d-flex justify-space-between align-center">
      <h4 class="font-weight-bold mb-2">
        {{ questionTitle }}
      </h4>
      <v-menu>
        <template #activator="{ props: menuProps }">
          <v-btn
            icon="mdi-dots-vertical"
            size="small"
            variant="text"
            v-bind="menuProps"
          />
        </template>
        <v-list>
          <v-list-item @click="downloadChart">
            <template #prepend>
              <v-icon>mdi-download</v-icon>
            </template>
            <v-list-item-title>Download as PNG</v-list-item-title>
          </v-list-item>
          <v-list-item @click="openLatexModal">
            <template #prepend>
              <v-icon>mdi-code-braces</v-icon>
            </template>
            <v-list-item-title>Copy LaTeX</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
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
        <span>{{ option }} ({{ counts[option] || 0 }})</span>
      </div>
    </div>
    <LaTeXExportModal 
      v-model="showLatexModal" 
      :question-title="questionTitle" 
      :options="options" 
      :counts="counts" 
      :colors="chartColors" 
    />
  </v-card>
</template>

<script setup>
import { onMounted, watch, nextTick, ref } from 'vue'
import LaTeXExportModal from '../modals/LaTeXExportModal.vue'

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
})

const showLatexModal = ref(false)

const openLatexModal = () => {
  showLatexModal.value = true
}

const drawChart = () => {
  nextTick(() => {
    const canvas = document.getElementById(props.canvasId)
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const total = Object.values(props.counts).reduce((a, b) => a + b, 0)
    if (!total) return
    let start = -0.5 * Math.PI
    props.options.forEach((opt, idx) => {
      const count = props.counts[opt] || 0
      const angle = (count / total) * 2 * Math.PI
      ctx.beginPath()
      ctx.moveTo(90, 90)
      ctx.arc(90, 90, 80, start, start + angle)
      ctx.closePath()
      ctx.fillStyle = props.chartColors[idx % props.chartColors.length]
      ctx.fill()
      start += angle
    })
    // Círculo central blanco (donut)
    ctx.beginPath()
    ctx.arc(90, 90, 45, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
  })
}

const downloadChart = () => {
  const canvas = document.getElementById(props.canvasId)
  if (!canvas) return

  // Calculate dimensions for the combined image
  const legendHeight = props.options.length * 25 + 40 // Each legend item ~25px + padding
  const totalHeight = canvas.height + legendHeight
  const totalWidth = Math.max(canvas.width, 400)

  // Create a temporary canvas with white background
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = totalWidth
  tempCanvas.height = totalHeight
  const tempCtx = tempCanvas.getContext('2d')

  // Fill white background
  tempCtx.fillStyle = '#ffffff'
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

  // Redraw the pie chart with percentages
  const chartX = (totalWidth - canvas.width) / 2
  const centerX = chartX + canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(canvas.width, canvas.height) / 2 - 10

  // Calculate total
  const total = props.options.reduce(
    (sum, option) => sum + (props.counts[option] || 0),
    0,
  )

  let startAngle = -Math.PI / 2

  props.options.forEach((option, idx) => {
    const count = props.counts[option] || 0
    const sliceAngle = (count / total) * 2 * Math.PI
    const endAngle = startAngle + sliceAngle

    // Draw slice
    tempCtx.beginPath()
    tempCtx.moveTo(centerX, centerY)
    tempCtx.arc(centerX, centerY, radius, startAngle, endAngle)
    tempCtx.closePath()
    tempCtx.fillStyle = props.chartColors[idx % props.chartColors.length]
    tempCtx.fill()
    tempCtx.strokeStyle = '#ffffff'
    tempCtx.lineWidth = 2
    tempCtx.stroke()

    // Calculate percentage and position for label
    const percentage = ((count / total) * 100).toFixed(1)
    if (percentage > 3) {
      // Only show percentage if slice is large enough
      const middleAngle = startAngle + sliceAngle / 2
      const textRadius = radius * 0.7
      const textX = centerX + Math.cos(middleAngle) * textRadius
      const textY = centerY + Math.sin(middleAngle) * textRadius

      // Draw percentage text
      tempCtx.fillStyle = '#ffffff'
      tempCtx.font = 'bold 16px Arial'
      tempCtx.textAlign = 'center'
      tempCtx.textBaseline = 'middle'
      tempCtx.fillText(`${percentage}%`, textX, textY)
    }

    startAngle = endAngle
  })

  // Draw legend
  const legendY = canvas.height + 20
  const legendX = 30

  tempCtx.font = '14px Arial'
  tempCtx.textAlign = 'left'

  props.options.forEach((option, idx) => {
    const y = legendY + idx * 25

    // Draw colored circle
    tempCtx.beginPath()
    tempCtx.arc(legendX, y, 7, 0, 2 * Math.PI)
    tempCtx.fillStyle = props.chartColors[idx % props.chartColors.length]
    tempCtx.fill()

    // Draw text
    tempCtx.fillStyle = '#000000'
    const count = props.counts[option] || 0
    tempCtx.fillText(`${option} (${count})`, legendX + 20, y + 5)
  })

  // Convert to PNG and download
  tempCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const fileName = props.questionTitle
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .substring(0, 50)
    link.download = `chart_${fileName}_${Date.now()}.png`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  })
}

const wrapText = (ctx, text, maxWidth) => {
  const words = text.split(' ')
  const lines = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const width = ctx.measureText(currentLine + ' ' + word).width
    if (width < maxWidth) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)
  return lines
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
