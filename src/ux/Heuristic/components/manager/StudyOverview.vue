<template>
  <div v-if="test">
    <v-row class="mb-6">
      <!-- Card 1: Participantes -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 text-center" elevation="1">
          <v-icon size="32" color="primary" class="mb-2"
            >mdi-account-group</v-icon
          >
          <div class="metric-value text-h4 mb-1">{{ participantsCount }}</div>
          <div class="metric-label text-body-2 text-grey-darken-1">
            {{ $t('Dashboard.stats.participants') }}
          </div>
        </v-card>
      </v-col>

      <!-- Card 2: Completación -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 text-center" elevation="1">
          <v-icon size="32" color="success" class="mb-2">mdi-chart-line</v-icon>
          <div class="metric-value text-h4 mb-1">{{ completionRate }}%</div>
          <div class="metric-label text-body-2 text-grey-darken-1">
            {{ $t('Dashboard.stats.completion') }}
          </div>
        </v-card>
      </v-col>

      <!-- Card 3: Días Activos -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 text-center" elevation="1">
          <v-icon size="32" color="warning" class="mb-2"
            >mdi-calendar-clock</v-icon
          >
          <div class="metric-value text-h4 mb-1">{{ daysActive }}</div>
          <div class="metric-label text-body-2 text-grey-darken-1">
            {{ $t('Dashboard.stats.daysActive') }}
          </div>
        </v-card>
      </v-col>
      <!-- Card 4: Heurísticas -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4 text-center" elevation="1">
          <v-icon size="32" color="info" class="mb-2"
            >mdi-format-list-checks</v-icon
          >
          <div class="metric-value text-h4 mb-1">{{ heuristicsCount }}</div>
          <div class="metric-label text-body-2 text-grey-darken-1">
            {{ $t('Dashboard.stats.heuristics') }}
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { differenceInDays } from 'date-fns'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
})

// Computed properties
const participantsCount = computed(() => props.test?.cooperators?.length || 0)

const completionRate = computed(() => {
  if (!props.test?.cooperators?.length) return 0
  const completed = props.test.cooperators.filter(
    (c) => c?.progress === 100,
  ).length
  return Math.round((completed / props.test.cooperators.length) * 100)
})

const daysActive = computed(() => {
  if (!props.test?.creationDate) return 0
  return differenceInDays(new Date(), new Date(props.test.creationDate))
})

const heuristicsCount = computed(() => props.test?.testStructure?.length || 0)
</script>

<style scoped>
.metric-value {
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.metric-label {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}
</style>
