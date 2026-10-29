<template>
  <div class="session-backdrop">
    <SessionBackdropMark />

    <div v-if="showStepAnnouncement" class="step-announcement-container">
      <StepAnnouncementOverlay
        ref="stepAnnouncementOverlay"
        :kicker="nextStepAnnouncementKicker"
        :title="nextStepAnnouncementTitle"
      />
    </div>

    <v-dialog v-model="showScreenSharePrompt" persistent max-width="640">
      <v-card class="pa-4 pa-sm-6" rounded="xl">
        <ScreenShareInstructions compact />
        <v-card-actions class="px-0 pt-5 pb-0">
          <v-btn
            variant="text"
            :disabled="isRequestingScreenShare"
            @click="cancelScreenSharePrompt"
          >
            {{ $t('screenShare.backButton') }}
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            variant="flat"
            :loading="isRequestingScreenShare"
            prepend-icon="mdi-monitor-share"
            @click="confirmScreenShare"
          >
            {{ $t('screenShare.shareButton') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <SubmitDialog
      :model-value="dialog"
      :title="$t('HeuristicsTestView.messages.submitTest')"
      :message="$t('HeuristicsTestView.messages.submitOnce')"
      :cancel-label="$t('buttons.cancel')"
      :submit-label="$t('buttons.submit')"
      @cancel="dialog = false"
      @submit="handleSubmit"
    />

    <v-container fluid class="session-backdrop-content pa-0">
      <v-row v-if="start" class="start-screen pa-0 ma-0" align="center">
        <SessionBackdropMark position="absolute" />
        <v-col md="8" class="ma-5 pa-5">
          <img
            src="../../../assets/logo_full_white.png"
            alt="RUXAILAB"
            class="mb-10"
            style="max-width: 300px"
          />
          <div class="mb-3">
            <StudyTypeBadges :test="test" color="white" />
          </div>
          <h1 class="text-h2 font-weight-bold text-white">
            {{ test.testTitle }}
          </h1>
          <p class="text-body mb-5 text-white text-justify">
            {{ truncateDescription(test.testDescription) }}
          </p>
          <v-btn
            color="white"
            variant="outlined"
            rounded
            class="mt-4"
            :disabled="!canStartCardSorting"
            @click="startTest"
          >
            {{ $t('UserTestView.actions.startTest') }}
          </v-btn>
          <v-alert
            v-if="!canStartCardSorting"
            type="error"
            variant="outlined"
            class="mt-4"
            color="white"
            style="
              background-color: rgba(255, 255, 255, 0.1);
              border-color: white;
            "
          >
            <span class="text-white d-block">
              {{ $t('CardSorting.invalidConfiguration') }}
            </span>
            <ul class="start-screen__alert-details">
              <li
                v-for="detail in cardSortingConfigurationIssueMessages"
                :key="detail"
                class="text-white"
              >
                {{ detail }}
              </li>
            </ul>
          </v-alert>
        </v-col>
      </v-row>

      <v-row
        v-else
        class="main-test-interface pa-0 ma-0"
        :class="{
          'welcome-main-centered': globalIndex === 0,
          'session-transparent':
            globalIndex === 0 || globalIndex === 1 || globalIndex === 4,
        }"
      >
        <v-col
          class="right-view pa-6"
          :class="{ 'welcome-content-centered': globalIndex === 0 }"
        >
          <v-row v-if="globalIndex >= 1" class="stepper-row sticky-stepper">
            <v-col cols="12">
              <v-stepper
                :model-value="activeStepperItem"
                class="main-stepper test-progress-stepper rounded-xl elevation-3"
              >
                <v-stepper-header>
                  <v-stepper-item
                    :value="1"
                    :title="$t('UserTestView.stepper.consent')"
                    :complete="stepperValue >= 1 && !isCurrentCardStep(1)"
                    :icon="isCurrentCardStep(1) ? 'mdi-pencil' : undefined"
                    complete-icon="mdi-check"
                    :class="{ 'stepper-item--current': isCurrentCardStep(1) }"
                  />
                  <v-divider />

                  <template v-if="hasPreTest">
                    <v-stepper-item
                      :value="2"
                      :title="$t('UserTestView.stepper.preTest')"
                      :complete="stepperValue >= 2 && !isCurrentCardStep(2)"
                      :icon="isCurrentCardStep(2) ? 'mdi-pencil' : undefined"
                      complete-icon="mdi-check"
                      :class="{ 'stepper-item--current': isCurrentCardStep(2) }"
                    />
                    <v-divider />
                  </template>

                  <v-stepper-item
                    :value="hasPreTest ? 3 : 2"
                    :title="$t('CardSorting.cardClassification')"
                    :complete="
                      stepperValue >= 3 &&
                      !isCurrentCardStep(hasPreTest ? 3 : 2)
                    "
                    :icon="
                      isCurrentCardStep(hasPreTest ? 3 : 2)
                        ? 'mdi-pencil'
                        : undefined
                    "
                    complete-icon="mdi-check"
                    :class="{
                      'stepper-item--current': isCurrentCardStep(
                        hasPreTest ? 3 : 2,
                      ),
                    }"
                  />
                  <v-divider />

                  <template v-if="hasPostTest">
                    <v-stepper-item
                      :value="hasPreTest ? 4 : 3"
                      :title="$t('UserTestView.stepper.postTest')"
                      :complete="
                        stepperValue >= 4 &&
                        !isCurrentCardStep(hasPreTest ? 4 : 3)
                      "
                      :icon="
                        isCurrentCardStep(hasPreTest ? 4 : 3)
                          ? 'mdi-pencil'
                          : undefined
                      "
                      complete-icon="mdi-check"
                      :class="{
                        'stepper-item--current': isCurrentCardStep(
                          hasPreTest ? 4 : 3,
                        ),
                      }"
                    />
                    <v-divider />
                  </template>

                  <v-stepper-item
                    :value="completionStepValue"
                    :title="$t('UserTestView.stepper.completion')"
                    :complete="
                      stepperValue >= 4 &&
                      !isCurrentCardStep(completionStepValue)
                    "
                    :icon="
                      isCurrentCardStep(completionStepValue)
                        ? 'mdi-pencil'
                        : undefined
                    "
                    complete-icon="mdi-check"
                    :class="{
                      'stepper-item--current':
                        isCurrentCardStep(completionStepValue),
                    }"
                  />
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>

          <StudyWelcomeStep
            v-if="globalIndex === 0"
            :study="test"
            :sections="welcomeSections"
            :welcome-title="$t('CardSorting.welcomeTitle')"
            :description="$t('CardSorting.welcomeDescription')"
            :how-it-works="$t('CardSorting.howItWorks')"
            :phases="$t('CardSorting.welcomePhases')"
            :summary="$t('CardSorting.welcomeSummary')"
            :ready="$t('CardSorting.welcomeReady')"
            :start-label="$t('CardSorting.startStudy')"
            :steps="welcomeSteps"
            @start="handleWelcomeStart"
          />

          <ConsentStep
            v-if="globalIndex === 1"
            :test-title="test.testTitle"
            :consent-text="test.testStructure.consent"
            :full-name-model="fullName"
            :consent-completed-model="localAnswer.consentCompleted"
            @update:full-name-model="(val) => (fullName = val)"
            @update:consent-completed-model="
              (val) => (localAnswer.consentCompleted = val)
            "
            @continue="completeStep('consent')"
            @decline-consent="handleConsentDecline"
          />

          <PreTestStep
            v-if="globalIndex === 2 && hasPreTest"
            :test-title="test.testTitle"
            :pre-test="test.testStructure.preTest"
            :pre-test-answer="localAnswer.preTestAnswer"
            :pre-test-completed="localAnswer.preTestCompleted"
            @update:pre-test-answer="(val) => (localAnswer.preTestAnswer = val)"
            @done="completeStep('preTest')"
          />

          <div v-if="globalIndex === 4">
            <!-- Recording intro (mirrors UserTest TaskStep stage 1) -->
            <ShowInfo
              v-if="hasAnyRecording && !sortingStarted"
              :title="test.testTitle"
            >
              <template #content>
                <div class="test-content pa-4 rounded-xl">
                  <v-card
                    variant="outlined"
                    color="secondary"
                    class="my-6 mx-auto"
                    max-width="1000"
                  >
                    <v-card-text class="pa-4">
                      <div class="d-flex align-center mb-3">
                        <v-icon color="secondary" size="24" class="mr-2">
                          mdi-play-circle-outline
                        </v-icon>
                        <h3 class="text-h6 font-weight-bold text-secondary">
                          {{ $t('CardSorting.sortingPreview') }}
                        </h3>
                      </div>

                      <p class="text-body-1 text-left mb-4 text-grey-darken-3">
                        {{ $t('CardSorting.recordingInfo') }}
                      </p>

                      <div class="recording-features-grid mb-4">
                        <div
                          v-if="recordingFlags.hasScreenRecord"
                          class="recording-feature-card"
                        >
                          <div class="feature-icon-container">
                            <v-icon size="48" color="secondary">
                              mdi-monitor-screenshot
                            </v-icon>
                          </div>
                          <div class="feature-content">
                            <h4
                              class="text-h6 font-weight-bold text-grey-darken-3 mb-1"
                            >
                              {{ $t('CreateTask.taskPreview.screenRecord') }}
                            </h4>
                            <p class="text-body-2 text-grey-darken-3">
                              {{
                                $t('CreateTask.taskPreview.screenRecordDesc')
                              }}
                            </p>
                          </div>
                        </div>

                        <div
                          v-if="recordingFlags.hasCamRecord"
                          class="recording-feature-card"
                        >
                          <div class="feature-icon-container">
                            <v-icon size="48" color="secondary">
                              mdi-camera
                            </v-icon>
                          </div>
                          <div class="feature-content">
                            <h4
                              class="text-h6 font-weight-bold text-grey-darken-3 mb-1"
                            >
                              {{ $t('CreateTask.taskPreview.camera') }}
                            </h4>
                            <p class="text-body-2 text-grey-darken-3">
                              {{ $t('CreateTask.taskPreview.cameraDesc') }}
                            </p>
                          </div>
                        </div>

                        <div
                          v-if="recordingFlags.hasAudioRecord"
                          class="recording-feature-card"
                        >
                          <div class="feature-icon-container">
                            <v-icon size="48" color="secondary">
                              mdi-microphone
                            </v-icon>
                          </div>
                          <div class="feature-content">
                            <h4
                              class="text-h6 font-weight-bold text-grey-darken-3 mb-1"
                            >
                              {{ $t('CreateTask.taskPreview.audioRecord') }}
                            </h4>
                            <p class="text-body-2 text-grey-darken-3">
                              {{ $t('CreateTask.taskPreview.audioRecordDesc') }}
                            </p>
                          </div>
                        </div>
                      </div>

                      <ScreenShareInstructions
                        v-if="recordingFlags.hasScreenRecord"
                        class="mt-4"
                      />
                    </v-card-text>
                  </v-card>

                  <div class="d-flex justify-center">
                    <v-btn
                      color="primary"
                      variant="flat"
                      size="large"
                      :loading="startingRecording"
                      @click="onStartSorting"
                    >
                      {{ $t('CardSorting.startSorting') }}
                    </v-btn>
                  </div>
                </div>
              </template>
            </ShowInfo>

            <template v-else>
              <CardSortingTask
                v-model="localAnswer.sorting"
                :test="test"
                @update:pending="pendingCards = $event"
              />
              <v-container class="d-flex justify-end pt-0">
                <v-btn
                  color="primary"
                  variant="flat"
                  size="large"
                  :disabled="pendingCards > 0 || isWaitingForUploadToFinish"
                  :loading="isWaitingForUploadToFinish"
                  @click="finishSorting"
                >
                  {{
                    isWaitingForUploadToFinish
                      ? $t('CardSorting.uploadingRecordings')
                      : pendingCards > 0
                        ? $t('CardSorting.allocateAll', {
                            count: pendingCards,
                          })
                        : $t('buttons.continue')
                  }}
                </v-btn>
              </v-container>
            </template>

            <AudioRecorder
              v-if="recordingFlags.hasAudioRecord"
              ref="audioRecorder"
              :test-id="test.id"
              :task-index="0"
              :user-doc-id="user?.id"
              @show-loading="onShowLoading"
              @stop-show-loading="onStopShowLoading"
            />
            <ScreenRecorder
              v-if="recordingFlags.hasScreenRecord"
              ref="screenRecorder"
              :test-id="test.id"
              :task-index="0"
              :user-doc-id="user?.id"
              @show-loading="onShowLoading"
              @stop-show-loading="onStopShowLoading"
            />
            <VideoRecorder
              v-if="recordingFlags.hasCamRecord"
              ref="videoRecorder"
              :test-id="test.id"
              :user-doc-id="user?.id"
              :task-index="0"
              @show-loading="onShowLoading"
              @stop-show-loading="onStopShowLoading"
            />
          </div>

          <PostTestStep
            v-if="
              hasPostTest &&
              globalIndex === 5 &&
              (!localAnswer.postTestCompleted || localAnswer.submitted)
            "
            :test-title="test.testTitle"
            :post-test="test.testStructure.postTest"
            :post-test-answer="localAnswer.postTestAnswer"
            :post-test-completed="localAnswer.postTestCompleted"
            @update:post-test-answer="
              (val) => (localAnswer.postTestAnswer = val)
            "
            @done="completeStep('postTest')"
          />

          <FinishStep
            v-if="
              globalIndex === 6 &&
              localAnswer.postTestCompleted &&
              !localAnswer.submitted
            "
            :final-message="$t('finishTest.finalMessage')"
            :congratulations="test.testStructure.finalMessage"
            :submit-message="$t('finishTest.submitMessage')"
            :submit-btn="$t('buttons.submit')"
            @submit="dialog = true"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import StudyTypeBadges from '@/shared/components/StudyTypeBadges.vue'
