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

    <div
      v-if="filteredAnswers.length === 0"
      class="text-center text-medium-emphasis py-10"
    >
      <v-icon size="48" color="grey-lighten-1">mdi-inbox-outline</v-icon>
      <div class="text-body-2 mt-2">{{ $t('CardSorting.noAnswers') }}</div>
    </div>

    <v-expansion-panels v-else variant="accordion">
      <v-expansion-panel
        v-for="(answer, index) in filteredAnswers"
        :key="answer.userDocId || index"
      >
        <v-expansion-panel-title>
          <div class="d-flex align-center justify-space-between w-100">
            <div class="d-flex align-center">
              <v-avatar color="primary" size="36" class="mr-3">
                <span class="text-white">{{
                  getInitials(answer.fullName)
                }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">
                  {{ answer.fullName || $t('CardSorting.anonymous') }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{
                    $t('CardSorting.categoriesUsed', {
                      count: getAnswerCategories(answer).length,
                    })
                  }}
                </div>
              </div>
            </div>
            <v-chip
              size="small"
              :color="answer.submitted ? 'success' : 'warning'"
              variant="tonal"
              class="mr-4"
            >
              {{
                answer.submitted
                  ? $t('CardSorting.submitted')
                  : $t('CardSorting.inProgress')
              }}
            </v-chip>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-row
            v-if="
              test?.testStructure?.preTest?.length ||
              test?.testStructure?.postTest?.length
            "
            class="mb-2"
          >
            <v-col v-if="test?.testStructure?.preTest?.length" cols="12" md="6">
              <section class="questionnaire-section">
                <h4 class="text-subtitle-1 font-weight-bold mb-3">
                  <v-icon color="primary" size="small" class="mr-2">
                    mdi-clipboard-text-outline
                  </v-icon>
                  {{ $t('analytics.preTest') }}
                </h4>
                <ul class="question-answer-list">
                  <li
                    v-for="(question, questionIndex) in test.testStructure
                      .preTest"
                    :key="`pre-${questionIndex}`"
                    class="question-answer-row"
                  >
                    <span class="question-label">
                      {{ question.title || question.question }}
                    </span>
                    <span class="question-answer-value">
                      {{
                        formatAnswer(
                          answer.preTestAnswer?.[questionIndex]?.answer,
                        )
                      }}
                    </span>
                  </li>
                </ul>
              </section>
            </v-col>
            <v-col
              v-if="test?.testStructure?.postTest?.length"
              cols="12"
              md="6"
            >
              <section class="questionnaire-section">
                <h4 class="text-subtitle-1 font-weight-bold mb-3">
                  <v-icon color="secondary" size="small" class="mr-2">
                    mdi-clipboard-check-outline
                  </v-icon>
                  {{ $t('analytics.postTest') }}
                </h4>
                <ul class="question-answer-list">
                  <li
                    v-for="(question, questionIndex) in test.testStructure
                      .postTest"
                    :key="`post-${questionIndex}`"
                    class="question-answer-row"
                  >
                    <span class="question-label">
                      {{ question.title || question.question }}
                    </span>
                    <span class="question-answer-value">
                      {{
                        formatAnswer(
                          answer.postTestAnswer?.[questionIndex]?.answer,
                        )
                      }}
                    </span>
                  </li>
                </ul>
              </section>
            </v-col>
          </v-row>

          <v-divider
            v-if="
              test?.testStructure?.preTest?.length ||
              test?.testStructure?.postTest?.length
            "
            class="my-6"
          />
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" class="mr-2">mdi-cards-outline</v-icon>
            <h4 class="text-subtitle-1 font-weight-bold">
              {{ $t('CardSorting.title') }}
            </h4>
          </div>
          <v-row>
            <v-col
              v-for="category in getAnswerCategories(answer)"
              :key="category"
              cols="12"
              md="4"
            >
              <v-card variant="outlined" rounded="lg" class="pa-3 h-100">
                <div class="d-flex align-center mb-2 flex-wrap ga-1">
                  <h4 class="mb-0">
                    {{
                      category === UNASSIGNED_KEY
                        ? $t('CardSorting.notCategorized')
                        : category
                    }}
                  </h4>
                  <v-chip
                    v-if="
                      category !== UNASSIGNED_KEY &&
                      !predefinedCategorySet.has(category)
                    "
                    size="x-small"
                    color="primary"
                    variant="tonal"
                  >
                    {{ $t('CardSorting.customCategory') }}
                  </v-chip>
                </div>
                <v-chip
                  v-for="cardTitle in answer.sorting?.[category] || []"
                  :key="cardTitle"
                  size="small"
                  class="ma-1"
                  color="primary"
                  variant="tonal"
                >
                  {{ cardTitle }}
                </v-chip>
                <p
                  v-if="!(answer.sorting?.[category] || []).length"
                  class="text-caption text-medium-emphasis mb-0"
                >
                  {{ $t('CardSorting.emptyCategory') }}
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-card
            v-if="hasRecordings(answer)"
            variant="outlined"
            rounded="lg"
            class="pa-4 mt-4"
          >
            <h4 class="mb-3">{{ $t('CardSorting.recordings') }}</h4>
            <v-row>
              <v-col v-if="answer.screenRecordURL" cols="12" md="6">
                <p class="text-caption text-medium-emphasis mb-1">
                  {{ $t('CreateTask.taskPreview.screenRecord') }}
                </p>
                <video
                  :src="answer.screenRecordURL"
                  controls
                  class="recording-player"
                />
              </v-col>
              <v-col v-if="answer.webcamRecordURL" cols="12" md="6">
                <p class="text-caption text-medium-emphasis mb-1">
                  {{ $t('CreateTask.taskPreview.camera') }}
                </p>
                <video
                  :src="answer.webcamRecordURL"
                  controls
                  class="recording-player"
                />
              </v-col>
              <v-col v-if="answer.audioRecordURL" cols="12" md="6">
                <p class="text-caption text-medium-emphasis mb-1">
                  {{ $t('CreateTask.taskPreview.audioRecord') }}
                </p>
                <audio :src="answer.audioRecordURL" controls class="w-100" />
              </v-col>
            </v-row>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { UNASSIGNED_KEY } from '../../utils/cardSortingAnalytics'

const store = useStore()
const { t } = useI18n()
const searchTerm = ref('')
const selectedFilters = ref({})
const showFilters = ref(true)
const ALL_VALUE = '__ALL__'

const test = computed(() => store.getters.test)
const answers = computed(() => store.getters.cardSortingAnswersList)

const preTestQuestions = computed(
  () => test.value?.testStructure?.preTest || [],
)

const filterDefinitions = computed(() =>
  preTestQuestions.value.map((question = {}, index) => {
    const optionValues = new Set(
      Array.isArray(question.selectionFields) ? question.selectionFields : [],
    )
    answers.value.forEach((participant) => {
      const response = participant?.preTestAnswer?.[index]?.answer
      const values = Array.isArray(response) ? response : [response]
      values.forEach((value) => {
        if (value !== undefined && value !== null && value !== '') {
          optionValues.add(value)
        }
      })
    })

    const options = [...optionValues].sort((a, b) =>
      String(a).localeCompare(String(b)),
    )
    const isSelection =
      question.selectionField === true ||
      question.type === 'selection' ||
      (Array.isArray(question.selectionFields) &&
        question.selectionFields.length > 0)
    const isCategorical =
      isSelection || (options.length >= 2 && options.length <= 50)

    return {
      index,
      title:
        question.title ||
        question.question ||
        t('analytics.question', { number: index + 1 }),
      isCategorical,
      items: isCategorical
        ? [
            { title: t('analytics.all'), value: ALL_VALUE },
            ...options.map((option) => ({
              title: String(option),
              value: option,
            })),
          ]
        : [],
    }
  }),
)

const hasActiveFilters = computed(
  () =>
    !!searchTerm.value.trim() ||
    Object.values(selectedFilters.value).some((filter) =>
      Array.isArray(filter)
        ? filter.length > 0 && !filter.includes(ALL_VALUE)
        : !!filter,
    ),
)

const filteredAnswers = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return answers.value.filter((answer) => {
    if (term && !(answer.fullName || '').toLowerCase().includes(term)) {
      return false
    }

    return filterDefinitions.value.every((definition) => {
      const filter = selectedFilters.value[definition.index]
      if (
        filter === undefined ||
        filter === null ||
        filter === '' ||
        (Array.isArray(filter) &&
          (filter.length === 0 || filter.includes(ALL_VALUE)))
      ) {
        return true
      }

      const response = answer.preTestAnswer?.[definition.index]?.answer ?? ''
      if (definition.isCategorical) {
        const values = Array.isArray(response) ? response : [response]
        return (
          Array.isArray(filter) &&
          values.some((value) => filter.includes(value))
        )
      }

      return String(response)
        .toLowerCase()
        .includes(String(filter).toLowerCase())
    })
  })
})

