<template>
  <div v-if="test" class="user-test-bg">
    <StepAnnouncementOverlay
      v-if="showStepAnnouncement"
      ref="stepAnnouncementOverlay"
      :kicker="nextStepAnnouncementKicker"
      :title="nextStepAnnouncementTitle"
    />

    <div>
      <IrisTracker
        v-if="
          hasEyeTracking &&
          globalIndex === (hasEyeTracking ? 5 : 4) &&
          test.testStructure.userTasks[taskIndex]?.hasEye
        "
        :is-running="isTracking"
        :ms-per-capture="300"
        :test-id="testId"
        :task-index="taskIndex"
        @face-data="handleIrisData"
      />
    </div>

    <v-overlay v-model="isLoading" class="d-flex align-center justify-center">
      <div class="text-center">
        <v-progress-circular indeterminate color="#fca326" size="50" />
        <div style="color: white" class="mt-3">
          {{ $t('UserTestView.loading') }}
        </div>
      </div>
    </v-overlay>

    <Snackbar />

    <SubmitDialog
      :model-value="dialog"
      :title="$t('HeuristicsTestView.messages.submitTest')"
      :message="$t('HeuristicsTestView.messages.submitOnce')"
      :cancel-label="$t('buttons.cancel')"
      :submit-label="$t('buttons.submit')"
      @cancel="dialog = false"
      @submit="handleSubmit"
    />

    <v-dialog
      :model-value="fromlink && !noExistUser && !logined"
      max-width="400"
      persistent
    >
      <v-card v-if="user" class="rounded-xl pa-6">
        <v-row class="ma-0 pa-0" justify="center">
          <v-avatar color="primary-lighten-4" size="120">
            <v-icon size="80"> mdi-account-circle </v-icon>
          </v-avatar>
        </v-row>
        <v-card-title class="text-center text-h6 font-weight-bold mt-4">
          {{ $t('UserTestView.actions.welcomeBack') }}
        </v-card-title>
        <v-card-text class="text-center text-body-1">
          <p class="font-weight-medium">
            {{ user.email }}
          </p>
        </v-card-text>
        <v-card-actions class="d-flex flex-column pa-0">
          <v-btn
            color="primary"
            block
            variant="flat"
            class="my-2"
            @click="setTest"
          >
            {{
              $t('UserTestView.actions.continueAs', { userEmail: user.email })
            }}
          </v-btn>
          <p class="text-caption mt-2">
            {{ $t('UserTestView.actions.notYou') }}
            <a
              href="#"
              class="text-primary font-weight-medium"
              @click.prevent="signOut"
              >{{ $t('UserTestView.actions.changeAccount') }}</a
            >
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-container fluid class="pa-0">
      <v-row
        v-if="test && start"
        class="start-screen background-img pa-0 ma-0"
        align="center"
      >
        <v-col md="8" class="ma-5 pa-5">
          <img
            src="../../../assets/logo_full_white.png"
            alt="RUXAILAB"
            class="mb-10"
            style="max-width: 300px"
          />
          <h1 class="text-h2 font-weight-bold text-white">
            {{ test.testTitle }}
          </h1>
          <p class="text-body mb-5 text-white text-justify">
            {{ test.testDescription }}
          </p>
          <v-btn
            color="white"
            variant="outlined"
            rounded
            class="mt-4"
            :disabled="isStartTestDisabled"
            @click="startTest"
          >
            {{ $t('UserTestView.actions.startTest') }}
          </v-btn>

          <!-- Messages when test is disabled -->
          <v-alert
            v-if="testDisabledReason === 'already-completed'"
            type="info"
            variant="outlined"
            class="mt-4"
            color="white"
            style="
              background-color: rgba(255, 255, 255, 0.1);
              border-color: white;
            "
          >
            <template #prepend>
              <v-icon color="white"> mdi-check-circle </v-icon>
            </template>
            <span class="text-white">
              <strong>{{
                $t('UserTestView.alerts.testAlreadyCompleted')
              }}</strong
              ><br />
              {{ $t('UserTestView.alerts.testAlreadyCompletedMessage') }}
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'Test has expired'"
            type="warning"
            variant="outlined"
            class="mt-4"
            color="white"
            style="
              background-color: rgba(255, 255, 255, 0.1);
              border-color: white;
            "
          >
            <template #prepend>
              <v-icon color="white"> mdi-clock-alert </v-icon>
            </template>
            <span class="text-white">
              <strong>{{ $t('UserTestView.alerts.testExpired') }}</strong
              ><br />
              {{ $t('UserTestView.alerts.testExpiredMessage') }}
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'Test is not active'"
            type="warning"
            variant="outlined"
            class="mt-4"
            color="white"
            style="
              background-color: rgba(255, 255, 255, 0.1);
              border-color: white;
            "
          >
            <template #prepend>
              <v-icon color="white"> mdi-pause-circle </v-icon>
            </template>
            <span class="text-white">
              <strong>{{ $t('UserTestView.alerts.testNotActive') }}</strong
              ><br />
              {{ $t('UserTestView.alerts.testNotActiveMessage') }}
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'Test has no tasks configured'"
            type="error"
            variant="outlined"
            class="mt-4"
            color="white"
            style="
              background-color: rgba(255, 255, 255, 0.1);
              border-color: white;
            "
          >
            <template #prepend>
              <v-icon color="white"> mdi-alert-circle </v-icon>
            </template>
            <span class="text-white">
              <strong>{{ $t('UserTestView.alerts.testConfigError') }}</strong
              ><br />
              {{ $t('UserTestView.alerts.testConfigErrorMessage') }}
            </span>
          </v-alert>
        </v-col>
      </v-row>

      <v-row
        v-else
        class="main-test-interface pa-0 ma-0"
        :class="{ 'welcome-main-centered': globalIndex === 0 }"
      >
        <v-col
          ref="rightView"
          class="right-view pa-6"
          :class="{ 'welcome-content-centered': globalIndex === 0 }"
        >
          <v-row v-if="globalIndex >= 1" class="stepper-row sticky-stepper">
            <v-col cols="12">
              <v-stepper
                :model-value="stepperValue + 1"
                class="main-stepper rounded-xl elevation-3"
                :class="{
                  'stepper-animate':
                    globalIndex === 4 &&
                    test?.testStructure?.userTasks?.length > 1,
                }"
                style="visibility: visible"
              >
                <v-stepper-header>
                  <v-stepper-item
                    :value="1"
                    :title="$t('UserTestView.stepper.consent')"
                    :complete="stepperValue >= 1"
                    color="white"
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <template v-if="hasPreTest">
                    <v-stepper-item
                      :value="2"
                      :title="$t('UserTestView.stepper.preTest')"
                      :complete="stepperValue >= 2"
                      color="white"
                      complete-icon="mdi-check"
                    />
                    <v-divider />
                  </template>

                  <v-stepper-item
                    v-if="hasEyeTracking"
                    :value="hasPreTest ? 3 : 2"
                    :title="$t('UserTestView.stepper.calibration')"
                    :complete="stepperValue >= (hasPreTest ? 3 : 2)"
                    color="white"
                    complete-icon="mdi-check"
                  />
                  <v-divider v-if="hasEyeTracking" />

                  <v-stepper-item
                    :value="
                      hasPreTest
                        ? hasEyeTracking
                          ? 4
                          : 3
                        : hasEyeTracking
                          ? 3
                          : 2
                    "
                    :title="$t('UserTestView.stepper.tasks')"
                    :complete="stepperValue >= (hasEyeTracking ? 4 : 3)"
                    color="white"
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <template v-if="hasPostTest">
                    <v-stepper-item
                      :value="
                        hasPreTest
                          ? hasEyeTracking
                            ? 5
                            : 4
                          : hasEyeTracking
                            ? 4
                            : 3
                      "
                      :title="$t('UserTestView.stepper.postTest')"
                      :complete="stepperValue >= (hasEyeTracking ? 5 : 4)"
                      color="white"
                      complete-icon="mdi-check"
                    />
                    <v-divider />
                  </template>
                  <v-stepper-item
                    :value="
                      hasPostTest
                        ? hasPreTest
                          ? hasEyeTracking
                            ? 6
                            : 5
                          : hasEyeTracking
                            ? 5
                            : 4
                        : hasPreTest
                          ? hasEyeTracking
                            ? 5
                            : 4
                          : hasEyeTracking
                            ? 4
                            : 3
                    "
                    :title="$t('UserTestView.stepper.completion')"
                    :complete="stepperValue === (hasEyeTracking ? 6 : 5)"
                    color="white"
                    complete-icon="mdi-check"
                  />
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>
          <!-- Stepper secundario para tareas -->
          <v-row
            v-if="
              globalIndex == (hasEyeTracking ? 5 : 4) &&
              test?.testStructure?.userTasks?.length > 1
            "
            class="task-stepper-row"
            justify="center"
          >
            <v-col cols="12" md="8" lg="6" class="d-flex justify-center">
              <v-stepper
                :model-value="taskIndex + 1"
                class="task-stepper rounded-xl elevation-1 w-100"
                style="max-width: 100%"
              >
                <v-stepper-header>
                  <template
                    v-for="(task, idx) in test.testStructure.userTasks"
                    :key="idx"
                  >
                    <v-stepper-item
                      :value="idx + 1"
                      :title="
                        $t('UserTestView.stepper.taskX', { num: idx + 1 })
                      "
                      :complete="taskIndex > idx"
                      :color="
                        taskIndex > idx
                          ? 'success'
                          : taskIndex === idx
                            ? 'primary'
                            : 'grey'
                      "
                      complete-icon="mdi-check"
                    />
                    <v-divider
                      v-if="idx < test.testStructure.userTasks.length - 1"
                    />
                  </template>
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>

          <WelcomeStep
            v-if="globalIndex === 0"
            :stepper-value="stepperValue"
            :has-eye-tracking="hasEyeTracking"
            :has-pre-test="hasPreTest"
            :has-post-test="hasPostTest"
            :welcome-message="test?.testStructure?.welcomeMessage"
            @start="handleWelcomeStart"
          />

          <ConsentStep
            v-if="globalIndex === 1 && taskIndex === 0"
            :test-title="test.testTitle"
            :consent-text="test.testStructure.consent"
            :full-name-model="fullName"
            :consent-completed-model="localTestAnswer.consentCompleted"
            @update:full-name-model="(val) => (fullName = val)"
            @update:consent-completed-model="
              (val) => (localTestAnswer.consentCompleted = val)
            "
            @continue="completeStep(taskIndex, 'consent')"
            @decline-consent="handleConsentDecline"
          />

          <PreTestStep
            v-if="globalIndex === 2 && taskIndex === 0"
            :test-title="test.testTitle"
            :pre-test="test.testStructure.preTest"
            :pre-test-answer="localTestAnswer.preTestAnswer"
            :pre-test-completed="localTestAnswer.preTestCompleted"
            @done="completeStep(taskIndex, 'preTest')"
          />

          <EyeTrackingCalibrationStep
            v-if="globalIndex === 3 && hasEyeTracking"
            :calibration-in-progress="calibrationInProgress"
            :calibration-completed="calibrationCompleted"
            @done="globalIndex = hasPreTest ? 4 : 5"
            @close-calibration="closeCalibration()"
            @open-calibration="openCalibration()"
          />

          <PreTasksStep
            v-if="
              hasPreTest &&
              globalIndex === (hasEyeTracking ? 4 : 3) &&
              taskIndex === 0
            "
            :num-tasks="test?.testStructure?.userTasks?.length || 0"
            @start-tasks="handleStartTasks"
          />

          <TaskStep
            v-if="
              globalIndex === (hasEyeTracking ? 5 : 4) &&
              test.testType === STUDY_TYPES.USER &&
              test?.testStructure?.userTasks?.[taskIndex] &&
              localTestAnswer?.tasks?.[taskIndex]
            "
            ref="taskStepComponent"
            v-model:post-answer="localTestAnswer.tasks[taskIndex].postAnswer"
            v-model:task-answer="localTestAnswer.tasks[taskIndex].taskAnswer"
            v-model:task-observations="
              localTestAnswer.tasks[taskIndex].taskObservations
            "
            :task="test.testStructure.userTasks[taskIndex]"
            :task-index="taskIndex"
            :test-id="testId"
            :user-doc-id="user?.id || anonymousUserDocId"
            :sus-answers="localTestAnswer.tasks[taskIndex].susAnswers"
            :nasa-tlx-answers="localTestAnswer.tasks[taskIndex].nasaTlxAnswers"
            :tam-answers="localTestAnswer.tasks[taskIndex].tamAnswers"
            :sart-answers="localTestAnswer.tasks[taskIndex].sartAnswers"
            :submitted="localTestAnswer.submitted"
            :done-task-disabled="doneTaskDisabled"
            @update:sus-answers="
              (val) => {
                localTestAnswer.tasks[taskIndex].susAnswers = Array.isArray(val)
                  ? [...val]
                  : []
              }
            "
            @update:nasa-tlx-answers="
              (val) => {
                localTestAnswer.tasks[taskIndex].nasaTlxAnswers = { ...val }
              }
            "
            @update:tam-answers="
              (val) => {
                localTestAnswer.tasks[taskIndex].tamAnswers = { ...val }
              }
            "
            @update:sart-answers="
              (val) => {
                localTestAnswer.tasks[taskIndex].sartAnswers = { ...val }
              }
            "
            @done="
              () => {
                handleTaskFinish(true)
                toggleTracking(false)
              }
            "
            @could-not-finish="() => handleTaskFinish(false)"
            @show-loading="isLoading = true"
            @stop-show-loading="isLoading = false"
            @recording-started="isVisualizerVisible = $event"
            @tip-pressed="handleTipPressed"
            @timer-stopped="handleTimerStopped"
            @start-task="
              () => {
                if (test.testStructure.userTasks[taskIndex]?.hasEye) {
                  toggleTracking(true)
                }
              }
            "
          />

          <PostTestStep
            v-if="
              hasPostTest &&
              globalIndex === (hasEyeTracking ? 6 : 5) &&
              (!localTestAnswer.postTestCompleted || localTestAnswer.submitted)
            "
            :test-title="test.testTitle"
            :post-test="test.testStructure.postTest"
            :post-test-answer="localTestAnswer.postTestAnswer"
            :post-test-completed="localTestAnswer.postTestCompleted"
            @done="
              async () => {
                await completeStep(taskIndex, 'postTest')
                taskIndex = 3
              }
            "
          />

          <FinishStep
            v-if="
              globalIndex === (hasEyeTracking ? 7 : 6) &&
              localTestAnswer.postTestCompleted &&
              !localTestAnswer.submitted
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
import SubmitDialog from '@/ux/UserTest/components/SubmitDialog.vue'
import { doc, onSnapshot } from 'firebase/firestore'
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  reactive,
  watchEffect,
} from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Snackbar from '@/shared/components/Snackbar'
import { nanoid } from 'nanoid'
import WelcomeStep from '@/ux/UserTest/components/steps/WelcomeStep.vue'
import ConsentStep from '@/ux/UserTest/components/steps/ConsentStep.vue'
import PreTestStep from '@/ux/UserTest/components/steps/PreTestStep.vue'
import PreTasksStep from '@/ux/UserTest/components/steps/PreTasksStep.vue'
import TaskStep from '@/ux/UserTest/components/steps/TaskStep.vue'
import PostTestStep from '@/ux/UserTest/components/steps/PostTestStep.vue'
import FinishStep from '@/ux/UserTest/components/steps/FinishStep.vue'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer'
import TaskAnswer from '@/ux/UserTest/models/TaskAnswer'
import EyeTrackingCalibrationStep from '@/ux/UserTest/components/calibration/EyeTrackingCalibrationStep.vue'
import { db } from '@/app/plugins/firebase'
import IrisTracker from '../components/IrisTracker.vue'
import StepAnnouncementOverlay from '@/ux/UserTest/components/StepAnnouncementOverlay.vue'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'
import { calculateProgress } from '../utils/testProgress'
import { animateStepAnnouncement } from '@/shared/utils/animations'

