<template>
  <div v-if="test">
    <div>
      <IrisTracker :is-running="isTracking" :ms-per-capture="300" :record-screen="isRecording"
        @faceData="handleIrisData" :test-id="testId" :task-index="taskIndex" />
    </div>

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
      <v-card
        v-if="user"
        class="rounded-xl pa-6"
      >
        <v-row
          class="ma-0 pa-0"
          justify="center"
        >
          <v-avatar
            color="primary-lighten-4"
            size="120"
          >
            <v-icon size="80">
              mdi-account-circle
            </v-icon>
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
            @click="setTest"
          >
            Continue as {{ user.email }}
          </v-btn>
          <p class="text-caption mt-2">
            Not you?
            <a
              href="#"
              class="text-primary font-weight-medium"
              @click.prevent="signOut"
            >Change account</a>
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-container
      fluid
      class="pa-0"
    >
      <v-row
        v-if="test && start && !testAlreadyStarted"
        class="start-screen background-img pa-0 ma-0"
        align="center"
      >
        <v-col
          md="8"
          class="ma-5 pa-5"
        >
          <img
            src="@/assets/ruxailab-long-crop-white.png"
            alt="RUXAILAB"
            class="mb-10"
            style="max-width: 300px;"
          >
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
            @click="startTest"
            class="mt-4"
            :disabled="isStartTestDisabled"
          >
            Start Test
          </v-btn>
          
          <!-- Messages when test is disabled -->
          <v-alert
            v-if="testDisabledReason === 'already-completed'"
            type="info"
            variant="outlined"
            class="mt-4"
            color="white"
            style="background-color: rgba(255, 255, 255, 0.1); border-color: white;"
          >
            <template #prepend>
              <v-icon color="white">mdi-check-circle</v-icon>
            </template>
            <span class="text-white">
              <strong>Test Already Completed</strong><br>
              You have already completed and submitted this test. Thank you for your participation!
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'Test has expired'"
            type="warning"
            variant="outlined"
            class="mt-4"
            color="white"
            style="background-color: rgba(255, 255, 255, 0.1); border-color: white;"
          >
            <template #prepend>
              <v-icon color="white">mdi-clock-alert</v-icon>
            </template>
            <span class="text-white">
              <strong>Test Expired</strong><br>
              This test is no longer available as it has passed its end date.
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'Test is not active'"
            type="warning"
            variant="outlined"
            class="mt-4"
            color="white"
            style="background-color: rgba(255, 255, 255, 0.1); border-color: white;"
          >
            <template #prepend>
              <v-icon color="white">mdi-pause-circle</v-icon>
            </template>
            <span class="text-white">
              <strong>Test Not Active</strong><br>
              This test is currently not active. Please contact the administrator.
            </span>
          </v-alert>

          <v-alert
            v-else-if="testDisabledReason === 'Test has no tasks configured'"
            type="error"
            variant="outlined"
            class="mt-4"
            color="white"
            style="background-color: rgba(255, 255, 255, 0.1); border-color: white;"
          >
            <template #prepend>
              <v-icon color="white">mdi-alert-circle</v-icon>
            </template>
            <span class="text-white">
              <strong>Test Configuration Error</strong><br>
              This test has no tasks configured. Please contact the administrator.
            </span>
          </v-alert>
        </v-col>
      </v-row>

      <v-row
        v-else
        class="main-test-interface pa-0 ma-0"
      >
        <v-col
          ref="rightView"
          class="right-view pa-6"
        > 
          <!-- Navigation Buttons -->
          <v-row v-if="globalIndex > 0 && !isLoading" class="navigation-row mb-4">
            <v-col cols="12" class="d-flex justify-space-between align-center">
              <v-btn
                v-if="showPreviousButton"
                color="primary"
                variant="outlined"
                @click="goToPreviousStep"
                :disabled="isLoading || isSaving"
                class="navigation-btn"
              >
                <v-icon left>mdi-arrow-left</v-icon>
                Previous
              </v-btn>
              <div v-else style="min-width: 120px;"></div>
              
              <v-btn
                v-if="showSaveButton"
                color="primary"
                variant="outlined"
                @click="saveProgress"
                :loading="isSaving"
                :disabled="isLoading"
                class="navigation-btn"
              >
                <v-icon left>mdi-content-save</v-icon>
                Save Progress
              </v-btn>
            </v-col>
          </v-row>
          <v-row
            v-if="globalIndex >= 1"
            class="stepper-row sticky-stepper"
          >
            <v-col cols="12">
              <v-stepper
                :model-value="stepperValue"
                class="main-stepper rounded-xl elevation-3"
                :class="{ 'stepper-animate': globalIndex === 4 && test?.testStructure?.userTasks?.length > 1 }"
                style="visibility:visible"
              >
                <v-stepper-header>
                  <v-stepper-item value="1" title="Consent" :complete="stepperValue >= 1" color="white"
                    complete-icon="mdi-check" />
                  <v-divider />
                  <v-stepper-item value="2" title="Pre-test" :complete="stepperValue >= 2" color="white"
                    complete-icon="mdi-check" />
                  <v-divider />

                  <v-stepper-item v-if="hasEyeTracking" value="3" title="Eye Tracking" :complete="stepperValue >= 3"
                    color="white" complete-icon="mdi-check" />
                  <v-divider v-if="hasEyeTracking" />

                  <v-stepper-item :value="hasEyeTracking ? 4 : 3" title="Tasks"
                    :complete="stepperValue >= (hasEyeTracking ? 4 : 3)" color="white" complete-icon="mdi-check" />
                  <v-divider />
                  <v-stepper-item :value="hasEyeTracking ? 5 : 4" title="Post-test"
                    :complete="stepperValue >= (hasEyeTracking ? 5 : 4)" color="white" complete-icon="mdi-check" />
                  <v-divider />
                  <v-stepper-item :value="hasEyeTracking ? 6 : 5" title="Completion"
                    :complete="stepperValue === (hasEyeTracking ? 6 : 5)" color="white" complete-icon="mdi-check" />
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>
          <!-- Secondary stepper for tasks -->
          <v-row
            v-if="globalIndex === (hasEyeTracking ? 5 : 4) && test?.testStructure?.userTasks?.length > 1"
            class="task-stepper-row"
            justify="center"
          >
            <v-col
              cols="12"
              md="8"
              lg="6"
              class="d-flex justify-center"
            >
              <v-stepper
                :model-value="taskIndex + 1"
                class="task-stepper rounded-xl elevation-1 w-100"
                style="max-width: 100%;"
              >
                <v-stepper-header>
                  <template
                    v-for="(task, idx) in test.testStructure.userTasks"
                    :key="idx"
                  >
                    <v-stepper-item
                      :value="idx + 1"
                      :title="`Task ${idx + 1}`"
                      :complete="taskIndex > idx"
                      :color="taskIndex > idx ? 'success' : (taskIndex === idx ? 'primary' : 'grey')"
                      complete-icon="mdi-check"
                    />
                    <v-divider v-if="idx < test.testStructure.userTasks.length - 1" />
                  </template>
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>

          <WelcomeStep v-if="globalIndex === 0" :stepper-value="stepperValue" :welcome-message="test?.testStructure?.welcomeMessage" @start="handleWelcomeStart" />

          <ConsentStep v-if="globalIndex === 1 && taskIndex === 0" :test-title="test.testTitle"
            :consent-text="test.testStructure.consent" :full-name-model="fullName"
            :consent-completed-model="localTestAnswer.consentCompleted" @update:fullNameModel="val => fullName = val"
            @update:consentCompletedModel="val => localTestAnswer.consentCompleted = val"
            @continue="completeStep(taskIndex, 'consent')" 
            @declineConsent="handleConsentDecline" />

          <PreTestStep v-if="globalIndex === 2 && taskIndex === 0" :test-title="test.testTitle"
            :pre-test="test.testStructure.preTest" :pre-test-answer="localTestAnswer.preTestAnswer"
            :pre-test-completed="localTestAnswer.preTestCompleted" @done="completeStep(taskIndex, 'preTest')" />

          <EyeTrackingCalibrationStep v-if="globalIndex === 3 && hasEyeTracking" @done="globalIndex = 4"
            @closeCalibration="closeCalibration()" @openCalibration="openCalibration()"
            :calibrationInProgress="calibrationInProgress" :calibrationCompleted="calibrationCompleted" />

          <PreTasksStep v-if="globalIndex === (hasEyeTracking ? 4 : 3) && taskIndex === 0"
            :num-tasks="test?.testStructure?.userTasks?.length || 0"
            @startTasks="() => { taskIndex = 0; globalIndex = hasEyeTracking ? 5 : 4; saveIrisDataIntoTask(); }" />

          <TaskStep v-if="globalIndex === (hasEyeTracking ? 5 : 4) && test.testType === STUDY_TYPES.USER" ref="taskStepComponent"
            :task="test.testStructure.userTasks[taskIndex]" :task-index="taskIndex" :test-id="testId"
            v-model:post-answer="localTestAnswer.tasks[taskIndex].postAnswer"
            v-model:task-answer="localTestAnswer.tasks[taskIndex].taskAnswer"
            v-model:task-observations="localTestAnswer.tasks[taskIndex].taskObservations"
            :sus-answers="localTestAnswer.tasks[taskIndex].susAnswers"
            :nasa-tlx-answers="localTestAnswer.tasks[taskIndex].nasaTlxAnswers"
            :submitted="localTestAnswer.submitted"
            :done-task-disabled="doneTaskDisabled"
            @update:susAnswers="val => { localTestAnswer.tasks[taskIndex].susAnswers = Array.isArray(val) ? [...val] : [] }"
            @update:nasaTlxAnswers="val => { localTestAnswer.tasks[taskIndex].nasaTlxAnswers = { ...val } }"
            @done="() => handleTaskFinish(true)" @couldNotFinish="() => handleTaskFinish(false)"
            @show-loading="isLoading = true" @stop-show-loading="isLoading = false"
            @recording-started="isVisualizerVisible = $event" @timer-stopped="handleTimerStopped" />

          <PostTestStep
            v-if="globalIndex === (hasEyeTracking ? 6 : 5)"
            :test-title="test.testTitle" 
            :post-test="test.testStructure.postTest"
            :post-test-answer="localTestAnswer.postTestAnswer" 
            :post-test-completed="localTestAnswer.postTestCompleted"
            @done="() => { completeStep(taskIndex, 'postTest'); }" />
          <FinishStep
            v-if="globalIndex === (hasEyeTracking ? 7 : 6) && localTestAnswer.postTestCompleted"
            :final-message="$t('finishTest.finalMessage')" :congratulations="test.testStructure.finalMessage"
            :submit-message="$t('finishTest.submitMessage')" :submit-btn="$t('buttons.submit')"
            @submit="dialog = true" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import SubmitDialog from '@/ux/UserTest/components/SubmitDialog.vue';
