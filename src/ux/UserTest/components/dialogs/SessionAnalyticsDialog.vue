<template>
  <v-dialog
    v-model="open"
    fullscreen
    transition="dialog-bottom-transition"
    persistent
  >
    <v-card>
      <v-toolbar color="primary" dark elevation="2">
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="d-flex align-center">
          <v-icon start size="22">mdi-clipboard-play-outline</v-icon>
          Task Analysis: {{ displayTaskName }}
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text class="dialog-body">
        <v-row class="mb-4" align="stretch">
          <v-col cols="12" md="6">
            <v-card flat rounded="xl" class="panel-card h-100 pa-4">
              <div
                class="panel-header mb-3 d-flex align-center justify-space-between flex-wrap ga-2"
              >
                <div class="d-flex align-center">
                  <v-icon size="18" color="primary" class="mr-2">
                    mdi-video-box
                  </v-icon>
                  <span class="panel-title">Recordings</span>
                </div>

                <v-btn-toggle
                  v-if="hasWebcamMedia && hasScreenMedia"
                  v-model="mediaLayout"
                  density="compact"
                  variant="outlined"
                  color="#FB5C6C"
                  mandatory
                >
                  <v-btn value="both" size="small">Both</v-btn>
                  <v-btn value="webcam" size="small">Webcam</v-btn>
                  <v-btn value="screen" size="small">Screen</v-btn>
                </v-btn-toggle>
              </div>

              <div
                v-if="!hasWebcamMedia && !hasScreenMedia"
                class="text-body-2 text-medium-emphasis"
              >
                No recordings available for this task.
              </div>

              <div v-if="showWebcamZone" class="video-zone mb-3">
                <div class="video-zone-label">
                  <v-icon size="14" class="mr-1"
                    >mdi-account-box-outline</v-icon
                  >
                  Webcam
                </div>
                <div class="video-box video-rect-box">
                  <video
                    ref="mainVideo1"
                    class="video-rect-skeleton"
                    controls
                    @timeupdate="onTimeUpdate"
                    @loadedmetadata="onMetadataLoaded"
                  >
                    <source
                      :src="taskAnswer?.webcamRecordURL"
                      type="video/mp4"
                    />
                  </video>
                </div>
              </div>

              <div v-if="showScreenZone" class="video-zone">
                <div class="video-zone-label">
                  <v-icon size="14" class="mr-1">mdi-monitor-screenshot</v-icon>
                  Screen
                </div>
                <div
                  class="video-box screen-video-box video-rect-box"
                  style="position: relative"
                >
                  <video
                    ref="mainVideo2"
                    class="video-rect-skeleton"
                    @timeupdate="onTimeUpdate"
                    @loadedmetadata="onMetadataLoaded"
                    @play="onVideoPlay"
                    @pause="onVideoPause"
                  >
                    <source
                      :src="taskAnswer?.screenRecordURL"
                      type="video/mp4"
                    />
                  </video>

                  <EyeTrackingOverlay
                    v-if="rightTab === 'eye' && predictedData && videoReady"
                    :video-ref="mainVideo2"
                    :predicted-data="predictedData"
                    :current-time="videoCurrentTime"
                    :is-playing="isPlaying"
                    :view-mode="selectedView"
                  />
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card flat rounded="xl" class="panel-card h-100 pa-4">
              <div class="panel-header mb-1">
                <v-icon size="18" color="primary" class="mr-2">
                  mdi-chart-box-outline
                </v-icon>
                <span class="panel-title">Analysis</span>
              </div>

              <v-tabs
                v-model="rightTab"
                bg-color="transparent"
                color="#FB5C6C"
                slider-size="3"
                grow
              >
                <!-- <v-tab value="general">General</v-tab> -->
                <v-tab v-if="hasEyeTrackingData" value="eye">
                  Eye Tracker
                </v-tab>
                <v-tab v-if="hasSentimentData" value="sentimental">
                  Sentiment Analysis
                </v-tab>
                <v-tab v-if="hasTranscriptionData" value="transcript">
                  Transcriptions
                </v-tab>
                <v-tab value="notes">
                  Points &amp; Segments
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

              <v-window v-model="rightTab" class="mt-4">
                <!-- <v-window-item value="general">
                                <h4 class="text-subtitle-1 mb-1">General Analytics</h4>
                                <TranscriptWordCloud :transcript="taskAnswer?.transcript ?? mockTranscript" />
                                <SentimentSummary :sentiments="taskAnswer?.sentiments ?? mockSentiments" class="mb-4" />
                                <NotesStats :totalNotes="taskAnswer?.notesCount ?? mockNotesCount" class="mb-4" />
                            </v-window-item> -->

                <v-window-item v-if="hasEyeTrackingData" value="eye">
                  <EyeTrackingStats
                    :iris-data="taskAnswer?.irisTrackingData"
                    :user-id="userId"
                    :accuracy="
                      taskAnswer?.eyeTracking?.accuracy ??
                      mockEyeTracking.accuracy
                    "
                    :fixations="
                      taskAnswer?.eyeTracking?.fixations ??
                      mockEyeTracking.fixations
                    "
                    class="mb-4"
                    @predictions-ready="predictedData = $event"
                    @view-changed="selectedView = $event"
                  />
                </v-window-item>

                <v-window-item v-if="hasSentimentData" value="sentimental">
                  <FacialSentimentPanel
                    :video-element="mainVideo1"
                    :webcam-video-url="taskAnswer?.webcamRecordURL"
                    :test-answer="testAnswer"
                    :selected-task="selectedTask"
                    :answers-doc-id="answersDocId"
                    :user-doc-id="userId"
                    :task-id="resolvedTaskId"
                    :study-id="testAnswer?.studyId || null"
                  />
                </v-window-item>

                <v-window-item v-if="hasTranscriptionData" value="transcript">
                  <v-sheet class="rounded-lg" color="grey-lighten-5">
                    <v-alert
                      v-if="!canTranscribe"
                      type="info"
                      variant="tonal"
                      density="comfortable"
                      class="ma-4 mb-0"
                    >
                      {{ transcriptionUnavailableMessage }}
                    </v-alert>

                    <TimelinePanel
                      v-if="canTranscribe"
                      :key="timelinePanelKey"
                      :answers-doc-id="answersDocId"
                      :user-doc-id="userId"
                      :task-id="resolvedTaskId"
                      :study-id="testAnswer?.studyId || null"
                      :audio-url-evaluator="taskAnswer?.audioRecordURL"
                      :audio-url-moderator="taskAnswer?.moderatorAudioURL"
                      :show-inline-result="true"
                      :show-inline-empty-state="false"
                      @saved="onTranscriptionSaved"
                    />

                    <TranscriptionsPanel
                      v-if="canLoadTranscriptions"
                      :key="transcriptionPanelKey"
                      :answers-doc-id="answersDocId"
                      :user-doc-id="userId"
                      :task-id="resolvedTaskId"
                      :transcription-doc-id="
                        latestTranscriptionDocId ||
                        taskAnswer?.transcriptionDocId
                      "
                      @deleted="onTranscriptionDeleted"
                    />
                  </v-sheet>
                </v-window-item>

                <v-window-item value="notes">
                  <div v-if="markers.length === 0 && segments.length === 0">
                    <v-alert type="info" variant="tonal" density="comfortable">
                      No points of interest or segments have been added yet.
                    </v-alert>
                  </div>

                  <div v-else>
                    <div v-if="markers.length" class="mb-4">
                      <div class="text-subtitle-2 font-weight-bold mb-2">
                        Points of interest ({{ markers.length }})
                      </div>
                      <v-list density="compact" class="pa-0">
                        <v-list-item
                          v-for="marker in markersView"
                          :key="marker.id"
                          class="note-list-item"
                          @click="onSeek(marker.time)"
                        >
                          <template #prepend>
                            <span
                              class="marker-author-dot mr-3"
                              :style="{ backgroundColor: marker.color }"
                            />
                          </template>
                          <v-list-item-title>
                            {{ marker.timeLabel }} ·
                            {{ marker.authorName }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ marker.comment }}
                          </v-list-item-subtitle>
                          <template #append>
                            <v-btn
                              icon="mdi-delete-outline"
                              size="small"
                              variant="text"
                              color="error"
                              title="Delete point of interest"
                              @click.stop="removeMarker(marker)"
                            />
                          </template>
                        </v-list-item>
                      </v-list>
                    </div>

                    <div v-if="segments.length">
                      <div class="text-subtitle-2 font-weight-bold mb-2">
                        Segments ({{ segments.length }})
                      </div>
                      <v-list density="compact" class="pa-0">
                        <v-list-item
                          v-for="segment in segmentsView"
                          :key="segment.id"
                          class="note-list-item"
                          @click="onSeek(segment.startTime)"
                        >
                          <template #prepend>
                            <span
                              class="marker-author-dot mr-3"
                              :style="{ backgroundColor: segment.color }"
                            />
                          </template>
                          <v-list-item-title>
                            {{ segment.startLabel }} – {{ segment.endLabel }} ·
                            {{ segment.authorName }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ segment.comment }}
                          </v-list-item-subtitle>
                          <template #append>
                            <v-btn
                              icon="mdi-delete-outline"
                              size="small"
                              variant="text"
                              color="error"
                              title="Delete segment"
                              @click.stop="removeSegment(segment)"
                            />
                          </template>
                        </v-list-item>
                      </v-list>
                    </div>
                  </div>
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
          </v-col>
        </v-row>

        <SessionTimeline
          :duration="videoDuration"
          :current-time="videoCurrentTime"
          :is-playing="isPlaying"
          :markers="markers"
          :segments="segments"
          @seek="onSeek"
          @toggle-play="togglePlay"
          @add-marker="addMarker"
          @add-segment="addSegment"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useStore } from 'vuex'
