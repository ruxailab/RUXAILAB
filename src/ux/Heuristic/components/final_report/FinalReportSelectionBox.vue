<template>
  <div>
    <v-col class="d-flex flex-column" style="min-height: 500px">
      <!-- Título no topo -->
      <h2 class="mb-4">Configuración del Reporte Final</h2>
      <p class="text-body-2 text-grey-darken-1 mb-6">
        Selecciona qué información deseas incluir en el PDF
      </p>

      <!-- Sistema de checkboxes para configurar el payload -->
      <v-card variant="outlined" class="mb-4">
        <v-card-text>
          <h3 class="text-h6 mb-4">Contenido del Reporte</h3>

          <v-checkbox
            v-model="pdfConfig.includeDescription"
            label="Descripción del test"
            density="comfortable"
            hide-details
            class="mb-2"
          />

          <v-checkbox
            v-model="pdfConfig.includeConclusion"
            label="Conclusión y observaciones finales"
            density="comfortable"
            hide-details
            class="mb-2"
          />

          <v-checkbox
            v-model="pdfConfig.includeHeuristicComments"
            label="Comentarios por heurística"
            density="comfortable"
            hide-details
            class="mb-2"
          />

          <v-divider class="my-4" />

          <h3 class="text-h6 mb-4">Estadísticas y Datos</h3>

          <v-checkbox
            v-model="pdfConfig.includeGeneralStatistics"
            label="Estadísticas generales y tablas visuales"
            density="comfortable"
            hide-details
            class="mb-2"
          />

          <v-checkbox
            v-model="pdfConfig.includeStatisticsByHeuristic"
            label="Estadísticas agrupadas por heurística"
            density="comfortable"
            hide-details
            class="mb-2"
          />

          <v-divider class="my-4" />

          <h3 class="text-h6 mb-4">Respuestas de Evaluadores</h3>

          <v-checkbox
            v-model="pdfConfig.includeIndividualAnswers"
            label="Respuestas individuales de evaluadores (con comentarios e imágenes)"
            density="comfortable"
            hide-details
            class="mb-2"
          />

          <v-checkbox
            v-model="pdfConfig.includeGroupedAnswers"
            label="Respuestas agrupadas por heurística y evaluador"
            density="comfortable"
            hide-details
            class="mb-2"
          />

          <v-divider class="my-4" />

          <h3 class="text-h6 mb-4">Privacidad</h3>

          <v-checkbox
            v-model="pdfConfig.anonymizeEvaluators"
            label="Anonimizar información de evaluadores"
            density="comfortable"
            hide-details
            color="warning"
          />
        </v-card-text>
      </v-card>

      <div v-if="isLoading" class="mt-4">
        <p>
          Generating Report PDF. This operation might take a few minutes. Don't
          close this tab.
        </p>
        <v-progress-linear indeterminate />
      </div>

      <!-- Espaço expansível entre o título e os botões -->
      <div class="flex-grow-1" />

      <v-row class="ma-0" justify="space-between" align-content="end">
        <v-btn
          color="blue-grey-darken-3"
          elevation="0"
          @click="$emit('return-step')"
        >
          {{ $t('buttons.previous') }}
        </v-btn>
        <v-btn :disabled="isLoading" color="orange" @click="submitPdf">
          <span v-if="!isLoading">{{ $t('pages.finalReport.pdf') }}</span>
          <span v-else>{{ $t('pages.finalReport.options.loading') }}</span>
        </v-btn>
      </v-row>
    </v-col>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import {
  buildHeuristicsEvaluator,
  buildHeuristicsStatistics,
  finalResult,
  statistics,
} from '@/ux/Heuristic/utils/statistics'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'

// Vuex store
const store = useStore()

// Vue I18n
const { t } = useI18n()

// Emits
const emit = defineEmits(['return-step'])

// Props
const props = defineProps({
  heuristicComments: {
    type: Object,
    default: () => ({}),
  },
})

// Reactive state
const statisticsData = ref('')
const isLoading = ref(false)

// Configuración del PDF (checkboxes)
const pdfConfig = reactive({
  includeDescription: true,
  includeConclusion: true,
  includeHeuristicComments: true,
  includeGeneralStatistics: true,
  includeStatisticsByHeuristic: true,
  includeIndividualAnswers: true,
  includeGroupedAnswers: true,
  anonymizeEvaluators: false,
})

