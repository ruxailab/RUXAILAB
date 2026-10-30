<template>
  <div class="pa-4 analytics-dashboard">
    <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
      <div class="d-flex align-center mb-3 flex-wrap ga-2">
        <v-text-field
          v-model="searchTerm"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          variant="outlined"
          :placeholder="$t('analytics.searchByName')"
          class="flex-grow-1"
          clearable
        />
        <v-btn
          color="primary"
          prepend-icon="mdi-filter-remove"
          :disabled="!hasActiveFilters"
          @click="resetFilters"
        >
          {{ $t('analytics.reset') }}
        </v-btn>
        <v-btn
          :color="showFilters ? 'primary' : 'grey'"
          variant="tonal"
          icon
          size="small"
          :title="
            showFilters
              ? $t('analytics.hideFilters')
              : $t('analytics.showFilters')
          "
          @click="toggleFilters"
        >
          <v-icon>{{
            showFilters ? 'mdi-filter-off-outline' : 'mdi-filter-variant'
          }}</v-icon>
        </v-btn>
      </div>
      <v-expand-transition>
        <v-row v-show="showFilters" dense>
          <v-col
            v-for="definition in filterDefinitions"
            :key="`filter-${definition.index}`"
            cols="12"
            sm="6"
            md="3"
          >
            <div class="filter-label">{{ definition.title }}</div>
            <v-select
              v-if="definition.isCategorical && definition.items.length"
              v-model="selectedFilters[definition.index]"
              :items="definition.items"
              multiple
              chips
              clearable
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="
                (value) => onFilterChange(definition.index, value)
              "
            />
            <v-text-field
              v-else
              v-model="selectedFilters[definition.index]"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
        </v-row>
      </v-expand-transition>
    </v-card>

    <v-row class="mb-2">
      <v-col cols="12" md="6">
        <UxMetricCard
          :value="formattedAverageTotalTime"
          :label="$t('CardSorting.averageTotalTime')"
          color="primary"
          icon="mdi-clock-time-four-outline"
          :description="
            $t('CardSorting.averageTotalTimeDescription', {
              count: totalDurationCount,
            })
          "
          :show-progress="false"
        />
      </v-col>
      <v-col cols="12" md="6">
        <UxMetricCard
          :value="formattedAverageSortingTime"
          :label="$t('CardSorting.averageSortingTime')"
          color="teal"
          icon="mdi-timer-outline"
          :description="
            $t('CardSorting.averageSortingTimeDescription', {
              count: sortingDurationCount,
            })
          "
          :show-progress="false"
        />
      </v-col>
    </v-row>
    <v-row class="mb-2">
      <v-col cols="12" md="4">
        <UxMetricCard
          :value="submittedCount"
          :label="$t('CardSorting.totalParticipants')"
          color="success"
          icon="mdi-account-group"
          :description="
            $t('CardSorting.participantsDescription', {
              total: filteredAnswers.length,
            })
          "
          :progress="submissionRate"
        />
      </v-col>
      <v-col cols="12" md="4">
        <UxMetricCard
          :value="cardsCount"
          :label="$t('CardSorting.cards')"
          color="info"
          icon="mdi-cards"
          :description="$t('CardSorting.filteredCardsDescription')"
          :progress="cardsProgress"
        />
      </v-col>
      <v-col cols="12" md="4">
        <UxMetricCard
          :value="categoriesCount"
          :label="$t('CardSorting.categories')"
          color="warning"
          icon="mdi-shape"
          :description="$t('CardSorting.filteredCategoriesDescription')"
          :progress="categoriesProgress"
        />
      </v-col>
    </v-row>
    <CardSortingMatrix :test="test" :answers="filteredAnswers" />
    <CardSortingSimilarityMatrix :test="test" :answers="filteredAnswers" />
    <CardSortingDendrogram :test="test" :answers="filteredAnswers" />
    <AnswersTimeline
      v-if="filteredAnswers.length"
      :task-answers="filteredAnswers"
      :show-export="false"
      compact
    />
    <v-row v-if="preTestQuestions.length" class="mb-6">
      <v-col cols="12">
        <v-card class="pa-4 pa-md-6 elevation-4 rounded-xl">
          <div class="mb-6">
            <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
              {{ $t('analytics.preTest') }}
            </h3>
            <p class="text-body-1 text-medium-emphasis">
              {{ $t('analytics.preTestDescription') }}
            </p>
          </div>
          <v-row>
            <template
              v-for="(question, questionIndex) in preTestQuestions"
              :key="`pre-${questionIndex}`"
            >
              <v-col
                v-if="question.selectionFields?.length"
                cols="12"
                md="6"
                lg="4"
              >
                <SelectionPieChart
                  :question-title="question.title || question.question"
                  :options="question.selectionFields"
                  :counts="getSelectionCounts('preTest', questionIndex)"
                  :canvas-id="`card-sorting-pretest-chart-${questionIndex}`"
                  :chart-colors="chartColors"
                />
              </v-col>
              <v-col v-else cols="12">
                <CommentListCard
                  :question-title="question.title || question.question"
                  :answer="getTextAnswers('preTest', questionIndex)"
                />
              </v-col>
            </template>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="postTestQuestions.length" class="mb-6">
      <v-col cols="12">
        <v-card class="pa-4 pa-md-6 elevation-4 rounded-xl">
          <div class="mb-6">
            <h3 class="text-h4 font-weight-bold text-on-surface mb-2">
              {{ $t('analytics.postTest') }}
            </h3>
            <p class="text-body-1 text-medium-emphasis">
              {{ $t('analytics.postTestDescription') }}
            </p>
          </div>
          <v-row>
            <template
              v-for="(question, questionIndex) in postTestQuestions"
              :key="`post-${question.title || question.question || questionIndex}`"
            >
              <v-col
                v-if="question.selectionFields?.length"
                cols="12"
                md="6"
                lg="4"
              >
                <SelectionPieChart
                  :question-title="question.title || question.question"
                  :options="question.selectionFields"
                  :counts="getSelectionCounts('postTest', questionIndex)"
                  :canvas-id="`card-sorting-posttest-chart-${questionIndex}`"
                  :chart-colors="chartColors"
                />
              </v-col>
              <v-col v-else cols="12">
                <CommentListCard
                  :question-title="question.title || question.question"
                  :answer="getTextAnswers('postTest', questionIndex)"
                />
              </v-col>
            </template>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import UxMetricCard from '@/ux/UserTest/components/answers/UxMetricCard.vue'
