<template>
  <ShowInfo>
    <template #content>
      <div
        ref="welcomeContent"
        class="moderator-content pa-6 rounded-xl text-center"
      >
        <div class="moderator-badge mb-4">
          <v-chip color="primary" size="large" class="px-4 py-2">
            <v-icon start size="20">mdi-account-star</v-icon>
            <span class="split">{{
              $t('UserTestView.ModeratorWelcomeStep.badge')
            }}</span>
          </v-chip>
        </div>

        <h2 class="split text-h4 font-weight-bold mb-2 text-primary">
          {{ $t('UserTestView.ModeratorWelcomeStep.welcome') }}
        </h2>

        <p class="split text-body-1 mb-6 text-grey-darken-1">
          {{ $t('UserTestView.ModeratorWelcomeStep.description') }}
        </p>

        <!-- Webcam & Active Collaborators Row -->
        <v-row class="mb-6" justify="center">
          <!-- Facilitator Webcam Preview -->
          <v-col cols="12" md="6">
            <v-card
              class="elevation-3 rounded-xl overflow-hidden pa-4 fill-height d-flex flex-column justify-space-between"
            >
              <div class="d-flex justify-space-between align-center mb-3">
                <div
                  class="text-subtitle-1 font-weight-bold d-flex align-center"
                >
                  <v-icon color="primary" class="mr-2">mdi-webcam</v-icon>
                  Facilitator Camera Preview
                </div>
                <v-chip
                  size="small"
                  :color="isCameraOn ? 'success' : 'grey'"
                  variant="flat"
                >
                  {{ isCameraOn ? 'Camera Active' : 'Camera Off' }}
                </v-chip>
              </div>

              <div
                class="webcam-preview-container rounded-lg mb-3 bg-black d-flex align-center justify-center position-relative"
              >
                <video
                  ref="webcamVideoRef"
                  autoplay
                  playsinline
                  muted
                  class="webcam-video"
                  :class="{ 'd-none': !isCameraOn }"
                ></video>
                <div
                  v-if="!isCameraOn"
                  class="text-center pa-6 text-grey-lighten-1"
                >
                  <v-icon size="48" color="grey">mdi-camera-off</v-icon>
                  <div class="mt-2 text-caption">Webcam Preview Disabled</div>
                </div>
              </div>

              <div class="d-flex justify-center ga-2">
                <v-btn
                  size="small"
                  :color="isCameraOn ? 'primary' : 'grey'"
                  variant="outlined"
                  @click="toggleCamera"
                >
                  <v-icon start>{{
                    isCameraOn ? 'mdi-camera' : 'mdi-camera-off'
                  }}</v-icon>
                  {{ isCameraOn ? 'Turn Off Camera' : 'Turn On Camera' }}
                </v-btn>
                <v-btn
                  size="small"
                  :color="isMicOn ? 'primary' : 'grey'"
                  variant="outlined"
                  @click="toggleMic"
                >
                  <v-icon start>{{
                    isMicOn ? 'mdi-microphone' : 'mdi-microphone-off'
                  }}</v-icon>
                  {{ isMicOn ? 'Mute Mic' : 'Unmute Mic' }}
                </v-btn>
              </div>
            </v-card>
          </v-col>

          <!-- Collaborators & Facilitators Waiting Card -->
          <v-col cols="12" md="6">
            <v-card
              class="elevation-3 rounded-xl pa-4 fill-height text-left d-flex flex-column"
            >
              <div class="d-flex justify-space-between align-center mb-3">
                <div
                  class="text-subtitle-1 font-weight-bold d-flex align-center"
                >
                  <v-icon color="primary" class="mr-2"
                    >mdi-account-group</v-icon
                  >
                  Collaborators in Call
                </div>
                <v-chip color="info" size="small" variant="flat">
                  {{ staffMembers.length }}
                  {{
                    staffMembers.length === 1
                      ? 'Collaborator'
                      : 'Collaborators'
                  }}
                </v-chip>
              </div>

              <p class="text-caption text-grey-darken-1 mb-3">
                Facilitators and observers present for this moderated test:
              </p>

              <v-divider class="mb-3" />

              <div class="collaborators-list flex-grow-1 overflow-y-auto">
                <v-list
                  v-if="staffMembers && staffMembers.length > 0"
                  density="compact"
                  class="pa-0"
                >
                  <v-list-item
                    v-for="(member, index) in staffMembers"
                    :key="member.userDocId || index"
                    class="px-2 py-1 rounded-lg mb-2 bg-grey-lighten-4"
                  >
                    <template #prepend>
                      <v-avatar
                        size="32"
                        color="primary"
                        class="text-white font-weight-bold mr-3"
                      >
                        {{
                          (
                            member.fullName ||
                            member.email ||
                            'F'
                          )[0].toUpperCase()
                        }}
                      </v-avatar>
                    </template>

                    <v-list-item-title class="font-weight-medium text-body-2">
                      {{ member.fullName || member.email || 'Facilitator' }}
                    </v-list-item-title>

                    <v-list-item-subtitle
                      class="text-caption text-grey-darken-1"
                    >
                      {{ member.role || 'Facilitator' }}
                    </v-list-item-subtitle>

                    <template #append>
                      <v-chip size="x-small" color="success" variant="tonal">
                        <v-icon start size="10">mdi-circle</v-icon>
                        Joined
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>

                <div v-else class="text-center py-6 text-grey">
                  <v-icon size="36" color="grey-lighten-1"
                    >mdi-account-clock</v-icon
                  >
                  <div class="text-caption mt-1">
                    Waiting for collaborators to join...
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Instructions Card -->
        <v-row justify="center" class="mb-6">
          <v-col cols="12">
            <v-card
              class="moderator-instructions elevation-3"
              color="blue-grey-lighten-5"
            >
              <v-card-title class="text-h6 text-center pb-2">
                <v-icon start color="primary">mdi-clipboard-list</v-icon>
                {{ $t('UserTestView.ModeratorWelcomeStep.instructionsTitle') }}
              </v-card-title>
              <v-card-text>
                <v-list density="compact" class="bg-transparent text-left">
                  <v-list-item prepend-icon="mdi-video-plus" class="mb-2">
                    <v-list-item-title>{{
                      $t('UserTestView.ModeratorWelcomeStep.instruction1')
                    }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-eye" class="mb-2">
                    <v-list-item-title>{{
                      $t('UserTestView.ModeratorWelcomeStep.instruction2')
                    }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    prepend-icon="mdi-format-list-numbered"
                    class="mb-2"
                  >
                    <v-list-item-title>{{
                      $t('UserTestView.ModeratorWelcomeStep.instruction3')
                    }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-microphone" class="mb-2">
                    <v-list-item-title>{{
                      $t('UserTestView.ModeratorWelcomeStep.instruction4')
                    }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-alert type="info" variant="tonal" class="mb-6 text-left">
          <strong>{{
            $t('UserTestView.ModeratorWelcomeStep.remember')
          }}</strong>
          {{ $t('UserTestView.ModeratorWelcomeStep.note') }}
        </v-alert>

        <div class="action-buttons">
          <v-btn
            color="success"
            variant="flat"
            size="x-large"
            class="px-8"
            @click="$emit('start')"
          >
            <v-icon start>mdi-play</v-icon>
            {{ $t('UserTestView.ModeratorWelcomeStep.startSession') }}
          </v-btn>
        </div>
      </div>
    </template>
  </ShowInfo>
</template>

<script setup>
import ShowInfo from '@/shared/components/ShowInfo.vue'
import { onMounted, onBeforeUnmount, nextTick, ref } from 'vue'
import { animateModeratorWelcomeText } from '@/shared/utils/animations'

defineProps({
  stepperValue: { type: Number, required: true },
  staffMembers: { type: Array, default: () => [] },
  participantMembers: { type: Array, default: () => [] },
})

defineEmits(['start'])

const welcomeContent = ref(null)
const webcamVideoRef = ref(null)
const isCameraOn = ref(true)
const isMicOn = ref(true)
let mediaStream = null
let cleanupSplitAnimation = () => {}

async function initWebcam() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    if (webcamVideoRef.value) {
      webcamVideoRef.value.srcObject = mediaStream
    }
  } catch (err) {
    console.warn('Webcam permission not granted or device unavailable:', err)
    isCameraOn.value = false
  }
}

function toggleCamera() {
  isCameraOn.value = !isCameraOn.value
  if (mediaStream) {
    mediaStream.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOn.value
    })
  }
}

function toggleMic() {
  isMicOn.value = !isMicOn.value
  if (mediaStream) {
    mediaStream.getAudioTracks().forEach((track) => {
      track.enabled = isMicOn.value
    })
  }
}

onMounted(async () => {
  await nextTick()
  initWebcam()
  cleanupSplitAnimation = await animateModeratorWelcomeText(
    welcomeContent.value?.querySelectorAll('.split'),
  )
})

onBeforeUnmount(() => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop())
  }
  if (typeof cleanupSplitAnimation === 'function') {
    cleanupSplitAnimation()
    cleanupSplitAnimation = () => {}
  }
})
</script>

<style scoped>
.split {
  opacity: 0;
}

:deep(.line) {
  display: block;
  overflow: hidden;
}

.moderator-content {
  max-width: 900px;
  margin: 0 auto;
}

.moderator-badge {
  display: flex;
  justify-content: center;
}

.moderator-instructions {
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.webcam-preview-container {
  height: 200px;
  width: 100%;
}

.webcam-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.collaborators-list {
  max-height: 200px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .moderator-content {
    padding: 16px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons .v-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
