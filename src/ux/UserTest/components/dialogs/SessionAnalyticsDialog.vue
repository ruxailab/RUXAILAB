<template>
  <v-dialog
    v-model="open"
    fullscreen
    transition="dialog-bottom-transition"
    persistent
  >
    <v-card class="session-dialog-card">
      <v-toolbar color="primary" elevation="2" class="session-toolbar">
        <v-btn
          icon
          :aria-label="$t('buttons.close')"
          data-testid="session-dialog-close"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>

        <div class="session-toolbar-title d-flex align-center ga-3 ml-1">
          <v-avatar
            v-if="participantName"
            size="36"
            color="secondary"
            class="flex-shrink-0"
          >
            <span class="text-white font-weight-bold">
              {{ participantInitial }}
            </span>
          </v-avatar>
          <div class="min-w-0">
            <div
              class="text-subtitle-1 font-weight-bold text-truncate"
              data-testid="session-dialog-task-name"
            >
              {{ displayTaskName }}
            </div>
            <div
              class="text-caption text-truncate session-toolbar-subtitle"
              data-testid="session-dialog-subtitle"
            >
              {{ toolbarSubtitle }}
            </div>
          </div>
        </div>

        <div
          v-if="taskSummary"
          class="session-summary d-none d-md-flex align-center ga-2 mx-4"
          data-testid="session-dialog-summary"
        >
          <v-chip
            size="small"
            variant="flat"
            class="flex-shrink-0"
            :color="taskSummary.statusColor || 'grey'"
            :prepend-icon="statusIcon"
          >
            {{ taskSummary.statusLabel }}
          </v-chip>

          <v-chip
            size="small"
            variant="tonal"
            color="white"
            class="flex-shrink-0"
            prepend-icon="mdi-timer-outline"
          >
            {{ taskSummary.timeLabel }}
            <template v-if="taskSummary.estimatedTimeLabel !== '-'">
              &nbsp;/&nbsp;{{ taskSummary.estimatedTimeLabel }}
            </template>
          </v-chip>

          <v-chip
            v-if="taskSummary.timeComparison"
            size="small"
            class="flex-shrink-0"
            :variant="taskSummary.timeComparison === 'over' ? 'flat' : 'tonal'"
            :color="taskSummary.timeComparison === 'over' ? 'error' : 'white'"
          >
            {{ taskSummary.timeComparisonLabel }}
          </v-chip>

          <v-chip
            v-if="taskSummary.hasTipAvailable"
            size="small"
            class="flex-shrink-0"
            :variant="taskSummary.tipPressCount > 0 ? 'flat' : 'tonal'"
            :color="taskSummary.tipPressCount > 0 ? 'warning' : 'white'"
            prepend-icon="mdi-lightbulb-on-outline"
          >
            {{ $t('analytics.testDetails.tip') }}: {{ taskSummary.tipUsage }}
          </v-chip>

          <div
            v-if="
              taskSummary.answerPreview && taskSummary.answerPreview !== '-'
            "
            class="session-summary-answer d-none d-lg-block text-body-2 text-truncate"
            :title="taskSummary.answerPreview"
          >
            <span class="font-weight-bold">
              {{ $t('analytics.testDetails.answer') }}:
            </span>
            {{ taskSummary.answerPreview }}
          </div>
        </div>
        <v-spacer v-else />

        <v-btn
          icon="mdi-link-variant"
          variant="text"
          size="small"
          class="flex-shrink-0"
          :title="$t('analytics.testDetails.copyLink')"
          :aria-label="$t('analytics.testDetails.copyLink')"
          data-testid="session-dialog-copy-link"
          @click="copyLink"
        />

        <v-btn
          icon="mdi-keyboard-outline"
          variant="text"
          size="small"
          class="mr-1 flex-shrink-0"
          :title="$t('analytics.testDetails.keyboardShortcuts.open')"
          :aria-label="$t('analytics.testDetails.keyboardShortcuts.open')"
          data-testid="session-dialog-shortcuts"
          @click="shortcutsOpen = true"
        />

        <div
          v-if="taskCount > 1"
          class="task-nav d-flex align-center flex-shrink-0 mr-2"
        >
          <v-btn
            variant="text"
            size="small"
            prepend-icon="mdi-chevron-left"
            class="task-nav-btn"
            :disabled="!canGoPrevious"
            :title="previousTaskTitle"
            data-testid="session-dialog-previous"
            @click="goToTask(-1)"
          >
            <span class="d-none d-sm-inline">
              {{ $t('analytics.testDetails.previousTask') }}
            </span>
          </v-btn>
          <span class="task-nav-divider" />
          <v-btn
            variant="text"
            size="small"
            append-icon="mdi-chevron-right"
            class="task-nav-btn"
            :disabled="!canGoNext"
            :title="nextTaskTitle"
            data-testid="session-dialog-next"
            @click="goToTask(1)"
          >
            <span class="d-none d-sm-inline">
              {{ $t('analytics.testDetails.nextTask') }}
            </span>
          </v-btn>
        </div>
      </v-toolbar>

      <v-card-text
        class="dialog-body"
        :class="{ 'dialog-body--cinema': cinemaMode }"
      >
        <v-card flat rounded="xl" class="panel-card media-panel pa-4">
          <div
            class="panel-header mb-3 d-flex align-center justify-space-between flex-wrap ga-2"
          >
            <div class="d-flex align-center">
              <v-icon size="18" color="primary" class="mr-2">
                mdi-video-box
              </v-icon>
              <span class="panel-title">
                {{ $t('analytics.testDetails.recordings') }}
              </span>
            </div>

            <div class="d-flex align-center ga-2">
              <v-btn-toggle
                v-if="hasWebcamMedia && hasScreenMedia"
                v-model="mediaLayout"
                density="compact"
                variant="outlined"
                color="#FB5C6C"
                mandatory
              >
                <v-btn value="both" size="small">
                  {{ $t('analytics.testDetails.bothMedia') }}
                </v-btn>
                <v-btn value="webcam" size="small">
                  {{ $t('analytics.testDetails.webcam') }}
                </v-btn>
                <v-btn value="screen" size="small">
                  {{ $t('analytics.testDetails.screen') }}
                </v-btn>
              </v-btn-toggle>

              <v-btn-toggle
                v-if="hasPlayableMedia"
                v-model="playbackRate"
                density="compact"
                variant="outlined"
                color="primary"
                mandatory
                :title="$t('analytics.testDetails.playbackSpeed')"
                :aria-label="$t('analytics.testDetails.playbackSpeed')"
                data-testid="session-dialog-speed"
              >
                <v-btn
                  v-for="rate in PLAYBACK_RATES"
                  :key="rate"
                  :value="rate"
                  size="small"
                >
                  {{ rate }}×
                </v-btn>
              </v-btn-toggle>

              <v-btn
                :icon="cinemaMode ? 'mdi-fullscreen-exit' : 'mdi-theater'"
                variant="text"
                size="small"
                :title="cinemaTitle"
                :aria-label="cinemaTitle"
                :aria-pressed="cinemaMode"
                data-testid="session-dialog-cinema"
                @click="toggleCinema"
              />
            </div>
          </div>

          <div
            v-if="!hasWebcamMedia && !hasScreenMedia"
            class="media-empty text-body-2 text-medium-emphasis"
            data-testid="session-dialog-no-media"
          >
            <v-icon size="40" class="mb-2">mdi-video-off-outline</v-icon>
            <div>{{ $t('analytics.testDetails.noRecordings') }}</div>
          </div>

          <div
            v-else
            :key="`stage-${mediaKey}`"
            class="media-stage"
            data-testid="session-dialog-media-stage"
          >
            <div
              v-if="showScreenZone"
              class="media-frame"
              :style="{ '--media-ratio': screenRatio }"
            >
              <video
                ref="mainVideo2"
                class="media-video"
                playsinline
                :src="taskAnswer?.screenRecordURL"
                @timeupdate="onTimeUpdate"
                @loadedmetadata="onMetadataLoaded"
                @loadeddata="setMediaStatus('screen', 'ready')"
                @canplay="setMediaStatus('screen', 'ready')"
                @playing="setMediaStatus('screen', 'ready')"
                @waiting="setMediaStatus('screen', 'buffering')"
                @error="setMediaStatus('screen', 'error')"
                @play="onVideoPlay"
                @pause="onVideoPause"
              />
              <div
                v-if="mediaStatus.screen !== 'ready'"
                class="media-status"
                :class="`media-status--${mediaStatus.screen}`"
                data-testid="session-dialog-screen-status"
              >
                <template v-if="mediaStatus.screen === 'error'">
                  <v-icon size="32" class="mb-1"
                    >mdi-alert-circle-outline</v-icon
                  >
                  <div class="text-caption mb-2">
                    {{ $t('analytics.testDetails.mediaError') }}
                  </div>
                  <v-btn
                    size="small"
                    variant="flat"
                    color="white"
                    prepend-icon="mdi-refresh"
                    data-testid="session-dialog-screen-retry"
                    @click="retryMedia('screen')"
                  >
                    {{ $t('analytics.testDetails.retry') }}
                  </v-btn>
                </template>
                <template v-else>
                  <v-progress-circular indeterminate size="32" width="3" />
                  <div
                    v-if="mediaStatus.screen === 'loading'"
                    class="text-caption mt-2"
                  >
                    {{ $t('analytics.testDetails.mediaLoading') }}
                  </div>
                </template>
              </div>

              <EyeTrackingOverlay
                v-if="rightTab === 'eye' && predictedData && videoReady"
                :video-ref="mainVideo2"
                :predicted-data="predictedData"
                :current-time="videoCurrentTime"
                :is-playing="isPlaying"
                :view-mode="selectedView"
              />
            </div>

            <div
              v-if="showWebcamZone"
              :class="showScreenZone ? 'webcam-pip' : 'media-frame'"
              :style="{ '--media-ratio': webcamRatio }"
              data-testid="session-dialog-webcam"
            >
              <video
                ref="mainVideo1"
                class="media-video"
                playsinline
                :src="taskAnswer?.webcamRecordURL"
                @timeupdate="onTimeUpdate"
                @loadedmetadata="onMetadataLoaded"
                @loadeddata="setMediaStatus('webcam', 'ready')"
                @canplay="setMediaStatus('webcam', 'ready')"
                @playing="setMediaStatus('webcam', 'ready')"
                @waiting="setMediaStatus('webcam', 'buffering')"
                @error="setMediaStatus('webcam', 'error')"
                @play="onVideoPlay"
                @pause="onVideoPause"
              />
              <div
                v-if="mediaStatus.webcam !== 'ready'"
                class="media-status"
                :class="`media-status--${mediaStatus.webcam}`"
                data-testid="session-dialog-webcam-status"
              >
                <template v-if="mediaStatus.webcam === 'error'">
                  <v-icon size="20" class="mb-1"
                    >mdi-alert-circle-outline</v-icon
                  >
                  <div class="text-caption mb-2">
                    {{ $t('analytics.testDetails.mediaError') }}
                  </div>
                  <v-btn
                    size="small"
                    variant="flat"
                    color="white"
                    prepend-icon="mdi-refresh"
                    data-testid="session-dialog-webcam-retry"
                    @click="retryMedia('webcam')"
                  >
                    {{ $t('analytics.testDetails.retry') }}
                  </v-btn>
                </template>
                <template v-else>
                  <v-progress-circular indeterminate size="20" width="3" />
                  <div
                    v-if="mediaStatus.webcam === 'loading'"
                    class="text-caption mt-2"
                  >
                    {{ $t('analytics.testDetails.mediaLoading') }}
                  </div>
                </template>
              </div>
            </div>
          </div>

          <audio
            v-if="hasTaskAudio"
            ref="taskAudio"
            :key="`audio-${mediaKey}`"
            preload="auto"
            :src="taskAnswer.audioRecordURL"
            @loadedmetadata="onMetadataLoaded"
            @play="onVideoPlay"
            @pause="onVideoPause"
          />
        </v-card>

        <v-card
          v-show="!cinemaMode"
          flat
          rounded="xl"
          class="panel-card analysis-panel pa-4"
        >
          <div class="panel-header mb-1">
            <v-icon size="18" color="primary" class="mr-2">
              mdi-chart-box-outline
            </v-icon>
            <span class="panel-title">
              {{ $t('analytics.testDetails.analysis') }}
            </span>
          </div>

          <v-tabs
            v-model="rightTab"
            class="analysis-tabs"
            bg-color="transparent"
            color="#FB5C6C"
            slider-size="3"
            density="comfortable"
            show-arrows
          >
            <!-- <v-tab value="general">General</v-tab> -->
            <v-tab v-if="hasEyeTrackingData" value="eye">
              {{ $t('analytics.testDetails.eyeTracker') }}
            </v-tab>
            <v-tab v-if="hasSentimentData" value="sentimental">
              {{ $t('analytics.sentimentAnalytics') }}
            </v-tab>
            <v-tab v-if="hasTranscriptionData" value="transcript">
              {{ $t('analytics.testDetails.transcriptions') }}
            </v-tab>
            <v-tab value="notes">
              {{ $t('analytics.testDetails.pointsSegments') }}
              <v-chip
                v-if="markers.length + segments.length > 0"
                size="x-small"
                color="#FB5C6C"
                variant="flat"
                class="ml-2"
              >
                {{ markers.length + segments.length }}
              </v-chip>
            </v-tab>
            <!-- <v-tab value="transcript">Transcripción</v-tab>
                            <v-tab value="notes">Notas</v-tab> -->
          </v-tabs>

          <v-window v-model="rightTab" class="analysis-window mt-4">
            <!-- <v-window-item value="general">
                                <h4 class="text-subtitle-1 mb-1">General Analytics</h4>
                                <TranscriptWordCloud :transcript="taskAnswer?.transcript ?? mockTranscript" />
                                <SentimentSummary :sentiments="taskAnswer?.sentiments ?? mockSentiments" class="mb-4" />
                                <NotesStats :totalNotes="taskAnswer?.notesCount ?? mockNotesCount" class="mb-4" />
                            </v-window-item> -->

            <v-window-item v-if="hasEyeTrackingData" value="eye">
              <EyeTrackingStats
                :key="`eye-${mediaKey}`"
                :iris-data="taskAnswer?.irisTrackingData"
                :user-id="userId"
                class="mb-4"
                @predictions-ready="predictedData = $event"
                @view-changed="selectedView = $event"
              />
            </v-window-item>

            <v-window-item v-if="hasSentimentData" value="sentimental">
              <div class="d-flex flex-column ga-6">
                <FacialSentimentPanel
                  v-if="hasWebcamMedia"
                  :key="`facial-${resolvedTaskId}-${taskAnswer?.sentimentDocId || 'new'}`"
                  :video-element="mainVideo1"
                  :webcam-video-url="taskAnswer?.webcamRecordURL"
                  :sentiment-doc-id="taskAnswer?.sentimentDocId"
                  :legacy-facial-results="taskAnswer?.facialSentimentResults"
                  :test-answer="testAnswer"
                  :selected-task="selectedTask"
                  :answers-doc-id="answersDocId"
                  :user-doc-id="userId"
                  :task-id="resolvedTaskId"
                  :study-id="testAnswer?.studyId || null"
                />
                <TextSentimentPanel
                  v-if="hasTaskAudio"
                  :key="`text-${resolvedTaskId}-${taskAnswer?.sentimentDocId || 'new'}`"
                  :audio-url="taskAnswer?.audioRecordURL"
                  :sentiment-doc-id="taskAnswer?.sentimentDocId"
                  :legacy-text-results="taskAnswer?.textSentimentResults"
                  :test-answer="testAnswer"
                  :selected-task="selectedTask"
                  :answers-doc-id="answersDocId"
                  :user-doc-id="userId"
                  :task-id="resolvedTaskId"
                  :study-id="testAnswer?.studyId || null"
                />
              </div>
            </v-window-item>

            <v-window-item v-if="hasTranscriptionData" value="transcript">
              <SessionTranscriptionPanel
                :key="transcriptionPanelKey"
                :answers-doc-id="answersDocId"
                :user-doc-id="userId"
                :task-id="resolvedTaskId"
                :study-id="testAnswer?.studyId || null"
                :transcription-doc-id="resolvedTranscriptionDocId"
                :can-transcribe="canTranscribe"
                :has-audio="hasAudioFiles"
                :unavailable-message="transcriptionUnavailableMessage"
                :current-time="transcriptTime"
                :is-playing="isPlaying"
                @seek="onTranscriptSeek"
                @run-change="onTranscriptRunChange"
                @saved="onTranscriptionSaved"
                @deleted="onTranscriptionDeleted"
              />
            </v-window-item>

            <v-window-item value="notes">
              <SessionAnnotationsList
                :markers="markers"
                :segments="segments"
                :current-time="videoCurrentTime"
                @seek="onSeek"
                @remove="removeAnnotation"
                @update="updateAnnotation"
              />
            </v-window-item>

            <!-- <v-window-item value="transcript">
                                <h4 class="text-subtitle-1 mb-1">Audio Transcript</h4>
                                <v-skeleton-loader type="text" width="80%" />
                                <v-skeleton-loader type="text" width="60%" />
                            </v-window-item>

                            <v-window-item value="notes">
                                <h4 class="text-subtitle-1 mb-2">Notas</h4>
                                <v-sheet class="pa-4 rounded-lg mb-6" color="#f5f5f5">
                                    <v-skeleton-loader type="text" width="80%" />
                                    <v-skeleton-loader type="text" width="60%" />
                                </v-sheet>
                            </v-window-item> -->
          </v-window>
        </v-card>

        <SessionTimeline
          ref="timeline"
          :duration="videoDuration"
          :current-time="videoCurrentTime"
          :is-playing="isPlaying"
          :markers="markers"
          :segments="segments"
          :silences="silences"
          @seek="onSeek"
          @toggle-play="togglePlay"
          @add-marker="addMarker"
          @add-segment="addSegment"
        />
      </v-card-text>
    </v-card>

    <v-dialog v-model="shortcutsOpen" max-width="560" scrollable>
      <v-card rounded="xl" data-testid="session-shortcuts-dialog">
        <v-card-title class="d-flex align-center ga-2 pt-4 px-5">
          <v-icon color="primary">mdi-keyboard-outline</v-icon>
          <span class="text-h6 font-weight-bold">
            {{ $t('analytics.testDetails.keyboardShortcuts.title') }}
          </span>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :aria-label="$t('buttons.close')"
            data-testid="session-shortcuts-close"
            @click="shortcutsOpen = false"
          />
        </v-card-title>
        <v-card-text class="px-5 pb-5">
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ $t('analytics.testDetails.keyboardShortcuts.description') }}
          </p>
          <section
            v-for="group in shortcutGroups"
            :key="group.id"
            class="shortcut-group"
            :data-testid="`shortcut-group-${group.id}`"
          >
            <h3 class="shortcut-group-title">{{ group.title }}</h3>
            <div
              v-for="shortcut in group.items"
              :key="shortcut.id"
              class="shortcut-row"
              :class="{ 'shortcut-row--unavailable': !shortcut.available }"
              :data-testid="`shortcut-${shortcut.id}`"
            >
              <span class="shortcut-label">
                {{ shortcut.label }}
                <span
                  v-if="!shortcut.available && shortcut.unavailableHint"
                  class="text-caption text-medium-emphasis d-block"
                >
                  {{ shortcut.unavailableHint }}
                </span>
              </span>
              <span class="shortcut-keys">
                <template v-for="(key, index) in shortcut.keys" :key="key">
                  <span
                    v-if="index > 0"
                    class="text-caption text-medium-emphasis"
                  >
                    {{ $t('analytics.testDetails.keyboardShortcuts.or') }}
                  </span>
                  <kbd class="shortcut-key">{{ key }}</kbd>
                </template>
              </span>
            </div>
          </section>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useManagedListeners } from '@/shared/composables/useManagedListeners'
