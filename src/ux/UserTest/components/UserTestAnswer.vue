<template>
  <div>
    <IntroAnswer v-if="intro" @go-to-coops="goToCoops" />
    <v-row v-else-if="hasAnswers" justify="center" class="ma-0">
      <ShowInfo :hide-col="true">
        <!-- Main Tabs -->
        <template #top>
          <v-tabs
            v-model="tab"
            bg-color="transparent"
            color="#FCA326"
            slider-size="4"
          >
            <v-tab value="0">
              {{ $t('analytics.generalAnalytics') }}
            </v-tab>
            <v-tab value="1">
              {{ $t('analytics.individualAnalytics') }}
            </v-tab>
            <v-tab v-if="showSentiment" value="2"> Sentiment Analysis </v-tab>
            <v-tab v-if="showSUS" value="3">
              {{ $t('analytics.susAnalytics') }}
            </v-tab>
            <v-tab v-if="showNasa" value="4">
              {{ $t('analytics.nasaTlxAnalytics') }}
            </v-tab>
            <v-tab v-if="showTAM" value="5"> TAM Analytics </v-tab>
            <v-tab v-if="showSart" value="6">
              {{ $t('analytics.sartAnalytics') }}
            </v-tab>
            <v-tab v-if="showEye" value="7">
              {{ $t('analytics.eyeTrackingAnalytics') }}
            </v-tab>
            <v-tab v-if="showTranscription" value="8">
              {{ $t('analytics.transcriptions') }}
            </v-tab>
          </v-tabs>
        </template>

        <template #content>
          <div class="ma-0 pa-0">
            <GeneralAnalytics v-if="tab === '0'" />
            <UserAnalytics v-if="tab === '1'" />
            <SentimentAnalysisView v-if="tab === '2'" />
            <SusAnalytics v-if="tab === '3'" />
            <NasaTlxAnalytics v-if="tab === '4'" />
            <TamAnalytics v-if="tab === '5'" />
            <SartAnalytics v-if="tab === '6'" />
            <v-container
              v-if="tab === '7'"
              fluid
              class="pa-6"
              style="height: 100%; overflow-y: auto"
            >
              <div class="mb-8">
                <h1 class="text-h3 font-weight-bold text-primary">
                  {{ $t('analytics.eyeTrackingAnalytics') }}
                </h1>
                <p class="text-h6 text-grey-darken-1">
                  Eye tracking data collected from participants
                </p>
              </div>

              <v-row class="mb-4">
                <v-col cols="12" md="4">
                  <v-card
                    class="pa-6 text-left"
                    elevation="2"
                    style="border-radius: 12px"
                  >
                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <div class="text-caption text-grey-darken-1 mb-1">
                          Participants with Eye Tracking
                        </div>
                        <div class="text-h2 font-weight-bold text-primary mb-1">
                          {{ eyeTrackingSummary.participantCount }}
                        </div>
                        <div class="text-caption text-grey">
                          out of
                          {{ eyeTrackingSummary.totalParticipants }} total
                        </div>
                      </div>
                      <v-icon size="48" color="primary">mdi-eye-outline</v-icon>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card
                    class="pa-6 text-left"
                    elevation="2"
                    style="border-radius: 12px"
                  >
                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <div class="text-caption text-grey-darken-1 mb-1">
                          Total Gaze Data Points
                        </div>
                        <div class="text-h2 font-weight-bold text-warning mb-1">
                          {{ eyeTrackingSummary.totalDataPoints }}
                        </div>
                        <div class="text-caption text-grey">
                          across all sessions
                        </div>
                      </div>
                      <v-icon size="48" color="warning"
                        >mdi-chart-scatter-plot</v-icon
                      >
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card
                    class="pa-6 text-left"
                    elevation="2"
                    style="border-radius: 12px"
                  >
                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <div class="text-caption text-grey-darken-1 mb-1">
                          Tasks with Tracking
                        </div>
                        <div class="text-h2 font-weight-bold text-success mb-1">
                          {{ eyeTrackingSummary.tasksWithTracking }}
                        </div>
                        <div class="text-caption text-grey">
                          task sessions recorded
                        </div>
                      </div>
                      <v-icon size="48" color="success"
                        >mdi-crosshairs-gps</v-icon
                      >
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <v-card class="pa-4" elevation="2" style="border-radius: 12px">
                <h3 class="text-h6 font-weight-medium mb-3">
                  Per-Participant Eye Tracking
                </h3>
                <v-alert type="info" variant="tonal" class="mb-4">
                  To view detailed eye tracking visualizations (heatmaps, gaze
                  paths, and predictions), open the Individual Analytics tab and
                  select a participant's Task Analytics.
                </v-alert>
                <v-table>
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Tasks with Eye Tracking</th>
                      <th>Total Data Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(
                        participant, idx
                      ) in eyeTrackingSummary.participants"
                      :key="idx"
                    >
                      <td>{{ participant.id }}</td>
                      <td>{{ participant.tasksWithData }}</td>
                      <td>{{ participant.dataPoints }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>
            </v-container>
            <TranscriptionTool v-if="tab === '8'" />
          </div>
        </template>
      </ShowInfo>
    </v-row>
    <div v-else>
      <IntroAnswer @go-to-coops="goToCoops" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { statistics } from '@/ux/Heuristic/utils/statistics'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import IntroAnswer from '@/shared/components/introduction_cards/IntroAnswer'
import UserAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/UserAnalytics.vue'
import GeneralAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/GeneralAnalytics.vue'
import SentimentAnalysisView from './UnmoderatedTestAnalytics/SentimentAnalysisView.vue'
import SusAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/SusAnalytics.vue'
import NasaTlxAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/NasaTlxAnalytics.vue'
import TamAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/TamAnalytics.vue'
import SartAnalytics from '@/ux/UserTest/components/UnmoderatedTestAnalytics/SartAnalytics.vue'
import TranscriptionTool from '@/ux/UserTest/components/ModeratedTestAnalytics/TranscriptionTool.vue'
import {
  STUDY_TYPES,
  USER_STUDY_SUBTYPES,
} from '@/shared/constants/methodDefinitions'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  id: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['goToCoops'])

