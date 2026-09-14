<template>
  <ShowInfo
    :title="
      stage === 1
        ? t('UserTestView.TaskStep.beforeWeStart')
        : stage === 2
          ? t('UserTestView.TaskStep.taskInformation')
          : task?.taskName || taskName
    "
  >
    <template #content>
      <div class="test-content pa-4 rounded-xl">
        <v-dialog v-model="showScreenSharePrompt" persistent max-width="640">
          <v-card class="pa-4 pa-sm-6" rounded="xl">
            <ScreenShareInstructions
              compact
              :has-external-link="hasExternalLink"
            />
            <v-card-actions class="px-0 pt-5 pb-0">
              <v-btn
                variant="text"
                :disabled="isRequestingScreenShare"
                @click="cancelScreenSharePrompt"
              >
                {{ t('screenShare.backButton') }}
              </v-btn>
              <v-spacer />
              <v-btn
                color="primary"
                variant="flat"
                :loading="isRequestingScreenShare"
                prepend-icon="mdi-monitor-share"
                @click="confirmScreenShare"
              >
                {{ t('screenShare.shareButton') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog
          :model-value="showTaskProgressDialog"
          persistent
          max-width="560"
        >
          <v-card class="pa-6 text-center upload-dialog-card" rounded="xl">
            <div class="d-flex justify-center mb-4">
              <img
                :src="redXLogo"
                alt="RUXAILAB upload spinner"
                class="upload-spinner"
              />
            </div>
            <h3 class="text-h6 font-weight-bold mb-2 text-primary">
              {{ taskProgressDialogTitle }}
            </h3>
            <p class="text-body-1 text-grey-darken-2 mb-0">
              {{ taskProgressDialogMessage }}
            </p>
          </v-card>
        </v-dialog>

        <!-- STAGE 1: Task preview -->
        <template v-if="stage === 1">
          <!-- Task Preview Information -->
          <v-card
            variant="outlined"
            color="secondary"
            bg-color="white"
            class="my-6 mx-auto"
            max-width="1000"
          >
            <v-card-text :class="$vuetify.display.xs ? 'pa-3' : 'pa-4'">
              <div class="d-flex align-center mb-3">
                <v-icon color="secondary" size="24" class="mr-2">
                  mdi-play-circle-outline
                </v-icon>
                <h3 class="text-h6 font-weight-bold text-secondary">
                  {{ t('UserTestView.TaskStep.preview') }}
                </h3>
              </div>

              <!-- Recording Information -->
              <template v-if="hasAnyRecording">
                <p class="text-body-1 text-left mb-4 text-grey-darken-3">
                  {{ t('UserTestView.TaskStep.recordingInfo') }}
                </p>

                <!-- Recording Features Grid -->
                <div class="recording-features-grid mb-4">
                  <!-- Screen Recording -->
                  <div
                    v-if="task?.hasScreenRecord"
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
                        {{ t('UserTestView.TaskStep.screenRecord') }}
                      </h4>
                      <p class="text-body-2 text-grey-darken-3">
                        {{ t('UserTestView.TaskStep.screenRecordDesc') }}
                      </p>
                    </div>
                  </div>

                  <!-- Camera Recording -->
                  <div v-if="task?.hasCamRecord" class="recording-feature-card">
                    <div class="feature-icon-container">
                      <v-icon size="48" color="secondary"> mdi-camera </v-icon>
                    </div>
                    <div class="feature-content">
                      <h4
                        class="text-h6 font-weight-bold text-grey-darken-3 mb-1"
                      >
                        {{ t('UserTestView.TaskStep.camera') }}
                      </h4>
                      <p class="text-body-2 text-grey-darken-3">
                        {{ t('UserTestView.TaskStep.cameraDesc') }}
                      </p>
                    </div>
                  </div>

                  <!-- Audio Recording -->
                  <div
                    v-if="task?.hasAudioRecord"
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
                        {{ t('UserTestView.TaskStep.audioRecord') }}
                      </h4>
                      <p class="text-body-2 text-grey-darken-3">
                        {{ t('UserTestView.TaskStep.audioRecordDesc') }}
                      </p>
                    </div>
                  </div>

                  <!-- Eye Tracking -->
                  <div v-if="task?.hasEye" class="recording-feature-card">
                    <div class="feature-icon-container">
                      <v-icon size="48" color="secondary"> mdi-eye </v-icon>
                    </div>
                    <div class="feature-content">
                      <h4
                        class="text-h6 font-weight-bold text-grey-darken-3 mb-1"
                      >
                        {{ t('UserTestView.TaskStep.eyeTracker') }}
                      </h4>
                      <p class="text-body-2 text-grey-darken-3">
                        {{ t('UserTestView.TaskStep.eyeTrackerDesc') }}
                      </p>
                    </div>
                  </div>
                </div>

                <ScreenShareInstructions
                  v-if="task?.hasScreenRecord"
                  class="mt-4"
                  :has-external-link="hasExternalLink"
                />
              </template>

              <template v-else>
                <p class="text-body-2 text-grey-darken-1 text-center">
                  {{ t('UserTestView.TaskStep.internalInterface') }}
                </p>
              </template>
            </v-card-text>
          </v-card>

          <v-card
            v-if="task?.taskLink || taskLink"
            variant="outlined"
            color="secondary"
            bg-color="white"
            class="my-6 mx-auto"
            max-width="1000"
          >
            <v-card-text :class="$vuetify.display.xs ? 'pa-3' : 'pa-4'">
              <div class="d-flex align-center mb-3">
                <v-icon color="secondary" size="24" class="mr-2">
                  mdi-open-in-new
                </v-icon>
                <h3 class="text-h6 font-weight-bold text-secondary">
                  {{ t('UserTestView.TaskStep.newWindow') }}
                </h3>
              </div>

              <p class="text-body-1 text-grey-darken-3 mb-4">
                {{ t('UserTestView.TaskStep.newWindowDesc') }}
              </p>

              <p class="text-body-1 text-grey-darken-3 mb-0">
                <strong>{{ t('UserTestView.TaskStep.tip') }}:</strong>
                {{ t('UserTestView.TaskStep.tipDesc') }}
              </p>
            </v-card-text>
          </v-card>

          <v-row justify="center" class="mt-6">
            <v-col cols="auto">
              <v-btn color="primary" @click="goToStartTaskStage">
                {{ t('buttons.next') }}
              </v-btn>
            </v-col>
          </v-row>
        </template>

        <!-- STAGE 2: Task title and description -->
        <template v-else-if="stage === 2">
          <h2 class="text-h5 text-primary mb-4 text-left">
            {{ task?.taskName || taskName }}
          </h2>

          <div
            class="rich-text text-body-1 task-description task-information-description text-left"
            v-html="task?.taskDescription || taskDescription"
          />

          <v-row justify="center" class="mt-6">
            <v-col cols="auto">
              <v-btn color="primary" @click="startTask">
                {{ t('UserTestView.TaskStep.startTask') }}
              </v-btn>
            </v-col>
          </v-row>
        </template>

        <!-- STAGE 3: Task answer -->
        <template v-else-if="stage === 3">
          <!-- Task Description During Execution -->
          <v-card variant="outlined" bg-color="white" class="mb-4">
            <v-card-text :class="$vuetify.display.xs ? 'pa-2' : 'pa-3'">
              <!-- Two Column Layout -->
              <v-row>
                <!-- Left Column: Task Description -->
                <v-col cols="12" md="8">
                  <v-card
                    variant="outlined"
                    bg-color="white"
                    class="pa-4 rounded-lg"
                  >
                    <div class="d-flex align-center mb-3">
                      <v-icon color="primary" size="20" class="mr-2">
                        mdi-clipboard-text-outline
                      </v-icon>
                      <span
                        class="text-subtitle-2 font-weight-bold text-primary"
                      >
                        {{ t('UserTestView.TaskStep.description') }}
                      </span>
                    </div>
                    <div
                      class="rich-text text-body-1 task-description"
                      v-html="task?.taskDescription || taskDescription"
                    />
                  </v-card>
                </v-col>

                <!-- Right Column: Help & Actions -->
                <v-col cols="12" md="4">
                  <div v-if="task?.taskLink || taskLink" class="mb-3">
                    <v-card
                      variant="outlined"
                      class="pa-4 rounded-lg text-center bg-white task-action-card"
                      :class="{ 'task-action-card--attention': !hasOpenedTool }"
                    >
                      <div class="d-flex align-center justify-center mb-2">
                        <v-icon color="secondary" size="20" class="mr-2">
                          mdi-open-in-new
                        </v-icon>
                        <span
                          class="text-subtitle-1 font-weight-bold text-secondary"
                        >
                          {{ t('UserTestView.TaskStep.externalTool') }}
                        </span>
                      </div>
                      <p
                        class="text-body-2 text-grey-darken-3 mb-3"
                        style="line-height: 1.5"
                      >
                        {{ t('UserTestView.TaskStep.externalToolDesc') }}
                      </p>
                      <v-btn
                        color="secondary"
                        variant="outlined"
                        size="small"
                        block
                        prepend-icon="mdi-open-in-new"
                        @click="openTool"
                      >
                        {{
                          hasOpenedTool
                            ? t('UserTestView.TaskStep.reopenTool')
                            : t('UserTestView.TaskStep.openTool')
                        }}
                      </v-btn>
                    </v-card>
                  </div>

                  <div v-if="task?.taskTip" class="mb-3">
                    <v-card
                      variant="outlined"
                      class="pa-4 rounded-lg text-center bg-white"
                    >
                      <div class="d-flex align-center justify-center mb-2">
                        <v-icon color="success" size="20" class="mr-2">
                          mdi-help-circle-outline
                        </v-icon>
                        <span
                          class="text-subtitle-1 font-weight-bold text-success"
                        >
                          {{ t('UserTestView.TaskStep.needHelp') }}
                        </span>
                      </div>
                      <p
                        class="text-body-2 text-grey-darken-3 mb-3"
                        style="line-height: 1.5"
                      >
                        {{ t('UserTestView.TaskStep.needHelpDesc') }}
                      </p>
                      <TipButton :task="task" @tip-pressed="onTipPressed" />
                    </v-card>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-row class="mb-4 d-flex align-center">
            <v-col v-if="isVisualizerVisible" cols="auto">
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
          <div class="mt-4 task-answer-block">
            <v-textarea
              v-if="task?.taskType === 'text-area' && !submitted"
              :id="'id-' + (task?.taskName || taskName)"
              v-model="localTaskAnswer"
              class="task-textarea"
              bg-color="white"
              variant="outlined"
              :label="t('UserTestView.TaskStep.answerLabel')"
              rows="3"
              @update:model-value="onUpdateTaskAnswer"
            />
            <v-textarea
              v-if="!submitted"
              :id="'id-' + (task?.taskName || taskName) + '-obs'"
              v-model="localTaskObservations"
              class="task-textarea"
              bg-color="white"
              variant="outlined"
              :label="t('UserTestView.TaskStep.observationLabel')"
              rows="3"
              @update:model-value="onUpdateTaskObservations"
            />
          </div>
          <v-row justify="space-between">
            <v-col cols="12" sm="6">
              <v-btn
                color="error"
                block
                variant="outlined"
                class="mr-2"
                :disabled="isWaitingForUploadToFinish"
                :class="{
                  'mb-3': $vuetify.display.xs,
                  'mr-2': $vuetify.display.smAndUp,
                }"
                @click="handleShowPostForm(false)"
              >
                {{
                  isWaitingForUploadToFinish &&
                  showPostForm.userCompleted === false
                    ? t('UserTestView.TaskStep.uploading')
                    : t('UserTestView.TaskStep.cannotFinish')
                }}
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6">
              <v-btn
                color="primary"
                block
                variant="flat"
                class="ml-2"
                :disabled="isWaitingForUploadToFinish"
                :class="{ 'ml-2': $vuetify.display.smAndUp }"
                @click="handleShowPostForm(true)"
              >
                {{
                  isWaitingForUploadToFinish &&
                  showPostForm.userCompleted === true
                    ? t('UserTestView.TaskStep.uploading')
                    : t('UserTestView.TaskStep.completed')
                }}
              </v-btn>
            </v-col>
          </v-row>
        </template>
        <!-- STAGE 4:POST-TASK form -->
        <template v-else-if="stage === 4">
          <v-card class="mb-4" variant="outlined" bg-color="white">
            <v-card-text class="pa-4">
              <!-- SUS Form -->
              <div v-if="task?.taskType === 'sus'">
                <SusForm
                  v-model="localSusAnswers"
                  :task-index="taskIndex"
                  @update:model-value="(val) => emit('update:susAnswers', val)"
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
                <sartForm :sart="sartAnswers" @update:sart="onUpdateSart" />
              </div>

              <!-- TAM-1 Form -->
              <div v-else-if="task?.taskType === 'tam-1'">
                <TamForm1
                  v-model="localTamAnswers"
                  :task-index="taskIndex"
                  @update:model-value="(val) => emit('update:tamAnswers', val)"
                />
              </div>

              <!-- TAM-2 Form -->
              <div v-else-if="task?.taskType === 'tam-2'">
                <TamForm2
                  v-model="localTamAnswers"
                  :task-index="taskIndex"
                  @update:model-value="(val) => emit('update:tamAnswers', val)"
                />
              </div>

              <!-- TAM-3 Form -->
              <div v-else-if="task?.taskType === 'tam-3'">
                <TamForm3
                  v-model="localTamAnswers"
                  :task-index="taskIndex"
                  @update:model-value="(val) => emit('update:tamAnswers', val)"
                />
              </div>

              <!-- Other task types -->
              <div v-else>
                <v-alert type="info" variant="tonal" class="mb-4">
                  {{ t('UserTestView.TaskStep.noQuestionnaire') }}
                </v-alert>
              </div>
              <v-row justify="end">
                <v-col cols="12">
                  <p
                    v-if="
                      (task?.taskType === 'sus' ||
                        task?.taskType === 'tam-1' ||
                        task?.taskType === 'tam-2' ||
                        task?.taskType === 'tam-3' ||
                        task?.taskType === 'sart' ||
                        task?.taskType === 'nasa-tlx') &&
                      doneTaskDisabled
                    "
                    class="text-error mb-4"
                  >
                    {{ t('UserTestView.TaskStep.validationError') }}
                  </p>
                  <v-btn
                    color="primary"
                    block
                    variant="flat"
                    class="ml-2"
                    :disabled="
                      shouldDisableFinishButton || isWaitingForUploadToFinish
                    "
                    @click="attemptFinish()"
                  >
                    {{
                      isWaitingForUploadToFinish
                        ? t('UserTestView.TaskStep.uploading')
                        : t('UserTestView.TaskStep.finishTask')
                    }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </template>
        <video v-if="videoUrl === ''" id="vpreview" class="d-none" autoplay />
      </div>

      <AudioRecorder
        v-if="task?.hasAudioRecord"
        ref="audioRecorder"
        :test-id="testId"
        :task-index="taskIndex"
        :remote-stream="remoteStream"
        :user-doc-id="userDocId"
        :should-record-moderator="shouldRecordModerator"
        @show-loading="onShowLoading"
        @stop-show-loading="onStopShowLoading"
        @recording-started="$emit('recording-started', $event)"
      />

      <ScreenRecorder
        v-if="task?.hasScreenRecord"
        ref="screenRecorder"
        :test-id="testId"
        :task-index="taskIndex"
        :user-doc-id="userDocId"
        @show-loading="onShowLoading"
        @stop-show-loading="onStopShowLoading"
      />

      <VideoRecorder
        v-if="task?.hasCamRecord"
        ref="videoRecorder"
        :test-id="testId"
        :user-doc-id="userDocId"
        :task-index="taskIndex"
        @show-loading="onShowLoading"
        @stop-show-loading="onStopShowLoading"
      />
    </template>
  </ShowInfo>
</template>

<script setup>
import { ref, watch, nextTick, computed, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import redXLogo from '@/assets/logo_small_red.png'
import ShowInfo from '@/shared/components/ShowInfo.vue'
import TipButton from '@/ux/UserTest/components/TipButton.vue'
import AudioRecorder from '@/ux/UserTest/components/AudioRecorder.vue'
import AudioVisualizer from '@/ux/UserTest/components/AudioVisualizer.vue'
import VideoRecorder from '@/ux/UserTest/components/VideoRecorder.vue'
import ScreenRecorder from '@/ux/UserTest/components/ScreenRecorder.vue'
import ScreenShareInstructions from '@/ux/UserTest/components/ScreenShareInstructions.vue'
import Timer from '@/ux/UserTest/components/Timer.vue'
import SusForm from '@/ux/UserTest/SusForm.vue'
import nasaTlxForm from '@/ux/UserTest/components/nasaTlxForm.vue'
import TamForm1 from '@/ux/UserTest/components/TamForm1.vue'
import TamForm2 from '@/ux/UserTest/components/TamForm2.vue'
import TamForm3 from '@/ux/UserTest/components/TamForm3.vue'
import sartForm from '@/ux/UserTest/components/sartForm.vue'

const { t } = useI18n()

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
  tamAnswers: Object,
  sartAnswers: Object,
  testId: String,
  userDocId: String,
  taskIndex: Number,
  submitted: Boolean,
  doneTaskDisabled: Boolean,
  videoUrl: String,
  remoteStream: MediaStream, // props that receive the remote video stream in case of moderated test
  shouldRecordModerator: Boolean, // props that indicate whether to record the moderator's video
})
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
  'update:tamAnswers',
  'update:sartAnswers',
  'startTask',
  'tip-pressed',
])