const fullName = ref('')
const logined = ref(null)
const fromlink = ref(null)
const start = ref(true)
const globalIndex = ref(null)
const noExistUser = ref(true)
const taskIndex = ref(0)
const preTestIndex = ref(null)
const items = ref([])
const dialog = ref(false)
const allTasksCompleted = ref(false)
const isLoading = ref(false)
const isVisualizerVisible = ref(false)
const doneTaskDisabled = ref(false)
const anonymousUserDocId = ref(null)
const calibrationPopup = ref(null)
const showStepAnnouncement = ref(false)
const stepAnnouncementOverlay = ref(null)
const nextStepAnnouncementTitle = ref('')
const nextStepAnnouncementKicker = ref('')

const rightView = ref(null)
const videoRecorder = ref(null)
const taskStepComponent = ref(null)
const timerComponent = computed(() => {
  // Get timer ref from TaskStep
  return taskStepComponent.value?.$refs?.timerComponent || null
})

//  Eye tracking web gazer testing

const isTracking = ref(false)
const isRecording = ref(false)
const eyeCalibrationStepDone = ref(false)
const calibrationCompleted = ref(false)
const calibrationInProgress = ref(false)

//  Eye tracking web gazer testing

const localTestAnswer = reactive(new UserStudyEvaluatorAnswer())

