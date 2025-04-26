<template>
  <div v-if="test">
    <!-- Loading Overlay -->
    <v-overlay v-model="isLoading" class="text-center">
      <v-progress-circular indeterminate color="#fca326" size="50" />
      <div class="white-text mt-3">Saving...</div>
    </v-overlay>
    <Snackbar />

    <!-- Submit Alert Dialog -->
    <v-dialog v-model="dialog" width="600" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-error text-white">
          {{ $t('HeuristicsTestView.messages.submitTest') }}
        </v-card-title>
        <v-card-text class="mt-5">
          {{ $t('HeuristicsTestView.messages.submitOnce') }}
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn class="bg-grey-lighten-3" variant="text" @click="dialog = false">
            {{ $t('buttons.cancel') }}
          </v-btn>
          <v-btn class="bg-red text-white ml-1" variant="text" @click="handleSubmit">
            {{ $t('buttons.submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- User Login Dialog -->
    <v-dialog :model-value="fromlink && !noExistUser && !logined" width="500" persistent>
      <v-card v-if="user">
        <v-row class="ma-0 pa-0 pt-5" justify="center">
          <v-avatar class="justify-center" color="orange-lighten-4" size="150">
            <v-icon size="120">mdi-account</v-icon>
          </v-avatar>
        </v-row>
        <v-card-actions class="justify-center mt-4">
          <v-btn color="#F9A826" class="text-white" @click="setTest">
            Continue as {{ user.email }}
          </v-btn>
        </v-card-actions>
        <v-card-actions class="justify-center mt-4">
          <p>
            Not {{ user.email }}?
            <a style="color: #f9a826" @click="signOut">Change account</a>
          </p>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Start Screen -->
    <v-row v-if="test && start" class="background background-img pa-0 ma-0" align="center">
      <v-col cols="6" class="ml-5">
        <h1 class="titleView pb-1">{{ test.testTitle }}</h1>
        <p align="justify" class="description">{{ test.testDescription }}</p>
        <v-row justify="center">
          <v-btn color="white" variant="outlined" rounded @click="startTest">Start Test</v-btn>
        </v-row>
      </v-col>
    </v-row>

    <!-- Main Test Interface -->
    <v-row v-else class="nav pa-0 ma-0" dense>
      <!-- Floating Action Button -->
      <v-speed-dial
        v-if="showSaveBtn"
        v-model="fab"
        fixed
        class="mr-3"
        bottom
        right
        open-on-hover
      >
        <template #activator>
          <v-btn v-model="fab" size="large" color="#F9A826" icon class="btn-fix">
            <v-icon v-if="fab">mdi-close</v-icon>
            <v-icon v-else size="large">mdi-hammer-screwdriver</v-icon>
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
            <v-btn
              v-bind="props"
              :disabled="currentUserTestAnswer && !currentUserTestAnswer.postTestCompleted"
              class="text-white"
              icon
              size="small"
              color="#F9A826"
              @click="dialog = true"
            >
              <v-icon>mdi-file-move</v-icon>
            </v-btn>
          </template>
          <span>Submit</span>
        </v-tooltip>
      </v-speed-dial>

      <!-- Navigation Drawer -->
      <v-navigation-drawer v-model="drawer" :rail="mini" permanent color="#3F3D56">
        <div v-if="!mini" class="header">
          <v-list-item>
            <v-row dense align="center" justify="space-around">
              <v-col class="pa-0 ma-0" cols="8">
                <text-clamp class="titleText" :text="test.testTitle" :max-lines="2" />
              </v-col>
              <v-col>
                <v-progress-circular
                  rotate="-90"
                  :model-value="calculateProgress()"
                  color="#fca326"
                  :size="50"
                  class="mt-2"
                >
                  {{ calculateProgress() }}%
                </v-progress-circular>
              </v-col>
            </v-row>
          </v-list-item>
        </div>

        <v-list
          class="nav-list"
          density="compact"
          max-height="85%"
          style="overflow-y: auto; overflow-x: hidden; padding-bottom: 100px"
        >
          <div v-for="item in items" :key="item.id">
            <!-- Pre Test -->
            <v-list-group
              v-if="item.id === 0"
              :class="{ 'disabled-group': currentUserTestAnswer.consentCompleted && currentUserTestAnswer.preTestCompleted && !currentUserTestAnswer.submitted }"
              :value="index === 0"
              @click="index = item.id"
            >
              <template #appendIcon>
                <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">mdi-chevron-down</v-icon>
              </template>
              <template #activator="{ props }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                      {{ currentUserTestAnswer.consentCompleted && currentUserTestAnswer.preTestCompleted && !currentUserTestAnswer.submitted ? 'mdi-lock' : item.icon }}
                    </v-icon>
                  </template>
                  <v-list-item-title :style="index === item.id ? 'color: white' : 'color:#fca326'">
                    {{ item.title }}
                  </v-list-item-title>
                </v-list-item>
              </template>
              <v-tooltip v-for="(task, i) in item.value" :key="i" location="right">
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    link
                    :disabled="isPreTestTaskDisabled(i)"
                    @click="taskIndex = i"
                  >
                    <template #prepend>
                      <v-icon :color="taskIndex === i ? '#ffffff' : '#fca326'">
                        {{ isPreTestTaskDisabled(i) ? 'mdi-lock' : task.icon }}
                      </v-icon>
                    </template>
                    <v-list-item-title :style="taskIndex === i ? 'color: white' : 'color:#fca326'">
                      {{ task.title }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ task.title }}</span>
              </v-tooltip>
            </v-list-group>

            <!-- Tasks -->
            <v-list-group
              v-if="item.id === 1"
              :class="{ 'disabled-group': !currentUserTestAnswer.consentCompleted || !currentUserTestAnswer.preTestCompleted }"
              :value="index === 1"
              @click="index = item.id"
            >
              <template #appendIcon>
                <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">mdi-chevron-down</v-icon>
              </template>
              <template #activator="{ props }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                      {{ (!currentUserTestAnswer.consentCompleted || !currentUserTestAnswer.preTestCompleted) ? 'mdi-lock' : item.icon }}
                    </v-icon>
                  </template>
                  <v-list-item-title :style="index === item.id ? 'color: white' : 'color:#fca326'">
                    {{ item.title }}
                  </v-list-item-title>
                </v-list-item>
              </template>
              <v-tooltip v-for="(task, i) in item.value" :key="i" location="right">
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    link
                    :disabled="isTaskDisabled(i)"
                    @click="taskIndex = i; startTimer()"
                  >
                    <template #prepend>
                      <v-icon :color="taskIndex === i ? '#ffffff' : '#fca326'">
                        {{ isTaskDisabled(i) ? 'mdi-lock' : task.icon }}
                      </v-icon>
                    </template>
                    <v-list-item-title :style="taskIndex === i ? 'color: white' : 'color:#fca326'">
                      {{ task.title }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <span>{{ task.title }}</span>
              </v-tooltip>
            </v-list-group>

            <!-- Post Test -->
            <v-list-item v-if="item.id === 2" :disabled="!allTasksCompleted" @click="index = item.id">
              <template #prepend>
                <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                  {{ !allTasksCompleted ? 'mdi-lock' : item.icon }}
                </v-icon>
              </template>
              <v-list-item-title :style="index === item.id ? 'color: white' : 'color:#fca326'">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </div>
        </v-list>

        <div class="footer">
          <v-spacer />
          <v-btn icon class="mr-2" @click.stop="mini = !mini">
            <v-icon v-if="mini" color="white">mdi-chevron-right</v-icon>
            <v-icon v-else color="white">mdi-chevron-left</v-icon>
          </v-btn>
        </div>
      </v-navigation-drawer>

      <!-- Right View -->
      <v-col ref="rightView" class="backgroundTest pa-0 ma-0 right-view">
        <!-- Consent -->
        <ShowInfo v-if="index === 0 && taskIndex === 0" :title="$t('UserTestView.titles.preTestConsent')">
          <template #content>
            <v-row class="fill-height" align="center" justify="center">
              <v-col cols="12">
                <v-row justify="center">
                  <h1 style="color: #455a64;" class="mt-6">
                    {{ test.testTitle }} - {{ $t('UserTestView.titles.preTest') }}
                  </h1>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="my-8" />
            <v-row>
              <v-col cols="5" class="mx-auto py-0">
                <v-checkbox
                  v-model="currentUserTestAnswer.consentCompleted"
                  :label="currentUserTestAnswer.consent"
                  :disabled="currentUserTestAnswer.consentCompleted"
                  @click="completeStep(taskIndex, 'consent'); taskIndex = 1"
                />
              </v-col>
            </v-row>
          </template>
        </ShowInfo>

        <!-- Pre Test Form -->
        <ShowInfo v-if="index === 0 && taskIndex === 1" :title="$t('UserTestView.titles.preTestForm')">
          <template #content>
            <v-row class="fill-height" align="center" justify="center">
              <v-col cols="12">
                <v-row justify="center">
                  <h1 style="color: #455a64;" class="mt-6">
                    {{ test.testTitle }} - {{ $t('UserTestView.titles.preTest') }}
                  </h1>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="my-8" />
            <v-row v-for="(item, i) in test.testStructure.preTest" :key="i">
              <v-col cols="5" class="mx-auto py-0">
                <span class="cardsTitle">{{ item.title }}</span>
                <br />
                <span v-if="item.description" class="cardsSubtitle">{{ item.description }}</span>
                <v-text-field
                  v-if="item.textField"
                  v-model="currentUserTestAnswer.preTestAnswer[i].answer"
                  :disabled="currentUserTestAnswer.preTestCompleted"
                  :placeholder="item.title"
                  variant="outlined"
                />
                <v-radio-group
                  v-if="item.selectionField"
                  v-model="currentUserTestAnswer.preTestAnswer[i].answer"
                  :disabled="currentUserTestAnswer.preTestCompleted"
                  direction="vertical"
                >
                  <v-radio
                    v-for="(selection, j) in item.selectionFields"
                    :key="j"
                    :disabled="currentUserTestAnswer.preTestCompleted"
                    class="ml-3 mb-1"
                    :label="selection"
                    :value="selection"
                  />
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row justify="center">
              <v-col class="mx-10">
                <v-btn
                  block
                  color="orange-lighten-1"
                  :disabled="currentUserTestAnswer.preTestCompleted"
                  @click="completeStep(taskIndex, 'preTest'); index = 1; taskIndex = 0"
                >
                  {{ $t('UserTestView.buttons.done') }}
                </v-btn>
              </v-col>
            </v-row>
          </template>
        </ShowInfo>

        <!-- Tasks -->
        <ShowInfo
          v-if="index === 1 && test.testType === 'User'"
          :title="test.testStructure.userTasks[taskIndex].taskName"
        >
          <template #content>
            <v-divider class="mb-5" />
            <v-container>
              <v-row class="fill-height" align="center" justify="center">
                <v-col cols="12" class="mb-0 pb-0">
                  <v-row justify="center">
                    <h1 style="color: #455a64;" class="mt-2">
                      {{ test.testStructure.userTasks[taskIndex].taskName }}
                    </h1>
                  </v-row>
                  <v-row justify="center">
                    <p class="paragraph" style="color: #455a64;">
                      {{ test.testStructure.userTasks[taskIndex].taskDescription }}
                    </p>
                  </v-row>
                  <v-row justify="center" v-if="test.testStructure.userTasks[taskIndex].taskLink">
                    <a :href="test.testStructure.userTasks[taskIndex].taskLink" target="_blank"
                      v-if="test.testStructure.userTasks[taskIndex].taskLink">
                      <span style="color: #455a64; cursor: pointer;">{{ test.testStructure.userTasks[taskIndex].taskLink
                      }}</span>
                    </a>
                  </v-row>
                  <div v-if="!localTestAnswer.submitted">
                    <v-row>
                      <v-col
                        v-if="test.testStructure.userTasks[taskIndex].taskTip"
                        cols="1"
                        justify="end"
                      >
                        <TipButton :task="test.testStructure.userTasks[taskIndex]" />
                      </v-col>
                      <v-col
                        v-if="test.testStructure.userTasks[taskIndex].hasAudioRecord !== false"
                        cols="1"
                      >
                        <AudioRecorder
                          :test-id="testId"
                          :task-index="taskIndex"
                          @show-loading="isLoading = true"
                          @stop-show-loading="isLoading = false"
                          @recording-started="isVisualizerVisible = $event"
                        />
                      </v-col>
                      <v-col v-if="isVisualizerVisible" cols="1">
                        <AudioVisualizer />
                      </v-col>
                      <v-col
                        v-if="test.testStructure.userTasks[taskIndex].hasCamRecord !== false"
                        cols="1"
                      >
                        <VideoRecorder
                          ref="videoRecorder"
                          :test-id="testId"
                          :task-index="taskIndex"
                          @show-loading="isLoading = true"
                          @stop-show-loading="isLoading = false"
                        />
                      </v-col>
                      <v-col
                        v-if="test.testStructure.userTasks[taskIndex].hasScreenRecord !== false"
                        cols="1"
                      >
                        <ScreenRecorder
                          :test-id="testId"
                          :task-index="taskIndex"
                          @show-loading="isLoading = true"
                          @stop-show-loading="isLoading = false"
                        />
                      </v-col>
                      <v-col cols="4">
                        <Timer
                          ref="timerComponent"
                          :task-index="taskIndex"
                          @timer-stopped="handleTimerStopped"
                        />
                      </v-col>
                    </v-row>
                  </div>
                  <v-row class="paragraph" justify="space-around">
                    <v-col
                      v-if="test.testStructure.userTasks[taskIndex].taskType === 'textArea'"
                      class="mb-0 pb-0"
                    >
                      <v-textarea
                        :id="'id-' + test.testStructure.userTasks[taskIndex].taskName"
                        v-model="currentUserTestAnswer.tasks[taskIndex].taskAnswer"
                        variant="outlined"
                        label="answer"
                      />
                    </v-col>
                    <v-col class="mb-0 pb-0">
                      <v-textarea
                        :id="'id-' + test.testStructure.userTasks[taskIndex].taskName"
                        v-model="currentUserTestAnswer.tasks[taskIndex].taskObservations"
                        variant="outlined"
                        label="observation (optional)"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row v-if="test.testStructure.userTasks[taskIndex].postQuestion" class="fill-height" align="center"
                justify="center">
                <v-col class="text-center">
                  <p class="text-h5">{{ test.testStructure.userTasks[taskIndex].postQuestion }}</p>
                  <v-text-field
                    v-model="currentUserTestAnswer.tasks[taskIndex].postAnswer"
                    class="mx-2"
                    :placeholder="test.testStructure.userTasks[taskIndex].postQuestion"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
              <div class="pa-2 text-end">
                <v-btn
                  block
                  color="orange-lighten-1"
                  @click="completeStep(taskIndex, 'tasks'); callTimerSave()"
                >
                  {{ $t('UserTestView.buttons.done') }}
                </v-btn>
              </div>
            </v-container>
          </template>
        </ShowInfo>

        <!-- Post Test -->
        <ShowInfo
          v-if="index === 2 && (!currentUserTestAnswer.postTestCompleted || currentUserTestAnswer.submitted)"
          title="Post Test"
        >
          <template #content>
            <v-row class="fill-height" align="center" justify="center">
              <v-col cols="12">
                <v-row justify="center">
                  <h1 style="color: #455a64;" class="mt-6">
                    {{ test.testTitle }} - {{ $t('UserTestView.titles.postTest') }}
                  </h1>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="my-8" />
            <v-row v-for="(item, i) in test.testStructure.postTest" :key="i">
              <v-col cols="5" class="mx-auto py-0">
                <span class="cardsTitle">{{ item.title }}</span>
                <br />
                <span v-if="item.description" class="cardsSubtitle">{{ item.description }}</span>
                <v-text-field
                  v-if="item.textField"
                  v-model="currentUserTestAnswer.postTestAnswer[i].answer"
                  :disabled="currentUserTestAnswer.postTestCompleted"
                  :placeholder="item.title"
                  variant="outlined"
                />
                <v-radio-group
                  v-if="item.selectionField"
                  v-model="currentUserTestAnswer.postTestAnswer[i].answer"
                  :disabled="currentUserTestAnswer.postTestCompleted"
                  direction="vertical"
                >
                  <v-radio
                    v-for="(selection, j) in item.selectionFields"
                    :key="j"
                    :disabled="currentUserTestAnswer.postTestCompleted"
                    class="ml-3 mb-1"
                    :label="selection"
                    :value="selection"
                  />
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row justify="center">
              <v-col class="mx-10">
                <v-btn
                  block
                  color="orange-lighten-1"
                  class="mt-3"
                  :disabled="currentUserTestAnswer.postTestCompleted"
                  @click="completeStep(taskIndex, 'postTest'); taskIndex = 3"
                >
                  {{ $t('UserTestView.buttons.done') }}
                </v-btn>
              </v-col>
            </v-row>
          </template>
        </ShowInfo>

        <!-- Test Completion -->
        <ShowInfo
          v-if="index === 2 && currentUserTestAnswer.postTestCompleted && !currentUserTestAnswer.submitted"
          :title="$t('finishTest.title')"
        >
          <template #content>
            <v-row justify="center" class="ma-4">
              <v-col cols="11" class="mt-3">
                <span class="cardsTitle">{{ $t('finishTest.finalMessage') }}!</span>
                <br />
                <span class="cardsSubtitle">{{ $t('finishTest.congratulations') }}</span>
                <v-row justify="center" class="mt-3">
                  <v-col cols="4">
                    <img
                      draggable="false"
                      src="../../../public/finalMessage.svg"
                      alt="Final test svg"
                    />
                  </v-col>
                  <v-col cols="4" class="pt-2 my-8">
                    <span class="cardsSubtitle">{{ $t('finishTest.submitMessage') }}</span>
                    <v-col class="mt-2">
                      <v-btn color="orange" variant="flat" @click="dialog = true">
                        <v-icon class="ma-2">mdi-send</v-icon>{{ $t('buttons.submit') }}
                      </v-btn>
                    </v-col>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </template>
        </ShowInfo>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
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

const videoUrl = ref('');
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

const rightView = ref(null);
const videoRecorder = ref(null);
const timerComponent = ref(null);

const store = useStore();
const router = useRouter();

const test = computed(() => store.getters.test);
const testId = computed(() => store.getters.test.id);
const user = computed(() => {
  if (store.getters.user) setExistUser();
  return store.getters.user;
});
const currentUserTestAnswer = computed(() => store.getters.currentUserTestAnswer);
const showSaveBtn = computed(() => !currentUserTestAnswer.value?.submitted);
const cooperators = computed(() => store.getters.cooperators);
const loading = computed(() => store.getters.loading);
const currentImageUrl = computed(() => store.state.Tests.currentImageUrl);
const tasks = computed(() => store.getters.tasks);

const isTaskDisabled = (taskIndex) => {
  for (let i = 0; i < taskIndex; i++) {
    if (!currentUserTestAnswer.value.tasks[i].completed) {
      return true;
    }
  }
  return false;
};

const isPreTestTaskDisabled = (taskIndex) => {
  if (taskIndex === 0) return false;
  return !currentUserTestAnswer.value.consentCompleted;
};

const saveAnswer = async () => {
  await store.dispatch('saveTestAnswer', {
    data: currentUserTestAnswer.value,
    answerDocId: test.value.answersDocId,
    testType: test.value.testType,
  });
  router.push('/testslist');
};

const submitAnswer = async () => {
  currentUserTestAnswer.value.submitted = true;
  await saveAnswer();
};

const handleSubmit = () => {
  dialog.value = false;
  submitAnswer();
};

const startTest = () => {
  if (test.value.testStructure.length === 0) {
    store.commit('SET_TOAST', { type: 'info', message: "This test don't have any task" });
    router.push(`/managerview/${test.value.id}`);
  }
  start.value = !start.value;
};

const callTimerSave = () => {
  timerComponent.value?.stopTimer();
};

const startTimer = () => {
  timerComponent.value?.startTimer();
};

const handleTimerStopped = (elapsedTime, taskIndex) => {
  currentUserTestAnswer.value.tasks[taskIndex].taskTime = elapsedTime;
};

const completeStep = (id, type) => {
  if (type === 'tasks') {
    currentUserTestAnswer.value.tasks[id].completed = true;
    items.value[1].value[id].icon = 'mdi-check-circle-outline';
    allTasksCompleted.value = true;

    for (let i = 0; i < items.value[1].value.length; i++) {
      if (!currentUserTestAnswer.value.tasks[i].completed) {
        allTasksCompleted.value = false;
        break;
      }
    }
    if (allTasksCompleted.value) {
      items.value[1].icon = 'mdi-check-circle-outline';
    }
    if (taskIndex.value < Object.keys(currentUserTestAnswer.value.tasks).length - 1) {
      taskIndex.value++;
    } else if (taskIndex.value >= Object.keys(currentUserTestAnswer.value.tasks).length - 1) {
      index.value++;
    }
  }
  if (type === 'postTest') {
    currentUserTestAnswer.value.postTestCompleted = true;
    items.value[2].icon = 'mdi-check-circle-outline';
  }
  if (type === 'preTest') {
    currentUserTestAnswer.value.preTestCompleted = true;
    items.value[0].value[id].icon = 'mdi-check-circle-outline';
    if (
      currentUserTestAnswer.value.preTestCompleted &&
      currentUserTestAnswer.value.consentCompleted
    ) {
      items.value[0].icon = 'mdi-check-circle-outline';
    }
  }
  if (type === 'consent') {
    currentUserTestAnswer.value.consentCompleted = true;
    items.value[0].value[id].icon = 'mdi-check-circle-outline';
    if (
      currentUserTestAnswer.value.preTestCompleted &&
      currentUserTestAnswer.value.consentCompleted
    ) {
      items.value[0].icon = 'mdi-check-circle-outline';
    }
  }
  calculateProgress();
};

const autoComplete = async () => {
  if (!currentUserTestAnswer.value || !items.value) return;

  // PRE-TEST
  if (items.value[0]?.value) {
    if (currentUserTestAnswer.value.consentCompleted) {
      items.value[0].value[0].icon = 'mdi-check-circle-outline';
    }
    if (currentUserTestAnswer.value.preTestCompleted && items.value[0].value[1]) {
      items.value[0].value[1].icon = 'mdi-check-circle-outline';
    }
    if (
      currentUserTestAnswer.value.preTestCompleted &&
      currentUserTestAnswer.value.consentCompleted
    ) {
      items.value[0].icon = 'mdi-check-circle-outline';
    }
  }

  // TASKS
  if (items.value[1]?.value) {
    let allTasksCompletedLocal = true;
    for (let i = 0; i < items.value[1].value.length; i++) {
      if (currentUserTestAnswer.value.tasks[i]?.completed) {
        items.value[1].value[i].icon = 'mdi-check-circle-outline';
      }
      if (!currentUserTestAnswer.value.tasks[i]?.completed) {
        allTasksCompletedLocal = false;
      }
    }
    if (allTasksCompletedLocal) {
      items.value[1].icon = 'mdi-check-circle-outline';
    }
  }

  // POST-TEST
  if (items.value[2] && currentUserTestAnswer.value.postTestCompleted) {
    items.value[2].icon = 'mdi-check-circle-outline';
  }
};

const calculateProgress = () => {
  if (!currentUserTestAnswer.value) {
    return 0;
  }

  const totalSteps = 4;
  let completedSteps = 0;

  if (currentUserTestAnswer.value.preTestCompleted) {
    completedSteps++;
  }
  if (currentUserTestAnswer.value.consentCompleted) {
    completedSteps++;
  }

  let tasksCompleted = 0;
  if (items.value[1]?.value) {
    for (let i = 0; i < items.value[1].value.length; i++) {
      if (currentUserTestAnswer.value.tasks[i]?.completed) {
        tasksCompleted++;
      }
    }
    if (tasksCompleted === items.value[1].value.length) {
      completedSteps++;
    }
  }

  if (currentUserTestAnswer.value.postTestCompleted) {
    completedSteps++;
  }

  const progressPercentage = (completedSteps / totalSteps) * 100;
  currentUserTestAnswer.value.progress = progressPercentage;
  return progressPercentage;
};

const setTest = async () => {
  logined.value = true;
  await store.dispatch('getCurrentTestAnswerDoc');
  // Assuming populateWithHeuristicQuestions is defined elsewhere
  // If not, you may need to implement or remove this
  // populateWithHeuristicQuestions();
};

const setExistUser = () => {
  noExistUser.value = false;
};

const signOut = () => {
  // Assuming signOut is defined elsewhere or needs to be implemented
  store.dispatch('signOut');
};

const mappingSteps = async () => {
  items.value = []; // Reset items to avoid stale data

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
          id: 0,
        },
      ],
      id: 0,
    });
  }

  // Tasks
  if (validate(test.value?.testStructure?.userTasks)) {
    items.value.push({
      title: 'Tasks',
      icon: 'mdi-checkbox-blank-circle-outline',
      value: test.value.testStructure.userTasks.map((i) => ({
        title: i.taskName,
        icon: 'mdi-checkbox-blank-circle-outline',
        id: 2,
      })),
      id: 1,
    });
  }

  // PostTest
  if (validate(test.value?.testStructure?.postTest)) {
    items.value.push({
      title: 'Post Test',
      icon: 'mdi-checkbox-blank-circle-outline',
      value: test.value.testStructure.postTest,
      id: 2,
    });
  }
};

