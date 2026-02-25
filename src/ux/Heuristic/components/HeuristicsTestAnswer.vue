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
            color="#FCA326"
            class="ml-4"
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
            <v-card
              v-if="tab == 0"
              flat
              rounded="xl"
              style="background: #f5f7ff"
            >
              <v-card-title class="subtitleView">
                {{ $t('HeuristicsTestAnswer.titles.statistics') }}
              </v-card-title>
              <v-divider />
              <v-row justify="space-around" class="ma-0">
                <v-col cols="10">
                  <v-card class="cardStyle my-6" flat>
                    <v-row justify="space-around" class="ma-0">
                      <v-col cols="4">
                        <v-row justify="center" class="ma-0">
                          <v-card-title class="mt-4">
                            {{
                              $t(
                                'HeuristicsTestAnswer.statistics.usabilityPercentage',
                              )
                            }}
                          </v-card-title>
                          <v-card-text>
                            <v-row align="center" justify="center">
                              <p class="text-h2">
                                {{ showFinalResult.average }}
                              </p>
                            </v-row>
                          </v-card-text>
                        </v-row>
                      </v-col>
                      <v-divider vertical />
                      <v-col>
                        <v-list class="bg-transparent">
                          <v-list-item>
                            <template #prepend>
                              <v-icon>mdi-arrow-up-bold-hexagon-outline</v-icon>
                            </template>
                            <v-list-item-title>
                              {{ $t('HeuristicsTestAnswer.statistics.max') }}
                            </v-list-item-title>
                            <v-list-item-subtitle class="text-right">
                              {{ showFinalResult.max }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <template #prepend>
                              <v-icon
                                >mdi-arrow-down-bold-hexagon-outline</v-icon
                              >
                            </template>
                            <v-list-item-title>
                              {{ $t('HeuristicsTestAnswer.statistics.min') }}
                            </v-list-item-title>
                            <v-list-item-subtitle class="text-right">
                              {{ showFinalResult.min }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <template #prepend>
                              <v-icon>mdi-plus-minus</v-icon>
                            </template>
                            <v-list-item-title>
                              {{ $t('HeuristicsTestAnswer.statistics.std') }}
                            </v-list-item-title>
                            <v-list-item-subtitle class="text-right">
                              {{ showFinalResult.sd }}
                            </v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>

            <!-- Tab 2 - Evaluators -->
            <v-card
              v-if="tab == 1"
              flat
              rounded="xl"
              style="background: #f5f7ff"
              class="pb-3"
            >
              <v-card-title class="subtitleView">
                {{ $t('HeuristicsTestAnswer.titles.evaluators') }}
              </v-card-title>
              <v-divider />
              <v-tabs
                bg-color="transparent"
                color="grey-darken-2"
                class="mt-2"
                align-tabs="center"
              >
                <v-tab
                  class="tab-text"
                  style="text-transform: none !important"
                  @click="ind = 0"
                >
                  {{ $t('HeuristicsTestAnswer.evaluators.headers.table') }}
                </v-tab>
                <v-tab
                  class="tab-text"
                  style="text-transform: none !important"
                  @click="ind = 1"
                >
                  {{ $t('HeuristicsTestAnswer.evaluators.headers.graphic') }}
                </v-tab>
              </v-tabs>
              <v-row justify="center">
                <v-col v-if="ind == 0" cols="10">
                  <v-data-table
                    density="compact"
                    :headers="evaluatorStatistics.header"
                    :items="evaluatorStatistics.items"
                    :items-per-page="15"
                    class="elevation-0 cardStyle mx-2 mt-3 mb-6"
                  >
                    <template #item.result="{ item }">
                      <v-chip
                        v-if="isNaN(item.result)"
                        :color="getColorPorcentage(item.result)"
                      >
                        0.0%
                      </v-chip>
                      <v-chip v-else :color="getColorPorcentage(item.result)">
                        {{ item.result }}%
                      </v-chip>
                    </template>
                    <template #item.answered="{ item }">
                      {{ item.answered }}%
                    </template>
                  </v-data-table>
                  <v-btn
                    class="mx-2"
                    size="small"
                    variant="outlined"
                    :loading="loading"
                    :disabled="loading"
                    @click="DownloadEvaluatorCsv"
                  >
                    Export as CSV
                    <v-icon end> mdi-download </v-icon>
                  </v-btn>
                </v-col>
                <v-col v-if="ind == 1" cols="10">
                  <RadarChart
                    v-if="evaluatorStatistics.items.length >= 3"
                    :labels="
                      evaluatorStatistics.items.map(
                        (item) => `${item.evaluator} - ${item.result}%`,
                      )
                    "
                    :data="evaluatorStatistics.items.map((item) => item.result)"
                  />
                  <v-card
                    v-else
                    flat
                    class="mx-auto mt-10 mb-10 py-6 px-3 if-card"
                    align="center"
                    width="970px"
                  >
                    {{
                      $t(
                        'HeuristicsTestAnswer.evaluators.messages.graphForMoreThan3',
                      )
                    }}
                  </v-card>
                </v-col>
              </v-row>
            </v-card>

            <!-- Tab 3 - Heuristics -->
            <v-card
              v-if="tab == 2"
              rounded="xl"
              flat
              class="mb-6 py-2"
              style="background: #f5f7ff"
            >
              <v-card
                v-if="evaluatorStatistics.items.length <= 1"
                key="heuristics-insufficient"
                class="mx-auto mt-10 mb-10 py-6 if-card"
                align="center"
                width="970px"
              >
                {{
                  $t(
                    'HeuristicsTestAnswer.heuristics.messages.needMoreThan1Answer',
                  )
                }}
              </v-card>
              <div v-else key="heuristics-data">
                <v-card-title class="subtitleView">
                  {{
                    $t('HeuristicsTestAnswer.heuristics.headers.heuristicsData')
                  }}
                </v-card-title>
                <v-divider />
                <v-tabs
                  bg-color="transparent"
                  color="grey-darken-2"
                  class="mt-2"
                  align-tabs="center"
                >
                  <v-tab
                    class="tab-text"
                    style="text-transform: none !important"
                    @click="ind = 0"
                  >
                    {{
                      $t(
                        'HeuristicsTestAnswer.heuristics.headers.answersByEvaluator',
                      )
                    }}
                  </v-tab>
                  <v-tab
                    class="tab-text"
                    style="text-transform: none !important"
                    @click="ind = 1"
                  >
                    {{
                      $t(
                        'HeuristicsTestAnswer.heuristics.headers.answersByHeuristics',
                      )
                    }}
                  </v-tab>
                  <v-tab
                    class="tab-text"
                    style="text-transform: none !important"
                    @click="ind = 2"
                  >
                    {{ $t('HeuristicsTestAnswer.heuristics.headers.graphic') }}
                  </v-tab>
                  <v-tab
                    class="tab-text"
                    style="text-transform: none !important"
                    @click="ind = 3"
                  >
                    {{ $t('HeuristicsTestAnswer.heuristics.headers.weights') }}
                  </v-tab>
                </v-tabs>
                <v-row justify="center">
                  <v-col cols="10">
                    <v-row>
                      <!-- Bottom Tab 1 -->
                      <v-col v-if="ind == 0" cols="12">
                        <v-data-table
                          :headers="heuristicsEvaluator.header"
                          :items="heuristicsEvaluator.items"
                          :items-per-page="15"
                          class="elevation-0 cardStyle mx-2 mt-3 mb-6"
                          density="compact"
                        >
                          <template
                            v-for="header in heuristicsEvaluator.header"
                            :key="header.value"
                            #[`item.${header.value}`]="{ item }"
                          >
                            <v-chip
                              v-if="header.value != 'heuristic'"
                              :color="
                                getColor(item[header.value], item.max, item.min)
                              "
                              class="chip"
                            >
                              {{
                                item[header.value]
                                  ? item[header.value].toFixed(2)
                                  : 0
                              }}
                            </v-chip>
                            <v-btn
                              v-else
                              variant="text"
                              @click="goToDataHeuristic(item.heuristic)"
                            >
                              {{ item[header.value] }}
                            </v-btn>
                          </template>
                        </v-data-table>
                      </v-col>
                      <!-- Bottom Tab 2 -->
                      <v-col v-if="ind == 1" cols="12">
                        <v-data-table
                          :headers="heuristicsStatistics.header"
                          :items="heuristicsStatistics.items"
                          :items-per-page="15"
                          class="elevation-0 cardStyle mx-2 mt-3 mb-6"
                          density="compact"
                        >
                          <template #item.percentage="{ item }">
                            <div style="padding-top: 2px; padding-bottom: 2px">
                              <v-chip
                                style="width: 35%"
                                :color="
                                  getColor(item.average, item.max, item.min)
                                "
                              >
                                {{ checkIfNan(item.percentage) }}
                              </v-chip>
                            </div>
                          </template>
                          <template #item.sd="{ item }">
                            {{ checkIfNan(item.sd) }}
                          </template>
                          <template #item.average="{ item }">
                            {{ checkIfNan(item.average) }}
                          </template>
                        </v-data-table>
                      </v-col>
                      <!-- Bottom Tab 3 -->
                      <v-col v-if="ind == 2" cols="12">
                        <BarChart
                          class="mx-2 mt-3 mb-6"
                          :labels="
                            heuristicsStatistics.items.map((item) => item.name)
                          "
                          :data="
                            heuristicsStatistics.items.map(
                              (item) => item.average,
                            )
                          "
                          legend="Average"
                        />
                      </v-col>
                      <!-- Bottom Tab 4 -->
                      <v-col v-if="ind == 3" cols="12" align="center">
                        <v-card
                          v-if="relative === null"
                          class="mx-auto mt-10 mb-10 py-6 if-card"
                          align="center"
                          width="970px"
                        >
                          {{
                            $t(
                              'HeuristicsTestAnswer.heuristics.messages.runWeightFunction',
                            )
                          }}
                        </v-card>
                        <div v-else>
                          <v-row align="center" justify="space-around">
                            <v-col md="4" sm="8">
                              <v-card
                                align="center"
                                class="elevation-4 weightsStatisticsStyle mt-6 py-4 mb-6 mx-auto"
                                width="950px"
                              >
                                <v-card-title
                                  class="mt-4 mb-4 font-weight-bold"
                                >
                                  <v-row align="center" justify="center">
                                    Usability Percentage <br />
                                    With Weights
                                  </v-row>
                                </v-card-title>
                                <v-card-text>
                                  <v-row
                                    align="center"
                                    justify="center mt-2 mb-2"
                                  >
                                    <p class="text-h2">
                                      {{ usabilityTotalFix }}
                                    </p>
                                  </v-row>
                                </v-card-text>
                              </v-card>
                            </v-col>
                            <v-col cols="12" sm="6" md="8">
                              <v-card
                                align="center"
                                class="elevation-4 weightsStatisticsStyle mt-6 py-4 px-4 mb-6 mx-auto"
                                width="950px"
                              >
                                <RadarWeight
                                  :labels="
                                    Array.from(
                                      { length: heuristicsLength },
                                      (_, index) => `H ${index + 1}`,
                                    )
                                  "
                                  :data="
                                    weightsStatistics.items.map(
                                      (item) => item.rw,
                                    )
                                  "
                                  :max-value="maxValue"
                                />
                              </v-card>
                            </v-col>
                          </v-row>
                          <v-row align="center" justify="space-around">
                            <v-data-table
                              :headers="weightsStatistics.header"
                              :items="weightsStatistics.items"
                              :items-per-page="10"
                              align="center"
                              class="elevation-4 weightsStatisticsStyle mt-3 mb-6 mx-auto"
                              width="950px"
                            />
                          </v-row>
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </div>
            </v-card>

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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BarChart from '@/ux/Heuristic/components/charts/BarChart.vue'
import RadarChart from '@/shared/components/charts/RadarChart.vue'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import IntroAnswer from '@/shared/components/introduction_cards/IntroAnswer.vue'
import RadarWeight from '@/ux/Heuristic/components/weights_evaluation/RadarWeight.vue'
import HeuristicsAnalytics from '@/ux/Heuristic/components/HeuristicsAnalytics.vue'

import axios from 'axios'
import {
  standardDeviation,
  finalResult,
  statistics,
} from '@/ux/Heuristic/utils/statistics'
import {
  heuristicsStatisticsHeaders,
  weightsStatisticsHeader,
  heuristicsEvaluatorHeader,
} from '@/ux/Heuristic/utils/headers.js'

const store = useStore()
const router = useRouter()
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

const showFinalResult = computed(() => finalResult())

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
      const header = table.header.find((h) => h.text === evaluator.id)
      if (!header) {
        table.header.push({
          text: evaluator.id,
          align: 'center',
          value: evaluator.id,
        })
      }
      if (evaluator.heuristics && Array.isArray(evaluator.heuristics)) {
        evaluator.heuristics.forEach((heuristic) => {
          const item = table.items.find((i) => i.heuristic === heuristic.id)
          if (item) {
            Object.assign(item, {
              [evaluator.id]: heuristic.result,
            })
          } else {
            table.items.push({
              heuristic: heuristic.id,
              max: max * (heuristic.totalQuestions || 0),
              min: min * (heuristic.totalQuestions || 0),
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
      item.max && item.min && item.max !== item.min
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
  await store.dispatch('getCurrentTestAnswerDoc')
})

onMounted(() => {
  pythonFunction()
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
