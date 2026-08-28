<template>
  <div v-if="answers">
    <IntroAnalytics v-if="answers != null && intro" @go-to-coops="goToCoops" />

    <ShowInfo v-if="answers != null && !intro && test">
      <template #content>
        <v-card flat rounded="xl" class="pa-2">
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="heuristicSelect"
                :items="heuristicItems"
                item-title="title"
                item-value="value"
                :label="$t('Dashboard.cards.heuristics')"
                variant="outlined"
                prepend-inner-icon="mdi-format-list-bulleted"
                hide-details
              />
              <v-select
                v-if="!isTraditional && selectedHeuristic?.questions?.length"
                v-model="questionSelect"
                class="mt-3"
                :items="questionItems"
                item-title="title"
                item-value="value"
                :label="$t('HeuristicsAnalytics.question')"
                variant="outlined"
                prepend-inner-icon="mdi-help-circle-outline"
                hide-details
              />
              <v-alert
                v-else
                class="mt-3"
                type="info"
                variant="tonal"
                density="compact"
              >
                {{ $t('HeuristicsAnalytics.heuristicLevelEvidence') }}
              </v-alert>

              <v-row class="mt-2" dense>
                <v-col cols="4">
                  <v-sheet class="pa-3 text-center" border rounded>
                    <div class="text-h5 font-weight-bold">
                      {{ evidenceSummary.comments }}
                    </div>
                    <div class="text-caption">{{ $t('common.comments') }}</div>
                  </v-sheet>
                </v-col>
                <v-col cols="4">
                  <v-sheet class="pa-3 text-center" border rounded>
                    <div class="text-h5 font-weight-bold">
                      {{ evidenceSummary.images }}
                    </div>
                    <div class="text-caption">{{ $t('common.images') }}</div>
                  </v-sheet>
                </v-col>
                <v-col cols="4">
                  <v-sheet class="pa-3 text-center" border rounded>
                    <div class="text-h5 font-weight-bold">
                      {{ evidenceSummary.evaluators }}
                    </div>
                    <div class="text-caption">
                      {{ $t('HeuristicsTestAnswer.summary.stats.evaluators') }}
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="8">
              <v-card variant="outlined" rounded="lg">
                <v-card-title class="d-flex align-center">
                  <span>{{ selectedContentTitle }}</span>
                  <v-spacer />
                  <v-chip size="small" color="primary" variant="tonal">
                    {{ evidenceSummary?.evidence || 0 }}
                    {{ $t('HeuristicsAnalytics.evidenceItems') }}
                  </v-chip>
                </v-card-title>
                <v-divider />
                <v-tabs v-model="ind" color="primary">
                  <v-tab value="comments">
                    <v-icon start>mdi-comment-text-outline</v-icon>
                    {{ $t('common.comments') }}
                  </v-tab>
                  <v-tab value="images">
                    <v-icon start>mdi-image-multiple-outline</v-icon>
                    {{ $t('common.images') }}
                  </v-tab>
                  <v-tab v-if="!isTraditional" value="chart">
                    <v-icon start>mdi-chart-bar</v-icon>
                    {{ $t('HeuristicsAnalytics.chart') }}
                  </v-tab>
                </v-tabs>
                <v-window v-model="ind" class="pa-4">
                  <v-window-item value="comments">
                    <v-list v-if="commentItems.length" lines="three">
                      <v-list-item v-for="item in commentItems" :key="item.id">
                        <template #prepend>
                          <v-avatar color="primary" variant="tonal">
                            <v-icon>mdi-account-outline</v-icon>
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{
                          item.evaluator
                        }}</v-list-item-title>
                        <v-list-item-subtitle class="text-wrap mt-1">
                          {{ item.text }}
                        </v-list-item-subtitle>
                        <template #append>
                          <span class="text-caption">{{ item.date }}</span>
                        </template>
                      </v-list-item>
                    </v-list>
                    <v-empty-state
                      v-else
                      icon="mdi-comment-off-outline"
                      :title="$t('HeuristicsAnalytics.noComments')"
                    />
                  </v-window-item>
                  <v-window-item value="images">
                    <v-row v-if="imageItems.length" dense>
                      <v-col
                        v-for="item in imageItems"
                        :key="item.id"
                        cols="12"
                        sm="6"
                        lg="4"
                      >
                        <v-card variant="outlined">
                          <v-img :src="item.url" height="180" cover />
                          <v-card-subtitle>{{
                            item.evaluator
                          }}</v-card-subtitle>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-empty-state
                      v-else
                      icon="mdi-image-off-outline"
                      :title="$t('HeuristicsAnalytics.noImages')"
                    />
                  </v-window-item>
                  <v-window-item v-if="!isTraditional" value="chart">
                    <BarChart
                      v-if="questionGraph"
                      :labels="questionGraph.label"
                      :data="questionGraph.data"
                      legend="Quantity"
                    />
                  </v-window-item>
                </v-window>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </template>
    </ShowInfo>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import BarChart from '@/ux/Heuristic/components/charts/BarChart.vue'
