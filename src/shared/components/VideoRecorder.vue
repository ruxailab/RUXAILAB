<template>
  <div>
    <!-- <v-col>
      <v-row>
        <v-tooltip
          v-if="!recording"
          location="bottom"
        >
          <template #activator="{ props }">
            <v-btn
              class="ml-4 my-2 mr-auto"
              elevation="0"
              icon
              v-bind="props"
              @click="startRecording"
            >
              <v-icon>mdi-camera</v-icon>
            </v-btn>
          </template>
<span>Start Recording</span>
</v-tooltip>
<v-tooltip v-if="recording" location="bottom">
  <template #activator="{ props }">
            <v-btn
              class="ml-4 my-2 mr-auto"
              color="red"
              icon
              v-bind="props"
              @click="stopRecording"
            >
              <v-icon>
                mdi-stop
              </v-icon>
            </v-btn>
          </template>
  <span>Stop Recording</span>
</v-tooltip>
</v-row>
</v-col> -->
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { storage } from '@/app/plugins/firebase'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'
import { showError, showWarning } from '@/shared/utils/toast'
import {
  createRecordingAttempt,
  captureFailure,
  isDeviceBusyError,
} from '@/ux/UserTest/utils/recordingOutcome'
import {
  createMediaRecorder,
  openCameraStream,
  saveRecordedMedia,
} from '@/ux/UserTest/utils/mediaRecording'
import { stopMediaStream } from '@/shared/utils/screenShareCapture'

const props = defineProps({
  testId: {
    type: String,
  },
  userDocId: {
    type: String,
  },
  taskIndex: {
    type: Number,
  },
})

const emit = defineEmits(['showLoading', 'stopShowLoading', 'recording-result'])

const store = useStore()
const { t } = useI18n()
const currentUserTestAnswer = computed(
  () => store.getters.currentUserTestAnswer,
)
const currentCardSortingAnswer = computed(
  () => store.getters.currentCardSortingAnswer,
)
const resolvedUserDocId = computed(
  () =>
    props.userDocId ||
    currentUserTestAnswer.value?.userDocId ||
    currentCardSortingAnswer.value?.userDocId,
)

const recording = ref(false)
const mediaRecorder = ref(null)
let abortCurrent = () => {}
let activeAttempt = null

const notifyRecordingFailure = ({ key, mediaKey, severity }) => {
  const message = mediaKey ? t(key, { media: t(mediaKey) }) : t(key)
  if (severity === 'warning') showWarning(message)
  else showError(message)
}

let currentStream = null
let currentRecorder = null
let stage = 'permission'
let abandoned = false

const cleanup = () => {
  stopMediaStream(currentStream)
  if (currentRecorder && currentRecorder.state !== 'inactive') {
    try {
      currentRecorder.stop()
    } catch {
      /* Already stopped. */
    }
  }
  currentStream = null
  currentRecorder = null
  mediaRecorder.value = null
  activeAttempt = null
  recording.value = false
}

abortCurrent = () => {
  abandoned = true
  if (activeAttempt) {
    activeAttempt.discard()
  }
  cleanup()
}

const prepareCam = async () => {
  if (recording.value) return true
  recording.value = true
  abandoned = false
  const taskIndex = props.taskIndex
  const userId = resolvedUserDocId.value
  const testId = props.testId
  const attempt = createRecordingAttempt(
    taskIndex,
    'webcam',
    emit,
    notifyRecordingFailure,
  )
  activeAttempt = attempt
  stage = 'permission'

  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    if (abandoned) {
      cleanup()
      return false
    }
    if (!devices.some((device) => device.kind === 'videoinput')) {
      attempt.finish('failed', 'permission', 'deviceUnavailable')
      cleanup()
      return false
    }
    currentStream = await openCameraStream(navigator.mediaDevices)
    if (abandoned) {
      cleanup()
      return false
    }
    stage = 'capture'
    currentRecorder = createMediaRecorder({
      stream: currentStream,
      blobType: 'video/webm',
      attempt,
      emit,
      cleanup,
      save: (blob) =>
        saveRecordedMedia({
          blob,
          storage,
          storagePath: `tests/${testId}/${userId}/task_${taskIndex}/video/${Date.now()}.webm`,
          store,
          taskIndex,
          mediaType: MEDIA_FIELD_MAP.webcam,
          userId,
        }),
    })
    mediaRecorder.value = currentRecorder
    return true
  } catch (error) {
    const failure = captureFailure(error, stage)
    attempt.finish(...failure)
    cleanup()
    if (failure[0] === 'permission_denied')
      showError(t('errors.cameraPermissionDenied'))
    else if (isDeviceBusyError(error)) showWarning(t('errors.cameraBusy'))
    else if (failure[2] === 'deviceUnavailable')
      showWarning(t('errors.cameraNotAvailable'))
    else showError(t('errors.globalError'))
    return false
  }
}

const startNow = () => {
  if (!currentRecorder) return false
  if (currentRecorder.state !== 'inactive') return true
  const [track] =
    currentStream?.getVideoTracks?.() || currentStream?.getTracks?.() || []
  if (!currentStream || !track || track.readyState === 'ended') {
    if (activeAttempt) {
      activeAttempt.finish('failed', 'capture', 'captureError')
    }
    cleanup()
    return false
  }
  try {
    currentRecorder.start()
    return true
  } catch {
    if (activeAttempt) {
      activeAttempt.finish('failed', 'capture', 'captureError')
    }
    cleanup()
    return false
  }
}

const startRecording = async () => {
  const prepared = await prepareCam()
  if (!prepared) return true // Camera remains optional; failure does not block
  return startNow()
}

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive')
    mediaRecorder.value.stop()
}

onBeforeUnmount(() => abortCurrent())

defineExpose({
  startRecording,
  prepareCam,
  startNow,
  stopRecording,
  abortCapture: () => abortCurrent(),
})
</script>

<style scoped>
.web-cam {
  position: relative;
  text-align: center;
  height: 125px;
  width: 125px;
  border-radius: 50%;
  overflow: hidden;
  mask-image: radial-gradient(circle, white 100%, black 100%);
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
