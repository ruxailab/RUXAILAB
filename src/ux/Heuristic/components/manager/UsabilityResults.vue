<template>
  <v-card v-if="test" class="pa-4" elevation="1">
    <!-- Header con icono a la izquierda y título -->
    <div class="d-flex align-center mb-4">
      <v-icon size="24" color="grey-darken-1" class="mr-3">mdi-chart-line</v-icon>
      <h3 class="text-h6 text-grey-darken-1">Resultados</h3>
    </div>
    
    <!-- Indicador de usabilidad -->
    <div class="usability-metric">
      <div class="d-flex align-center justify-center mb-3">
        <v-icon size="20" color="primary" class="mr-2">mdi-speedometer</v-icon>
        <span class="metric-label text-caption text-grey-darken-1">Usabilidad General</span>
      </div>
      
      <!-- Circular progress indicator -->
      <div class="d-flex justify-center mb-3">
        <v-progress-circular
          :model-value="usabilityPercentage"
          size="80"
          width="8"
          :color="usabilityColor"
        >
          <span class="text-h5 font-weight-bold">{{ usabilityPercentage }}%</span>
        </v-progress-circular>
      </div>
      
      <!-- Status text -->
      <div class="text-center">
        <div class="usability-status text-body-2 font-weight-medium" :class="usabilityStatusClass">
          {{ usabilityStatusText }}
        </div>
        <div class="text-caption text-grey-darken-1 mt-1">
          Basado en {{ participantsCount }} evaluaciones
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
const usabilityPercentage = computed(() => {
  // Por ahora devolvemos 75% como solicitado
  // En el futuro esto se calculará basado en las respuestas reales
  return 75
})

const participantsCount = computed(() => {
  return props.test?.participants?.length || 0
})

const usabilityColor = computed(() => {
  const percentage = usabilityPercentage.value
  if (percentage >= 80) return 'success'
  if (percentage >= 60) return 'warning'
  return 'error'
})

const usabilityStatusText = computed(() => {
  const percentage = usabilityPercentage.value
  if (percentage >= 80) return 'Excelente Usabilidad'
  if (percentage >= 60) return 'Usabilidad Aceptable'
  return 'Necesita Mejoras'
})

const usabilityStatusClass = computed(() => {
  const percentage = usabilityPercentage.value
  if (percentage >= 80) return 'text-success'
  if (percentage >= 60) return 'text-warning'
  return 'text-error'
})
</script>

<style scoped>
.usability-metric {
  text-align: center;
  padding: 16px 0;
}

.metric-label {
  font-weight: 500;
}

.usability-status {
  margin-top: 8px;
}
</style>