import IntroAnalytics from '@/shared/components/introduction_cards/IntroAnalytics.vue'

const store = useStore()
const route = useRoute()
const { t } = useI18n()

const emit = defineEmits(['goToCoops'])

const search = ref('')
const ind = ref('comments')
const resultHeuristics = ref([])
const heuristicSelect = ref(null)
const questionSelect = ref(null)
const intro = ref(null)

const test = computed(() => store.getters.test)
const isTraditional = computed(
  () =>
    !test.value?.useWeights &&
    !test.value?.testOptions?.length &&
    test.value?.useFrequency !== false &&
    test.value?.useSeverity !== false,
)

const answers = computed(() => {
  if (!store.getters.testAnswerDocument) {
    return {}
  }
  return store.getters.testAnswerDocument.heuristicAnswers
})

const heuristicItems = computed(() =>
  (test.value?.testStructure || []).map((heuristic, index) => ({
    title: `H${heuristic.id + 1} - ${heuristic.title}`,
    value: index,
  })),
)

const selectedHeuristic = computed(() =>
  heuristicSelect.value === null
    ? null
    : test.value?.testStructure?.[heuristicSelect.value],
)

const questionItems = computed(() =>
  (selectedHeuristic.value?.questions || []).map((question, index) => ({
    title: `Q${question.id + 1} - ${question.title}`,
    value: index,
  })),
)

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
          title: `Q${question.id + 1} - ${question.title}`,
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
      const heuristicAnswer =
        answer?.heuristicQuestions?.[heuristicSelect.value]
      items.push({
        uid: { uid: answer.userDocId },
        ...Object.fromEntries(
          Object.entries(heuristicAnswer?.heuristicQuestions || {}).map(
            ([id, val]) => [id.toString(), val],
          ),
        ),
      })
    })
  }
  return items
})

const processedItemsHeuristic = computed(() => {
  if (questionSelect.value === null || questionSelect.value < 0) {
    return []
  }
  return itemsHeuristic.value.map((result) => {
    const questionAnswers = isTraditional.value
      ? Object.values(result)
          .filter((value) => value?.heuristicAnswer)
          .flatMap((value) => [value])
      : [result[questionSelect.value]]
    const comments = questionAnswers.flatMap(getCommentsFromAnswer)
    const images = questionAnswers.flatMap(getImagesFromAnswer)
    return {
      result,
      comments,
      images,
      hasContent: comments.length > 0 || images.length > 0,
    }
  })
})

const commentItems = computed(() =>
  processedItemsHeuristic.value.flatMap((item, evaluatorIndex) =>
    item.comments.map((comment, commentIndex) => ({
      id: `${evaluatorIndex}-comment-${commentIndex}`,
      evaluator: item.result?.uid?.uid || `Ev${evaluatorIndex + 1}`,
      text: comment.text || comment,
      date: comment.createdAt ? formatDate(comment.createdAt) : '',
    })),
  ),
)