import { doc, onSnapshot } from "firebase/firestore";
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, reactive, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router'
import Snackbar from '@/shared/components/Snackbar';
import { nanoid } from 'nanoid';
import WelcomeStep from '@/ux/UserTest/components/steps/WelcomeStep.vue';
import ConsentStep from '@/ux/UserTest/components/steps/ConsentStep.vue';
import PreTestStep from '@/ux/UserTest/components/steps/PreTestStep.vue';
import PreTasksStep from '@/ux/UserTest/components/steps/PreTasksStep.vue';
import TaskStep from '@/ux/UserTest/components/steps/TaskStep.vue';
import PostTestStep from '@/ux/UserTest/components/steps/PostTestStep.vue';
import FinishStep from '@/ux/UserTest/components/steps/FinishStep.vue';
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions';
import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer';
import TaskAnswer from '@/ux/UserTest/models/TaskAnswer';
import EyeTrackingCalibrationStep from '@/components/UserTest/steps/EyeTrackingCalibrationStep.vue';
import { db } from '@/app/plugins/firebase';
import IrisTracker from '../components/IrisTracker.vue';
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType';

const fullName = ref('');
const logined = ref(null);
const fromlink = ref(null);
const start = ref(true);
const globalIndex = ref(0);
const noExistUser = ref(true);
const taskIndex = ref(0);
const preTestIndex = ref(null);
const items = ref([]);
const fab = ref(false);
const dialog = ref(false);
const allTasksCompleted = ref(false);
const isLoading = ref(false);
const isVisualizerVisible = ref(false);
const doneTaskDisabled = ref(false);
const isSaving = ref(false);
const rightView = ref(null);
const videoRecorder = ref(null);
const taskStepComponent = ref(null);
const timerComponent = computed(() => {
  return taskStepComponent.value?.$refs?.timerComponent || null;
});