import {
  computed,
  reactive,
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import StudyWelcomeStep from '@/shared/components/StudyWelcomeStep.vue'
import StepAnnouncementOverlay from '@/shared/components/StepAnnouncementOverlay.vue'
import SessionBackdropMark from '@/shared/components/SessionBackdropMark.vue'
import { useStepAnnouncement } from '@/shared/composables/useStepAnnouncement'
import ConsentStep from '@/shared/components/steps/ConsentStep.vue'
import PreTestStep from '@/shared/components/steps/PreTestStep.vue'
import PostTestStep from '@/shared/components/steps/PostTestStep.vue'
import FinishStep from '@/shared/components/steps/FinishStep.vue'
import SubmitDialog from '@/shared/components/SubmitDialog.vue'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import AudioRecorder from '@/shared/components/AudioRecorder.vue'
import ScreenRecorder from '@/shared/components/ScreenRecorder.vue'
import ScreenShareInstructions from '@/shared/components/ScreenShareInstructions.vue'
import VideoRecorder from '@/shared/components/VideoRecorder.vue'
import CardSortingTask from './CardSortingTask.vue'
import CardSortingEvaluatorAnswer from '../models/CardSortingEvaluatorAnswer'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'
import { showError, showSuccess, showInfo } from '@/shared/utils/toast'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'
import { createStudyLoggingRuntime } from '@/shared/services/studyLoggingRuntime'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
})