const store = useStore()
const router = useRouter()
const { t } = useI18n()

const mediaUrls = computed(() => store.getters.mediaUrls)
const test = computed(() => store.getters.test)
const testId = computed(() => store.getters.test?.id || null)
const user = computed(() => {
  if (store.getters.user) setExistUser()
  return store.getters.user
})

const currentUserTestAnswer = computed(
  () => store.getters.currentUserTestAnswer || {},
)

const hasEyeTracking = computed(() =>
  test.value?.testStructure?.userTasks?.some((task) => task.hasEye),
)

const hasPreTest = computed(() => {
  return (
    test.value?.testStructure?.preTest != null &&
    test.value?.testStructure?.preTest.length > 0
  )
})

const hasPostTest = computed(() => {
  return (
    test.value?.testStructure?.postTest != null &&
    test.value?.testStructure?.postTest.length > 0
  )
})

const isUserTestAdmin = computed(() => {
  return test.value.testAdmin.userDocId === user.value?.id
})

const hasTestDashboardAccess = computed(() => {
  if (!user.value) return false
  if (isUserTestAdmin.value) return true
  const coop = test.value?.cooperators?.find(
    (c) => c.userDocId === user.value.id,
  )
  return coop?.accessLevel === ACCESS_LEVEL.EVALUATOR
})

