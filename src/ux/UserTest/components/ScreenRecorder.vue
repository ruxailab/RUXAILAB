<template>
  <div />
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { storage } from '@/app/plugins/firebase'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'
import { showError } from '@/shared/utils/toast'
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

const captureScreen = async ({ requireEntireScreen = false } = {}) => {
  if (isCapturing.value) return true
  isCapturing.value = true
  const taskIndex = props.taskIndex
  const userId = resolvedUserDocId.value
  const testId = props.testId
  const attempt = createRecordingAttempt(taskIndex, 'screen', emit)
  activeAttempt = attempt
  let stream
  let recorder
  let aborted = false
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
    isCapturing.value = false
  }
  abortCurrent = () => {
    aborted = true
    attempt.discard()
    cleanup()
  }
  try {
    const result = await startScreenShareStream({ requireEntireScreen })
    stream = result.stream
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
      showError(`errors.screenShare.${result.reason}`)
      cleanup()
      return false
    }
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
          storagePath: `tests/${testId}/${userId}/task_${taskIndex}/screen_record/${Date.now()}.webm`,
          store,
          taskIndex,
          mediaType: MEDIA_FIELD_MAP.screen,
          userId,
        }),
    })
    mediaRecorder.value = recorder
    const [track] = stream.getVideoTracks()
    if (track)
      track.onended = () => {
        if (recorder.state !== 'inactive') recorder.stop()
      }
    recorder.start()
    return true
  } catch {
    attempt.finish('failed', 'capture', 'captureError')
    cleanup()
    showError('errors.screenShare.error')
    return false
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive')
    mediaRecorder.value.stop()
}
const abortCapture = () => abortCurrent()

onBeforeUnmount(() => abortCurrent())

defineExpose({ captureScreen, stopRecording, abortCapture })
</script>
