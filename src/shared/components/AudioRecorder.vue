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
import { useI18n } from 'vue-i18n'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import { storage } from '@/app/plugins/firebase'
import { showError, showWarning } from '@/shared/utils/toast'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'
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
const { t } = useI18n()

const notifyRecordingFailure = ({ key, mediaKey, severity }) => {
  const message = mediaKey ? t(key, { media: t(mediaKey) }) : t(key)
  if (severity === 'warning') showWarning(message)
  else showError(message)
}

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
  recordingAudio.value = false
  emit('recordingStarted', false)
}

abortCurrent = () => {
  abandoned = true
  if (activeAttempt) {
    activeAttempt.discard()
  }
  cleanup()
}

const prepareAudio = async () => {
  if (recordingAudio.value) return true
  recordingAudio.value = true
  abandoned = false
  const taskIndex = props.taskIndex
  const userId = resolvedUserDocId.value
  const testId = props.testId
  const attempt = createRecordingAttempt(
    taskIndex,
    'audio',
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
    if (!devices.some((device) => device.kind === 'audioinput')) {
      attempt.finish('failed', 'permission', 'deviceUnavailable')
      cleanup()
      return false
    }
    currentStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    if (abandoned) {
      cleanup()
      return false
    }
    stage = 'capture'
    currentRecorder = createMediaRecorder({
      stream: currentStream,
      mimeType: 'audio/webm',
      blobType: 'audio/webm',
      attempt,
      emit,
      cleanup,
      save: (blob) =>
        saveRecordedMedia({
          blob,
          storage,
          storagePath: `tests/${testId}/${userId}/task_${taskIndex}_evaluator/${Date.now()}.webm`,
          store,
          taskIndex,
          mediaType: MEDIA_FIELD_MAP.audio,
          userId,
        }),
    })
    mediaRecorder.value = currentRecorder
    return true
  } catch (error) {
    attempt.finish(...captureFailure(error, stage))
    cleanup()
    return false
  }
}

const startNow = () => {
  if (!currentRecorder) return false
  if (currentRecorder.state !== 'inactive') return true
  const [track] =
    currentStream?.getAudioTracks?.() || currentStream?.getTracks?.() || []
  if (!currentStream || !track || track.readyState === 'ended') {
    if (activeAttempt) {
      activeAttempt.finish('failed', 'capture', 'captureError')
    }
    cleanup()
    return false
  }
  try {
    currentRecorder.start()
    emit('recordingStarted', true)
  } catch {
    if (activeAttempt) {
      activeAttempt.finish('failed', 'capture', 'captureError')
    }
    cleanup()
    return false
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

  return true
}

const startAudioRecording = async () => {
  const prepared = await prepareAudio()
  if (!prepared) return
  return startNow()
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
  prepareAudio,
  startNow,
  stopAudioRecording,
  abortCapture,
})
</script>
