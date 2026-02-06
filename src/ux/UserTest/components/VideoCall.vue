<template>
  <v-container
    fluid
    class="video-call-container mt-6"
    :class="{ 'panel-open': showSidePanel }"
  >
    <!-- Videos Row -->
    <v-row class="video-row justify-center" no-gutters>
      <!-- Screen Share Video (visible to everyone including observators) -->
      <v-col
        v-show="isSharingScreen"
        cols="12"
        class="d-flex justify-center align-center"
      >
        <div v-show="isSharingScreen" class="video-container">
          <video
            ref="screenVideo"
            autoplay
            playsinline
            class="video-element"
          ></video>
          <div class="video-label">Compartilhando tela</div>
        </div>
      </v-col>

      <!-- Grid of Participants -->
      <v-col v-if="callStarted" cols="12">
        <div class="videos-grid">
          <!-- Local Video (not for observators) -->
          <div v-if="!isObservator" class="video-wrapper">
            <div class="video-container">
              <video
                ref="localVideo"
                autoplay
                muted
                playsinline
                class="video-element"
              ></video>

              <!-- Camera disabled overlay -->
              <div v-if="!isCameraEnabled" class="camera-disabled-overlay">
                <v-icon size="64" color="white" class="mb-2"
                  >mdi-video-off</v-icon
                >
                <p class="text-white">Camera is off</p>
              </div>

              <!-- Microphone muted indicator -->
              <div v-if="!isMicrophoneEnabled" class="mic-muted-indicator">
                <v-icon size="24" color="white">mdi-microphone-off</v-icon>
              </div>

              <div class="video-label">
                Tu video ({{ user?.email?.split('@')[0] }})
              </div>
            </div>
          </div>

          <!-- Remote Videos -->
          <div
            v-for="(stream, userId) in remoteStreams"
            :key="userId"
            class="video-wrapper"
          >
            <div class="video-container">
              <video
                v-if="isRemoteCameraEnabled(userId)"
                :srcObject="stream"
                autoplay
                playsinline
                class="video-element"
              ></video>

              <!-- Camera disabled overlay for remote peer -->
              <div
                v-if="!isRemoteCameraEnabled(userId)"
                class="camera-disabled-overlay"
              >
                <v-icon size="64" color="white" class="mb-2"
                  >mdi-video-off</v-icon
                >
                <p class="text-white">Camera is off</p>
              </div>

              <!-- Microphone muted indicator for remote peer -->
              <div
                v-if="!isRemoteMicrophoneEnabled(userId)"
                class="mic-muted-indicator"
              >
                <v-icon size="24" color="white">mdi-microphone-off</v-icon>
              </div>

              <div class="video-label">{{ getPeerName(userId) }}</div>
            </div>
          </div>

          <!-- Waiting Message if no peers -->
          <div
            v-if="Object.keys(remoteStreams).length === 0"
            class="d-flex align-center justify-center pa-4 text-grey"
          >
            <v-icon class="mr-2">mdi-account-clock</v-icon>
            <span>Waiting for participants...</span>
          </div>
        </div>
      </v-col>

      <!-- Moderator Preview (before opening room) -->
      <v-col
        v-if="caller && !callStarted && !isObservator && localStream"
        cols="12"
      >
        <div class="videos-grid">
          <div class="video-wrapper">
            <div class="video-container">
              <video
                ref="localVideo"
                autoplay
                muted
                playsinline
                class="video-element"
              ></video>

              <!-- Camera disabled overlay -->
              <div v-if="!isCameraEnabled" class="camera-disabled-overlay">
                <v-icon size="64" color="white" class="mb-2"
                  >mdi-video-off</v-icon
                >
                <p class="text-white">Camera is off</p>
              </div>

              <!-- Microphone muted indicator -->
              <div v-if="!isMicrophoneEnabled" class="mic-muted-indicator">
                <v-icon size="24" color="white">mdi-microphone-off</v-icon>
              </div>

              <div class="video-label">
                Your preview ({{ user?.email?.split('@')[0] }})
              </div>
            </div>
          </div>
        </div>
      </v-col>

      <!-- Observator waiting message (before call starts) -->
      <v-col
        v-if="isObservator && !callStarted"
        cols="12"
        class="d-flex justify-center align-center"
      >
        <div class="observator-notice">
          <v-icon size="64" color="primary" class="mb-4">mdi-eye</v-icon>
          <h3 class="text-h5 mb-2">Observator Mode</h3>
          <p class="text-body-1">
            Waiting for moderator to start the session...
          </p>
          <p class="text-body-2 text-grey mt-2">
            You will be able to observe all video feeds without sending your
            own.
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Participant/Observator Waiting State (only when not started) -->
    <v-row
      v-if="!caller && !callStarted && !isObservator"
      class="participant-controls-row"
      justify="center"
      no-gutters
    >
      <v-col cols="12" class="participant-controls-container">
        <div class="participant-controls-content">
          <v-progress-circular
            indeterminate
            size="48"
            width="4"
            color="primary"
            class="mb-4"
          ></v-progress-circular>
          <h3 class="text-h6 mb-2">Waiting for moderator...</h3>
          <p class="text-body-2 text-grey">
            The video call will start automatically when the moderator opens the
            room.
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Fixed Bottom Control Bar -->
    <div class="bottom-control-bar">
      <div class="control-bar-layout">
        <!-- Left side - spacer -->
        <div class="control-bar-left"></div>

        <!-- Center - main controls -->
        <div v-if="!isObservator" class="control-buttons-container">
          <!-- Camera toggle button -->
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :class="{
                  'control-btn-disabled': !isCameraEnabled,
                  'control-btn-enabled': isCameraEnabled,
                }"
                class="control-btn"
                icon
                size="large"
                @click="toggleCamera"
              >
                <v-icon size="28">{{
                  isCameraEnabled ? 'mdi-video' : 'mdi-video-off'
                }}</v-icon>
              </v-btn>
            </template>
            <span>{{
              isCameraEnabled ? 'Turn off camera' : 'Turn on camera'
            }}</span>
          </v-tooltip>

          <!-- Microphone toggle button -->
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :class="{
                  'control-btn-disabled': !isMicrophoneEnabled,
                  'control-btn-enabled': isMicrophoneEnabled,
                }"
                class="control-btn"
                icon
                size="large"
                @click="toggleMicrophone"
              >
                <v-icon size="28">{{
                  isMicrophoneEnabled ? 'mdi-microphone' : 'mdi-microphone-off'
                }}</v-icon>
              </v-btn>
            </template>
            <span>{{
              isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'
            }}</span>
          </v-tooltip>

          <!-- Screen share button -->
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :class="{
                  'control-btn-active': isSharingScreen,
                  'control-btn-enabled': !isSharingScreen,
                }"
                class="control-btn"
                icon
                size="large"
                @click="handleScreenShare"
              >
                <v-icon size="28">{{
                  isSharingScreen ? 'mdi-monitor-off' : 'mdi-monitor-screenshot'
                }}</v-icon>
              </v-btn>
            </template>
            <span>{{
              isSharingScreen ? 'Stop sharing screen' : 'Share screen'
            }}</span>
          </v-tooltip>
        </div>

        <!-- Right side - panel toggles -->
        <div class="control-bar-right">
          <!-- Open Room button (for moderator) -->
          <v-tooltip v-if="caller && !callStarted" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="success"
                class="control-btn control-btn-primary me-2"
                size="large"
                @click="startCall"
              >
                <v-icon start size="20">mdi-video-plus</v-icon>
                Open Room
              </v-btn>
            </template>
            <span>Start the video call session</span>
          </v-tooltip>

          <!-- End Call button (for moderator when call is active) -->
          <v-tooltip v-if="caller && callStarted" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="error"
                class="control-btn control-btn-danger me-2"
                size="large"
                @click="endCall"
              >
                <v-icon start size="20">mdi-phone-hangup</v-icon>
                End Call
              </v-btn>
            </template>
            <span>End the video call session</span>
          </v-tooltip>

          <!-- End Call button (for participant when call is active) -->
          <v-tooltip v-if="!caller && callStarted" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="error"
                class="control-btn control-btn-danger me-2"
                size="large"
                @click="endCall"
              >
                <v-icon start size="20">mdi-phone-hangup</v-icon>
                Leave Call
              </v-btn>
            </template>
            <span>Leave the video call session</span>
          </v-tooltip>

          <!-- Stepper menu button -->
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :class="{
                  'control-btn-active': showStepperPanel,
                  'control-btn-enabled': !showStepperPanel,
                }"
                class="control-btn"
                icon
                size="large"
                @click="toggleStepperPanel"
              >
                <v-icon size="28">mdi-format-list-numbered</v-icon>
              </v-btn>
            </template>
            <span>{{ showStepperPanel ? 'Hide steps' : 'Show steps' }}</span>
          </v-tooltip>

          <!-- Side panel toggle button -->
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :class="{
                  'control-btn-active': showSidePanel,
                  'control-btn-enabled': !showSidePanel,
                }"
                class="control-btn"
                icon
                size="large"
                @click="toggleSidePanel"
              >
                <v-icon size="28">mdi-account-group</v-icon>
              </v-btn>
            </template>
            <span>{{ showSidePanel ? 'Hide panel' : 'Show panel' }}</span>
          </v-tooltip>
        </div>
      </div>
    </div>

    <!-- Side Panel -->
    <div class="side-panel" :class="{ 'side-panel-open': showSidePanel }">
      <div class="side-panel-header">
        <h3>Panel de Herramientas</h3>
        <v-btn
          icon
          size="small"
          variant="text"
          class="close-btn"
          @click="toggleSidePanel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="side-panel-content">
        <!-- Session Controls Section -->
        <div class="panel-section">
          <h4>Control de Sesión</h4>

          <!-- Connection controls when call is not started -->
          <div v-if="!callStarted" class="session-controls">
            <!-- Note: Join Room controls moved to main interface for better visibility -->
            <div v-if="!caller" class="participant-info">
              <p class="text-body-2 mb-0">
                <v-icon start size="16">mdi-information</v-icon>
                Join room controls are now in the main interface above
              </p>
            </div>
          </div>

          <!-- Call controls when call is active -->
          <div v-else class="session-controls">
            <!-- Proceed to next step (only for moderator) -->
            <v-btn
              v-if="caller"
              color="success"
              size="large"
              block
              class="mb-3"
              @click="proceedToNextStep"
            >
              <v-icon start>mdi-arrow-right</v-icon>
              Proceed to Next Step
            </v-btn>

            <!-- End call button -->
            <v-btn
              color="error"
              size="large"
              block
              variant="outlined"
              @click="endCall"
            >
              <v-icon start>mdi-phone-hangup</v-icon>
              End Call
            </v-btn>

            <!-- Call status -->
            <div class="status-message">
              <v-chip color="green" size="small" class="mb-2">
                <v-icon start size="16">mdi-phone</v-icon>
                Llamada activa
              </v-chip>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h4>Participantes</h4>
          <div
            v-for="participant in participantsList"
            :key="participant.id"
            class="participant-item"
          >
            <v-avatar
              size="32"
              :color="
                participant.role === 'moderator'
                  ? 'blue'
                  : participant.role === 'observator'
                    ? 'orange'
                    : 'green'
              "
            >
              <v-icon color="white">{{
                participant.role === 'moderator'
                  ? 'mdi-account-star'
                  : participant.role === 'observator'
                    ? 'mdi-eye'
                    : 'mdi-account'
              }}</v-icon>
            </v-avatar>
            <div class="participant-info">
              <span class="participant-name">
                {{ participant.name }}{{ participant.isSelf ? ' (Tú)' : '' }}
                <v-chip
                  v-if="participant.role === 'observator'"
                  size="x-small"
                  color="orange"
                  class="ml-1"
                >
                  Observador
                </v-chip>
                <v-chip
                  v-else-if="participant.role === 'moderator'"
                  size="x-small"
                  color="blue"
                  class="ml-1"
                >
                  Moderador
                </v-chip>
              </span>
              <div class="participant-status">
                <v-chip
                  size="x-small"
                  :color="participant.connected ? 'green' : 'grey'"
                >
                  {{ participant.connected ? 'Conectado' : 'Desconectado' }}
                </v-chip>
                <v-chip
                  v-if="participant.isSelf && !isObservator"
                  size="x-small"
                  :color="participant.hasCamera ? 'green' : 'red'"
                  class="ml-1"
                >
                  {{ participant.hasCamera ? 'Cámara' : 'Sin cámara' }}
                </v-chip>
                <v-chip
                  v-if="participant.isSelf && !isObservator"
                  size="x-small"
                  :color="participant.hasMicrophone ? 'green' : 'red'"
                  class="ml-1"
                >
                  {{
                    participant.hasMicrophone ? 'Micrófono' : 'Sin micrófono'
                  }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h4>Configuración</h4>
          <v-list density="compact">
            <v-list-item @click="toggleCamera">
              <template #prepend>
                <v-icon :color="isCameraEnabled ? 'green' : 'red'">
                  {{ isCameraEnabled ? 'mdi-video' : 'mdi-video-off' }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{ isCameraEnabled ? 'Desactivar cámara' : 'Activar cámara' }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="toggleMicrophone">
              <template #prepend>
                <v-icon :color="isMicrophoneEnabled ? 'green' : 'red'">
                  {{
                    isMicrophoneEnabled
                      ? 'mdi-microphone'
                      : 'mdi-microphone-off'
                  }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{
                  isMicrophoneEnabled
                    ? 'Silenciar micrófono'
                    : 'Activar micrófono'
                }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item v-if="callStarted" @click="handleScreenShare">
              <template #prepend>
                <v-icon :color="isSharingScreen ? 'blue' : 'grey'">
                  {{
                    isSharingScreen
                      ? 'mdi-monitor-off'
                      : 'mdi-monitor-screenshot'
                  }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{
                  isSharingScreen
                    ? 'Detener compartir pantalla'
                    : 'Compartir pantalla'
                }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </div>
    </div>

    <!-- Stepper Panel -->
    <div
      class="stepper-panel"
      :class="{ 'stepper-panel-open': showStepperPanel }"
    >
      <div class="stepper-panel-header">
        <h3>Test Progress</h3>
        <v-btn
          icon
          size="small"
          variant="text"
          class="close-btn"
          @click="toggleStepperPanel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="stepper-panel-content">
        <!-- Moderator indicator -->
        <div v-if="!caller" class="moderator-notice">
          <v-chip size="small" color="orange" class="mb-4">
            <v-icon start size="16">mdi-information</v-icon>
            Solo el moderador puede cambiar los pasos
          </v-chip>
        </div>

        <!-- Custom Stepper -->
        <div class="custom-stepper">
          <!-- Consent Step -->
          <div
            class="step-item"
            :class="{
              'step-active': currentStepperValue === 0,
              'step-completed': currentStepperValue >= 1,
              'step-clickable': caller,
            }"
            @click="caller && goToStep('consent')"
          >
            <div class="step-indicator">
              <div class="step-number">
                <v-icon v-if="currentStepperValue >= 1" color="white" size="16"
                  >mdi-check</v-icon
                >
                <span v-else>1</span>
              </div>
              <div v-if="currentStepperValue >= 1" class="step-line"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">Consent</h4>
              <p class="step-description">User consent and agreement</p>
            </div>
          </div>

          <!-- Pre-test Step -->
          <div
            class="step-item"
            :class="{
              'step-active': currentStepperValue === 1,
              'step-completed': currentStepperValue >= 2,
              'step-clickable': caller,
            }"
            @click="caller && goToStep('pretest')"
          >
            <div class="step-indicator">
              <div class="step-number">
                <v-icon v-if="currentStepperValue >= 2" color="white" size="16"
                  >mdi-check</v-icon
                >
                <span v-else>2</span>
              </div>
              <div v-if="currentStepperValue >= 2" class="step-line"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">Pre-test</h4>
              <p class="step-description">Initial questionnaire</p>
            </div>
          </div>

          <!-- Tasks Step -->
          <div
            class="step-item"
            :class="{
              'step-active': currentStepperValue === 2,
              'step-completed': currentStepperValue >= 3,
              'step-clickable': caller,
            }"
            @click="caller && goToStep('tasks')"
          >
            <div class="step-indicator">
              <div class="step-number">
                <v-icon v-if="currentStepperValue >= 3" color="white" size="16"
                  >mdi-check</v-icon
                >
                <span v-else>3</span>
              </div>
              <div v-if="currentStepperValue >= 3" class="step-line"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">Tasks</h4>
              <p class="step-description">User testing tasks</p>

              <!-- Task dropdown when active and moderator -->
              <div
                v-if="
                  currentStepperValue === 2 &&
                  caller &&
                  test?.testStructure?.userTasks
                "
                class="tasks-dropdown mt-3"
              >
                <v-select
                  :items="taskDropdownItems"
                  :model-value="currentTaskIndex"
                  item-title="title"
                  item-value="index"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="task-selector"
                  placeholder="Select a task"
                  prepend-inner-icon="mdi-format-list-bulleted"
                  @update:model-value="goToSpecificTask"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :title="item.raw.title">
                      <template #prepend>
                        <v-icon
                          size="20"
                          :color="
                            item.raw.index < currentTaskIndex
                              ? 'success'
                              : item.raw.index === currentTaskIndex
                                ? 'primary'
                                : 'grey'
                          "
                        >
                          {{
                            item.raw.index < currentTaskIndex
                              ? 'mdi-check-circle'
                              : item.raw.index === currentTaskIndex
                                ? 'mdi-play-circle'
                                : 'mdi-circle-outline'
                          }}
                        </v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </div>
            </div>
          </div>

          <!-- Post-test Step -->
          <div
            class="step-item"
            :class="{
              'step-active': currentStepperValue === 3,
              'step-completed': currentStepperValue >= 4,
              'step-clickable': caller,
            }"
            @click="caller && goToStep('posttest')"
          >
            <div class="step-indicator">
              <div class="step-number">
                <v-icon v-if="currentStepperValue >= 4" color="white" size="16"
                  >mdi-check</v-icon
                >
                <span v-else>4</span>
              </div>
              <div v-if="currentStepperValue >= 4" class="step-line"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">Post-test</h4>
              <p class="step-description">Final questionnaire</p>
            </div>
          </div>

          <!-- Completion Step -->
          <div
            class="step-item"
            :class="{
              'step-active': currentStepperValue === 4,
              'step-completed': currentStepperValue === 5,
              'step-clickable': caller,
            }"
            @click="caller && goToStep('completion')"
          >
            <div class="step-indicator">
              <div class="step-number">
                <v-icon v-if="currentStepperValue === 5" color="white" size="16"
                  >mdi-check</v-icon
                >
                <span v-else>5</span>
              </div>
            </div>
            <div class="step-content">
              <h4 class="step-title">Completion</h4>
              <p class="step-description">Test finished</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay for panels (mobile) -->
    <div
      v-if="showSidePanel || showStepperPanel"
      class="panel-overlay"
      @click="
        () => {
          showSidePanel = false
          showStepperPanel = false
        }
      "
    ></div>

    <!-- Join Room Dialog for Participants -->
    <v-dialog v-model="showJoinDialog" max-width="400" persistent>
      <v-card class="rounded-xl pa-6 text-center">
        <v-avatar color="primary" size="80" class="mb-4">
          <v-icon size="40" color="white">mdi-video-plus</v-icon>
        </v-avatar>

        <v-card-title class="text-h6 font-weight-bold mb-2">
          Video Call Started
        </v-card-title>

        <v-card-text class="text-body-1 mb-4">
          The moderator has started the video call. Would you like to join now?
        </v-card-text>

        <v-card-actions class="d-flex flex-column pa-0">
          <v-btn
            color="primary"
            size="large"
            block
            variant="flat"
            class="mb-2"
            @click="joinRoomFromDialog"
          >
            <v-icon start>mdi-video</v-icon>
            Join Video Call
          </v-btn>

          <v-btn
            color="grey"
            size="small"
            variant="text"
            @click="dismissJoinDialog"
          >
            Maybe later
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { database } from '@/app/plugins/firebase/index'
import {
  ref as dbRef,
  set,
  onValue,
  push,
  get,
  onDisconnect,
  remove,
  update,
  onChildAdded,
} from 'firebase/database'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'

