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
            <div class="d-flex align-center ga-2 mr-4 flex-wrap justify-end">
              <v-chip
                v-if="answer.totalDurationSeconds != null"
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-clock-outline"
                :title="$t('CardSorting.totalDuration')"
              >
                <span class="font-weight-medium">
                  {{ $t('CardSorting.totalDuration') }}:
                </span>
                <span class="ml-1 font-weight-bold">
                  {{ formatDuration(answer.totalDurationSeconds) }}
                </span>
              </v-chip>
              <v-chip
                v-if="answer.sortingDurationSeconds != null"
                size="small"
                color="blue-grey"
                variant="tonal"
                prepend-icon="mdi-timer-outline"
                :title="$t('CardSorting.sortingDuration')"
              >
                <span class="font-weight-medium">
                  {{ $t('CardSorting.sortingDuration') }}:
                </span>
                <span class="ml-1 font-weight-bold">
                  {{ formatDuration(answer.sortingDurationSeconds) }}
                </span>
              </v-chip>
              <v-chip
                size="small"
                :color="answer.submitted ? 'success' : 'warning'"
                variant="tonal"
              >
                {{
                  answer.submitted
                    ? $t('CardSorting.submitted')
                    : $t('CardSorting.inProgress')
                }}
              </v-chip>
            </div>
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-row
            v-if="
              answer.totalDurationSeconds != null ||
              answer.sortingDurationSeconds != null
            "
            class="mb-2"
          >
            <v-col
              v-if="answer.totalDurationSeconds != null"
              cols="12"
              :sm="answer.sortingDurationSeconds != null ? 6 : 12"
            >
              <v-card
                variant="tonal"
                color="primary"
                rounded="lg"
                class="pa-2 d-flex align-center ga-2 h-100"
              >
                <v-icon size="20">mdi-clock-outline</v-icon>
                <span class="text-body-2 font-weight-medium">
                  {{ $t('CardSorting.totalDuration') }}:
                </span>
                <span class="text-body-2 font-weight-bold">
                  {{ formatDuration(answer.totalDurationSeconds) }}
                </span>
              </v-card>
            </v-col>
            <v-col
              v-if="answer.sortingDurationSeconds != null"
              cols="12"
              :sm="answer.totalDurationSeconds != null ? 6 : 12"
            >
              <v-card
                variant="tonal"
                color="blue-grey"
                rounded="lg"
                class="pa-2 d-flex align-center ga-2 h-100"
              >
                <v-icon size="20">mdi-timer-outline</v-icon>
                <span class="text-body-2 font-weight-medium">
                  {{ $t('CardSorting.sortingDuration') }}:
                </span>
                <span class="text-body-2 font-weight-bold">
                  {{ formatDuration(answer.sortingDurationSeconds) }}
                </span>
              </v-card>
            </v-col>
          </v-row>
          <v-row
            v-if="
              test?.testStructure?.preTest?.length ||
              test?.testStructure?.postTest?.length
            "
            class="mb-1"
          >
            <v-col
              v-if="test?.testStructure?.preTest?.length"
              cols="12"
              md="6"
              class="py-1"
            >
              <section class="questionnaire-section">
                <h4 class="text-subtitle-1 font-weight-bold mb-2">
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
              class="py-1"
            >
              <section class="questionnaire-section">
                <h4 class="text-subtitle-1 font-weight-bold mb-2">
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
            class="my-3"
          />
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" class="mr-2">mdi-cards-outline</v-icon>
            <h4 class="text-subtitle-1 font-weight-bold">
              {{ $t('CardSorting.title') }}
            </h4>
          </div>
          <v-row class="mb-2">
            <v-col
              v-for="category in getAnswerCategories(answer)"
              :key="category"
              cols="12"
              md="4"
              class="py-1"
            >
              <v-card variant="outlined" rounded="lg" class="pa-2 h-100">
                <div class="d-flex align-center mb-1 flex-wrap ga-1">
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
            class="pa-3 mt-3"
          >
            <h4 class="mb-2">{{ $t('CardSorting.recordings') }}</h4>
            <v-row dense>
              <v-col
                v-if="answer.screenRecordURL"
                cols="12"
                md="6"
                class="py-1"
              >
                <p class="text-caption text-medium-emphasis mb-1">
                  {{ $t('CreateTask.taskPreview.screenRecord') }}
                </p>
                <video
                  :src="answer.screenRecordURL"
                  controls
                  class="recording-player"
                />
              </v-col>
              <v-col
                v-if="answer.webcamRecordURL"
                cols="12"
                md="6"
                class="py-1"
              >
                <p class="text-caption text-medium-emphasis mb-1">
                  {{ $t('CreateTask.taskPreview.camera') }}
                </p>
                <video
                  :src="answer.webcamRecordURL"
                  controls
                  class="recording-player"
                />
              </v-col>
              <v-col v-if="answer.audioRecordURL" cols="12" md="6" class="py-1">
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
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import {
  UNASSIGNED_KEY,
  formatDuration,
} from '../../utils/cardSortingAnalytics'
import { useCardSortingAnswerFilters } from '../../composables/useCardSortingAnswerFilters'

const store = useStore()
const { t } = useI18n()

const test = computed(() => store.getters.test)
const answers = computed(() => store.getters.cardSortingAnswersList)

const preTestQuestions = computed(
  () => test.value?.testStructure?.preTest || [],
)

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
.v-expansion-panel-text :deep(.v-expansion-panel-text__wrapper) {
  padding: 8px 16px 12px;
}

.questionnaire-section {
  height: 100%;
  padding: 2px 4px 6px;
}

.question-answer-list {
  margin: 0;
  padding-left: 20px;
}

.question-answer-row {
  padding: 2px 0;
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
