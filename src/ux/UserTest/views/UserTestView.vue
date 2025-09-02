<template>
  <div v-if="test">
    <!-- Loading Overlay -->
    <v-overlay v-model="isLoading" class="text-center">
      <v-progress-circular indeterminate color="#fca326" size="50" />
      <div class="white-text mt-3">
        Saving...
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
        v-if="test && start"
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
          <p align="justify" class="description">
            {{ test.testDescription }}
          </p>
          <v-btn
            color="white"
            variant="outlined"
            rounded
            size="x-large"
            @click="startTest"
          >
            Start Test
          </v-btn>
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
                  <v-stepper-item
                    value="1"
                    title="Consent"
                    :complete="stepperValue >= 1"
                    :color="stepperValue < 1 ? 'primary' : 'success'"
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    value="2"
                    title="Pre-test"
                    :complete="stepperValue >= 2"
                    :color="stepperValue < 2 ? 'primary' : 'success'"
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    value="3"
                    title="Tasks"
                    :complete="stepperValue >= 3"
                    :color="stepperValue < 3 ? 'primary' : 'success'"
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    value="4"
                    title="Post-test"
                    :complete="stepperValue >= 4"
                    :color="stepperValue < 4 ? 'primary' : 'success'"
                    complete-icon="mdi-check"
                  />
                  <v-divider />
                  <v-stepper-item
                    value="5"
                    title="Completion"
                    :complete="stepperValue === 5"
                    :color="stepperValue < 5 ? 'primary' : 'success'"
                    complete-icon="mdi-check"
                  />
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>
          <!-- Stepper secundario para tareas -->
          <v-row
            v-if="globalIndex === 4 && test?.testStructure?.userTasks?.length > 1"
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
                      :title="`Tarea ${idx + 1}`"
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
          <WelcomeStep
            v-if="globalIndex === 0"
            :stepper-value="stepperValue"
            @start="globalIndex = 1"
          />
          <ConsentStep
            v-if="globalIndex === 1 && taskIndex === 0"
            :test-title="test.testTitle"
            :pre-test-title="$t('UserTestView.titles.preTest')"
            :consent-text="test.testStructure.consent"
            :full-name-model="fullName"
            :consent-completed-model="localTestAnswer.consentCompleted"
            @update:full-name-model="val => fullName = val"
            @update:consent-completed-model="val => localTestAnswer.consentCompleted = val"
            @continue="completeStep(taskIndex, 'consent')"
          />
          <PreTestStep
            v-if="globalIndex === 2 && taskIndex === 0"
            v-model:pre-test-answer="localTestAnswer.preTestAnswer"
            :test-title="test.testTitle"
            :pre-test-title="$t('UserTestView.titles.preTest')"
            :pre-test="test.testStructure.preTest"
            :pre-test-completed="localTestAnswer.preTestCompleted"
            @done="completeStep(taskIndex, 'preTest')"
          />
          <PreTasksStep
            v-if="globalIndex === 3 && taskIndex === 0"
            :num-tasks="test?.testStructure?.userTasks?.length || 0"
            @start-tasks="() => { taskIndex = 0; globalIndex = 4 }"
          />
          <TaskStep
            v-if="globalIndex === 4 && test.testType === STUDY_TYPES.USER"
            ref="taskStepComponent"
            v-model:post-answer="localTestAnswer.tasks[taskIndex].postAnswer"
            v-model:task-answer="localTestAnswer.tasks[taskIndex].taskAnswer"
            v-model:task-observations="localTestAnswer.tasks[taskIndex].taskObservations"
            :task="test.testStructure.userTasks[taskIndex]"
            :task-index="taskIndex"
            :test-id="testId"
            :sus-answers="localTestAnswer.tasks[taskIndex].susAnswers"
            :nasa-tlx-answers="localTestAnswer.tasks[taskIndex].nasaTlxAnswers"
            :submitted="localTestAnswer.submitted"
            :done-task-disabled="doneTaskDisabled"
            @update:sus-answers="val => { localTestAnswer.tasks[taskIndex].susAnswers = Array.isArray(val) ? [...val] : [] }"
            @update:nasa-tlx-answers="val => { localTestAnswer.tasks[taskIndex].nasaTlxAnswers = { ...val } }"
            @done="() => handleTaskFinish(true)"
            @could-not-finish="() => handleTaskFinish(false)"
            @show-loading="isLoading = true"
            @stop-show-loading="isLoading = false"
            @recording-started="isVisualizerVisible = $event"
            @timer-stopped="handleTimerStopped"
          />
          <PostTestStep
            v-if="globalIndex === 5 && (!localTestAnswer.postTestCompleted || localTestAnswer.submitted)"
            v-model:post-test-answer="localTestAnswer.postTestAnswer"
            :test-title="test.testTitle"
            :post-test-title="$t('UserTestView.titles.postTest')"
            :post-test="test.testStructure.postTest"
            :post-test-completed="localTestAnswer.postTestCompleted"
            @done="() => { completeStep(taskIndex, 'postTest'); taskIndex = 3 }"
          />
          <FinishStep
            v-if="globalIndex === 6 && localTestAnswer.postTestCompleted && !localTestAnswer.submitted"
            :final-message="$t('finishTest.finalMessage')"
            :congratulations="$t('finishTest.congratulations')"
            :submit-message="$t('finishTest.submitMessage')"
            :submit-btn="$t('buttons.submit')"
            @submit="dialog = true"
          />
        </v-col>
      </v-row>
    </v-container>
    <!-- Floating Action Button -->
    <v-btn v-if="showSaveBtn && localTestAnswer && !start" position="fixed" location="bottom right" icon
      class="mb-10 mr-5">
      <v-speed-dial v-model="fab" class="mr-3" open-on-hover>
        <template #activator="{ props }">
          <v-btn v-model="fab" size="large" color="#F9A826" v-bind="props" icon class="btn-fix">
            <v-icon v-if="fab">
              mdi-close
            </v-icon>
            <v-icon v-else size="large">
              mdi-hammer-screwdriver
            </v-icon>
          </v-btn>
        </template>
        <v-tooltip location="left">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon size="small" color="#F9A826" @click="saveAnswer">
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </template>
          <span>Save</span>
        </v-tooltip>
        <v-tooltip location="left">
          <template #activator="{ props }">
            <v-btn v-bind="props" :disabled="localTestAnswer && !localTestAnswer.postTestCompleted" class="text-white"
              icon size="small" color="#F9A826" @click="dialog = true">
              <v-icon>mdi-file-move</v-icon>
            </v-btn>
          </template>
          <span>Submit</span>
        </v-tooltip>
      </v-speed-dial>
    </v-btn>
    -->
  </div>