const props = defineProps({
  roomId: String,
  isModerator: Boolean,
  user: Object,
  accessLevel: Number,
  currentGlobalIndex: Number,
  currentTaskIndex: Number,
  test: Object,
  localTestAnswer: Object,
})

const emit = defineEmits([
  'setRemoteStream',
  'proceedToNextStep',
  'stepSelected',
])

// Local State
const localVideo = ref(null)
const screenVideo = ref(null)
const localStream = ref(null)
const screenStream = ref(null)
const isSharingScreen = ref(false)

// Camera and microphone controls
const isCameraEnabled = ref(true)
const isMicrophoneEnabled = ref(true)

// Side panel control
const showSidePanel = ref(false)
const showStepperPanel = ref(false)
const showJoinDialog = ref(false) // Legacy support, maybe unused in Mesh

// Mesh State
const peers = reactive({}) // userId -> { connection: RTCPeerConnection, stream: MediaStream }
const participants = ref({}) // userId -> user info (name, etc)

// Computed
const isObservator = computed(
  () => props.accessLevel === ACCESS_LEVEL.OBSERVATOR,
)
const remoteStreams = computed(() => {
  const streams = {}
  for (const [userId, peer] of Object.entries(peers)) {
    if (peer.stream) streams[userId] = peer.stream
  }
  return streams
})
const callStarted = computed(
  () =>
    roomReady.value && (Object.keys(peers).length > 0 || !!localStream.value),
)