const isStartTestDisabled = computed(() => {
  if (!test.value) return true

  // Check if testStructure is empty array or doesn't exist
  const hasValidTasks =
    test.value.testStructure &&
    Array.isArray(test.value.testStructure.userTasks) &&
    test.value.testStructure.userTasks.length > 0

  if (!hasValidTasks) return true

  // Check if status is different from 'active'
  if (test.value.status !== 'active') return true

  // Check if endDate is lower than current date
  if (test.value.endDate) {
    const currentDate = new Date()
    const endDate = new Date(test.value.endDate)
    if (endDate < currentDate) return true
  }

  // Check if user has already submitted the test
  if (localTestAnswer.submitted) return true

  return false
})

const testDisabledReason = computed(() => {
  if (!test.value) return 'Test not found'

  const hasValidTasks =
    test.value.testStructure &&
    Array.isArray(test.value.testStructure.userTasks) &&
    test.value.testStructure.userTasks.length > 0

  if (!hasValidTasks) return 'Test has no tasks configured'

  if (test.value.status !== 'active') return 'Test is not active'

  if (test.value.endDate) {
    const currentDate = new Date()
    const endDate = new Date(test.value.endDate)
    if (endDate < currentDate) return 'Test has expired'
  }

  if (localTestAnswer.submitted) return 'already-completed'

  return null
})

const stepperValue = computed(() => {
  if (globalIndex.value === 0) return -1 // Welcome

  // Consent
  if (globalIndex.value === 1 && taskIndex.value === 0) return 0

  // PreTest
  if (globalIndex.value === 2 && taskIndex.value === 0) return 1

  if (hasEyeTracking.value) {
    // EyeTracking flow
    if (globalIndex.value === 3) return 2 // Calibration
    if (globalIndex.value === 4) return 3 // PreTasks
    if (globalIndex.value === 5) return 3 // Tasks
    if (globalIndex.value === 6) return 4 // PostTest
    if (globalIndex.value === 7) return 5 // PostTest
  } else {
    // Normal flow
    if (globalIndex.value === 3) return 2 // PreTasks
    if (globalIndex.value === 4) return 2 // Tasks
    if (globalIndex.value === 5 && !localTestAnswer.postTestCompleted) return 3 // PostTest
    if (globalIndex.value === 6 && localTestAnswer.postTestCompleted) return 4 // Finish
  }

  return 0
})

function handleIrisData(data) {
  localTestAnswer.tasks[taskIndex.value].irisTrackingData.push(data)
}

const openCalibration = () => {
  calibrationPopup.value = window.open(
    `${process.env.VUE_APP_EYE_LAB_FRONTEND_URL}/calibration/camera?auth=${user.value?.id}&test=${test.value.id}`,
    '_blank',
  )
  calibrationInProgress.value = true
}

const closeCalibration = () => {
  calibrationInProgress.value = false
  completeStep(taskIndex.value, 'eyeCalibration')
}

function toggleTracking(value) {
  isTracking.value = value
  isRecording.value = value
}