// Eye tracking web gazer testing
const isTracking = ref(false)
const isRecording = ref(false)
const irisData = ref([])
const eyeCalibrationStepDone = ref(false)
const calibrationCompleted = ref(false)
const calibrationInProgress = ref(false)

const localTestAnswer = reactive({
  ...new UserStudyEvaluatorAnswer(),
  tasks: [],
  // Add field to track calibration completion
  eyeCalibrationCompleted: false,
})

const store = useStore();
const router = useRouter();

const mediaUrls = computed(() => store.getters.mediaUrls);
const test = computed(() => store.getters.test);
const testId = computed(() => store.getters.test?.id || null);
const user = computed(() => {
  if (store.getters.user) setExistUser();
  return store.getters.user;
});

// Handle cases where tasks is not an array
const testAlreadyStarted = computed(() => {
  // Check if user has any progress saved
  const hasProgress = localTestAnswer.progress > 0 || 
          localTestAnswer.consentCompleted || 
          localTestAnswer.preTestCompleted ||
          localTestAnswer.postTestCompleted ||
          localTestAnswer.submitted;

  const hasTaskAttempts = Array.isArray(localTestAnswer.tasks) &&
                          localTestAnswer.tasks.some(task => {
                            return task && (
                              task.attempted ||
                              task.taskAnswer ||
                              task.taskObservations ||
                              (task.susAnswers && task.susAnswers.length > 0) ||
                              (task.nasaTlxAnswers && Object.keys(task.nasaTlxAnswers).length > 0)
                            )
                          });
  return hasProgress || hasTaskAttempts;
});

const currentUserTestAnswer = computed(() => store.getters.currentUserTestAnswer || {});
const showSaveButton = computed(() => {
  return !localTestAnswer.submitted && globalIndex.value > 0;
});

const showPreviousButton = computed(() => {
  if (globalIndex.value === 0) return false;
  if (globalIndex.value === 1 && taskIndex.value === 0) return false;
  if (localTestAnswer.submitted) return false;
  return true;
});

const hasEyeTracking = computed(() =>
  test.value?.testStructure?.userTasks?.some(task => task.hasEye)
);

const isUserTestAdmin = computed(() => {
  return test.value.testAdmin.userDocId === user.value?.id
});

const isStartTestDisabled = computed(() => {
  if (!test.value) return true;

  const hasValidTasks = test.value.testStructure &&
                       Array.isArray(test.value.testStructure.userTasks) &&
                       test.value.testStructure.userTasks.length > 0;

  if (!hasValidTasks) return true;

  if (test.value.status !== 'active') return true;

  if (test.value.endDate) {
    const currentDate = new Date();
    const endDate = new Date(test.value.endDate);
    if (endDate < currentDate) return true;
  }

  if (localTestAnswer.submitted) return true;

  return false;
});

const testDisabledReason = computed(() => {
  if (!test.value) return 'Test not found';
  
  const hasValidTasks = test.value.testStructure &&
                       Array.isArray(test.value.testStructure.userTasks) &&
                       test.value.testStructure.userTasks.length > 0;
  
  if (!hasValidTasks) return 'Test has no tasks configured';
  
  if (test.value.status !== 'active') return 'Test is not active';
  
  if (test.value.endDate) {
    const currentDate = new Date();
    const endDate = new Date(test.value.endDate);
    if (endDate < currentDate) return 'Test has expired';
  }
  
  if (localTestAnswer.submitted) return 'already-completed';
  
  return null;
});