// Organize participants by role
const participantsList = computed(() => {
  const list = []

  // Add self first
  list.push({
    id: props.user.id,
    name: props.user.email?.split('@')[0] || 'You',
    email: props.user.email,
    isSelf: true,
    role: isObservator.value
      ? 'observator'
      : props.isModerator
        ? 'moderator'
        : 'participant',
    connected: true,
    hasCamera: !isObservator.value && isCameraEnabled.value,
    hasMicrophone: !isObservator.value && isMicrophoneEnabled.value,
  })

  // Add others from participants
  Object.keys(participants.value).forEach((userId) => {
    if (userId === props.user.id) return

    const p = participants.value[userId]
    const coop = props.test?.cooperators?.find((c) => c.userDocId === userId)

    // Determine role
    let role = 'participant'
    if (coop) {
      if (coop.accessLevel === ACCESS_LEVEL.OBSERVATOR) {
        role = 'observator'
      } else if (coop.accessLevel === ACCESS_LEVEL.ADMIN) {
        role = 'moderator'
      }
    }

    list.push({
      id: userId,
      name:
        p.name ||
        p.email?.split('@')[0] ||
        coop?.email?.split('@')[0] ||
        'Unknown',
      email: p.email || coop?.email,
      isSelf: false,
      role: role,
      connected: !!peers[userId],
      hasCamera: role !== 'observator',
      hasMicrophone: role !== 'observator',
    })
  })

  return list
})

