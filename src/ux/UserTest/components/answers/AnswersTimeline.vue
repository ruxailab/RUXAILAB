<template>
  <div :class="fillHeight ? 'h-100 w-100 flex-grow-1' : 'mb-8'">
    <v-card
      :class="[
        'pa-8',
        'elevation-4',
        'rounded-xl',
        'chart-card',
        { 'h-100': fillHeight },
      ]"
    >
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
            Answers Timeline
          </h3>
          <p class="text-body-1 text-medium-emphasis">
            Track your answer submissions over time
          </p>
        </div>
        <div class="d-flex ga-2">
          <v-btn
            v-if="showExport"
            variant="outlined"
            size="small"
            color="primary"
            @click="$emit('export')"
          >
            <v-icon start> mdi-download </v-icon>
            Export
          </v-btn>
          <v-btn
            variant="flat"
            size="small"
            color="primary"
            @click="$emit('refresh')"
          >
            <v-icon start> mdi-refresh </v-icon>
            Refresh
          </v-btn>
        </div>
      </div>
      <div class="chart-container-large">
        <DateChart :task-answers="taskAnswers" />
      </div>
    </v-card>
  </div>
</template>

<script setup>
import DateChart from '@/ux/UserTest/components/answers/DateChart.vue'

defineProps({
  taskAnswers: { type: Array, default: () => [] },
  showExport: { type: Boolean, default: true },
  fillHeight: { type: Boolean, default: false },
})

defineEmits(['refresh', 'export'])
</script>

<style scoped>
.chart-container-large {
  height: 400px;
  width: 100%;
  position: relative;
}

@media (max-width: 600px) {
  .chart-container-large {
    height: 300px;
  }
}
</style>
