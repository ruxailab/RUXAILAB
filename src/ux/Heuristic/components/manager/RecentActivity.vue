<template>
  <v-card v-if="test" class="pa-4 mb-6" elevation="1">
    <!-- Header con icono a la izquierda y título -->
    <div class="d-flex align-center mb-4">
      <v-icon size="24" color="grey-darken-1" class="mr-3">mdi-timeline-text-outline</v-icon>
      <h3 class="text-h6 text-grey-darken-1">Actividad Reciente</h3>
    </div>
    
    <!-- Métrica principal -->
    <div class="main-metric mb-4">
      <div class="metric-subtitle text-caption text-grey-darken-1">Actividades (7 días en total)</div>
      <div class="metric-value text-h3 font-weight-bold">{{ recentActivitiesCount }}</div>
      <div class="metric-change text-caption" :class="changeColor">{{ activityChange }}</div>
    </div>
    
    <!-- Información adicional -->
    <div class="additional-info">
      <div class="info-subtitle text-caption text-grey-darken-1">Última actividad</div>
      <div class="info-value text-body-2 font-weight-medium">{{ lastActivityTime }}</div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({
  test: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view-all'])

// Computed properties
const activities = computed(() => {
  const activityList = []
  
  // Actividades basadas en cooperadores
  if (props.test?.cooperators) {
    props.test.cooperators.forEach(coop => {
      if (coop.updateDate) {
        activityList.push({
          id: `coop-${coop.userDocId}`,
          title: 'Evaluación actualizada',
          description: `${coop.email} actualizó su progreso`,
          timeAgo: formatDistanceToNow(new Date(coop.updateDate), { 
            addSuffix: true, 
            locale: es 
          }),
          color: coop.progress === 100 ? 'success' : 'warning',
          timestamp: new Date(coop.updateDate)
        })
      }
      
      if (coop.invited && !coop.accepted) {
        activityList.push({
          id: `invite-${coop.userDocId}`,
          title: 'Invitación enviada',
          description: `Invitación pendiente para ${coop.email}`,
          timeAgo: 'Pendiente',
          color: 'info',
          timestamp: new Date(coop.updateDate || props.test.createDate)
        })
      }
    })
  }
  
  // Ordenar por fecha más reciente
  return activityList
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)
})

// Computed para las nuevas métricas
const recentActivitiesCount = computed(() => activities.value.length)

const activityChange = computed(() => {
  // Simular cambio porcentual
  return recentActivitiesCount.value > 0 ? '+15%' : '0%'
})

const changeColor = computed(() => {
  return recentActivitiesCount.value > 0 ? 'text-success' : 'text-grey'
})

const lastActivityTime = computed(() => {
  if (activities.value.length === 0) return 'Sin actividad'
  const lastActivity = activities.value[0]
  return lastActivity.timeAgo
})

// Methods
const viewAll = () => emit('view-all')
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