import AnswerController from '@/shared/controllers/AnswerController'
import { showError, showSuccess } from '@/shared/utils/toast'
import SessionTimeline from '../sessions/SessionTimeline.vue'
import SessionAnnotationsList from '../sessions/SessionAnnotationsList.vue'
import EyeTrackingStats from '../sessions/EyeTrackingStats.vue'
import FacialSentimentPanel from '../sentimentAnalysis/FacialSentimentPanel.vue'
import TextSentimentPanel from '../sentimentAnalysis/TextSentimentPanel.vue'
import EyeTrackingOverlay from '../answers/EyeTrackingOverlay.vue'
import SessionTranscriptionPanel from '@/ux/UserTest/components/transcription/SessionTranscriptionPanel.vue'
import TranscriptionController from '@/ai/transcriptions/TranscriptionController'
import { findSilences, speechIntervals } from '@/ux/UserTest/utils/silences'

const answerController = new AnswerController()
const transcriptionController = new TranscriptionController()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  taskAnswer: { type: Object, default: null },
  fromEyeTracking: { type: Boolean, default: false },
  userId: { type: String, default: '' },
  selectedTask: { type: Number, default: 0 },
  selectedTaskName: { type: String, default: '' },
  taskDefinitions: { type: Array, default: () => [] },
  testAnswer: { type: Object, default: null },
  answersDocId: { type: String, default: '' },
  taskId: { type: [String, Number], default: null },
  participant: { type: Object, default: null },
  taskSummary: { type: Object, default: null },
  taskCount: { type: Number, default: 0 },
  taskNames: { type: Array, default: () => [] },
  // Deep-link position (seconds) applied once when the media loads.
  startTime: { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue', 'navigate'])

const { t } = useI18n()
const store = useStore()
const currentUser = computed(() => store.getters.user)

const open = ref(props.modelValue)
const rightTab = ref('eye')
const mainVideo1 = ref(null)
const mainVideo2 = ref(null)
const taskAudio = ref(null)
const isPlaying = ref(false)
const videoDuration = ref(0)
const videoCurrentTime = ref(0)
let rafId = null
const predictedData = ref(null)
const selectedView = ref('precision')
const videoReady = ref(false)
const transcriptionRefreshKey = ref(0)
const latestTranscriptionDocId = ref(undefined)
const mediaLayout = ref('both')
const DEFAULT_MEDIA_RATIO = 16 / 9
const screenRatio = ref(DEFAULT_MEDIA_RATIO)
const webcamRatio = ref(DEFAULT_MEDIA_RATIO)
const markers = ref(
  Array.isArray(props.taskAnswer?.markers) ? [...props.taskAnswer.markers] : [],
)
const segments = ref(
  Array.isArray(props.taskAnswer?.segments)
    ? [...props.taskAnswer.segments]
    : [],
)

const MARKER_COLORS = [
  '#FB5C6C',
  '#1E88E5',
  '#43A047',
  '#FB8C00',
  '#8E24AA',
  '#00897B',
]

const colorForAuthor = (authorId) => {
  if (!authorId) return MARKER_COLORS[0]
  let hash = 0
  for (let i = 0; i < authorId.length; i++) {
    hash = (hash * 31 + authorId.charCodeAt(i)) >>> 0
  }
  return MARKER_COLORS[hash % MARKER_COLORS.length]
}

const hasWebcamMedia = computed(() =>
  Boolean(props.taskAnswer?.webcamRecordURL),
)
const hasScreenMedia = computed(() =>
  Boolean(props.taskAnswer?.screenRecordURL),
)

const showWebcamZone = computed(
  () =>
    hasWebcamMedia.value &&
    (!hasScreenMedia.value || mediaLayout.value !== 'screen'),
)
const showScreenZone = computed(
  () =>
    hasScreenMedia.value &&
    (!hasWebcamMedia.value || mediaLayout.value !== 'webcam'),
)

const addMarker = async ({ time, comment }) => {
  const author = currentUser.value
  const marker = {
    id: `marker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time,
    comment,
    authorId: author?.id ?? null,
    authorName:
      author?.username ||
      author?.email ||
      t('analytics.testDetails.unknownAuthor'),
    color: colorForAuthor(author?.id),
  }

  markers.value = [...markers.value, marker].sort((a, b) => a.time - b.time)

  try {
    await answerController.addTaskMarker({
      answersDocId: props.answersDocId,
      userDocId: props.userId,
      taskId: resolvedTaskId.value,
      marker,
    })
  } catch (error) {
    markers.value = markers.value.filter((m) => m.id !== marker.id)
    showError('errors.globalError')
    throw error
  }
}

const addSegment = async ({ startTime, endTime, comment }) => {
  const author = currentUser.value
  const segment = {
    id: `segment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    startTime,
    endTime,
    comment,
    authorId: author?.id ?? null,
    authorName:
      author?.username ||
      author?.email ||
      t('analytics.testDetails.unknownAuthor'),
    color: colorForAuthor(author?.id),
  }

  segments.value = [...segments.value, segment].sort(
    (a, b) => a.startTime - b.startTime,
  )

  try {
    await answerController.addTaskSegment({
      answersDocId: props.answersDocId,
      userDocId: props.userId,
      taskId: resolvedTaskId.value,
      segment,
    })
  } catch (error) {
    segments.value = segments.value.filter((s) => s.id !== segment.id)
    showError('errors.globalError')
    throw error
  }
}

const removeMarker = async (marker) => {
  const previous = markers.value
  markers.value = markers.value.filter((m) => m.id !== marker.id)

  try {
    await answerController.removeTaskMarker({
      answersDocId: props.answersDocId,
      userDocId: props.userId,
      taskId: resolvedTaskId.value,
      marker,
    })
  } catch {
    markers.value = previous
    showError('errors.globalError')
  }
}

const removeSegment = async (segment) => {
  const previous = segments.value
  segments.value = segments.value.filter((s) => s.id !== segment.id)

  try {
    await answerController.removeTaskSegment({
      answersDocId: props.answersDocId,
      userDocId: props.userId,
      taskId: resolvedTaskId.value,
      segment,
    })
  } catch {
    segments.value = previous
    showError('errors.globalError')
  }
}

const removeAnnotation = ({ type, item }) =>
  type === 'segment' ? removeSegment(item) : removeMarker(item)

const updateAnnotation = async ({ type, item, comment }) => {
  const isSegment = type === 'segment'
  const list = isSegment ? segments : markers
  const snapshot = list.value
  const next = { ...item, comment, editedAt: Date.now() }
  list.value = list.value.map((entry) => (entry.id === item.id ? next : entry))

  const target = {
    answersDocId: props.answersDocId,
    userDocId: props.userId,
    taskId: resolvedTaskId.value,
    previous: item,
  }

  try {
    if (isSegment) {
      await answerController.updateTaskSegment({ ...target, segment: next })
    } else {
      await answerController.updateTaskMarker({ ...target, marker: next })
    }
  } catch {
    list.value = snapshot
    showError('errors.globalError')
  }
}

const hasEyeTrackingData = computed(
  () =>
    Array.isArray(props.taskAnswer?.irisTrackingData) &&
    props.taskAnswer.irisTrackingData.length > 0,
)

const hasTaskAudio = computed(() => Boolean(props.taskAnswer?.audioRecordURL))

const hasSentimentData = computed(
  () => Boolean(props.taskAnswer?.webcamRecordURL) || hasTaskAudio.value,
)

const hasAudioFiles = computed(
  () =>
    Boolean(props.taskAnswer?.audioRecordURL) ||
    Boolean(props.taskAnswer?.moderatorAudioURL),
)

// Audio being enabled on the task is not enough: the recording may have been
// blocked or failed to upload, leaving nothing to transcribe.
const hasTranscriptionData = computed(
  () => hasAudioFiles.value || Boolean(props.taskAnswer?.transcriptionDocId),
)

const resolvedTaskId = computed(() => {
  if (props.taskId != null && props.taskId !== '') {
    return String(props.taskId)
  }
  return String(props.selectedTask ?? '')
})

const canLoadTranscriptions = computed(
  () =>
    Boolean(props.answersDocId) &&
    Boolean(props.userId) &&
    Boolean(resolvedTaskId.value),
)

const canTranscribe = computed(
  () => canLoadTranscriptions.value && hasAudioFiles.value,
)

const transcriptionUnavailableMessage = computed(() => {
  if (!hasAudioFiles.value) {
    return 'No audio files available for this task.'
  }
  return 'Missing session identifiers to generate a transcription.'
})

const resolvedTranscriptionDocId = computed(() => {
  if (latestTranscriptionDocId.value === undefined) {
    return props.taskAnswer?.transcriptionDocId || null
  }
  return latestTranscriptionDocId.value
})

const transcriptionPanelKey = computed(
  () =>
    `transcriptions-${props.userId}:${resolvedTaskId.value}:${transcriptionRefreshKey.value}`,
)

const onTranscriptionSaved = (result) => {
  latestTranscriptionDocId.value = result?.id ?? null
  transcriptionRefreshKey.value += 1
}

const onTranscriptionDeleted = (result) => {
  latestTranscriptionDocId.value = result?.transcriptionDocId ?? null
}

const preferredTab = computed(() => {
  if (hasEyeTrackingData.value) return 'eye'
  if (hasSentimentData.value) return 'sentimental'
  if (hasTranscriptionData.value) return 'transcript'
  return 'notes'
})

const availableTabs = computed(() =>
  [
    hasEyeTrackingData.value && 'eye',
    hasSentimentData.value && 'sentimental',
    hasTranscriptionData.value && 'transcript',
    'notes',
  ].filter(Boolean),
)

// Keep the analyst's tab across tasks when the new task still offers it.
function restoreTab() {
  if (!availableTabs.value.includes(rightTab.value)) {
    rightTab.value = preferredTab.value
  }
}

const mediaKey = computed(() => `${props.userId}:${resolvedTaskId.value}`)

const PLAYBACK_RATES = [1, 1.5, 2]
const SKIP_SECONDS = 5
const playbackRate = ref(1)
const hasPlayableMedia = computed(
  () => hasWebcamMedia.value || hasScreenMedia.value || hasTaskAudio.value,
)

function applyPlaybackRate(media) {
  media.defaultPlaybackRate = playbackRate.value
  media.playbackRate = playbackRate.value
}

const participantName = computed(() =>
  String(props.participant?.fullName || props.participant?.email || '').trim(),
)

const participantInitial = computed(() =>
  participantName.value.charAt(0).toUpperCase(),
)

const currentTaskIndex = computed(() => {
  const index = Number(props.selectedTask)
  return Number.isInteger(index) && index >= 0 ? index : 0
})

const taskPositionLabel = computed(() => {
  if (!props.taskCount) return ''
  return t('analytics.testDetails.taskPosition', {
    current: currentTaskIndex.value + 1,
    total: props.taskCount,
  })
})

const toolbarSubtitle = computed(() =>
  [participantName.value, taskPositionLabel.value].filter(Boolean).join(' · '),
)

const canGoPrevious = computed(() => currentTaskIndex.value > 0)
const canGoNext = computed(() => currentTaskIndex.value < props.taskCount - 1)

const adjacentTaskTitle = (offset, labelKey, shortcut) => {
  const index = currentTaskIndex.value + offset
  const label = t(labelKey)
  const name = props.taskNames[index]
  return name ? `${label}: ${name} (${shortcut})` : `${label} (${shortcut})`
}

const previousTaskTitle = computed(() =>
  adjacentTaskTitle(-1, 'analytics.testDetails.previousTask', '←'),
)
const nextTaskTitle = computed(() =>
  adjacentTaskTitle(1, 'analytics.testDetails.nextTask', '→'),
)

const goToTask = (offset) => {
  const nextIndex = currentTaskIndex.value + offset
  if (nextIndex < 0 || nextIndex >= props.taskCount) return
  pendingStartTime = 0
  emit('navigate', nextIndex)
}

const statusIcon = computed(() => {
  if (props.taskSummary?.completed) return 'mdi-check-circle'
  if (props.taskSummary?.attempted) return 'mdi-alert-circle'
  return 'mdi-circle-outline'
})

const displayTaskName = computed(() => {
  const nameFromAnswer = String(props.taskAnswer?.taskName || '').trim()
  if (nameFromAnswer) return nameFromAnswer

  const nameFromSelection = String(props.selectedTaskName || '').trim()
  if (nameFromSelection) return nameFromSelection

  const selectedIndex = Number(props.selectedTask)
  if (
    Number.isInteger(selectedIndex) &&
    selectedIndex >= 0 &&
    props.taskDefinitions?.[selectedIndex]?.taskName
  ) {
    const nameFromDefinition = String(
      props.taskDefinitions[selectedIndex].taskName,
    ).trim()
    if (nameFromDefinition) return nameFromDefinition
  }

  return 'Untitled Task'
})

const DRIFT_SECONDS = 0.35
const audioLeadSeconds = computed(() => (props.taskAnswer?.syncedStart ? 0 : 1))
let holdVideosForAudioLead = false

function videoElements() {
  return [mainVideo1.value, mainVideo2.value].filter(Boolean)
}

function mountedMedia() {
  return [...videoElements(), taskAudio.value].filter(Boolean)
}

function playbackDuration(media) {
  if (!Number.isFinite(media.duration) || media.duration <= 0) return 0
  if (media === taskAudio.value && videoElements().length) {
    return Math.max(0, media.duration - audioLeadSeconds.value)
  }
  return media.duration
}

function seekMedia(media, time) {
  if (!media || !Number.isFinite(time)) return
  const duration = Number.isFinite(media.duration) ? media.duration : time
  const nextTime = Math.min(Math.max(time, 0), duration)
  if (Math.abs(media.currentTime - nextTime) <= 0.05) return
  media.currentTime = nextTime
}

function audioTargetFor(videoTime) {
  return videoTime + audioLeadSeconds.value
}

function audioIsLeading(videoTime) {
  const audio = taskAudio.value
  if (!audio) return false
  if (audioLeadSeconds.value === 0) return true
  const target = audioTargetFor(videoTime)
  return Math.abs(audio.currentTime - target) <= 0.15
}

function audioIsInsideLeadIn(videoTime) {
  const audio = taskAudio.value
  if (!audio || audioLeadSeconds.value === 0) return false
  return (
    audio.currentTime >= videoTime - 0.05 &&
    audio.currentTime < audioTargetFor(videoTime) - 0.05
  )
}

function onMetadataLoaded(event) {
  const media = event.target
  applyPlaybackRate(media)
  if (media.videoWidth > 0 && media.videoHeight > 0) {
    const ratio = media.videoWidth / media.videoHeight
    if (media === mainVideo2.value) screenRatio.value = ratio
    if (media === mainVideo1.value) webcamRatio.value = ratio
  }
  const durations = mountedMedia()
    .map(playbackDuration)
    .filter((duration) => duration > 0)

  videoDuration.value = durations.length
    ? Math.max(...durations)
    : media.duration
  videoReady.value = true

  if (pendingStartTime > 0 && videoCurrentTime.value === 0) {
    const end = videoDuration.value || pendingStartTime
    videoCurrentTime.value = Math.min(pendingStartTime, end)
  }
  pendingStartTime = 0

  if (videoCurrentTime.value > 0) {
    const target =
      media === taskAudio.value
        ? audioTargetFor(videoCurrentTime.value)
        : videoCurrentTime.value
    seekMedia(media, target)
  }
  if (!isPlaying.value || !media.paused) return
  if (media !== taskAudio.value && holdVideosForAudioLead) return
  media.play().catch(() => {})
}

function onTimeUpdate(event) {
  if (!isPlaying.value) {
    videoCurrentTime.value = event.target.currentTime
  }
}

function releaseVideos() {
  const time = videoCurrentTime.value
  holdVideosForAudioLead = false
  videoElements().forEach((video) => {
    if (video.ended) return
    seekMedia(video, time)
    video.play().catch(() => {})
  })
}

function startVideoSync() {
  cancelAnimationFrame(rafId)
  const loop = () => {
    const audio = taskAudio.value
    const videos = videoElements()
    const playingVideos = videos.filter(
      (video) => !video.paused && !video.ended,
    )
    const audioPlaying = Boolean(audio && !audio.paused && !audio.ended)

    if (!playingVideos.length && !audioPlaying) {
      isPlaying.value = false
      holdVideosForAudioLead = false
      return
    }

    if (!playingVideos.length && audioPlaying) {
      const videosWaiting = videos.some((video) => video.paused && !video.ended)
      if (videosWaiting && holdVideosForAudioLead) {
        const releaseAt = audioTargetFor(videoCurrentTime.value)
        if (audio.currentTime + 0.05 >= releaseAt || audio.ended)
          releaseVideos()
      } else if (!videosWaiting) {
        videoCurrentTime.value = Math.max(
          0,
          audio.currentTime - audioLeadSeconds.value,
        )
      }
      rafId = requestAnimationFrame(loop)
      return
    }

    const lead = playingVideos.includes(mainVideo2.value)
      ? mainVideo2.value
      : playingVideos[0]
    videoCurrentTime.value = lead.currentTime

    playingVideos.forEach((video) => {
      if (video === lead) return
      if (Math.abs(video.currentTime - lead.currentTime) > DRIFT_SECONDS) {
        seekMedia(video, lead.currentTime)
      }
    })

    if (audio && !audio.ended) {
      const target = audioTargetFor(lead.currentTime)
      if (
        audio.paused ||
        Math.abs(audio.currentTime - target) > DRIFT_SECONDS
      ) {
        seekMedia(audio, target)
        if (audio.paused) audio.play().catch(() => {})
      }
    }

    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
}

function stopVideoSync() {
  cancelAnimationFrame(rafId)
  rafId = null
}

function onVideoPlay() {
  if (isPlaying.value) return
  isPlaying.value = true
  startVideoSync()
}

function onVideoPause() {
  const anyPlaying = mountedMedia().some(
    (video) => !video.paused && !video.ended,
  )
  if (anyPlaying) return
  isPlaying.value = false
  stopVideoSync()
}

const togglePlay = async () => {
  const media = mountedMedia()
  if (!media.length) return

  if (isPlaying.value) {
    holdVideosForAudioLead = false
    media.forEach((item) => item.pause())
    isPlaying.value = false
    stopVideoSync()
    return
  }

  const time = videoCurrentTime.value
  const audio = taskAudio.value
  videoElements().forEach((video) => {
    if (video.ended) video.currentTime = 0
    else seekMedia(video, time)
  })

  const startVideosNow =
    !audio || audioLeadSeconds.value === 0 || audioIsLeading(time)
  holdVideosForAudioLead =
    Boolean(audio) && audioLeadSeconds.value > 0 && !startVideosNow

  if (audio) {
    if (audioIsLeading(time)) seekMedia(audio, audioTargetFor(time))
    else if (!audioIsInsideLeadIn(time)) seekMedia(audio, time)
    try {
      await audio.play()
    } catch {
      holdVideosForAudioLead = false
    }
  }

  if (!holdVideosForAudioLead) {
    await Promise.all(
      videoElements().map(async (video) => {
        try {
          await video.play()
        } catch {
          // One recording can fail to start without stopping the other.
        }
      }),
    )
  }

  const anyPlaying = mountedMedia().some((item) => !item.paused && !item.ended)
  if (!anyPlaying) {
    holdVideosForAudioLead = false
    return
  }
  isPlaying.value = true
  startVideoSync()
}

const onSeek = (time) => {
  videoCurrentTime.value = time
  videoElements().forEach((video) => seekMedia(video, time))

  const audio = taskAudio.value
  if (audio) {
    const restartLeadIn = audioLeadSeconds.value > 0 && time <= 0.05
    seekMedia(audio, restartLeadIn ? 0 : audioTargetFor(time))
    if (isPlaying.value && restartLeadIn) {
      holdVideosForAudioLead = true
      videoElements().forEach((video) => video.pause())
      audio.play().catch(() => {})
      return
    }
  }

  holdVideosForAudioLead = false
  if (!isPlaying.value) return
  videoElements().forEach((video) => {
    if (!video.ended && video.paused) video.play().catch(() => {})
  })
}

const close = () => {
  stopVideoSync()
  open.value = false
}

const cinemaMode = ref(false)
const cinemaTitle = computed(() =>
  t(
    cinemaMode.value
      ? 'analytics.testDetails.exitCinemaMode'
      : 'analytics.testDetails.cinemaMode',
  ),
)

function toggleCinema() {
  cinemaMode.value = !cinemaMode.value
}

const MEDIA_KINDS = ['screen', 'webcam']
const initialMediaStatus = () =>
  Object.fromEntries(MEDIA_KINDS.map((kind) => [kind, 'loading']))
const mediaStatus = ref(initialMediaStatus())

function setMediaStatus(kind, status) {
  if (mediaStatus.value[kind] === status) return
  // A late "waiting" must not hide a failure the user still has to act on.
  if (mediaStatus.value[kind] === 'error' && status === 'buffering') return
  mediaStatus.value = { ...mediaStatus.value, [kind]: status }
}

function retryMedia(kind) {
  const video = kind === 'screen' ? mainVideo2.value : mainVideo1.value
  if (!video) return
  mediaStatus.value = { ...mediaStatus.value, [kind]: 'loading' }
  video.load()
}

// Transcript times follow the audio file, which leads the videos.
const transcriptTime = computed(
  () => videoCurrentTime.value + audioLeadSeconds.value,
)

function onTranscriptSeek(time) {
  onSeek(Math.max(0, time - audioLeadSeconds.value))
}

const transcriptionRun = ref(null)
let transcriptionFetchGeneration = 0

async function loadTranscriptionRun() {
  const generation = ++transcriptionFetchGeneration
  transcriptionRun.value = null
  if (!open.value || !hasTranscriptionData.value) return
  if (!canLoadTranscriptions.value) return
  try {
    const runs =
      await transcriptionController.getByAnswersDocIdandUserDocIdandTaskId(
        props.answersDocId,
        props.userId,
        resolvedTaskId.value,
      )
    if (generation !== transcriptionFetchGeneration) return
    const list = Array.isArray(runs) ? runs : []
    transcriptionRun.value =
      list.find((run) => run.id === resolvedTranscriptionDocId.value) ||
      list[0] ||
      null
  } catch {
    // Silences are a hint; the transcript tab reports loading errors.
  }
}

// Keep the timeline on the run the transcript tab is showing.
function onTranscriptRunChange(run) {
  transcriptionFetchGeneration += 1
  transcriptionRun.value = run
}

// Computed on the audio clock, then shifted onto the video timeline.
const silences = computed(() => {
  const lead = audioLeadSeconds.value
  const duration = videoDuration.value > 0 ? videoDuration.value + lead : null
  return findSilences(speechIntervals(transcriptionRun.value), { duration })
    .map(({ start, end }) => ({
      start: Math.max(0, start - lead),
      end: Math.max(0, end - lead),
    }))
    .filter(({ start, end }) => end > start)
})

const ANNOTATION_TOLERANCE = 0.5

const annotationTimes = computed(() =>
  [
    ...markers.value.map((marker) => marker.time),
    ...segments.value.map((segment) =>
      Math.min(segment.startTime, segment.endTime),
    ),
  ]
    .filter(Number.isFinite)
    .sort((a, b) => a - b),
)

function jumpToAnnotation(direction) {
  const time = videoCurrentTime.value
  const times = annotationTimes.value
  const target =
    direction > 0
      ? times.find((value) => value > time + ANNOTATION_TOLERANCE)
      : [...times]
          .reverse()
          .find((value) => value < time - ANNOTATION_TOLERANCE)
  if (target === undefined) return
  onSeek(target)
}

let pendingStartTime = 0

async function copyLink() {
  const url = new URL(window.location.href)
  url.searchParams.set('participant', props.userId)
  url.searchParams.set('task', String(currentTaskIndex.value + 1))
  const seconds = Math.floor(videoCurrentTime.value)
  if (seconds > 0) url.searchParams.set('t', String(seconds))
  else url.searchParams.delete('t')
  try {
    await navigator.clipboard.writeText(url.toString())
    showSuccess('analytics.testDetails.linkCopied')
  } catch {
    showError('analytics.testDetails.linkCopyFailed')
  }
}

const managedListeners = useManagedListeners()
managedListeners.addCleanup(() => cancelAnimationFrame(rafId))

function resetPlayback() {
  stopVideoSync()
  holdVideosForAudioLead = false
  mountedMedia().forEach((media) => media.pause())
  isPlaying.value = false
  videoCurrentTime.value = 0
  videoDuration.value = 0
  videoReady.value = false
  predictedData.value = null
  screenRatio.value = DEFAULT_MEDIA_RATIO
  webcamRatio.value = DEFAULT_MEDIA_RATIO
  mediaStatus.value = initialMediaStatus()
}

function isEditableTarget(target) {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [role="tab"], [role="slider"]',
    ),
  )
}

