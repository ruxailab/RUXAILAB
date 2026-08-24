<template>
  <div>
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

    <v-container fluid class="pa-0">
      <v-row class="main-test-interface pa-0 ma-0">
        <v-col class="right-view pa-6">
          <v-row v-if="globalIndex >= 1" class="stepper-row sticky-stepper">
            <v-col cols="12">
              <v-stepper
                :model-value="stepperValue"
                class="main-stepper rounded-xl elevation-3"
              >
                <v-stepper-header>
                  <v-stepper-item
                    value="1"
                    :title="$t('UserTestView.stepper.consent')"
                    :complete="stepperValue >= 1"
                    color="white"
                    complete-icon="mdi-check"
                  />
                  <v-divider />

                  <template v-if="hasPreTest">
                    <v-stepper-item
                      value="2"
                      :title="$t('UserTestView.stepper.preTest')"
                      :complete="stepperValue >= 2"
                      color="white"
                      complete-icon="mdi-check"
                    />
                    <v-divider />
                  </template>

                  <v-stepper-item
                    :value="hasPreTest ? 3 : 2"
                    :title="$t('UserTestView.stepper.tasks')"
                    :complete="stepperValue >= 3"
                    color="white"
                    complete-icon="mdi-check"
                  />
                  <v-divider />

                  <template v-if="hasPostTest">
                    <v-stepper-item
                      :value="hasPreTest ? 4 : 3"
                      :title="$t('UserTestView.stepper.postTest')"
                      :complete="stepperValue >= 4"
                      color="white"
                      complete-icon="mdi-check"
                    />
                    <v-divider />
                  </template>

                  <v-stepper-item
                    :value="
                      hasPostTest ? (hasPreTest ? 5 : 4) : hasPreTest ? 4 : 3
                    "
                    :title="$t('UserTestView.stepper.completion')"
                    :complete="stepperValue >= 4"
                    color="white"
                    complete-icon="mdi-check"
                  />
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>

          <WelcomeStep
            v-if="globalIndex === 0"
            :stepper-value="stepperValue"
            :has-eye-tracking="false"
            :has-pre-test="hasPreTest"
            :has-post-test="hasPostTest"
            :welcome-message="test?.testStructure?.welcomeMessage"
            @start="globalIndex = 1"
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
import WelcomeStep from '@/ux/UserTest/components/steps/WelcomeStep.vue'
import ConsentStep from '@/ux/UserTest/components/steps/ConsentStep.vue'
import PreTestStep from '@/ux/UserTest/components/steps/PreTestStep.vue'
import PostTestStep from '@/ux/UserTest/components/steps/PostTestStep.vue'
import FinishStep from '@/ux/UserTest/components/steps/FinishStep.vue'
import SubmitDialog from '@/ux/UserTest/components/SubmitDialog.vue'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import AudioRecorder from '@/ux/UserTest/components/AudioRecorder.vue'
import ScreenRecorder from '@/ux/UserTest/components/ScreenRecorder.vue'
import ScreenShareInstructions from '@/ux/UserTest/components/ScreenShareInstructions.vue'
import VideoRecorder from '@/ux/UserTest/components/VideoRecorder.vue'
import CardSortingTask from './CardSortingTask.vue'
import CardSortingEvaluatorAnswer from '../models/CardSortingEvaluatorAnswer'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'
import { showError, showSuccess, showInfo } from '@/shared/utils/toast'

const props = defineProps({
  test: {
    type: Object,
    required: true,
  },
})

const store = useStore()
const router = useRouter()

const user = computed(() => store.getters.user)
const currentCardSortingAnswer = computed(
  () => store.getters.currentCardSortingAnswer,
)
const mediaUrls = computed(() => store.getters.mediaUrls)

const fullName = ref('')
const globalIndex = ref(0)
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
      localAnswer.consentCompleted = true
      localAnswer.consent = props.test.testStructure.consent || ''
      if (hasPreTest.value) {
        globalIndex.value = 2
      } else {
        localAnswer.preTestCompleted = true
        globalIndex.value = 4
        if (!hasAnyRecording.value) sortingStarted.value = true
      }
      await savePartial()
      return
    }

    if (type === 'preTest') {
      localAnswer.preTestCompleted = true
      globalIndex.value = 4
      if (!hasAnyRecording.value) sortingStarted.value = true
      await savePartial()
      return
    }

    if (type === 'sorting') {
      if (hasPostTest.value) {
        globalIndex.value = 5
      } else {
        localAnswer.postTestCompleted = true
        globalIndex.value = 6
      }
      await savePartial()
      return
    }

    if (type === 'postTest') {
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
})
</script>

<style scoped>
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
