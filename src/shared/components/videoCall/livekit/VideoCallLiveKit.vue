<template>
  <v-container
    fluid
    class="video-call-container mt-6"
    :class="{ 'panel-open': showSidePanel }"
  >
    <v-alert
      v-if="connectionError"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
    >
      {{ connectionError }}
    </v-alert>

    <!-- Videos Row -->
    <v-row class="video-row justify-center" no-gutters>
      <!-- Grid of Participants -->
      <v-col v-if="callStarted" cols="12">
        <div class="video-stage">
          <!-- Screen share spotlight (highlighted, large) -->
          <div v-if="hasScreenShare" class="spotlight-primary">
            <div
              v-for="feed in screenShareFeeds"
              :key="feed.key"
              class="spotlight-item"
            >
              <div class="video-container screen-share-container">
                <video
                  :ref="(el) => setScreenShareVideoElement(feed.key, el)"
                  autoplay
                  playsinline
                  class="video-element screen-share-element"
                ></video>
                <div class="video-label">
                  {{ t('videoCall.session.screenSharingLabel') }}
                  ({{ feed.name }})
                </div>
              </div>
            </div>
          </div>

          <!-- Camera grid (becomes a compact filmstrip during screen share) -->
          <div
            class="videos-grid"
            :class="{ 'videos-filmstrip': hasScreenShare }"
            :style="gridStyleVars"
          >
            <!-- Local Video (not for observators) -->
            <div v-if="!isObservator" class="video-wrapper">
              <div class="video-container">
                <video
                  :ref="setLocalVideoRef"
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
                  <p class="text-white">
                    {{ t('videoCall.session.cameraOff') }}
                  </p>
                </div>

                <!-- Microphone muted indicator -->
                <div v-if="!isMicrophoneEnabled" class="mic-muted-indicator">
                  <v-icon size="24" color="white">mdi-microphone-off</v-icon>
                </div>

                <div class="video-label">
                  {{ t('videoCall.session.yourVideo') }} ({{
                    user?.email?.split('@')[0]
                  }})
                </div>
              </div>
            </div>

            <!-- Remote Videos -->
            <div
              v-for="participant in remoteParticipants"
              :key="participant.identity"
              class="video-wrapper"
            >
              <div class="video-container">
                <video
                  :ref="(el) => setRemoteVideoElement(participant.identity, el)"
                  autoplay
                  playsinline
                  class="video-element"
                ></video>

                <!-- Camera disabled overlay for remote peer -->
                <div
                  v-if="!participant.hasCamera"
                  class="camera-disabled-overlay"
                >
                  <v-icon size="64" color="white" class="mb-2"
                    >mdi-video-off</v-icon
                  >
                  <p class="text-white">
                    {{ t('videoCall.session.cameraOff') }}
                  </p>
                </div>

                <!-- Microphone muted indicator for remote peer -->
                <div
                  v-if="!participant.hasMicrophone"
                  class="mic-muted-indicator"
                >
                  <v-icon size="24" color="white">mdi-microphone-off</v-icon>
                </div>

                <div class="video-label">
                  {{ participant.name }}
                  <span v-if="participant.role === 'moderator'">
                    ({{ t('videoCall.panel.moderator') }})
                  </span>
                </div>
              </div>
            </div>

            <!-- Waiting Message if no peers -->
            <div
              v-if="remoteParticipants.length === 0 && !hasScreenShare"
              class="d-flex align-center justify-center pa-4 text-grey"
            >
              <v-icon class="mr-2">mdi-account-clock</v-icon>
              <span>{{
                t('videoCall.session.waitingForParticipants')
              }}</span>
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
          <h3 class="text-h5 mb-2">
            {{ t('videoCall.session.observatorMode') }}
          </h3>
          <p class="text-body-1">
            {{ t('videoCall.session.waitingForModeratorToStartSession') }}
          </p>
          <p class="text-body-2 text-grey mt-2">
            {{ t('videoCall.session.observeAllFeedsNotice') }}
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
          <h3 class="text-h6 mb-2">
            {{ t('videoCall.session.waitingForModerator') }}
          </h3>
          <p class="text-body-2 text-grey">
            {{ t('videoCall.session.autoStartWhenModeratorOpensRoom') }}
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
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
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
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
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
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                :class="{
                  'control-btn-active': isSharingScreen,
                  'control-btn-enabled': !isSharingScreen,
                }"
                class="control-btn"
                icon
                size="large"
                @click="toggleScreenShare"
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
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                color="success"
                class="control-btn control-btn-primary me-2"
                size="large"
                :loading="isConnecting"
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
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
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
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
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
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
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
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
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
        <h3>{{ t('videoCall.panel.toolsPanelTitle') }}</h3>
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
          <h4>{{ t('videoCall.panel.sessionControl') }}</h4>

          <!-- Connection controls when call is not started -->
          <div v-if="!callStarted" class="session-controls">
            <div v-if="!caller" class="participant-info">
              <p class="text-body-2 mb-0">
                <v-icon start size="16">mdi-information</v-icon>
                {{ t('videoCall.panel.joinRoomInfo') }}
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
              {{ t('videoCall.panel.proceedNextStep') }}
            </v-btn>

            <!-- End call button -->
            <v-btn
              v-if="!isObservator"
              color="error"
              size="large"
              block
              variant="outlined"
              @click="endCall"
            >
              <v-icon start>mdi-phone-hangup</v-icon>
              {{ t('videoCall.panel.endCall') }}
            </v-btn>

            <!-- Call status -->
            <div class="status-message">
              <v-chip color="green" size="small" class="mb-2">
                <v-icon start size="16">mdi-phone</v-icon>
                {{ t('videoCall.panel.activeCall') }}
              </v-chip>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h4>{{ t('videoCall.panel.participants') }}</h4>
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
                {{
                  participant.name +
                  (participant.isSelf
                    ? ` (${t('videoCall.panel.you')})`
                    : '')
                }}
                <v-chip
                  v-if="participant.role === 'observator'"
                  size="x-small"
                  color="orange"
                  class="ml-1"
                >
                  {{ t('videoCall.panel.observator') }}
                </v-chip>
                <v-chip
                  v-else-if="participant.role === 'moderator'"
                  size="x-small"
                  color="blue"
                  class="ml-1"
                >
                  {{ t('videoCall.panel.moderator') }}
                </v-chip>
              </span>
              <div class="participant-status">
                <v-chip
                  size="x-small"
                  :color="participant.connected ? 'green' : 'grey'"
                >
                  {{
                    participant.connected
                      ? t('videoCall.panel.connected')
                      : t('videoCall.panel.disconnected')
                  }}
                </v-chip>
                <v-chip
                  v-if="participant.isSelf && !isObservator"
                  size="x-small"
                  :color="participant.hasCamera ? 'green' : 'red'"
                  class="ml-1"
                >
                  {{
                    participant.hasCamera
                      ? t('videoCall.panel.camera')
                      : t('videoCall.panel.noCamera')
                  }}
                </v-chip>
                <v-chip
                  v-if="participant.isSelf && !isObservator"
                  size="x-small"
                  :color="participant.hasMicrophone ? 'green' : 'red'"
                  class="ml-1"
                >
                  {{
                    participant.hasMicrophone
                      ? t('videoCall.panel.microphone')
                      : t('videoCall.panel.noMicrophone')
                  }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!isObservator" class="panel-section">
          <h4>{{ t('videoCall.panel.settings') }}</h4>
          <v-list density="compact">
            <v-list-item @click="toggleCamera">
              <template #prepend>
                <v-icon :color="isCameraEnabled ? 'green' : 'red'">
                  {{ isCameraEnabled ? 'mdi-video' : 'mdi-video-off' }}
                </v-icon>
              </template>
              <v-list-item-title>
                {{
                  isCameraEnabled
                    ? t('videoCall.panel.disableCamera')
                    : t('videoCall.panel.enableCamera')
                }}
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
                    ? t('videoCall.panel.muteMicrophone')
                    : t('videoCall.panel.unmuteMicrophone')
                }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item v-if="callStarted" @click="toggleScreenShare">
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
                    ? t('videoCall.panel.stopScreenShare')
                    : t('videoCall.panel.shareScreen')
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
            {{ t('videoCall.panel.moderatorOnlySteps') }}
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
                  <template #item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps" :title="item.raw.title">
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
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Track } from 'livekit-client'
import { database } from '@/app/plugins/firebase/index'
import { ref as dbRef, get, onValue, update, remove } from 'firebase/database'
import { useLiveKitRoom } from '../composables/useLiveKitRoom'

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
  'call-ended',
  'moderatorStatusChange',
])