const store = useStore()
const router = useRouter()
const { t } = useI18n()
const {
  showStepAnnouncement,
  stepAnnouncementOverlay,
  nextStepAnnouncementTitle,
  nextStepAnnouncementKicker,
  safelyAnnounce,
} = useStepAnnouncement({ scroll: true })

const user = computed(() => store.getters.user)
const currentCardSortingAnswer = computed(
  () => store.getters.currentCardSortingAnswer,
)
const mediaUrls = computed(() => store.getters.mediaUrls)

const fullName = ref('')
const globalIndex = ref(0)
const start = ref(true)
const pendingCards = ref(0)
const submitting = ref(false)
const dialog = ref(false)
const sortingStarted = ref(false)
const startingRecording = ref(false)
const showScreenSharePrompt = ref(false)
const isRequestingScreenShare = ref(false)
const uploadingCount = ref(0)
const isWaitingForUploadToFinish = ref(false)
let finishTimeout = null

const audioRecorder = ref(null)
const screenRecorder = ref(null)
const videoRecorder = ref(null)

const localAnswer = reactive(
  new CardSortingEvaluatorAnswer({
    ...currentCardSortingAnswer.value,
    userDocId: user.value?.id ?? null,
    preTestAnswer: buildPreTestAnswer(),
    postTestAnswer: buildPostTestAnswer(),
  }),
)