</template>

<script setup>


import SubmitDialog from '@/ux/UserTest/components/SubmitDialog.vue';

import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, reactive, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Snackbar from '@/shared/components/Snackbar';
import UserTask from '@/ux/UserTest/models/UserTask';
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

const fullName = ref('');
const logined = ref(null);
const fromlink = ref(null);
const start = ref(true);
const globalIndex = ref(null);
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

const rightView = ref(null);
const videoRecorder = ref(null);
const taskStepComponent = ref(null);
const timerComponent = computed(() => {
  // Get timer ref from TaskStep
  return taskStepComponent.value?.$refs?.timerComponent || null;
});

const localTestAnswer = reactive(new UserStudyEvaluatorAnswer());

const store = useStore();
const router = useRouter();

const test = computed(() => store.getters.test);
const testId = computed(() => store.getters.test?.id || null);
const user = computed(() => {
  if (store.getters.user) setExistUser();
  return store.getters.user;
});
const currentUserTestAnswer = computed(() => store.getters.currentUserTestAnswer || {});
const showSaveBtn = computed(() => !localTestAnswer.submitted);


const isTaskDisabled = (taskIndex) => {
  if (!Array.isArray(localTestAnswer.tasks)) return true;
  for (let i = 0; i < taskIndex; i++) {
    if (!localTestAnswer.tasks[i]?.completed) {
      return true;
    }
  }
  return false;
};

const stepperValue = computed(() => {
  if (globalIndex.value === 0) return -1;
  if (globalIndex.value === 1 && taskIndex.value === 0) return 0;
  if (globalIndex.value === 2 && taskIndex.value === 0) return 1;
  if (globalIndex.value === 3 && taskIndex.value === 0) return 2; // 👈 PANTALLA INFORMATIVA
  if (globalIndex.value === 4 && taskIndex.value >= 0) return 2;   // 👈 TAREAS
  if (globalIndex.value === 5 && !localTestAnswer.postTestCompleted) return 3;
  if (globalIndex.value === 6 && localTestAnswer.postTestCompleted) return 4;
  return 0;
});