// Computed properties
const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument)

const answers = computed(() => {
  if (testAnswerDocument.value) {
    return testAnswerDocument.value.type === STUDY_TYPES.HEURISTIC
      ? Object.values(testAnswerDocument.value.heuristicAnswers)
      : Object.values(testAnswerDocument.value.taskAnswers)
  }
  return []
})

const test = computed(() => store.getters.test)

// Statistics Results
const resultEvaluator = ref(statistics())

const heuristicsEvaluator = computed(() =>
  buildHeuristicsEvaluator(resultEvaluator.value, test.value.testOptions),
)

const heuristicsStatistics = computed(() =>
  buildHeuristicsStatistics(heuristicsEvaluator.value),
)

// Methods
const submitPdf = async () => {
  isLoading.value = true
  try {
    // Extract valid emails from cooperators
    const getCooperatorEmails = () => {
      const cooperators = test.value.cooperators || []
      if (pdfConfig.anonymizeEvaluators) {
        return []
      }
      return cooperators.filter((coop) => coop?.email).map((coop) => coop.email)
    }

    // Anonimizar respuestas si está activado
    const processAnswers = (answersArray) => {
      if (!pdfConfig.anonymizeEvaluators) {
        return answersArray
      }
      return answersArray.map((answer, index) => ({
        ...answer,
        evaluatorName: `Evaluador ${index + 1}`,
        evaluatorEmail: null,
      }))
    }

    statisticsData.value = finalResult()
    const cooperatorsEmailsList = getCooperatorEmails()

    // Construir el payload según la configuración
    const finalReportItem = {
      title: test.value.testTitle,
      creationDate: test.value.creationDate,
      testDescription: pdfConfig.includeDescription
        ? test.value.testDescription
        : null,
      cooperatorsEmail: cooperatorsEmailsList,
      creatorEmail: pdfConfig.anonymizeEvaluators
        ? null
        : test.value.testAdmin?.email || '',
      finalReport: pdfConfig.includeConclusion
        ? test.value.studyConclusion
        : null,
      allOptions: test.value.testOptions,
      allAnswers: pdfConfig.includeIndividualAnswers
        ? processAnswers(answers.value)
        : [],
      taskAnswers: pdfConfig.includeIndividualAnswers
        ? processAnswers(
            Object.values(testAnswerDocument.value?.taskAnswers || {}),
          )
        : [],
      testStructure: test.value.testStructure,
      statisticsByEvaluatorAnswer: pdfConfig.includeGroupedAnswers
        ? heuristicsEvaluator.value
        : null,
      statisticsByHeuristics: pdfConfig.includeStatisticsByHeuristic
        ? heuristicsStatistics.value
        : null,
      generalStatistics: pdfConfig.includeGeneralStatistics
        ? statisticsData.value
        : null,
      statisticsTable: pdfConfig.includeGeneralStatistics
        ? store.state.Answer.evaluatorStatistics
        : null,
      type: testAnswerDocument.value?.type || STUDY_TYPES.HEURISTIC,
      heuristicComments: pdfConfig.includeHeuristicComments
        ? props.heuristicComments
        : {},
      anonymized: pdfConfig.anonymizeEvaluators,
    }

    const payload = {
      payload: finalReportItem,
    }

    const response = await axios.post(
      `${process.env.VUE_APP_LARAVEL_PDF}/generate-pdf`,
      payload,
      { responseType: 'blob' },
    )

    // Create filename
    const slugify = (text) =>
      text
        ?.toString()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w\-]+/g, '')

    const title = slugify(test.value.testTitle || 'report')
    const creationDate = slugify(
      test.value.creationDate || new Date().toISOString(),
    )
    const anonymizedSuffix = pdfConfig.anonymizeEvaluators ? '_anonimo' : ''
    const filename = `final_report_${title}_${creationDate}${anonymizedSuffix}.pdf`

    // Trigger file download
    const blob = new Blob([response.data])
    const url = URL.createObjectURL(blob)
    const link = Object.assign(document.createElement('a'), {
      href: url,
      download: filename,
    })

    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF export failed:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
