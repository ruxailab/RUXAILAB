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
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'

const props = defineProps({
  testId: {
    type: String,
    default: '',
  },
  taskIndex: {
    type: Number,
    default: 0,
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

const emit = defineEmits(['recordingStarted', 'showLoading', 'stopShowLoading'])

const store = useStore()

// Reactive state
const recordingAudio = ref(false)
const recordedChunks = ref([])
const mediaRecorder = ref(null)
const audioStream = ref(null)
const recordedAudio = ref('')
const recordingTaskIndex = ref(null) // Store the task index when recording starts

// Computed properties
const currentUserTestAnswer = computed(
  () => store.getters.currentUserTestAnswer,
)

async function hasAudio() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.some((device) => device.kind === 'audioinput')
  } catch (err) {
    console.error('Erro ao verificar dispositivos:', err)
    return false
  }
}

// Methods
const startAudioRecording = async () => {
  try {
    const audioAvailable = await hasAudio()
    if (!audioAvailable) return

    recordingTaskIndex.value = props.taskIndex // Store the current task index when recording starts
    recordingAudio.value = true
    emit('recordingStarted', true)

    audioStream.value = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    recordedChunks.value = {
      local: [],
      remote: [],
    }
    mediaRecorder.value = {}

    audioStream.value = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })
    mediaRecorder.value.local = new MediaRecorder(audioStream.value, {
      mimeType: 'audio/webm',
    })

    mediaRecorder.value.local.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.local.push(event.data)
      }
    }

    mediaRecorder.value.local.onstop = async () => {
      emit('showLoading')
      const audioBlob = new Blob(recordedChunks.value.local, {
        type: 'audio/webm',
      })
      const storage = getStorage()
      const correctTaskIndex = recordingTaskIndex.value
      const storageReference = storageRef(
        storage,
        `tests/${props.testId}/${currentUserTestAnswer.value.userDocId}/task_${correctTaskIndex}_evaluator/${Date.now()}.webm`,
      )
      await uploadBytes(storageReference, audioBlob)

      recordedAudio.value = await getDownloadURL(storageReference)

      await store.dispatch('updateTaskMediaUrl', {
        taskIndex: correctTaskIndex,
        mediaType: MEDIA_FIELD_MAP.audio,
        url: recordedAudio.value,
        size: audioBlob.size,
      })

      if (audioStream.value) {
        audioStream.value.getTracks().forEach((track) => track.stop())
        audioStream.value = null
      }

      emit('recordingStarted', false)
      // Size
      if (
        currentUserTestAnswer.value.tasks &&
        currentUserTestAnswer.value.tasks[recordingTaskIndex.value]
      ) {
        currentUserTestAnswer.value.tasks[recordingTaskIndex.value].audioSize =
          new Blob(recordedChunks.value.local).size
      }
      emit('stopShowLoading')
      recordingAudio.value = false
    }

    mediaRecorder.value.local.start()

    // Remote audio
    if (props.shouldRecordModerator) {
      if (props.remoteStream?.getAudioTracks().length) {
        const remoteAudioStream = new MediaStream(
          props.remoteStream.getAudioTracks(),
        )

        mediaRecorder.value.remote = new MediaRecorder(remoteAudioStream, {
          mimeType: 'audio/webm',
        })
        // Remote
        mediaRecorder.value.remote.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.value.remote.push(event.data)
          }
        }
        mediaRecorder.value.remote.onstop = async () => {
          const blob = new Blob(recordedChunks.value.remote, {
            type: 'audio/webm',
          })
          const storage = getStorage()
          const correctTaskIndex = recordingTaskIndex.value
          const storageReference = storageRef(
            storage,
            `tests/${props.testId}/${currentUserTestAnswer.value.userDocId}/task_${correctTaskIndex}_moderator/${Date.now()}.webm`,
          )
          await uploadBytes(storageReference, blob)
          const downloadURL = await getDownloadURL(storageReference)

          await store.dispatch('updateTaskMediaUrl', {
            taskIndex: correctTaskIndex,
            mediaType: MEDIA_FIELD_MAP.moderator,
            url: downloadURL,
            size: blob.size,
          })
        }

        mediaRecorder.value.remote.start()
      }
    }
  } catch (error) {
    console.error('Error accessing audio stream:', error)
    recordingAudio.value = false
  }
}

const stopAudioRecording = () => {
  if (!recordingAudio.value) return

  if (
    mediaRecorder.value?.local &&
    mediaRecorder.value.local.state !== 'inactive'
  ) {
    mediaRecorder.value.local.stop()
  }

  if (
    mediaRecorder.value?.remote &&
    mediaRecorder.value.remote.state !== 'inactive'
  ) {
    mediaRecorder.value.remote.stop()
  }
}

defineExpose({ startAudioRecording, stopAudioRecording })
</script>