const savePartialAnswer = async () => {
  try {
    calculateProgress(localTestAnswer)
    localTestAnswer.fullName = fullName.value

    if (user.value && user.value?.email) {
      localTestAnswer.userDocId = user.value.id
      localTestAnswer.invited = true
    } else if (!user.value && anonymousUserDocId.value) {
      localTestAnswer.userDocId = anonymousUserDocId.value
    }

    if (!user.value) {
      await store.dispatch('saveTestAnswer', {
        data: localTestAnswer,
        answersDocId: test.value.answersDocId,
        testType: test.value.testType,
      })
    } else {
      const updatedAnswer = UserStudyEvaluatorAnswer.toModel({
        ...currentUserTestAnswer.value,
        fullName: localTestAnswer.fullName,
        progress: localTestAnswer.progress,
        submitted: localTestAnswer.submitted,
        preTestAnswer: localTestAnswer.preTestAnswer,
        postTestAnswer: localTestAnswer.postTestAnswer,
        tasks: {
          ...currentUserTestAnswer.value.tasks,
          ...localTestAnswer.tasks,
        },
      })

      Object.assign(currentUserTestAnswer.value, updatedAnswer)

      await store.dispatch('saveTestAnswer', {
        data: currentUserTestAnswer.value,
        answersDocId: test.value.answersDocId,
        testType: test.value.testType,
      })
    }
  } catch (error) {
    // Propagate the error so callers can handle it (e.g., show toasts, prevent navigation).
    throw error
  }
}

const saveAnswer = async () => {
  try {
    attachMediaToTasks(localTestAnswer, mediaUrls.value)
    await savePartialAnswer()
    if (hasTestDashboardAccess.value) {
      router.push(`/userTest/unmoderated/dashboard/${test.value.id}`)
    } else {
      router.push('/admin')
    }
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: t('UserTestView.errors.failedToSaveAnswer'),
    })
  }
}

const submitAnswer = async () => {
  try {
    isLoading.value = true
    localTestAnswer.submitted = true
    await saveAnswer()
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: t('UserTestView.errors.failedToSubmitAnswer'),
    })
  }
}

const handleConsentDecline = () => {
  // User declined consent, end the test
  store.commit('SET_TOAST', {
    type: 'info',
    message: t('UserTestView.alerts.consentDecline'),
    timeout: 5000,
  })

  // Navigate back to admin or appropriate page
  setTimeout(() => {
    router.push('/admin')
  }, 2000)
}

const handleSubmit = () => {
  dialog.value = false
  submitAnswer()
}

const attachMediaToTasks = (answer, mediaUrls) => {
  if (!answer?.tasks) return

  const taskEntries = Array.isArray(answer.tasks)
    ? answer.tasks.map((task, index) => [index, task])
    : Object.entries(answer.tasks)

  if (!taskEntries.length) return

  for (const [taskIndex, medias] of Object.entries(mediaUrls)) {
    const task = answer.tasks[taskIndex]
    if (!task) continue

    for (const type in medias) {
      if (type === 'sizes') {
        const sizes = medias[type]

        if (sizes.screenRecordURL) {
          task.screenSize = sizes.screenRecordURL
        }
        if (sizes.audioRecordURL) {
          task.audioSize = sizes.audioRecordURL
        }
        if (sizes.webcamRecordURL) {
          task.webcamSize = sizes.webcamRecordURL
        }
        continue
      }
      const field = MEDIA_FIELD_MAP?.[type] || type
      const url = medias[type]
      if (url != null) task[field] = url
    }
  }
}

const startTest = async () => {
  if (!test.value.testStructure || test.value.testStructure.length === 0) {
    store.commit('SET_TOAST', {
      type: 'info',
      message: t('UserTestView.messages.noTasks'),
    })
    router.push(`/missions/${test.value.id}`)
    return
  }

  await requestFullscreenIfAvailable()

  if (!isUserTestAdmin.value && user.value) {
    await store.dispatch('acceptStudyCollaboration', {
      test: test.value,
      cooperator: user.value,
    })
  }

  // Primero añadimos la clase para la animación de salida
  const startScreen = document.querySelector('.start-screen')
  if (startScreen) {
    startScreen.classList.add('leaving')
  }

  // Esperamos a que termine la animación antes de cambiar el estado
  setTimeout(() => {
    start.value = false
  }, 1000)
}

const showNextStepAnnouncement = async (
  title,
  stageNumber,
  kickerOverride = '',
) => {
  nextStepAnnouncementKicker.value = kickerOverride || `Stage ${stageNumber}`
  nextStepAnnouncementTitle.value = title
  showStepAnnouncement.value = true

  const safetyHideTimer = window.setTimeout(() => {
    showStepAnnouncement.value = false
  }, 4200)

  try {
    await nextTick()
    await animateStepAnnouncement(stepAnnouncementOverlay.value, {
      totalDuration: 3,
    })
  } finally {
    window.clearTimeout(safetyHideTimer)
    showStepAnnouncement.value = false
  }
}

const safelyShowNextStepAnnouncement = async (
  title,
  stageNumber,
  kickerOverride = '',
) => {
  try {
    await showNextStepAnnouncement(title, stageNumber, kickerOverride)
  } catch {
    // Non-critical: users can continue even if announcement animation fails.
  }
}

const persistStepProgress = async () => {
  try {
    await savePartialAnswer()
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: t('UserTestView.errors.failedToSaveAnswer'),
    })
  }
}

const handleWelcomeStart = async () => {
  await safelyShowNextStepAnnouncement(t('UserTestView.stepper.consent'), 1)
  globalIndex.value = 1
}

const handleStartTasks = async () => {
  await showTaskTitleAnnouncement(0)
  taskIndex.value = 0
  globalIndex.value = hasEyeTracking.value ? 5 : 4
}

const showTaskTitleAnnouncement = async (idx) => {
  const task = test.value?.testStructure?.userTasks?.[idx]
  if (!task) return

  const fallbackTitle = t('UserTestView.stepper.taskX', { num: idx + 1 })
  const announcementTitle = task.taskName || fallbackTitle
  const announcementKicker = fallbackTitle

  await safelyShowNextStepAnnouncement(announcementTitle, 3, announcementKicker)
}

