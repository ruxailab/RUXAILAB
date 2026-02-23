<template>
  <div v-if="answers">
    <IntroAnalytics v-if="answers != null && intro" @go-to-coops="goToCoops" />

    <ShowInfo v-if="answers != null && !intro && test">
      <template #content>
        <div class="ma-0 pa-0">
          <v-card flat rounded="xl" style="background: #f5f7ff">
            <v-row v-if="resultHeuristics" class="ma-0 pa-0">
              <!--Heuristics List-->
              <v-col class="ma-0 pa-0" cols="12" sm="3" md="2">
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
                      <v-list-item-title class="text-truncate">
                        {{ `H${item.id + 1} - ${item.title}` }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-list>
              </v-col>
              <v-divider vertical inset class="d-none d-sm-flex" />
              <!--Questions List-->
              <v-col
                v-if="
                  heuristicSelect !== null &&
                  test.testStructure[heuristicSelect]
                "
                class="ma-0 pa-0"
                cols="12"
                sm="4"
                md="3"
              >
                <v-list border rounded density="compact" height="560px">
                  <v-list-subheader class="text-truncate">
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
                      <v-list-item-title class="text-truncate">
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
                cols="12"
                sm="5"
                md="7"
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
                        <v-tab class="tab-text text-none" @click="ind = 0">
                          Comments
                        </v-tab>
                        <v-tab class="tab-text text-none" @click="ind = 1">
                          Chart
                        </v-tab>
                        <v-tab
                          v-if="test?.trackTime && hasTimeData"
                          class="tab-text text-none"
                          @click="ind = 2"
                        >
                          Time Tracking
                        </v-tab>
                      </v-tabs>
                      <v-col v-if="ind == 1">
                        <v-row justify="center">
                          <v-col cols="12" md="10">
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
                          <v-col cols="12" md="10">
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
                                  <v-card-text class="text-body-2">
                                    {{
                                      result[questionSelect].heuristicComment
                                    }}
                                  </v-card-text>
                                  <v-img
                                    v-if="result[questionSelect].answerImageUrl"
                                    :src="result[questionSelect].answerImageUrl"
                                    max-height="200"
                                    cover
                                  />
                                </v-card>
                              </v-timeline-item>
                            </v-timeline>
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col v-if="ind == 2 && test?.trackTime">
                        <v-row
                          class="list-scroll time-tracking-scroll"
                          justify="center"
                        >
                          <v-col cols="12" lg="11">
                            <!-- Summary Cards -->
                            <v-row class="mb-4" dense>
                              <v-col cols="12" sm="6" md="4">
                                <v-card variant="tonal" color="primary">
                                  <v-card-text class="pa-3">
                                    <div class="d-flex align-center">
                                      <v-icon size="32" class="mr-3"
                                        >mdi-account-group</v-icon
                                      >
                                      <div>
                                        <div class="text-caption">
                                          Total Evaluators
                                        </div>
                                        <div class="text-h6 font-weight-bold">
                                          {{ totalEvaluators }}
                                        </div>
                                      </div>
                                    </div>
                                  </v-card-text>
                                </v-card>
                              </v-col>
                              <v-col cols="12" sm="6" md="4">
                                <v-card variant="tonal" color="success">
                                  <v-card-text class="pa-3">
                                    <div class="d-flex align-center">
                                      <v-icon size="32" class="mr-3"
                                        >mdi-clock-outline</v-icon
                                      >
                                      <div>
                                        <div class="text-caption">
                                          Total Time Spent
                                        </div>
                                        <div class="text-h6 font-weight-bold">
                                          {{
                                            formatTime(totalTimeAllEvaluators)
                                          }}
                                        </div>
                                      </div>
                                    </div>
                                  </v-card-text>
                                </v-card>
                              </v-col>
                              <v-col cols="12" sm="6" md="4">
                                <v-card variant="tonal" color="warning">
                                  <v-card-text class="pa-3">
                                    <div class="d-flex align-center">
                                      <v-icon size="32" class="mr-3"
                                        >mdi-chart-line</v-icon
                                      >
                                      <div>
                                        <div class="text-caption">
                                          Mean Time
                                        </div>
                                        <div class="text-h6 font-weight-bold">
                                          {{
                                            formatTime(meanTimeAllEvaluators)
                                          }}
                                        </div>
                                      </div>
                                    </div>
                                  </v-card-text>
                                </v-card>
                              </v-col>
                            </v-row>

                            <!-- Time per Evaluator and Heuristic Table -->
                            <v-card class="mb-4">
                              <v-card-title
                                class="text-subtitle-1 font-weight-bold bg-grey-lighten-4"
                              >
                                Time per Evaluator and Heuristic
                              </v-card-title>
                              <div class="table-responsive">
                                <v-data-table
                                  :headers="evaluatorHeuristicHeaders"
                                  :items="evaluatorHeuristicTimeData"
                                  density="compact"
                                  :items-per-page="10"
                                >
                                  <template #[`item.timeSpent`]="{ item }">
                                    <span class="font-weight-medium">{{
                                      formatTime(item.timeSpent)
                                    }}</span>
                                  </template>
                                </v-data-table>
                              </div>
                            </v-card>

                            <!-- Totals per Evaluator -->
                            <v-card class="mb-4">
                              <v-card-title
                                class="text-subtitle-1 font-weight-bold bg-grey-lighten-4"
                              >
                                Total Time per Evaluator
                              </v-card-title>
                              <div class="table-responsive">
                                <v-data-table
                                  :headers="evaluatorTotalHeaders"
                                  :items="evaluatorTotals"
                                  density="compact"
                                  hide-default-footer
                                >
                                  <template #[`item.totalTime`]="{ item }">
                                    <span
                                      class="font-weight-bold text-primary"
                                      >{{ formatTime(item.totalTime) }}</span
                                    >
                                  </template>
                                  <template #[`item.meanTime`]="{ item }">
                                    <span class="font-weight-medium">{{
                                      formatTime(item.meanTime)
                                    }}</span>
                                  </template>
                                </v-data-table>
                              </div>
                            </v-card>

                            <!-- Totals per Heuristic -->
                            <v-card>
                              <v-card-title
                                class="text-subtitle-1 font-weight-bold bg-grey-lighten-4"
                              >
                                Total Time per Heuristic
                              </v-card-title>
                              <div class="table-responsive">
                                <v-data-table
                                  :headers="heuristicTotalHeaders"
                                  :items="heuristicTotals"
                                  density="compact"
                                  hide-default-footer
                                >
                                  <template #[`item.totalTime`]="{ item }">
                                    <span
                                      class="font-weight-bold text-primary"
                                      >{{ formatTime(item.totalTime) }}</span
                                    >
                                  </template>
                                  <template #[`item.meanTime`]="{ item }">
                                    <span class="font-weight-medium">{{
                                      formatTime(item.meanTime)
                                    }}</span>
                                  </template>
                                </v-data-table>
                              </div>
                            </v-card>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-card>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
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

const store = useStore()
const route = useRoute()

const emit = defineEmits(['goToCoops'])

const search = ref('')
const ind = ref(0)
const resultHeuristics = ref([])
const heuristicSelect = ref(null)
const questionSelect = ref(null)
const intro = ref(null)

const test = computed(() => store.getters.test)

const answers = computed(() => {
  if (!store.getters.testAnswerDocument) {
    return {}
  }
  return store.getters.testAnswerDocument.heuristicAnswers
})

// Helper function to get user display name (email or ID)
const getUserDisplayName = (userDocId) => {
  if (!test.value?.cooperators || !userDocId) {
    return userDocId || 'Unknown'
  }

  const cooperator = test.value.cooperators.find(
    (coop) => coop.userDocId === userDocId,
  )

  return cooperator?.email || userDocId || 'Unknown'
}

// Helper function to calculate time for a heuristic
const calculateHeuristicTime = (heuristic) => {
  // Time is stored in the first question only to avoid inflation
  return heuristic.heuristicQuestions?.[0]?.timeSpent || 0
}

const hasTimeData = computed(() => {
  if (!answers.value || !test.value?.trackTime) return false

  // Check if any heuristic has time data (stored in first question)
  return Object.values(answers.value).some((answer) =>
    answer.heuristicQuestions?.some((heuristic) => {
      const timeSpent = heuristic.heuristicQuestions?.[0]?.timeSpent || 0
      return timeSpent > 0
    }),
  )
})

// Total number of unique evaluators
const totalEvaluators = computed(() => {
  if (!answers.value) return 0
  return Object.keys(answers.value).length
})

// Total time spent by all evaluators
const totalTimeAllEvaluators = computed(() => {
  if (!answers.value) return 0

  let total = 0
  Object.values(answers.value).forEach((answer) => {
    answer.heuristicQuestions?.forEach((heuristic) => {
      heuristic.heuristicQuestions?.forEach((question) => {
        total += question.timeSpent || 0
      })
    })
  })
  return total
})

// Mean time across all evaluators
const meanTimeAllEvaluators = computed(() => {
  if (totalEvaluators.value === 0) return 0
  return totalTimeAllEvaluators.value / totalEvaluators.value
})

// Headers for evaluator x heuristic table
const evaluatorHeuristicHeaders = computed(() => [
  { title: 'Evaluator', align: 'start', value: 'evaluator' },
  { title: 'Heuristic', align: 'start', value: 'heuristic' },
  { title: 'Time Spent', align: 'end', value: 'timeSpent' },
])

// Data for evaluator x heuristic table
const evaluatorHeuristicTimeData = computed(() => {
  if (!answers.value || !test.value?.testStructure) return []

  const data = []
  Object.values(answers.value).forEach((answer) => {
    answer.heuristicQuestions?.forEach((heuristic, hIndex) => {
      const heuristicTime = calculateHeuristicTime(heuristic)

      if (heuristicTime > 0) {
        data.push({
          evaluator: getUserDisplayName(answer.userDocId),
          heuristic:
            test.value.testStructure[hIndex]?.title || `H${hIndex + 1}`,
          timeSpent: heuristicTime,
        })
      }
    })
  })
  return data
})

// Headers for evaluator totals table
const evaluatorTotalHeaders = computed(() => [
  { title: 'Evaluator', align: 'start', value: 'evaluator' },
  { title: 'Total Time', align: 'end', value: 'totalTime' },
  { title: 'Mean Time per Heuristic', align: 'end', value: 'meanTime' },
])

// Totals per evaluator
const evaluatorTotals = computed(() => {
  if (!answers.value) return []

  const totals = []
  Object.values(answers.value).forEach((answer) => {
    let totalTime = 0
    let heuristicCount = 0

    answer.heuristicQuestions?.forEach((heuristic) => {
      const time = calculateHeuristicTime(heuristic)
      if (time > 0) {
        totalTime += time
        heuristicCount++
      }
    })

    if (totalTime > 0) {
      totals.push({
        evaluator: getUserDisplayName(answer.userDocId),
        totalTime: totalTime,
        meanTime: heuristicCount > 0 ? totalTime / heuristicCount : 0,
      })
    }
  })
  return totals
})

// Headers for heuristic totals table
const heuristicTotalHeaders = computed(() => [
  { title: 'Heuristic', align: 'start', value: 'heuristic' },
  { title: 'Total Time', align: 'end', value: 'totalTime' },
  { title: 'Mean Time per Evaluator', align: 'end', value: 'meanTime' },
])

// Totals per heuristic
const heuristicTotals = computed(() => {
  if (!answers.value || !test.value?.testStructure) return []

  const heuristicTimeMap = {}

  Object.values(answers.value).forEach((answer) => {
    answer.heuristicQuestions?.forEach((heuristic, hIndex) => {
      if (!heuristicTimeMap[hIndex]) {
        heuristicTimeMap[hIndex] = {
          totalTime: 0,
          evaluatorCount: 0,
        }
      }

      let heuristicTime = calculateHeuristicTime(heuristic)

      if (heuristicTime > 0) {
        heuristicTimeMap[hIndex].totalTime += heuristicTime
        heuristicTimeMap[hIndex].evaluatorCount++
      }
    })
  })

  const totals = []
  Object.keys(heuristicTimeMap).forEach((hIndex) => {
    const data = heuristicTimeMap[hIndex]
    if (data.totalTime > 0) {
      totals.push({
        heuristic:
          test.value.testStructure[hIndex]?.title || `H${parseInt(hIndex) + 1}`,
        totalTime: data.totalTime,
        meanTime:
          data.evaluatorCount > 0 ? data.totalTime / data.evaluatorCount : 0,
      })
    }
  })

  return totals
})

const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return '0s'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(' ')
}

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
        uid: { uid: getUserDisplayName(answer.userDocId) },
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
})

const goToCoops = () => {
  emit('goToCoops')
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

.time-tracking-scroll {
  height: 430px;
}

.table-responsive {
  overflow-x: auto;
}

.text-none {
  text-transform: none !important;
}
</style>