function isInteractiveTarget(target) {
  return (
    target instanceof Element &&
    Boolean(target.closest('button, a, [role="button"]'))
  )
}

function skipBy(seconds) {
  const end = videoDuration.value || Number.POSITIVE_INFINITY
  onSeek(Math.min(Math.max(videoCurrentTime.value + seconds, 0), end))
}

function changePlaybackRate(step) {
  const index = PLAYBACK_RATES.indexOf(playbackRate.value) + step
  if (index < 0 || index >= PLAYBACK_RATES.length) return
  playbackRate.value = PLAYBACK_RATES[index]
}

function pauseIfPlaying() {
  if (isPlaying.value) togglePlay()
}

const canSwitchLayout = computed(
  () => hasWebcamMedia.value && hasScreenMedia.value,
)
const hasTimeline = computed(() => hasPlayableMedia.value)

const shortcutsOpen = ref(false)
const timeline = ref(null)

/*
 * Single source of truth for the keyboard: the handler below and the
 * shortcuts dialog are both built from this list, so they never drift apart.
 * `match` holds lower-cased KeyboardEvent.key values.
 */
const shortcuts = computed(() => {
  const label = (key, params) =>
    t(`analytics.testDetails.keyboardShortcuts.actions.${key}`, params)
  const keyName = (key) =>
    t(`analytics.testDetails.keyboardShortcuts.keys.${key}`)
  const needsMedia = t(
    'analytics.testDetails.keyboardShortcuts.unavailable.media',
  )
  return [
    {
      id: 'toggle-play',
      group: 'playback',
      keys: [keyName('space'), 'K'],
      match: [' ', 'k'],
      label: label('togglePlay'),
      available: hasPlayableMedia.value,
      unavailableHint: needsMedia,
      run: () => togglePlay(),
    },
    {
      id: 'skip-back',
      group: 'playback',
      keys: ['J'],
      match: ['j'],
      repeatable: true,
      label: label('skipBack', { seconds: SKIP_SECONDS }),
      available: hasPlayableMedia.value,
      unavailableHint: needsMedia,
      run: () => skipBy(-SKIP_SECONDS),
    },
    {
      id: 'skip-forward',
      group: 'playback',
      keys: ['L'],
      match: ['l'],
      repeatable: true,
      label: label('skipForward', { seconds: SKIP_SECONDS }),
      available: hasPlayableMedia.value,
      unavailableHint: needsMedia,
      run: () => skipBy(SKIP_SECONDS),
    },
    {
      id: 'restart',
      group: 'playback',
      keys: [keyName('home'), '0'],
      match: ['home', '0'],
      label: label('restart'),
      available: hasPlayableMedia.value,
      unavailableHint: needsMedia,
      run: () => onSeek(0),
    },
    {
      id: 'slower',
      group: 'playback',
      keys: ['<'],
      match: ['<'],
      label: label('slower'),
      available: hasPlayableMedia.value,
      unavailableHint: needsMedia,
      run: () => changePlaybackRate(-1),
    },
    {
      id: 'faster',
      group: 'playback',
      keys: ['>'],
      match: ['>'],
      label: label('faster'),
      available: hasPlayableMedia.value,
      unavailableHint: needsMedia,
      run: () => changePlaybackRate(1),
    },
    {
      id: 'previous-task',
      group: 'navigation',
      keys: ['←'],
      match: ['arrowleft'],
      label: label('previousTask'),
      available: canGoPrevious.value,
      run: () => goToTask(-1),
    },
    {
      id: 'next-task',
      group: 'navigation',
      keys: ['→'],
      match: ['arrowright'],
      label: label('nextTask'),
      available: canGoNext.value,
      run: () => goToTask(1),
    },
    ...['both', 'webcam', 'screen'].map((layout, index) => ({
      id: `layout-${layout}`,
      group: 'view',
      keys: [String(index + 1)],
      match: [String(index + 1)],
      label: label(`layout.${layout}`),
      available: canSwitchLayout.value,
      unavailableHint: t(
        'analytics.testDetails.keyboardShortcuts.unavailable.layout',
      ),
      run: () => {
        mediaLayout.value = layout
      },
    })),
    {
      id: 'cinema',
      group: 'view',
      keys: ['F'],
      match: ['f'],
      label: label('cinema'),
      available: true,
      run: () => toggleCinema(),
    },
    {
      id: 'exit-cinema',
      group: 'view',
      keys: [keyName('esc')],
      match: ['escape'],
      label: label('exitCinema'),
      available: cinemaMode.value,
      unavailableHint: t(
        'analytics.testDetails.keyboardShortcuts.unavailable.cinema',
      ),
      run: () => {
        cinemaMode.value = false
      },
    },
    {
      id: 'add-point',
      group: 'annotations',
      keys: ['M'],
      match: ['m'],
      label: label('addPoint'),
      available: hasTimeline.value,
      unavailableHint: needsMedia,
      run: () => {
        pauseIfPlaying()
        timeline.value?.openAddMenu()
      },
    },
    {
      id: 'start-segment',
      group: 'annotations',
      keys: ['S'],
      match: ['s'],
      label: label('startSegment'),
      available: hasTimeline.value,
      unavailableHint: needsMedia,
      run: () => timeline.value?.setSegmentStart(),
    },
    {
      id: 'previous-annotation',
      group: 'annotations',
      keys: ['P'],
      match: ['p'],
      repeatable: true,
      label: label('previousAnnotation'),
      available: annotationTimes.value.length > 0,
      unavailableHint: t(
        'analytics.testDetails.keyboardShortcuts.unavailable.annotations',
      ),
      run: () => jumpToAnnotation(-1),
    },
    {
      id: 'next-annotation',
      group: 'annotations',
      keys: ['N'],
      match: ['n'],
      repeatable: true,
      label: label('nextAnnotation'),
      available: annotationTimes.value.length > 0,
      unavailableHint: t(
        'analytics.testDetails.keyboardShortcuts.unavailable.annotations',
      ),
      run: () => jumpToAnnotation(1),
    },
    {
      id: 'help',
      group: 'help',
      keys: ['?'],
      match: ['?'],
      label: label('help'),
      available: true,
      run: () => {
        shortcutsOpen.value = !shortcutsOpen.value
      },
    },
  ]
})

