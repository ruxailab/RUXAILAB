<template>
  <video ref="videoRef" autoplay playsinline style="display: none" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, toRaw, computed } from 'vue'
import { useStore } from 'vuex'

// Filter imports
import KalmanFilter from '../calibration/filters/KalmanFilter.js'
import MovingAverageFilter from '../calibration/filters/MovingAverageFilter.js'
import SavitzkyGolayFilter from '../calibration/filters/SavitzkyGolayFilter.js'
import OneEuroFilter from '../calibration/filters/OneEuroFilter.js'

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

/**
 * Create filter instance based on type
 * @param {string} filterType
 * @param {Object} filterConfig
 * @returns {Object} filter instance
 */
const createFilter = (filterType, filterConfig) => {
  switch (filterType) {
    case 'kalman':
      return new KalmanFilter(filterConfig)
    case 'movingaverage':
      return new MovingAverageFilter(filterConfig)
    case 'savitzkygolay':
      return new SavitzkyGolayFilter(filterConfig)
    case 'oneeuro':
      return new OneEuroFilter(filterConfig)
    default:
      return new KalmanFilter(filterConfig) // Default to Kalman
  }
}

const props = defineProps({
  msPerCapture: { type: Number, default: 100 },
  isRunning: { type: Boolean, default: false },
  testId: { type: String, required: true },
  taskIndex: { type: Number, required: true },
  // Filter configuration props
  useFilter: { type: Boolean, default: true },
  filterType: { type: String, default: 'kalman' }, // 'kalman' | 'movingaverage' | 'savitzkygolay' | 'oneeuro'
  filterConfig: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['faceData', 'rawGaze', 'filteredGaze', 'screenRecording'])

const store = useStore()
const currentUserTestAnswer = computed(
  () => store.getters.currentUserTestAnswer,
)

const videoRef = ref(null)
const mediaStream = ref(null)
const model = ref(null)
let trackingLoop = null

// Filter state
const leftEyeFilter = ref(null)
const rightEyeFilter = ref(null)

/**
 * Initialize or update filters based on props
 */
const initializeFilters = () => {
  if (!props.useFilter) {
    leftEyeFilter.value = null
    rightEyeFilter.value = null
    return
  }

  const config = props.filterConfig || {}
  leftEyeFilter.value = createFilter(props.filterType, { ...config, id: 'left' })
  rightEyeFilter.value = createFilter(props.filterType, { ...config, id: 'right' })
}

/**
 * Apply filter to gaze point
 * @param {Object} gazePoint - raw gaze { x, y }
 * @param {Object} filter - filter instance
 * @param {number} timestamp
 * @returns {Object} filtered gaze
 */
const applyFilter = (gazePoint, filter, timestamp) => {
  if (!filter) return gazePoint
  return filter.filter(gazePoint, timestamp)
}

/**
 * Reset all filters
 */
const resetFilters = () => {
  if (leftEyeFilter.value) leftEyeFilter.value.reset()
  if (rightEyeFilter.value) rightEyeFilter.value.reset()
}

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

watch(
  () => [props.useFilter, props.filterType, props.filterConfig],
  () => {
    initializeFilters()
    resetFilters()
  },
  { deep: true }
)

onMounted(() => {
  initializeFilters()
})

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
        const timestamp = Date.now()

        // Raw gaze data
        const rawGaze = {
          timestamp,
          left_iris_x: keypoints[468]?.x,
          left_iris_y: keypoints[468]?.y,
          right_iris_x: keypoints[473]?.x,
          right_iris_y: keypoints[473]?.y,
        }

        // Apply filters if enabled
        const hasValidIris = rawGaze.left_iris_x != null && rawGaze.left_iris_y != null &&
          rawGaze.right_iris_x != null && rawGaze.right_iris_y != null
        if (props.useFilter && leftEyeFilter.value && rightEyeFilter.value && hasValidIris) {
          const leftFiltered = applyFilter(
            { x: rawGaze.left_iris_x, y: rawGaze.left_iris_y },
            leftEyeFilter.value,
            timestamp
          )
          const rightFiltered = applyFilter(
            { x: rawGaze.right_iris_x, y: rawGaze.right_iris_y },
            rightEyeFilter.value,
            timestamp
          )

          // Emit filtered gaze
          emit('filteredGaze', {
            timestamp,
            left_iris_x: leftFiltered.x,
            left_iris_y: leftFiltered.y,
            right_iris_x: rightFiltered.x,
            right_iris_y: rightFiltered.y,
          })
        }

        // Emit raw gaze
        emit('rawGaze', rawGaze)

        // Original faceData emit for backwards compatibility
        emit('faceData', rawGaze)
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
