<template>
  <div class="pa-4 analytics-dashboard">
    <v-card class="mb-4 pa-4 elevation-2 overflow-hidden">
      <div class="d-flex align-center flex-wrap ga-2">
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
          :disabled="!searchTerm"
          @click="searchTerm = ''"
        >
          {{ $t('analytics.reset') }}
        </v-btn>
      </div>
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
import { UNASSIGNED_KEY } from '../../utils/cardSortingAnalytics'

const store = useStore()
const searchTerm = ref('')

const test = computed(() => store.getters.test)
const answers = computed(() => store.getters.cardSortingAnswersList)

const filteredAnswers = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return answers.value
  return answers.value.filter((answer) =>
    (answer.fullName || '').toLowerCase().includes(term),
  )
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

const hasRecordings = (answer) =>
  !!(answer?.screenRecordURL || answer?.webcamRecordURL || answer?.audioRecordURL)
</script>

<style scoped>
.recording-player {
  width: 100%;
  max-height: 280px;
  border-radius: 8px;
  background: #000;
}
</style>