// Helper to get name
const getPeerName = (userId) => {
  const p = participants.value[userId]
  if (p) return p.name || p.email
  // Fallback to finding in test cooperators
  const coop = props.test?.cooperators?.find((c) => c.userDocId === userId)
  return coop?.email || 'Participant'
}

// Computed property for task dropdown items
const taskDropdownItems = computed(() => {
  if (!props.test?.testStructure?.userTasks) return []
  return props.test.testStructure.userTasks.map((task, index) => ({
    title: `Task ${index + 1}: ${
      task.name || task.title || `User Task ${index + 1}`
    }`,
    index: index,
    completed: index < (props.currentTaskIndex || 0),
    active: index === (props.currentTaskIndex || 0),
  }))
})

const currentStepperValue = computed(() => {
  const globalIndex = props.currentGlobalIndex
  const taskIndex = props.currentTaskIndex || 0
  if (globalIndex === 0) return -1
  if (globalIndex === 1 && taskIndex === 0) return 0
  if (globalIndex === 2 && taskIndex === 0) return 1
  if (globalIndex === 3 && taskIndex === 0) return 2
  if (globalIndex === 4 && taskIndex >= 0) return 2
  if (globalIndex === 5) return 3
  if (globalIndex === 6) return 4
  return 0
})

// --- Initialization ---