const isPreTestTaskDisabled = (taskIndex) => {
  if (taskIndex === 0) return localTestAnswer.consentCompleted && localTestAnswer.preTestCompleted && !localTestAnswer.submitted;
  return !localTestAnswer.consentCompleted || (localTestAnswer.preTestCompleted && !localTestAnswer.submitted);
};
const saveAnswer = async () => {
  try {
    localTestAnswer.fullName = fullName.value;
    if (user.value && user.value?.email) {
      localTestAnswer.userDocId = user.value.id;
      localTestAnswer.invited = true;
    }
    if (!user.value) {
      localTestAnswer.userDocId = nanoid(16)
      await store.dispatch('saveTestAnswer', {
        data: localTestAnswer,
        answerDocId: test.value.answersDocId,
        testType: test.value.testType,
      });
    } else {
      Object.assign(currentUserTestAnswer.value, localTestAnswer);
      await store.dispatch('saveTestAnswer', {
        data: currentUserTestAnswer.value,
        answerDocId: test.value.answersDocId,
        testType: test.value.testType,
      });
    }
    router.push('/admin');
  } catch (error) {
    console.error('Error saving answer:', error.message);
    store.commit('SET_TOAST', { type: 'error', message: 'Failed to save the answer. Please try again.' });
  }
};

const submitAnswer = async () => {
  try {
    localTestAnswer.submitted = true;
    await saveAnswer();
  } catch (error) {
    console.error('Error submitting answer:', error.message);
    store.commit('SET_TOAST', { type: 'error', message: 'Failed to submit the answer. Please try again.' });
  }
};

const handleSubmit = () => {
  dialog.value = false;
  submitAnswer();
};

const startTest = () => {
  if (!test.value.testStructure || test.value.testStructure.length === 0) {
    store.commit('SET_TOAST', { type: 'info', message: "This test doesn't have any tasks." });
    router.push(`/missions/${test.value.id}`);
    return;
  }

  // Primero añadimos la clase para la animación de salida
  const startScreen = document.querySelector('.start-screen');
  if (startScreen) {
    startScreen.classList.add('leaving');
  }

  // Esperamos a que termine la animación antes de cambiar el estado
  setTimeout(() => {
    start.value = false;
  }, 1000);
};


const callTimerSave = () => {
  if (timerComponent.value && typeof timerComponent.value.stopTimer === 'function') {
    timerComponent.value.stopTimer();
  }
};

function handleTaskFinish(userCompleted) {
  const currentTask = localTestAnswer.tasks[taskIndex.value];
  if (currentTask) {
    console.log('Estado actual de la tarea antes de finalizar:', currentTask);
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
  // idx is passed from TaskStep, always use it
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
    console.log('Guardando tiempo para tarea', idx, ':', elapsedTime, 'segundos');
    // Asegurar que el tiempo es un número
    const timeToSave = typeof elapsedTime === 'number' ? elapsedTime : parseInt(elapsedTime);
    if (!isNaN(timeToSave)) {
      localTestAnswer.tasks[idx].taskTime = timeToSave;
      console.log('Tiempo guardado correctamente:', localTestAnswer.tasks[idx]);
    } else {
      console.error('Tiempo no válido:', elapsedTime);
    }
  } else {
    console.error('No se pudo guardar el tiempo para la tarea', idx);
  }
};

const completeStep = (id, type, userCompleted = true) => {
  try {
    if (type === 'consent') {
      localTestAnswer.consentCompleted = true;
      items.value[0].value[id].icon = 'mdi-check-circle-outline';
      if (localTestAnswer.preTestCompleted && localTestAnswer.consentCompleted) {
        items.value[0].icon = 'mdi-check-circle-outline';
      }
      globalIndex.value = 2;

    }
    if (type === 'preTest') {
      localTestAnswer.preTestCompleted = true;
      items.value[0].value[id].icon = 'mdi-check-circle-outline';
      if (localTestAnswer.preTestCompleted && localTestAnswer.consentCompleted) {
        items.value[0].icon = 'mdi-check-circle-outline';
      }
      globalIndex.value = 3;
    }
    if (type === 'tasks') {
      if (!Array.isArray(localTestAnswer.tasks)) {
        console.error('localTestAnswer.tasks is not an array:', localTestAnswer.tasks);
        return;
      }
      localTestAnswer.tasks[id].completed = userCompleted;
      items.value[1].value[id].icon = 'mdi-check-circle-outline';
      allTasksCompleted.value = true;

      for (let i = 0; i < items.value[1].value.length; i++) {
        if (!localTestAnswer.tasks[i]?.completed) {
          allTasksCompleted.value = false;
          break;
        }
      }
      if (allTasksCompleted.value) {
        items.value[1].icon = 'mdi-check-circle-outline';
      }
      if (id < localTestAnswer.tasks.length - 1) {
        taskIndex.value = id + 1;
        startTimer();
      } else {
        console.log('All tasks completed, moving to post-test');
        globalIndex.value = 5;
      }
      if (userCompleted) {
        store.commit('SET_TOAST', {
          type: 'success',
          message: `Task "${test.value.testStructure.userTasks[id].taskName}" completed successfully!`,
          timeout: 3000,
        });
      }
    }
    if (type === 'postTest') {
      localTestAnswer.postTestCompleted = true;
      items.value[2].icon = 'mdi-check-circle-outline';
      globalIndex.value = 6;

    }
    calculateProgress();
  } catch (error) {
    console.error('Error in completeStep:', error);
    store.commit('SET_TOAST', { type: 'error', message: 'Failed to complete step. Please try again.' });
  }
};