const { t } = useI18n()
const router = useRouter()

const roomReady = ref(false)
const showSidePanel = ref(false)
const showStepperPanel = ref(false)

const testId = computed(() => props.roomId)
const userId = computed(() => props.user?.id)
const displayName = computed(() => props.user?.email || '')
const accessLevelRef = computed(() => props.accessLevel)
const cooperators = computed(() => props.test?.cooperators || [])

const {
  room,
  isConnecting,
  connectionError,
  callStarted,
  isObservator,
  isCameraEnabled,
  isMicrophoneEnabled,
  isSharingScreen,
  remoteParticipants,
  screenShareFeeds,
  localVideoElement,
  connect,
  disconnect,
  toggleCamera,
  toggleMicrophone,
  toggleScreenShare,
  setRemoteVideoElement,
  setScreenShareVideoElement,
} = useLiveKitRoom({
  testId,
  userId,
  displayName,
  accessLevel: accessLevelRef,
  cooperators,
  onRemoteModeratorStream: (stream) => emit('setRemoteStream', stream),
  onModeratorStatusChange: (connected) =>
    emit('moderatorStatusChange', connected),
})

const caller = computed(() => props.isModerator)

// Whether any screen share feed is active (drives the spotlight layout)
const hasScreenShare = computed(() => screenShareFeeds.value.length > 0)