const stepperValue = computed(() => {
  if (globalIndex.value === 0) return -1;

  // Consent
  if (globalIndex.value === 1 && taskIndex.value === 0) return 0;

  // PreTest
  if (globalIndex.value === 2 && taskIndex.value === 0) return 1;

  if (hasEyeTracking.value) {
    // EyeTracking flow
    if (globalIndex.value === 3) return 2;
    if (globalIndex.value === 4) return 3;
    if (globalIndex.value === 5) return 3;
    if (globalIndex.value === 6) return 4;
    if (globalIndex.value === 7) return 5;
  } else {
    // Normal flow
    if (globalIndex.value === 3) return 2;
    if (globalIndex.value === 4) return 2;
    if (globalIndex.value === 5) return 3;
    if (globalIndex.value === 6) return 4;
    if (globalIndex.value === 7) return 5;
  }

  return 0;
});

// Previous button functionality - Refactored to reduce cognitive complexity
const goToPreviousStep = () => {
  if (localTestAnswer.submitted) return;

  const handleStepNavigation = () => {
    if (globalIndex.value === (hasEyeTracking.value ? 7 : 6)) {
      // From Completion/Finish to PostTest
      globalIndex.value = hasEyeTracking.value ? 6 : 5;
      localTestAnswer.postTestCompleted = false;
    } else if (globalIndex.value === (hasEyeTracking.value ? 6 : 5)) {
      // From PostTest to Tasks
      globalIndex.value = hasEyeTracking.value ? 5 : 4;
      taskIndex.value = Math.max(0, (localTestAnswer.tasks?.length || 1) - 1);
    } else if (globalIndex.value === (hasEyeTracking.value ? 5 : 4)) {
      handleTaskStepNavigation();
    } else if (globalIndex.value === (hasEyeTracking.value ? 4 : 3)) {
      // From PreTasks to EyeTracking or PreTest
      globalIndex.value = hasEyeTracking.value ? 3 : 2;
    } else if (globalIndex.value === 3 && hasEyeTracking.value) {
      // From EyeTracking to PreTest
      globalIndex.value = 2;
    } else if (globalIndex.value === 2) {
      // From PreTest to Consent
      globalIndex.value = 1;
    } else if (globalIndex.value === 1) {
      // From Consent to Welcome
      globalIndex.value = 0;
    }
  };

  const handleTaskStepNavigation = () => {
    if (taskIndex.value > 0) {
      taskIndex.value--;
    } else {
      // From first task to PreTasks
      globalIndex.value = hasEyeTracking.value ? 4 : 3;
    }
  };

  handleStepNavigation();
  saveProgress();
};

// Save progress without redirecting
const saveProgress = async () => {
  try {
    isLoading.value = true;
    isSaving.value = true;
    
    attachMediaToTasks(localTestAnswer, mediaUrls.value);
    localTestAnswer.progress = calculateProgress();
    localTestAnswer.fullName = fullName.value;
    // Sync calibration status with local reactive variable
    localTestAnswer.eyeCalibrationCompleted = calibrationCompleted.value;
  
    if (user.value && user.value?.email) {
      localTestAnswer.userDocId = user.value.id;
      localTestAnswer.invited = true;
    }
    
    if (user.value) {
      Object.assign(currentUserTestAnswer.value, localTestAnswer);
      await store.dispatch('saveTestAnswer', {
        data: currentUserTestAnswer.value,
        answerDocId: test.value.answersDocId,
        testType: test.value.testType,
      });
    } else {
      localTestAnswer.userDocId = nanoid(16);
      await store.dispatch('saveTestAnswer', {
        data: localTestAnswer,
        answerDocId: test.value.answersDocId,
        testType: test.value.testType,
      });
    }
    
    store.commit('SET_TOAST', { 
      type: 'success', 
      message: 'Progress saved successfully!',
      timeout: 2000
    });
  } catch (error) {
    console.error('Error saving progress:', error.message);
    store.commit('SET_TOAST', { 
      type: 'error', 
      message: 'Failed to save progress. Please try again.' 
    });
  } finally {
    isLoading.value = false;
    isSaving.value = false;
  }
};

function handleIrisData(data) {
  if (localTestAnswer.tasks[taskIndex.value]) {
    localTestAnswer.tasks[taskIndex.value].irisTrackingData.push(data)
  }
}

const openCalibration = () => {
  const eyeLabUrl = process.env.VUE_APP_EYE_LAB_FRONTEND_URL;
  if (!eyeLabUrl) {
    console.error('VUE_APP_EYE_LAB_FRONTEND_URL is not configured');
    return;
  }
  globalThis.open(`${eyeLabUrl}/calibration/camera?auth=${user.value?.id}&test=${test.value.id}`, '_blank');
  calibrationInProgress.value = true;
}

const closeCalibration = () => {
  calibrationInProgress.value = false;
  completeStep(taskIndex.value, 'eyeCalibration');
}

function toggleTracking(value) {
  console.log('toggleTracking', value);

  isTracking.value = value;
  isRecording.value = value;
}

function saveIrisDataIntoTask() {
  console.log('saveIrisDataIntoTask', {
    taskIndex: taskIndex.value,
    hasEye: test.value?.testStructure?.userTasks[taskIndex.value]?.hasEye,
    globalIndex: globalIndex.value,
  });

  const task = test.value?.testStructure?.userTasks[taskIndex.value]

  if (task?.hasEye === true && globalIndex.value >= 5) {
    toggleTracking(true);
  } else {
    toggleTracking(false);
  }
}

const submitAnswer = async () => {
  try {
    localTestAnswer.submitted = true;
    await saveProgress();
    store.commit('SET_TOAST', { 
      type: 'success', 
      message: 'Test submitted successfully!',
      timeout: 3000
    });
    setTimeout(() => {
      router.push('/admin');
    }, 2000);
  } catch (error) {
    console.error('Error submitting answer:', error.message);
    store.commit('SET_TOAST', { type: 'error', message: 'Failed to submit the answer. Please try again.' });
  }
};

