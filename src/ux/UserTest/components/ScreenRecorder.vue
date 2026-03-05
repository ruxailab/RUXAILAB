<template>
  <div>
    <!-- <v-col>
      <v-row>
        <v-tooltip
          v-if="!isCapturing"
          location="bottom"
        >
          <template #activator="{ props }">
            <v-btn
              class="ml-4 my-2 mr-auto"
              elevation="0"
              icon
              v-bind="props"
              @click="captureScreen"
            >
              <v-icon>mdi-monitor-screenshot</v-icon>
            </v-btn>
          </template>
          <span>Capture Screen</span>
        </v-tooltip>
        <v-tooltip
          v-if="isCapturing"
          location="bottom"
        >
          <template #activator="{ props }">
            <v-btn
              class="ml-4 my-2 mr-auto"
              :color="!isRecording ? 'grey-darken-1' : 'red lighten-1'"
              elevation="0"
              icon
              v-bind="props"
              @click="recordScreen"
            >
              <v-icon>
                {{ isRecording ? 'mdi-stop' : 'mdi-monitor-screenshot' }}
              </v-icon>
            </v-btn>
          </template>
          <span>{{ isRecording ? 'Stop Recording' : 'Record Screen' }}</span>
        </v-tooltip>
      </v-row>
    </v-col> -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'

const props = defineProps({
  testId: String,
  taskIndex: Number,
})

const emit = defineEmits(['showLoading', 'stopShowLoading'])

const store = useStore()
const currentUserTestAnswer = computed(
  () => store.getters.currentUserTestAnswer,
)

const { t } = useI18n()

const isCapturing = ref(false)
const isRecording = ref(false)
const videoUrl = ref('')
const videoStream = ref(null)
const mediaRecorder = ref(null)
const chunks = ref([])
const recordingTaskIndex = ref(null) // Store the task index when recording starts

const captureScreen = async () => {
  try {
    recordingTaskIndex.value = props.taskIndex // Store the current task index when recording starts
    videoStream.value = await navigator.mediaDevices.getDisplayMedia({
      cursor: true,
    })
    isCapturing.value = true
    await recordScreen()
  } catch (err) {
    console.error(err)
  }
}

const recordScreen = async () => {
  if (!isRecording.value) {
    chunks.value = []
    mediaRecorder.value = new MediaRecorder(videoStream.value)
    mediaRecorder.value.start()

    mediaRecorder.value.ondataavailable = (e) => {
      chunks.value.push(e.data)
    }

    mediaRecorder.value.onstop = async () => {
      emit('showLoading')
      const videoBlob = new Blob(chunks.value, { type: 'video/webm' })
      const storage = getStorage()
      const storagePath = `tests/${props.testId}/${currentUserTestAnswer.value.userDocId}/task_${recordingTaskIndex.value}/screen_record/${videoUrl.value}`
      const storageReference = storageRef(storage, storagePath)

      await uploadBytes(storageReference, videoBlob)
      videoUrl.value = await getDownloadURL(storageReference)

      // Use the task index from when recording started, not the current one
      const correctTaskIndex = recordingTaskIndex.value

      await store.dispatch('updateTaskMediaUrl', {
        taskIndex: correctTaskIndex,
        mediaType: MEDIA_FIELD_MAP.screen,
        url: videoUrl.value,
        size: videoBlob.size,
      })

      // Add safety check before setting the property
      if (
        currentUserTestAnswer.value.tasks &&
        currentUserTestAnswer.value.tasks[correctTaskIndex]
      ) {
        currentUserTestAnswer.value.tasks[correctTaskIndex].screenRecordURL =
          videoUrl.value
        currentUserTestAnswer.value.tasks[correctTaskIndex].screenSize =
          videoBlob.size
      } else {
        console.error(
          'Task not found at index:',
          correctTaskIndex,
          'Available tasks:',
          currentUserTestAnswer.value.tasks?.length,
        )
      }

      // Stop all tracks
      videoStream.value.getTracks().forEach((track) => track.stop())
      isRecording.value = false
      isCapturing.value = false

      emit('stopShowLoading')
    }

    isRecording.value = true
  } else {
    mediaRecorder.value.stop()
  }
}

const stopRecording = () => {
  if (isRecording.value) {
    mediaRecorder.value.stop()
  }
}

defineExpose({ captureScreen, stopRecording })
</script>

<style scoped></style>
