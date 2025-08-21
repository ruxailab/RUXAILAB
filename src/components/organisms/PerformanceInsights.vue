<template>
  <div class="performance-insights">
    <!-- Key Metrics -->
    <div class="metrics-grid mb-4">
      <div class="metric-card">
        <div class="metric-value">
          {{ insights.averageCompletionRate }}%
        </div>
        <div class="metric-label">
          Completion Rate
        </div>
        <div class="metric-indicator">
          <v-progress-circular
            :model-value="insights.averageCompletionRate"
            size="40"
            width="4"
            color="success"
          />
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-value">
          {{ insights.averageTaskSuccess }}%
        </div>
        <div class="metric-label">
          Task Success
        </div>
        <div class="metric-indicator">
          <v-progress-circular
            :model-value="insights.averageTaskSuccess"
            size="40"
            width="4"
            color="primary"
          />
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-value">
          {{ insights.participantSatisfaction }}/5
        </div>
        <div class="metric-label">
          Satisfaction
        </div>
        <div class="metric-indicator">
          <div class="satisfaction-stars">
            <v-icon
              v-for="i in 5"
              :key="i"
              :icon="i <= Math.round(insights.participantSatisfaction) ? 'mdi-star' : 'mdi-star-outline'"
              size="12"
              :color="i <= Math.round(insights.participantSatisfaction) ? 'amber' : 'grey-lighten-1'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Trends Chart -->
    <div class="trends-section">
      <h4 class="text-subtitle-2 font-weight-medium text-grey-darken-4 mb-3">
        3-Month Trend
      </h4>

      <div class="trends-chart">
        <div
          v-for="trend in insights.trendsData"
          :key="trend.month"
          class="trend-bar"
        >
          <div class="trend-values">
            <div class="completion-bar">
              <div
                class="bar-fill"
                :style="{ height: `${trend.completionRate}%` }"
              />
            </div>
            <div class="satisfaction-indicator">
              <v-icon
                icon="mdi-circle"
                size="8"
                :color="getSatisfactionColor(trend.satisfaction)"
              />
            </div>
          </div>
          <div class="trend-label">
            {{ trend.month }}
          </div>
        </div>
      </div>

      <div class="legend mt-3">
        <div class="legend-item">
          <div
            class="legend-color"
            style="background-color: rgb(var(--v-theme-primary))"
          />
          <span class="text-caption">Completion Rate</span>
        </div>
        <div class="legend-item">
          <v-icon
            icon="mdi-circle"
            size="8"
            color="amber"
            class="mr-1"
          />
          <span class="text-caption">Satisfaction</span>
        </div>
      </div>
    </div>

    <!-- Quick Recommendations -->
    <div class="recommendations mt-4">
      <h4 class="text-subtitle-2 font-weight-medium text-grey-darken-4 mb-2">
        Quick Insights
      </h4>
      <v-alert
        type="info"
        variant="tonal"
        density="compact"
        class="mb-2"
      >
        <template #prepend>
          <v-icon icon="mdi-lightbulb-outline" />
        </template>
        Your completion rates are trending upward! Keep up the good work.
      </v-alert>
      <v-alert
        type="warning"
        variant="tonal"
        density="compact"
      >
        <template #prepend>
          <v-icon icon="mdi-chart-line-variant" />
        </template>
        Consider reviewing studies with &lt;75% completion rates.
      </v-alert>
    </div>
  </div>
</template>

<script setup>
defineProps({
  insights: {
      type: Object,
      required: true
  }
})

const getSatisfactionColor = (satisfaction) => {
  if (satisfaction >= 4.0) return 'success'
  if (satisfaction >= 3.0) return 'amber'
  return 'error'
}
</script>

<style scoped>
.metrics-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
}

.metric-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border-left: 3px solid rgb(var(--v-theme-primary));
}

.metric-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface));
}

.metric-label {
    font-size: 0.75rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 2px;
}

.satisfaction-stars {
    display: flex;
    gap: 1px;
}

.trends-chart {
    display: flex;
    align-items: end;
    justify-content: space-between;
    height: 80px;
    padding: 8px 0;
    border-bottom: 1px solid #e0e0e0;
}

.trend-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
}

.trend-values {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 60px;
    position: relative;
}

.completion-bar {
    width: 8px;
    height: 50px;
    background-color: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
}

.bar-fill {
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: rgb(var(--v-theme-primary));
    border-radius: 4px;
    transition: height 0.3s ease;
}

.satisfaction-indicator {
    margin-top: 4px;
}

.trend-label {
    font-size: 0.7rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 4px;
}

.legend {
    display: flex;
    gap: 16px;
    justify-content: center;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.legend-color {
    width: 8px;
    height: 8px;
    border-radius: 2px;
}
</style>