const onFilterChange = (index, value) => {
  if (!value?.length) {
    selectedFilters.value[index] = []
  } else if (value.includes(ALL_VALUE)) {
    selectedFilters.value[index] = [ALL_VALUE]
  } else {
    selectedFilters.value[index] = value
  }
}

const resetFilters = () => {
  searchTerm.value = ''
  selectedFilters.value = {}
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const predefinedCategorySet = computed(() => {
  return new Set(
    (test.value?.testStructure?.cardSorting?.categories || []).map(
      (c) => c.title,
    ),
  )
})

const getAnswerCategories = (answer) => {
  const predefined = Array.from(predefinedCategorySet.value)
  const fromAnswer = Object.keys(answer?.sorting || {})
  const merged = new Set([...predefined, ...fromAnswer])

  // Keep unassigned last when present
  const categories = Array.from(merged).filter((key) => key !== UNASSIGNED_KEY)
  if (fromAnswer.includes(UNASSIGNED_KEY)) {
    categories.push(UNASSIGNED_KEY)
  }
  return categories
}

const getInitials = (name) => name?.charAt(0)?.toUpperCase() || '?'

const formatAnswer = (value) => {
  if (value === undefined || value === null || value === '') return '-'
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-'
  return String(value)
}

const hasRecordings = (answer) =>
  !!(
    answer?.screenRecordURL ||
    answer?.webcamRecordURL ||
    answer?.audioRecordURL
  )
</script>

<style scoped>
.questionnaire-section {
  height: 100%;
  padding: 4px 8px 12px;
}

.question-answer-list {
  margin: 0;
  padding-left: 20px;
}

.question-answer-row {
  padding: 4px 0;
}

.question-label {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.75);
}

.question-label::after {
  content: ': ';
}

.question-answer-value {
  overflow-wrap: anywhere;
}

.recording-player {
  width: 100%;
  max-height: 280px;
  border-radius: 8px;
  background: #000;
}
</style>
