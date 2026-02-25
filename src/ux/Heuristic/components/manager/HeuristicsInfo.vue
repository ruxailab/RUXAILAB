<template>
  <v-card v-if="test" class="pa-4 mb-0" elevation="3" rounded="lg">
    <!-- Header con icono a la izquierda y título -->
    <div
      class="d-flex align-center mb-4 clickable-header"
      @click="navigateToEdit"
    >
      <v-icon size="24" color="primary" class="header-icon"
        >mdi-file-document-edit-outline</v-icon
      >
      <v-card-title class="text-h6 text-primary clickable-title">{{
        $t('Dashboard.cards.edit')
      }}</v-card-title>
    </div>

    <!-- Métricas principales en dos columnas -->
    <div class="metrics-grid-top mb-3">
      <!-- Heurísticas creadas -->
      <div class="metric-item">
        <div class="d-flex align-center justify-center mb-2">
          <v-icon size="16" color="primary" class="mr-2"
            >mdi-list-box-outline</v-icon
          >
          <span class="metric-label text-caption text-grey-darken-1">{{
            $t('Dashboard.cards.heuristics')
          }}</span>
        </div>
        <div class="metric-value-main text-h5 font-weight-bold text-primary">
          {{ heuristicsCount }}
        </div>
      </div>

      <!-- Preguntas totales -->
      <div class="metric-item">
        <div class="d-flex align-center justify-center mb-2">
          <v-icon size="16" color="info" class="mr-2"
            >mdi-help-circle-outline</v-icon
          >
          <span class="metric-label text-caption text-grey-darken-1">{{
            $t('Dashboard.cards.questions')
          }}</span>
        </div>
        <div class="metric-value-main text-h5 font-weight-bold text-info">
          {{ questionsCount }}
        </div>
      </div>
    </div>

    <!-- Opciones y chips en la misma fila -->
    <div class="metrics-grid-bottom">
      <div class="metric-item-bottom">
        <div class="d-flex align-center justify-center mb-2">
          <v-icon size="16" color="success" class="mr-2"
            >mdi-checkbox-multiple-outline</v-icon
          >
          <span class="metric-label text-caption text-grey-darken-1">{{
            $t('Dashboard.cards.totalOptions')
          }}</span>
        </div>
        <div class="metric-value-main text-h5 font-weight-bold text-success">
          {{ optionsCount }}
        </div>
      </div>

      <!-- Chips informativos al lado -->
      <div class="chips-container">
        <v-chip
          size="small"
          :color="isQualitative ? 'purple' : 'orange'"
          variant="outlined"
          class="mb-1"
        >
          <v-icon start size="small">
            {{ isQualitative ? 'mdi-text' : 'mdi-chart-bar' }}
          </v-icon>
          {{
            isQualitative
              ? $t('Dashboard.cards.qualitative')
              : $t('Dashboard.cards.quantitative')
          }}
        </v-chip>

        <v-chip
          size="small"
          :color="hasWeights ? 'success' : 'grey'"
          variant="outlined"
        >
          <v-icon start size="small">
            {{ hasWeights ? 'mdi-weight' : 'mdi-weight-off' }}
          </v-icon>
          {{ $t('Dashboard.cards.weights') }}
          {{
            hasWeights ? $t('Dashboard.cards.on') : $t('Dashboard.cards.off')
          }}
        </v-chip>
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

// Navigate to heuristics edit section
const navigateToEdit = () => {
  if (props.test?.id) {
    router.push(`/heuristic/edit/${props.test.id}`)
  }
}

// Computed properties
const heuristicsCount = computed(() => props.test?.testStructure?.length || 0)

const questionsCount = computed(() => {
  if (!props.test?.testStructure) return 0
  if (!props.test.testStructure.length) return 0
  return props.test.testStructure.reduce((total, heuristic) => {
    return total + (heuristic.questions?.length || 0)
  }, 0)
})

const optionsCount = computed(() => {
  if (!props.test?.testStructure) return 0
  if (!props.test.testStructure.length) return 0
  return props.test.testStructure.reduce((total, heuristic) => {
    const heuristicOptions =
      heuristic.questions?.reduce((hTotal, question) => {
        return hTotal + (question.options?.length || 0)
      }, 0) || 0
    return total + heuristicOptions
  }, 0)
})

// Computed properties para los chips
const isQualitative = computed(() => {
  // Verificamos si el test tiene opciones de texto libre o tipo cualitativo
  // Asumimos que si hay preguntas sin opciones predefinidas es cualitativo
  if (!props.test?.testStructure) return false
  if (!props.test.testStructure.length) return false

  // Si tiene alguna pregunta abierta o tipo text, es cualitativo
  const hasOpenQuestions = props.test.testStructure.some((heuristic) =>
    heuristic.questions?.some(
      (question) =>
        question.type === 'text' ||
        question.type === 'textarea' ||
        !question.options?.length,
    ),
  )

  // Si no hay opciones predefinidas en general, también podría ser cualitativo
  return hasOpenQuestions || optionsCount.value === 0
})

const hasWeights = computed(() => {
  // Verificamos si el test tiene el sistema de pesos activado
  return props.test?.hasWeights || props.test?.weightsEnabled || false
})
</script>

<style scoped>
.metrics-grid-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.metrics-grid-bottom {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
}

.metric-item {
  text-align: center;
  padding: 12px 8px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.metric-item-bottom {
  text-align: center;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  min-width: 140px;
}

.chips-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.metric-label {
  font-weight: 500;
}

.metric-value-main {
  line-height: 1;
  margin-top: 4px;
}

/* Responsive: En pantallas pequeñas, cambiar a una columna */
@media (max-width: 600px) {
  .metrics-grid-top {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .metrics-grid-bottom {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
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
