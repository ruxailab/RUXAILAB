<template>
  <v-card v-if="test" class="pa-4" elevation="1">
    <!-- Header con icono a la izquierda y título -->
    <div class="d-flex align-center mb-4">
      <v-icon size="24" color="grey-darken-1" class="mr-3">mdi-file-document</v-icon>
      <h3 class="text-h6 text-grey-darken-1">Final Report</h3>
    </div>
    
    <!-- Estado del informe -->
    <div class="report-status">
      <div class="d-flex align-center justify-center mb-3">
        <v-icon 
          size="48" 
          :color="reportExists ? 'success' : 'grey'" 
          class="mb-2"
        >
          {{ reportExists ? 'mdi-file-check' : 'mdi-file-outline' }}
        </v-icon>
      </div>
      
      <!-- Status principal -->
      <div class="text-center mb-3">
        <div class="report-title text-h6 font-weight-bold" :class="reportStatusClass">
          {{ reportStatusText }}
        </div>
        <div class="text-caption text-grey-darken-1 mt-1">
          {{ reportSubtitle }}
        </div>
      </div>
      
      <!-- Información adicional -->
      <div class="report-info">
        <div v-if="reportExists" class="d-flex align-center justify-center mb-2">
          <v-icon size="16" color="success" class="mr-2">mdi-calendar-check</v-icon>
          <span class="text-caption text-grey-darken-1">Generado: {{ reportDate }}</span>
        </div>
        
        <div v-if="reportExists" class="d-flex justify-center">
          <v-btn
            size="small"
            color="primary"
            variant="outlined"
            prepend-icon="mdi-download"
          >
            Descargar
          </v-btn>
        </div>
        
        <div v-else class="d-flex justify-center">
          <v-btn
            size="small"
            color="primary"
            variant="outlined"
            prepend-icon="mdi-plus"
            disabled
          >
            Generar Informe
          </v-btn>
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
const reportExists = computed(() => {
  // Verificamos si existe un informe final
  // Esto puede basarse en diferentes propiedades del test
  return props.test?.finalReport?.exists || 
         props.test?.hasReport || 
         props.test?.reportGenerated || 
         false
})

const reportStatusText = computed(() => {
  return reportExists.value ? 'Report Available' : 'No Report Generated'
})

const reportSubtitle = computed(() => {
  if (reportExists.value) {
    return 'Final report ready for download'
  } else {
    const completedEvaluations = props.test?.participants?.filter(p => p.completed).length || 0
    const totalParticipants = props.test?.participants?.length || 0
    
    if (totalParticipants === 0) {
      return 'Waiting for participants'
    } else if (completedEvaluations < totalParticipants) {
      return `${completedEvaluations}/${totalParticipants} evaluations completed`
    } else {
      return 'Ready to generate report'
    }
  }
})

const reportStatusClass = computed(() => {
  return reportExists.value ? 'text-success' : 'text-grey-darken-1'
})

const reportDate = computed(() => {
  if (reportExists.value && props.test?.finalReport?.createdAt) {
    return new Date(props.test.finalReport.createdAt).toLocaleDateString()
  }
  return new Date().toLocaleDateString() // Fecha de ejemplo
})
</script>

<style scoped>
.report-status {
  text-align: center;
  padding: 16px 0;
}

.report-title {
  margin-bottom: 8px;
}

.report-info {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 16px;
  margin-top: 16px;
}
</style>
