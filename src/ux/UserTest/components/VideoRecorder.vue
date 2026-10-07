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
} from '@/ux/UserTest/utils/recordingOutcome'
import {
  createMediaRecorder,
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

const startRecording = async () => {
  if (recording.value) return true
  recording.value = true
  const taskIndex = props.taskIndex
  const userId = resolvedUserDocId.value
  const testId = props.testId
  const attempt = createRecordingAttempt(taskIndex, 'webcam', emit)
  activeAttempt = attempt
  let stream
  let recorder
  let stage = 'permission'
  let abandoned = false
  let abort = () => {}
  const cleanup = () => {
    stopMediaStream(stream)
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop()
      } catch {
        /* Already stopped. */
      }
    }
    if (activeAttempt !== attempt) return
    activeAttempt = null
    recording.value = false
    if (abortCurrent === abort) abortCurrent = () => {}
  }
  abort = () => {
    abandoned = true
    attempt.discard()
    cleanup()
  }
  abortCurrent = abort
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    if (abandoned) {
      cleanup()
      return true
    }
    if (!devices.some((device) => device.kind === 'videoinput')) {
      attempt.finish('failed', 'permission', 'deviceUnavailable')
      showWarning(t('errors.cameraNotAvailable'))
      cleanup()
      return true
    }
    stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (abandoned) {
      cleanup()
      return true
    }
    stage = 'capture'
    recorder = createMediaRecorder({
      stream,
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
    mediaRecorder.value = recorder
    recorder.start()
  } catch (error) {
    const failure = captureFailure(error, stage)
    attempt.finish(...failure)
    cleanup()
    if (failure[0] === 'permission_denied')
      showError(t('errors.cameraPermissionDenied'))
    else if (failure[2] === 'deviceUnavailable')
      showWarning(t('errors.cameraNotAvailable'))
    else showError(t('errors.globalError'))
  }
  // Camera remains optional; a failure must not prevent starting the task.
  return true
}

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive')
    mediaRecorder.value.stop()
}

onBeforeUnmount(() => abortCurrent())

defineExpose({
  startRecording,
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