fullName.value = localAnswer.fullName || ''
if (localAnswer.submitted) start.value = false

// Activity logging records only that the study was opened, consented to and
// submitted. Card and category names are participant free text and never
// reach logging.
let studyLogging = null
const initializeStudyLogging = () => {
  if (studyLogging || !user.value?.id || !props.test?.id) return studyLogging
  studyLogging = createStudyLoggingRuntime({
    ownerUid: user.value.id,
    studyId: props.test.id,
    studyType: 'CARD_SORTING',
    consentRequired: true,
    callFunction: FirebaseFunctionsController.callHttpsCallableFunction,
  })
  if (localAnswer.consentCompleted && !localAnswer.submitted) {
    void studyLogging.resumeAfterConsent()
  }
  return studyLogging
}

const cardSortingConfigurationIssues = computed(() => {
  const cardSorting = props.test?.testStructure?.cardSorting
  if (
    !cardSorting ||
    typeof cardSorting !== 'object' ||
    Array.isArray(cardSorting)
  ) {
    return ['missingStructure']
  }

  const issues = []
  const allowCreateCategories = !!cardSorting.options?.allow_create_categories

  if (!allowCreateCategories) {
    if (!Array.isArray(cardSorting.categories)) {
      issues.push('invalidCategories')
    } else if (cardSorting.categories.length === 0) {
      issues.push('missingCategories')
    }
  }

  if (!Array.isArray(cardSorting.cards)) {
    issues.push('invalidCards')
  } else if (cardSorting.cards.length === 0) {
    issues.push('missingCards')
  }

  return issues
})

