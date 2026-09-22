<template>
  <div>
    <!-- <v-col>
      <v-row>
        <v-tooltip
          v-if="!recordingAudio"
          location="bottom"
        >
          <template #activator="{ props }">
            <v-btn
              elevation="0"
              icon
              class="ml-4 my-2 mr-auto"
              v-bind="props"
              @click="startAudioRecording"
            >
              <v-icon>mdi-microphone</v-icon>
            </v-btn>
          </template>
          <span>Start Audio Record</span>
        </v-tooltip>
        <v-tooltip
          v-if="recordingAudio"
          location="bottom"
        >
          <template #activator="{ props }">
            <v-btn
              color="red"
              elevation="0"
              icon
              class="ml-4 my-2 mr-auto xl"
              v-bind="props"
              @click="stopAudioRecording"
            >
              <v-icon>mdi-stop</v-icon>
            </v-btn>
          </template>
          <span>Stop Audio Record</span>
        </v-tooltip>
      </v-row>
    </v-col> -->
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import { storage } from '@/app/plugins/firebase'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'
import {
  createRecordingAttempt,
  captureFailure,
} from '@/ux/UserTest/utils/recordingOutcome'
import { stopMediaStream } from '@/shared/utils/screenShareCapture'

const props = defineProps({
  testId: {
    type: String,
    default: '',
  },
  taskIndex: {
    type: Number,
    default: 0,
  },
  userDocId: {
    type: String,
    default: '',
  },
  showVisualizer: {
    type: Boolean,
    default: false,
  },
  remoteStream: {
    type: MediaStream,
    default: null,
  },
  shouldRecordModerator: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'recordingStarted',
  'showLoading',
  'stopShowLoading',
  'recording-result',
])

const store = useStore()

const recordingAudio = ref(false)
const mediaRecorder = ref(null)
const moderatorRecorder = ref(null)
let abortCurrent = () => {}
let activeAttempt = null

// Computed properties
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

const startAudioRecording = async () => {
  if (recordingAudio.value) return
  recordingAudio.value = true
  const taskIndex = props.taskIndex
  const userId = resolvedUserDocId.value
  const testId = props.testId
  const attempt = createRecordingAttempt(taskIndex, 'audio', emit)
  activeAttempt = attempt
  const chunks = []
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
    recordingAudio.value = false
    emit('recordingStarted', false)
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
      return
    }
    if (!devices.some((device) => device.kind === 'audioinput')) {
      attempt.finish('failed', 'permission', 'deviceUnavailable')
      cleanup()
      return
    }
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    if (abandoned) {
      cleanup()
      return
    }
    stage = 'capture'
    recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    mediaRecorder.value = recorder
    recorder.ondataavailable = ({ data }) => {
      if (data.size) chunks.push(data)
    }
    recorder.onerror = () => {
      if (attempt.finish('failed', 'capture', 'captureError')) cleanup()
    }
    recorder.onstop = async () => {
      if (!attempt.beginUpload()) return
      emit('showLoading')
      try {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        if (!blob.size) {
          attempt.finish('failed', 'capture', 'emptyRecording')
          return
        }
        const reference = storageRef(
          storage,
          `tests/${testId}/${userId}/task_${taskIndex}_evaluator/${Date.now()}.webm`,
        )
        await uploadBytes(reference, blob)
        const url = await getDownloadURL(reference)
        await store.dispatch('updateTaskMediaUrl', {
          taskIndex,
          mediaType: MEDIA_FIELD_MAP.audio,
          url,
          size: blob.size,
          userId,
        })
        attempt.finish('completed', 'upload')
      } catch {
        attempt.finish('failed', 'upload', 'uploadError')
      } finally {
        cleanup()
        emit('stopShowLoading')
      }
    }
    recorder.start()
    emit('recordingStarted', true)
  } catch (error) {
    attempt.finish(...captureFailure(error, stage))
    cleanup()
    return
  }

  // Moderator audio retains its existing save flow; it is not a logging producer.
  if (
    props.shouldRecordModerator &&
    props.remoteStream?.getAudioTracks().length
  ) {
    try {
      const remote = new MediaStream(props.remoteStream.getAudioTracks())
      const chunks = []
      const recorder = new MediaRecorder(remote, { mimeType: 'audio/webm' })
      moderatorRecorder.value = recorder
      recorder.ondataavailable = ({ data }) => {
        if (data.size) chunks.push(data)
      }
      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          const reference = storageRef(
            storage,
            `tests/${testId}/${userId}/task_${taskIndex}_moderator/${Date.now()}.webm`,
          )
          await uploadBytes(reference, blob)
          const url = await getDownloadURL(reference)
          await store.dispatch('updateTaskMediaUrl', {
            taskIndex,
            mediaType: MEDIA_FIELD_MAP.moderator,
            url,
            size: blob.size,
            userId,
          })
        } catch {
          console.error('Could not save moderator audio')
        }
      }
      recorder.start()
    } catch {
      console.error('Could not start moderator audio')
    }
  }
}

const stopAudioRecording = () => {
  for (const recorder of [mediaRecorder.value, moderatorRecorder.value]) {
    if (recorder && recorder.state !== 'inactive') recorder.stop()
  }
}

const abortCapture = () => {
  abortCurrent()
  const moderator = moderatorRecorder.value
  if (moderator && moderator.state !== 'inactive') moderator.stop()
}

onBeforeUnmount(abortCapture)

defineExpose({
  startAudioRecording,
  stopAudioRecording,
  abortCapture,
})
</script>
