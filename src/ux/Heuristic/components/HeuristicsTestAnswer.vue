<template>
  <div v-if="answers">
    <v-overlay :model-value="loading">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
    <IntroAnswer
      v-if="answers != null && intro == true"
      @go-to-coops="goToCoops"
    />
    <v-row
      v-else-if="answers != null || intro == false"
      justify="center"
      class="ma-0 mt-4"
    >
      <ShowInfo :hide-col="true">
        <!-- Main Tabs -->
        <template #top>
          <v-tabs
            v-model="tab"
            bg-color="transparent"
            color="#FB5C6C"
            slider-size="4"
          >
            <v-tab @click="setTab(0)">
              {{ $t('HeuristicsTestAnswer.titles.statistics') }}
            </v-tab>
            <v-tab @click="setTab(1)">
              {{ $t('HeuristicsTestAnswer.titles.evaluators') }}
            </v-tab>
            <v-tab @click="setTab(2)">
              {{ $t('HeuristicsTestAnswer.titles.heuristics') }}
            </v-tab>
            <v-tab @click="setTab(3)">
              {{ $t('HeuristicsTestAnswer.titles.analytics') }}
            </v-tab>
          </v-tabs>
        </template>

        <!-- Main Tabs Content -->
        <template #content>
          <div class="ma-0 pa-0">
            <!-- Tab 1 - Statistics -->
            <StatisticsSummaryCard
              v-if="tab == 0"
              :result="showFinalResult"
              :traditional-metrics="traditionalMetrics"
              :image-totals-by-heuristic="imageTotalsByHeuristic"
              :evaluation-overview="evaluationOverview"
              :option-response-totals="optionResponseTotals"
              :evaluator-identity="singleEvaluatorIdentity"
            />

            <!-- Tab 2 - Evaluators -->
            <EvaluatorsAndGraphicsCard
              v-if="tab == 1"
              :statistics="evaluatorStatistics"
              :is-traditional="Boolean(traditionalMetrics)"
              :traditional-statistics="traditionalEvaluatorStatistics"
              :loading="loading"
              @download-csv="DownloadEvaluatorCsv"
            />

            <!-- Tab 3 - Heuristics -->
            <HeuristicsDataCard
              v-if="tab == 2"
              :has-enough-data="evaluatorStatistics.items.length > 1"
              :heuristics-evaluator="heuristicsEvaluator"
              :heuristics-statistics="heuristicsStatistics"
              :time-by-heuristics="timeByHeuristics"
              :track-time="trackTime"
              :weights-statistics="weightsStatistics"
              :relative="relative"
              :usability-total-fix="usabilityTotalFix"
              :heuristics-length="heuristicsLength"
              :max-value="maxValue"
              @go-to-heuristic="goToDataHeuristic"
            />
            <!-- Tab 4 - Analytics -->
            <HeuristicsAnalytics v-if="tab == 3" />
          </div>
        </template>
      </ShowInfo>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BarChart from '@/ux/Heuristic/components/charts/BarChart.vue'
import RadarChart from '@/shared/components/charts/RadarChart.vue'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import IntroAnswer from '@/shared/components/introduction_cards/IntroAnswer.vue'
import RadarWeight from '@/ux/Heuristic/components/weights_evaluation/RadarWeight.vue'
import HeuristicsAnalytics from '@/ux/Heuristic/components/HeuristicsAnalytics.vue'
import StatisticsSummaryCard from '@/ux/Heuristic/components/statistics/StatisticsSummaryCard.vue'
import EvaluatorsAndGraphicsCard from '@/ux/Heuristic/components/statistics/EvaluatorsAndGraphicsCard.vue'
import HeuristicsDataCard from '@/ux/Heuristic/components/statistics/HeuristicsDataCard.vue'

import axios from 'axios'
import {
  standardDeviation,
  finalResult,
  statistics,
  calcFinalResult,
  formatTimeSpentFromMs,
  buildHeuristicTestBundlePayload,
  downloadHeuristicTestBundlePayload,
} from '@/ux/Heuristic/utils/statistics'
import {
  heuristicsStatisticsHeaders,
  weightsStatisticsHeader,
  heuristicsEvaluatorHeader,
} from '@/ux/Heuristic/utils/headers.js'