const imageItems = computed(() =>
  processedItemsHeuristic.value.flatMap((item, evaluatorIndex) =>
    item.images.map((image, imageIndex) => ({
      id: `${evaluatorIndex}-image-${imageIndex}`,
      evaluator: item.result?.uid?.uid || `Ev${evaluatorIndex + 1}`,
      url: image.url || image,
    })),
  ),
)

const evidenceSummary = computed(() => ({
  comments: commentItems.value.length,
  images: imageItems.value.length,
  evaluators: processedItemsHeuristic.value.length,
  evidence: commentItems.value.length + imageItems.value.length,
}))

const selectedContentTitle = computed(() => {
  if (isTraditional.value) return selectedHeuristic.value?.title || '-'
  if (questionSelect.value === null) {
    return selectedHeuristic.value?.title || '-'
  }
  return (
    selectedHeuristic.value?.questions?.[questionSelect.value]?.title || '-'
  )
})

const getCommentsFromAnswer = (questionAnswer) => {
  if (!questionAnswer) return []

  const comments = []

  if (Array.isArray(questionAnswer.comments)) {
    comments.push(...questionAnswer.comments)
  }

  if (
    comments.length === 0 &&
    questionAnswer.heuristicComment &&
    questionAnswer.heuristicComment.trim() !== ''
  ) {
    comments.push({
      id: 'legacy',
      text: questionAnswer.heuristicComment,
      createdAt: 0,
    })
  }

  return comments
}

const getImagesFromAnswer = (questionAnswer) => {
  if (!questionAnswer) return []

  const images = []

  if (Array.isArray(questionAnswer.images)) {
    images.push(...questionAnswer.images)
  }

  if (
    images.length === 0 &&
    questionAnswer.answerImageUrl &&
    questionAnswer.answerImageUrl.trim() !== ''
  ) {
    images.push({
      id: 'legacy',
      url: questionAnswer.answerImageUrl,
      createdAt: 0,
    })
  }

  return images
}

const questionGraph = computed(() => {
  const options = Array.isArray(test.value?.testOptions)
    ? test.value.testOptions
    : []

  const graph = {
    label: [...options.map((op) => op.text)],
    data: [...options.map(() => 0)],
  }

  if (heuristicSelect.value !== null && questionSelect.value !== null) {
    Object.values(answers.value || {}).forEach((userAnswer) => {
      const question =
        userAnswer?.heuristicQuestions?.[heuristicSelect.value]
          ?.heuristicQuestions?.[questionSelect.value]
      if (!question?.heuristicAnswer) return

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

const getAnswerChipClass = (value) => {
  const options = Array.isArray(test.value?.testOptions)
    ? test.value.testOptions
    : []
  const optionValues = options
    .map((option) => Number(option.value))
    .filter((optionValue) => Number.isFinite(optionValue))
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue) || optionValues.length === 0) {
    return 'answer-chip--empty'
  }

  const min = Math.min(...optionValues)
  const max = Math.max(...optionValues)

  if (max === min) {
    return numericValue > 0 ? 'answer-chip--high' : 'answer-chip--empty'
  }

  const normalized = (numericValue - min) / (max - min)
  if (normalized < 0.25) return 'answer-chip--low'
  if (normalized < 0.5) return 'answer-chip--medium-low'
  if (normalized < 0.75) return 'answer-chip--medium-high'
  return 'answer-chip--high'
}

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
  questionSelect.value = isTraditional.value ? 0 : null
  ind.value = 'comments'
})

watch(questionSelect, () => {
  ind.value = 'comments'
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

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
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

.answer-chip {
  min-width: 50px;
  justify-content: center;
  font-weight: 500;
}

.answer-chip--low {
  background-color: #fde5e2 !important;
  color: #ff2a1a !important;
}

.answer-chip--medium-low {
  background-color: #ffefd9 !important;
  color: #ff8500 !important;
}

.answer-chip--medium-high {
  background-color: #fff8dc !important;
  color: #ffd000 !important;
}

.answer-chip--high {
  background-color: #e5f3e8 !important;
  color: #25a83a !important;
}

.answer-chip--empty {
  background-color: #eeeeee !important;
  color: #777777 !important;
}
</style>
