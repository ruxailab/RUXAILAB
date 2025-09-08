<template>
  <v-card v-if="test" class="pa-4" elevation="1">
    <!-- Header con icono a la izquierda y título -->
    <div class="d-flex align-center mb-4">
      <v-icon size="24" color="grey-darken-1" class="mr-3">mdi-database</v-icon>
      <h3 class="text-h6 text-grey-darken-1">Storage</h3>
    </div>
    
    <!-- Métrica principal -->
    <div class="main-metric mb-4">
      <div class="metric-subtitle text-caption text-grey-darken-1">Almacenamiento (actual)</div>
      <div class="metric-value text-h3 font-weight-bold">{{ storageUsed }}</div>
      <div class="metric-change text-caption" :class="storageGrowth >= 0 ? 'text-success' : 'text-error'">{{ storageGrowthFormatted }}</div>
    </div>
    
    <!-- Información adicional -->
    <div class="additional-info">
      <div class="info-subtitle text-caption text-grey-darken-1">Límite disponible</div>
      <div class="info-value text-body-2 font-weight-medium">{{ storageLimit }}</div>
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

// Computed properties para métricas de storage
const storageUsed = computed(() => {
  // Simulamos el cálculo del storage usado basado en los datos del test
  const baseStorage = 450 // MB base
  const participantsStorage = (props.test?.participants?.length || 0) * 15 // 15MB por participante
  const heuristicsStorage = (props.test?.heuristics?.length || 0) * 5 // 5MB por heurística
  const totalMB = baseStorage + participantsStorage + heuristicsStorage
  return `${totalMB}MB`
})

const storageLimit = computed(() => {
  // Límite estándar para estudios
  return "2GB"
})

const storageGrowth = computed(() => {
  // Simulamos el crecimiento basado en actividad reciente
  const recentParticipants = props.test?.participants?.filter(p => {
    const participationDate = new Date(p.createdAt || p.joinedAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return participationDate > weekAgo
  }).length || 0
  
  // Crecimiento aproximado del 0.1% por participante reciente
  return recentParticipants * 0.1
})

const storageGrowthFormatted = computed(() => {
  const growth = storageGrowth.value
  const sign = growth >= 0 ? '+' : ''
  return `${sign}${growth.toFixed(1)}%`
})

const storagePercentageUsed = computed(() => {
  const usedMB = parseInt(storageUsed.value.replace('MB', ''))
  const limitMB = 2048 // 2GB en MB
  return Math.round((usedMB / limitMB) * 100)
})
</script>

<style scoped>
.main-metric {
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

.metric-change {
  font-weight: 500;
}

.additional-info {
  padding-top: 8px;
}

.info-subtitle {
  margin-bottom: 4px;
}

.info-value {
  color: rgb(var(--v-theme-on-surface));
}
</style>
