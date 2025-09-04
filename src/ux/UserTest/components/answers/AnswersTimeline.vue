<template>
  <v-row class="mb-8">
    <v-col cols="12">
      <v-card class="pa-8 elevation-4 rounded-xl chart-card">
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
              variant="outlined"
              size="small"
              color="primary"
              @click="$emit('export')"
            >
              <v-icon start>
                mdi-download
              </v-icon>
              Export
            </v-btn>
            <v-btn
              variant="flat"
              size="small"
              color="primary"
              @click="$emit('refresh')"
            >
              <v-icon start>
                mdi-refresh
              </v-icon>
              Refresh
            </v-btn>
          </div>
        </div>
        <div class="chart-container-large">
          <DateChart :task-answers="taskAnswers" />
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import DateChart from '@/ux/UserTest/components/answers/DateChart.vue'

const props = defineProps({
    taskAnswers: { type: Array, default: () => [] }
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