import AnswersTimeline from '@/ux/UserTest/components/answers/AnswersTimeline.vue'
import SelectionPieChart from '@/ux/UserTest/components/answers/SelectionPieChart.vue'
import CommentListCard from '@/ux/UserTest/components/answers/CommentListCard.vue'
import CardSortingMatrix from './CardSortingMatrix.vue'
import CardSortingSimilarityMatrix from './CardSortingSimilarityMatrix.vue'
import CardSortingDendrogram from './CardSortingDendrogram.vue'
import { formatDuration } from '../../utils/cardSortingAnalytics'
import { useCardSortingAnswerFilters } from '../../composables/useCardSortingAnswerFilters'

const store = useStore()
const { t } = useI18n()

const test = computed(() => store.getters.test)
const answers = computed(() => store.getters.cardSortingAnswersList)
const preTestQuestions = computed(
  () => test.value?.testStructure?.preTest || [],
)
const postTestQuestions = computed(
  () => test.value?.testStructure?.postTest || [],
)

const chartColors = [
  '#42A5F5',
  '#66BB6A',
  '#FFA726',
  '#AB47BC',
  '#EC407A',
  '#FF7043',
  '#26A69A',
  '#D4E157',
]

const {
  searchTerm,
  selectedFilters,
  showFilters,
  filterDefinitions,
  hasActiveFilters,
  filteredAnswers,
  onFilterChange,
  resetFilters,
  toggleFilters,
} = useCardSortingAnswerFilters({
  preTestQuestions,
  answers,
  t,
})

