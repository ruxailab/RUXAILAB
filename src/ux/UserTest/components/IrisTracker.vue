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

const screenStream = ref(null)
const mediaRecorder = ref(null)
const screenChunks = ref([])

const webcamRecorder = ref(null)
const webcamChunks = ref([])
const webcamUrl = ref('')

onMounted(async () => {
    console.log('Inicializando backend WebGL...')
    await tf.setBackend('webgl')
    await tf.ready()
    console.log('Backend pronto:', tf.getBackend())
})

watch(() => props.isRunning, async (val) => {
    if (val) {
        if (!mediaStream.value) {
            await initWebcam()
            await waitForVideoReady()
            console.log('Vídeo pronto.')
        }
        if (!model.value) {
            await loadModel()
        }
        startTracking()
    } else {
        stopTracking()
        if (mediaStream.value) {
            mediaStream.value.getTracks().forEach(track => track.stop())
            mediaStream.value = null
        }
    }
})

watch(() => props.recordScreen, (val) => {
    if (val) {
        startScreenRecording()
        startWebcamRecording()
    } else {
        stopScreenRecording()
        stopWebcamRecording()
    }
})

onBeforeUnmount(() => {
    stopTracking()
    stopScreenRecording()
    stopWebcamRecording()
    if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop())
    }
})

const initWebcam = async () => {
    console.log('Iniciando webcam...')
    try {
        mediaStream.value = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        })
        console.log('Camera carregada com sucesso')
        if (videoRef.value) {
            videoRef.value.srcObject = mediaStream.value
            console.log('Vídeo pronto para captura')
        }
    } catch (err) {
        console.error('Erro ao iniciar webcam:', err)
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
            try {
                console.log('Gravação de tela parada, salvando...');
                const videoBlob = new Blob(screenChunks.value, { type: 'video/webm' })
                const storage = getStorage()
                const fileName = `screen_${Date.now()}.webm`

                const taskIdx = props.taskIndex > 0 ? props.taskIndex - 1 : props.taskIndex
                const storagePath = `tests/${props.testId}/${currentUserTestAnswer.value.userDocId}/task_${taskIdx}/screen_record/${fileName}`
                const storageReference = storageRef(storage, storagePath)

                await uploadBytes(storageReference, videoBlob)
                videoUrl.value = await getDownloadURL(storageReference)

                // Garante que a task existe
                if (!currentUserTestAnswer.value.tasks[taskIdx]) currentUserTestAnswer.value.tasks[taskIdx] = {}
                currentUserTestAnswer.value.tasks[taskIdx].screenRecordURL = videoUrl.value
            } catch (err) {
                console.error('Erro ao salvar gravação de tela:', err)
            }
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

const startWebcamRecording = async () => {
    try {
        if (!mediaStream.value) {
            // garante a webcam ativa antes de gravar
            await initWebcam()
            await waitForVideoReady()
        }

        if (!mediaStream.value) {
            console.warn('⚠️ Webcam indisponível para gravação.')
            return
        }

        webcamChunks.value = []
        webcamRecorder.value = new MediaRecorder(mediaStream.value, { mimeType: 'video/webm' })

        webcamRecorder.value.ondataavailable = (e) => {
            if (e.data.size > 0) webcamChunks.value.push(e.data)
        }

        webcamRecorder.value.onstop = async () => {
            try {
                console.log('Gravação da webcam parada, salvando...')
                const videoBlob = new Blob(webcamChunks.value, { type: 'video/webm' })
                const storage = getStorage()
                const fileName = `webcam_${Date.now()}.webm`

                const taskIdx = props.taskIndex > 0 ? props.taskIndex - 1 : props.taskIndex
                const storagePath = `tests/${props.testId}/${currentUserTestAnswer.value.userDocId}/task_${taskIdx}/webcam_record/${fileName}`
                const storageReference = storageRef(storage, storagePath)

                await uploadBytes(storageReference, videoBlob)
                webcamUrl.value = await getDownloadURL(storageReference)

                if (!currentUserTestAnswer.value.tasks[taskIdx]) currentUserTestAnswer.value.tasks[taskIdx] = {}
                currentUserTestAnswer.value.tasks[taskIdx].webcamRecordURL = webcamUrl.value
            } catch (err) {
                console.error('Erro ao salvar gravação da webcam:', err)
            }
        }

        webcamRecorder.value.start()
        console.log('Gravação da webcam iniciada...')
    } catch (err) {
        console.error('Erro ao iniciar gravação da webcam:', err)
    }
}

const stopWebcamRecording = () => {
    if (webcamRecorder.value && webcamRecorder.value.state !== 'inactive') {
        webcamRecorder.value.stop()
        console.log('Gravação da webcam finalizada.')
    }
}
</script>