onBeforeUnmount(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  if (finishTimeout) {
    clearTimeout(finishTimeout)
    finishTimeout = null
  }
  forceStopAllMedia()

  uploadingCount.value = 0
  isWaitingForUploadToFinish.value = false
  pendingFinalTime.value = null
})

const localSusAnswers = computed({
  get: () => props.susAnswers || [],
  set: (val) => emit('update:susAnswers', val),
})

const getTamInitialStructure = () => {
  const taskType = props.task?.taskType

  if (taskType === 'tam-1') {
    return {
      perceivedUsefulness: new Array(10).fill(undefined),
      perceivedEaseOfUse: new Array(10).fill(undefined),
      attitudeTowardUsing: new Array(5).fill(undefined),
      actualSystemUse: new Array(2).fill(undefined),
    }
  } else if (taskType === 'tam-2') {
    return {
      intentionToUse: new Array(2).fill(undefined),
      perceivedUsefulness: new Array(4).fill(undefined),
      perceivedEaseOfUse: new Array(4).fill(undefined),
      subjectiveNorm: new Array(2).fill(undefined),
      voluntariness: new Array(3).fill(undefined),
      image: new Array(3).fill(undefined),
      jobRelevance: new Array(2).fill(undefined),
      outputQuality: new Array(2).fill(undefined),
      resultDemonstrability: new Array(4).fill(undefined),
    }
  } else if (taskType === 'tam-3') {
    return {
      perceivedUsefulness: new Array(3).fill(undefined),
      perceivedEaseOfUse: new Array(3).fill(undefined),
      behavioralIntention: new Array(2).fill(undefined),
      usePatterns: new Array(2).fill(undefined),
      subjectiveNorm: new Array(3).fill(undefined),
      image: new Array(2).fill(undefined),
      jobRelevance: new Array(3).fill(undefined),
      outputQuality: new Array(3).fill(undefined),
      resultDemonstrability: new Array(2).fill(undefined),
      computerSelfEfficacy: new Array(3).fill(undefined),
      perceptionsOfExternalControl: new Array(3).fill(undefined),
      computerAnxiety: new Array(2).fill(undefined),
      computerPlayfulness: new Array(2).fill(undefined),
      perceivedEnjoyment: new Array(3).fill(undefined),
      objectiveUsability: new Array(2).fill(undefined),
      experience: new Array(2).fill(undefined),
      voluntariness: new Array(2).fill(undefined),
    }
  }
  return {}
}

