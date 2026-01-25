<template>
  <v-card v-if="test" class="pa-4 mb-0" elevation="3" rounded="lg">
    <!-- Header con icono a la izquierda y título -->
    <div class="d-flex align-center mb-4 clickable-header" @click="navigateToReport">
      <v-icon size="24" color="primary" class="header-icon">mdi-file-document</v-icon>
      <v-card-title class="text-h6 text-primary clickable-title">{{ $t('Dashboard.cards.finalReport') }}</v-card-title>
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
          <span class="text-caption text-grey-darken-1">{{ $t('Dashboard.cards.generated') }} {{ reportDate }}</span>
        </div>
        
        <div v-if="reportExists" class="d-flex justify-center">
          <v-btn
            size="small"
            color="primary"
            variant="outlined"
            prepend-icon="mdi-download"
          >
            {{ $t('Dashboard.cards.download') }}
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
            {{ $t('Dashboard.cards.generateReport') }}
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  test: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const { t } = useI18n()

// Navigate to final report section
const navigateToReport = () => {
  if (props.test?.id) {
    router.push(`/heuristic/finalreport/${props.test.id}`)
  }
}

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
  return reportExists.value ? t('Dashboard.cards.reportAvailable') : t('Dashboard.cards.noReport')
})

const reportSubtitle = computed(() => {
  if (reportExists.value) {
    return t('Dashboard.cards.readyForDownload')
  } else {
    const completedEvaluations = props.test?.participants?.filter(p => p.completed).length || 0
    const totalParticipants = props.test?.participants?.length || 0
    
    if (totalParticipants === 0) {
      return t('Dashboard.cards.waitingForParticipants')
    } else if (completedEvaluations < totalParticipants) {
      return `${completedEvaluations}/${totalParticipants} ${t('Dashboard.cards.evaluationsCompleted')}`
    } else {
      return t('Dashboard.cards.readyToGenerate')
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
