<template>
  <ShowInfo
    :title="
      stage === 1
        ? t('UserTestView.TaskStep.beforeWeStart')
        : stage === 2
          ? t('UserTestView.TaskStep.taskInformation')
          : stage === 5
            ? t('UserTestView.TaskStep.observationTitle')
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

        <!-- STAGE 1: Task preview (mini-stepper) -->
        <template v-if="stage === 1">
          <div
            v-if="showPreviewStepper"
            class="preview-stepper mx-auto mb-4"
            role="navigation"
            :aria-label="t('UserTestView.TaskStep.previewStepperLabel')"
          >
            <div
              v-for="(stepKey, index) in previewSteps"
              :key="stepKey"
              class="preview-stepper__item"
              :class="{
                'preview-stepper__item--active': index === previewStepIndex,
                'preview-stepper__item--done': index < previewStepIndex,
              }"
            >
              <span class="preview-stepper__dot" aria-hidden="true" />
              <span class="preview-stepper__label">
                {{ previewStepLabel(stepKey) }}
              </span>
            </div>
          </div>

          <!-- Step: Recording information -->
          <template v-if="currentPreviewStep === 'recording'">
            <v-card
              variant="outlined"
              color="secondary"
              class="my-6 mx-auto preview-info-card"
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

                <p class="text-body-1 text-left mb-4 text-grey-darken-3">
                  {{ t('UserTestView.TaskStep.recordingInfo') }}
                </p>

                <div class="recording-features-grid mb-4">
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

                  <div
                    v-if="task?.hasCamRecord"
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
                        {{ t('UserTestView.TaskStep.camera') }}
                      </h4>
                      <p class="text-body-2 text-grey-darken-3">
                        {{ t('UserTestView.TaskStep.cameraDesc') }}
                      </p>
                    </div>
                  </div>

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

                  <div v-if="task?.hasEye" class="recording-feature-card">
                    <div class="feature-icon-container">
                      <v-icon size="48" color="secondary">mdi-eye</v-icon>
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
              </v-card-text>
            </v-card>
          </template>

          <!-- Step: How to share your screen -->
          <template v-else-if="currentPreviewStep === 'share'">
            <v-card
              variant="outlined"
              color="secondary"
              class="my-6 mx-auto preview-info-card"
              max-width="1000"
            >
              <v-card-text :class="$vuetify.display.xs ? 'pa-3' : 'pa-4'">
                <ScreenShareInstructions
                  mode="demo"
                  :has-external-link="hasExternalLink"
                />
              </v-card-text>
            </v-card>
          </template>

          <!-- Step: Checklist (+ website tip when screen record) -->
          <template v-else-if="currentPreviewStep === 'checklist'">
            <v-card
              variant="outlined"
              color="secondary"
              class="my-6 mx-auto preview-info-card"
              max-width="1000"
            >
              <v-card-text :class="$vuetify.display.xs ? 'pa-3' : 'pa-4'">
                <div class="d-flex align-center mb-3">
                  <v-icon color="secondary" size="24" class="mr-2">
                    mdi-format-list-numbered
                  </v-icon>
                  <h3 class="text-h6 font-weight-bold text-secondary">
                    {{ t('UserTestView.TaskStep.previewStepChecklist') }}
                  </h3>
                </div>
                <ScreenShareInstructions mode="checklist" />
              </v-card-text>
            </v-card>

            <v-card
              v-if="hasExternalLink"
              variant="outlined"
              color="secondary"
              class="my-6 mx-auto preview-info-card"
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
          </template>

          <!-- Step: External website only (no screen record) -->
          <template v-else-if="currentPreviewStep === 'link'">
            <v-card
              variant="outlined"
              color="secondary"
              class="my-6 mx-auto preview-info-card"
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
          </template>

          <v-row justify="center" class="mt-6" align="center">
            <v-col cols="auto" class="d-flex ga-3">
              <v-btn
                v-if="previewStepIndex > 0"
                variant="text"
                @click="prevPreviewStep"
              >
                {{ t('buttons.back') }}
              </v-btn>
              <v-btn color="primary" @click="nextPreviewStep">
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
            v-safe-html="task?.taskDescription || taskDescription"
            class="rich-text text-body-1 task-description task-information-description text-left"
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
                      v-safe-html="task?.taskDescription || taskDescription"
                      class="rich-text text-body-1 task-description"
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
          <div
            v-if="task?.taskType === 'text-area' && !submitted"
            class="mt-4 task-answer-block"
          >
            <v-textarea
              :id="'id-' + (task?.taskName || taskName)"
              v-model="localTaskAnswer"
              :data-study-field-ref="`task:${taskIndex}:answer`"
              class="task-textarea"
              bg-color="white"
              variant="outlined"
              :label="t('UserTestView.TaskStep.answerLabel')"
              rows="3"
              @update:model-value="onUpdateTaskAnswer"
            />
          </div>
          <v-row justify="space-between">
            <v-col cols="12" sm="6">
              <v-btn
                color="error"
                block
                variant="outlined"
                class="mr-2"
                :disabled="isWaitingForUploadToFinish || isSubmittingOutcome"
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
                :disabled="isWaitingForUploadToFinish || isSubmittingOutcome"
                :loading="isSubmittingOutcome"
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
                  @response-changed="onStructuredResponseChanged"
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
                  @slider-focus="(event) => onStructuredSlider('nasa-tlx', 'focus', event)"
                  @slider-start="(event) => onStructuredSlider('nasa-tlx', 'start', event)"
                  @slider-change="(event) => onStructuredSlider('nasa-tlx', 'change', event)"
                  @slider-end="(event) => onStructuredSlider('nasa-tlx', 'end', event)"
                  @slider-blur="(event) => onStructuredSlider('nasa-tlx', 'blur', event)"
                />
              </div>

              <!-- SART Form -->
              <div v-else-if="task?.taskType === 'sart'">
                <sartForm
                  :sart="sartAnswers"
                  @update:sart="onUpdateSart"
                  @slider-focus="(event) => onStructuredSlider('sart', 'focus', event)"
                  @slider-start="(event) => onStructuredSlider('sart', 'start', event)"
                  @slider-change="(event) => onStructuredSlider('sart', 'change', event)"
                  @slider-end="(event) => onStructuredSlider('sart', 'end', event)"
                  @slider-blur="(event) => onStructuredSlider('sart', 'blur', event)"
                />
              </div>

              <!-- TAM-1 Form -->
              <div v-else-if="task?.taskType === 'tam-1'">
                <TamForm1
                  v-model="localTamAnswers"
                  @response-changed="onStructuredResponseChanged"
                  :task-index="taskIndex"
                  @update:model-value="(val) => emit('update:tamAnswers', val)"
                />
              </div>

              <!-- TAM-2 Form -->
              <div v-else-if="task?.taskType === 'tam-2'">
                <TamForm2
                  v-model="localTamAnswers"
                  @response-changed="onStructuredResponseChanged"
                  :task-index="taskIndex"
                  @update:model-value="(val) => emit('update:tamAnswers', val)"
                />
              </div>

              <!-- TAM-3 Form -->
              <div v-else-if="task?.taskType === 'tam-3'">
                <TamForm3
                  v-model="localTamAnswers"
                  @response-changed="onStructuredResponseChanged"
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
                    :disabled="shouldDisableFinishButton"
                    @click="goToObservationStep()"
                  >
                    {{ t('UserTestView.TaskStep.continue') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </template>
        <!-- STAGE 5: optional observation, after the timer has stopped -->
        <template v-else-if="stage === 5">
          <v-card class="mb-4" variant="outlined" bg-color="white">
            <v-card-text class="pa-4">
              <p class="text-body-2 text-grey-darken-2 mb-4">
                {{ t('UserTestView.TaskStep.observationHint') }}
              </p>
              <v-textarea
                v-if="!submitted"
                :id="'id-' + (task?.taskName || taskName) + '-obs'"
                v-model="localTaskObservations"
                :data-study-field-ref="`task:${taskIndex}:comment`"
                class="task-textarea"
                bg-color="white"
                variant="outlined"
                :label="t('UserTestView.TaskStep.observationLabel')"
                rows="3"
                @update:model-value="onUpdateTaskObservations"
              />
              <v-btn
                color="primary"
                block
                variant="flat"
                :disabled="isWaitingForUploadToFinish"
                @click="attemptFinish()"
              >
                {{
                  isWaitingForUploadToFinish
                    ? t('UserTestView.TaskStep.uploading')
                    : t('UserTestView.TaskStep.finishTask')
                }}
              </v-btn>
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
        @recording-result="$emit('recording-result', $event)"
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
        @recording-result="$emit('recording-result', $event)"
        @show-loading="onShowLoading"
        @stop-show-loading="onStopShowLoading"
      />

      <VideoRecorder
        v-if="task?.hasCamRecord"
        ref="videoRecorder"
        :test-id="testId"
        :user-doc-id="userDocId"
        :task-index="taskIndex"
        @recording-result="$emit('recording-result', $event)"
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
import AudioRecorder from '@/shared/components/AudioRecorder.vue'
import AudioVisualizer from '@/ux/UserTest/components/AudioVisualizer.vue'
import VideoRecorder from '@/shared/components/VideoRecorder.vue'
import ScreenRecorder from '@/shared/components/ScreenRecorder.vue'
import ScreenShareInstructions from '@/shared/components/ScreenShareInstructions.vue'
import Timer from '@/ux/UserTest/components/Timer.vue'
import SusForm from '@/ux/UserTest/SusForm.vue'
import nasaTlxForm from '@/ux/UserTest/components/nasaTlxForm.vue'
import TamForm1 from '@/ux/UserTest/components/TamForm1.vue'
import TamForm2 from '@/ux/UserTest/components/TamForm2.vue'
import TamForm3 from '@/ux/UserTest/components/TamForm3.vue'
import sartForm from '@/ux/UserTest/components/sartForm.vue'
import { isReturnToTaskOnlyType } from '@/ux/UserTest/utils/mobileTaskPageState'

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
  mobileInstructionsEligible: { type: Boolean, default: false },
  mobileInstructionsEnabled: { type: Boolean, default: false },
  autoOpenTaskLink: { type: Boolean, default: false },
  resumeAtStageThree: { type: Boolean, default: false },
  activateMobileTask: { type: Function, default: null },
  submitMobileOutcome: { type: Function, default: null },
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
  'recording-result',
  'timer-stopped',
  'update:susAnswers',
  'update:nasaTlxAnswers',
  'update:tamAnswers',
  'update:sartAnswers',
  'startTask',
  'taskStarted',
  'tip-pressed',
  'structured-response-changed',
  'structured-slider-focus',
  'structured-slider-start',
  'structured-slider-change',
  'structured-slider-end',
  'structured-slider-blur',
  'task-questionnaire-entered',
  'mobile-outcome-accepted',
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
  abortAllMedia()

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

const normalizeTamAnswers = (answers) => {
  const defaults = getTamInitialStructure()
  if (!Object.keys(defaults).length) return answers || {}

  const source = answers && typeof answers === 'object' ? answers : {}
  const normalized = { ...source }
  for (const [construct, defaultValues] of Object.entries(defaults)) {
    const current = source[construct]
    const length = Math.max(
      defaultValues.length,
      Array.isArray(current) ? current.length : 0,
    )
    normalized[construct] = Array.from({ length }, (_, index) =>
      Array.isArray(current) ? current[index] : undefined,
    )
  }
  return normalized
}

const localTamAnswers = computed({
  get: () => normalizeTamAnswers(props.tamAnswers),
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

const hasPostTaskQuestionnaire = computed(() =>
  VALIDATION_REQUIRED_TYPES.has(props.task?.taskType),
)

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

const PREVIEW_STEP_LABEL_KEYS = {
  recording: 'UserTestView.TaskStep.previewStepRecording',
  share: 'UserTestView.TaskStep.previewStepShare',
  checklist: 'UserTestView.TaskStep.previewStepChecklist',
  link: 'UserTestView.TaskStep.previewStepLink',
}

/** Dynamic mini-stepper keys inside stage 1 ("Before we start"). */
const previewSteps = computed(() => {
  const steps = []

  if (hasAnyRecording.value) {
    steps.push('recording')
  }

  if (props.task?.hasScreenRecord) {
    steps.push('share', 'checklist')
  } else if (hasExternalLink.value) {
    steps.push('link')
  }

  return steps
})

const previewStepIndex = ref(0)

const currentPreviewStep = computed(
  () => previewSteps.value[previewStepIndex.value] || null,
)

const showPreviewStepper = computed(() => previewSteps.value.length > 1)

function previewStepLabel(stepKey) {
  const key = PREVIEW_STEP_LABEL_KEYS[stepKey]
  return key ? t(key) : stepKey
}

function resetPreviewStepper() {
  previewStepIndex.value = 0
}

function introStage() {
  return previewSteps.value.length > 0 ? 1 : 2
}

function resetToTaskIntro() {
  resetPreviewStepper()
  stage.value = introStage()
}

function prevPreviewStep() {
  if (previewStepIndex.value > 0) {
    previewStepIndex.value -= 1
  }
}

function nextPreviewStep() {
  if (previewStepIndex.value < previewSteps.value.length - 1) {
    previewStepIndex.value += 1
    return
  }
  goToStartTaskStage()
}

const stage = ref(props.resumeAtStageThree ? 3 : introStage())

watch(previewSteps, (steps) => {
  if (previewStepIndex.value > steps.length - 1) {
    previewStepIndex.value = Math.max(0, steps.length - 1)
  }
  if (steps.length === 0 && stage.value === 1) {
    stage.value = 2
  }
})

watch(
  () => props.resumeAtStageThree,
  (resume) => {
    if (resume && stage.value < 3 && !postFlowStarted) {
      stage.value = 3
    }
  },
)

const hasOpenedTool = ref(false)
const isSubmittingOutcome = ref(false)
let taskToolWindow = null
let postFlowStarted = false
let outcomeRequestStarted = false
let postFormOpened = false
let postFormUsesTaskWindow = false
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
    // Tasks without a questionnaire used to finish immediately, before
    // recorders had time to emit show-loading. The observation step can
    // still be confirmed right away, so keep that short grace period.
    if (!hasPostTaskQuestionnaire.value && hasAnyRecording.value) {
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
  resetPreviewStepper()
}

function taskLinkUrl() {
  const link = props.task?.taskLink || props.taskLink
  if (!link) return ''
  return link.startsWith('http://') || link.startsWith('https://')
    ? link
    : `https://${link}`
}

function releaseTaskWindow() {
  const opened = taskToolWindow
  if (postFormUsesTaskWindow) {
    try {
      opened?.focus()
    } catch {
      // The form tab stays open after the site is replaced.
    }
    return
  }
  taskToolWindow = null
  if (!opened && !props.mobileInstructionsEnabled) return
  if (opened) {
    try {
      opened.close()
    } catch {
      // The browser can reject closing a tab. The task still continues.
    }
  }
  try {
    window.focus()
  } catch {
    // Focusing the study tab is best-effort and must not block progress.
  }
}

function shouldAutoOpenTaskPage() {
  const mobileSession =
    props.mobileInstructionsEnabled && props.mobileInstructionsEligible
  return props.autoOpenTaskLink || mobileSession
}

function openTaskPageWindow() {
  const url = taskLinkUrl()
  if (!url) return null
  const opened = window.open(url, '_blank')
  if (!opened) return null
  hasOpenedTool.value = true
  if (props.mobileInstructionsEnabled) taskToolWindow = opened
  return opened
}

function openTaskPage() {
  if (!shouldAutoOpenTaskPage()) return
  openTaskPageWindow()
}

async function notifyMobileActivation() {
  if (
    !props.mobileInstructionsEnabled ||
    !props.mobileInstructionsEligible ||
    typeof props.activateMobileTask !== 'function'
  ) {
    return
  }
  try {
    await props.activateMobileTask()
  } catch {
    // The phone is not required. The computer task already started.
  }
}

async function startTask() {
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
    const started = await proceedWithTaskStart({ skipScreen: true })
    if (!started) screenRecorder.value?.abortCapture?.()
  } finally {
    isRequestingScreenShare.value = false
  }
}

async function proceedWithTaskStart({ skipScreen = false } = {}) {
  isPreparingTaskTools.value = true
  let started = false
  try {
    const mediaStarted = await startMediaRecorders({ skipScreen })
    if (!mediaStarted) {
      screenRecorder.value?.abortCapture?.()
      return false
    }

    const enteredActiveStage = stage.value !== 3
    stage.value = 3
    if (enteredActiveStage) emit('taskStarted', new Date().toISOString())
    taskStartTime = Date.now()
    emit('startTask')
    timerInterval = setInterval(updateElapsedTime, 1000)
    nextTick(() => {
      setTimeout(() => {
        const timer = document.querySelector('[ref=timerComponent]')
        if (timer && timer.startTimer) timer.startTimer()
      }, 100)
    })
    started = true
  } finally {
    isPreparingTaskTools.value = false
  }
  if (!started) {
    releaseTaskWindow()
    return false
  }
  // Sharing prompts finish first. The task page opens only after that.
  openTaskPage()
  await notifyMobileActivation()
  return true
}

function postFormUrl() {
  if (props.task?.taskType !== 'post-form' || !props.task?.postForm) return ''
  const link = props.task.postForm
  return link.startsWith('http://') || link.startsWith('https://')
    ? link
    : `https://${link}`
}

/**
 * Replaces the site tab with the Google Form. A phone finish has no user
 * gesture, so `window.open` would be blocked.
 *
 * @returns {boolean}
 */
function showPostFormInTaskWindow() {
  const url = postFormUrl()
  const opened = taskToolWindow
  if (!url || !opened || opened.closed) return false
  if (postFormOpened) return postFormUsesTaskWindow
  try {
    opened.location.href = url
    opened.focus()
    postFormOpened = true
    postFormUsesTaskWindow = true
    return true
  } catch {
    return false
  }
}

function openPostFormIfNeeded() {
  if (postFormOpened) return
  if (showPostFormInTaskWindow()) return
  const url = postFormUrl()
  if (!url) return
  postFormOpened = true
  const opened = window.open(url, '_blank')
  if (!opened) return
  try {
    opened.focus()
  } catch {
    /* best-effort */
  }
}

function openTool() {
  openTaskPageWindow()
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

function abortAllMedia() {
  audioRecorder.value?.abortCapture?.()
  videoRecorder.value?.abortCapture?.()
  screenRecorder.value?.abortCapture?.()
}

function beginPostTaskFlow(userCompleted) {
  if (postFlowStarted || stage.value > 3) return
  postFlowStarted = true
  showPostFormInTaskWindow()
  releaseTaskWindow()

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
  openPostFormIfNeeded()

  // Questionnaire first, then the optional comment. The timer is already stopped.
  if (hasPostTaskQuestionnaire.value) {
    stage.value = 4
    emit('task-questionnaire-entered')
  } else {
    goToObservationStep()
  }
}

function goToObservationStep() {
  stage.value = 5
}

async function handleShowPostForm(userCompleted) {
  if (
    isWaitingForUploadToFinish.value ||
    postFlowStarted ||
    outcomeRequestStarted
  ) {
    return
  }
  outcomeRequestStarted = true
  isSubmittingOutcome.value = true
  openPostFormIfNeeded()
  let resolvedCompleted = userCompleted
  try {
    if (
      props.mobileInstructionsEnabled &&
      props.mobileInstructionsEligible &&
      typeof props.submitMobileOutcome === 'function'
    ) {
      const pressed = userCompleted ? 'completed' : 'not_completed'
      const settled = await props.submitMobileOutcome(pressed)
      if (settled?.success) {
        resolvedCompleted = settled.completed === true
        emit('mobile-outcome-accepted', settled)
      }
    }
    beginPostTaskFlow(resolvedCompleted)
  } finally {
    isSubmittingOutcome.value = false
  }
}

function continueFromAcceptedOutcome(completed) {
  if (isReturnToTaskOnlyType(props.task?.taskType)) {
    releaseTaskWindow()
    return
  }
  beginPostTaskFlow(completed === true)
}

function returnToTaskFromMobile() {
  releaseTaskWindow()
}

defineExpose({ continueFromAcceptedOutcome, returnToTaskFromMobile })

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
    resetToTaskIntro()
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
    abortAllMedia()
    resetToTaskIntro()
    if (props.resumeAtStageThree) stage.value = 3
    taskStartTime = null
    elapsedTimeDisplay.value = '0:00'
    showPostForm.value = { userCompleted: undefined }
    hasOpenedTool.value = false
    postFlowStarted = false
    outcomeRequestStarted = false
    postFormOpened = false
    postFormUsesTaskWindow = false
    isSubmittingOutcome.value = false
    taskToolWindow = null
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
const structuredTaskScope = () => `task:${props.taskIndex}`

function onStructuredResponseChanged(change) {
  if (!change?.itemRef) return
  emit('structured-response-changed', {
    scopeRef: structuredTaskScope(),
    itemRef: change.itemRef,
    value: change.value,
  })
}

function onStructuredSlider(instrument, phase, change) {
  if (!change?.itemRef) return
  emit(`structured-slider-${phase}`, {
    scopeRef: structuredTaskScope(),
    itemRef: `${instrument}:${change.itemRef}`,
    value: change.value,
  })
}
function onTipPressed() {
  emit('tip-pressed', props.taskIndex)
}
function onTimerStopped(elapsedTime) {
  emit('timer-stopped', elapsedTime, props.taskIndex)
}
</script>

<style scoped>
.preview-stepper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 24px;
  max-width: 720px;
}

.preview-stepper__item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 0.875rem;
  font-weight: 500;
}

.preview-stepper__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.preview-stepper__item--active {
  color: rgb(var(--v-theme-secondary));
  font-weight: 700;
}

.preview-stepper__item--active .preview-stepper__dot {
  background: rgb(var(--v-theme-secondary));
  box-shadow: 0 0 0 4px rgba(var(--v-theme-secondary), 0.18);
}

.preview-stepper__item--done {
  color: rgba(0, 0, 0, 0.65);
}

.preview-stepper__item--done .preview-stepper__dot {
  background: rgb(var(--v-theme-secondary));
  opacity: 0.55;
}

.preview-info-card {
  background-color: #fff !important;
}

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
