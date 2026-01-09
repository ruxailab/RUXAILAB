<template>
  <v-card elevation="2" rounded="lg" class="mb-6" min-height="480px">
    <v-card-title
      class="d-flex align-center justify-space-between py-4 no-whitespace"
    >
      <div class="d-flex align-center">
        <v-icon icon="mdi-flask-outline" class="me-2" color="primary" />
        Active Studies Overview
      </div>
      <v-btn
        variant="text"
        size="small"
        color="primary"
        @click="viewAllStudies"
      >
        View All
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <v-row v-if="loading">
        <v-col v-for="n in 4" :key="n" cols="12" md="6">
          <v-skeleton-loader
            type="card"
            class="study-card"
            elevation="2"
            rounded="lg"
          />
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col
          v-for="study in studies.filter((s) => s)"
          :key="study.id"
          cols="12"
          md="6"
        >
          <v-card
            variant="outlined"
            rounded="lg"
            class="study-card"
            @click="goToStudy(study)"
            hover
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <v-chip
                  :color="
                    study.status === 'active'
                      ? 'success'
                      : study.status === 'finished'
                      ? 'warning'
                      : 'info'
                  "
                  variant="tonal"
                  size="small"
                >
                  {{
                    study.status
                      ? study.status.charAt(0).toUpperCase() +
                        study.status.slice(1)
                      : 'Unknown'
                  }}
                </v-chip>
                <v-icon
                  :icon="getMethodIcon(study)"
                  size="20"
                  color="primary"
                />
              </div>

              <h4 class="text-subtitle-1 font-weight-bold mb-2">
                {{ study.title }}
              </h4>
              <div class="description-wrapper">
                <p
                  class="text-body-2 text-medium-emphasis mb-3"
                  :class="{
                    'description-truncated':
                      !expandedStudies[study.id] && study.isLongDescription,
                  }"
                >
                  {{ study.description }}
                </p>
                <v-btn
                  v-if="study.isLongDescription"
                  @click.stop="toggleExpand(study.id)"
                  variant="text"
                  size="small"
                  color="primary"
                  class="text-lowercase"
                  :prepend-icon="
                    expandedStudies[study.id]
                      ? 'mdi-chevron-up'
                      : 'mdi-chevron-down'
                  "
                >
                  {{ expandedStudies[study.id] ? 'Show less' : 'Show more' }}
                </v-btn>
              </div>

              <!-- Progress -->
              <div class="mb-3">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption font-weight-medium">Progress</span>
                  <span class="text-caption">{{ study.progress }}%</span>
                </div>
                <v-progress-linear
                  :model-value="study.progress"
                  :color="study.status === 'active' ? 'success' : 'primary'"
                  height="6"
                  rounded
                />
              </div>

              <!-- Metrics -->
              <div class="d-flex justify-space-between text-caption">
                <div class="d-flex align-center">
                  <v-icon
                    icon="mdi-account-group"
                    size="16"
                    class="me-1"
                    color="info"
                  />
                  <span>{{ study.participants }} participants</span>
                </div>
                <div v-if="study.daysLeft !== null" class="d-flex align-center">
                  <v-icon
                    icon="mdi-calendar-clock"
                    size="16"
                    class="me-1"
                    color="warning"
                  />
                  <span>{{
                    `${study.daysLeft} ${
                      study.daysLeft > 1 ? 'days left' : 'day left'
                    }`
                  }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import AnswerController from '@/shared/controllers/AnswerController'
import {
  getMethodIcon,
  getMethodManagerView,
  STUDY_TYPES,
} from '@/shared/constants/methodDefinitions'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  studies: {
    type: Array,
    default: () => [],
  },
})

const router = useRouter()
const answerController = new AnswerController()

const loading = ref(false)
const studiesWithAnswers = ref([])
const expandedStudies = ref({})

const isLongDescription = (description) => {
  return description && description.length > 250
}

const studies = computed(() => {
  return props.studies.length > 0 ? studiesWithAnswers.value : loading.value ? [] : defaultStudies
})

const lastFourStudies = computed(() => {
  if (!props.studies) return []
  return [...props.studies]
    .sort((a, b) => (b.creationDate || 0) - (a.creationDate || 0))
    .slice(0, 4)
})