const autoComplete = async () => {
  if (!localTestAnswer || !items.value) return;

  // PRE-TEST
  if (items.value[0]?.value) {
    if (localTestAnswer.consentCompleted) {
      items.value[0].value[0].icon = 'mdi-check-circle-outline';
    }
    if (localTestAnswer.preTestCompleted) {
      items.value[0].value[1].icon = 'mdi-check-circle-outline';
    }
    if (localTestAnswer.preTestCompleted && localTestAnswer.consentCompleted) {
      items.value[0].icon = 'mdi-check-circle-outline';
    }
  }

  // TASKS
  if (items.value[1]?.value) {
    allTasksCompleted.value = true;
    for (let i = 0; i < items.value[1].value.length; i++) {
      if (localTestAnswer.tasks[i]?.completed) {
        items.value[1].value[i].icon = 'mdi-check-bold';
      }
      if (!localTestAnswer.tasks[i]?.completed) {
        allTasksCompleted.value = false;
      }
    }
    if (allTasksCompleted.value) {
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
    if (items.value[1]?.value && Array.isArray(localTestAnswer.tasks)) {
      for (let i = 0; i < items.value[1].value.length; i++) {
        if (localTestAnswer.tasks[i]?.completed) {
          tasksCompleted++;
        }
      }
      if (tasksCompleted === items.value[1].value.length) {
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

    let tasksArray = [];
    if (currentUserTestAnswer.value.tasks) {
      if (Array.isArray(currentUserTestAnswer.value.tasks)) {
        tasksArray = currentUserTestAnswer.value.tasks.map(task => new UserTask(task));
      } else if (typeof currentUserTestAnswer.value.tasks === 'object') {
        tasksArray = Object.values(currentUserTestAnswer.value.tasks).map(task => new UserTask(task));
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
    });
    fullName.value = localTestAnswer.fullName;
  } catch (error) {
    console.error('Error setting test:', error.message);
    store.commit('SET_TOAST', { type: 'error', message: 'Failed to load test data. Please try again.' });
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
      if (!localTestAnswer.tasks.length && Array.isArray(test.value.testStructure.userTasks)) {
        localTestAnswer.tasks = test.value.testStructure.userTasks.map((task, i) => {
          const newTask = new UserTask({
            taskId: task.id || i,
            taskAnswer: '',
            taskObservations: '',
            postAnswer: '',
            taskTime: 0,
            completed: false,
            susAnswers: [],
            nasaTlxAnswers: {}
          });
          console.log('Nueva tarea creada:', i, newTask);
          return newTask;
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
};

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
    console.log('SUS respostas válidas:', validCount);
  } else {
    doneTaskDisabled.value = false;
  }
});
watch(
  () => test.value,
  async () => {
    await mappingSteps();
  },
  { deep: true }
);

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
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

onMounted(async () => {
  globalIndex.value = 0;
  await mappingSteps();
  await nextTick();
  if (user.value) {
    await setTest();
    await autoComplete();
    //calculateProgress();
  }
});

onBeforeUnmount(() => {
  if (videoRecorder.value && typeof videoRecorder.value.stopRecording === 'function') {
    videoRecorder.value.stopRecording();
  }
});
</script>

<style scoped>
.start-screen {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.background-task {
  background-color: #e8eaf6;
  height: 100%;
  overflow: auto;
}

.background:before {
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
  background-image: url('@/assets/ruxailab-small-red.png');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right top;
  opacity: 0.2;
}

.title-view {
  font-style: normal;
  font-weight: normal;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #ffffff;
}

.description-view {
  font-style: normal;
  font-weight: normal;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #ffffff;
}

.sub-title {
  font-style: normal;
  font-weight: normal;
  font-size: 18.1818px;
  align-items: flex-end;
  color: #000000;
  margin-bottom: 4px;
  padding-bottom: 2px;
}

.btn-fix:focus:before {
  opacity: 0 !important;
}

.title-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin-left: 15px;
  padding: 10px;
  padding-left: 0px;
  padding-top: 0px;
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