const handleConsentDecline = () => {
  // User declined consent, end the test
  store.commit('SET_TOAST', { 
    type: 'info', 
    message: 'Test ended due to consent decline. Thank you for your time.',
    timeout: 5000
  });
  
  // Navigate back to admin or appropriate page
  setTimeout(() => {
    router.push('/admin');
  }, 2000);
};

const handleSubmit = () => {
  dialog.value = false;
  submitAnswer();
};

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

const startTest = async () => {
  if (!test.value.testStructure || test.value.testStructure.length === 0) {
    store.commit('SET_TOAST', { type: 'info', message: "This test doesn't have any tasks." });
    router.push(`/missions/${test.value.id}`);
    return;
  }

  if (!isUserTestAdmin.value) {
    await store.dispatch('acceptStudyCollaboration', {
      test: test.value,
      cooperator: user.value,
    });
  }
  // mark test as started in local state
  localTestAnswer.testStarted = true;

  // Add animation class
  const startScreen = document.querySelector('.start-screen');
  if (startScreen) {
    startScreen.classList.add('leaving');
  }

  // Wait for animation then save and proceed
  setTimeout(async () => {
    start.value = false;
    await saveProgress();
    globalIndex.value = 0; // go to welcome step
  }, 1000);
};

const handleWelcomeStart = () => {
  globalIndex.value = 1; // go to consent step
  saveProgress();
}

const callTimerSave = () => {
  if (timerComponent.value && typeof timerComponent.value.stopTimer === 'function') {
    timerComponent.value.stopTimer();
  }
};

function handleTaskFinish(userCompleted) {
  const currentTask = localTestAnswer.tasks[taskIndex.value];
  if (currentTask) {
    // Ensure task is marked as attempted
    currentTask.attempted = true;
    currentTask.completed = userCompleted;
    
    // If user didn't complete but left data, still save it
    if (!userCompleted && (currentTask.taskAnswer || currentTask.taskObservations)) {
      console.log('Task marked as attempted but not completed, saving progress');
    }
    
    console.log('Task finished with status:', { 
      userCompleted, 
      attempted: currentTask.attempted,
      completed: currentTask.completed 
    });
  }
  
  completeStep(taskIndex.value, 'tasks', userCompleted);
  callTimerSave();
}

const startTimer = () => {
  if (timerComponent.value && typeof timerComponent.value.startTimer === 'function') {
    timerComponent.value.startTimer();
  }
};

const handleTimerStopped = (elapsedTime, idx) => {
  console.log('handleTimerStopped llamado con:', { elapsedTime, idx });

  if (!localTestAnswer.tasks) {
    console.error('localTestAnswer.tasks no está definido');
    return;
  }

  if (idx === undefined || idx === null) {
    console.error('Índice de tarea no válido:', idx);
    return;
  }

  if (localTestAnswer.tasks[idx]) {
    const timeToSave = typeof elapsedTime === 'number' ? elapsedTime : parseInt(elapsedTime);
    if (!isNaN(timeToSave)) {
      localTestAnswer.tasks[idx].taskTime = timeToSave;
    }
  }
};

// Refactored completeStep to reduce cognitive complexity
const completeStep = async (id, type, userCompleted = true) => {
  try {
    console.log('completeStep called:', { id, type, userCompleted, currentGlobalIndex: globalIndex.value });

    if (type === 'consent') {
      localTestAnswer.consentCompleted = true;
      globalIndex.value = 2; // PreTest
      console.log('Moved to PreTest, globalIndex:', globalIndex.value);
    }

    if (type === 'preTest') {
      localTestAnswer.preTestCompleted = true;
      globalIndex.value = 3; // This is correct - index 3 shows different components based on hasEyeTracking
      console.log('Moved to next step, globalIndex:', globalIndex.value);
    }

    if (type === 'eyeCalibration') {
      globalIndex.value = 4; // PreTasks
      taskIndex.value = 0;
      eyeCalibrationStepDone.value = true;
      calibrationCompleted.value = true;
      localTestAnswer.eyeCalibrationCompleted = true; // Save to persisted data
      console.log('Moved to PreTasks, globalIndex:', globalIndex.value);
    }

    if (type === 'tasks') {
      handleTaskCompletion(id, userCompleted);
    }

    if (type === 'postTest') {
      console.log('Completing post-test, current postTestCompleted:', localTestAnswer.postTestCompleted);
      localTestAnswer.postTestCompleted = true;
      globalIndex.value = hasEyeTracking.value ? 7 : 6; // Finish
      console.log('Moved to Finish, globalIndex:', globalIndex.value);
    }

    saveIrisDataIntoTask();
    calculateProgress();

    await saveProgress();
    
    // Debug log after save
    console.log('After completeStep:', {
      globalIndex: globalIndex.value,
      hasEyeTracking: hasEyeTracking.value,
      expectedPostTestIndex: hasEyeTracking.value ? 6 : 5,
      shouldShowPostTest: globalIndex.value === (hasEyeTracking.value ? 6 : 5),
      tasks: localTestAnswer.tasks?.map(t => ({ attempted: t.attempted, completed: t.completed }))
    });
    
  } catch (error) {
    console.error('Error in completeStep:', error);
    store.commit('SET_TOAST', { 
      type: 'error', 
      message: 'Failed to complete step. Please try again.' 
    });
  }
}

