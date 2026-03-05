<template>
  <v-card v-if="test" class="pa-4 mb-0" elevation="3" rounded="lg">
    <!-- Header con icono a la izquierda y título -->
    <div
      class="d-flex align-center mb-4 clickable-header"
      @click="navigateToCooperators"
    >
      <v-icon size="24" color="primary" class="header-icon"
        >mdi-account-group</v-icon
      >
      <v-card-title class="text-h6 text-primary clickable-title">{{
        $t('Dashboard.cards.cooperators')
      }}</v-card-title>
    </div>

    <!-- Total cooperadores -->
    <div class="total-metric mb-4">
      <div class="metric-subtitle text-caption text-grey-darken-1">
        {{ $t('Dashboard.cards.totalInvited') }}
      </div>
      <div class="metric-value text-h4 font-weight-bold">
        {{ totalInvited }}
      </div>
    </div>

    <!-- Métricas en dos columnas con igual importancia -->
    <div class="metrics-grid">
      <!-- Aceptados -->
      <div class="metric-item">
        <div class="d-flex align-center mb-2">
          <v-icon size="16" color="success" class="mr-2"
            >mdi-check-circle</v-icon
          >
          <span class="metric-label text-caption text-grey-darken-1">{{
            $t('Dashboard.cards.accepted')
          }}</span>
        </div>
        <div class="d-flex align-center justify-center">
          <span
            class="metric-value-secondary text-h5 font-weight-bold text-success mr-2"
            >{{ acceptedCount }}</span
          >
          <span class="metric-percentage text-caption text-success"
            >{{ acceptedPercentage }}%</span
          >
        </div>
      </div>

      <!-- Pendientes -->
      <div class="metric-item">
        <div class="d-flex align-center mb-2">
          <v-icon size="16" color="warning" class="mr-2"
            >mdi-clock-outline</v-icon
          >
          <span class="metric-label text-caption text-grey-darken-1">{{
            $t('Dashboard.cards.pending')
          }}</span>
        </div>
        <div class="d-flex align-center justify-center">
          <span
            class="metric-value-secondary text-h5 font-weight-bold text-warning mr-2"
            >{{ pendingCount }}</span
          >
          <span class="metric-percentage text-caption text-warning"
            >{{ pendingPercentage }}%</span
          >
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
})

const router = useRouter()

// Navigate to cooperators section
const navigateToCooperators = () => {
  if (props.test?.id) {
    router.push(`/heuristic/cooperators/${props.test.id}`)
  }
}

// Computed properties
const cooperators = computed(() => props.test?.cooperators || [])

const acceptedCount = computed(
  () => cooperators.value.filter((coop) => coop?.accepted === true).length,
)

const pendingCount = computed(
  () =>
    cooperators.value.filter(
      (coop) => coop?.invited === true && coop?.accepted !== true,
    ).length,
)

const totalInvited = computed(() => cooperators.value.length)

const acceptedPercentage = computed(() => {
  if (totalInvited.value === 0) return 0
  return Math.round((acceptedCount.value / totalInvited.value) * 100)
})

const pendingPercentage = computed(() => {
  if (totalInvited.value === 0) return 0
  return Math.round((pendingCount.value / totalInvited.value) * 100)
})
</script>

<style scoped>
.total-metric {
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 16px;
}

.metric-subtitle {
  margin-bottom: 8px;
}

.metric-value {
  line-height: 1;
  margin-bottom: 4px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding-top: 16px;
}

.metric-item {
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.metric-label {
  font-weight: 500;
}

.metric-value-secondary {
  line-height: 1;
  margin-bottom: 4px;
}

.metric-percentage {
  font-weight: 500;
}

.clickable-header {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-header:hover .header-icon {
  color: rgb(var(--v-theme-secondary)) !important;
}

.clickable-header:hover .clickable-title {
  color: rgb(var(--v-theme-secondary)) !important;
}

.header-icon {
  transition: color 0.2s ease;
}

.clickable-title {
  transition: color 0.2s ease;
}
</style>