const canStartCardSorting = computed(
  () => cardSortingConfigurationIssues.value.length === 0,
)

const cardSortingConfigurationIssueMessages = computed(() =>
  cardSortingConfigurationIssues.value.map((issue) =>
    t(`CardSorting.configurationIssues.${issue}`),
  ),
)

const truncateDescription = (description) => {
  if (!description || description.length <= 150) return description
  return `${description.slice(0, 147)}...`
}

const startTest = () => {
  if (!canStartCardSorting.value) return

  const startScreen = document.querySelector('.start-screen')
  if (startScreen) startScreen.classList.add('leaving')

  setTimeout(() => {
    start.value = false
  }, 1000)
}

const handleWelcomeStart = async () => {
  await safelyAnnounce(t('UserTestView.stepper.consent'), 1)
  globalIndex.value = 1
}

const recordingFlags = computed(() => {
  const options = props.test?.testStructure?.cardSorting?.options || {}
  return {
    hasScreenRecord: !!options.hasScreenRecord,
    hasCamRecord: !!options.hasCamRecord,
    hasAudioRecord: !!options.hasAudioRecord,
  }
})

const hasAnyRecording = computed(
  () =>
    recordingFlags.value.hasScreenRecord ||
    recordingFlags.value.hasCamRecord ||
    recordingFlags.value.hasAudioRecord,
)

const hasPreTest = computed(() => {
  return (
    props.test?.testStructure?.preTest != null &&
    props.test?.testStructure?.preTest.length > 0
  )
})

