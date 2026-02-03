<template>
  <video ref="videoRef" autoplay playsinline style="display: none" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, toRaw, computed } from 'vue'
import { useStore } from 'vuex'

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

watch(
  () => props.isRunning,
  async (val) => {
    if (val) {
      await startIrisTracking()
    } else {
      stopTracking()
      stopWebcam()
    }
  },
)

onBeforeUnmount(() => {
  stopTracking()
  if (mediaStream.value)
    mediaStream.value.getTracks().forEach((track) => track.stop())
})

const startIrisTracking = async () => {
  if (model.value || mediaStream.value) return

  const loaded = await loadDependencies(store)
  if (!loaded) return

  await tf.setBackend('webgl')
  await tf.ready()

  await initWebcam()
  await waitForVideoReady()
  await loadModel()

  startTracking()
}

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

const stopWebcam = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((t) => t.stop())
    mediaStream.value = null
  }
}
</script>