const store = useStore()
const router = useRouter()

const tab = ref(0)
const ind = ref(0)
const intro = ref(null)

const testAnswerDocument = computed(() => store.state.Answer.testAnswerDocument)
const study = computed(() => store.getters.test || {})
const testStructure = computed(() => store.getters.test?.testStructure || {})

const hasAnswers = computed(() => {
  const answers = testAnswerDocument.value?.taskAnswers
  return answers && Object.keys(answers).length > 0
})

const showSUS = computed(() => {
  if (!testStructure.value || !testStructure.value.userTasks) return false
  return Object.values(testStructure.value.userTasks).some(
    (task) => task.taskType === 'sus',
  )
})

const showNasa = computed(() => {
  if (!testStructure.value || !testStructure.value.userTasks) return false
  return Object.values(testStructure.value.userTasks).some(
    (task) => task.taskType === 'nasa-tlx',
  )
})

const showTAM = computed(() => {
  if (!testStructure.value || !testStructure.value.userTasks) return false
  return Object.values(testStructure.value.userTasks).some((task) =>
    ['tam-1', 'tam-2', 'tam-3'].includes(task.taskType),
  )
})

const showSart = computed(() => {
  if (!testStructure.value || !testStructure.value.userTasks) return false
  return Object.values(testStructure.value.userTasks).some(
    (task) => task.taskType === 'sart',
  )
})

const showSentiment = computed(() => {
  if (
    study.value.testType == STUDY_TYPES.USER &&
    study.value.subType == USER_STUDY_SUBTYPES.MODERATED
  ) {
    return true
  }
  return false
})

const showTranscription = computed(() => {
  if (
    study.value.testType == STUDY_TYPES.USER &&
    study.value.subType == USER_STUDY_SUBTYPES.MODERATED
  ) {
    return true
  }
  return false
})

const showEye = computed(
  () =>
    testAnswerDocument.value &&
    testAnswerDocument.value.type === 'User' &&
    Object.values(testAnswerDocument.value.taskAnswers).some((ev) =>
      Object.values(ev.tasks).some((task) => task.irisTrackingData?.length > 0),
    ),
)

const eyeTrackingSummary = computed(() => {
  const summary = {
    participantCount: 0,
    totalParticipants: 0,
    totalDataPoints: 0,
    tasksWithTracking: 0,
    participants: [],
  }
  if (!testAnswerDocument.value?.taskAnswers) return summary

  const answers = testAnswerDocument.value.taskAnswers
  summary.totalParticipants = Object.keys(answers).length

  Object.entries(answers).forEach(([userId, ev]) => {
    const tasks = ev.tasks || {}
    let userDataPoints = 0
    let userTasksWithData = 0

    Object.values(tasks).forEach((task) => {
      const dataLen = task.irisTrackingData?.length || 0
      if (dataLen > 0) {
        userDataPoints += dataLen
        userTasksWithData++
        summary.tasksWithTracking++
      }
    })

    if (userDataPoints > 0) {
      summary.participantCount++
      summary.participants.push({
        id: userId,
        tasksWithData: userTasksWithData,
        dataPoints: userDataPoints,
      })
    }
    summary.totalDataPoints += userDataPoints
  })

  return summary
})

const goToCoops = () => {
  if (!study.value?.id) return

  const isModerated = study.value.subType === 'Moderated'
  const routeBase = isModerated
    ? '/userTest/moderated'
    : '/userTest/unmoderated'

  router.push(`${routeBase}/edit/${study.value.id}`)
  emit('goToCoops')
}

watch(hasAnswers, (newValue) => {
  if (newValue) {
    statistics()
    intro.value = false
  } else {
    intro.value = true
  }
})

watch(
  () => ind.value,
  () => {
    ind.value = 0
  },
)

onMounted(async () => {
  await store.dispatch('getCurrentTestAnswerDoc')
})
</script>

<style scoped>
.titleView {
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #000000;
}

.subtitleView {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}

.scroll {
  overflow-y: auto;
  overflow-x: hidden;
}

.cardStyle {
  background-color: transparent;
  border: 0.2px solid rgba(0, 0, 0, 0.25);
}

.cardAnswers {
  background: #e6e4e4;
  border-radius: 34px;
}

.tab-text {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  align-items: center;
  color: #000000;
}

.container {
  height: 400px;
  padding: 0px;
  margin: 0px 10px 0px;
}

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

.v-chip {
  min-width: 50px;
  justify-content: center;
}
</style>