const handleTaskCompletion = (id, userCompleted) => {
  if (!Array.isArray(localTestAnswer.tasks)) {
    localTestAnswer.tasks = [];
  }
  
  // Ensure the task exists
  if (!localTestAnswer.tasks[id]) {
    localTestAnswer.tasks[id] = new TaskAnswer({
      taskId: id,
      taskAnswer: '',
      taskObservations: '',
      postAnswer: '',
      taskTime: 0,
      completed: false,
      attempted: false,
      susAnswers: [],
      nasaTlxAnswers: {}
    });
  }
  
  // Mark task as attempted
  localTestAnswer.tasks[id].attempted = true;
  localTestAnswer.tasks[id].completed = userCompleted;
  
  console.log('Task marked as:', { 
    taskId: id, 
    attempted: localTestAnswer.tasks[id].attempted,
    completed: localTestAnswer.tasks[id].completed 
  });
  
  // Check if all tasks have been attempted
  const allTasksAttempted = localTestAnswer.tasks.every(task => task?.attempted);
  
  allTasksCompleted.value = allTasksAttempted;
  console.log('All tasks attempted?', allTasksAttempted);

  // Determine where to go next
  if (id < localTestAnswer.tasks.length - 1) {
    // Go to next task
    taskIndex.value = id + 1;
    startTimer();
    console.log('Moving to next task:', taskIndex.value);
  } else {
    // This is the last task
    console.log('Last task completed, checking if all tasks attempted:', allTasksAttempted);
    
    if (allTasksAttempted) {
      // All tasks have been attempted - move to post-test
      globalIndex.value = hasEyeTracking.value ? 6 : 5; // PostTest
      console.log('All tasks attempted, moving to post-test. globalIndex set to:', globalIndex.value);
    } else {
      // Not all tasks attempted - stay on current or go back
      console.log('Not all tasks attempted, staying');
    }
  }
}

const autoComplete = async () => {
  if (!localTestAnswer || !items.value || !Array.isArray(items.value) || items.value.length < 3) return;

  // PRE-TEST
  if (items.value[0]?.value && Array.isArray(items.value[0].value)) {
    if (localTestAnswer.consentCompleted && items.value[0].value[0]) {
      items.value[0].value[0].icon = 'mdi-check-circle-outline';
    }
    if (localTestAnswer.preTestCompleted && items.value[0].value[1]) {
      items.value[0].value[1].icon = 'mdi-check-circle-outline';
    }
    if (localTestAnswer.preTestCompleted && localTestAnswer.consentCompleted && items.value[0]) {
      items.value[0].icon = 'mdi-check-circle-outline';
    }
  }

  // TASKS
  if (items.value[1]?.value && Array.isArray(items.value[1].value)) {
    allTasksCompleted.value = true;
    for (let i = 0; i < items.value[1].value.length; i++) {
      if (localTestAnswer.tasks && localTestAnswer.tasks[i]?.attempted && items.value[1].value[i]) {
        items.value[1].value[i].icon = 'mdi-check-bold';
      }
      if (!localTestAnswer.tasks || !localTestAnswer.tasks[i]?.attempted) {
        allTasksCompleted.value = false;
      }
    }
    if (allTasksCompleted.value && items.value[1]) {
      items.value[1].icon = 'mdi-check-bold';
    }
  }

  // POST-TEST
  if (items.value[2] && localTestAnswer.postTestCompleted) {
    items.value[2].icon = 'mdi-check-bold';
  }
};

const calculateProgress = () => {
  try {
    if (!localTestAnswer) return 0;
    const totalSteps = 4;
    let completedSteps = 0;

    if (localTestAnswer.preTestCompleted) completedSteps++;
    if (localTestAnswer.consentCompleted) completedSteps++;

    let tasksCompleted = 0;
    if (Array.isArray(localTestAnswer.tasks) && localTestAnswer.tasks.length > 0) {
      for (let i = 0; i < localTestAnswer.tasks.length; i++) {
        if (localTestAnswer.tasks[i]?.completed) {
          tasksCompleted++;
        }
      }
      if (tasksCompleted === localTestAnswer.tasks.length) {
        completedSteps++;
      }
    }

    if (localTestAnswer.postTestCompleted) completedSteps++;

    const progressPercentage = (completedSteps / totalSteps) * 100;
    localTestAnswer.progress = progressPercentage;
    return progressPercentage;
  } catch (error) {
    console.error('Error in calculateProgress:', error);
    return 0;
  }
};

const setTest = async () => {
  try {
    logined.value = true;
    await store.dispatch('getCurrentTestAnswerDoc');
    if (!currentUserTestAnswer.value) {
      currentUserTestAnswer.value = new UserStudyEvaluatorAnswer()
    }

    // Convert tasks to array if needed
    let tasksArray = [];
    if (currentUserTestAnswer.value.tasks) {
      if (Array.isArray(currentUserTestAnswer.value.tasks)) {
        tasksArray = currentUserTestAnswer.value.tasks.map(task => new TaskAnswer(task));
      } else if (typeof currentUserTestAnswer.value.tasks === 'object') {
        tasksArray = Object.values(currentUserTestAnswer.value.tasks).map(task => new TaskAnswer(task));
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
      // Load calibration status from saved data
      eyeCalibrationCompleted: currentUserTestAnswer.value.eyeCalibrationCompleted || false,
    });
    fullName.value = localTestAnswer.fullName;
    
    // Sync the reactive variable with saved data
    calibrationCompleted.value = localTestAnswer.eyeCalibrationCompleted;

    // check if user has existing progress
    const hasExistingProgress = localTestAnswer.consentCompleted ||
                                localTestAnswer.preTestCompleted ||
                                (Array.isArray(localTestAnswer.tasks) && localTestAnswer.tasks.some(task => task.attempted)) ||
                                localTestAnswer.postTestCompleted;

    if (hasExistingProgress) {
      start.value = false;
      restoreProgressState();
    }
    await mappingSteps();
    await autoComplete();
    localTestAnswer.progress = calculateProgress();
  } catch (error) {
    console.error('Error setting test:', error.message);
    store.commit('SET_TOAST', { type: 'error', message: 'Failed to load test data. Please try again.' });
  }
};