const roomReady = ref(false)

// Watch for localVideo ref and ensure stream is attached
watch([localVideo, localStream], ([videoEl, stream]) => {
  if (videoEl && stream && !isObservator.value) {
    videoEl.srcObject = stream
  }
})

onMounted(async () => {
  // Moderator gets media preview but doesn't join room yet
  if (props.isModerator) {
    // Just get local media for preview
    if (!isObservator.value) {
      await initLocalMedia()
    }
  } else {
    // Participants and observators wait for room to be opened by moderator
    const roomRef = dbRef(database, `rooms/${props.roomId}`)

    // Check initial value first
    const initialSnapshot = await get(roomRef)
    const initialData = initialSnapshot.val()
    if (initialData?.showVideoCall && !roomReady.value) {
      roomReady.value = true
      await joinRoom()
    }

    // Then listen for changes
    onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val()
      if (roomData?.showVideoCall) {
        if (!roomReady.value) {
          roomReady.value = true
          joinRoom()
        }
      }
    })
  }
})

onBeforeUnmount(() => {
  leaveRoom()
})

// --- Signaling & Mesh Logic ---

const joinRoom = async () => {
  // 1. Get Local Media (if not observator and don't have it yet)
  if (!isObservator.value && !localStream.value) {
    await initLocalMedia()
  }

  // 2. Register self in participants list
  const myRef = dbRef(
    database,
    `calls/${props.roomId}/participants/${props.user.id}`,
  )
  await set(myRef, {
    email: props.user.email,
    name: props.user.email?.split('@')[0], // Simple name
    joinedAt: Date.now(),
    cameraEnabled: isCameraEnabled.value,
    microphoneEnabled: isMicrophoneEnabled.value,
  })
  onDisconnect(myRef).remove() // Auto-remove on closing tab

  // 3. Listen to participants to initiate connections
  const participantsRef = dbRef(database, `calls/${props.roomId}/participants`)
  onValue(participantsRef, (snapshot) => {
    const val = snapshot.val() || {}
    participants.value = val

    // Check for new peers to connect to
    Object.keys(val).forEach((userId) => {
      if (userId === props.user.id) return
      if (!peers[userId]) {
        // Found a peer we look not connected to.
        // Rule: Initiator is the one with lexicographically smaller ID (or simply: if I am newer? No, consistent sort is better)
        // Actually, simplest Mesh strategy:
        // "I connect to everyone ALREADY in the room".
        // When I join, I see existing users -> I offer.
        // They see me -> They wait for offer.
        // How to distinguish? 'joinedAt' timestamp.
        const otherJoinedAt = val[userId].joinedAt
        const myJoinedAt = val[props.user.id]?.joinedAt

        // If I joined AFTER them, I initiate.
        // If timestamps equal (rare), fall back to ID comparison.
        const shouldInitiate =
          myJoinedAt > otherJoinedAt ||
          (myJoinedAt === otherJoinedAt && props.user.id > userId)

        createPeerConnection(userId, shouldInitiate)
      }
    })

    // Cleanup left peers
    Object.keys(peers).forEach((userId) => {
      if (!val[userId]) {
        closePeerConnection(userId)
      }
    })
  })

  // 4. Listen for Signals (Offers/Answers/Candidates) targeted at ME
  const mySignalsRef = dbRef(
    database,
    `calls/${props.roomId}/signals/${props.user.id}`,
  )
  onChildAdded(mySignalsRef, async (snapshot) => {
    const signal = snapshot.val()
    // signal structure expected: { senderId: '...', ...payload } from my push logic?
    // Wait, my sendSignal uses `push(..., payload)`.
    // Payload should include `senderId` to know who it is from!
    // Or I should restructure the path to include senderId: `signals/{myId}/{senderId}/{pushId}` -> tricky to listen to all.
    // Better: Payload includes `senderId`.

    if (!signal || !signal.senderId) return
    const senderId = signal.senderId

    if (!peers[senderId]) {
      createPeerConnection(senderId, false)
    }
    const pc = peers[senderId].connection

    if (signal.type === 'offer') {
      const desc = new RTCSessionDescription({ type: 'offer', sdp: signal.sdp })
      try {
        await pc.setRemoteDescription(desc)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        sendSignal(senderId, { type: 'answer', sdp: answer.sdp })
      } catch {
        // Error handling offer
      }
    } else if (signal.type === 'answer') {
      // Only set answer if we're waiting for one (have-local-offer state)
      if (pc.signalingState === 'have-local-offer') {
        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }),
          )
        } catch {
          // Error setting remote answer
        }
      }
    } else if (signal.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate))
      } catch {
        // Error adding candidate
      }
    }

    // Remove processed signal to keep db clean
    remove(snapshot.ref)
  })
}