const localTamAnswers = computed({
  get: () => props.tamAnswers || getTamInitialStructure(),
  set: (val) => emit('update:tamAnswers', val),
})

const VALIDATION_REQUIRED_TYPES = new Set([
  'sus',
  'tam-1',
  'tam-2',
  'tam-3',
  'sart',
  'nasa-tlx',
])

const shouldDisableFinishButton = computed(() => {
  const taskType = props.task?.taskType

  // If this task type requires validation, use doneTaskDisabled
  if (VALIDATION_REQUIRED_TYPES.has(taskType)) {
    return props.doneTaskDisabled
  }

  // For all other task types, no validation needed
  return false
})

const localSartAnswers = ref(props.sartAnswers || {})

function onUpdateSart(val) {
  localSartAnswers.value = val
  emit('update:sartAnswers', val)
}

const hasAnyRecording = computed(() => {
  return (
    props.task?.hasScreenRecord ||
    props.task?.hasCamRecord ||
    props.task?.hasAudioRecord ||
    props.task?.hasEye
  )
})

const hasExternalLink = computed(
  () => !!(props.task?.taskLink || props.taskLink),
)

const stage = ref(1)
const hasOpenedTool = ref(false)
const audioRecorder = ref(null)
const videoRecorder = ref(null)
const screenRecorder = ref(null)
const elapsedTimeDisplay = ref('0:00')
const uploadingCount = ref(0)
const isWaitingForUploadToFinish = ref(false)
const pendingFinalTime = ref(null)
const isPreparingTaskTools = ref(false)
const showScreenSharePrompt = ref(false)
const isRequestingScreenShare = ref(false)
const showUploadDialog = computed(
  () => isWaitingForUploadToFinish.value || uploadingCount.value > 0,
)
const showTaskProgressDialog = computed(
  () => isPreparingTaskTools.value || showUploadDialog.value,
)
const taskProgressDialogTitle = computed(() => {
  if (isPreparingTaskTools.value) {
    return t('UserTestView.TaskStep.setupDialogTitle')
  }
  return t('UserTestView.TaskStep.uploadDialogTitle')
})
const taskProgressDialogMessage = computed(() => {
  if (isPreparingTaskTools.value) {
    return t('UserTestView.TaskStep.setupDialogMessage')
  }
  return t('UserTestView.TaskStep.uploadDialogMessage')
})