// Refactored restoreProgressState to reduce cognitive complexity
const restoreProgressState = () => {
  if (!localTestAnswer.consentCompleted) {
    globalIndex.value = 1; // Consent
    return;
  }

  if (!localTestAnswer.preTestCompleted) {
    globalIndex.value = 2; // PreTest
    return;
  }

  // Check saved calibration status, not the reactive variable
  if (hasEyeTracking.value && !localTestAnswer.eyeCalibrationCompleted) {
    globalIndex.value = 3; // Eye Tracking
    return;
  }

  handlePostPreTestNavigation();
};

const handlePostPreTestNavigation = () => {
  const hasTasks = Array.isArray(localTestAnswer.tasks) && localTestAnswer.tasks.length > 0;
  
  if (hasTasks) {
    const activeTaskIndex = findActiveTaskIndex();
    
    if (activeTaskIndex !== -1) {
      taskIndex.value = activeTaskIndex;
      globalIndex.value = hasEyeTracking.value ? 5 : 4; // Tasks
    } else if (!localTestAnswer.postTestCompleted) {
      globalIndex.value = hasEyeTracking.value ? 6 : 5; // PostTest
    } else if (!localTestAnswer.submitted) {
      globalIndex.value = hasEyeTracking.value ? 7 : 6; // Finish
    }
  } else {
    handleNoTasksNavigation();
  }
};

const findActiveTaskIndex = () => {
  for (let i = 0; i < localTestAnswer.tasks.length; i++) {
    const task = localTestAnswer.tasks[i];
    
    // Task has data but not marked as attempted
    if ((task.taskAnswer || task.taskObservations || 
        task.susAnswers?.length > 0 || 
        (task.nasaTlxAnswers && Object.keys(task.nasaTlxAnswers).length > 0)) && 
        !task.attempted) {
      return i;
    }
    
    // Task is attempted but not completed
    if (task.attempted && !task.completed) {
      return i;
    }
  }
  
  // If no active task, find first unattempted
  return localTestAnswer.tasks.findIndex(task => !task.attempted);
};

const handleNoTasksNavigation = () => {
  if (!localTestAnswer.postTestCompleted) {
    globalIndex.value = hasEyeTracking.value ? 6 : 5; // PostTest
  } else if (!localTestAnswer.submitted) {
    globalIndex.value = hasEyeTracking.value ? 7 : 6; // Finish
  }
};

const setExistUser = () => {
  noExistUser.value = false;
};

const mappingSteps = async () => {
  try {
    items.value = [];

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
      });
      if (!localTestAnswer.preTestAnswer.length && Array.isArray(test.value.testStructure.preTest)) {
        localTestAnswer.preTestAnswer = test.value.testStructure.preTest.map(() => ({
          answer: '',
        }));
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
      });
      if (!Array.isArray(localTestAnswer.tasks) || localTestAnswer.tasks.length === 0) {
        localTestAnswer.tasks = test.value.testStructure.userTasks.map((task, i) => {
          return new TaskAnswer({
            taskId: task.id || i,
            taskAnswer: '',
            taskObservations: '',
            postAnswer: '',
            taskTime: 0,
            completed: false,
            attempted: false,
            susAnswers: [],
            nasaTlxAnswers: {}
          });
        });
      }
    }

    // PostTest
    if (validate(test.value?.testStructure?.postTest)) {
      items.value.push({
        title: 'Post Test',
        icon: 'mdi-check-bold',
        value: test.value.testStructure.postTest,
        id: 2,
      });
      if (!localTestAnswer.postTestAnswer.length && Array.isArray(test.value.testStructure.postTest)) {
        localTestAnswer.postTestAnswer = test.value.testStructure.postTest.map(() => ({
          answer: '',
        }));
      }
    }
  } catch (error) {
    console.error('Error mapping steps:', error.message);
    store.commit('SET_TOAST', { type: 'error', message: 'Failed to initialize test data. Please try again.' });
  }
}

const validate = (object) => {
  return (
    object !== null &&
    object !== undefined &&
    object !== '' &&
    Array.isArray(object) &&
    object.length > 0
  );
};

watchEffect(() => {
  const index = taskIndex.value;
  const taskList = test.value?.testStructure?.userTasks;
  const task = Array.isArray(taskList) ? taskList[index] : undefined;
  const answers = localTestAnswer?.tasks?.[index]?.susAnswers;

  if (task?.taskType === 'sus') {
    const validCount = answers?.filter(v => typeof v === 'number').length ?? 0;
    doneTaskDisabled.value = validCount < 10;
  } else {
    doneTaskDisabled.value = false;
  }
});

watch(
  () => items.value,
  () => {
    if (items.value.length && globalIndex.value === null) {
      globalIndex.value = items.value[0].id;
      if (items.value.find((obj) => obj.id === 0)) {
        preTestIndex.value = items.value[0].value[0].id;
      }
    }
  },
  { deep: true }
);

// Scroll to top of the page when step changes
const scrollToTop = () => {
  // For most browsers
  globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  // For rightView (in case of overflow)
  if (rightView.value) {
    rightView.value.scrollTop = 0;
  }
};

watch(
  () => [globalIndex.value, taskIndex.value],
  () => {
    scrollToTop();
  }
);