const SHORTCUT_GROUPS = [
  'playback',
  'navigation',
  'view',
  'annotations',
  'help',
]

const shortcutGroups = computed(() =>
  SHORTCUT_GROUPS.map((group) => ({
    id: group,
    title: t(`analytics.testDetails.keyboardShortcuts.groups.${group}`),
    items: shortcuts.value.filter((shortcut) => shortcut.group === group),
  })),
)

// Keys typed with Shift on most layouts; Shift is part of the shortcut there.
const SHIFTED_KEYS = new Set(['<', '>', '?'])

function onKeydown(event) {
  if (!open.value || event.defaultPrevented) return
  if (event.altKey || event.ctrlKey || event.metaKey) return
  if (isEditableTarget(event.target)) return
  const key = event.key.toLowerCase()
  if (event.shiftKey && !SHIFTED_KEYS.has(key)) return
  if (shortcutsOpen.value && key !== '?') return

  const shortcut = shortcuts.value.find((item) => item.match.includes(key))
  if (!shortcut || !shortcut.available) return
  if (event.repeat && !shortcut.repeatable) return
  // Space on a focused button already activates that button.
  if (key === ' ' && isInteractiveTarget(event.target)) return

  event.preventDefault()
  shortcut.run()
}

watch(
  open,
  (isOpen) => {
    window.removeEventListener('keydown', onKeydown)
    if (isOpen) window.addEventListener('keydown', onKeydown)
    if (!isOpen) {
      shortcutsOpen.value = false
      cinemaMode.value = false
      pendingStartTime = 0
    }
  },
  { immediate: true },
)