let taskStartTime = null
let timerInterval = null
let finishTimeout = null

function onShowLoading() {
  uploadingCount.value++
}

function onStopShowLoading() {
  uploadingCount.value--
  if (uploadingCount.value < 0) uploadingCount.value = 0

  if (uploadingCount.value === 0 && isWaitingForUploadToFinish.value) {
    emitDoneOrCouldNotFinish(pendingFinalTime.value)
  }
}

function attemptFinish() {
  if (uploadingCount.value > 0) {
    isWaitingForUploadToFinish.value = true
  } else {
    // Check for where uploads have not started yet
    if (stage.value !== 4 && hasAnyRecording.value) {
      isWaitingForUploadToFinish.value = true
      // Short timeout to alllow recorders to emit show-loading
      finishTimeout = setTimeout(() => {
        if (uploadingCount.value === 0 && isWaitingForUploadToFinish.value) {
          emitDoneOrCouldNotFinish(pendingFinalTime.value)
        }
      }, 500)
    } else {
      emitDoneOrCouldNotFinish(pendingFinalTime.value)
    }
  }
}

function updateElapsedTime() {
  if (!taskStartTime) return
  const elapsed = Math.floor((Date.now() - taskStartTime) / 1000)
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  elapsedTimeDisplay.value = `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function goToStartTaskStage() {
  stage.value = 2
}

async function startTask() {
  emit('startTask')

  if (props.task?.hasScreenRecord) {
    showScreenSharePrompt.value = true
    return
  }

  await proceedWithTaskStart({ skipScreen: true })
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
    await proceedWithTaskStart({ skipScreen: true })
  } finally {
    isRequestingScreenShare.value = false
  }
}

async function proceedWithTaskStart({ skipScreen = false } = {}) {
  isPreparingTaskTools.value = true
  try {
    const mediaStarted = await startMediaRecorders({ skipScreen })
    if (!mediaStarted) {
      screenRecorder.value?.abortCapture?.()
      return
    }

    stage.value = 3
    taskStartTime = Date.now()
    timerInterval = setInterval(updateElapsedTime, 1000)
    nextTick(() => {
      setTimeout(() => {
        const timer = document.querySelector('[ref=timerComponent]')
        if (timer && timer.startTimer) timer.startTimer()
      }, 100)
    })
  } finally {
    isPreparingTaskTools.value = false
  }
}

function openTool() {
  const link = props.task?.taskLink || props.taskLink
  if (link) {
    const url =
      link.startsWith('http://') || link.startsWith('https://')
        ? link
        : `https://${link}`
    window.open(url, '_blank')
    hasOpenedTool.value = true
  }
}