async function loadAnswers() {
  if (!lastFourStudies.value.length) {
    studiesWithAnswers.value = []
    return
  }

  loading.value = true
  const last4 = []
  try {
    for (const testDoc of lastFourStudies.value) {
      if (!testDoc?.answersDocId) {
        continue;
      }
      const answerDoc = await answerController.getAnswerById(testDoc.answersDocId);
      if (!answerDoc) {
        continue;
      }
      if (answerDoc.type === STUDY_TYPES.USER) {
        last4.push({
          ...testDoc,
          answers: Object.values({ ...answerDoc.taskAnswers }),
        })
      } else {
        last4.push({
          ...testDoc,
          answers: Object.values({ ...answerDoc.heuristicAnswers }),
        })
      }
    }
    finalFour(last4)
  } catch (e) {
    console.error('Error loading answers', e)
    studiesWithAnswers.value = []
  } finally {
    loading.value = false
  }
}

const calculateProgress = (answers) => {
  if (!answers || answers.length === 0) return 0
  const sum = answers.reduce((acc, val) => acc + val.progress, 0)
  return sum / answers.length
}

const daysLeft = (date) => {
  if (!date) return 0
  const futureDate = new Date(date)
  const today = new Date()

  const differenceInTime = futureDate.getTime() - today.getTime()
  const differenceInDays = differenceInTime / (1000 * 3600 * 24)

  return Math.floor(differenceInDays)
}

const finalFour = (studyArr) => {
  if (!studyArr) {
    studiesWithAnswers.value = []
    return
  }
  studiesWithAnswers.value = studyArr
    .map((study) => ({
      id: study.id,
      title: study.testTitle,
      description: study.testDescription,
      isLongDescription: isLongDescription(study.testDescription),
      status: study.status,
      progress: calculateProgress(study.answers),
      participants: study.answers?.length || 0,
      daysLeft: study.endDate ? daysLeft(study.endDate) : null,
      typeIcon: 'mdi-sort-variant',
      testType: study.testType,
      subType: study.subType,
    }))
    .filter(
      (study, index, self) =>
        index === self.findIndex((m) => m.id === study.id),
    )
}

const goToStudy = async (study) => {
  const methodView = getMethodManagerView(study.testType, study.subType)
  router.push({ name: methodView, params: { id: study.id } })
}

const viewAllStudies = () => {
  // Dispatch custom event to change section
  globalThis.dispatchEvent(
    new CustomEvent('change-section', { detail: 'studies' }),
  )
}

const toggleExpand = (studyId) => {
  expandedStudies.value[studyId] = !expandedStudies.value[studyId]
}

// Default studies if none provided
const defaultStudies = [
  {
    id: 1,
    title: 'Mobile Banking UX Study',
    description:
      'Evaluating user experience and accessibility of mobile banking features',
    status: 'active',
    progress: 75,
    participants: 24,
    daysLeft: 5,
    typeIcon: 'mdi-cellphone',
  },
  {
    id: 2,
    title: 'E-commerce Card Sorting',
    description: 'Understanding user mental models for product categorization',
    status: 'recruiting',
    progress: 45,
    participants: 18,
    daysLeft: 12,
    typeIcon: 'mdi-sort-variant',
  },
  {
    id: 3,
    title: 'Voice Interface Testing',
    description: 'Usability testing for voice-controlled smart home devices',
    status: 'active',
    progress: 90,
    participants: 32,
    daysLeft: 2,
    typeIcon: 'mdi-microphone',
  },
  {
    id: 4,
    title: 'Accessibility Audit',
    description: 'Comprehensive accessibility evaluation of web application',
    status: 'paused',
    progress: 30,
    participants: 12,
    daysLeft: 20,
    typeIcon: 'mdi-wheelchair-accessibility',
  },
]

watch(
  () => props.studies,
  () => {
    loadAnswers()
  },
  { immediate: true },
)
</script>

<style scoped>
.study-card {
  height: 100%;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.study-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.description-wrapper {
  margin-bottom: 1rem;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
}

.description-truncated {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}
.no-whitespace {
  white-space: normal;
}

/* Fallback for non-webkit browsers */
@supports not (-webkit-line-clamp: 3) {
  .description-truncated {
    max-height: 4.5em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
