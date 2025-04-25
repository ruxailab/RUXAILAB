<template>
  <div>
    <v-col>
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
        <v-tooltip
          v-if="recording"
          location="bottom"
        >
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
    type: String
  },
  taskIndex: {
    type: Number
  },
})

const emit = defineEmits(['showLoading', 'stopShowLoading'])

const store = useStore()
const { t } = useI18n()
const toast = useToast()

const currentUserTestAnswer = computed(() => store.getters.currentUserTestAnswer)

const recording = ref(false)
const videoStream = ref(null)
const recordedChunks = ref([])
const mediaRecorder = ref(null)
const recordedVideo = ref('')

const startRecording = async () => {
  recording.value = true
  try {
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
    toast.error(t('errors.globalError'))
  }

  try {
    mediaRecorder.value.onstop = async () => {
      emit('showLoading')
      const videoBlob = new Blob(recordedChunks.value, {
        type: 'video/webm',
      })
      const storage = getStorage()
      const storageReference = storageRef(
        storage,
        `tests/${props.testId}/${currentUserTestAnswer.value.userDocId}/task_${props.taskIndex}/video/${recordedVideo.value}`,
      )
      await uploadBytes(storageReference, videoBlob)

      recordedVideo.value = await getDownloadURL(storageReference)

      currentUserTestAnswer.value.tasks[props.taskIndex].webcamRecordURL = recordedVideo.value

      videoStream.value.getTracks().forEach((track) => track.stop())
      recording.value = false

      emit('stopShowLoading')
      toast.success(t('alerts.genericSuccess'))
    }

    mediaRecorder.value.start()
  } catch (e) {
    toast.error(t('errors.globalError'))
  }
}

const stopRecording = () => {
  if (mediaRecorder.value) {
    mediaRecorder.value.stop()
  }
}
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