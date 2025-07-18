<template>
    <video ref="videoRef" autoplay playsinline style="display: none" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, toRaw } from 'vue'
import * as tf from '@tensorflow/tfjs'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
import '@tensorflow/tfjs-backend-webgl'

const props = defineProps({
    msPerCapture: { type: Number, default: 100 },
    isRunning: { type: Boolean, default: false }
})

const emit = defineEmits(['data'])

const videoRef = ref(null)
const mediaStream = ref(null)
const model = ref(null)
let trackingLoop = null


// ⚠️ Backend e modelo devem estar prontos antes de qualquer loop
onMounted(async () => {
    console.log('🧠 Inicializando backend WebGL...')
    await tf.setBackend('webgl')
    await tf.ready()
    console.log('✅ Backend pronto:', tf.getBackend())

    await initWebcam()

    await waitForVideoReady()

    console.log('🎥 Vídeo pronto.')
    await loadModel()

    if (props.isRunning) startTracking()
})

watch(() => props.isRunning, (val) => {
    val ? startTracking() : stopTracking()
})

onBeforeUnmount(() => {
    stopTracking()
    if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop())
    }
})

const initWebcam = async () => {
    try {
        mediaStream.value = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        })
        if (videoRef.value) {
            videoRef.value.srcObject = mediaStream.value
        }

    } catch (err) {
        console.error('🚫 Erro ao iniciar webcam:', err)
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
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh', // necessário!
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
        console.log('🔄 Loop ativo...')

        try {
            await tf.ready()
            const backend = tf.engine().backend
            if (!backend) {
                console.warn('⚠️ Backend não disponível ainda...')
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
                emit('data', data)
            }
        } catch (err) {
            console.error('❌ Erro durante rastreamento:', err)
        }

        trackingLoop = setTimeout(loop, props.msPerCapture)
    }

    loop()
}

const stopTracking = () => {
    if (trackingLoop) {
        clearTimeout(trackingLoop)
        trackingLoop = null
        console.log('⛔ Tracking parado.')
    }
}
</script>