const showPostForm = ref({ userCompleted: undefined })

async function startMediaRecorders({
  skipScreen = false,
  screenOnly = false,
} = {}) {
  if (!skipScreen && props.task?.hasScreenRecord && screenRecorder.value) {
    const screenStarted = await screenRecorder.value.captureScreen({
      requireEntireScreen: hasExternalLink.value,
    })
    if (!screenStarted) return false
  }
  if (screenOnly) return true

  if (props.task?.hasAudioRecord && audioRecorder.value) {
    await audioRecorder.value.startAudioRecording()
  }
  if (props.task?.hasCamRecord && videoRecorder.value) {
    // Camera is optional: missing device / denied permission must not block the task
    await videoRecorder.value.startRecording()
  }
  return true
}

function forceStopAllMedia() {
  audioRecorder.value?.stopAudioRecording?.()
  videoRecorder.value?.stopRecording?.()
  screenRecorder.value?.stopRecording?.()
}

function handleShowPostForm(userCompleted) {
  if (isWaitingForUploadToFinish.value) return

  forceStopAllMedia()

  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }

  let finalTime = null
  if (taskStartTime) {
    finalTime = Math.round(Date.now() - taskStartTime)
    pendingFinalTime.value = finalTime
    emit('timer-stopped', finalTime, props.taskIndex)
  }

  showPostForm.value.userCompleted = userCompleted

  if (props.task?.taskType === 'post-form' && props.task?.postForm) {
    const link = props.task?.postForm
    if (link) {
      const url =
        link.startsWith('http://') || link.startsWith('https://')
          ? link
          : `https://${link}`
      window.open(url, '_blank')
    }
  }

  // Show post-task form for all validated task types
  if (VALIDATION_REQUIRED_TYPES.has(props.task?.taskType)) {
    stage.value = 4
  } else {
    attemptFinish()
  }
}

