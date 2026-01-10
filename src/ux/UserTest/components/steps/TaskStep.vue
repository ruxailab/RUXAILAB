<template>
  <ShowInfo :title="task?.taskName || taskName">
    <template #content>
      <div class="test-content pa-4 rounded-xl">
        <!-- STAGE 1: Show title and description -->
        <template v-if="stage === 1">
          <div
            class="rich-text mb-4"
            v-html="task?.taskDescription || taskDescription"
          />

          <!-- Task Preview Information -->
          <v-card
            variant="outlined"
            color="secondary"
            class="my-6 mx-auto"
            max-width="1000"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-3">
                <v-icon
                  color="secondary"
                  size="24"
                  class="mr-2"
                >
                  mdi-play-circle-outline
                </v-icon>
                <h3 class="text-h6 font-weight-bold text-secondary">
                  Task Preview
                </h3>
              </div>

              <!-- Recording Information -->
              <template v-if="hasAnyRecording">
                <p class="text-body-1 text-left mb-4 text-grey-darken-3">
                  This task will record the following data during your interaction:
                </p>

                <!-- Recording Features Grid -->
                <div class="recording-features-grid mb-4">
                  <!-- Screen Recording -->
                  <div
                    v-if="task?.hasScreenRecord"
                    class="recording-feature-card"
                  >
                    <div class="feature-icon-container">
                      <v-icon
                        size="48"
                        color="secondary"
                      >
                        mdi-monitor-screenshot
                      </v-icon>
                    </div>
                    <div class="feature-content">
                      <h4 class="text-h6 font-weight-bold text-grey-darken-3 mb-1">
                        Screen Record
                      </h4>
                      <p class="text-body-2 text-grey-darken-3">
                        Captures clicks, scrolling, and interactions to analyze user behavior.
                      </p>
                    </div>
                  </div>

                  <!-- Camera Recording -->
                  <div
                    v-if="task?.hasCamRecord"
                    class="recording-feature-card"
                  >
                    <div class="feature-icon-container">
                      <v-icon
                        size="48"
                        color="secondary"
                      >
                        mdi-camera
                      </v-icon>
                    </div>
                    <div class="feature-content">
                      <h4 class="text-h6 font-weight-bold text-grey-darken-3 mb-1">
                        Camera
                      </h4>
                      <p class="text-body-2 text-grey-darken-3">
                        Records facial expressions and reactions to understand user emotions.
                      </p>
                    </div>
                  </div>

                  <!-- Audio Recording -->
                  <div
                    v-if="task?.hasAudioRecord"
                    class="recording-feature-card"
                  >
                    <div class="feature-icon-container">
                      <v-icon
                        size="48"
                        color="secondary"
                      >
                        mdi-microphone
                      </v-icon>
                    </div>
                    <div class="feature-content">
                      <h4 class="text-h6 font-weight-bold text-grey-darken-3 mb-1">
                        Audio Record
                      </h4>
                      <p class="text-body-2 text-grey-darken-3">
                        Captures verbal feedback and think-aloud protocols during the task.
                      </p>
                    </div>
                  </div>

                  <!-- Eye Tracking -->
                  <div
                    v-if="task?.hasEye"
                    class="recording-feature-card"
                  >
                    <div class="feature-icon-container">
                      <v-icon
                        size="48"
                        color="secondary"
                      >
                        mdi-eye
                      </v-icon>
                    </div>
                    <div class="feature-content">
                      <h4 class="text-h6 font-weight-bold text-grey-darken-3 mb-1">
                        Eye Tracker
                      </h4>
                      <p class="text-body-2 text-grey-darken-3">
                        Tracks visual attention patterns and gaze behavior during the task.
                      </p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Tool Window Information -->
              <template v-if="task?.taskLink || taskLink">
                <v-divider class="my-3" />
                <div class="d-flex align-start mb-2">
                  <v-icon
                    color="secondary"
                    size="20"
                    class="mr-2 mt-1"
                  >
                    mdi-open-in-new
                  </v-icon>
                  <div>
                    <p class="text-body-2 font-weight-medium mb-1">
                      New Window Will Open
                    </p>
                    <p class="text-body-1 text-grey-darken-3 mb-4">
                      When you start the task, a new window will open with the tool you need to use.
                    </p>

                    <p class="text-body-1 text-grey-darken-3">
                      💡 <strong>Tip:</strong> You can switch between tabs or close the new window at any time.
                      The recording will continue until you complete the task.
                    </p>
                  </div>
                </div>
              </template>

              <template v-else>
                <p class="text-body-2 text-grey-darken-1 text-center">
                  This task will be completed within the current interface.
                </p>
              </template>
            </v-card-text>
          </v-card>

          <v-row
            justify="center"
            class="mt-6"
          >
            <v-col cols="auto">
              <v-btn
                color="primary"
                @click="startTask"
              >
                Start task
              </v-btn>
            </v-col>
          </v-row>
        </template>
        <!-- STAGE 2: Task answer -->
        <template v-else-if="stage === 2">
          <!-- Task Description During Execution -->
          <v-card
            variant="outlined"
            color="primary"
            class="mb-4"
          >
            <v-card-text class="pa-3">
              <!-- Two Column Layout -->
              <v-row>
                <!-- Left Column: Task Description -->
                <v-col cols="8">
                  <div class="d-flex align-center mb-3">
                    <v-icon
                      color="primary"
                      size="20"
                      class="mr-2"
                    >
                      mdi-clipboard-text-outline
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-bold text-primary">
                      Task Description
                    </span>
                  </div>
                  <div
                    class="rich-text text-body-1"
                    v-html="task?.taskDescription || taskDescription"
                  />
                </v-col>

                <!-- Right Column: Help & Actions -->
                <v-col cols="4">
                  <v-row>
                    <!-- Help Section -->
                    <v-col
                      v-if="task?.taskTip"
                      cols="6"
                    >
                      <div
                        class="help-section pa-2 text-center rounded h-100"
                        style="background-color: rgba(76, 175, 80, 0.05); border: 1px solid rgba(76, 175, 80, 0.2);"
                      >
                        <div class="d-flex align-center mb-1">
                          <v-icon
                            color="success"
                            size="16"
                            class="mr-1"
                          >
                            mdi-help-circle-outline
                          </v-icon>
                          <span class="text-caption font-weight-medium text-success">
                            Need Help?
                          </span>
                        </div>
                        <p
                          class="text-caption text-grey-darken-3 mb-2"
                          style="font-size: 11px; line-height: 1.3;"
                        >
                          Having trouble? Get helpful guidance to complete this task.
                        </p>
                        <TipButton :task="task" />
                      </div>
                    </v-col>

                    <!-- Reopen Tool Section -->
                    <v-col
                      v-if="task?.taskLink || taskLink"
                      :cols="task?.taskTip ? 6 : 12"
                    >
                      <div
                        class="tool-section pa-2 rounded text-center h-100"
                        style="background-color: rgba(121, 85, 72, 0.05); border: 1px solid rgba(121, 85, 72, 0.2);"
                      >
                        <div class="d-flex align-center mb-1">
                          <v-icon
                            color="secondary"
                            size="16"
                            class="mr-1"
                          >
                            mdi-open-in-new
                          </v-icon>
                          <span class="text-caption font-weight-medium text-secondary">
                            External Tool
                          </span>
                        </div>
                        <p
                          class="text-caption text-grey-darken-3 mb-2"
                          style=" line-height: 1.3;"
                        >
                          Accidentally closed the tool window? Reopen it here.
                        </p>
                        <v-btn
                          color="secondary"
                          variant="outlined"
                          size="small"
                          block
                          prepend-icon="mdi-open-in-new"
                          @click="reopenTool"
                        >
                          Reopen Tool
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-row class="mb-4 d-flex align-center">
            <v-col
              v-if="isVisualizerVisible"
              cols="auto"
            >
              <AudioVisualizer />
            </v-col>
            <v-spacer />
            <v-col cols="auto">
              <Timer
                ref="timerComponent"
                :task-index="taskIndex"
                @timer-stopped="onTimerStopped"
              />
            </v-col>
          </v-row>
          <div class="mt-4">
            <v-textarea
              v-if="task?.taskType === 'text-area' && !submitted"
              :id="'id-' + (task?.taskName || taskName)"
              v-model="localTaskAnswer"
              variant="outlined"
              label="Answer"
              rows="3"
              @update:model-value="onUpdateTaskAnswer"
            />
            <v-textarea
              v-if="!submitted"
              :id="'id-' + (task?.taskName || taskName) + '-obs'"
              v-model="localTaskObservations"
              variant="outlined"
              label="Observation (optional)"
              rows="3"
              @update:model-value="onUpdateTaskObservations"
            />
          </div>
          <v-row justify="space-between">
            <v-col>
              <v-btn
                color="error"
                block
                variant="outlined"
                class="mr-2"
                @click="handleShowPostForm(false)"
              >
                I can not finish the task
              </v-btn>
            </v-col>
            <v-col>
              <v-btn
                color="primary"
                block
                variant="flat"
                class="ml-2"
                @click="handleShowPostForm(true)"
              >
                Task completed
              </v-btn>
            </v-col>
          </v-row>
        </template>
        <!-- STAGE 3:POST-TASK form -->
        <template v-else-if="stage === 3">
          <!-- SUS Form -->
          <div v-if="task?.taskType === 'sus'">
            <SusForm
              v-model="localSusAnswers"
              :task-index="taskIndex"
              @update:model-value="val => emit('update:susAnswers', val)"
            />
          </div>
          
          <!-- NASA-TLX Form -->
          <div v-else-if="task?.taskType === 'nasa-tlx'">
            <nasaTlxForm
              :nasa-tlx="nasaTlxAnswers"
              @update:nasa-tlx="onUpdateNasaTlx"
            />
          </div>
          
          <!-- SART Form -->
          <div v-else-if="task?.taskType === 'sart'">
            <sartForm
              :sart="sartAnswers"
              @update:sart="onUpdateSart"
            />
          </div>
          
          <!-- Other task types -->
          <div v-else>
            <v-alert
              type="info"
              variant="tonal"
              class="mb-4"
            >
              No post-task questionnaire required for this task type.
            </v-alert>
          </div>
          
          <v-row justify="end">
            <v-col cols="12">
              <p
                v-if="task?.taskType === 'sus' && doneTaskDisabled"
                class="text-error mb-4"
              >
                Please answer all questions before continuing.
              </p>
              <v-btn
                color="primary"
                block
                variant="flat"
                class="ml-2" 
                :disabled="shouldDisableFinishButton"
                @click="emitDoneOrCouldNotFinish()"
              >
                Finish task
              </v-btn>
            </v-col>
          </v-row>
        </template>
        <video
          v-if="videoUrl === ''"
          id="vpreview"
          class="d-none"
          autoplay
        />
      </div>

      <AudioRecorder
        v-if="task?.hasAudioRecord"
        ref="audioRecorder"
        :test-id="testId"
        :task-index="taskIndex"
        :remote-stream="remoteStream"
        :should-record-moderator="shouldRecordModerator"
        @show-loading="$emit('show-loading')"
        @stop-show-loading="$emit('stop-show-loading')"
        @recording-started="$emit('recording-started', $event)"
      />

      <ScreenRecorder
        v-if="task?.hasScreenRecord"
        ref="screenRecorder"
        :test-id="testId"
        :task-index="taskIndex"
        @show-loading="$emit('show-loading')"
        @stop-show-loading="$emit('stop-show-loading')"
      />

      <VideoRecorder
        v-if="task?.hasCamRecord"
        ref="videoRecorder"
        :test-id="testId"
        :user-doc-id="userDocId"
        :task-index="taskIndex"
        @show-loading="$emit('show-loading')"
        @stop-show-loading="$emit('stop-show-loading')"
      />
    </template>
  </ShowInfo>