const getPostConsentAnnouncementTitle = () => {
  if (hasPreTest.value) return t('UserTestView.stepper.preTest')
  if (hasEyeTracking.value) return t('UserTestView.stepper.calibration')
  return t('UserTestView.stepper.tasks')
}

const getPostTasksAnnouncement = () => {
  if (hasPostTest.value) {
    return {
      title: t('UserTestView.stepper.postTest'),
      stage: 4,
    }
  }

  return {
    title: t('UserTestView.WelcomeStep.steps.submission'),
    stage: 4,
  }
}

const requestFullscreenIfAvailable = async () => {
  if (document.fullscreenElement) return

  const root = document.documentElement
  try {
    if (root.requestFullscreen) {
      await root.requestFullscreen()
      return
    }

    const legacy =
      root.webkitRequestFullscreen ||
      root.mozRequestFullScreen ||
      root.msRequestFullscreen

    if (legacy) {
      await legacy.call(root)
    }
  } catch {
    // Ignore if blocked by browser/user settings and continue test flow.
  }
}

const callTimerSave = () => {
  if (
    timerComponent.value &&
    typeof timerComponent.value.stopTimer === 'function'
  ) {
    timerComponent.value.stopTimer()
  }
}

async function handleTaskFinish(userCompleted) {
  callTimerSave()

  await nextTick()

  if (isLoading.value) {
    const unwatch = watch(
      () => isLoading.value,
      async (val) => {
        if (!val) {
          unwatch()
          await completeStep(taskIndex.value, 'tasks', userCompleted)
          attachMediaToTasks(localTestAnswer, mediaUrls.value)
          await persistStepProgress()
        }
      },
    )
  } else {
    await completeStep(taskIndex.value, 'tasks', userCompleted)
    attachMediaToTasks(localTestAnswer, mediaUrls.value)
    await persistStepProgress()
  }
}

const handleTimerStopped = (elapsedTime, idx) => {
  // idx is passed from TaskStep, always use it

  if (!localTestAnswer.tasks) {
    return
  }

  if (idx === undefined || idx === null) {
    return
  }

  if (localTestAnswer.tasks[idx]) {
    // Asegurar que el tiempo es un número
    const timeToSave =
      typeof elapsedTime === 'number' ? elapsedTime : parseInt(elapsedTime)
    if (!isNaN(timeToSave)) {
      localTestAnswer.tasks[idx].taskTime = timeToSave
    } else {
      store.commit('SET_TOAST', {
        type: 'error',
        message: t('UserTestView.errors.timerIndexNotFound'),
        timeout: 3000,
      })
    }
  } else {
    store.commit('SET_TOAST', {
      type: 'error',
      message: t('UserTestView.errors.taskNotFound'),
      timeout: 3000,
    })
  }
}
const handleTipPressed = (idx) => {
  if (idx === undefined || idx === null) return
  if (!localTestAnswer.tasks?.[idx]) return

  const current = Number(localTestAnswer.tasks[idx].tipPressCount || 0)
  localTestAnswer.tasks[idx].tipPressCount = current + 1
}

const completeStep = async (id, type, userCompleted = true) => {
  try {
    if (type === 'consent') {
      localTestAnswer.consentCompleted = true
      await safelyShowNextStepAnnouncement(getPostConsentAnnouncementTitle(), 2)
      if (hasPreTest.value) {
        globalIndex.value = 2 // PreTest
      } else {
        // No pre-test: go to calibration if eye tracking is enabled, otherwise go to tasks
        globalIndex.value = hasEyeTracking.value ? 3 : 4
        localTestAnswer.preTestCompleted = true
      }
      await persistStepProgress()
    }

    if (type === 'preTest') {
      localTestAnswer.preTestCompleted = true
      await safelyShowNextStepAnnouncement(t('UserTestView.stepper.tasks'), 3)
      // With eye tracking: index 3 = Calibration; without eye tracking: index 3 = PreTasksStep
      globalIndex.value = 3
      await persistStepProgress()
    }

    if (type === 'eyeCalibration') {
      // After calibration: go to PreTasksStep if there was a pre-test, otherwise go directly to tasks
      globalIndex.value = hasPreTest.value ? 4 : 5
      taskIndex.value = 0
      eyeCalibrationStepDone.value = true
    }

    if (type === 'tasks') {
      if (!Array.isArray(localTestAnswer.tasks)) {
        return
      }
      localTestAnswer.tasks[id].completed = userCompleted

      // Mark this task as attempted (whether completed successfully or could not finish)
      localTestAnswer.tasks[id].attempted = true

      // Check if all tasks have been attempted
      let allTasksAttempted = true
      for (let i = 0; i < localTestAnswer.tasks.length; i++) {
        if (!localTestAnswer.tasks[i]?.attempted) {
          allTasksAttempted = false
          break
        }
      }
      allTasksCompleted.value = allTasksAttempted

      if (id < localTestAnswer.tasks.length - 1) {
        await showTaskTitleAnnouncement(id + 1)
        taskIndex.value = id + 1
      } else {
        taskIndex.value = id
        const postTasksAnnouncement = getPostTasksAnnouncement()
        await safelyShowNextStepAnnouncement(
          postTasksAnnouncement.title,
          postTasksAnnouncement.stage,
        )
        if (hasPostTest.value) {
          globalIndex.value = hasEyeTracking.value ? 6 : 5 // PostTest
        } else {
          globalIndex.value = hasEyeTracking.value ? 7 : 6 // Finish
          localTestAnswer.postTestCompleted = true
        }
      }
      if (userCompleted) {
        store.commit('SET_TOAST', {
          type: 'success',
          message: t('UserTestView.messages.taskCompletedSuccess', {
            taskName: test.value.testStructure.userTasks[id].taskName,
          }),
          timeout: 3000,
        })
      }
    } // closes if (type === 'tasks')

    if (type === 'postTest') {
      localTestAnswer.postTestCompleted = true
      await safelyShowNextStepAnnouncement(
        t('UserTestView.WelcomeStep.steps.submission'),
        5,
      )
      // items.value[2].icon = 'mdi-check-circle-outline';
      globalIndex.value = hasEyeTracking.value ? 7 : 6 // Finish
      await persistStepProgress()
    }

    calculateProgress(localTestAnswer)
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: 'Failed to complete step. Please try again.',
    })
  }
}