const store = useStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['goToCoops'])

const tab = ref(0)
const ind = ref(0)
const resultEvaluator = ref(statistics())
let intro = ref(null)
const tabelacompleta = ref(null)
const decisionmatrix = ref(null)
const relative = ref(null)
const usability_total = ref(0)
const loading = ref(false) // Note: Check if Vuex getter 'loading' is needed
const array_scores = ref([])

const showFinalResult = computed(() => finalResult(resultEvaluator.value))

const imageTotalsByHeuristic = computed(() => {
  const totals = {}

  if (!Array.isArray(resultEvaluator.value)) return []

  resultEvaluator.value.forEach((evaluator) => {
    if (!Array.isArray(evaluator.heuristics)) return

    evaluator.heuristics.forEach((heuristic) => {
      totals[heuristic.id] =
        (totals[heuristic.id] || 0) + Number(heuristic.totalImages || 0)
    })
  })

  return Object.entries(totals)
    .map(([heuristic, totalImages]) => ({ heuristic, totalImages }))
    .sort(
      (a, b) =>
        Number(a.heuristic.replace(/\D/g, '')) -
        Number(b.heuristic.replace(/\D/g, '')),
    )
})

const evaluatorStatistics = computed(
  () => store.state.Answer.evaluatorStatistics || { header: [], items: [] },
)

const testWeights = computed(() => store.state.Tests.Test.testWeights || [])

const heuristicsEvaluator = computed(() => {
  const table = {
    header: heuristicsEvaluatorHeader,
    items: [],
  }
  const options =
    test.value && test.value.testOptions
      ? test.value.testOptions.map((op) => op.value)
      : []
  const max = options.length > 0 ? Math.max(...options) : 0
  const min = options.length > 0 ? Math.min(...options) : 0

  if (resultEvaluator.value && Array.isArray(resultEvaluator.value)) {
    let evaluatorIndex = 1
    resultEvaluator.value.forEach((evaluator) => {
      evaluator.id = `Ev${evaluatorIndex}`
      const header = table.header.find((h) => h.value === evaluator.id)
      if (!header) {
        table.header.push({
          title: t('HeuristicsTestAnswer.titles.evaluatorNumber', {
            n: evaluatorIndex,
          }),
          align: 'center',
          value: evaluator.id,
        })
      }
      if (evaluator.heuristics && Array.isArray(evaluator.heuristics)) {
        evaluator.heuristics.forEach((heuristic) => {
          const totalQuestions = Number(
            heuristic.totalQuestionsValues ?? heuristic.totalQuestions ?? 0,
          )
          const item = table.items.find((i) => i.heuristic === heuristic.id)
          if (item) {
            Object.assign(item, {
              [evaluator.id]: heuristic.result,
            })
          } else {
            table.items.push({
              heuristic: heuristic.id,
              max: max * totalQuestions,
              min: min * totalQuestions,
              [evaluator.id]: heuristic.result,
            })
          }
        })
      }
      evaluatorIndex++
    })
  }
  return table
})

const timeByHeuristics = computed(() => {
  const table = {
    header: [{ title: 'HEURISTICS', align: 'start', value: 'heuristic' }],
    items: [],
  }

  if (!Array.isArray(resultEvaluator.value) || !resultEvaluator.value.length) {
    return table
  }

  const rowsByHeuristic = {}
  const timesByHeuristic = {}

  resultEvaluator.value.forEach((evaluator, evaluatorPosition) => {
    const evaluatorKey = `Ev${evaluatorPosition + 1}`
    table.header.push({
      title: t('HeuristicsTestAnswer.titles.evaluatorNumber', {
        n: evaluatorPosition + 1,
      }),
      value: evaluatorKey,
      align: 'center',
    })

    if (!Array.isArray(evaluator.heuristics)) return

    evaluator.heuristics.forEach((heuristic) => {
      const heuristicId = heuristic.id
      const timeMs = Number(heuristic.timeSpentMs || 0)

      if (!rowsByHeuristic[heuristicId]) {
        rowsByHeuristic[heuristicId] = { heuristic: heuristicId }
        timesByHeuristic[heuristicId] = []
      }

      rowsByHeuristic[heuristicId][evaluatorKey] = formatTimeSpentFromMs(timeMs)
      timesByHeuristic[heuristicId].push(timeMs)
    })
  })

  table.header.push({
    title: t('HeuristicsTestAnswer.titles.totalTime'),
    value: 'totalTime',
    align: 'center',
  })
  table.header.push({
    title: t('HeuristicsTestAnswer.titles.averageTime'),
    value: 'averageTime',
    align: 'center',
  })
  table.header.push({
    title: t('HeuristicsTestAnswer.titles.timeStdDev'),
    value: 'timeSd',
    align: 'center',
  })

  table.items = Object.values(rowsByHeuristic).map((row) => {
    const times = timesByHeuristic[row.heuristic] || []
    const totalMs = times.reduce((acc, value) => acc + value, 0)
    const averageMs = times.length ? totalMs / times.length : 0
    const sdMs = times.length ? standardDeviation(times) : 0

    return {
      ...row,
      totalTime: formatTimeSpentFromMs(totalMs),
      averageTime: formatTimeSpentFromMs(averageMs),
      timeSd: formatTimeSpentFromMs(sdMs),
    }
  })

  return table
})

