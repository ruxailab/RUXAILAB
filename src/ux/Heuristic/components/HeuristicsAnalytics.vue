<template>
  <div v-if="answers">
    <IntroAnalytics v-if="answers != null && intro" @go-to-coops="goToCoops" />

    <ShowInfo v-if="answers != null && !intro && test">
      <template #content>
        <div class="ma-0 pa-0">
          <v-card flat rounded="xl" style="background: #f5f7ff">
            <v-row v-if="resultHeuristics" class="ma-0 pa-0">
              <!--Heuristics List-->
              <v-col class="ma-0 pa-0" cols="2">
                <v-list border rounded density="compact" height="560px">
                  <v-list-subheader>{{
                    $t('Dashboard.cards.heuristics')
                  }}</v-list-subheader>
                  <v-divider />
                  <v-list
                    color="#fca326"
                    density="compact"
                    height="470px"
                    class="list-scroll"
                  >
                    <v-list-item
                      v-for="(item, i) in test.testStructure"
                      :key="i"
                      :value="i"
                      :active="i === heuristicSelect"
                      @click="heuristicSelect = i"
                    >
                      <template v-if="i === heuristicSelect" #prepend>
                        <v-icon>mdi-chevron-right</v-icon>
                      </template>
                      <v-list-item-title>
                        {{ `H${item.id + 1} - ${item.title}` }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-list>
              </v-col>
              <v-divider vertical inset />
              <!--Questions List-->
              <v-col
                v-if="
                  heuristicSelect !== null &&
                  test.testStructure[heuristicSelect]
                "
                class="ma-0 pa-0"
                cols="3"
              >
                <v-list border rounded density="compact" height="560px">
                  <v-list-subheader>
                    {{ test.testStructure[heuristicSelect].title }} - Questions
                  </v-list-subheader>
                  <v-divider />
                  <v-list
                    density="compact"
                    height="470px"
                    color="#fca326"
                    class="list-scroll"
                  >
                    <v-list-item
                      :value="-1"
                      :active="questionSelect === -1"
                      @click="questionSelect = -1"
                    >
                      <template v-if="questionSelect === -1" #prepend>
                        <v-icon>mdi-chevron-right</v-icon>
                      </template>
                      <v-list-item-title>Data Table</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      v-for="(item, i) in test.testStructure[heuristicSelect]
                        .questions"
                      :key="i"
                      :value="i"
                      :active="i === questionSelect"
                      @click="questionSelect = i"
                    >
                      <template v-if="i === questionSelect" #prepend>
                        <v-icon>mdi-chevron-right</v-icon>
                      </template>
                      <v-list-item-title>
                        {{ `Q${item.id + 1} - ${item.title}` }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-list>
              </v-col>
              <!--Content-->
              <v-col
                v-if="
                  questionSelect !== null &&
                  heuristicSelect !== null &&
                  test.testStructure[heuristicSelect]
                "
                class="ma-0 pa-0"
                cols="7"
              >
                <v-card border rounded flat height="560px" elevation-0>
                  <v-list-subheader v-if="questionSelect != -1" class="pa-2">
                    {{
                      test.testStructure[heuristicSelect].questions[
                        questionSelect
                      ].title
                    }}
                  </v-list-subheader>
                  <v-list-subheader v-else class="pa-2">
                    Data Table
                  </v-list-subheader>
                  <v-divider />
                  <!-- DATA TABLE CONTENT TYPE -->
                  <v-row v-if="questionSelect == -1">
                    <v-col>
                      <v-text-field
                        v-model="search"
                        class="mx-3"
                        append-icon="mdi-magnify"
                        label="Search"
                      />
                      <v-data-table
                        class="elevation-1"
                        :headers="headersHeuristic"
                        :items="itemsHeuristic"
                        :search="search"
                        height="375px"
                        density="compact"
                      >
                        <template
                          v-for="header in headersHeuristic"
                          #[`item.${header.value}`]="{ item }"
                        >
                          <div
                            v-if="item[header.value].uid"
                            :key="item[header.value].uid"
                          >
                            {{ item[header.value].uid }}
                          </div>
                          <div
                            v-else
                            :key="item[header.value].heuristicAnswer.value"
                          >
                            <div
                              v-if="
                                item[header.value].heuristicAnswer.value == null
                              "
                            >
                              -
                            </div>
                            <div v-else>
                              {{ item[header.value].heuristicAnswer.value }}
                            </div>
                          </div>
                        </template>
                      </v-data-table>
                    </v-col>
                  </v-row>
                  <v-row v-else class="ma-0 pa-0">
                    <v-card width="100%" height="560px">
                      <v-tabs
                        v-model="ind"
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
                          Comments
                        </v-tab>
                        <v-tab
                          class="tab-text"
                          style="text-transform: none !important"
                          @click="ind = 1"
                        >
                          Chart
                        </v-tab>
                      </v-tabs>
                      <v-col v-if="ind == 1">
                        <v-row justify="center">
                          <v-col cols="10">
                            <BarChart
                              v-if="questionGraph"
                              :labels="questionGraph.label"
                              :data="questionGraph.data"
                              legend="Quantity"
                            />
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col v-if="ind == 0">
                        <v-row
                          class="list-scroll"
                          style="height: 430px"
                          justify="center"
                        >
                          <v-col cols="10">
                            <v-timeline density="compact" align="start">
                              <v-timeline-item
                                v-for="(result, index) in itemsHeuristic"
                                :key="index"
                                fill-dot
                                dot-color="#fca326"
                                icon="mdi-message-reply-text"
                              >
                                <v-card
                                  v-if="result[questionSelect].heuristicComment"
                                  class="elevation-2"
                                >
                                  <v-card-text>
                                    {{
                                      result[questionSelect].heuristicComment
                                    }}
                                  </v-card-text>
                                  <img
                                    v-if="result[questionSelect].answerImageUrl"
                                    height="200"
                                    :src="result[questionSelect].answerImageUrl"
                                  />
                                </v-card>
                              </v-timeline-item>
                            </v-timeline>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-card>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
          <v-card
            v-if="heuristicSelect !== null"
            class="mt-6 pa-6"
            rounded="xl"
            elevation="0"
            style="background: #ffffff"
          >
            <!-- Title -->
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-caption text-grey-darken-1">
                  Behavioral Analytics
                </div>
                <div class="text-h6 font-weight-bold">
                  Evaluator Time Analysis
                </div>
              </div>
            </div>

            <!-- KPI SUMMARY -->
            <v-row class="mb-6">
              <v-col cols="12" md="4">
                <v-card class="pa-4 rounded-xl" elevation="0" color="#f8f9fc">
                  <div class="text-caption text-grey">Total Time</div>
                  <div class="text-h6 font-weight-bold mt-1">
                    {{ formatTime(aggregatedTime.overallTotalSec) }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card class="pa-4 rounded-xl" elevation="0" color="#f8f9fc">
                  <div class="text-caption text-grey">Avg / Evaluator</div>
                  <div class="text-h6 font-weight-bold mt-1">
                    {{ formatTime(aggregatedTime.meanPerEvaluatorSec) }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card class="pa-4 rounded-xl" elevation="0" color="#f8f9fc">
                  <div class="text-caption text-grey">Evaluators</div>
                  <div class="text-h6 font-weight-bold mt-1">
                    {{ Object.keys(answers).length }}
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- TABLE 1: PER EVALUATOR -->
            <div class="text-subtitle-2 font-weight-medium mb-2">
              Time Spent Per Evaluator
            </div>

            <v-data-table
              :headers="headersTime"
              :items="itemsTime"
              density="comfortable"
              fixed-header
              height="300px"
              class="mb-8"
            >
              <template #item.total="{ item }">
                <span class="font-weight-bold">
                  {{ item.total }}
                </span>
              </template>
            </v-data-table>

            <!-- TABLE 2: PER HEURISTIC -->
            <div class="text-subtitle-2 font-weight-medium mb-2">
              Time Spent Per Heuristic
            </div>

            <v-data-table
              :headers="headersHeuristicTime"
              :items="itemsHeuristicTime"
              density="comfortable"
              fixed-header
              height="260px"
            >
              <!-- Overall row -->
              <template #body.append>
                <tr>
                  <td>Overall</td>
                  <td class="text-center font-weight-bold">
                    {{ formatTime(aggregatedTime.overallTotalSec) }}
                  </td>
                  <td class="text-center font-weight-bold">
                    {{ formatTime(aggregatedTime.meanPerEvaluatorSec) }}
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card>
        </div>
      </template>
    </ShowInfo>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import BarChart from '@/ux/Heuristic/components/charts/BarChart.vue'
import IntroAnalytics from '@/shared/components/introduction_cards/IntroAnalytics.vue'
import UserController from '@/features/auth/controllers/UserController'

const store = useStore()
const route = useRoute()
const userController = new UserController()

const emit = defineEmits(['goToCoops'])

const search = ref('')
const ind = ref(0)
const resultHeuristics = ref([])
const heuristicSelect = ref(null)
const questionSelect = ref(null)
const intro = ref(null)
const evaluatorNamesCache = ref({})

const test = computed(() => store.getters.test)

const answers = computed(() => {
  if (!store.getters.testAnswerDocument) {
    return {}
  }
  return store.getters.testAnswerDocument.heuristicAnswers
})

const loading = computed(() => !Object.values(answers.value).length)

const headersHeuristic = computed(() => {
  const header = [
    {
      title: 'Evaluator',
      align: 'start',
      value: 'uid',
    },
  ]
  if (heuristicSelect.value !== null) {
    test.value.testStructure[heuristicSelect.value].questions.forEach(
      (question) => {
        header.push({
          title: `Q${question.id + 1}`,
          align: 'center',
          value: question.id.toString(),
        })
      },
    )
  }
  return header
})

const itemsHeuristic = computed(() => {
  const items = []
  if (heuristicSelect.value !== null) {
    Object.values(answers.value).forEach((answer) => {
      items.push({
        uid: { uid: answer.userDocId },
        ...Object.fromEntries(
          Object.entries(
            answer.heuristicQuestions[heuristicSelect.value].heuristicQuestions,
          ).map(([id, val]) => [id.toString(), val]),
        ),
      })
    })
  }
  return items
})

// Headers for time table: Evaluator + per-heuristic + totals/mean
const headersTime = computed(() => {
  const header = [
    {
      title: 'Evaluator',
      align: 'start',
      value: 'uid',
    },
  ]
  if (test.value?.testStructure) {
    test.value.testStructure.forEach((heu, idx) => {
      header.push({
        title: `H${idx + 1}`,
        align: 'center',
        value: `h${idx}`,
      })
    })
  }
  header.push({ title: 'Total', align: 'center', value: 'total' })
  header.push({ title: 'Avg / Question', align: 'center', value: 'mean' })
  return header
})

const itemsTime = computed(() => {
  const items = []
  if (!test.value?.testStructure) return items

  // total questions in test (used for mean per evaluator)
  const totalQuestions = test.value.testStructure.reduce(
    (acc, h) => acc + (h.questions?.length || 0),
    0,
  )

  Object.values(answers.value).forEach((answer) => {
    const row = { uid: getEvaluatorName(answer.userDocId) }
    let totalMs = 0
    test.value.testStructure.forEach((heu, idx) => {
      const heuAnswer = answer.heuristicQuestions?.[idx]
      const sumMs = heuAnswer?.heuristicQuestions
        ? heuAnswer.heuristicQuestions.reduce(
            (s, q) => s + (q.timeSpent || 0),
            0,
          )
        : 0
      const seconds = sumMs / 1000
      row[`h${idx}`] = formatTime(seconds)
      totalMs += sumMs
    })
    const totalSeconds = Math.round(totalMs / 1000)
    const meanSeconds = totalQuestions
      ? Math.round(totalMs / 1000 / totalQuestions)
      : 0
    row.total = formatTime(totalSeconds)
    row.mean = formatTime(meanSeconds)
    items.push(row)
  })

  return items
})

const headersHeuristicTime = [
  { title: 'Heuristic', align: 'start', value: 'heuristic' },
  { title: 'Total Time', align: 'center', value: 'total' },
  { title: 'Mean per Evaluator', align: 'center', value: 'mean' },
]

// Aggregated metrics across evaluators
const aggregatedTime = computed(() => {
  const result = {
    perHeuristicTotalsSec: [],
    perHeuristicMeanSec: [],
    overallTotalSec: 0,
    meanPerEvaluatorSec: 0,
  }

  if (!test.value?.testStructure) return result

  const evaluators = Object.values(answers.value)
  const evaluatorsCount = evaluators.length || 0
  let overallTotalMs = 0

  test.value.testStructure.forEach((heu, idx) => {
    let sumMs = 0
    evaluators.forEach((answer) => {
      const heuAnswer = answer.heuristicQuestions?.[idx]
      if (heuAnswer?.heuristicQuestions) {
        sumMs += heuAnswer.heuristicQuestions.reduce(
          (s, q) => s + (q.timeSpent || 0),
          0,
        )
      }
    })
    result.perHeuristicTotalsSec.push(sumMs / 1000)
    result.perHeuristicMeanSec.push(
      evaluatorsCount ? sumMs / 1000 / evaluatorsCount : 0,
    )
    overallTotalMs += sumMs
  })

  result.overallTotalSec = Math.round(overallTotalMs / 1000)
  result.meanPerEvaluatorSec = evaluatorsCount
    ? Math.round(overallTotalMs / 1000 / evaluatorsCount)
    : 0
  return result
})

const itemsHeuristicTime = computed(() => {
  if (!aggregatedTime.value.perHeuristicTotalsSec.length) return []

  return aggregatedTime.value.perHeuristicTotalsSec.map((total, idx) => ({
    heuristic: `H${idx + 1}`,
    total: formatTime(total),
    mean: formatTime(aggregatedTime.value.perHeuristicMeanSec[idx]),
  }))
})

const questionGraph = computed(() => {
  const { testOptions: options } = test.value

  const graph = {
    label: [...options.map((op) => op.text)],
    data: [...options.map(() => 0)],
  }

  if (heuristicSelect.value !== null && questionSelect.value !== null) {
    Object.values(answers.value).forEach((userAnswer) => {
      const question =
        userAnswer.heuristicQuestions[heuristicSelect.value].heuristicQuestions[
          questionSelect.value
        ]

      const optionSelect = options.find(
        (op) => op.text === question.heuristicAnswer.text,
      )
      if (optionSelect) {
        const optionIndex = graph.label.indexOf(optionSelect.text)
        graph.data[optionIndex] += 1
      }
    })
  }
  return graph
})

watch(
  answers,
  () => {
    if (Object.values(answers.value)) {
      intro.value = !Object.values(answers.value).length
    }
  },
  { deep: true },
)

watch(heuristicSelect, () => {
  questionSelect.value = -1
})

watch(questionSelect, () => {
  ind.value = 0
})

onMounted(async () => {
  await store.dispatch('getCurrentTestAnswerDoc')
  // Handle heuristic query param if present
  if (route.query.heuristic) {
    heuristicSelect.value = Number(route.query.heuristic)
  }
  await fetchEvaluatorNames()
})

// Fetch user names for all evaluators and cache them
const fetchEvaluatorNames = async () => {
  try {
    const userIds = Object.keys(answers.value)
    for (const userId of userIds) {
      if (!evaluatorNamesCache.value[userId]) {
        const user = await userController.getById(userId)
        // Display username or email, with email as fallback
        evaluatorNamesCache.value[userId] =
          user.username || user.email || userId
      }
    }
  } catch (error) {
    console.warn('Error fetching evaluator names:', error)
  }
}

// Helper to get evaluator name from cache
const getEvaluatorName = (userDocId) => {
  return evaluatorNamesCache.value[userDocId] || userDocId
}

const goToCoops = () => {
  emit('goToCoops')
}

const formatTime = (seconds) => {
  if (!seconds || seconds <= 0) return '0s'

  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }

  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0) parts.push(`${secs}s`)

  return parts.join(' ')
}
</script>

<style scoped>
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
</style>