import { useManagedListeners } from '@/shared/composables/useManagedListeners'
import AnswerController from '@/shared/controllers/AnswerController'
import { showError } from '@/shared/utils/toast'
import { formatTime } from '@/shared/utils/timeUtils'
import SessionTimeline from '../sessions/SessionTimeline.vue'
import EyeTrackingStats from '../sessions/EyeTrackingStats.vue'
import FacialSentimentPanel from '../sentimentAnalysis/FacialSentimentPanel.vue'
import EyeTrackingOverlay from '../answers/EyeTrackingOverlay.vue'
import TimelinePanel from '@/ux/UserTest/components/transcription/TimeLinePanel.vue'
import TranscriptionsPanel from '@/ux/UserTest/components/transcription/TranscriptionsPanel.vue'

const answerController = new AnswerController()

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
  hasAudioRecord: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const store = useStore()
const currentUser = computed(() => store.getters.user)

const open = ref(props.modelValue)
const rightTab = ref('eye')
const mainVideo1 = ref(null)
const mainVideo2 = ref(null)
const isPlaying = ref(false)
const videoDuration = ref(0)
const videoCurrentTime = ref(0)
let rafId = null
const predictedData = ref(null)
const selectedView = ref('precision')
const videoReady = ref(false)
const transcriptionRefreshKey = ref(0)
const latestTranscriptionDocId = ref(null)
const mediaLayout = ref('both')
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
    authorName: author?.username || author?.email || 'Unknown',
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
    authorName: author?.username || author?.email || 'Unknown',
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
  } catch (error) {
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
  } catch (error) {
    segments.value = previous
    showError('errors.globalError')
  }
}