const sendSignal = async (targetUserId, payload) => {
  // Add senderId to payload so receiver knows who sent it
  const enhancedPayload = { ...payload, senderId: props.user.id }
  await push(
    dbRef(database, `calls/${props.roomId}/signals/${targetUserId}`),
    enhancedPayload,
  )
}

// Refined Listener for Signals
// We need to run this per sender or globally.
// Let's restart the listener part logic.
// See `joinRoom` function for corrected logic below (I will use child_added there).

const leaveRoom = () => {
  // Stop media
  if (localStream.value) {
    localStream.value.getTracks().forEach((t) => t.stop())
  }
  // Close all connections
  Object.values(peers).forEach((p) => p.connection.close())
  // Remove self
  remove(dbRef(database, `calls/${props.roomId}/participants/${props.user.id}`))
  remove(dbRef(database, `calls/${props.roomId}/signals/${props.user.id}`)) // Clean my inbox
}

const initLocalMedia = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    localStream.value = stream
    if (localVideo.value) localVideo.value.srcObject = stream
    isCameraEnabled.value = true
    isMicrophoneEnabled.value = true
  } catch {
    isCameraEnabled.value = false
  }
}

const createPeerConnection = (targetUserId, isInitiator) => {
  if (peers[targetUserId]) return // Already exists

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  })

  peers[targetUserId] = {
    connection: pc,
    stream: null,
  }

  // Add local tracks ONLY if not an observator
  // Observators receive-only to save bandwidth
  if (!isObservator.value && localStream.value) {
    localStream.value.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.value)
    })
  }

  // If observator, set up receive-only transceivers
  if (isObservator.value) {
    pc.addTransceiver('video', { direction: 'recvonly' })
    pc.addTransceiver('audio', { direction: 'recvonly' })
  }

  pc.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      peers[targetUserId].stream = event.streams[0]
    }
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignal(targetUserId, { candidate: event.candidate.toJSON() })
    }
  }

  if (isInitiator) {
    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        sendSignal(targetUserId, { type: 'offer', sdp: offer.sdp })
      } catch {
        // Error on negotiation
      }
    }

    // Manually trigger offer creation for initiator
    // negotiationneeded might not fire immediately
    setTimeout(async () => {
      if (pc.signalingState === 'stable' && !pc.currentRemoteDescription) {
        try {
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          sendSignal(targetUserId, { type: 'offer', sdp: offer.sdp })
        } catch {
          // Error creating initial offer
        }
      }
    }, 100)
  }

  // Listen for specific signals from this sender?
  // No, the global listener handles dispatching to `peers[senderId]`.
}

const closePeerConnection = (userId) => {
  if (peers[userId]) {
    peers[userId].connection.close()
    delete peers[userId]
  }
}

// --- UI Methods ---

// --- UI & Helper Methods ---

const caller = computed(() => props.isModerator)

function toggleCamera() {
  if (!localStream.value) return
  const track = localStream.value.getVideoTracks()[0]
  if (track) {
    track.enabled = !track.enabled
    isCameraEnabled.value = track.enabled
    // Share camera state with other peers
    updateParticipantStatus()
  }
}

function toggleMicrophone() {
  if (!localStream.value) return
  const track = localStream.value.getAudioTracks()[0]
  if (track) {
    track.enabled = !track.enabled
    isMicrophoneEnabled.value = track.enabled
    // Share mic state with other peers
    updateParticipantStatus()
  }
}

async function updateParticipantStatus() {
  if (!props.user?.id || !props.roomId) return
  try {
    const participantRef = dbRef(
      database,
      `calls/${props.roomId}/participants/${props.user.id}`,
    )
    await update(participantRef, {
      cameraEnabled: isCameraEnabled.value,
      microphoneEnabled: isMicrophoneEnabled.value,
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error('Error updating participant status:', error) // eslint-disable-line no-console
  }
}

function isRemoteCameraEnabled(userId) {
  return participants.value[userId]?.cameraEnabled !== false
}

function isRemoteMicrophoneEnabled(userId) {
  return participants.value[userId]?.microphoneEnabled !== false
}

function toggleSidePanel() {
  showSidePanel.value = !showSidePanel.value
  if (showSidePanel.value) showStepperPanel.value = false
}

function toggleStepperPanel() {
  showStepperPanel.value = !showStepperPanel.value
  if (showStepperPanel.value) showSidePanel.value = false
}

// Navigation Maps
function goToStep(stepType) {
  if (!props.isModerator) return
  let globalIndex = 0
  let taskIndex = 0
  switch (stepType) {
    case 'consent':
      globalIndex = 1
      taskIndex = 0
      break
    case 'pretest':
      globalIndex = 2
      taskIndex = 0
      break
    case 'tasks':
      globalIndex = 4
      taskIndex = 0
      break
    case 'posttest':
      globalIndex = 5
      taskIndex = 0
      break
    case 'completion':
      globalIndex = 6
      taskIndex = 0
      break
  }
  emit('stepSelected', { globalIndex, taskIndex, stepType })
}

function goToSpecificTask(taskIndex) {
  if (!props.isModerator) return
  emit('stepSelected', { globalIndex: 4, taskIndex, stepType: 'tasks' })
}

function proceedToNextStep() {
  emit('proceedToNextStep')
}

// Dialogs
function joinRoomFromDialog() {
  showJoinDialog.value = false
  // joinRoom is already authenticating, but maybe we want to unmute?
}

function dismissJoinDialog() {
  showJoinDialog.value = false
}

// Aliases for Template Compatibility
const startCall = async () => {
  // Moderator joins the room and signals others
  try {
    // Set flag first so others can join
    await update(dbRef(database, `rooms/${props.roomId}`), {
      showVideoCall: true,
    })
    // Now moderator joins
    roomReady.value = true
    await joinRoom()
  } catch {
    // Failed to open room
  }
}
const endCall = async () => {
  if (caller.value) {
    try {
      await remove(dbRef(database, `calls/${props.roomId}`))
    } catch {
      // Failed to remove calls node
    }
    try {
      await update(dbRef(database, `rooms/${props.roomId}`), {
        showVideoCall: false,
      })
    } catch {
      // Failed to update rooms showVideoCall
    }
    leaveRoom()
  } else {
    // Non-moderator: can just leave locally
    leaveRoom()
  }
}

// Screen Sharing (Mesh Compatible)
async function handleScreenShare() {
  if (isSharingScreen.value) {
    await stopScreenShare()
  } else {
    await startScreenShare()
  }
}

async function startScreenShare() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    })
    screenStream.value = stream
    isSharingScreen.value = true // Update state immediately

    if (screenVideo.value) {
      screenVideo.value.srcObject = stream
    }

    const videoTrack = stream.getVideoTracks()[0]
    videoTrack.onended = () => stopScreenShare()

    // Replace track for all existing peers
    for (const userId in peers) {
      const pc = peers[userId].connection
      if (pc) {
        const sender = pc
          .getSenders()
          .find((s) => s.track && s.track.kind === 'video')
        if (sender) {
          sender.replaceTrack(videoTrack)
        } else {
          // If no video sender (e.g. initial audio only?), add it?
          // Creating Offer again would be needed.
          // For now assuming video track exists (transceiver initialized).
        }
      }
    }
  } catch {
    isSharingScreen.value = false
  }
}