// Count of camera tiles currently visible (local + remotes)
const cameraCount = computed(
  () => (isObservator.value ? 0 : 1) + remoteParticipants.value.length,
)

// Number of grid columns, so tiles resize based on participant count
const cameraColumns = computed(() => {
  const count = cameraCount.value
  if (count <= 1) return 1
  if (count <= 4) return 2
  if (count <= 9) return 3
  return 4
})

const gridStyleVars = computed(() => ({
  '--grid-cols': cameraColumns.value,
}))

// Organize participants by role (mirrors VideoCallMesh side panel)
const participantsList = computed(() => {
  const list = []

  list.push({
    id: props.user?.id,
    name: props.user?.email?.split('@')[0] || 'You',
    email: props.user?.email,
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

  remoteParticipants.value.forEach((p) => {
    list.push({
      id: p.identity,
      name: p.name,
      isSelf: false,
      role: p.role,
      connected: p.isConnected,
      hasCamera: p.hasCamera,
      hasMicrophone: p.hasMicrophone,
    })
  })

  return list
})

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

function setLocalVideoRef(el) {
  if (localVideoElement.value === el) return
  localVideoElement.value = el
  if (!el || !room.value) return
  const camPub = room.value.localParticipant?.getTrackPublication(
    Track.Source.Camera,
  )
  if (camPub?.track) camPub.track.attach(el)
}

function toggleSidePanel() {
  showSidePanel.value = !showSidePanel.value
  if (showSidePanel.value) showStepperPanel.value = false
}

function toggleStepperPanel() {
  showStepperPanel.value = !showStepperPanel.value
  if (showStepperPanel.value) showSidePanel.value = false
}

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

async function joinLiveKitRoom() {
  if (!roomReady.value) return
  try {
    await connect()
  } catch {
    // connectionError is set in composable
  }
}

async function startCall() {
  if (!props.isModerator) return
  try {
    await update(dbRef(database, `rooms/${props.roomId}`), {
      showVideoCall: true,
    })
    roomReady.value = true
    await joinLiveKitRoom()
  } catch {
    // Failed to open room
  }
}

async function endCall() {
  if (!props.isModerator) {
    await disconnect()
    router.push('/admin')
    return
  }

  try {
    await remove(dbRef(database, `calls/${props.roomId}`))
    await remove(dbRef(database, `rooms/${props.roomId}`))
  } catch (error) {
    console.error('Error ending call:', error) // eslint-disable-line no-console
  }

  emit('call-ended')
  await disconnect()
  router.push('/admin')
}

onMounted(async () => {
  if (props.isModerator) return

  const showVideoCallRef = dbRef(
    database,
    `rooms/${props.roomId}/showVideoCall`,
  )

  const initialSnapshot = await get(showVideoCallRef)
  if (initialSnapshot.val()) {
    roomReady.value = true
    await joinLiveKitRoom()
  }

  onValue(showVideoCallRef, async (snapshot) => {
    if (snapshot.val() && !roomReady.value) {
      roomReady.value = true
      await joinLiveKitRoom()
    }
  })
})

onBeforeUnmount(async () => {
  await disconnect()
})
</script>

<style scoped src="../videoCallShared.css"></style>