const autoComplete = async () => {
  if (
    !localTestAnswer ||
    !items.value ||
    !Array.isArray(items.value) ||
    items.value.length < 3
  )
    return

  // PRE-TEST
  if (items.value[0]?.value && Array.isArray(items.value[0].value)) {
    if (localTestAnswer.consentCompleted && items.value[0].value[0]) {
      items.value[0].value[0].icon = 'mdi-check-circle-outline'
    }
    if (localTestAnswer.preTestCompleted && items.value[0].value[1]) {
      items.value[0].value[1].icon = 'mdi-check-circle-outline'
    }
    if (
      localTestAnswer.preTestCompleted &&
      localTestAnswer.consentCompleted &&
      items.value[0]
    ) {
      items.value[0].icon = 'mdi-check-circle-outline'
    }
  }

  // TASKS
  if (items.value[1]?.value && Array.isArray(items.value[1].value)) {
    allTasksCompleted.value = true
    for (let i = 0; i < items.value[1].value.length; i++) {
      if (
        localTestAnswer.tasks &&
        localTestAnswer.tasks[i]?.attempted &&
        items.value[1].value[i]
      ) {
        items.value[1].value[i].icon = 'mdi-check-bold'
      }
      if (!localTestAnswer.tasks || !localTestAnswer.tasks[i]?.attempted) {
        allTasksCompleted.value = false
      }
    }
    if (allTasksCompleted.value && items.value[1]) {
      items.value[1].icon = 'mdi-check-bold'
    }
  }

  // POST-TEST
  if (items.value[2] && localTestAnswer.postTestCompleted) {
    items.value[2].icon = 'mdi-check-bold'
  }
}

const initializeAnonymousUser = () => {
  if (!user.value && !anonymousUserDocId.value) {
    anonymousUserDocId.value = nanoid(16)
  }
}

const setTest = async () => {
  try {
    logined.value = true
    await store.dispatch('getCurrentTestAnswerDoc')
    if (!currentUserTestAnswer.value) {
      currentUserTestAnswer.value = new UserStudyEvaluatorAnswer()
    }

    let tasksArray = []
    if (currentUserTestAnswer.value.tasks) {
      if (Array.isArray(currentUserTestAnswer.value.tasks)) {
        tasksArray = currentUserTestAnswer.value.tasks.map(
          (task) => new TaskAnswer(task),
        )
      } else if (typeof currentUserTestAnswer.value.tasks === 'object') {
        tasksArray = Object.values(currentUserTestAnswer.value.tasks).map(
          (task) => new TaskAnswer(task),
        )
      }
    }

    Object.assign(localTestAnswer, {
      consent: currentUserTestAnswer.value.consent || '',
      consentCompleted: currentUserTestAnswer.value.consentCompleted || false,
      preTestCompleted: currentUserTestAnswer.value.preTestCompleted || false,
      preTestAnswer: currentUserTestAnswer.value.preTestAnswer || [],
      tasks: tasksArray,
      postTestCompleted: currentUserTestAnswer.value.postTestCompleted || false,
      postTestAnswer: currentUserTestAnswer.value.postTestAnswer || [],
      submitted: currentUserTestAnswer.value.submitted || false,
      progress: currentUserTestAnswer.value.progress || 0,
      fullName: currentUserTestAnswer.value.fullName || '',
    })
    fullName.value = localTestAnswer.fullName
    await mappingSteps()
    await autoComplete()
    calculateProgress(localTestAnswer)
    initializeAnonymousUser()
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: 'Failed to load test data. Please try again.',
    })
  }
}

const setExistUser = () => {
  noExistUser.value = false
}

