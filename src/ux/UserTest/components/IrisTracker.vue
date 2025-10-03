<template>
    <video ref="videoRef" autoplay playsinline style="display: none" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, toRaw, computed } from 'vue'
import * as tf from '@tensorflow/tfjs'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
import '@tensorflow/tfjs-backend-webgl'
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const props = defineProps({
    msPerCapture: { type: Number, default: 100 },
    isRunning: { type: Boolean, default: false },
    recordScreen: { type: Boolean, default: false },
    testId: { type: String, required: true },
    taskIndex: { type: Number, required: true },
})

const emit = defineEmits(['faceData', 'screenRecording'])

const store = useStore();
const currentUserTestAnswer = computed(() => store.getters.currentUserTestAnswer);

const { t } = useI18n();
const toast = useToast();

const videoRef = ref(null)
const mediaStream = ref(null)
const model = ref(null)
let trackingLoop = null
const videoUrl = ref('');

// Variáveis da gravação de tela
const screenStream = ref(null)
const mediaRecorder = ref(null)
const screenChunks = ref([])

onMounted(async () => {
    console.log('Inicializando backend WebGL...')
    await tf.setBackend('webgl')
    await tf.ready()
    console.log('Backend pronto:', tf.getBackend())

    await initWebcam()
    await waitForVideoReady()

    console.log('Vídeo pronto.')
    await loadModel()

    if (props.isRunning) startTracking()
    if (props.recordScreen) startScreenRecording()
})

watch(() => props.isRunning, (val) => {
    val ? startTracking() : stopTracking()
})

watch(() => props.recordScreen, (val) => {
    val ? startScreenRecording() : stopScreenRecording()
})

onBeforeUnmount(() => {
    stopTracking()
    stopScreenRecording()
    if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop())
    }
})

// ---------- Webcam ----------
const initWebcam = async () => {
    try {
        mediaStream.value = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        })
        if (videoRef.value) {
            videoRef.value.srcObject = mediaStream.value
        }
    } catch (err) {
        console.error(' Erro ao iniciar webcam:', err)
    }
}

const waitForVideoReady = () => {
    return new Promise(resolve => {
        const check = () => {
            if (videoRef.value?.readyState >= 3) resolve()
            else requestAnimationFrame(check)
        }
        check()
    })
}

const loadModel = async () => {
    model.value = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
            runtime: 'mediapipe',
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
            refineLandmarks: true,
            maxFaces: 1
        }
    )
    console.log('✅ Modelo carregado com MediaPipe')
}

// ---------- Face Tracking ----------
const startTracking = async () => {
    if (!model.value) {
        console.warn('⚠️ Modelo ainda não carregado')
        return
    }

    const loop = async () => {
        if (!props.isRunning) return

        try {
            await tf.ready()
            const backend = tf.engine().backend
            if (!backend) {
                console.warn('Backend não disponível ainda...')
                trackingLoop = setTimeout(loop, props.msPerCapture)
                return
            }

            const rawModel = toRaw(model.value)
            const inputImage = tf.browser.fromPixels(videoRef.value);
            const predictions = await rawModel.estimateFaces(videoRef.value, {
                flipHorizontal: false
            });
            inputImage.dispose();

            if (predictions.length > 0) {
                const keypoints = predictions[0].keypoints
                const data = {
                    timestamp: Date.now(),
                    left_iris_x: keypoints[468]?.x,
                    left_iris_y: keypoints[468]?.y,
                    right_iris_x: keypoints[473]?.x,
                    right_iris_y: keypoints[473]?.y
                }
                emit('faceData', data)
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
        console.log('Tracking parado.')
    }
}

// ---------- Screen Recording ----------
const startScreenRecording = async () => {
    try {
        screenStream.value = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: 'always' },
            audio: false
        })

        screenChunks.value = []
        mediaRecorder.value = new MediaRecorder(screenStream.value, { mimeType: 'video/webm' })

        mediaRecorder.value.ondataavailable = (e) => {
            if (e.data.size > 0) screenChunks.value.push(e.data)
        }

        mediaRecorder.value.onstop = async () => {

            console.log('Gravação de tela parada, salvando...');


            const videoBlob = new Blob(screenChunks.value, { type: 'video/webm' })
            const storage = getStorage()
            const storagePath = `tests/${props.testId}/${currentUserTestAnswer.value.userDocId}/task_${props.taskIndex > 0 ? props.taskIndex - 1 : props.taskIndex}/screen_record/${videoUrl.value}`
            const storageReference = storageRef(storage, storagePath)

            await uploadBytes(storageReference, videoBlob)
            videoUrl.value = await getDownloadURL(storageReference)


                currentUserTestAnswer.value.tasks[props.taskIndex > 0 ? props.taskIndex - 1 : props.taskIndex].screenRecordURL = videoUrl.value
        }

        mediaRecorder.value.start()
        console.log('Gravação de tela iniciada...')
    } catch (err) {
        console.error('Erro ao iniciar gravação de tela:', err)
    }
}

const stopScreenRecording = () => {
    if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
        mediaRecorder.value.stop()
        console.log('Gravação de tela finalizada.')
    }
    if (screenStream.value) {
        screenStream.value.getTracks().forEach(track => track.stop())
        screenStream.value = null
    }
}
</script>