</template>

<script setup>
import { ref, watch, nextTick, computed, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import ShowInfo from '@/shared/components/ShowInfo.vue';
import TipButton from '@/ux/UserTest/components/TipButton.vue';
import AudioRecorder from '@/ux/UserTest/components/AudioRecorder.vue';
import AudioVisualizer from '@/ux/UserTest/components/AudioVisualizer.vue';
import VideoRecorder from '@/ux/UserTest/components/VideoRecorder.vue';
import ScreenRecorder from '@/ux/UserTest/components/ScreenRecorder.vue';
import Timer from '@/ux/UserTest/components/Timer.vue';
import SusForm from '@/ux/UserTest/SusForm.vue';
import nasaTlxForm from '@/ux/UserTest/components/nasaTlxForm.vue';
import sartForm from '@/ux/UserTest/components/sartForm.vue';

const props = defineProps({
  task: Object,
  taskName: String,
  taskDescription: String,
  taskLink: String,
  postQuestion: String,
  postForm: String,
  postAnswer: String,
  taskAnswer: String,
  taskObservations: String,
  susAnswers: Array,
  nasaTlxAnswers: Object,
  sartAnswers: Object,
  testId: String,
  userDocId: String,
  taskIndex: Number,
  submitted: Boolean,
  doneTaskDisabled: Boolean,
  videoUrl: String,
  remoteStream: MediaStream, // props that receive the remote video stream in case of moderated test
  shouldRecordModerator: Boolean // props that indicate whether to record the moderator's video
});
const emit = defineEmits([
  'done',
  'couldNotFinish',
  'update:postAnswer',
  'update:taskAnswer',
  'update:taskObservations',
  'show-loading',
  'stop-show-loading',
  'recording-started',
  'timer-stopped',
  'update:susAnswers',
  'update:nasaTlxAnswers',
  'update:sartAnswers'
]);

onBeforeUnmount(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
});
const store = useStore();

