<template>
  <div>
    <v-container fluid class="pa-0">
      <!-- Start Screen -->
      <v-row
        v-if="test && start"
        class="start-screen background-img pa-0 ma-0"
        align="center"
      >
        <v-col md="8" class="ma-5 pa-5">
          <img
            src="@/assets/logo_full_white.png"
            alt="RUXAILAB"
            class="mb-10"
            style="max-width: 300px"
          />
          <h1 class="text-h2 font-weight-bold text-white">
            {{ test.testTitle }}
          </h1>
          <p class="text-body-1 mb-5 text-white text-justify">
            {{ test.testDescription }}
          </p>
          <v-btn
            color="white"
            variant="outlined"
            rounded
            x-large
            @click="startTest"
            :disabled="isStartTestDisabled"
          >
            Start Test
          </v-btn>

          <!-- Messages when test is disabled -->
          <v-alert
            v-if="testDisabledReason === 'test-already-completed'"
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
              <strong>Test Already Completed</strong><br />
              You have already completed and submitted this test. Thank you for
              your participation!
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'test-expired'"
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
              <strong>Test Expired</strong><br />
              This test is no longer available as it has passed its end date.
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'test-not-active'"
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
              <strong>Test Not Active</strong><br />
              This test is currently not active. Please contact the
              administrator.
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'test-no-tasks-configured'"
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
              <strong>Test Configuration Error</strong><br />
              This test has no tasks configured. Please contact the
              administrator.
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'test-session-too-far'"
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
              <v-icon color="white"> mdi-calendar-clock </v-icon>
            </template>
            <span class="text-white">
              <strong>Session Too Far</strong><br />
              The scheduled session is more than 24 hours away. Please come back
              closer to the session date.
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'test-no-data'"
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
              <strong>No Test Data</strong><br />
              Test information could not be loaded. Please try again later.
            </span>
          </v-alert>
        </v-col>
      </v-row>

      <!--Answer Test Screen-->
      <v-row v-else class="main-test-interface pa-0 ma-0">
        <v-col ref="rightView" class="right-view pa-6">
          <!--Sticky Stepper to follow Progress-->
          <v-row
            v-if="globalIndex >= 1 || displayVideoCallComponent"
            class="stepper-row sticky-stepper"
          >
            <v-col cols="12">
              <v-stepper
                :model-value="stepperValue"
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
                    title="Consent"
                    :complete="stepperValue > 1"
                    :color="
                      stepperValue == 1
                        ? 'warning'
                        : stepperValue < 1
                        ? 'primary'
                        : 'success'
                    "
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    :value="2"
                    title="Pre-test"
                    :complete="stepperValue > 2"
                    :color="
                      stepperValue == 2
                        ? 'warning'
                        : stepperValue < 1
                        ? 'primary'
                        : 'success'
                    "
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    :value="3"
                    title="Tasks"
                    :complete="stepperValue > 3"
                    :color="
                      stepperValue == 3
                        ? 'warning'
                        : stepperValue < 3
                        ? 'primary'
                        : 'success'
                    "
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    :value="4"
                    title="Post-test"
                    :complete="stepperValue > 4"
                    :color="
                      stepperValue == 4
                        ? 'warning'
                        : stepperValue < 4
                        ? 'primary'
                        : 'success'
                    "
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    :value="5"
                    title="Completion"
                    :complete="stepperValue > 5"
                    :color="
                      stepperValue == 5
                        ? 'warning'
                        : stepperValue < 5
                        ? 'primary'
                        : 'success'
                    "
                    complete-icon="mdi-check"
                  />
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>

          <!-- Stepper secundario para tareas -->
          <v-row
            v-if="
              globalIndex === 4 && test?.testStructure?.userTasks?.length > 1
            "
            class="task-stepper-row"
            justify="center"
          >
            <v-col cols="12" md="8" lg="6" class="d-flex justify-center">
              <v-stepper
                :model-value="taskIndex + 1"
                class="task-stepper rounded-xl elevation-2"
                style="max-width: 100%"
              >
                <v-stepper-header>
                  <template
                    v-for="(task, index) in test.testStructure.userTasks"
                    :key="index"
                  >
                    <v-stepper-item
                      :value="index + 1"
                      :title="task.taskName"
                      :complete="
                        localTestAnswer.tasks[index]?.completed || false
                      "
                      :color="
                        taskIndex == index
                          ? 'warning'
                          : taskIndex < index
                          ? 'primary'
                          : 'success'
                      "
                      complete-icon="mdi-check"
                    />
                    <v-divider
                      v-if="index < test.testStructure.userTasks.length - 1"
                    />
                  </template>
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>

          <!-- Video Call Component -->
          <div v-show="displayVideoCallComponent">
            <VideoCall
              :roomId="roomId"
              :caller="isUserTestAdmin"
              :current-global-index="globalIndex"
              :current-task-index="taskIndex"
              :test="test"
              :local-test-answer="localTestAnswer"
              @set-remote-stream="remoteStream = $event"
              @proceed-to-next-step="proceedToNextStep"
              @step-selected="handleStepSelected"
            />
          </div>

          <!-- Hide Form Elements while on Video Call Mode -->
          <div v-show="!displayVideoCallComponent">
            <!--Step 0: Welcome - Different for Moderator vs Participant -->
            <ModeratorWelcomeStep
              v-if="globalIndex === 0 && isUserTestAdmin"
              :stepper-value="stepperValue"
              @start="
                () => {
                  displayVideoCallComponent = true
                  globalIndex = 1
                }
              "
            />
            <WelcomeStep
              v-else-if="globalIndex === 0 && !isUserTestAdmin"
              :stepper-value="stepperValue"
              :welcome-message="test?.testStructure?.welcomeMessage"
              @start="
                () => {
                  displayVideoCallComponent = true
                  globalIndex = 1
                }
              "
            />

            <!--Step 1: Consent -->
            <ConsentStep
              v-if="globalIndex === 1 && taskIndex === 0"
              :test-title="test.testTitle"
              :pre-test-title="$t('UserTestView.titles.preTest')"
              :consent-text="test.testStructure.consent"
              :full-name-model="fullName"
              :consent-completed-model="localTestAnswer.consentCompleted"
              @update:fullNameModel="(val) => (fullName = val)"
              @update:consentCompletedModel="
                (val) => (localTestAnswer.consentCompleted = val)
              "
              @continue="completeStep(taskIndex, 'consent')"
              @declineConsent="handleConsentDecline"
            />

            <!--Step 2: Pre-test -->
            <PreTestStep
              v-if="globalIndex === 2 && taskIndex === 0"
              :test-title="test.testTitle"
              :pre-test-title="$t('UserTestView.titles.preTest')"
              :pre-test="test.testStructure.preTest"
              :pre-test-answer="localTestAnswer.preTestAnswer"
              :pre-test-completed="localTestAnswer.preTestCompleted"
              @done="completeStep(taskIndex, 'preTest')"
            />

            <!-- Step 3: Tasks -->
            <PreTasksStep
              v-if="globalIndex === 3 && taskIndex === 0"
              :num-tasks="test?.testStructure?.userTasks?.length || 0"
              @startTasks="
                () => {
                  taskIndex = 0
                  globalIndex = 4
                }
              "
            />

            <!-- Step 4: Task Step -->
            <TaskStep
              v-if="globalIndex === 4 && test.testType === STUDY_TYPES.USER"
              ref="taskStepComponent"
              :task="test.testStructure.userTasks[taskIndex]"
              :task-index="taskIndex"
              :test-id="testId"
              v-model:post-answer="localTestAnswer.tasks[taskIndex].postAnswer"
              v-model:task-answer="localTestAnswer.tasks[taskIndex].taskAnswer"
              v-model:task-observations="
                localTestAnswer.tasks[taskIndex].taskObservations
              "
              :sus-answers="localTestAnswer.tasks[taskIndex].susAnswers"
              :nasa-tlx-answers="
                localTestAnswer.tasks[taskIndex].nasaTlxAnswers
              "
              :submitted="localTestAnswer.submitted"
              :done-task-disabled="doneTaskDisabled"
              :remoteStream="remoteStream"
              :shouldRecordModerator="!isUserTestAdmin"
              @update:susAnswers="
                (val) => {
                  localTestAnswer.tasks[taskIndex].susAnswers = Array.isArray(
                    val,
                  )
                    ? [...val]
                    : []
                }
              "
              @update:nasaTlxAnswers="
                (val) => {
                  localTestAnswer.tasks[taskIndex].nasaTlxAnswers = { ...val }
                }
              "
              @done="() => handleTaskFinish(true)"
              @couldNotFinish="() => handleTaskFinish(false)"
              @show-loading="isLoading = true"
              @stop-show-loading="isLoading = false"
              @recording-started="isVisualizerVisible = $event"
              @timer-stopped="handleTimerStopped"
            />

            <PostTestStep
              v-if="globalIndex === 5"
              :test-title="test.testTitle"
              :post-test-title="$t('UserTestView.titles.postTest')"
              :post-test="test.testStructure.postTest"
              :post-test-answer="localTestAnswer.postTestAnswer"
              :post-test-completed="localTestAnswer.postTestCompleted"
              @done="
                () => {
                  completeStep(taskIndex, 'postTest')
                  taskIndex = 3
                }
              "
            />
            <FinishStep
              v-if="
                globalIndex === 6 &&
                localTestAnswer.postTestCompleted &&
                !localTestAnswer.submitted
              "
              :final-message="$t('finishTest.finalMessage')"
              :congratulations="$t('finishTest.congratulations')"
              :submit-message="$t('finishTest.submitMessage')"
              :submit-btn="$t('buttons.submit')"
              @submit="submitDialog = true"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Submit Dialog -->
    <SubmitDialog
      :model-value="submitDialog"
      :title="$t('HeuristicsTestView.messages.submitTest')"
      :message="$t('HeuristicsTestView.messages.submitOnce')"
      :cancel-label="$t('buttons.cancel')"
      :submit-label="$t('buttons.submit')"
      @cancel="submitDialog = false"
      @submit="handleSubmit"
    />

    <!-- Dialog for user to continue or change account -->
    <v-dialog :model-value="!loggedIn" width="500" persistent>
      <v-card v-if="user" class="rounded-xl pa-6">
        <v-row class="ma-0 pa-0" justify="center">
          <v-avatar color="primary-lighten-4" size="120">
            <v-icon size="80"> mdi-account-circle </v-icon>
          </v-avatar>
        </v-row>
        <v-card-title class="text-center text-h6 font-weight-bold mt-4">
          Welcome back!
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
            @click="setTestAnswer()"
          >
            Continue as {{ user.email }}
          </v-btn>
          <p class="text-caption mt-2">
            Not you?
            <a
              href="#"
              class="text-primary font-weight-medium"
              @click.prevent="signOut"
              >Change account</a
            >
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import {
  ref as dbRef,
  onValue,
  off,
  update,
  set,
  onDisconnect,
} from 'firebase/database'
import { database } from '@/app/plugins/firebase/index'
import { ref, computed, watch, onMounted, reactive, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { onBeforeUnmount } from 'vue'
import ConsentStep from '@/ux/UserTest/components/steps/ConsentStep.vue'
import WelcomeStep from '@/ux/UserTest/components/steps/WelcomeStep.vue'
import ModeratorWelcomeStep from '@/ux/UserTest/components/steps/ModeratorWelcomeStep.vue'
import PreTestStep from '@/ux/UserTest/components/steps/PreTestStep.vue'
import PreTasksStep from '@/ux/UserTest/components/steps/PreTasksStep.vue'
import TaskStep from '@/ux/UserTest/components/steps/TaskStep.vue'
import PostTestStep from '@/ux/UserTest/components/steps/PostTestStep.vue'
import FinishStep from '@/ux/UserTest/components/steps/FinishStep.vue'
import SubmitDialog from '@/ux/UserTest/components/SubmitDialog.vue'
import VideoCall from '@/ux/UserTest/components/VideoCall.vue'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer'
import TaskAnswer from '@/ux/UserTest/models/TaskAnswer'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'
import { showError, showInfo, showWarning } from '@/shared/utils/toast'

const store = useStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
// Data variables
const testDisabledReason = ref(null)
const loggedIn = ref(null)
const sessionCooperator = ref(null)
const testDate = ref(null)
const start = ref(true)
const globalIndex = ref(null)
const taskIndex = ref(0)
const localTestAnswer = reactive(new UserStudyEvaluatorAnswer())
const rightView = ref(null) // For scroll effect
const fullName = ref('') // For consent form component
const items = ref([])
const doneTaskDisabled = ref(false) // ?
const displayVideoCallComponent = ref(false)
const preTestIndex = ref(null)
const taskStepComponent = ref(null)
const allTasksCompleted = ref(false)
const submitDialog = ref(false)

// From video call to be used by recorders
const remoteStream = ref(null)

// Computed properties
const mediaUrls = computed(() => store.getters.mediaUrls)
const test = computed(() => store.getters.test)
const testId = computed(() => store.getters.test?.id || null)
const user = computed(() => {
  return store.getters.user
})
const isUserTestAdmin = computed(() => {
  return test.value.testAdmin.userDocId === user.value?.id
})

const timerComponent = computed(() => {
  // Get timer ref from TaskStep
  return taskStepComponent.value?.$refs?.timerComponent || null
})

const currentUserTestAnswer = computed(
  () => store.getters.currentUserTestAnswer,
)

const roomId = computed(() => {
  return test.value.id // Assuming we will use the test ID as the room ID
})

const stepperValue = computed(() => {
  if (globalIndex.value === 0) return 0 // Welcome step
  if (globalIndex.value === 1 && taskIndex.value === 0) return 1 // Consent
  if (globalIndex.value === 2 && taskIndex.value === 0) return 2 // Pre-test
  if (globalIndex.value === 3 && taskIndex.value === 0) return 3 // Pre-tasks (informational)
  if (globalIndex.value === 4 && taskIndex.value >= 0) return 3 // Tasks (still step 3)
  if (globalIndex.value === 5) return 4 // Post-test
  if (globalIndex.value === 6) return 5 // Completion
  return 1 // Default to first step
})

// Watchers
watch(user, async () => {
  if (user.value) {
    if (loggedIn.value) await setTestAnswer()
  }
})

watch(
  () => [globalIndex.value, taskIndex.value],
  () => {
    scrollToTop()
  },
)

watchEffect(() => {
  const index = taskIndex.value

  const taskList = test.value?.testStructure?.userTasks
  const task = Array.isArray(taskList) ? taskList[index] : undefined

  const answers = localTestAnswer?.tasks?.[index]?.susAnswers

  if (task?.taskType === 'sus') {
    const validCount = answers?.filter((v) => typeof v === 'number').length ?? 0
    doneTaskDisabled.value = validCount < 10
    console.log('SUS respostas válidas:', validCount)
  } else {
    doneTaskDisabled.value = false
  }
})

watch(
  () => test.value,
  async () => {
    await mappingSteps()
  },
  { deep: true },
)

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

// Methods
const proceedToNextStep = async () => {
  if (!isUserTestAdmin.value) return
  const roomRef = dbRef(database, `rooms/${roomId.value}`)
  await update(roomRef, {
    globalIndex: globalIndex.value,
    taskIndex: taskIndex.value,
    showVideoCall: false,
  })
}

const handleStepSelected = async ({
  globalIndex: newGlobalIndex,
  taskIndex: newTaskIndex,
}) => {
  if (!isUserTestAdmin.value) return

  globalIndex.value = newGlobalIndex
  taskIndex.value = newTaskIndex

  // Moderator stays in video call, but participant sees the selected step
  // Don't change displayVideoCallComponent for moderator

  const roomRef = dbRef(database, `rooms/${roomId.value}`)
  await update(roomRef, {
    globalIndex: newGlobalIndex,
    taskIndex: newTaskIndex,
    showVideoCall: false, // Set to false so participant sees the step content immediately
  })
}

const handleConsentDecline = async () => {
  // User declined consent, end the moderated test
  store.commit('SET_TOAST', {
    type: 'info',
    message: 'Test ended due to consent decline. Thank you for your time.',
    timeout: 5000,
  })

  // Clean up room data
  const roomRef = dbRef(database, `rooms/${roomId.value}`)
  await set(roomRef, null)

  // Navigate back to admin
  setTimeout(() => {
    router.push('/admin')
  }, 2000)
}

const handleSubmit = async () => {
  submitDialog.value = false
  try {
    localTestAnswer.submitted = true
    await saveAnswer()
    await router.push({ name: 'Admin' })
  } catch (error) {
    console.error('Error submitting answer:', error.message)
    store.commit('SET_TOAST', {
      type: 'error',
      message: 'Failed to submit the answer. Please try again.',
    })
  }
}

const saveAnswer = async () => {
  try {
    attachMediaToTasks(localTestAnswer, mediaUrls.value)

    localTestAnswer.fullName = fullName.value
    if (user.value && user.value?.email) {
      localTestAnswer.userDocId = user.value.id
      localTestAnswer.invited = true
    }

    Object.assign(currentUserTestAnswer.value, localTestAnswer)

    await store.dispatch('saveTestAnswer', {
      data: currentUserTestAnswer.value,
      answersDocId: test.value.answersDocId,
      testType: test.value.testType,
    })
  } catch (error) {
    console.error('Error saving answer:', error.message)
    store.commit('SET_TOAST', {
      type: 'error',
      message: 'Failed to save the answer. Please try again.',
    })
  }
}

const attachMediaToTasks = (answer, mediaUrls) => {
  if (!answer?.tasks?.length) return

  for (const [taskIndex, medias] of Object.entries(mediaUrls)) {
    const task = answer.tasks[taskIndex]
    if (!task) continue

    for (const type in medias) {
      const field = MEDIA_FIELD_MAP?.[type] || type
      const url = medias[type]
      if (url != null) task[field] = url
    }
  }
}

const setTestAnswer = async () => {
  loggedIn.value = true
  await store.dispatch('getCurrentTestAnswerDoc')
}

const signOut = async () => {
  await store.dispatch('signOut')
  router.push('/signin')
}

const startTest = async () => {
  // Check if the test has no tasks
  if (!test.value.testStructure || test.value.testStructure.length === 0) {
    store.commit('SET_TOAST', {
      type: 'info',
      message: "This test doesn't have any tasks.",
    })
    router.push(`/missions/${test.value.id}`)
    return
  }

  if (!isUserTestAdmin.value) {
    await store.dispatch('acceptStudyCollaboration', {
      test: test.value,
      cooperator: user.value,
    })
  }

  // First, add the class for the exit animation
  const startScreen = document.querySelector('.start-screen')
  if (startScreen) {
    startScreen.classList.add('leaving')
  }

  // listen for changes
  const roomRef = dbRef(database, `rooms/${roomId.value}`)

  onDisconnect(roomRef).set(null)

  onValue(roomRef, (snapshot) => {
    const data = snapshot.val()
    if (!data) return

    globalIndex.value = data.globalIndex
    taskIndex.value = data.taskIndex

    if (!isUserTestAdmin.value) {
      displayVideoCallComponent.value = data.showVideoCall
    }
  })

  // Wait for the animation to finish before changing the state
  setTimeout(() => {
    start.value = false
  }, 1000)
}

// Scroll to top of the page when step changes
const scrollToTop = () => {
  // For most browsers
  window.scrollTo({ top: 0, behavior: 'smooth' })
  // For rightView (in case of overflow)
  if (rightView.value) {
    rightView.value.scrollTop = 0
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

function handleTaskFinish(userCompleted) {
  const currentTask = localTestAnswer.tasks[taskIndex.value]
  if (currentTask) {
    console.log('Estado actual de la tarea antes de finalizar:', currentTask)
  }
  completeStep(taskIndex.value, 'tasks', userCompleted)
  callTimerSave()
}

const startTimer = () => {
  if (
    timerComponent.value &&
    typeof timerComponent.value.startTimer === 'function'
  ) {
    timerComponent.value.startTimer()
  }
}

const handleTimerStopped = (elapsedTime, idx) => {
  // idx is passed from TaskStep, always use it
  console.log('handleTimerStopped llamado con:', { elapsedTime, idx })

  if (!localTestAnswer.tasks) {
    console.error('localTestAnswer.tasks no está definido')
    return
  }

  if (idx === undefined || idx === null) {
    console.error('Índice de tarea no válido:', idx)
    return
  }

  if (localTestAnswer.tasks[idx]) {
    console.log(
      'Guardando tiempo para tarea',
      idx,
      ':',
      elapsedTime,
      'segundos',
    )
    // Asegurar que el tiempo es un número
    const timeToSave =
      typeof elapsedTime === 'number' ? elapsedTime : parseInt(elapsedTime)
    if (!isNaN(timeToSave)) {
      localTestAnswer.tasks[idx].taskTime = timeToSave
      console.log('Tiempo guardado correctamente:', localTestAnswer.tasks[idx])
    } else {
      console.error('TieisStartTestDisabledmpo no válido:', elapsedTime)
    }
  } else {
    console.error('No se pudo guardar el tiempo para la tarea', idx)
  }
}

const completeStep = async (id, type, userCompleted = true) => {
  displayVideoCallComponent.value = true
  try {
    if (type === 'consent') {
      localTestAnswer.consentCompleted = true
      items.value[0].value[id].icon = 'mdi-check-circle-outline'
      if (
        localTestAnswer.preTestCompleted &&
        localTestAnswer.consentCompleted
      ) {
        items.value[0].icon = 'mdi-check-circle-outline'
      }
      globalIndex.value = 2
    }
    if (type === 'preTest') {
      localTestAnswer.preTestCompleted = true
      items.value[0].value[id].icon = 'mdi-check-circle-outline'
      if (
        localTestAnswer.preTestCompleted &&
        localTestAnswer.consentCompleted
      ) {
        items.value[0].icon = 'mdi-check-circle-outline'
      }
      globalIndex.value = 3
    }
    if (type === 'tasks') {
      if (!Array.isArray(localTestAnswer.tasks)) {
        console.error(
          'localTestAnswer.tasks is not an array:',
          localTestAnswer.tasks,
        )
        return
      }
      localTestAnswer.tasks[id].completed = userCompleted
      items.value[1].value[id].icon = 'mdi-check-circle-outline'
      allTasksCompleted.value = true

      for (let i = 0; i < items.value[1].value.length; i++) {
        if (!localTestAnswer.tasks[i]?.completed) {
          allTasksCompleted.value = false
          break
        }
      }
      if (allTasksCompleted.value) {
        items.value[1].icon = 'mdi-check-circle-outline'
      }
      if (id < localTestAnswer.tasks.length - 1) {
        taskIndex.value = id + 1
        startTimer()
      } else {
        console.log('All tasks completed, moving to post-test')
        globalIndex.value = 5
      }
      if (userCompleted) {
        store.commit('SET_TOAST', {
          type: 'success',
          message: `Task "${test.value.testStructure.userTasks[id].taskName}" completed successfully!`,
          timeout: 3000,
        })
      }
    }
    if (type === 'postTest') {
      localTestAnswer.postTestCompleted = true
      globalIndex.value = 6
      if (items.value[2]?.value && items.value[2].value[id]) {
        items.value[2].value[id].icon = 'mdi-check-circle-outline'
      }
    }

    const roomRef = dbRef(database, `rooms/${roomId.value}`)
    await update(roomRef, {
      globalIndex: globalIndex.value,
      taskIndex: taskIndex.value,
      showVideoCall: true,
    })

    calculateProgress()
    await saveAnswer()
  } catch (error) {
    console.error('Error in completeStep:', error)
    store.commit('SET_TOAST', {
      type: 'error',
      message: 'Failed to complete step. Please try again.',
    })
  }
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
              susAnswers: [],
              nasaTlxAnswers: null,
            })
            console.log('Nueva tarea creada:', i, newTask)
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
  } catch (error) {
    console.error('Error mapping steps:', error.message)
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

const calculateProgress = () => {
  try {
    if (!localTestAnswer) return 0
    const totalSteps = 4
    let completedSteps = 0

    if (localTestAnswer.preTestCompleted) completedSteps++
    if (localTestAnswer.consentCompleted) completedSteps++

    let tasksCompleted = 0
    if (items.value[1]?.value && Array.isArray(localTestAnswer.tasks)) {
      for (let i = 0; i < items.value[1].value.length; i++) {
        if (localTestAnswer.tasks[i]?.completed) {
          tasksCompleted++
        }
      }
      if (tasksCompleted === items.value[1].value.length) {
        completedSteps++
      }
    }

    if (localTestAnswer.postTestCompleted) completedSteps++

    const progressPercentage = (completedSteps / totalSteps) * 100
    localTestAnswer.progress = progressPercentage
    return progressPercentage
  } catch (error) {
    console.error('Error in calculateProgress:', error)
    return 0
  }
}
const isStartTestDisabled = computed(() => {
  if (!test.value) {
    testDisabledReason.value = 'test-no-data'
    return true
  }

  const now = new Date()
  const cooperator = test.value.cooperators.find(
    (u) => u.userDocId === route.params.token,
  )
  const sessionDate = cooperator.testDate ? new Date(cooperator.testDate) : null

  // 🧩 Test already completed
  if (localTestAnswer.submitted) {
    testDisabledReason.value = 'test-already-completed'
    return true
  }

  // 🧩 Test is not active
  if (test.value.status !== 'active') {
    testDisabledReason.value = 'test-not-active'
    return true
  }

  // 🧩 Test structure missing
  if (
    !test.value.testStructure ||
    Object.keys(test.value.testStructure).length === 0
  ) {
    testDisabledReason.value = 'test-no-tasks-configured'
    return true
  }

  // 🧩 Check session date
  if (sessionDate) {
    const diffHours = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours < 0) {
      testDisabledReason.value = 'test-expired'
      return true
    }

    if (diffHours > 24) {
      testDisabledReason.value = 'test-session-too-far'
      return true
    }
  }

  // 🧩 Test expired (fallback endDate)
  if (test.value.endDate) {
    const endDate = new Date(test.value.endDate)
    if (now > endDate) {
      testDisabledReason.value = 'test-expired'
      return true
    }
  }

  // ✅ All good
  testDisabledReason.value = null
  return false
})

// Lifecycle hooks
onMounted(async () => {
  if (!user.value) {
    showError('Login to your RUXAILAB account first to access the test!')
    router.push('/signin')
    return
  }

  if (route.params.token) {
    if (route.params.token === test.value.id) {
      showInfo('Use a session link to access your moderated test!')
      router.push('/managerview/' + test.value.id)
      return
    }

    if (user.value.id !== route.params.token && !isUserTestAdmin.value) {
      showError('errors.globalError')
      router.push('/admin')
      return
    }

    if (!isUserTestAdmin.value) {
      sessionCooperator.value = test.value.cooperators.find(
        (user) => user.userDocId === route.params.token,
      )
      if (sessionCooperator.value?.testDate) {
        testDate.value = sessionCooperator.value.testDate
      } else {
        showWarning("Your session doesn't have a scheduled date")
        router.push('/managerview/' + test.value.id)
        return
      }
    }
  } else {
    showInfo('Use a session link to access the test')
    router.push('/managerview/' + test.value.id)
    return
  }

  globalIndex.value = 0

  // Initialize localTestAnswer with existing data from currentUserTestAnswer
  if (
    currentUserTestAnswer.value &&
    Object.keys(currentUserTestAnswer.value).length > 0
  ) {
    Object.assign(localTestAnswer, currentUserTestAnswer.value)
    console.log(
      'LocalTestAnswer initialized with existing data:',
      localTestAnswer,
    )
  }

  await mappingSteps()
})

onBeforeUnmount(async () => {
  const roomRef = dbRef(database, `rooms/${roomId.value}`)
  off(roomRef)
  await set(roomRef, null)
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

.start-screen::before {
  content: '';
  position: absolute;
  z-index: -1;
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
}

.start-screen.leaving::before {
  opacity: 0;
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
  transition: background 1s cubic-bezier(0.4, 0, 0.2, 1),
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
</style>