function emitDoneOrCouldNotFinish(savedTime) {
  if (showPostForm.value.userCompleted) {
    emit('done', savedTime, props.taskIndex)
  } else {
    emit('couldNotFinish', savedTime, props.taskIndex)
  }

  // Reset state for next task
  isWaitingForUploadToFinish.value = false
  uploadingCount.value = 0
  isPreparingTaskTools.value = false
  showPostForm.value = { userCompleted: undefined }
  taskStartTime = null
  elapsedTimeDisplay.value = '0:00'

  // Reset stage after a small delay to allow parent to handle the transition
  nextTick(() => {
    stage.value = 1
  })
}

const localPostAnswer = ref(props.postAnswer)
const localTaskAnswer = ref(props.taskAnswer)
const localTaskObservations = ref(props.taskObservations)
const isVisualizerVisible = ref(false)

watch(
  () => props.postAnswer,
  (val) => {
    localPostAnswer.value = val
  },
)
watch(
  () => props.taskAnswer,
  (val) => {
    localTaskAnswer.value = val
  },
)
watch(
  () => props.taskObservations,
  (val) => {
    localTaskObservations.value = val
  },
)

// Reset stage when taskIndex changes (new task loaded)
watch(
  () => props.taskIndex,
  () => {
    if (finishTimeout) {
      clearTimeout(finishTimeout)
      finishTimeout = null
    }
    forceStopAllMedia()
    stage.value = 1
    taskStartTime = null
    elapsedTimeDisplay.value = '0:00'
    showPostForm.value = { userCompleted: undefined }
    hasOpenedTool.value = false
    isPreparingTaskTools.value = false
    showScreenSharePrompt.value = false
    isRequestingScreenShare.value = false
  },
)