const validate = (object) => {
  return object !== null && object !== undefined && object !== '' && Array.isArray(object) && object.length > 0;
};

watch(
  () => test.value,
  async () => {
    await mappingSteps();
  }
);

watch(
  () => items.value,
  () => {
    if (items.value.length) {
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
    await autoComplete(); // Call after mappingSteps and setTest
    calculateProgress();
  }
});

onBeforeUnmount(() => {
  if (videoRecorder.value) {
    videoRecorder.value.stopRecording();
  }
});
</script>

<style scoped>
.disabled-group {
  pointer-events: none;
  background-color: grey;
}

.background {
  background: linear-gradient(134.16deg, #ffab25 -13.6%, #dd8800 117.67%);
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.backgroundTest {
  background-color: #e8eaf2;
  height: 100%;
  overflow: scroll;
}

.background:before {
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
  background-position: right 0px top -20px;
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.titleView {
  font-style: normal;
  font-weight: 300;
  font-size: 60px;
  line-height: 70px;
  display: flex;
  align-items: center;
  color: #ffffff;
}

.description {
  font-style: normal;
  font-weight: 200;
  font-size: 18.1818px;
  line-height: 21px;
  align-items: flex-end;
  color: #ffffff;
}

.nav {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
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

.btn-fix:focus::before {
  opacity: 0 !important;
}

.titleText {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin-left: 15px;
  padding: 10px;
  padding-left: 0px;
  padding-top: 0px;
}
.right-view::-webkit-scrollbar {
  width: 9px;
}
.right-view::-webkit-scrollbar-track {
  background: none;
}
.right-view::-webkit-scrollbar-thumb {
  background: #ffcd86;
  border-radius: 2px;
}
.right-view::-webkit-scrollbar-thumb:hover {
  background: #fca326;
}
.nav-list::-webkit-scrollbar {
  width: 7px;
}
.nav-list::-webkit-scrollbar-track {
  background: none;
}
.nav-list::-webkit-scrollbar-thumb {
  background: #777596;
  border-radius: 4px;
}
.nav-list::-webkit-scrollbar-thumb:hover {
  background: #64618a;
}

.cards {
  border-radius: 20px;
}

.cardsTitle {
  color: #455a64;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.cardsSubtitle {
  color: #455a64;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
</style>