async function stopScreenShare() {
  if (screenStream.value) {
    screenStream.value.getTracks().forEach((track) => track.stop())
    screenStream.value = null
  }
  isSharingScreen.value = false

  // Revert to camera
  if (localStream.value) {
    const videoTrack = localStream.value.getVideoTracks()[0]
    for (const userId in peers) {
      const pc = peers[userId].connection
      if (pc) {
        const sender = pc
          .getSenders()
          .find((s) => s.track && s.track.kind === 'video')
        if (sender && videoTrack) sender.replaceTrack(videoTrack)
      }
    }
  }
}

// Re-implement signal listening with child_added for robustness
watch(
  () => props.user.id,
  (myId) => {
    // Just to be safe if user loads late
    if (!myId || !participants.value) return
    // Setup listener - actually better to do this in joinRoom or onMounted once user is available
  },
  { immediate: true },
)

// Overwrite the listener in joinRoom with a better one:
// In joinRoom step 4:
// const myInbox = dbRef(database, `calls/${props.roomId}/signals/${props.user.id}`);
// onChildAdded(myInbox, (snapshot) => { ... logic ... remove(snapshot.ref) });
</script>

<style scoped>
.video-call-container {
  display: flex;
  flex-direction: column;
  min-height: auto;
  transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Adjust content when panel is open on desktop */
@media (min-width: 769px) {
  .video-call-container.panel-open {
    margin-right: 400px;
  }
}

.video-row {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 400px;
  flex: 0 0 auto; /* Don't grow to fill height */
}

.videos-grid {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
}

.video-wrapper {
  flex: 0 1 auto;
  display: flex;
  justify-content: center;
}

.videos-container {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  width: 100%;
}

.not-connected-message {
  border: 3px solid rgb(var(--v-theme-primary));
  border-radius: 16px;
  background-color: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 400px;
  padding: 1rem;
  box-sizing: border-box;
  font-size: 1.1rem;
  font-weight: 500;
}

.video-element {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border: 3px solid rgb(var(--v-theme-primary));
  border-radius: 16px;
  box-sizing: border-box;
}

.v-container {
  padding-top: 0;
  padding-bottom: 0;
}

/* Fixed Bottom Control Bar */
.bottom-control-bar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 800px;
  width: calc(100% - 32px);
  background: rgba(var(--v-theme-primary), 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 12px 20px;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.control-bar-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.control-bar-left {
  flex: 0 0 120px;
  display: flex;
  justify-content: center;
}

.control-bar-right {
  flex: 0 0 120px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.control-buttons-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: white;
}

/* Control button styles */
.control-btn {
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.control-btn-enabled {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
}

.control-btn-enabled:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.05) !important;
}

.control-btn-disabled {
  background: #ea4335 !important;
  color: white !important;
  border: 2px solid #ea4335 !important;
}

.control-btn-disabled:hover {
  background: #d93025 !important;
  border-color: #d93025 !important;
  transform: scale(1.05) !important;
}

.control-btn-active {
  background: #1976d2 !important;
  color: white !important;
  border: 2px solid #1976d2 !important;
}

.control-btn-active:hover {
  background: #1565c0 !important;
  border-color: #1565c0 !important;
  transform: scale(1.05) !important;
}

.control-btn-primary {
  width: auto !important;
  height: 48px !important;
  border-radius: 24px !important;
  padding: 0 20px !important;
  background: #4caf50 !important;
  color: white !important;
  border: none !important;
  font-weight: 600 !important;
  text-transform: none !important;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3) !important;
}

.control-btn-primary:hover {
  background: #45a049 !important;
  transform: scale(1.05) !important;
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4) !important;
}

.control-btn-danger {
  width: auto !important;
  height: 48px !important;
  border-radius: 24px !important;
  padding: 0 20px !important;
  background: #f44336 !important;
  color: white !important;
  border: none !important;
  font-weight: 600 !important;
  text-transform: none !important;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3) !important;
}