const hasPostTest = computed(() => {
  return (
    props.test?.testStructure?.postTest != null &&
    props.test?.testStructure?.postTest.length > 0
  )
})

const welcomeSections = computed(() => {
  const message = props.test?.testStructure?.welcomeMessage
  if (!message) return []
  return [{ id: 'welcome', content: message }]
})

const welcomeSteps = computed(() => {
  const steps = [t('CardSorting.welcomeSteps.consent')]
  if (hasPreTest.value) {
    steps.push(t('CardSorting.welcomeSteps.preTest'))
  }
  steps.push(t('CardSorting.title'))
  if (hasPostTest.value) {
    steps.push(t('CardSorting.welcomeSteps.postTest'))
  }
  steps.push(t('CardSorting.welcomeSteps.submission'))
  return steps
})

// Mirrors UserTestView stepper mapping (no eye tracking / no PreTasks)
const stepperValue = computed(() => {
  if (globalIndex.value === 0) return -1
  if (globalIndex.value === 1) return 0
  if (globalIndex.value === 2) return 1
  if (globalIndex.value === 4) return 2
  if (globalIndex.value === 5 && !localAnswer.postTestCompleted) return 3
  if (globalIndex.value === 6 && localAnswer.postTestCompleted) return 4
  return 0
})

const completionStepValue = computed(() => {
  if (hasPostTest.value) return hasPreTest.value ? 5 : 4
  return hasPreTest.value ? 4 : 3
})

const activeStepperItem = computed(() => {
  if (globalIndex.value <= 1) return 1
  if (globalIndex.value === 2) return 2
  if (globalIndex.value === 4) return hasPreTest.value ? 3 : 2
  if (globalIndex.value === 5) return hasPreTest.value ? 4 : 3
  return completionStepValue.value
})

const isCurrentCardStep = (value) => activeStepperItem.value === Number(value)

const progress = computed(() => {
  const steps = [
    1,
    hasPreTest.value ? 2 : null,
    4,
    hasPostTest.value ? 5 : null,
    6,
  ].filter((s) => s != null)
  const currentPos = steps.indexOf(globalIndex.value)
  if (currentPos < 0) return 0
  return Math.round((currentPos / (steps.length - 1)) * 100)
})

function buildPreTestAnswer() {
  const existing = currentCardSortingAnswer.value?.preTestAnswer
  if (Array.isArray(existing) && existing.length) return existing
  const preTest = props.test?.testStructure?.preTest || []
  return preTest.map((_, index) => ({ preTestAnswerId: index, answer: '' }))
}

function buildPostTestAnswer() {
  const existing = currentCardSortingAnswer.value?.postTestAnswer
  if (Array.isArray(existing) && existing.length) return existing
  const postTest = props.test?.testStructure?.postTest || []
  return postTest.map((item, index) => ({
    ...item,
    postTestAnswerId: index,
    answer: '',
  }))
}

function attachMediaToAnswer(answer, urls) {
  if (!urls) return
  const medias = urls[0] || urls['0']
  if (!medias) return

  for (const type in medias) {
    if (type === 'sizes') {
      const sizes = medias[type]
      if (sizes.screenRecordURL) answer.screenSize = sizes.screenRecordURL
      if (sizes.audioRecordURL) answer.audioSize = sizes.audioRecordURL
      if (sizes.webcamRecordURL) answer.webcamSize = sizes.webcamRecordURL
      continue
    }
    const field = MEDIA_FIELD_MAP?.[type] || type
    if (medias[type] != null) answer[field] = medias[type]
  }
}

const savePartial = async () => {
  if (!user.value) return
  localAnswer.userDocId = user.value.id
  localAnswer.fullName = fullName.value
  localAnswer.invited = true
  localAnswer.lastUpdate = Date.now()
  localAnswer.progress = Math.round(progress.value)
  attachMediaToAnswer(localAnswer, mediaUrls.value)

  await store.dispatch('saveTestAnswer', {
    data: new CardSortingEvaluatorAnswer({ ...localAnswer }),
    answersDocId: props.test.answersDocId,
    testType: props.test.testType,
  })
}

