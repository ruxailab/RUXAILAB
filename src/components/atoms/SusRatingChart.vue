<template>
  <div class="rating-chart-container">
    <h3 class="text-h6 mb-4">
      Rating Categories
    </h3>
    <div class="distribution-chart">
      <div
        v-for="(item, index) in distributionData"
        :key="index"
        class="distribution-row"
      >
        <div class="d-flex align-center">
          <div
            class="rating-label"
            style="width: 80px;"
          >
            {{ item.label }}
          </div>
          <div class="flex-grow-1 mx-4">
            <div class="progress-container">
              <div
                class="progress-bar"
                :style="{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                  borderRadius: '20px',
                  height: '32px',
                  position: 'relative',
                  minWidth: item.count > 0 ? '40px' : '0px'
                }"
              >
                <span
                  v-if="item.count > 0"
                  class="progress-text"
                  style="
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                  "
                >
                  {{ item.count }}
                </span>
              </div>
            </div>
          </div>
          <div
            class="score-range text-caption text-grey"
            style="width: 60px; text-align: right;"
          >
            {{ item.range }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  scores: {
    type: Array,
    required: true
  }
})

const distributionData = computed(() => {
  const total = props.scores.length
  const ranges = [
    { label: 'Poor', range: '0-51', min: 0, max: 51, color: '#f44336' },
    { label: 'OK', range: '52-67', min: 52, max: 67, color: '#ff9800' },
    { label: 'Good', range: '68-83', min: 68, max: 83, color: '#2196f3' },
    { label: 'Excellent', range: '84-100', min: 84, max: 100, color: '#4caf50' }
  ]

  const maxCount = Math.max(
    ...ranges.map(range =>
      props.scores.filter(score => score >= range.min && score <= range.max).length
    )
  )

  return ranges.map(range => {
    const count = props.scores.filter(score => score >= range.min && score <= range.max).length
    return {
      ...range,
      count,
      percentage: maxCount > 0 ? (count / maxCount) * 100 : 0
    }
  })
})
</script>

<style scoped>
.rating-chart-container {
  min-height: 350px;
}
.distribution-chart {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 20px 0;
}
.distribution-row {
  margin-bottom: 20px;
}
.progress-container {
  background-color: #f5f5f5;
  border-radius: 20px;
  height: 32px;
  position: relative;
  overflow: hidden;
}
.progress-bar {
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>