function onUpdateTaskAnswer(val) {
  localTaskAnswer.value = val
  emit('update:taskAnswer', val)
}
function onUpdateTaskObservations(val) {
  localTaskObservations.value = val
  emit('update:taskObservations', val)
}
function onUpdateNasaTlx(val) {
  emit('update:nasaTlxAnswers', val)
}
function onTipPressed() {
  emit('tip-pressed', props.taskIndex)
}
function onTimerStopped(elapsedTime) {
  emit('timer-stopped', elapsedTime, props.taskIndex)
}
</script>

<style scoped>
.task-description {
  white-space: pre-line;
}

.task-information-description {
  font-size: clamp(1.2rem, 1.65vw, 1.4rem) !important;
  line-height: 1.65;
  font-weight: 300 !important;
}

:deep(.task-information-description p),
:deep(.task-information-description li),
:deep(.task-information-description span),
:deep(.task-information-description div) {
  font-size: clamp(1.2rem, 1.65vw, 1.4rem) !important;
  line-height: 1.65;
  font-weight: 300 !important;
}

.upload-dialog-card {
  background: #fff;
}

.upload-spinner {
  width: 64px;
  height: 64px;
  object-fit: contain;
  animation: uploadSpinnerRotate 1.8s linear infinite;
}

.task-answer-block {
  display: grid;
  gap: 16px;
}

.task-action-card {
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.task-action-card--attention {
  animation: taskActionAttention 1.8s ease-in-out infinite;
  border-color: rgba(var(--v-theme-secondary), 0.5);
}

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
  background: #fff;
  transition: all 0.2s ease;
}

.recording-feature-card:hover {
  border-color: rgba(var(--v-theme-secondary), 0.3);
  background: #fff;
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

@keyframes taskActionAttention {
  0%,
  100% {
    transform: translateY(0);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-secondary), 0.15);
  }

  50% {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(var(--v-theme-secondary), 0.12);
  }
}

@keyframes uploadSpinnerRotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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
