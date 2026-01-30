<template>
  <v-card v-if="test" class="pa-4 mb-6" elevation="1">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">{{ $t('manager.progressCharts') }}</h3>
      <v-btn-toggle v-model="selectedChart" mandatory density="compact">
        <v-btn size="small" value="completion">{{
          $t('manager.completion')
        }}</v-btn>
        <v-btn size="small" value="heuristics">{{
          $t('manager.heuristics')
        }}</v-btn>
      </v-btn-toggle>
    </div>

    <!-- Gráfico de Completación -->
    <div v-if="selectedChart === 'completion'" class="chart-container">
      <h4 class="text-subtitle-1 mb-3">
        {{ $t('manager.completionProgress') }}
      </h4>
      <div class="progress-chart">
        <div
          v-for="(segment, index) in completionSegments"
          :key="index"
          class="progress-segment"
          :style="{
            width: `${segment.percentage}%`,
            backgroundColor: segment.color,
            opacity: segment.opacity,
          }"
          :title="segment.tooltip"
        ></div>
      </div>
      <div class="chart-legend mt-3">
        <div
          v-for="(legend, index) in completionLegend"
          :key="index"
          class="legend-item"
        >
          <div
            class="legend-color"
            :style="{ backgroundColor: legend.color }"
          ></div>
          <span class="legend-text"
            >{{ legend.label }} ({{ legend.count }})</span
          >
        </div>
      </div>
    </div>

    <!-- Gráfico de Heurísticas -->
    <div v-if="selectedChart === 'heuristics'" class="chart-container">
      <h4 class="text-subtitle-1 mb-3">
        {{ $t('manager.heuristicsProgress') }}
      </h4>
      <div class="heuristics-chart">
        <div
          v-for="heuristic in heuristicProgress"
          :key="heuristic.id"
          class="heuristic-bar-container mb-3"
        >
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="heuristic-label">{{ heuristic.name }}</span>
            <span class="heuristic-percentage"
              >{{ heuristic.percentage }}%</span
            >
          </div>
          <v-progress-linear
            :model-value="heuristic.percentage"
            :color="getHeuristicColor(heuristic.percentage)"
            height="8"
            rounded
          ></v-progress-linear>
          <div class="heuristic-details mt-1">
            <small class="text-grey-darken-1">
              {{ heuristic.completed }} de {{ heuristic.total }} evaluados
            </small>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
})

// State
const selectedChart = ref('completion')

// Computed properties
const completionStats = computed(() => {
  if (!props.test?.cooperators)
    return { completed: 0, inProgress: 0, notStarted: 0 }

  const stats = { completed: 0, inProgress: 0, notStarted: 0 }

  props.test.cooperators.forEach((coop) => {
    if (coop.progress === 100) {
      stats.completed++
    } else if (coop.progress > 0) {
      stats.inProgress++
    } else {
      stats.notStarted++
    }
  })

  return stats
})

const completionSegments = computed(() => {
  const total = props.test?.cooperators?.length || 0
  if (total === 0) return []

  const stats = completionStats.value

  return [
    {
      percentage: (stats.completed / total) * 100,
      color: '#4CAF50',
      opacity: 1,
      tooltip: `${stats.completed} completados`,
    },
    {
      percentage: (stats.inProgress / total) * 100,
      color: '#FF9800',
      opacity: 1,
      tooltip: `${stats.inProgress} en progreso`,
    },
    {
      percentage: (stats.notStarted / total) * 100,
      color: '#E0E0E0',
      opacity: 1,
      tooltip: `${stats.notStarted} sin empezar`,
    },
  ].filter((segment) => segment.percentage > 0)
})

const completionLegend = computed(() => {
  const stats = completionStats.value

  return [
    { label: 'Completados', count: stats.completed, color: '#4CAF50' },
    { label: 'En Progreso', count: stats.inProgress, color: '#FF9800' },
    { label: 'Sin Empezar', count: stats.notStarted, color: '#E0E0E0' },
  ].filter((item) => item.count > 0)
})

const heuristicProgress = computed(() => {
  if (!props.test?.heuristics) return []

  return props.test.heuristics.map((heuristic) => {
    const totalEvaluators = props.test?.cooperators?.length || 0
    const completed =
      props.test?.cooperators?.filter(
        (coop) =>
          coop.progress === 100 ||
          (coop.heuristicAnswers && coop.heuristicAnswers[heuristic.id]),
      ).length || 0

    return {
      id: heuristic.id,
      name: heuristic.name || `Heurística ${heuristic.id}`,
      completed,
      total: totalEvaluators,
      percentage:
        totalEvaluators > 0
          ? Math.round((completed / totalEvaluators) * 100)
          : 0,
    }
  })
})

// Methods
const getHeuristicColor = (percentage) => {
  if (percentage >= 80) return 'success'
  if (percentage >= 50) return 'warning'
  return 'error'
}
</script>

<style scoped>
.chart-container {
  min-height: 200px;
}

.progress-chart {
  display: flex;
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.progress-segment {
  transition: all 0.3s ease;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-text {
  font-size: 0.875rem;
}

.heuristics-chart {
  max-height: 300px;
  overflow-y: auto;
}

.heuristic-bar-container {
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.heuristic-label {
  font-weight: 500;
  font-size: 0.875rem;
}

.heuristic-percentage {
  font-weight: 600;
  font-size: 0.875rem;
}

.heuristic-details {
  font-size: 0.75rem;
}
</style>