const susAnswersFromStore = computed(() => {
  return store.state.tasks?.[props.taskIndex]?.susAnswers || [];
});

const localSusAnswers = computed({
  get: () => props.susAnswers || [],
  set: (val) => emit('update:susAnswers', val)
});

const VALIDATION_REQUIRED_TYPES = ['sus']; // Only SUS requires validation for now

const shouldDisableFinishButton = computed(() => {
  const taskType = props.task?.taskType;
  
  // If this task type requires validation, use doneTaskDisabled
  if (VALIDATION_REQUIRED_TYPES.includes(taskType)) {
    return props.doneTaskDisabled;
  }
  
  // For all other task types, no validation needed
  return false;
});

const localSartAnswers = ref(props.sartAnswers || {});

function onUpdateSart(val) {
  localSartAnswers.value = val;
  emit('update:sartAnswers', val);
}

const rawLink = computed(() => props.task?.taskLink || props.taskLink);
const normalizedLink = computed(() => {
  const link = rawLink.value || '';
  return link.match(/^https?:\/\//i) ? link : `https://${link}`;
});

const hasAnyRecording = computed(() => {
  return props.task?.hasScreenRecord ||
    props.task?.hasCamRecord ||
    props.task?.hasAudioRecord ||
    props.task?.hasEye;
});

const stage = ref(1);
const audioRecorder = ref(null);
const videoRecorder = ref(null);
const screenRecorder = ref(null);
const elapsedTimeDisplay = ref('0:00');
let taskStartTime = null;
let timerInterval = null;

function updateElapsedTime() {
  if (!taskStartTime) return;
  const elapsed = Math.floor((Date.now() - taskStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  elapsedTimeDisplay.value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function startTask() {

  await startMediaRecorders();
  stage.value = 2;
  taskStartTime = Date.now();
  timerInterval = setInterval(updateElapsedTime, 1000);
  nextTick(() => {
    const link = props.task?.taskLink || props.taskLink;
    if (link) {
      const url = link.startsWith('http://') || link.startsWith('https://')
        ? link
        : `https://${link}`;
      window.open(url, '_blank');
    }
    setTimeout(() => {
      const timer = document.querySelector('[ref=timerComponent]');
      if (timer && timer.startTimer) timer.startTimer();
    }, 100);
  });
}

function reopenTool() {
  const link = props.task?.taskLink || props.taskLink;
  if (link) {
    const url = link.startsWith('http://') || link.startsWith('https://')
      ? link
      : `https://${link}`;
    window.open(url, '_blank');
  }
}

const showPostForm = ref({ userCompleted: undefined });

function stopMediaRecorders() {
  if (props.task?.hasAudioRecord && audioRecorder.value) {
    audioRecorder.value.stopAudioRecording();
  }
  if (props.task?.hasCamRecord && videoRecorder.value) {
    videoRecorder.value.stopRecording();
  }
  if (props.task?.hasScreenRecord && screenRecorder.value) {
    screenRecorder.value.stopRecording();
  }
}

async function startMediaRecorders() {
  if (props.task?.hasAudioRecord && audioRecorder.value) {
    await audioRecorder.value.startAudioRecording();
  }
  if (props.task?.hasCamRecord && videoRecorder.value) {
    await videoRecorder.value.startRecording();
  }
  if (props.task?.hasScreenRecord && screenRecorder.value) {
    await screenRecorder.value.captureScreen();
  }
}

function handleShowPostForm(userCompleted) {
  stopMediaRecorders();
  console.log('Stopping media recorders...');

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  let finalTime = null;
  if (taskStartTime) {
    finalTime = Math.round((Date.now() - taskStartTime));
    console.log('Tiempo detenido en:', finalTime, 'segundos');
    emit('timer-stopped', finalTime, props.taskIndex);
  }

  showPostForm.value.userCompleted = userCompleted;

  // Only show post-task form for specific task types
  if (['sus', 'nasa-tlx', 'sart'].includes(props.task?.taskType)) {
    stage.value = 3;
  } else {
    emitDoneOrCouldNotFinish(finalTime);
  }
}

function emitDoneOrCouldNotFinish(savedTime) {
  console.log('--------')
  console.log(showPostForm.value)
  console.log('--------')

  if (showPostForm.value.userCompleted) {
    emit('done', savedTime, props.taskIndex);
  } else {
    emit('couldNotFinish', savedTime, props.taskIndex);
  }

  // Reset state for next task
  showPostForm.value = { userCompleted: undefined };
  taskStartTime = null;
  elapsedTimeDisplay.value = '0:00';

  // Reset stage after a small delay to allow parent to handle the transition
  nextTick(() => {
    stage.value = 1;
  });
}

const localPostAnswer = ref(props.postAnswer);
const localTaskAnswer = ref(props.taskAnswer);
const localTaskObservations = ref(props.taskObservations);
const isVisualizerVisible = ref(false);

watch(() => props.postAnswer, val => { localPostAnswer.value = val; });
watch(() => props.taskAnswer, val => { localTaskAnswer.value = val; });
watch(() => props.taskObservations, val => { localTaskObservations.value = val; });

// Reset stage when taskIndex changes (new task loaded)
watch(() => props.taskIndex, () => {
  stage.value = 1;
  taskStartTime = null;
  elapsedTimeDisplay.value = '0:00';
  showPostForm.value = { userCompleted: undefined };
});

function onUpdateTaskAnswer(val) {
  localTaskAnswer.value = val;
  emit('update:taskAnswer', val);
}
function onUpdateTaskObservations(val) {
  localTaskObservations.value = val;
  emit('update:taskObservations', val);
}
function onUpdateNasaTlx(val) {
  emit('update:nasaTlxAnswers', val);
}
function onTimerStopped(elapsedTime) {
  emit('timer-stopped', elapsedTime, props.taskIndex);
}
</script>

<style scoped>
.recording-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  max-width: 100%;
}

.recording-feature-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-secondary), 0.2);
  border-radius: 12px;
  background: rgba(var(--v-theme-secondary), 0.02);
  transition: all 0.2s ease;
}

.recording-feature-card:hover {
  border-color: rgba(var(--v-theme-secondary), 0.3);
  background: rgba(var(--v-theme-secondary), 0.05);
}

.feature-icon-container {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-secondary), 0.1);
  border-radius: 12px;
}

.feature-content {
  flex: 1;
  min-width: 0;
}

.feature-content h4 {
  margin-bottom: 8px;
}

.feature-content p {
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 768px) {
  .recording-features-grid {
    grid-template-columns: 1fr;
  }

  .recording-feature-card {
    flex-direction: column;
    text-align: center;
  }

  .feature-icon-container {
    align-self: center;
  }
}
</style>