const heuristicsStatistics = computed(() => {
  const table = {
    header: heuristicsStatisticsHeaders,
    items: [],
  }

  if (!heuristicsEvaluator.value || !heuristicsEvaluator.value.items) {
    return table
  }

  heuristicsEvaluator.value.items.forEach((item) => {
    const results = Object.entries(item)
      .filter(([key]) => key.includes('Ev'))
      .map(([, value]) => value)
      .filter((value) => value !== undefined && value !== null)
    const valueToConvert = results.length
      ? results
          .reduce((total, value) => total + value / results.length, 0)
          .toFixed(2)
      : '0.00'
    const convertedValue =
      item.max !== undefined &&
      item.min !== undefined &&
      Number(item.max) !== Number(item.min)
        ? ((valueToConvert - item.min) / (item.max - item.min)) * 100
        : 0
    table.items.push({
      name: item.heuristic || 'Unknown',
      max: item.max ? Number(item.max).toFixed(2) : '0.00',
      min: item.min ? Number(item.min).toFixed(2) : '0.00',
      percentage: convertedValue.toFixed(2),
      sd: results.length ? standardDeviation(results).toFixed(2) : '0.00',
      average: valueToConvert,
    })
  })

  return table
})

const heuristics = computed(() =>
  test.value && test.value.testStructure ? test.value.testStructure : [],
)

const heuristicsLength = computed(() =>
  relative.value ? relative.value.length : 0,
)

const weightsStatistics = computed(() => {
  const tableWeights = {
    header: weightsStatisticsHeader,
    items: [],
  }

  const relativeLength = relative.value ? relative.value.length : 0

  if (relativeLength > 0) {
    for (let i = 0; i < relativeLength; i++) {
      tableWeights.items.push({
        name: `H${i + 1} - ${
          heuristics.value[i] ? heuristics.value[i].title : ''
        }`,
        percentage: store.state.Tests.scoresPercentage[i] || '0.00',
        rw: relative.value[i].toFixed(4),
      })
    }
  }
  return tableWeights
})

const usabilityTotalFix = computed(() =>
  parseFloat(usability_total.value || 0).toFixed(2),
)

const maxValue = computed(() => {
  const relativeArray = relative.value || []
  let maxValue = relativeArray[0] || 0
  for (let i = 1; i < relativeArray.length; i++) {
    if (relativeArray[i] > maxValue) {
      maxValue = relativeArray[i]
    }
  }
  return parseFloat(maxValue).toFixed(1)
})

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument)

const trackTime = computed(() => store.getters.test?.trackTime !== false)

const answers = computed(() => {
  if (testAnswerDocument.value && testAnswerDocument.value.heuristicAnswers) {
    return Object.values(testAnswerDocument.value.heuristicAnswers)
  }
  return []
})

const test = computed(() => {
  const percentages =
    heuristicsStatistics.value && heuristicsStatistics.value.items
      ? heuristicsStatistics.value.items.map((item) => item.percentage)
      : []
  store.dispatch('processStatistics', {
    resultEvaluator: statistics(),
    percentage: percentages,
  })
  return store.getters.test || {}
})

