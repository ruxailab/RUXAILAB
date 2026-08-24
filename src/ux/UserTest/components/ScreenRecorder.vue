<template>
  <div />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import { storage } from '@/app/plugins/firebase'
import { MEDIA_FIELD_MAP } from '@/shared/constants/mediasType'
import { showError } from '@/shared/utils/toast'
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

const emit = defineEmits(['showLoading', 'stopShowLoading'])

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
const isRecording = ref(false)
const videoUrl = ref('')
const videoStream = ref(null)
const mediaRecorder = ref(null)
const chunks = ref([])
const recordingTaskIndex = ref(null)

const captureScreen = async ({ requireEntireScreen = false } = {}) => {
  const result = await startScreenShareStream({ requireEntireScreen })
  if (!result.ok) {
    showError(`errors.screenShare.${result.reason}`)
    return false
  }

  recordingTaskIndex.value = props.taskIndex
  videoStream.value = result.stream
  isCapturing.value = true

  const [videoTrack] = result.stream.getVideoTracks()
  if (videoTrack) {
    videoTrack.onended = () => {
      if (isRecording.value) stopRecording()
    }
  }

  try {
    await recordScreen()
    return true
  } catch (error) {
    console.error('Unexpected error while starting screen recording:', error)
    abortCapture()
    showError('errors.screenShare.error')
    return false
  }
}

const recordScreen = async () => {
  if (isRecording.value) {
    mediaRecorder.value.stop()
    return
  }

  chunks.value = []
  mediaRecorder.value = new MediaRecorder(videoStream.value)
  mediaRecorder.value.start()

  mediaRecorder.value.ondataavailable = (e) => {
    chunks.value.push(e.data)
  }

  mediaRecorder.value.onstop = async () => {
    emit('showLoading')
    try {
      const videoBlob = new Blob(chunks.value, { type: 'video/webm' })
      const storagePath = `tests/${props.testId}/${resolvedUserDocId.value}/task_${recordingTaskIndex.value}/screen_record/${Date.now()}.webm`
      const storageReference = storageRef(storage, storagePath)

      await uploadBytes(storageReference, videoBlob)
      videoUrl.value = await getDownloadURL(storageReference)

      const correctTaskIndex = recordingTaskIndex.value

      await store.dispatch('updateTaskMediaUrl', {
        taskIndex: correctTaskIndex,
        mediaType: MEDIA_FIELD_MAP.screen,
        url: videoUrl.value,
        size: videoBlob.size,
        userId: resolvedUserDocId.value,
      })

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
    } catch (error) {
      console.error('Unexpected error while stopping screen recording:', error)
    } finally {
      stopMediaStream(videoStream.value)
      videoStream.value = null
      isRecording.value = false
      isCapturing.value = false
      emit('stopShowLoading')
    }
  }

  isRecording.value = true
}

const stopRecording = () => {
  if (isRecording.value && mediaRecorder.value?.state !== 'inactive') {
    mediaRecorder.value.stop()
  }
}

const abortCapture = () => {
  try {
    if (mediaRecorder.value) {
      mediaRecorder.value.ondataavailable = null
      mediaRecorder.value.onstop = () => {}
      if (mediaRecorder.value.state !== 'inactive') {
        mediaRecorder.value.stop()
      }
    }
  } catch (error) {
    console.error('Unexpected error while aborting screen recording:', error)
  }

  stopMediaStream(videoStream.value)
  videoStream.value = null
  mediaRecorder.value = null
  chunks.value = []
  isRecording.value = false
  isCapturing.value = false
}

defineExpose({ captureScreen, stopRecording, abortCapture })
</script>
