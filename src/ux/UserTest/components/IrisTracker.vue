<template>
  <video ref="videoRef" autoplay playsinline style="display: none" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, toRaw, computed } from 'vue'
import { useStore } from 'vuex'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'

let tf
let faceLandmarksDetection

const loadDependencies = async (store) => {
  try {
    ;[tf, faceLandmarksDetection] = await Promise.all([
      import('@tensorflow/tfjs-core'),
      import('@tensorflow-models/face-landmarks-detection'),
      import('@tensorflow/tfjs-backend-webgl'),
    ])

    return true
  } catch (error) {
    console.error('Failed to load TensorFlow dependencies:', error)
    store.commit('SET_TOAST', {
      type: 'error',
      message: 'Failed to load AI components. Eye tracking will be disabled.',
    })

    return false
  }
}

const props = defineProps({
  msPerCapture: { type: Number, default: 100 },
  isRunning: { type: Boolean, default: false },
  recordScreen: { type: Boolean, default: false },
  testId: { type: String, required: true },
  taskIndex: { type: Number, required: true },
})

const emit = defineEmits(['faceData', 'screenRecording'])

const store = useStore()
const currentUserTestAnswer = computed(
  () => store.getters.currentUserTestAnswer,
)

const videoRef = ref(null)
const mediaStream = ref(null)
const model = ref(null)
let trackingLoop = null

const screenStream = ref(null)
const screenRecorder = ref(null)
const screenChunks = ref([])
const recordingScreenIndex = ref(null)

const webcamRecorder = ref(null)
const webcamChunks = ref([])
const recordingWebcamIndex = ref(null)

onMounted(async () => {
  const loaded = await loadDependencies(store)
  if (!loaded) return

  await tf.setBackend('webgl')
  await tf.ready()
  await initWebcam()
  await waitForVideoReady()
  await loadModel()
  if (props.isRunning) startTracking()
  if (props.recordScreen) {
    startScreenRecording()
    startWebcamRecording()
  }
})

watch(
  () => props.isRunning,
  (val) => (val ? startTracking() : stopTracking()),
)

watch(
  () => props.recordScreen,
  (val) => {
    val
      ? (startScreenRecording(), startWebcamRecording())
      : (stopScreenRecording(), stopWebcamRecording())
  },
)

onBeforeUnmount(() => {
  stopTracking()
  stopScreenRecording()
  stopWebcamRecording()
  if (mediaStream.value)
    mediaStream.value.getTracks().forEach((track) => track.stop())
})

const initWebcam = async () => {
  mediaStream.value = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false,
  })
  if (videoRef.value) videoRef.value.srcObject = mediaStream.value
}

const waitForVideoReady = () =>
  new Promise((resolve) => {
    const check = () =>
      videoRef.value?.readyState >= 3 ? resolve() : requestAnimationFrame(check)
    check()
  })

const loadModel = async () => {
  model.value = await faceLandmarksDetection.createDetector(
    faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
    {
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
      refineLandmarks: true,
      maxFaces: 1,
    },
  )
}

const startTracking = async () => {
  if (!model.value) return
  const loop = async () => {
    if (!props.isRunning) return
    try {
      await tf.ready()
      const rawModel = toRaw(model.value)
      const predictions = await rawModel.estimateFaces(videoRef.value, {
        flipHorizontal: false,
      })
      if (predictions.length > 0) {
        const keypoints = predictions[0].keypoints
        emit('faceData', {
          timestamp: Date.now(),
          left_iris_x: keypoints[468]?.x,
          left_iris_y: keypoints[468]?.y,
          right_iris_x: keypoints[473]?.x,
          right_iris_y: keypoints[473]?.y,
        })
      }
    } catch (err) {
      console.error('Erro durante rastreamento:', err)
    }
    trackingLoop = setTimeout(loop, props.msPerCapture)
  }
  loop()
}

const stopTracking = () => {
  if (trackingLoop) {
    clearTimeout(trackingLoop)
    trackingLoop = null
  }
}