const mappingSteps = async () => {
  try {
    items.value = []

    // PreTest
    if (validate(test.value?.testStructure?.preTest)) {
      items.value.push({
        title: 'Pre-test',
        icon: 'mdi-check-bold',
        value: [
          {
            title: 'Consent',
            icon: 'mdi-check-bold',
            id: 0,
          },
          {
            title: 'Form',
            icon: 'mdi-check-bold',
            id: 1,
          },
        ],
        id: 0,
      })
      if (
        !localTestAnswer.preTestAnswer.length &&
        Array.isArray(test.value.testStructure.preTest)
      ) {
        localTestAnswer.preTestAnswer = test.value.testStructure.preTest.map(
          () => ({
            answer: '',
          }),
        )
      }
    }

    // Tasks
    if (validate(test.value?.testStructure?.userTasks)) {
      items.value.push({
        title: 'Tasks',
        icon: 'mdi-check-bold',
        value: test.value.testStructure.userTasks.map((task, index) => ({
          title: task.taskName,
          icon: 'mdi-check-bold',
          id: index,
        })),
        id: 1,
      })
      if (
        !localTestAnswer.tasks.length &&
        Array.isArray(test.value.testStructure.userTasks)
      ) {
        localTestAnswer.tasks = test.value.testStructure.userTasks.map(
          (task, i) => {
            const newTask = new TaskAnswer({
              taskId: task.id || i,
              taskAnswer: '',
              taskObservations: '',
              postAnswer: '',
              taskTime: 0,
              completed: false,
              attempted: false, // Track whether task has been attempted
              tipPressCount: 0,
              susAnswers: [],
              nasaTlxAnswers: {},
              tamAnswers: {},
              sartAnswers: {},
            })
            return newTask
          },
        )
      }
    }

    // PostTest
    if (validate(test.value?.testStructure?.postTest)) {
      items.value.push({
        title: 'Post Test',
        icon: 'mdi-check-bold',
        value: test.value.testStructure.postTest,
        id: 2,
      })
      if (
        !localTestAnswer.postTestAnswer.length &&
        Array.isArray(test.value.testStructure.postTest)
      ) {
        localTestAnswer.postTestAnswer = test.value.testStructure.postTest.map(
          () => ({
            answer: '',
          }),
        )
      }
    }
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: 'Failed to initialize test data. Please try again.',
    })
  }
}

const validate = (object) => {
  return (
    object !== null &&
    object !== undefined &&
    object !== '' &&
    Array.isArray(object) &&
    object.length > 0
  )
}
watchEffect(() => {
  const index = taskIndex.value

  const taskList = test.value?.testStructure?.userTasks
  const task = Array.isArray(taskList) ? taskList[index] : undefined

  const answers = localTestAnswer?.tasks?.[index]?.susAnswers

  if (task?.taskType === 'sus') {
    const validCount = answers?.filter((v) => typeof v === 'number').length ?? 0
    doneTaskDisabled.value = validCount < 10
  } else {
    doneTaskDisabled.value = false
  }
})

watch(
  () => items.value,
  () => {
    if (items.value.length && globalIndex.value === null) {
      globalIndex.value = items.value[0].id
      if (items.value.find((obj) => obj.id === 0)) {
        preTestIndex.value = items.value[0].value[0].id
      }
    }
  },
  { deep: true },
)

// Scroll to top of the page when step changes
const scrollToTop = () => {
  // For most browsers
  window.scrollTo({ top: 0, behavior: 'smooth' })
  // For rightView (in case of overflow)
  if (rightView.value) {
    rightView.value.scrollTop = 0
  }
}

watch(
  () => [globalIndex.value, taskIndex.value],
  () => {
    scrollToTop()
  },
)

watch(
  () => user.value,
  async () => {
    if (user.value) {
      noExistUser.value = false
      if (logined.value) await setTest()
    }
  },
)

onMounted(async () => {
  globalIndex.value = 0
  // validateTest();
  await nextTick()
  await setTest()
  await autoComplete()
  calculateProgress(localTestAnswer)
  if (!user.value?.id) return

  let firstSnapshot = true

  const userRef = doc(db, 'users', user.value.id)

  onSnapshot(userRef, (docSnap) => {
    if (!docSnap.exists()) return
    const data = docSnap.data()

    if (firstSnapshot) {
      firstSnapshot = false
      return
    }

    if (data.lastCalibrationId) {
      calibrationCompleted.value = true
      if (calibrationPopup.value) {
        calibrationPopup.value.close()
      }
    }
  })
})

onBeforeUnmount(() => {
  if (
    videoRecorder.value &&
    typeof videoRecorder.value.stopRecording === 'function'
  ) {
    videoRecorder.value.stopRecording()
  }
})
</script>

<style scoped>
.user-test-bg {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

.user-test-bg::before {
  content: '';
  position: fixed;
  z-index: 0;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140%;
  margin-right: -450px;
  margin-top: 100px;
  background-image: url(../../../assets/logo_small_red.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right top;
  opacity: 0.2;
  pointer-events: none;
}

.user-test-bg > * {
  position: relative;
  z-index: 1;
}

.main-test-interface :deep(.v-card--variant-elevated),
.main-test-interface :deep(.v-card--variant-flat) {
  background: rgba(var(--v-theme-surface), 0) !important;
}

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

.start-screen::before {
  content: '';
  position: absolute;
  z-index: 0;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140%;
  margin-right: -450px;
  margin-top: 100px;
  background-image: url(../../../assets/logo_small_red.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right top;
  opacity: 0.2;
  pointer-events: none;
}

.start-screen > * {
  position: relative;
  z-index: 1;
}

.start-screen.leaving,
.start-screen.leaving > *,
.start-screen.leaving::before {
  opacity: 0;
  transition-duration: 1.2s;
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

/* Stepper sticky styles */
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

.main-stepper.stepper-animate {
  background: #00213f !important;
  opacity: 0.3;
  filter: blur(1px);
}

/* Task stepper background */
.task-stepper {
  background: #00213f !important;
  color: #fff !important;
  --v-stepper-header-title-color: #fff !important;
  --v-stepper-item-title-color: #fff !important;
  --v-stepper-item-color: #fff !important;
}

/* Forzar tamaño grande y negrita en los números del stepper (avatar) y títulos, usando selectores globales */
:deep(.v-stepper-item__avatar) {
  font-size: 1rem !important;
  font-weight: 900 !important;
  width: 1.5rem !important;
  height: 1.5rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* Aumentar el tamaño del icono de check-circle cuando el step está completo */
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

.welcome-main-centered {
  min-height: 100vh;
  align-items: center;
}

.welcome-content-centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