function onShowLoading() {
  uploadingCount.value++
}

function onStopShowLoading() {
  uploadingCount.value--
  if (uploadingCount.value < 0) uploadingCount.value = 0

  if (uploadingCount.value === 0 && isWaitingForUploadToFinish.value) {
    proceedAfterSorting()
  }
}

function forceStopAllMedia() {
  audioRecorder.value?.stopAudioRecording?.()
  videoRecorder.value?.stopRecording?.()
  screenRecorder.value?.stopRecording?.()
}

async function startMediaRecorders({
  skipScreen = false,
  screenOnly = false,
} = {}) {
  if (
    !skipScreen &&
    recordingFlags.value.hasScreenRecord &&
    screenRecorder.value
  ) {
    const screenStarted = await screenRecorder.value.captureScreen({
      requireEntireScreen: false,
    })
    if (!screenStarted) return false
  }
  if (screenOnly) return true

  if (recordingFlags.value.hasAudioRecord && audioRecorder.value) {
    await audioRecorder.value.startAudioRecording()
  }
  if (recordingFlags.value.hasCamRecord && videoRecorder.value) {
    const videoStarted = await videoRecorder.value.startRecording()
    if (!videoStarted) return false
  }
  return true
}

function onStartSorting() {
  if (recordingFlags.value.hasScreenRecord) {
    showScreenSharePrompt.value = true
    return
  }
  startSortingWithRecording()
}

function cancelScreenSharePrompt() {
  if (isRequestingScreenShare.value) return
  showScreenSharePrompt.value = false
}

async function confirmScreenShare() {
  isRequestingScreenShare.value = true
  try {
    await nextTick()
    const screenStarted = await startMediaRecorders({ screenOnly: true })
    if (!screenStarted) return
    showScreenSharePrompt.value = false
    await startSortingWithRecording({ skipScreen: true })
  } finally {
    isRequestingScreenShare.value = false
  }
}

async function startSortingWithRecording({ skipScreen = false } = {}) {
  startingRecording.value = true
  try {
    await nextTick()
    const mediaStarted = await startMediaRecorders({ skipScreen })
    if (!mediaStarted) {
      screenRecorder.value?.abortCapture?.()
      return
    }
    sortingStarted.value = true
  } finally {
    startingRecording.value = false
  }
}

async function finishSorting() {
  if (hasAnyRecording.value) {
    forceStopAllMedia()

    if (uploadingCount.value > 0) {
      isWaitingForUploadToFinish.value = true
      return
    }

    isWaitingForUploadToFinish.value = true
    finishTimeout = setTimeout(() => {
      if (uploadingCount.value === 0 && isWaitingForUploadToFinish.value) {
        proceedAfterSorting()
      }
    }, 500)
    return
  }

  await proceedAfterSorting()
}

async function proceedAfterSorting() {
  isWaitingForUploadToFinish.value = false
  if (finishTimeout) {
    clearTimeout(finishTimeout)
    finishTimeout = null
  }
  await completeStep('sorting')
}

const completeStep = async (type) => {
  try {
    if (type === 'consent') {
      const consentAcceptedAt = new Date().toISOString()
      localAnswer.consentCompleted = true
      localAnswer.consent = props.test.testStructure.consent || ''
      if (hasPreTest.value) {
        await safelyAnnounce(t('UserTestView.stepper.preTest'), 2)
        globalIndex.value = 2
      } else {
        await safelyAnnounce(t('CardSorting.cardClassification'), 2)
        localAnswer.preTestCompleted = true
        globalIndex.value = 4
        if (!hasAnyRecording.value) sortingStarted.value = true
      }
      await savePartial()
      if (user.value) {
        void initializeStudyLogging()?.consentAccepted(consentAcceptedAt)
      }
      return
    }

    if (type === 'preTest') {
      await safelyAnnounce(t('CardSorting.cardClassification'), 3)
      localAnswer.preTestCompleted = true
      globalIndex.value = 4
      if (!hasAnyRecording.value) sortingStarted.value = true
      await savePartial()
      return
    }

    if (type === 'sorting') {
      if (hasPostTest.value) {
        await safelyAnnounce(t('UserTestView.stepper.postTest'), 4)
        globalIndex.value = 5
      } else {
        await safelyAnnounce(t('UserTestView.stepper.completion'), 4)
        localAnswer.postTestCompleted = true
        globalIndex.value = 6
      }
      await savePartial()
      return
    }

    if (type === 'postTest') {
      await safelyAnnounce(t('UserTestView.stepper.completion'), 5)
      localAnswer.postTestCompleted = true
      globalIndex.value = 6
      await savePartial()
    }
  } catch {
    showError('CardSorting.saveError')
  }
}

