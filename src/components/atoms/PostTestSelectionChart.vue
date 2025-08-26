<template>
  <v-card class="pa-6 elevation-3 rounded-xl chart-card">
    <div class="mb-4">
      <h4 class="text-h6 font-weight-bold mb-2">{{ question.question }}</h4>
    </div>
    <div class="chart-container-small mb-4">
      <canvas :id="chartId" width="180" height="180"></canvas>
    </div>
    <div>
      <div v-for="(option, idx) in question.selectionFields" :key="option" class="d-flex align-center mb-1">
        <div
          :style="{ background: chartColors[idx % chartColors.length], width: '14px', height: '14px', borderRadius: '50%', marginRight: '8px' }">
        </div>
        <span>{{ option }} ({{ selectionCounts[option] || 0 }})</span>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';

const props = defineProps({
  question: { type: Object, required: true },
  answers: { type: Array, required: true },
  chartId: { type: String, required: true },
  chartColors: { type: Array, default: () => ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A', '#FF7043', '#26A69A', '#D4E157'] }
});

const selectionCounts = ref({});

const computeCounts = () => {
  const counts = {};
  if (!props.question) return counts;
  props.question.selectionFields.forEach(opt => { counts[opt] = 0; });
  props.answers.forEach(ans => {
    if (ans && ans.answer !== undefined) {
      const answer = ans.answer;
      if (Array.isArray(answer)) {
        answer.forEach(a => { if (counts[a] !== undefined) counts[a]++; });
      } else if (counts[answer] !== undefined) {
        counts[answer]++;
      }
    }
  });
  selectionCounts.value = counts;
};

const drawChart = () => {
  nextTick(() => {
    const q = props.question;
    if (!q) return;
    const canvas = document.getElementById(props.chartId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const total = Object.values(selectionCounts.value).reduce((a, b) => a + b, 0);
    if (!total) return;
    let start = -0.5 * Math.PI;
    q.selectionFields.forEach((opt, idx) => {
      const count = selectionCounts.value[opt] || 0;
      const angle = (count / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(90, 90);
      ctx.arc(90, 90, 80, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = props.chartColors[idx % props.chartColors.length];
      ctx.fill();
      start += angle;
    });
    // Círculo central blanco (donut)
    ctx.beginPath();
    ctx.arc(90, 90, 45, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
  });
};

watch(() => [props.question, props.answers], () => {
  computeCounts();
  drawChart();
}, { immediate: true, deep: true });
onMounted(() => {
  computeCounts();
  drawChart();
});
</script>

<style scoped>
.chart-container-small {
  height: 150px;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
