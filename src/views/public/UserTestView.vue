<template>
  <div v-if="test">
    <v-overlay v-model="isLoading" class="text-center">
      <v-progress-circular indeterminate color="primary" size="50" />
      <div class="text-white mt-3">
        Saving...
      </div>
    </v-overlay>
    <Snackbar />

    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="bg-error text-white text-h6 d-flex align-center">
          <v-icon left>mdi-alert-circle</v-icon>
          {{ $t('HeuristicsTestView.messages.submitTest') }}
        </v-card-title>
        <v-card-text class="pa-6 text-body-1">
          {{ $t('HeuristicsTestView.messages.submitOnce') }}
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn color="error" variant="flat" @click="handleSubmit">
            {{ $t('buttons.submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :model-value="fromlink && !noExistUser && !logined" max-width="400" persistent>
      <v-card v-if="user" class="rounded-xl pa-6">
        <v-row class="ma-0 pa-0" justify="center">
          <v-avatar color="primary-lighten-4" size="120">
            <v-icon size="80">mdi-account-circle</v-icon>
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
          <v-btn color="primary" block variant="flat" class="my-2" @click="setTest">
            Continue as {{ user.email }}
          </v-btn>
          <p class="text-caption mt-2">
            Not you?
            <a href="#" class="text-primary font-weight-medium" @click.prevent="signOut">Change account</a>
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-container fluid class="pa-0">
      <v-row v-if="test && start" class="start-screen background-img pa-0 ma-0" align="center">
        <v-col cols="12" md="6" class="ml-5 pa-6">
          <h1 class="text-h2 font-weight-bold mb-4 text-white">
            {{ test.testTitle }}
          </h1>
          <p class="text-body-1 mb-6 text-white text-justify">
            {{ test.testDescription }}
          </p>
          <v-btn color="white" variant="outlined" rounded x-large @click="startTest">
            Start Test
          </v-btn>
        </v-col>
      </v-row>

      <v-row v-else class="main-test-interface pa-0 ma-0">
        <v-col ref="rightView" class="right-view pa-6">
          <v-row v-if="index !== 1" class="stepper-row pa-4 mb-4">
            <v-col cols="12">
              <v-stepper
                :model-value="stepperValue"
                class="bg-white rounded-xl elevation-3"
              >
                <v-stepper-header>
                  <v-stepper-item
                    value="1"
                    title="Consent"
                    :complete="stepperValue >= 1"
                    :color="stepperValue < 1 ? 'primary' : 'success'"
                    complete-icon="mdi-check-circle"
                  />
                  <v-divider />
                  <v-stepper-item
                    value="2"
                    title="Pre-test Questions"
                    :complete="stepperValue >= 2"
                    :color="stepperValue < 2 ? 'primary' : 'success'"
                    complete-icon="mdi-check-circle"
                  />
                  <v-divider />
                  <v-stepper-item
                    value="3"
                    title="Tasks"
                    :complete="stepperValue >= 3"
                    :color="stepperValue < 3 ? 'primary' : 'success'"
                    complete-icon="mdi-check-circle"
                  />
                  <v-divider />
                  <v-stepper-item
                    value="4"
                    title="Post-test Questions"
                    :complete="stepperValue >= 4"
                    :color="stepperValue < 4 ? 'primary' : 'success'"
                    complete-icon="mdi-check-circle"
                  />
                  <v-divider />
                  <v-stepper-item
                    value="5"
                    title="Completion"
                    :complete="stepperValue === 5"
                    :color="stepperValue < 5 ? 'primary' : 'success'"
                    complete-icon="mdi-check-circle"
                  />
                </v-stepper-header>
              </v-stepper>
            </v-col>
          </v-row>

          <ShowInfo v-if="index === 0 && taskIndex === 0" :title="$t('UserTestView.titles.preTestConsent')">
            <template #content>
              <div class="test-content pa-4 rounded-xl">
                <v-row>
                  <v-col cols="12" class="text-center">
                    <h2 class="text-h5 font-weight-bold mb-8 text-secondary">
                      {{ test.testTitle }} - {{ $t('UserTestView.titles.preTest') }}
                    </h2>
                  </v-col>
                </v-row>
                <div class="rich-text mb-6 pa-4" v-html="test.testStructure.consent" />
                <v-row justify="center">
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="fullName"
                      label="Full Name"
                      variant="outlined"
                      density="comfortable"
                      :rules="[v => !!v || 'Name is required']"
                    />
                  </v-col>
                </v-row>
                <v-row justify="center">
                  <v-col cols="12" md="6">
                    <v-radio-group v-model="localTestAnswer.consentCompleted" inline>
                      <v-radio
                        label="I accept the consent terms"
                        :value="true"
                        :disabled="!fullName"
                      />
                      <v-radio
                        label="I do not accept the consent terms"
                        :value="false"
                      />
                    </v-radio-group>
                  </v-col>
                </v-row>
                <v-row justify="center" class="mt-4">
                  <v-col cols="12" md="6" class="text-center">
                    <v-btn
                      color="primary"
                      variant="flat"
                      block
                      :disabled="!localTestAnswer.consentCompleted || !fullName"
                      @click="completeStep(taskIndex, 'consent'); taskIndex = 1"
                    >
                      Continue
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </template>
          </ShowInfo>

          <ShowInfo v-if="index === 0 && taskIndex === 1" :title="$t('UserTestView.titles.preTestForm')">
            <template #content>
              <div class="test-content pa-4 rounded-xl">
                <v-row>
                  <v-col cols="12" class="text-center">
                    <h2 class="text-h5 font-weight-bold mb-8 text-secondary">
                      {{ test.testTitle }} - {{ $t('UserTestView.titles.preTest') }}
                    </h2>
                  </v-col>
                </v-row>
                <div v-for="(item, i) in test.testStructure.preTest" :key="i" class="mb-6">
                  <v-col cols="12" class="py-0">
                    <span class="text-subtitle-1 font-weight-bold text-secondary">{{ item.title }}</span>
                    <br>
                    <span v-if="item.description" class="text-body-2 text-grey-darken-1">{{ item.description }}</span>
                    <v-text-field
                      v-if="item.textField"
                      v-model="localTestAnswer.preTestAnswer[i].answer"
                      :disabled="localTestAnswer.preTestCompleted"
                      :placeholder="item.title"
                      variant="outlined"
                      density="comfortable"
                      class="mt-2"
                    />
                    <v-radio-group
                      v-if="item.selectionField"
                      v-model="localTestAnswer.preTestAnswer[i].answer"
                      :disabled="localTestAnswer.preTestCompleted"
                      class="mt-2"
                    >
                      <v-radio
                        v-for="(selection, j) in item.selectionFields"
                        :key="j"
                        :label="selection"
                        :value="selection"
                        :disabled="localTestAnswer.preTestCompleted"
                        density="compact"
                      />
                    </v-radio-group>
                  </v-col>
                </div>
                <v-row justify="center" class="mt-4">
                  <v-col cols="12" md="6">
                    <v-btn
                      block
                      color="primary"
                      variant="flat"
                      :disabled="localTestAnswer.preTestCompleted"
                      @click="completeStep(taskIndex, 'preTest')"
                    >
                      {{ $t('UserTestView.buttons.done') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </template>
          </ShowInfo>

          <ShowInfo v-if="index === 1 && test.testType === 'User'" :title="test.testStructure.userTasks[taskIndex].taskName">
            <template #content>
              <div class="test-content pa-4 rounded-xl">
                <v-row>
                  <v-col cols="12" class="text-center">
                    <h2 class="text-h5 font-weight-bold text-secondary">
                      {{ test.testStructure.userTasks[taskIndex].taskName }}
                    </h2>
                  </v-col>
                </v-row>
                <div class="rich-text mb-4" v-html="test.testStructure.userTasks[taskIndex].taskDescription" />
                <v-row v-if="test.testStructure.userTasks[taskIndex].taskLink" justify="center">
                  <v-col cols="12" class="text-center">
                    <a :href="test.testStructure.userTasks[taskIndex].taskLink" target="_blank" class="text-primary font-weight-medium">
                      {{ test.testStructure.userTasks[taskIndex].taskLink }}
                    </a>
                  </v-col>
                </v-row>
                <div v-if="!localTestAnswer.submitted">
                  <v-row class="mb-4 d-flex align-center">
                    <v-col v-if="test.testStructure.userTasks[taskIndex].taskTip" cols="auto">
                      <TipButton :task="test.testStructure.userTasks[taskIndex]" />
                    </v-col>
                    <v-col v-if="test.testStructure.userTasks[taskIndex].hasAudioRecord !== false" cols="auto">
                      <AudioRecorder
                        :test-id="testId"
                        :task-index="taskIndex"
                        @show-loading="isLoading = true"
                        @stop-show-loading="isLoading = false"
                        @recording-started="isVisualizerVisible = $event"
                      />
                    </v-col>
                    <v-col v-if="isVisualizerVisible" cols="auto">
                      <AudioVisualizer />
                    </v-col>
                    <v-col v-if="test.testStructure.userTasks[taskIndex].hasCamRecord !== false" cols="auto">
                      <VideoRecorder
                        ref="videoRecorder"
                        :test-id="testId"
                        :task-index="taskIndex"
                        @show-loading="isLoading = true"
                        @stop-show-loading="isLoading = false"
                      />
                    </v-col>
                    <v-col v-if="test.testStructure.userTasks[taskIndex].hasScreenRecord !== false" cols="auto">
                      <ScreenRecorder
                        :test-id="testId"
                        :task-index="taskIndex"
                        @show-loading="isLoading = true"
                        @stop-show-loading="isLoading = false"
                      />
                    </v-col>
                    <v-spacer />
                    <v-col cols="auto">
                      <Timer ref="timerComponent" :task-index="taskIndex" @timer-stopped="handleTimerStopped" />
                    </v-col>
                  </v-row>
                </div>
                <div class="mt-4">
                  <v-textarea
                    v-if="test.testStructure.userTasks[taskIndex].taskType === 'text-area'"
                    :id="'id-' + test.testStructure.userTasks[taskIndex].taskName"
                    v-model="localTestAnswer.tasks[taskIndex].taskAnswer"
                    variant="outlined"
                    label="Answer"
                    rows="3"
                  />
                  <v-textarea
                    :id="'id-' + test.testStructure.userTasks[taskIndex].taskName"
                    v-model="localTestAnswer.tasks[taskIndex].taskObservations"
                    variant="outlined"
                    label="Observation (optional)"
                    rows="3"
                  />
                </div>
                <div v-if="test.testStructure.userTasks[taskIndex].postQuestion" class="mt-6">
                  <p class="text-h6 font-weight-medium">
                    {{ test.testStructure.userTasks[taskIndex].postQuestion }}
                  </p>
                  <v-text-field
                    v-model="localTestAnswer.tasks[taskIndex].postAnswer"
                    class="mt-2"
                    :placeholder="test.testStructure.userTasks[taskIndex].postQuestion"
                    variant="outlined"
                    density="comfortable"
                  />
                </div>
                <div v-if="test.testStructure.userTasks[taskIndex].postForm" class="mt-6">
                  <p class="text-h6 font-weight-medium mb-4">
                    Post Form
                  </p>
                  <iframe
                    :src="test.testStructure.userTasks[taskIndex].postForm"
                    title="loading"
                    width="100%"
                    height="500"
                    frameborder="0"
                    marginheight="0"
                    marginwidth="0"
                    class="rounded-lg"
                  >Loading...</iframe>
                </div>
                <SusForm
                  v-if="test.testStructure.userTasks[taskIndex].taskType === 'sus'"
                  :sus-answers="localTestAnswer.tasks[taskIndex].susAnswers"
                  @update-answer="({ index, value }) => localTestAnswer.tasks[taskIndex].susAnswers[index] = value"
                />
                <nasaTlxForm
                  v-if="test.testStructure.userTasks[taskIndex].taskType === 'nasa-tlx'"
                  :nasa-tlx="localTestAnswer.tasks[taskIndex].nasaTlxAnswers"
                  @update:nasaTlx="val => { Object.assign(localTestAnswer.tasks[taskIndex].nasaTlxAnswers, val); }"
                />
                <v-row justify="space-between">
                  <v-col>
                    <v-btn
                      color="error"
                      block
                      variant="outlined"
                      class="mr-2"
                      @click="completeStep(taskIndex, 'tasks', false); callTimerSave()"
                    >
                      {{ $t('buttons.couldNotFinish') }}
                    </v-btn>
                  </v-col>
                  <v-col>
                    <v-btn
                      color="primary"
                      block
                      variant="flat"
                      class="ml-2"
                      :disabled="doneTaskDisabled"
                      @click="completeStep(taskIndex, 'tasks', true); callTimerSave()"
                    >
                      {{ $t('UserTestView.buttons.done') }}
                    </v-btn>
                  </v-col>
                </v-row>
                <video v-if="videoUrl === ''" id="vpreview" class="d-none" autoplay />
              </div>
            </template>
          </ShowInfo>

          <ShowInfo v-if="index === 2 && (!localTestAnswer.postTestCompleted || localTestAnswer.submitted)" title="Post Test">
            <template #content>
              <div class="test-content pa-4 rounded-xl">
                <v-row>
                  <v-col cols="12" class="text-center">
                    <h2 class="text-h5 font-weight-bold mb-8 text-secondary">
                      {{ test.testTitle }} - {{ $t('UserTestView.titles.postTest') }}
                    </h2>
                  </v-col>
                </v-row>
                <div v-for="(item, i) in test.testStructure.postTest" :key="i" class="mb-6">
                  <v-col cols="12" class="py-0">
                    <span class="text-subtitle-1 font-weight-bold text-secondary">{{ item.title }}</span>
                    <br>
                    <span v-if="item.description" class="text-body-2 text-grey-darken-1">{{ item.description }}</span>
                    <v-text-field
                      v-if="item.textField"
                      v-model="localTestAnswer.postTestAnswer[i].answer"
                      :disabled="localTestAnswer.postTestCompleted"
                      :placeholder="item.title"
                      variant="outlined"
                      density="comfortable"
                      class="mt-2"
                    />
                    <v-radio-group
                      v-if="item.selectionField"
                      v-model="localTestAnswer.postTestAnswer[i].answer"
                      :disabled="localTestAnswer.postTestCompleted"
                      class="mt-2"
                    >
                      <v-radio
                        v-for="(selection, j) in item.selectionFields"
                        :key="j"
                        :label="selection"
                        :value="selection"
                        :disabled="localTestAnswer.postTestCompleted"
                        density="compact"
                      />
                    </v-radio-group>
                  </v-col>
                </div>
                <v-row justify="center" class="mt-4">
                  <v-col cols="12" md="6">
                    <v-btn
                      block
                      color="primary"
                      variant="flat"
                      :disabled="localTestAnswer.postTestCompleted"
                      @click="completeStep(taskIndex, 'postTest'); taskIndex = 3"
                    >
                      {{ $t('UserTestView.buttons.done') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </template>
          </ShowInfo>

          <ShowInfo v-if="index === 2 && localTestAnswer.postTestCompleted && !localTestAnswer.submitted" :title="$t('finishTest.title')">
            <template #content>
              <div class="test-content pa-6 rounded-xl text-center">
                <v-icon size="96" color="success">mdi-check-circle-outline</v-icon>
                <h3 class="text-h5 font-weight-bold mt-4 text-secondary">
                  {{ $t('finishTest.finalMessage') }}!
                </h3>
                <p class="text-body-1 mt-2 text-grey-darken-1">
                  {{ $t('finishTest.congratulations') }}
                </p>
                <v-row justify="center" class="mt-8">
                  <v-col cols="12" md="6">
                    <v-img :src="require('../../../public/finalMessage.svg')" alt="Final test svg" contain />
                  </v-col>
                </v-row>
                <p class="text-body-1 mt-6 text-grey-darken-1">
                  {{ $t('finishTest.submitMessage') }}
                </p>
                <v-btn color="primary" variant="flat" large class="mt-4" @click="dialog = true">
                  <v-icon left>mdi-send</v-icon>
                  {{ $t('buttons.submit') }}
                </v-btn>
              </div>
            </template>
          </ShowInfo>
        </v-col>
      </v-row>
    </v-container>

    <v-btn v-if="showSaveBtn && localTestAnswer && !start" position="fixed" location="bottom right" icon class="ma-4">
      <v-speed-dial v-model="fab" open-on-hover>
        <template #activator="{ props }">
          <v-btn v-model="fab" size="large" color="primary" v-bind="props" icon>
            <v-icon v-if="fab">mdi-close</v-icon>
            <v-icon v-else size="large">mdi-hammer-screwdriver</v-icon>
          </v-btn>
        </template>
        <v-tooltip location="left">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon size="small" color="secondary" @click="saveAnswer">
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </template>
          <span>Save</span>
        </v-tooltip>
        <v-tooltip location="left">
          <template #activator="{ props }">
            <v-btn v-bind="props" :disabled="localTestAnswer && !localTestAnswer.postTestCompleted" class="text-white" icon size="small" color="primary" @click="dialog = true">
              <v-icon>mdi-file-move</v-icon>
            </v-btn>
          </template>
          <span>Submit</span>
        </v-tooltip>
      </v-speed-dial>
    </v-btn>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, reactive, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import ShowInfo from '@/components/organisms/ShowInfo.vue';
import TextClamp from 'vue3-text-clamp';
import Snackbar from '@/components/atoms/Snackbar.vue';
import TipButton from '@/components/atoms/TipButton.vue';
import Timer from '@/components/atoms/Timer.vue';
import AudioRecorder from '@/components/atoms/AudioRecorder.vue';
import AudioVisualizer from '@/components/atoms/AudioVisualizer.vue';
import VideoRecorder from '@/components/atoms/VideoRecorder.vue';
import ScreenRecorder from '@/components/atoms/ScreenRecorder.vue';
import TaskAnswer from '@/models/TaskAnswer';
import UserTask from '@/models/UserTask';
import SusForm from '@/components/atoms/SusForm.vue';
import nasaTlxForm from '@/components/atoms/nasaTlxForm.vue';
import { nanoid } from 'nanoid'

const videoUrl = ref('');
const fullName = ref('');
const logined = ref(null);
const selected = ref(true);
const fromlink = ref(null);
const drawer = ref(true);
const start = ref(true);
const mini = ref(false);
const index = ref(null);
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
const timerComponent = ref(null);

const localTestAnswer = reactive(new TaskAnswer());

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
const cooperators = computed(() => store.getters.cooperators);
const loading = computed(() => store.getters.loading);
const currentImageUrl = computed(() => store.state.Tests.currentImageUrl);
const tasks = computed(() => store.getters.tasks);

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
  if (index.value === 0 && taskIndex.value === 0) return 0; 
  if (index.value === 0 && taskIndex.value === 1) return 1;
  if (index.value === 1) return 2; 
  if (index.value === 2 && !localTestAnswer.postTestCompleted) return 3; 
  if (index.value === 2 && localTestAnswer.postTestCompleted) return 4;
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
    router.push('/testslist');
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
  start.value = !start.value;
};

const callTimerSave = () => {
  if (timerComponent.value && typeof timerComponent.value.stopTimer === 'function') {
    timerComponent.value.stopTimer();
  } else {
    console.warn('Timer component or stopTimer method is not available');
  }
};

const startTimer = () => {
  if (timerComponent.value && typeof timerComponent.value.startTimer === 'function') {
    timerComponent.value.startTimer();
  }
};

const handleTimerStopped = (elapsedTime, taskIndex) => {
  if (localTestAnswer.tasks?.[taskIndex]) {
    localTestAnswer.tasks[taskIndex].taskTime = elapsedTime;
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
    }
    if (type === 'preTest') {
      localTestAnswer.preTestCompleted = true;
      items.value[0].value[id].icon = 'mdi-check-circle-outline';
      if (localTestAnswer.preTestCompleted && localTestAnswer.consentCompleted) {
        items.value[0].icon = 'mdi-check-circle-outline';
      }
      index.value = 1;
      taskIndex.value = 0;
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
        index.value = 2;
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
        items.value[1].value[i].icon = 'mdi-check-circle-outline';
      }
      if (!localTestAnswer.tasks[i]?.completed) {
        allTasksCompleted.value = false;
      }
    }
    if (allTasksCompleted.value) {
      items.value[1].icon = 'mdi-check-circle-outline';
    }
  }

  // POST-TEST
  if (items.value[2] && localTestAnswer.postTestCompleted) {
    items.value[2].icon = 'mdi-check-circle-outline';
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
      currentUserTestAnswer.value = new TaskAnswer();
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
        icon: 'mdi-checkbox-blank-circle-outline',
        value: [
          {
            title: 'Consent',
            icon: 'mdi-checkbox-blank-circle-outline',
            id: 0,
          },
          {
            title: 'Form',
            icon: 'mdi-checkbox-blank-circle-outline',
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
        icon: 'mdi-checkbox-blank-circle-outline',
        value: test.value.testStructure.userTasks.map((task, index) => ({
          title: task.taskName,
          icon: 'mdi-checkbox-blank-circle-outline',
          id: index,
        })),
        id: 1,
      });
      if (!localTestAnswer.tasks.length && Array.isArray(test.value.testStructure.userTasks)) {
        localTestAnswer.tasks = test.value.testStructure.userTasks.map((task, i) => new UserTask({
          taskId: task.id || i,
          taskAnswer: '',
          taskObservations: '',
          postAnswer: '',
          taskTime: 0,
          completed: false,
        }));
      }
    }

    // PostTest
    if (validate(test.value?.testStructure?.postTest)) {
      items.value.push({
        title: 'Post Test',
        icon: 'mdi-checkbox-blank-circle-outline',
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
    if (items.value.length && index.value === null) {
      index.value = items.value[0].id;
      if (items.value.find((obj) => obj.id === 0)) {
        preTestIndex.value = items.value[0].value[0].id;
      }
    }
  },
  { deep: true }
);

watch(
  () => taskIndex.value,
  () => {
    if (rightView.value) {
      rightView.value.scrollTop = 0;
    }
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
  await mappingSteps();
  await nextTick();
  if (user.value) {
    await setTest();
    await autoComplete();
    calculateProgress();
  }
});

onBeforeUnmount(() => {
  if (videoRecorder.value && typeof videoRecorder.value.stopRecording === 'function') {
    videoRecorder.value.stopRecording();
  }
});
</script>

<style scoped>
/*
  Colors:
  - Primary: #3f51b5 (Indigo, a more professional alternative to orange)
  - Secondary: #546e7a (Blue Grey)
  - Success: #4caf50
  - Error: #f44336
  - Background: #f5f7fa (Light Grey Blue)
  - White: #ffffff
*/

.start-screen {
  background: linear-gradient(135deg, #3f51b5 0%, #303f9f 100%);
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.start-screen::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url(../../assets/BackgroundTestView.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right top;
  opacity: 0.2;
}

.main-test-interface {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.right-view {
  overflow-y: auto;
  max-height: 100vh;
  padding: 24px;
}

.test-content {
  background-color: #ffffff;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

.right-view::-webkit-scrollbar {
  width: 8px;
}

.right-view::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.right-view::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 4px;
}

.right-view::-webkit-scrollbar-thumb:hover {
  background: #9e9e9e;
}

.rich-text {
  font-size: 16px;
  line-height: 1.6;
  color: #455a64;
}

/* Custom Vuetify Overrides */
.v-dialog .v-card {
  border-radius: 12px;
}

.v-btn.v-btn--rounded {
  border-radius: 50px;
}

.v-radio .v-label {
  font-size: 16px;
  color: #546e7a;
}

/* Helper classes */
.text-primary { color: #3f51b5 !important; }
.text-secondary { color: #546e7a !important; }
.bg-primary { background-color: #3f51b5 !important; }
.bg-error { background-color: #f44336 !important; }

/* Stepper styles */
.stepper-row {
  margin: 0;
  padding: 0;
}

.v-stepper-header {
  box-shadow: none !important;
}

.v-stepper-item {
  padding: 16px;
}

.v-stepper-item__content {
  display: none;
}

.v-stepper-item--complete .v-stepper-item__content {
  display: flex;
}
</style>