watch(
  () => user.value,
  async () => {
    if (user.value) {
      noExistUser.value = false;
      if (logined.value) await setTest();
    }
  }
);

// Refactored onMounted to reduce cognitive complexity
onMounted(async () => {
  await nextTick();
  
  if (!user.value) {
    globalIndex.value = 0;
    return;
  }

  await setTest();
  await autoComplete();
  calculateProgress();

  if (testAlreadyStarted.value) {
    start.value = false;
    restoreMountedProgressState();
  } else {
    globalIndex.value = 0;
  }

  setupUserSnapshotListener();
});

const restoreMountedProgressState = () => {
  if (!localTestAnswer.consentCompleted) {
    globalIndex.value = 1;
    return;
  }

  if (!localTestAnswer.preTestCompleted) {
    globalIndex.value = 2;
    return;
  }

  // Check saved calibration status, not the reactive variable
  if (hasEyeTracking.value && !localTestAnswer.eyeCalibrationCompleted) {
    globalIndex.value = 3;
    return;
  }

  handleMountedTaskNavigation();
};

const handleMountedTaskNavigation = () => {
  const hasTasks = Array.isArray(localTestAnswer.tasks) && localTestAnswer.tasks.length > 0;
  
  if (hasTasks) {
    const currentTaskIndex = findMountedActiveTask();
    
    if (currentTaskIndex !== -1) {
      taskIndex.value = currentTaskIndex;
      globalIndex.value = hasEyeTracking.value ? 5 : 4;
    } else if (!localTestAnswer.postTestCompleted) {
      globalIndex.value = hasEyeTracking.value ? 6 : 5;
    } else {
      globalIndex.value = hasEyeTracking.value ? 7 : 6;
    }
  } else {
    handleMountedNoTasks();
  }
};

const findMountedActiveTask = () => {
  for (let i = 0; i < localTestAnswer.tasks.length; i++) {
    const task = localTestAnswer.tasks[i];
    
    if ((task.taskAnswer || task.taskObservations || task.susAnswers?.length > 0 || 
        task.nasaTlxAnswers && Object.keys(task.nasaTlxAnswers).length > 0) && 
       !task.attempted) {
      return i;
    }
    
    if (task.attempted && !task.completed) {
      return i;
    }
  }
  
  return localTestAnswer.tasks.findIndex(task => !task.attempted);
};

const handleMountedNoTasks = () => {
  if (!localTestAnswer.postTestCompleted) {
    globalIndex.value = hasEyeTracking.value ? 6 : 5;
  } else {
    globalIndex.value = hasEyeTracking.value ? 7 : 6;
  }
};

const setupUserSnapshotListener = () => {
  if (!user.value?.id) return;
  
  let firstSnapshot = true;
  const userRef = doc(db, 'users', user.value.id);
  
  onSnapshot(userRef, (docSnap) => {
    if (!docSnap.exists()) return;
    
    const data = docSnap.data();
    if (firstSnapshot) {
      firstSnapshot = false;
      return;
    }
    
    if (data.calibrationId) {
      calibrationCompleted.value = true;
      localTestAnswer.eyeCalibrationCompleted = true; // Also update saved data
    }
  });
};

// Listen for calibration completion message from the calibration window
globalThis.addEventListener('message', (event) => {
  if (event.data === 'calibrationCompleted') {
    calibrationCompleted.value = true;
    localTestAnswer.eyeCalibrationCompleted = true; // Update saved data
  }
});

// Listen for calibration completion via localStorage
globalThis.addEventListener('storage', (event) => {
  if (event.key === 'calibrationCompleted' && event.newValue === 'true') {
    calibrationCompleted.value = true;
    localTestAnswer.eyeCalibrationCompleted = true; // Update saved data
    localStorage.removeItem('calibrationCompleted');
  }
});

onBeforeUnmount(() => {
  if (videoRecorder.value && typeof videoRecorder.value.stopRecording === 'function') {
    videoRecorder.value.stopRecording();
  }
  // Remove the message listener
  globalThis.removeEventListener('message', (event) => {
    if (event.data === 'calibrationCompleted') {
      calibrationCompleted.value = true;
      localTestAnswer.eyeCalibrationCompleted = true;
    }
  });
  // Remove the storage listener
  globalThis.removeEventListener('storage', (event) => {
    if (event.key === 'calibrationCompleted' && event.newValue === 'true') {
      calibrationCompleted.value = true;
      localTestAnswer.eyeCalibrationCompleted = true;
      localStorage.removeItem('calibrationCompleted');
    }
  });
});
</script>

<style scoped>
.start-screen {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-size: 200% 200%;
  animation: subtleGradient 20s ease-in-out infinite;
  background-image: linear-gradient(160deg,
      #00213F 0%,
      #1a2f4f 35%,
      #303f9f 100%);
  transition: opacity 8s cubic-bezier(0.4, 0, 0.2, 1);
}

.start-screen.leaving,
.start-screen.leaving>*,
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
  height: 90%;
  margin-right: -100px;
  margin-top: 200px;
  background-image: url(../../../assets/ruxailab-small-red.png);
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
  background: #00213F !important;
  color: #fff !important;
  --v-stepper-header-title-color: #fff !important;
  --v-stepper-item-title-color: #fff !important;
  --v-stepper-item-color: #fff !important;
  transition: background 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-stepper.stepper-animate {
  background: #00213F !important;
  opacity: 0.3;
  filter: blur(1px);
}

/* Task stepper background */
.task-stepper {
  background: #00213F !important;
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
  ;
}
</style>
