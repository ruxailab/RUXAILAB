<template>
  <v-card elevation="2" rounded="lg" class="mb-6" min-height="480px">
    <v-card-title class="d-flex align-center justify-space-between py-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-flask-outline" class="me-2" color="primary" />
        {{ $t('Dashboard.activeStudiesOverview') }}
      </div>
      <v-btn
        variant="text"
        size="small"
        color="primary"
        @click="viewAllStudies"
      >
        {{ $t('Dashboard.viewAll') }}
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
        <!-- Empty state when no studies -->
        <v-col v-if="hasNoStudies" cols="12" class="text-center py-8">
          <div class="d-flex flex-column align-center">
            <v-icon
              icon="mdi-flask-empty-outline"
              size="80"
              color="grey-lighten-1"
              class="mb-4"
            />
            <h3 class="text-h6 font-weight-medium mb-2 text-medium-emphasis">
              {{ $t('Dashboard.activeStudies.noActiveStudies') }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-6 max-width-400">
              {{ $t('Dashboard.activeStudies.emptyStateMessage') }}
            </p>
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              prepend-icon="mdi-plus"
              class="px-6"
              @click="createNewStudy"
            >
              {{ $t('Dashboard.activeStudies.createNewStudy') }}
            </v-btn>
          </div>
        </v-col>

        <!-- Studies list -->
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
            hover
            @click="goToStudy(study)"
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
                  {{ $t('Dashboard.status.' + (study.status || 'unknown')) }}
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
                <p class="text-body-2 text-medium-emphasis mb-3">
                  {{ study.description }}
                </p>
              </div>

              <!-- Progress -->
              <div class="mb-3">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption font-weight-medium">{{
                    $t('Dashboard.progress')
                  }}</span>
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
                  <span
                    >{{ study.participants }}
                    {{ $t('Dashboard.participants') }}</span
                  >
                </div>
                <div v-if="study.daysLeft !== null" class="d-flex align-center">
                  <v-icon
                    icon="mdi-calendar-clock"
                    size="16"
                    class="me-1"
                    color="warning"
                  />
                  <span>{{ getDaysLeftLabel(study) }}</span>
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
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  studies: {
    type: Array,
    default: () => [],
  },
})

const router = useRouter()
const store = useStore()
const answerController = new AnswerController()

const loading = ref(false)
const studiesWithAnswers = ref([])
const user = computed(() => store.getters.user)

const studies = computed(() => {
  return props.studies.length > 0 ? studiesWithAnswers.value : []
})

const hasNoStudies = computed(() => {
  return !loading.value && props.studies.length === 0
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
    for (const study in lastFourStudies.value) {
      const testDoc = lastFourStudies.value[study]
      const answerDoc = await answerController.getAnswerById(
        testDoc.answersDocId,
      )
      if (answerDoc.type === STUDY_TYPES.USER) {
        const answers = Object.values(answerDoc.taskAnswers || {})
        const submitted = answers.some((a) => a.submitted === true)
        last4.push({
          ...testDoc,
          answers,
          submitted,
        })
      } else {
        const answers = Object.values(answerDoc.heuristicAnswers || {})
        const submitted = answers.some((a) => a.submitted === true)
        last4.push({
          ...testDoc,
          answers,
          submitted,
        })
      }
    }
    finalFour(last4)
  } catch (e) {
    studiesWithAnswers.value = []
    return e
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

  futureDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const differenceInTime = futureDate.getTime() - today.getTime()
  const differenceInDays = differenceInTime / (1000 * 3600 * 24)

  return Math.floor(differenceInDays)
}

const getDaysLeftLabel = (study) => {
  const progress = parseFloat(study.progress || 0)
  const daysLeft = study.daysLeft
  const submitted = study.submitted

  if (submitted) return t('Dashboard.studyStatus.finished')

  if (daysLeft < 0) {
    return t('Dashboard.studyStatus.expiredDaysAgo', {
      days: Math.abs(daysLeft),
    })
  }

  if (progress >= 100 && !submitted) {
    if (daysLeft === 0) {
      return t('Dashboard.studyStatus.endsTodayReady')
    }
    return t('Dashboard.studyStatus.readyToSubmit')
  }

  if (daysLeft === 0)
    return progress > 0
      ? t('Dashboard.studyStatus.endsTodayStarted')
      : t('Dashboard.studyStatus.endsToday')
  if (daysLeft === 1) return `1 ${t('Dashboard.dayLeft')}`
  if (daysLeft > 1) return `${daysLeft} ${t('Dashboard.daysLeft')}`
  if (progress === 0) return t('Dashboard.studyStatus.notStarted')
  return t('Dashboard.studyStatus.notStarted')
}

const finalFour = (studyArr) => {
  if (!studyArr) {
    studiesWithAnswers.value = []
    return
  }
  studiesWithAnswers.value = studyArr
    .map((study) => ({
      id: study.testDocId || study.id,
      title: study.testTitle,
      description: study.testDescription,
      status: study.status,
      progress: calculateProgress(study.answers),
      participants: study.answers?.length || 0,
      daysLeft: study.endDate ? daysLeft(study.endDate) : null,
      typeIcon: 'mdi-sort-variant',
      testType: study.testType,
      subType: study.subType,
      testAdmin: study.testAdmin,
      cooperators: study.cooperators,
      isPublic: study.isPublic,
      submitted: study.submitted ?? false,
    }))
    .filter(
      (study, index, self) =>
        index === self.findIndex((m) => m.id === study.id),
    )
}

const canManageStudy = (study) => {
  const currentUser = user.value
  if (!currentUser || !study) return false
  if (currentUser.accessLevel === 0) return true
  if (study.testAdmin?.userDocId === currentUser.id) return true
  const coop = study.cooperators?.find((c) => c.userDocId === currentUser.id)
  return coop?.accessLevel === 0 || coop?.accessLevel === 1
}

const goToStudy = async (study) => {
  if (canManageStudy(study)) {
    const methodView = getMethodManagerView(study.testType, study.subType)
    router.push({ name: methodView, params: { id: study.id } })
    return
  }

  if (study.testType === STUDY_TYPES.CARD_SORTING) {
    router.push({ name: 'CardSortingTestView', params: { id: study.id } })
    return
  }

  if (study.testType === STUDY_TYPES.ACCESSIBILITY_MANUAL) {
    router.push({ name: 'AccessibilityPreviewTest', params: { id: study.id } })
    return
  }

  if (study.testType === STUDY_TYPES.ACCESSIBILITY_AUTOMATIC) {
    router.push({ name: 'AccessibilityReport', params: { id: study.id } })
    return
  }

  router.push({ name: 'TestView', params: { id: study.id } })
}

const viewAllStudies = () => {
  globalThis.dispatchEvent(
    new CustomEvent('change-section', { detail: 'studies' }),
  )
}

const createNewStudy = () => {
  router.push({ name: 'study-create-step1' })
}

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
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
}

.study-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.max-width-400 {
  max-width: 400px;
}
</style>
