<template>
    <v-dialog v-model="open" fullscreen transition="dialog-bottom-transition" persistent>
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
                        <div class="video-box mb-2 video-rect-box" v-if="rightTab !== 'eye'">
                            <video ref="mainVideo1" class="video-rect-skeleton" controls @timeupdate="onTimeUpdate"
                                @loadedmetadata="onMetadataLoaded"
                                :poster="taskAnswer?.evaluatorPoster ?? defaultPosters.evaluator">
                                <source :src="taskAnswer?.webcamRecordURL ?? defaultVideos.evaluator"
                                    type="video/mp4" />
                            </video>
                        </div>

                        <div class="video-box screen-video-box video-rect-box" style="position: relative;"
                            v-if="rightTab !== 'sentimental'">
                            <video ref="mainVideo2" class="video-rect-skeleton" @timeupdate="onTimeUpdate"
                                @loadedmetadata="onMetadataLoaded"
                                :poster="taskAnswer?.screenPoster ?? defaultPosters.screen">
                                <source :src="taskAnswer?.screenRecordURL ?? defaultVideos.screen" type="video/mp4" />
                            </video>

                            <EyeTrackingOverlay v-show="rightTab === 'eye' && predictedData" :video-ref="mainVideo2"
                                :predictedData="predictedData" :current-time="videoCurrentTime" :is-playing="isPlaying"
                                :view-mode="selectedView" />
                        </div>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-tabs v-model="rightTab" background-color="grey-lighten-4" grow>
                            <!-- <v-tab value="general">General</v-tab> -->
                            <v-tab value="eye">Eye Tracker</v-tab>
                            <v-tab value="sentimental">Sentimental</v-tab>
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

                            <v-window-item value="eye">
                                <EyeTrackingStats :iris-data="taskAnswer?.irisTrackingData"
                                    :accuracy="taskAnswer?.eyeTracking?.accuracy ?? mockEyeTracking.accuracy"
                                    :fixations="taskAnswer?.eyeTracking?.fixations ?? mockEyeTracking.fixations"
                                    @predictions-ready="predictedData = $event" @view-changed="selectedView = $event"
                                    class="mb-4" />
                            </v-window-item>

                            <v-window-item value="sentimental">
                                <FacialSentimentPanel :video-element="mainVideo1"
                                    :webcam-video-url="taskAnswer?.webcamRecordURL ?? defaultVideos.evaluator" />
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

                <v-col cols="12" class="mt-4">
                    {{ ' videoDuration -' + videoDuration }}
                    {{ ' videoCurrentTime -' + videoCurrentTime }}
                    {{ ' isPlaying -' + isPlaying }}
                    <SessionTimeline :duration="videoDuration" :currentTime="videoCurrentTime" :isPlaying="isPlaying"
                        @seek="onSeek" @togglePlay="togglePlay" />
                </v-col>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import SessionTimeline from '../sessions/SessionTimeline.vue'
import TranscriptWordCloud from '../sessions/TranscriptWordCloud.vue'
import EyeTrackingStats from '../sessions/EyeTrackingStats.vue'
import FacialSentimentPanel from '../sentimentAnalysis/FacialSentimentPanel.vue'
import SentimentSummary from '../sessions/SentimentSummary.vue'
import EyeTrackingOverlay from '../answers/EyeTrackingOverlay.vue'

const props = defineProps({
    modelValue: { type: Boolean, required: true },
    taskAnswer: { type: Object, default: null },
    fromEyeTracking: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const open = ref(props.modelValue)
watch(() => props.modelValue, val => open.value = val)
watch(open, val => emit('update:modelValue', val))

const rightTab = ref('eye')
const mainVideo1 = ref(null)
const mainVideo2 = ref(null)
const isPlaying = ref(false)
const videoDuration = ref(0)
const videoCurrentTime = ref(0)
let rafId = null
const predictedData = ref(null)
const selectedView = ref('precision')

const defaultVideos = {
    evaluator: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    screen: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4'
}
const defaultPosters = {
    evaluator: 'https://dummyimage.com/800x450/eeeeee/000000&text=Evaluator+Video',
    screen: 'https://dummyimage.com/800x450/eeeeee/000000&text=Screen+Recording'
}
const mockTranscript = 'Usuario realizó la tarea correctamente...'
const mockEyeTracking = { accuracy: 92, fixations: 34 }
const mockSentiments = ['positivo', 'neutral', 'negativo']
const mockNotesCount = 5

function updateLoop() {
    if (!isPlaying.value) return
    const video = mainVideo2.value
    if (video) {
        videoCurrentTime.value = video.currentTime
        rafId = requestAnimationFrame(updateLoop)
    }
}

function onMetadataLoaded(event) {
    const video = event.target
    videoDuration.value = video.duration
}

function onTimeUpdate(event) {
    const video = event.target
    videoCurrentTime.value = video.currentTime
}

const togglePlay = () => {
    const video = mainVideo2.value
    if (!video) return

    if (isPlaying.value) {
        video.pause()
        cancelAnimationFrame(rafId)
        isPlaying.value = false
    } else {
        video.play()
        isPlaying.value = true
        updateLoop()
    }
}

const onSeek = (time) => {
    const video = mainVideo2.value
    if (!video) return
    cancelAnimationFrame(rafId)
    video.currentTime = time
    videoCurrentTime.value = time
    if (isPlaying.value) updateLoop()
}

const close = () => open.value = false

onMounted(() => {
    const video = mainVideo2.value
    if (!video) return

    video.addEventListener('loadedmetadata', () => {
        videoDuration.value = video.duration
    })

    video.addEventListener('play', () => {
        console.log('video PLAY')
        isPlaying.value = true
        updateLoop()
    })

    video.addEventListener('pause', () => {
        console.log('video PAUSE')
        isPlaying.value = false
        cancelAnimationFrame(rafId)
    })
})

watch(predictedData, (v) => {
    console.log('[Pai] predictedData mudou para', v)
})

watch(isPlaying, (v) => {
    console.log('[Pai] isPlaying mudou para', v)
})

onBeforeUnmount(() => cancelAnimationFrame(rafId))
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

.sentiment-panel {
    display: block;
}
</style>