const getSelectionCounts = (stage, questionIndex) => {
  const questions =
    stage === 'preTest' ? preTestQuestions.value : postTestQuestions.value
  const counts = Object.fromEntries(
    (questions[questionIndex]?.selectionFields || []).map((option) => [
      option,
      0,
    ]),
  )

  filteredAnswers.value.forEach((participant) => {
    const response =
      participant?.[stage === 'preTest' ? 'preTestAnswer' : 'postTestAnswer']?.[
        questionIndex
      ]?.answer
    const selectedOptions = Array.isArray(response) ? response : [response]
    selectedOptions.forEach((option) => {
      if (Object.hasOwn(counts, option)) counts[option]++
    })
  })

  return counts
}

const getTextAnswers = (stage, questionIndex) => {
  const answerKey = stage === 'preTest' ? 'preTestAnswer' : 'postTestAnswer'
  return filteredAnswers.value.flatMap((participant) => {
    const response = participant?.[answerKey]?.[questionIndex]?.answer
    if (response === undefined || response === null || response === '')
      return []
    return (Array.isArray(response) ? response : [response]).map(String)
  })
}

const validTotalDurationAnswers = computed(() =>
  filteredAnswers.value.filter(
    (a) =>
      a?.totalDurationSeconds != null && Number(a.totalDurationSeconds) > 0,
  ),
)

const totalDurationCount = computed(
  () => validTotalDurationAnswers.value.length,
)

const formattedAverageTotalTime = computed(() => {
  if (!totalDurationCount.value) return '—'
  const sum = validTotalDurationAnswers.value.reduce(
    (acc, a) => acc + Number(a.totalDurationSeconds),
    0,
  )
  return formatDuration(Math.round(sum / totalDurationCount.value))
})

const validSortingDurationAnswers = computed(() =>
  filteredAnswers.value.filter(
    (a) =>
      a?.sortingDurationSeconds != null && Number(a.sortingDurationSeconds) > 0,
  ),
)

const sortingDurationCount = computed(
  () => validSortingDurationAnswers.value.length,
)

const formattedAverageSortingTime = computed(() => {
  if (!sortingDurationCount.value) return '—'
  const sum = validSortingDurationAnswers.value.reduce(
    (acc, a) => acc + Number(a.sortingDurationSeconds),
    0,
  )
  return formatDuration(Math.round(sum / sortingDurationCount.value))
})

const submittedCount = computed(
  () => filteredAnswers.value.filter((answer) => answer?.submitted).length,
)

const submissionRate = computed(() => {
  if (!filteredAnswers.value.length) return 0
  return Math.round((submittedCount.value / filteredAnswers.value.length) * 100)
})

const filteredCardTitles = computed(() => {
  const cards = new Set()
  filteredAnswers.value.forEach((answer) => {
    Object.entries(answer?.sorting || {}).forEach(
      ([category, categoryCards]) => {
        if (category === '__unassigned') return
        if (!Array.isArray(categoryCards)) return
        categoryCards.forEach((cardTitle) => {
          if (typeof cardTitle === 'string' && cardTitle.trim()) {
            cards.add(cardTitle)
          }
        })
      },
    )
  })
  return cards
})

const cardsCount = computed(() => filteredCardTitles.value.size)
const cardsProgress = computed(() => {
  const totalCards = test.value?.testStructure?.cardSorting?.cards?.length || 0
  if (!totalCards) return 0
  return Math.min(Math.round((cardsCount.value / totalCards) * 100), 100)
})

const categoriesCount = computed(() => {
  const custom = new Set()
  filteredAnswers.value.forEach((answer) => {
    Object.entries(answer?.sorting || {}).forEach(([category, cards]) => {
      if (
        category !== '__unassigned' &&
        Array.isArray(cards) &&
        cards.length > 0
      ) {
        custom.add(category)
      }
    })
  })
  return custom.size
})

const categoriesProgress = computed(() => {
  const totalCategories =
    test.value?.testStructure?.cardSorting?.categories?.length || 0
  if (!totalCategories) return 0
  return Math.min(
    Math.round((categoriesCount.value / totalCategories) * 100),
    100,
  )
})
</script>