.control-btn-danger:hover {
  background: #d32f2f !important;
  transform: scale(1.05) !important;
  box-shadow: 0 6px 16px rgba(244, 67, 54, 0.4) !important;
}

/* Participant controls in main interface - completely separate row */
.participant-controls-row {
  margin-top: 40px;
  margin-bottom: 24px;
  min-height: 120px;
  flex: 0 0 auto; /* Fixed height, don't grow */
  clear: both; /* Ensure it clears any floating elements */
  position: relative; /* Ensure proper positioning context */
  width: 100%;
}

.participant-controls-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 !important;
  width: 100%;
}

.participant-controls-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  max-width: 400px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 2px solid rgba(25, 118, 210, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.join-room-btn {
  width: 100%;
  max-width: 300px;
  height: 56px !important;
  border-radius: 28px !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  text-transform: none !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
  transition: all 0.3s ease !important;
}

.join-room-btn:hover:not(:disabled) {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(25, 118, 210, 0.4) !important;
}

.join-room-btn:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

/* Video container for overlays */
.video-container {
  position: relative;
  flex: 1;
  max-width: 500px;
  min-width: 300px;
  height: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

/* Video label */
.video-label {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(4px);
  z-index: 20;
}

/* Camera disabled overlay */
.camera-disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Microphone muted indicator */
.mic-muted-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(234, 67, 53, 0.9);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15;
  backdrop-filter: blur(4px);
}

/* Observator Notice */
.observator-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 40px;
  background: rgba(var(--v-theme-surface), 1);
  border-radius: 16px;
  border: 2px solid rgba(var(--v-theme-primary), 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 40px auto;
}

/* Side Panel */
.side-panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  z-index: 1500;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.side-panel-open {
  right: 0;
}

.side-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
}

.side-panel-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  color: #666 !important;
}

.side-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Stepper Panel */
.stepper-panel {
  position: fixed;
  top: 0;
  right: -350px;
  width: 350px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  z-index: 1600;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.stepper-panel-open {
  right: 0;
}

.stepper-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
}

.stepper-panel-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.stepper-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Custom Stepper Styles */
.custom-stepper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
}

.step-clickable {
  cursor: pointer;
}

.step-clickable:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.2);
  transform: translateX(4px);
}

.step-active {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.step-completed {
  background-color: rgba(var(--v-theme-success), 0.05);
  border-color: rgba(var(--v-theme-success), 0.2);
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  position: relative;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background-color: #e0e0e0;
  color: #666;
  border: 3px solid #e0e0e0;
}

.step-active .step-number {
  background-color: rgba(var(--v-theme-primary), 1);
  color: white;
  border-color: rgba(var(--v-theme-primary), 1);
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.2);
}

.step-completed .step-number {
  background-color: rgba(var(--v-theme-success), 1);
  color: white;
  border-color: rgba(var(--v-theme-success), 1);
}

.step-line {
  width: 3px;
  height: 30px;
  background-color: rgba(var(--v-theme-success), 1);
  margin-top: 8px;
  border-radius: 2px;
}

.step-content {
  flex: 1;
  padding-top: 4px;
}

.step-title {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  transition: color 0.3s ease;
}

.step-description {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
  line-height: 1.4;
}

.step-active .step-title {
  color: rgba(var(--v-theme-primary), 1);
}

.step-completed .step-title {
  color: rgba(var(--v-theme-success), 1);
}

.step-clickable:hover .step-title {
  color: rgba(var(--v-theme-primary), 1);
}

.step-clickable:hover .step-number {
  transform: scale(1.1);
  box-shadow: 0 2px 12px rgba(var(--v-theme-primary), 0.3);
}

.moderator-notice {
  text-align: center;
  margin-bottom: 16px;
}

.tasks-dropdown {
  margin-top: 12px;
}

.task-selector {
  font-size: 0.875rem;
}

.task-selector :deep(.v-field) {
  border-radius: 8px;
  background-color: rgba(var(--v-theme-surface), 0.8);
}

.task-selector :deep(.v-field__input) {
  font-size: 0.875rem;
  min-height: 36px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.panel-section {
  margin-bottom: 32px;
}

.panel-section h4 {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: #333;
}

.participant-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  color: #333;
}

.participant-info {
  flex: 1;
}

.participant-name {
  font-size: 0.9rem;
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
}

.participant-status {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.session-controls {
  margin-bottom: 16px;
}

.status-message {
  text-align: center;
  margin-top: 12px;
}

/* Panel overlay for mobile */
.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1400;
  display: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .side-panel {
    width: 100%;
    right: -100%;
  }

  .stepper-panel {
    width: 100%;
    right: -100%;
  }

  .panel-overlay {
    display: block;
  }

  .control-bar-left {
    flex: 0 0 60px;
  }

  .control-bar-right {
    flex: 0 0 60px;
    flex-direction: row;
    gap: 12px;
  }

  .bottom-control-bar {
    bottom: 12px;
    width: calc(100% - 24px);
    padding: 10px 14px;
    border-radius: 20px;
  }

  .video-row {
    padding: 10px;
  }

  .videos-container {
    gap: 10px;
    flex-direction: row;
  }

  .video-container {
    height: 250px;
    max-width: 350px;
    min-width: 200px;
  }

  .video-element {
    height: 250px;
  }

  .not-connected-message {
    height: 250px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .videos-container {
    gap: 8px;
  }

  .video-container {
    height: 180px;
    max-width: 280px;
    min-width: 150px;
  }

  .video-element {
    height: 180px;
  }

  .not-connected-message {
    height: 180px;
    font-size: 0.85rem;
  }

  .bottom-control-bar {
    bottom: 8px;
    width: calc(100% - 16px);
    padding: 8px 10px;
    border-radius: 16px;
  }
}
</style>
