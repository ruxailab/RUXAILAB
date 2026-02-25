<template>
  <v-card v-if="test" class="pa-4 mb-0" elevation="3" rounded="lg">
    <!-- Header con icono a la izquierda y título -->
    <div
      class="d-flex align-center mb-4 clickable-header"
      @click="navigateToAnswers"
    >
      <v-icon size="24" color="primary" class="header-icon"
        >mdi-chart-line</v-icon
      >
      <v-card-title class="text-h6 text-primary clickable-title">
        {{ $t('Dashboard.cards.results') }}
      </v-card-title>
    </div>

    <!-- Indicador de usabilidad -->
    <div class="usability-metric">
      <div class="d-flex align-center justify-center mb-3">
        <v-icon size="20" color="primary" class="mr-2">mdi-speedometer</v-icon>
        <span class="metric-label text-caption text-grey-darken-1">{{
          $t('Dashboard.cards.generalUsability')
        }}</span>
      </div>

      <!-- Circular progress indicator -->
      <div class="d-flex justify-center mb-3">
        <v-progress-circular
          :model-value="usabilityPercentage"
          size="80"
          width="8"
          :color="usabilityColor"
        >
          <span class="text-h5 font-weight-bold"
            >{{ usabilityPercentage }}%</span
          >
        </v-progress-circular>
      </div>

      <!-- Status text -->
      <div class="text-center">
        <div
          class="usability-status text-body-2 font-weight-medium"
          :class="usabilityStatusClass"
        >
          {{ usabilityStatusText }}
        </div>
        <div class="text-caption text-grey-darken-1 mt-1">
          {{ $t('Dashboard.cards.basedOn') }} {{ participantsCount }}
          {{ $t('Dashboard.cards.evaluations') }}
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
    required: true,
  },
})

const router = useRouter()
const { t } = useI18n()

// Navigate to answers section
const navigateToAnswers = () => {
  if (props.test?.id) {
    router.push(`/heuristic/answer/${props.test.id}`)
  }
}

// Computed properties
const usabilityPercentage = computed(() => {
  // Por ahora devolvemos 75% como solicitado
  // En el futuro esto se calculará basado en las respuestas reales
  return 75
})

const participantsCount = computed(() => {
  return props.test?.cooperators?.length || 0
})

const usabilityColor = computed(() => {
  const percentage = usabilityPercentage.value
  if (percentage >= 80) return 'success'
  if (percentage >= 60) return 'warning'
  return 'error'
})

const usabilityStatusText = computed(() => {
  const percentage = usabilityPercentage.value
  if (percentage >= 80) return t('Dashboard.cards.excellentUsability')
  if (percentage >= 60) return t('Dashboard.cards.acceptableUsability')
  return t('Dashboard.cards.needsImprovement')
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
