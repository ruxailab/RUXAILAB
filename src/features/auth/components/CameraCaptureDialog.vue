<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500px"
    persistent
    @update:model-value="handleClose"
  >
    <v-card class="rounded-xl" elevation="6">
      <v-card-title class="text-h6 font-weight-bold pa-4">
        <v-icon start color="primary">mdi-camera</v-icon>
        {{ $t('profile.cameraCaptureTitle') }}
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Error State -->
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <!-- Camera Preview / Captured Image Container -->
        <div
          class="camera-container bg-grey-darken-3 rounded-lg overflow-hidden"
        >
          <!-- Loading State -->
          <div
            v-if="isLoading"
            class="camera-placeholder d-flex align-center justify-center"
          >
            <v-progress-circular indeterminate color="primary" size="48" />
          </div>

          <!-- Live Video Preview -->
          <video
            v-show="!capturedImage && !isLoading && !errorMessage"
            ref="videoRef"
            autoplay
            playsinline
            muted
            class="camera-video"
          />

          <!-- Captured Image Preview -->
          <img
            v-if="capturedImage"
            :src="capturedImage"
            alt="Captured preview"
            class="captured-image"
          />

          <!-- Hidden Canvas for Capture -->
          <canvas ref="canvasRef" class="d-none" />
        </div>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-btn variant="text" class="text-capitalize" @click="handleClose">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-spacer />

        <!-- Show Capture button when video is streaming -->
        <v-btn
          v-if="!capturedImage && isStreaming"
          color="primary"
          variant="flat"
          class="text-capitalize"
          @click="capturePhoto"
        >
          <v-icon start>mdi-camera</v-icon>
          {{ $t('common.confirm') }}
        </v-btn>

        <!-- Show Retake/Confirm when image is captured -->
        <template v-if="capturedImage">
          <v-btn
            variant="outlined"
            class="text-capitalize mr-2"
            @click="retakePhoto"
          >
            <v-icon start>mdi-camera-retake</v-icon>
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-capitalize"
            @click="confirmPhoto"
          >
            <v-icon start>mdi-check</v-icon>
            {{ $t('common.confirm') }}
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'photo-captured'])

const { t } = useI18n()

const videoRef = ref(null)
const canvasRef = ref(null)
const mediaStream = ref(null)
const capturedImage = ref(null)
const capturedBlob = ref(null)
const isLoading = ref(false)
const isStreaming = ref(false)
const errorMessage = ref('')

// Start camera when dialog opens
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      await startCamera()
    } else {
      stopCamera()
      resetState()
    }
  },
)

const startCamera = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('CAMERA_NOT_AVAILABLE')
    }

    // Request camera with mobile-friendly constraints
    const constraints = {
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    mediaStream.value = stream

    // Wait for video element to be available
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
      isStreaming.value = true
    }
  } catch (error) {
    if (
      error.name === 'NotAllowedError' ||
      error.name === 'PermissionDeniedError'
    ) {
      errorMessage.value = t('profile.cameraPermissionDenied')
    } else if (
      error.message === 'CAMERA_NOT_AVAILABLE' ||
      error.name === 'NotFoundError'
    ) {
      errorMessage.value = t('profile.cameraNotAvailable')
    } else {
      errorMessage.value = t('profile.cameraNotAvailable')
    }
  } finally {
    isLoading.value = false
  }
}

const stopCamera = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => track.stop())
    mediaStream.value = null
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }

  isStreaming.value = false
}

const capturePhoto = () => {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  // Set canvas dimensions to match video
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // Draw video frame to canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  // Convert to blob for upload
  canvas.toBlob(
    (blob) => {
      if (blob) {
        capturedBlob.value = blob
        capturedImage.value = URL.createObjectURL(blob)

        // Stop camera stream after capture to save resources
        stopCamera()
      }
    },
    'image/jpeg',
    0.9,
  )
}

const retakePhoto = async () => {
  // Clean up previous capture
  if (capturedImage.value) {
    URL.revokeObjectURL(capturedImage.value)
  }
  capturedImage.value = null
  capturedBlob.value = null

  // Restart camera
  await startCamera()
}

const confirmPhoto = () => {
  if (capturedBlob.value) {
    // Create a File object from the blob
    const file = new File([capturedBlob.value], 'camera-capture.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })

    // Transfer ownership of the preview URL to the parent component
    // The parent is now responsible for revoking it
    const previewUrl = capturedImage.value

    // Clear our ref WITHOUT revoking (parent owns it now)
    capturedImage.value = null
    capturedBlob.value = null

    emit('photo-captured', {
      file: file,
      previewUrl: previewUrl,
    })

    emit('update:modelValue', false)
  }
}

const handleClose = () => {
  stopCamera()
  resetState()
  emit('update:modelValue', false)
}

const resetState = () => {
  if (capturedImage.value) {
    URL.revokeObjectURL(capturedImage.value)
  }
  capturedImage.value = null
  capturedBlob.value = null
  errorMessage.value = ''
  isLoading.value = false
}

// Cleanup on unmount
onBeforeUnmount(() => {
  stopCamera()
  resetState()
})
</script>

<style scoped>
.camera-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #1a1a1a;
}

.camera-placeholder {
  position: absolute;
  inset: 0;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* Mirror effect for selfie camera */
}

.captured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* Keep same mirror effect as video */
}
</style>