const metricAverage = (values) =>
  values.length
    ? (
        values.reduce((total, value) => total + value, 0) / values.length
      ).toFixed(2)
    : '-'

const heuristicTimeToMs = (timeSpent) => {
  if (typeof timeSpent !== 'string') return 0
  const [minutes = 0, seconds = 0] = timeSpent.split(':').map(Number)
  return (minutes * 60 + seconds) * 1000
}

const formatDuration = (timeMs) => {
  const totalSeconds = Math.floor(timeMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const metricSummary = (values) => {
  if (!values.length) {
    return { average: '0.00', max: '0.00', min: '0.00', sd: '0.00' }
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
    values.length

  return {
    average: average.toFixed(2),
    max: Math.max(...values).toFixed(2),
    min: Math.min(...values).toFixed(2),
    sd: Math.sqrt(variance).toFixed(2),
  }
}

const traditionalMetrics = computed(() => {
  const isTraditional =
    !test.value?.testOptions?.length &&
    test.value?.useFrequency !== false &&
    test.value?.useSeverity !== false

  if (!isTraditional) return null

  const values = { frequency: [], severity: [] }
  answers.value.forEach((evaluator) => {
    evaluator?.heuristicQuestions?.forEach((heuristic) => {
      heuristic?.heuristicQuestions?.forEach((question) => {
        const answer = question?.heuristicAnswer
        const frequency = Number(answer?.frequency)
        const severity = Number(answer?.severity)
        if (Number.isFinite(frequency)) values.frequency.push(frequency)
        if (Number.isFinite(severity)) values.severity.push(severity)
      })
    })
  })

  return {
    frequency: metricSummary(values.frequency),
    severity: metricSummary(values.severity),
    evaluators: showFinalResult.value.evaluators,
    comments: showFinalResult.value.totalComments,
    images: showFinalResult.value.totalImages,
  }
})

const traditionalEvaluatorStatistics = computed(() => {
  const header = [
    { title: 'Evaluator', value: 'evaluator', align: 'start' },
    {
      title: t('HeuristicsTestView.answer.frequency'),
      value: 'frequencyAverage',
      align: 'center',
    },
    {
      title: t('HeuristicsTestView.answer.severity'),
      value: 'severityAverage',
      align: 'center',
    },
    {
      title: t('HeuristicsTestAnswer.titles.totalTime'),
      value: 'totalTime',
      align: 'center',
    },
    { title: t('common.comments'), value: 'comments', align: 'center' },
    { title: t('common.images'), value: 'images', align: 'center' },
    {
      title: t('HeuristicsTestAnswer.titles.lastUpdate'),
      value: 'lastUpdate',
      align: 'center',
    },
  ]

  if (!traditionalMetrics.value) return { header, items: [] }

  const items = answers.value
    .filter((evaluator) => evaluator?.submitted)
    .map((evaluator, index) => {
      const frequencyValues = []
      const severityValues = []
      let totalTimeMs = 0
      let comments = 0
      let images = 0

      evaluator.heuristicQuestions?.forEach((heuristic) => {
        totalTimeMs += heuristicTimeToMs(heuristic?.timeSpent)
        heuristic.heuristicQuestions?.forEach((question) => {
          const answer = question?.heuristicAnswer || {}
          const frequency = Number(answer.frequency)
          const severity = Number(answer.severity)
          if (Number.isFinite(frequency)) frequencyValues.push(frequency)
          if (Number.isFinite(severity)) severityValues.push(severity)
          comments += Array.isArray(question.comments)
            ? question.comments.length
            : question.heuristicComment?.trim()
              ? 1
              : 0
          images += Array.isArray(question.images)
            ? question.images.length
            : question.answerImageUrl
              ? 1
              : 0
        })
      })

      return {
        evaluator: evaluator.userDocId || `Ev${index + 1}`,
        frequencyAverage: metricAverage(frequencyValues),
        severityAverage: metricAverage(severityValues),
        totalTime: formatDuration(totalTimeMs),
        comments,
        images,
        lastUpdate: evaluator.lastUpdate
          ? new Date(evaluator.lastUpdate).toLocaleString()
          : '-',
      }
    })

  return { header, items }
})

const optionResponseTotals = computed(() => {
  const options = Array.isArray(test.value?.testOptions)
    ? test.value.testOptions
    : []
  const totals = options.map((option) => ({
    value: option.value,
    text: option.text || String(option.value),
    total: 0,
  }))
  const totalsByValue = new Map(
    totals.map((item) => [String(item.value), item]),
  )

  answers.value.forEach((evaluator) => {
    evaluator?.heuristicQuestions?.forEach((heuristic) => {
      heuristic?.heuristicQuestions?.forEach((question) => {
        const answer = question?.heuristicAnswer
        const value = answer?.custom?.value ?? answer?.value
        if (value === null || value === undefined || value === '') return

        const key = String(value)
        if (!totalsByValue.has(key)) {
          const item = {
            value,
            text: answer?.custom?.text || String(value),
            total: 0,
          }
          totals.push(item)
          totalsByValue.set(key, item)
        }
        totalsByValue.get(key).total += 1
      })
    })
  })

  return totals
})

const evaluationOverview = computed(() => {
  const totalHeuristics = Array.isArray(test.value?.testStructure)
    ? test.value.testStructure.length
    : 0
  const totalResponses = answers.value.reduce(
    (total, evaluator) =>
      total +
      (evaluator?.heuristicQuestions || []).reduce(
        (heuristicTotal, heuristic) =>
          heuristicTotal + (heuristic?.heuristicQuestions?.length || 0),
        0,
      ),
    0,
  )
  const answeredResponses = answers.value.reduce(
    (total, evaluator) =>
      total +
      (evaluator?.heuristicQuestions || []).reduce(
        (heuristicTotal, heuristic) =>
          heuristicTotal +
          (heuristic?.heuristicQuestions || []).filter((question) => {
            const answer = question?.heuristicAnswer
            return answer?.text || answer?.custom?.text || answer?.value != null
          }).length,
        0,
      ),
    0,
  )

  return {
    totalHeuristics,
    totalResponses,
    answeredResponses,
    pendingResponses: Math.max(totalResponses - answeredResponses, 0),
    coverage: totalResponses
      ? Math.round((answeredResponses / totalResponses) * 100)
      : 0,
  }
})

const testTitle = computed(
  () => test.value?.testTitle || test.value?.title || test.value?.name || '',
)

const testBundlePayload = computed(() =>
  buildHeuristicTestBundlePayload({
    test: test.value,
    testAnswerDocument: testAnswerDocument.value,
    evaluatorItems: evaluatorStatistics.value?.items || [],
  }),
)

const singleEvaluatorIdentity = computed(() => {
  if (Number(showFinalResult.value?.evaluators) !== 1) return ''

  const evaluatorUserDocId =
    resultEvaluator.value?.find((item) => item?.userDocId)?.userDocId || ''

  if (!evaluatorUserDocId) return ''

  const participants = [
    test.value?.testAdmin,
    ...(test.value?.cooperators || []),
  ]
  const evaluator = participants.find(
    (item) => item?.userDocId === evaluatorUserDocId,
  )

  return (
    evaluator?.fullName ||
    evaluator?.name ||
    evaluator?.displayName ||
    evaluator?.email ||
    evaluatorUserDocId
  )
})

const checkIfNan = (value) => {
  return !isNaN(Number(value)) ? value : '-'
}

const getColor = (value, max, min) => {
  value = Number(value)
  max = Number(max) || 0
  min = Number(min) || 0

  if (value == null || Number.isNaN(Number(value))) return 'grey'
  if (value === 0) return 'red'
  if (max === min) return 'green'

  const h = (max - min) / 4

  if (value <= min + 1 * h) return 'amber'
  if (value <= min + 2 * h) return 'orange lighten-1'
  if (value <= min + 3 * h) return 'lime'
  return 'green'
}

const getColorPorcentage = (value) => {
  value = Number(value) || 0
  if (value <= 20) return 'red'
  else if (value <= 40) return 'ambar'
  else if (value <= 60) return 'orange lighten-1'
  else if (value <= 80) return 'lime'
  else return 'green'
}

const goToDataHeuristic = (item) => {
  const selectHeuristic =
    heuristicsEvaluator.value && heuristicsEvaluator.value.items
      ? heuristicsEvaluator.value.items.findIndex((h) => h.heuristic === item)
      : -1
  if (selectHeuristic >= 0) {
    router
      .push(`/analyticsview/${props.id}/${selectHeuristic}`)
      .catch((err) => {
        if (err.name !== 'NavigationDuplicated') {
        }
      })
  }
}

const goToCoops = () => {
  router.push(`/heuristic/edit/${test.value.id}`)
  emit('goToCoops')
}

const usuability_percentage_array = () => {
  const teste = heuristicsStatistics.value
  const scores = []
  if (teste && teste.items && Array.isArray(teste.items)) {
    for (let i = 0; i < teste.items.length; i++) {
      scores.push(teste.items[i].percentage || '0.00')
    }
  }
  store.dispatch('setScoresPercentage', scores)
  array_scores.value = scores
  return scores
}

const pythonFunction = async () => {
  const caminhoTestStructure = store.state.Tests.Test.testStructure || []
  const caminhoTestWeights = store.state.Tests.Test.testWeights || []
  const caminhoTestScore = store.state.Tests.scoresPercentage || []

  try {
    const response = await axios.post(
      process.env.VUE_APP_CLOUD_FUNCTIONS_URL + '/say_hello',
      {
        caminhoTestStructure,
        caminhoTestWeights,
        caminhoTestScore,
      },
    )
    const data = response.data

    decisionmatrix.value = data.decisionmatrix
    tabelacompleta.value = data.tabelacompleta
    relative.value = data.relative
    usability_total.value = data.usability_total
  } catch {}
}

const DownloadEvaluatorCsv = () => {
  loading.value = true
  const headers = evaluatorStatistics.value.header
    .map((header) => header.text)
    .join(',')
  const rows = evaluatorStatistics.value.items
    .map((item) =>
      evaluatorStatistics.value.header
        .map((header) => item[header.value] || '')
        .join(','),
    )
    .join('\n')
  const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'evaluatorStatistics.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const setTab = (value) => {
  tab.value = value
  ind.value = 0
}

watch(answers, () => {
  if (
    testAnswerDocument.value &&
    (answers.value !== null || answers.value.length > 0)
  ) {
    resultEvaluator.value = statistics()
    intro.value = answers.value.length === 0
  }
})

// Watch testAnswerDocument to trigger usuability_percentage_array when dependencies are ready
watch(
  () => [testAnswerDocument.value, test.value, evaluatorStatistics.value],
  ([newTestAnswerDoc, newTest, newEvaluatorStats]) => {
    if (
      newTestAnswerDoc &&
      newTest &&
      newTest.testOptions &&
      newEvaluatorStats &&
      Array.isArray(newEvaluatorStats.items)
    ) {
      usuability_percentage_array()
    }
  },
  { immediate: true, deep: true },
)

onBeforeMount(async () => {
  const studyId = props.id || route.params.id
  if (studyId && !store.getters.test?.id) {
    await store.dispatch('getStudy', { id: studyId })
  }
  await store.dispatch('getCurrentTestAnswerDoc')
})

onMounted(() => {
  pythonFunction()

  // Debug API removed for production
})
</script>

<style scoped>
.titleView {
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}

.subtitleView {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}

.scroll {
  overflow-y: auto;
  overflow-x: hidden;
}

.cardStyle {
  background-color: transparent;
  border: 0.2px solid rgba(0, 0, 0, 0.25);
}

.tab-text {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: center;
  color: #000000;
}

.list-scroll {
  height: 508px;
  overflow: auto;
}

/* Nav bar list scroll bar */
/* width */
.list-scroll::-webkit-scrollbar {
  width: 7px;
}

/* Track */
.list-scroll::-webkit-scrollbar-track {
  background: none;
}

/* Handle */
.list-scroll::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 4px;
}

/* Handle on hover */
.list-scroll::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}

.weightsStatisticsStyle {
  border-radius: 20px;
  border: 0.2px solid #fca326;
  width: 950px;
}

.radar {
  background: #fff;
}

.if-card {
  border-radius: 15px;
  border: 0.2px solid #fca326;
  width: 970px;
  font-size: 18px;
}

.v-chip {
  min-width: 50px;
  justify-content: center;
}
</style>
