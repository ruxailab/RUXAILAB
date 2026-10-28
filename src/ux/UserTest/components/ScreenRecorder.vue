<template>
  <div />
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { storage } from '@/app/plugins/firebase'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'
import { showError, showWarning } from '@/shared/utils/toast'
import { createRecordingAttempt } from '@/ux/UserTest/utils/recordingOutcome'
import {
  createMediaRecorder,
  saveRecordedMedia,
} from '@/ux/UserTest/utils/mediaRecording'
import {
  startScreenShareStream,
  stopMediaStream,
} from '@/shared/utils/screenShareCapture'

const props = defineProps({
  testId: String,
  taskIndex: Number,
  userDocId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['showLoading', 'stopShowLoading', 'recording-result'])

const store = useStore()
const { t } = useI18n()
const notifyRecordingFailure = ({ key, mediaKey, severity }) => {
  const message = mediaKey ? t(key, { media: t(mediaKey) }) : t(key)
  if (severity === 'warning') showWarning(message)
  else showError(message)
}
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

const isCapturing = ref(false)
const mediaRecorder = ref(null)
let abortCurrent = () => {}
let activeAttempt = null
let currentStream = null
let currentRecorder = null
let aborted = false

const cleanup = () => {
  stopMediaStream(currentStream)
  if (currentRecorder && currentRecorder.state !== 'inactive') {
    try {
      currentRecorder.stop()
    } catch {
      /* Already stopped. */
    }
  }
  if (activeAttempt) {
    activeAttempt = null
  }
  currentStream = null
  currentRecorder = null
  mediaRecorder.value = null
  isCapturing.value = false
}

abortCurrent = () => {
  aborted = true
  if (activeAttempt) {
    activeAttempt.discard()
  }
  cleanup()
}

const prepareScreen = async ({ requireEntireScreen = false } = {}) => {
  if (isCapturing.value) return true
  isCapturing.value = true
  aborted = false
  const taskIndex = props.taskIndex
  const userId = resolvedUserDocId.value
  const testId = props.testId
  const attempt = createRecordingAttempt(
    taskIndex,
    'screen',
    emit,
    notifyRecordingFailure,
  )
  activeAttempt = attempt

  try {
    const result = await startScreenShareStream({ requireEntireScreen })
    currentStream = result.stream
    if (aborted) {
      cleanup()
      return false
    }
    if (!result.ok) {
      attempt.finish(
        result.reason === 'cancelled' ? 'cancelled' : 'failed',
        'permission',
        result.reason,
      )
      cleanup()
      return false
    }
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
          storagePath: `tests/${testId}/${userId}/task_${taskIndex}/screen_record/${Date.now()}.webm`,
          store,
          taskIndex,
          mediaType: MEDIA_FIELD_MAP.screen,
          userId,
        }),
    })
    mediaRecorder.value = currentRecorder
    const [track] = currentStream.getVideoTracks
      ? currentStream.getVideoTracks()
      : currentStream.getTracks
        ? currentStream.getTracks()
        : []
    if (track)
      track.onended = () => {
        if (currentRecorder && currentRecorder.state !== 'inactive')
          currentRecorder.stop()
      }
    return true
  } catch {
    attempt.finish('failed', 'capture', 'captureError')
    cleanup()
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

const captureScreen = async (options) => {
  const prepared = await prepareScreen(options)
  if (!prepared) return false
  return startNow()
}

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive')
    mediaRecorder.value.stop()
}
const abortCapture = () => abortCurrent()

onBeforeUnmount(() => abortCurrent())

defineExpose({
  captureScreen,
  prepareScreen,
  startNow,
  stopRecording,
  abortCapture,
})
</script>