const markersView = computed(() =>
  markers.value.map((marker) => ({
    ...marker,
    timeLabel: formatTime(marker.time),
  })),
)

const segmentsView = computed(() =>
  segments.value.map((segment) => ({
    ...segment,
    startLabel: formatTime(segment.startTime),
    endLabel: formatTime(segment.endTime),
  })),
)

const hasEyeTrackingData = computed(
  () =>
    Array.isArray(props.taskAnswer?.irisTrackingData) &&
    props.taskAnswer.irisTrackingData.length > 0,
)

const hasSentimentData = computed(() =>
  Boolean(props.taskAnswer?.webcamRecordURL),
)

const hasTranscriptionData = computed(
  () =>
    Boolean(props.hasAudioRecord) ||
    Boolean(props.taskAnswer?.audioRecordURL) ||
    Boolean(props.taskAnswer?.moderatorAudioURL) ||
    Boolean(props.taskAnswer?.transcriptionDocId),
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

const hasAudioFiles = computed(
  () =>
    Boolean(props.taskAnswer?.audioRecordURL) ||
    Boolean(props.taskAnswer?.moderatorAudioURL),
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

const timelinePanelKey = computed(
  () =>
    `timeline-${props.userId}:${resolvedTaskId.value}:${transcriptionRefreshKey.value}`,
)

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
  transcriptionRefreshKey.value += 1
}

const preferredTab = computed(() => {
  if (hasEyeTrackingData.value) return 'eye'
  if (hasSentimentData.value) return 'sentimental'
  if (hasTranscriptionData.value) return 'transcript'
  return 'eye'
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

const mockEyeTracking = { accuracy: 92, fixations: 34 }

function onMetadataLoaded(event) {
  const video = event.target

  videoDuration.value = video.duration
  videoReady.value = true
}

function onTimeUpdate(event) {
  videoCurrentTime.value = event.target.currentTime
}

function onVideoPlay() {
  isPlaying.value = true
}

function onVideoPause() {
  isPlaying.value = false
}

const togglePlay = () => {
  const video = mainVideo2.value || mainVideo1.value
  if (!video) return

  if (video.paused) {
    video.play()
  } else {
    video.pause()
  }
}

const onSeek = (time) => {
  const video = mainVideo2.value || mainVideo1.value
  if (!video) return

  video.currentTime = time
  videoCurrentTime.value = time
}

const close = () => (open.value = false)

const managedListeners = useManagedListeners()
managedListeners.addCleanup(() => cancelAnimationFrame(rafId))

watch(
  () => [props.userId, resolvedTaskId.value],
  () => {
    latestTranscriptionDocId.value = null
    transcriptionRefreshKey.value = 0
    markers.value = Array.isArray(props.taskAnswer?.markers)
      ? [...props.taskAnswer.markers]
      : []
    segments.value = Array.isArray(props.taskAnswer?.segments)
      ? [...props.taskAnswer.segments]
      : []
    mediaLayout.value = 'both'
  },
)

watch(
  () => props.modelValue,
  (val) => {
    open.value = val
    if (val) {
      rightTab.value = preferredTab.value
    }
  },
)
watch(open, (val) => emit('update:modelValue', val))

watch(
  () => props.taskAnswer,
  () => {
    if (open.value) {
      rightTab.value = preferredTab.value
    }
  },
  { deep: true },
)

onMounted(() => {
  const video = mainVideo2.value
  if (!video) return

  managedListeners.addListeners([
    { target: video, event: 'loadedmetadata', handler: onMetadataLoaded },
    { target: video, event: 'play', handler: onVideoPlay },
    { target: video, event: 'pause', handler: onVideoPause },
  ])
})
onBeforeUnmount(() => {
  managedListeners.removeListeners()
})
</script>

<style scoped>
.video-rect-skeleton {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
}

.video-rect-box {
  background-color: #f9f9f9;
  border-radius: 10px;
  overflow: hidden;
}

.panel-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.panel-header {
  display: flex;
  align-items: center;
}

.panel-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.video-zone-label {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 4px;
}

.dialog-body {
  margin-bottom: 96px;
}

.marker-author-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.note-list-item {
  cursor: pointer;
  border-radius: 8px;
}

.note-list-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.video-rect-box,
.video-box {
  flex: 0 0 auto;
}
</style>
