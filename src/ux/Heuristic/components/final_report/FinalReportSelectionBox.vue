<template>
  <div>
    <v-col class="d-flex flex-column" style="min-height: 500px">
      <!-- Título no topo -->
      <h2>Final Report Content</h2>

      <!-- Lista de conteúdo do relatório -->
      <ul class="mt-4" style="padding-left: 1.2rem; line-height: 1.6">
        <li>Test description</li>
        <li>Conclusion and final observations</li>
        <li>General test data and metadata</li>
        <li>Results with statistics and visual tables</li>
        <li>All evaluator answers with optional comments and images</li>
        <li>Grouped answers by heuristic and evaluator</li>
        <li>Formatted layout for presentation</li>
        <li>Downloadable PDF document</li>
      </ul>

      <div v-if="isLoading" class="mt-12">
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
import { ref, computed } from 'vue'
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

// Reactive state
const statisticsData = ref('')
const isLoading = ref(false)

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
      return cooperators.filter((coop) => coop?.email).map((coop) => coop.email)
    }

    statisticsData.value = finalResult()
    const cooperatorsEmailsList = getCooperatorEmails()

    const payload = {
      items: [
        {
          title: test.value.testTitle,
          creationDate: test.value.creationDate,
          testDescription: test.value.testDescription,
          cooperatorsEmail: cooperatorsEmailsList,
          creatorEmail: test.value.testAdmin.email,
          studyConclusion: test.value.studyConclusion,
          allOptions: test.value.testOptions,
          allAnswers: answers.value,
          testStructure: test.value.testStructure,
          statisticsByEvaluatorAnswer: heuristicsEvaluator.value,
          statisticsByHeuristics: heuristicsStatistics.value,
          gstatistics: statisticsData.value,
          statisticstable: store.state.Answer.evaluatorStatistics,
        },
      ],
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
    const filename = `final_report_${title}_${creationDate}.pdf`

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
