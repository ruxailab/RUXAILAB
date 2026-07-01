<template>
  <v-dialog
    v-model="open"
    fullscreen
    transition="dialog-bottom-transition"
    persistent
  >
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>
          Task Analysis: {{ taskAnswer?.taskName || 'Untitled Task' }}
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text class="dialog-body">
        <v-row class="mb-4">
          <v-col cols="12" md="6" class="mt-16">
            <div
              v-if="rightTab !== 'eye'"
              class="video-box mb-2 video-rect-box"
            >
              <video
                ref="mainVideo1"
                class="video-rect-skeleton"
                controls
                @timeupdate="onTimeUpdate"
                @loadedmetadata="onMetadataLoaded"
              >
                <source :src="taskAnswer?.webcamRecordURL" type="video/mp4" />
              </video>
            </div>

            <div
              v-if="rightTab !== 'sentimental'"
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
                <source :src="taskAnswer?.screenRecordURL" type="video/mp4" />
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
          </v-col>

          <v-col cols="12" md="6">
            <v-tabs v-model="rightTab" bg-color="grey-lighten-4" grow>
              <!-- <v-tab value="general">General</v-tab> -->
              <v-tab v-if="taskAnswer?.irisTrackingData.length > 0" value="eye"
                >Eye Tracker</v-tab
              >
              <v-tab v-if="taskAnswer?.webcamRecordURL" value="sentimental"
                >Sentimental</v-tab
              >
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

              <v-window-item
                v-if="taskAnswer?.irisTrackingData.length > 0"
                value="eye"
              >
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

              <v-window-item
                v-if="taskAnswer?.webcamRecordURL"
                value="sentimental"
              >
                <FacialSentimentPanel
                  :video-element="mainVideo1"
                  :webcam-video-url="taskAnswer?.webcamRecordURL"
                  :test-answer="testAnswer"
                  :selected-task="selectedTask"
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
          </v-col>
        </v-row>

        <SessionTimeline
          :duration="videoDuration"
          :current-time="videoCurrentTime"
          :is-playing="isPlaying"
          @seek="onSeek"
          @toggle-play="togglePlay"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useManagedListeners } from '@/shared/composables/useManagedListeners'
import SessionTimeline from '../sessions/SessionTimeline.vue'
import EyeTrackingStats from '../sessions/EyeTrackingStats.vue'
import FacialSentimentPanel from '../sentimentAnalysis/FacialSentimentPanel.vue'
import EyeTrackingOverlay from '../answers/EyeTrackingOverlay.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  taskAnswer: { type: Object, default: null },
  fromEyeTracking: { type: Boolean, default: false },
  userId: { type: String, default: '' },
  selectedTask: { type: Number, default: 0 },
  testAnswer: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

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
  const video = mainVideo2.value
  if (!video) return

  if (video.paused) {
    video.play()
  } else {
    video.pause()
  }
}

const onSeek = (time) => {
  const video = mainVideo2.value
  if (!video) return

  video.currentTime = time
  videoCurrentTime.value = time
}

const close = () => (open.value = false)

const managedListeners = useManagedListeners()
managedListeners.addCleanup(() => cancelAnimationFrame(rafId))

watch(
  () => props.modelValue,
  (val) => (open.value = val),
)
watch(open, (val) => emit('update:modelValue', val))

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

.dialog-body {
  margin-bottom: 20vh;
}

.video-rect-box,
.video-box {
  flex: 0 0 auto;
}
</style>
