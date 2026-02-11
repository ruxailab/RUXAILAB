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
import { showError } from '@/shared/utils/toast'

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

const emit = defineEmits(['showLoading', 'stopShowLoading'])

const store = useStore()
const { t } = useI18n()
const currentUserTestAnswer = computed(
  () => store.getters.currentUserTestAnswer,
)

const recording = ref(false)
const videoStream = ref(null)
const recordedChunks = ref([])
const mediaRecorder = ref(null)
const recordedVideo = ref('')
const recordingTaskIndex = ref(null) // Store the task index when recording starts

async function hasCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.some((device) => device.kind === 'videoinput')
  } catch (err) {
    console.error('Erro ao verificar dispositivos:', err)
    return false
  }
}

const startRecording = async () => {
  try {
    const cameraAvailable = await hasCamera()
    if (!cameraAvailable) return

    recording.value = true
    recordingTaskIndex.value = props.taskIndex // Store the current task index when recording starts
    console.log(
      'VideoRecorder: Recording started for task index:',
      props.taskIndex,
    )
    videoStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
    })

    recordedChunks.value = []
    mediaRecorder.value = new MediaRecorder(videoStream.value)

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }
  } catch (e) {
    recording.value = false
    console.error(e)
    showError('errors.globalError')
  }

  try {
    if (mediaRecorder.value) {
      mediaRecorder.value.onstop = async () => {
        emit('showLoading')
        const videoBlob = new Blob(recordedChunks.value, {
          type: 'video/webm',
        })
        const storage = getStorage()
        const correctTaskIndex = recordingTaskIndex.value
        const storageReference = storageRef(
          storage,
          `tests/${props.testId}/${props.userDocId}/task_${correctTaskIndex}/video/${recordedVideo.value}`,
        )
        await uploadBytes(storageReference, videoBlob)

        recordedVideo.value = await getDownloadURL(storageReference)
        console.log('webcam url =>', correctTaskIndex, recordedVideo.value)
        console.log('Tasks array:', currentUserTestAnswer.value.tasks)
        console.log('Tasks length:', currentUserTestAnswer.value.tasks?.length)
        console.log(
          'Task at index:',
          currentUserTestAnswer.value.tasks?.[correctTaskIndex],
        )

        await store.dispatch('updateTaskMediaUrl', {
          taskIndex: correctTaskIndex,
          mediaType: MEDIA_FIELD_MAP.webcam,
          url: recordedVideo.value,
          size: videoBlob.size,
        })

        // Add safety check before setting the property
        if (
          currentUserTestAnswer.value.tasks &&
          currentUserTestAnswer.value.tasks[correctTaskIndex]
        ) {
          currentUserTestAnswer.value.tasks[correctTaskIndex].webcamRecordURL =
            recordedVideo.value
          currentUserTestAnswer.value.tasks[correctTaskIndex].webcamSize =
            videoBlob.size
        } else {
          console.error(
            'Task not found at index:',
            correctTaskIndex,
            'Available tasks:',
            currentUserTestAnswer.value.tasks?.length,
          )
        }

        videoStream.value.getTracks().forEach((track) => track.stop())
        recording.value = false

        emit('stopShowLoading')
      }
    }

    if (mediaRecorder.value) {
      mediaRecorder.value.start()
    }
  } catch (e) {
    console.error(e)
    showError('errors.globalError')
  }
}

const stopRecording = () => {
  if (mediaRecorder.value) {
    mediaRecorder.value.stop()
  }
}

defineExpose({ startRecording, stopRecording })
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