const handleConsentDecline = () => {
  showInfo('UserTestView.alerts.consentDecline')
  setTimeout(() => {
    router.push('/admin')
  }, 2000)
}

const handleSubmit = () => {
  dialog.value = false
  submit()
}

const submit = async () => {
  try {
    submitting.value = true
    localAnswer.submitted = true
    localAnswer.progress = 100
    await savePartial()
    void initializeStudyLogging()?.submitted()
    showSuccess('CardSorting.answerSubmitted')
    router.push('/admin')
  } catch {
    localAnswer.submitted = false
    showError('CardSorting.saveError')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  initializeStudyLogging()
  if (localAnswer.submitted) {
    globalIndex.value = 6
    localAnswer.postTestCompleted = true
  }
  if (!hasAnyRecording.value) {
    sortingStarted.value = true
  }
})

onBeforeUnmount(() => {
  if (finishTimeout) {
    clearTimeout(finishTimeout)
    finishTimeout = null
  }
  forceStopAllMedia()
  uploadingCount.value = 0
  isWaitingForUploadToFinish.value = false
  studyLogging?.destroy()
})
</script>

<style scoped>
.start-screen {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-size: 200% 200%;
  animation: subtleGradient 20s ease-in-out infinite;
  background-image: linear-gradient(
    160deg,
    #00213f 0%,
    #1a2f4f 35%,
    #303f9f 100%
  );
  transition: opacity 8s cubic-bezier(0.4, 0, 0.2, 1);
}

.start-screen > :not(.session-backdrop-mark) {
  position: relative;
  z-index: 1;
}

.start-screen.leaving,
.start-screen.leaving > *,
.start-screen.leaving::before {
  opacity: 0;
  transition-duration: 1.2s;
}

.start-screen__alert-details {
  margin: 8px 0 0;
  padding-left: 1.25rem;
}

@keyframes subtleGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.welcome-main-centered {
  min-height: 100vh;
  align-items: center;
}

.session-transparent {
  background: transparent;
}

.session-transparent :deep(.v-card--variant-elevated),
.session-transparent :deep(.v-card--variant-flat) {
  background: transparent !important;
  background-color: transparent !important;
}

.welcome-content-centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.step-announcement-container {
  position: fixed;
  inset: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #00213f;
}

.sticky-stepper {
  position: sticky;
  top: 0;
  z-index: 10;
  background: transparent;
}

.main-stepper {
  background: #00213f !important;
  color: #fff !important;
  --v-stepper-header-title-color: #fff !important;
  --v-stepper-item-title-color: #fff !important;
  --v-stepper-item-color: #fff !important;
  transition:
    background 1s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-stepper-item__avatar) {
  font-size: 1rem !important;
  font-weight: 900 !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.v-stepper-item--complete .v-stepper-item__avatar .v-icon) {
  font-size: 1.25rem !important;
  width: 2.2rem !important;
  height: 2.2rem !important;
}

:deep(.v-stepper-item__title) {
  font-size: 1.1rem !important;
  font-weight: 300 !important;
  line-height: 0.8 !important;
}

.v-stepper-item {
  padding: 1rem;
}

.recording-features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.recording-feature-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 12px;
}

.feature-icon-container {
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .recording-features-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