// ---------- Screen Recording ----------
const startScreenRecording = async () => {
  recordingScreenIndex.value = props.taskIndex > 0 ? props.taskIndex - 1 : 0
  try {
    screenStream.value = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' },
      audio: false,
    })
    screenChunks.value = []
    screenRecorder.value = new MediaRecorder(screenStream.value, {
      mimeType: 'video/webm',
    })
    screenRecorder.value.ondataavailable = (e) => {
      if (e.data.size > 0) screenChunks.value.push(e.data)
    }
    screenRecorder.value.onstop = async () => {
      const videoBlob = new Blob(screenChunks.value, { type: 'video/webm' })
      const storage = getStorage()
      const storagePath = `tests/${props.testId}/${
        currentUserTestAnswer.value.userDocId
      }/task_${
        recordingScreenIndex.value
      }/screen_record/screen_${Date.now()}.webm`
      const storageReference = storageRef(storage, storagePath)
      await uploadBytes(storageReference, videoBlob)
      const videoUrl = await getDownloadURL(storageReference)

      // Dispatch antes de atualizar currentUserTestAnswer
      await store.dispatch('updateTaskMediaUrl', {
        taskIndex: recordingScreenIndex.value,
        mediaType: 'screen',
        url: videoUrl,
      })

      if (
        currentUserTestAnswer.value.tasks &&
        currentUserTestAnswer.value.tasks[recordingScreenIndex.value]
      ) {
        currentUserTestAnswer.value.tasks[
          recordingScreenIndex.value
        ].screenRecordURL = videoUrl
      }
    }
    screenRecorder.value.start()
  } catch (err) {
    console.error('Erro ao iniciar gravação de tela:', err)
  }
}

const stopScreenRecording = () => {
  if (screenRecorder.value && screenRecorder.value.state !== 'inactive')
    screenRecorder.value.stop()
  if (screenStream.value)
    screenStream.value.getTracks().forEach((track) => track.stop())
}

// ---------- Webcam Recording ----------
const startWebcamRecording = async () => {
  recordingWebcamIndex.value = props.taskIndex > 0 ? props.taskIndex - 1 : 0
  try {
    if (!mediaStream.value) await initWebcam()
    webcamChunks.value = []
    webcamRecorder.value = new MediaRecorder(mediaStream.value, {
      mimeType: 'video/webm',
    })
    webcamRecorder.value.ondataavailable = (e) => {
      if (e.data.size > 0) webcamChunks.value.push(e.data)
    }
    webcamRecorder.value.onstop = async () => {
      const videoBlob = new Blob(webcamChunks.value, { type: 'video/webm' })
      const storage = getStorage()
      const storagePath = `tests/${props.testId}/${
        currentUserTestAnswer.value.userDocId
      }/task_${
        recordingWebcamIndex.value
      }/webcam_record/webcam_${Date.now()}.webm`
      const storageReference = storageRef(storage, storagePath)
      await uploadBytes(storageReference, videoBlob)
      const videoUrl = await getDownloadURL(storageReference)

      await store.dispatch('updateTaskMediaUrl', {
        taskIndex: recordingWebcamIndex.value,
        mediaType: 'webcam',
        url: videoUrl,
      })

      if (
        currentUserTestAnswer.value.tasks &&
        currentUserTestAnswer.value.tasks[recordingWebcamIndex.value]
      ) {
        currentUserTestAnswer.value.tasks[
          recordingWebcamIndex.value
        ].webcamRecordURL = videoUrl
      }
    }
    webcamRecorder.value.start()
  } catch (err) {
    console.error('Erro ao iniciar gravação de webcam:', err)
  }
}

const stopWebcamRecording = () => {
  if (webcamRecorder.value && webcamRecorder.value.state !== 'inactive')
    webcamRecorder.value.stop()
  if (mediaStream.value)
    mediaStream.value.getTracks().forEach((track) => track.stop())
}
</script>
