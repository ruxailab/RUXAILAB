<template>
  <v-card v-if="test" class="pa-4" elevation="1">
    <!-- Header con icono a la izquierda y título -->
    <div class="d-flex align-center mb-4">
      <v-icon size="24" color="grey-darken-1" class="mr-3">mdi-account-group</v-icon>
      <h3 class="text-h6 text-grey-darken-1">Cooperators</h3>
    </div>
    
    <!-- Total cooperadores -->
    <div class="total-metric mb-4">
      <div class="metric-subtitle text-caption text-grey-darken-1">Total invited</div>
      <div class="metric-value text-h4 font-weight-bold">{{ totalInvited }}</div>
    </div>
    
    <!-- Métricas en dos columnas con igual importancia -->
    <div class="metrics-grid">
      <!-- Aceptados -->
      <div class="metric-item">
        <div class="d-flex align-center mb-2">
          <v-icon size="16" color="success" class="mr-2">mdi-check-circle</v-icon>
          <span class="metric-label text-caption text-grey-darken-1">Accepted</span>
        </div>
        <div class="d-flex align-center justify-center">
          <span class="metric-value-secondary text-h5 font-weight-bold text-success mr-2">{{ acceptedCount }}</span>
          <span class="metric-percentage text-caption text-success">{{ acceptedPercentage }}%</span>
        </div>
      </div>
      
      <!-- Pendientes -->
      <div class="metric-item">
        <div class="d-flex align-center mb-2">
          <v-icon size="16" color="warning" class="mr-2">mdi-clock-outline</v-icon>
          <span class="metric-label text-caption text-grey-darken-1">Pending</span>
        </div>
        <div class="d-flex align-center justify-center">
          <span class="metric-value-secondary text-h5 font-weight-bold text-warning mr-2">{{ pendingCount }}</span>
          <span class="metric-percentage text-caption text-warning">{{ pendingPercentage }}%</span>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  test: {
    type: Object,
    required: true
  }
})

// Computed properties
const cooperators = computed(() => props.test?.cooperators || [])

const acceptedCount = computed(() => 
  cooperators.value.filter(coop => coop?.accepted === true).length
)

const pendingCount = computed(() => 
  cooperators.value.filter(coop => coop?.invited === true && coop?.accepted !== true).length
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
</style>
