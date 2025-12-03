<template>
  <v-card elevation="2" rounded="lg" class="mb-6" min-height="480px">
    <v-card-title class="d-flex align-center justify-space-between py-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-flask-outline" class="me-2" color="primary" />
        Active Studies Overview
      </div>
      <v-btn variant="text" size="small" color="primary"> View All </v-btn>
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
            class="study-card d-flex flex-column"
            @click="goToStudy(study)"
            hover
          >
            <v-card-text class="pa-4 flex-grow-1">
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
                  class="text-capitalize"
                >
                  {{ study.status }}
                </v-chip>
                <v-icon
                  :icon="getMethodIcon(study)"
                  size="20"
                  color="primary"
                />
              </div>

              <h4 class="text-subtitle-1 font-weight-bold mb-2 text-truncate">
                {{ study.title }}
              </h4>

              <div class="mb-3">
                <p
                  class="text-body-2 text-medium-emphasis"
                  :class="{ 'description-clamp': !isExpanded(study.id) }"
                >
                  {{ study.description }}
                </p>

                <div v-if="study.description && study.description.length > 120">
                  <v-btn
                    variant="text"
                    density="compact"
                    size="small"
                    class="px-0 text-capitalize mt-1"
                    color="primary"
                    :ripple="false"
                    @click.stop="toggleDescription(study.id)"
                  >
                    {{ isExpanded(study.id) ? 'Show Less' : 'Read More' }}
                    <v-icon
                      :icon="
                        isExpanded(study.id)
                          ? 'mdi-chevron-up'
                          : 'mdi-chevron-down'
                      "
                      end
                      size="small"
                    />
                  </v-btn>
                </div>
              </div>

              <div class="mt-auto pt-2">
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

              <div class="d-flex justify-space-between text-caption mt-3">
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

// --- State ---
const loading = ref(false)
const finalStudies = ref([])
const expandedCards = ref(new Set()) // Tracks which specific cards are expanded

// --- Toggle Logic for "Read More" ---
const toggleDescription = (id) => {
  if (expandedCards.value.has(id)) {
    expandedCards.value.delete(id)
  } else {
    expandedCards.value.add(id)
  }
}

const isExpanded = (id) => expandedCards.value.has(id)

// --- Data Computed Properties ---
const studies = computed(() => {
  if (loading.value) return []
  if (props.studies.length > 0) return finalStudies.value
  return defaultStudies
})

const lastFourStudies = computed(() => {
  if (!props.studies || props.studies.length === 0) return []
  return [...props.studies]
    .sort((a, b) => (b.creationDate || 0) - (a.creationDate || 0))
    .slice(0, 4)
})

// --- Async Data Loading ---
async function loadAnswers() {
  if (!lastFourStudies.value.length) {
    finalStudies.value = []
    return
  }

  loading.value = true

  try {
    // Optimization: Using Promise.all to fetch data in parallel
    const promises = lastFourStudies.value.map(async (testDoc) => {
      const answerDoc = await answerController.getAnswerById(
        testDoc.answersDocId,
      )

      const relevantAnswers =
        answerDoc.type === STUDY_TYPES.USER
          ? answerDoc.taskAnswers
          : answerDoc.heuristicAnswers

      return {
        ...testDoc,
        answers: Object.values({ ...relevantAnswers }),
      }
    })

    const results = await Promise.all(promises)
    processFinalStudies(results)
  } catch (e) {
    console.error('Error loading answers', e)
    finalStudies.value = []
  } finally {
    loading.value = false
  }
}

const calculateProgress = (answers) => {
  if (!answers || answers.length === 0) return 0
  const sum = answers.reduce((acc, val) => acc + (val.progress || 0), 0)
  return Math.round(sum / answers.length)
}

const daysLeft = (date) => {
  if (!date) return 0
  const futureDate = new Date(date)
  const today = new Date()
  const differenceInTime = futureDate.getTime() - today.getTime()
  const differenceInDays = differenceInTime / (1000 * 3600 * 24)
  return Math.ceil(differenceInDays)
}

const processFinalStudies = (studyArr) => {
  if (!studyArr) {
    finalStudies.value = []
    return
  }

  finalStudies.value = studyArr.map((study) => ({
    id: study.id,
    title: study.testTitle,
    description: study.testDescription, // Full description needed for toggle
    status: study.status,
    progress: calculateProgress(study.answers),
    participants: study.answers?.length || 0,
    daysLeft: study.endDate ? daysLeft(study.endDate) : null,
    testType: study.testType,
    subType: study.subType,
  }))
}

const goToStudy = async (study) => {
  if (!study.testType) return
  const methodView = getMethodManagerView(study.testType, study.subType)
  router.push({ name: methodView, params: { id: study.id } })
}

// --- Watcher ---
watch(
  () => props.studies,
  () => {
    loadAnswers()
  },
  { immediate: true, deep: true },
)

// --- Default Mock Data ---
const defaultStudies = [
  {
    id: 1,
    title: 'Mobile Banking UX Study',
    description:
      'Evaluating user experience and accessibility of mobile banking features. This includes a deep dive into the new transaction flow, ensuring that users can easily navigate the dashboard metrics regarding savings accounts.',
    status: 'active',
    progress: 75,
    participants: 24,
    daysLeft: 5,
    testType: 'usability',
    subType: 'mobile',
  },
  {
    id: 2,
    title: 'E-commerce Card Sorting',
    description: 'Understanding user mental models for product categorization.',
    status: 'recruiting',
    progress: 45,
    participants: 18,
    daysLeft: 12,
    testType: 'cardSort',
    subType: 'open',
  },
  {
    id: 3,
    title: 'Voice Interface Testing',
    description: 'Usability testing for voice-controlled smart home devices',
    status: 'active',
    progress: 90,
    participants: 32,
    daysLeft: 2,
    typeIcon: 'mdi-microphone'
  },
    {
    id: 4,
    title: 'Accessibility Audit',
    description: 'Comprehensive accessibility evaluation of web application',
    status: 'paused',
    progress: 30,
    participants: 12,
    daysLeft: 20,
    typeIcon: 'mdi-wheelchair-accessibility'
  }
]
</script>

<style scoped>
.study-card {
  height: 100%;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
}

.study-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* TRUNCATION LOGIC  */
  /* Limits text to 3 lines feature */

.description-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
