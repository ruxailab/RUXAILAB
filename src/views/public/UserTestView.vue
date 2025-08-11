<template>
  <div v-if="test">
    <!-- Loading Overlay -->
    <v-overlay v-model="isLoading" class="text-center">
      <v-progress-circular indeterminate color="#fca326" size="50" />
      <div class="white-text mt-3">
        Saving...
      </div>
    </v-overlay>
    -->

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
            <v-icon size="120">
              mdi-account
            </v-icon>
          </v-avatar>
        </v-row>
        <v-card-actions class="justify-center mt-4">
          <v-btn class="text-white bg-orange" @click="setTest">
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

    <v-container class="ma-0 pa-0" width="auto" height="100vh" style="background-color: #e8eaf2;">
      <!-- Start Screen -->
      <v-row v-if="test && start" class="background background-img pa-0 ma-0" align="center">
        <v-col cols="6" class="ml-5">
          <h1 class="titleView pb-1">
            {{ test.testTitle }}
          </h1>
          <p align="justify" class="description">
            {{ test.testDescription }}
          </p>
          <v-row justify="center">
            <v-btn color="white" variant="outlined" rounded @click="startTest">
              Start Test
            </v-btn>
          </v-row>
        </v-col>
      </v-row>

      <!-- Main Test Interface -->
      <v-row v-else class="pa-0 ma-0" dense>
        <!-- Navigation Drawer -->
        <v-navigation-drawer v-model="drawer" :rail="mini" permanent color="#3F3D56">
          <div v-if="!mini" class="header">
            <v-list-item>
              <v-row dense align="center" justify="space-around">
                <v-col class="pa-0 ma-0" cols="8">
                  <text-clamp class="titleText" :text="test.testTitle" :max-lines="2" />
                </v-col>
                <v-col>
                  <v-progress-circular rotate="-90" :model-value="calculateProgress()" color="#fca326" :size="50"
                    class="mt-2">
                    {{ calculateProgress() }}%
                  </v-progress-circular>
                </v-col>
              </v-row>
            </v-list-item>
          </div>

          <v-list class="nav-list" density="compact" max-height="85%"
            style="overflow-y: auto; overflow-x: hidden; padding-bottom: 100px">
            <div v-for="item in items" :key="item.id">
              <!-- Pre Test -->
              <v-list-group v-if="item.id === 0"
                :class="{ 'disabled-group': localTestAnswer.consentCompleted && localTestAnswer.preTestCompleted && !localTestAnswer.submitted }"
                :value="index === 0" @click="index = item.id">
                <template #appendIcon>
                  <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                    mdi-chevron-down
                  </v-icon>
                </template>
                <template #activator="{ props }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                        {{ localTestAnswer.consentCompleted && localTestAnswer.preTestCompleted &&
                          !localTestAnswer.submitted ? 'mdi-lock' : item.icon }}
                      </v-icon>
                    </template>
                    <v-list-item-title :style="index === item.id ? 'color: white' : 'color:#fca326'">
                      {{ item.title }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <v-tooltip v-for="(task, i) in item.value" :key="i" location="right">
                  <template #activator="{ props }">
                    <v-list-item v-bind="props" link :disabled="isPreTestTaskDisabled(i)"
                      :class="{ 'disabled-group': isPreTestTaskDisabled(i) }" @click="taskIndex = i">
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
              <v-list-group v-if="item.id === 1"
                :class="{ 'disabled-group': !localTestAnswer.consentCompleted || !localTestAnswer.preTestCompleted || (allTasksCompleted && !localTestAnswer.submitted) }"
                :value="index === 1" @click="index = item.id">
                <template #appendIcon>
                  <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                    mdi-chevron-down
                  </v-icon>
                </template>
                <template #activator="{ props }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                        {{ (!localTestAnswer.consentCompleted || !localTestAnswer.preTestCompleted || (allTasksCompleted
                          && !localTestAnswer.submitted)) ? 'mdi-lock' : item.icon }}
                      </v-icon>
                    </template>
                    <v-list-item-title :style="index === item.id ? 'color: white' : 'color:#fca326'">
                      {{ item.title }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
                <v-tooltip v-for="(task, i) in item.value" :key="i" location="right">
                  <template #activator="{ props }">
                    <v-list-item v-bind="props" link :disabled="isTaskDisabled(i) && !localTestAnswer.submitted"
                      :class="{ 'disabled-group': isTaskDisabled(i) && !localTestAnswer.submitted }"
                      @click="taskIndex = i; startTimer()">
                      <template #prepend>
                        <v-icon :color="taskIndex === i ? '#ffffff' : '#fca326'">
                          {{ isTaskDisabled(i) && !localTestAnswer.submitted ? 'mdi-lock' : task.icon }}
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
              <v-list-item v-if="item.id === 2" :disabled="!allTasksCompleted && !localTestAnswer.submitted"
                :class="{ 'disabled-group': !allTasksCompleted && !localTestAnswer.submitted }"
                @click="index = item.id">
                <template #prepend>
                  <v-icon :color="index === item.id ? '#ffffff' : '#fca326'">
                    {{ !allTasksCompleted && !localTestAnswer.submitted ? 'mdi-lock' : item.icon }}
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
            <v-btn icon class="mr-2 bg-orange" @click.stop="mini = !mini">
              <v-icon v-if="mini" color="white" icon="mdi-chevron-right" />
              <v-icon v-else color="white" icon="mdi-chevron-left" />
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
                <v-col cols="8" class="mx-auto py-0">
                  <div class="rich-text mb-6" v-html="test.testStructure.consent" />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6" class="mx-auto">
                  <v-text-field v-model="fullName" label="Full Name" variant="outlined" density="compact"
                    :rules="[v => !!v || 'Name is required']" />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6" class="mx-auto">
                  <v-radio-group v-model="localTestAnswer.consentCompleted" direction="horizontal">
                    <v-radio label="I accept the consent terms" :value="true" :disabled="!fullName" />
                    <v-radio label="I do not accept the consent terms" :value="false" />
                  </v-radio-group>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6" class="mx-auto text-center">
                  <v-btn color="primary" :disabled="!localTestAnswer.consentCompleted || !fullName"
                    @click="completeStep(taskIndex, 'consent'); taskIndex = 1">
                    Continue
                  </v-btn>
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
                  <br>
                  <span v-if="item.description" class="cardsSubtitle">{{ item.description }}</span>
                  <v-text-field v-if="item.textField" v-model="localTestAnswer.preTestAnswer[i].answer"
                    :disabled="localTestAnswer.preTestCompleted" :placeholder="item.title" variant="outlined" />
                  <v-radio-group v-if="item.selectionField" v-model="localTestAnswer.preTestAnswer[i].answer"
                    :disabled="localTestAnswer.preTestCompleted" direction="vertical">
                    <v-radio v-for="(selection, j) in item.selectionFields" :key="j" :label="selection"
                      :value="selection" :disabled="localTestAnswer.preTestCompleted" class="ml-3 mb-1" />
                  </v-radio-group>
                </v-col>
              </v-row>
              <v-row justify="center" class="pb-4">
                <v-col class="mx-10">
                  <v-btn block color="orange-lighten-1" :disabled="localTestAnswer.preTestCompleted"
                    @click="completeStep(taskIndex, 'preTest')">
                    {{ $t('UserTestView.buttons.done') }}
                  </v-btn>
                </v-col>
              </v-row>
            </template>
          </ShowInfo>

          <!-- Tasks -->
          <ShowInfo v-if="index === 1 && test.testType === 'User'"
            :title="test.testStructure.userTasks[taskIndex].taskName">
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
                      <div class="rich-text mb-6" v-html="test.testStructure.userTasks[taskIndex].taskDescription" />
                    </v-row>
                    <v-row v-if="test.testStructure.userTasks[taskIndex].taskLink" justify="center">
                      <a :href="test.testStructure.userTasks[taskIndex].taskLink" target="_blank"
                        style="color: #455a64; cursor: pointer;">
                        {{ test.testStructure.userTasks[taskIndex].taskLink }}
                      </a>
                    </v-row>
                    <div v-if="!localTestAnswer.submitted">
                      <v-row>
                        <v-col v-if="test.testStructure.userTasks[taskIndex].taskTip" cols="1" justify="end">
                          <TipButton :task="test.testStructure.userTasks[taskIndex]" />
                        </v-col>
                        <v-col v-if="test.testStructure.userTasks[taskIndex].hasAudioRecord !== false" cols="1">
                          <AudioRecorder :test-id="testId" :task-index="taskIndex" @show-loading="isLoading = true"
                            @stop-show-loading="isLoading = false" @recording-started="isVisualizerVisible = $event" />
                        </v-col>
                        <v-col v-if="isVisualizerVisible" cols="1">
                          <AudioVisualizer />
                        </v-col>
                        <v-col v-if="test.testStructure.userTasks[taskIndex].hasCamRecord !== false" cols="1">
                          <VideoRecorder ref="videoRecorder" :test-id="testId" :task-index="taskIndex"
                            @show-loading="isLoading = true" @stop-show-loading="isLoading = false" />
                        </v-col>
                        <v-col v-if="test.testStructure.userTasks[taskIndex].hasScreenRecord !== false" cols="1">
                          <ScreenRecorder :test-id="testId" :task-index="taskIndex" @show-loading="isLoading = true"
                            @stop-show-loading="isLoading = false" />
                        </v-col>
                        <v-col cols="4">
                          <Timer ref="timerComponent" :task-index="taskIndex" @timer-stopped="handleTimerStopped" />
                        </v-col>
                      </v-row>
                    </div>
                    <v-row class="paragraph" justify="space-around">
                      <v-col v-if="test.testStructure.userTasks[taskIndex].taskType === 'text-area'" class="mb-0 pb-0">
                        <v-textarea :id="'id-' + test.testStructure.userTasks[taskIndex].taskName"
                          v-model="localTestAnswer.tasks[taskIndex].taskAnswer" variant="outlined" label="answer" />
                      </v-col>
                      <v-col class="mb-0 pb-0">
                        <v-textarea :id="'id-' + test.testStructure.userTasks[taskIndex].taskName"
                          v-model="localTestAnswer.tasks[taskIndex].taskObservations" variant="outlined"
                          label="observation (optional)" />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row v-if="test.testStructure.userTasks[taskIndex].postQuestion" class="fill-height" align="center"
                  justify="center">
                  <v-col class="text-center">
                    <p class="text-h5">
                      {{ test.testStructure.userTasks[taskIndex].postQuestion }}
                    </p>
                    <v-text-field v-model="localTestAnswer.tasks[taskIndex].postAnswer" class="mx-2"
                      :placeholder="test.testStructure.userTasks[taskIndex].postQuestion" variant="outlined" />
                  </v-col>
                </v-row>
                <v-row v-if="test.testStructure.userTasks[taskIndex].postForm" class="fill-height" align="center"
                  justify="center">
                  <v-col cols="12">
                    <p class="text-h5">
                      Post Form
                    </p>
                    <iframe :src="test.testStructure.userTasks[taskIndex].postForm" title="loading" width="100%"
                      height="500" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>
                  </v-col>
                </v-row>

                <v-row v-if="test.testStructure.userTasks[taskIndex].taskType === 'sus'" class="fill-height"
                  align="center" justify="center">
                  <SusForm :sus-answers="localTestAnswer.tasks[taskIndex].susAnswers"
                    @update-answer="({ index, value }) => localTestAnswer.tasks[taskIndex].susAnswers[index] = value" />
                </v-row>

                <v-row v-if="test.testStructure.userTasks[taskIndex].taskType === 'nasa-tlx'" class="fill-height"
                  align="center" justify="center">
                  <v-col cols="12">
                    <nasaTlxForm v-model:nasa-tlx="localTestAnswer.tasks[taskIndex].nasaTlxAnswers" />
                  </v-col>
                </v-row>

                <div class="pa-2 my-2 text-end">
                  <v-row>
                    <v-col cols="6">
                      <v-btn block color="red-lighten-1"
                        @click="completeStep(taskIndex, 'tasks', false); callTimerSave()">
                        {{ $t('buttons.couldNotFinish') }}
                      </v-btn>
                    </v-col>
                    <v-col cols="6">
                      <v-btn block color="orange-lighten-1" :disabled="doneTaskDisabled"
                        @click="completeStep(taskIndex, 'tasks', true); callTimerSave()">
                        {{ $t('UserTestView.buttons.done') }}
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
                <video v-if="videoUrl === ''" id="vpreview" class="preview" style="max-width: 0px" autoplay />
              </v-container>
            </template>
          </ShowInfo>

          <!-- Post Test -->
          <ShowInfo v-if="index === 2 && (!localTestAnswer.postTestCompleted || localTestAnswer.submitted)"
            title="Post Test">
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
                  <br>
                  <span v-if="item.description" class="cardsSubtitle">{{ item.description }}</span>
                  <v-text-field v-if="item.textField" v-model="localTestAnswer.postTestAnswer[i].answer"
                    :disabled="localTestAnswer.postTestCompleted" :placeholder="item.title" variant="outlined" />
                  <v-radio-group v-if="item.selectionField" v-model="localTestAnswer.postTestAnswer[i].answer"
                    :disabled="localTestAnswer.postTestCompleted" direction="vertical">
                    <v-radio v-for="(selection, j) in item.selectionFields" :key="j" :label="selection"
                      :value="selection" :disabled="localTestAnswer.postTestCompleted" class="ml-3 mb-1" />
                  </v-radio-group>
                </v-col>
              </v-row>
              <v-row justify="center" class="pb-4">
                <v-col class="mx-10">
                  <v-btn block color="orange-lighten-1" class="mt-3" :disabled="localTestAnswer.postTestCompleted"
                    @click="completeStep(taskIndex, 'postTest'); taskIndex = 3">
                    {{ $t('UserTestView.buttons.done') }}
                  </v-btn>
                </v-col>
              </v-row>
            </template>
          </ShowInfo>

          <!-- Test Completion -->
          <ShowInfo v-if="index === 2 && localTestAnswer.postTestCompleted && !localTestAnswer.submitted"
            :title="$t('finishTest.title')">
            <template #content>
              <v-row justify="center" class="ma-4">
                <v-col cols="11" class="mt-3">
                  <span class="cardsTitle">{{ $t('finishTest.finalMessage') }}!</span>
                  <br>
                  <span class="cardsSubtitle">{{ $t('finishTest.congratulations') }}</span>
                  <v-row justify="center" class="mt-3">
                    <v-col cols="4">
                      <img draggable="false" src="../../../public/finalMessage.svg" alt="Final test svg">
                    </v-col>
                    <v-col cols="4" class="pt-2 my-8">
                      <span class="cardsSubtitle">{{ $t('finishTest.submitMessage') }}</span>
                      <v-col class="mt-2">
                        <v-btn color="orange" variant="flat" @click="dialog = true">
                          <v-icon class="ma-2">
                            mdi-send
                          </v-icon>{{ $t('buttons.submit') }}
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


import SubmitDialog from '@/components/atoms/SubmitDialog.vue';

import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, reactive, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Snackbar from '@/components/atoms/Snackbar.vue';
import TaskAnswer from '@/models/TaskAnswer';
import UserTask from '@/models/UserTask';
import { nanoid } from 'nanoid';
import { useDisplay } from 'vuetify';
import WelcomeStep from '@/components/UserTest/steps/WelcomeStep.vue';
import ConsentStep from '@/components/UserTest/steps/ConsentStep.vue';
import PreTestStep from '@/components/UserTest/steps/PreTestStep.vue';
import PreTasksStep from '@/components/UserTest/steps/PreTasksStep.vue';
import TaskStep from '@/components/UserTest/steps/TaskStep.vue';
import PostTestStep from '@/components/UserTest/steps/PostTestStep.vue';
import FinishStep from '@/components/UserTest/steps/FinishStep.vue';



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
  background-image: url(../../assets/ruxailab-small-red.png);
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
