<template>
  <div>
    <v-col>
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
    </v-col>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const props = defineProps({
  testId: {
    type: String,
    default: ''
  },
  taskIndex: {
    type: Number,
    default: 0
  },
  showVisualizer: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['recordingStarted', 'showLoading', 'stopShowLoading'])

const store = useStore()
const toast = useToast()
const { t } = useI18n()

// Reactive state
const recordingAudio = ref(false)
const recordedChunks = ref([])
const mediaRecorder = ref(null)
const audioStream = ref(null)
const recordedAudio = ref('')

// Computed properties
const currentUserTestAnswer = computed(() => store.getters.currentUserTestAnswer)

// Methods
const startAudioRecording = async () => {
  recordingAudio.value = true
  emit('recordingStarted', true)

  try {
    audioStream.value = await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    recordedChunks.value = []
    mediaRecorder.value = new MediaRecorder(audioStream.value, {
      mimeType: 'audio/webm'
    })

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = async () => {
      emit('showLoading')
      const audioBlob = new Blob(recordedChunks.value, {
        type: 'audio/webm'
      })
      const storage = getStorage()
      const storageReference = storageRef(
        storage,
        `tests/${props.testId}/${currentUserTestAnswer.value.userDocId}/task_${props.taskIndex}audio/${recordedAudio.value}`
      )
      await uploadBytes(storageReference, audioBlob)

      recordedAudio.value = await getDownloadURL(storageReference)

      currentUserTestAnswer.value.tasks[props.taskIndex].audioRecordURL = recordedAudio.value

      audioStream.value.getTracks().forEach((track) => track.stop())
      audioStream.value = null
      recordingAudio.value = false
      emit('recordingStarted', false)
      emit('stopShowLoading')
      toast.success(t('alerts.genericSuccess'))
      recordingAudio.value = false
    }

    mediaRecorder.value.start()
  } catch (error) {
    console.error('Error accessing audio stream:', error)
    recordingAudio.value = false
  }
}

const stopAudioRecording = () => {
  if (mediaRecorder.value) {
    mediaRecorder.value.stop()
  }
}
</script>