watch(
  () => [props.userId, resolvedTaskId.value],
  () => {
    resetPlayback()
    latestTranscriptionDocId.value = undefined
    transcriptionRefreshKey.value = 0
    markers.value = Array.isArray(props.taskAnswer?.markers)
      ? [...props.taskAnswer.markers]
      : []
    segments.value = Array.isArray(props.taskAnswer?.segments)
      ? [...props.taskAnswer.segments]
      : []
    if (open.value) restoreTab()
  },
)

watch(playbackRate, () => mountedMedia().forEach(applyPlaybackRate))

watch(
  () => [
    open.value,
    props.userId,
    resolvedTaskId.value,
    resolvedTranscriptionDocId.value,
    transcriptionRefreshKey.value,
  ],
  loadTranscriptionRun,
  { immediate: true },
)

watch(
  () => [open.value, props.startTime],
  ([isOpen, startTime]) => {
    if (isOpen && startTime > 0) pendingStartTime = startTime
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  (val) => {
    open.value = val
    if (val) restoreTab()
  },
  { immediate: true },
)
watch(open, (val) => emit('update:modelValue', val))

watch(
  () => props.taskAnswer,
  () => {
    if (open.value) restoreTab()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  managedListeners.removeListeners()
})
</script>

<style scoped>
.session-dialog-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.session-toolbar {
  flex: 0 0 auto;
}

.session-toolbar-subtitle {
  opacity: 0.85;
}

.min-w-0 {
  min-width: 0;
}

.session-toolbar-title {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 34%;
}

.task-nav {
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.task-nav-btn {
  color: #fff;
  text-transform: none;
  letter-spacing: normal;
  border-radius: 0;
  height: 32px !important;
}

.task-nav-divider {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.28);
}

.session-summary {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.session-summary-answer {
  min-width: 0;
  color: rgba(255, 255, 255, 0.85);
}

/* The timeline is fixed to the bottom of the viewport; reserve its space. */
.dialog-body {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  grid-template-rows: minmax(0, 1fr);
  gap: 16px;
  padding: 16px 16px 104px !important;
  overflow: hidden;
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.dialog-body--cinema {
  grid-template-columns: minmax(0, 1fr);
}

.panel-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.panel-header {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.panel-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.shortcut-group + .shortcut-group {
  margin-top: 16px;
}

.shortcut-group-title {
  margin-bottom: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.shortcut-row--unavailable .shortcut-label {
  opacity: 0.55;
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.shortcut-key {
  min-width: 28px;
  padding: 2px 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  border-bottom-width: 2px;
  border-radius: 6px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.analysis-tabs {
  flex: 0 0 auto;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.analysis-tabs :deep(.v-tab) {
  text-transform: none;
  letter-spacing: normal;
  font-weight: 600;
}

.analysis-window {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.media-stage {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  container-type: size;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  background: #0f1720;
}

/* Keep the video box at the recording's ratio so the gaze overlay lines up. */
.media-frame {
  position: relative;
  aspect-ratio: var(--media-ratio);
  width: min(100cqw, calc(100cqh * var(--media-ratio)));
}

.webcam-pip {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 1000;
  width: min(28%, 260px);
  aspect-ratio: var(--media-ratio);
  overflow: hidden;
  border: 2px solid #ffffff;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.media-video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000000;
}

.media-status {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  text-align: center;
  color: #ffffff;
  background: rgba(15, 23, 32, 0.55);
  pointer-events: none;
}

.media-status--loading,
.media-status--error {
  background: rgba(15, 23, 32, 0.85);
}

.media-status--error {
  pointer-events: auto;
}

.media-empty {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.16);
  border-radius: 12px;
}

@media (max-width: 959px) {
  .dialog-body {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .media-stage {
    flex: 0 0 auto;
    aspect-ratio: 16 / 9;
  }

  .analysis-window {
    overflow-y: visible;
  }
}
</style>
