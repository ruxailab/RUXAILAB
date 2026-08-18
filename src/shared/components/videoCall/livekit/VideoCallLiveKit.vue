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
          <!-- Spotlight: focused participant or shared screen -->
          <div v-if="isFocusMode" class="spotlight-primary">
            <div
              :key="focusedTile.id"
              class="spotlight-item tile-clickable"
              @click="clearFocus"
            >
              <div
                class="video-container"
                :class="{
                  'screen-share-container': focusedTile.type === 'screen',
                }"
              >
                <video
                  :ref="(el) => attachTileRef(focusedTile, el)"
                  autoplay
                  :muted="focusedTile.muted"
                  playsinline
                  class="video-element"
                  :class="{
                    'screen-share-element': focusedTile.type === 'screen',
                  }"
                ></video>

                <div
                  v-if="focusedTile.type === 'camera' && !focusedTile.hasCamera"
                  class="camera-disabled-overlay"
                >
                  <v-icon size="64" color="white" class="mb-2"
                    >mdi-video-off</v-icon
                  >
                  <p class="text-white">
                    {{ t('videoCall.session.cameraOff') }}
                  </p>
                </div>

                <div
                  v-if="
                    focusedTile.type === 'camera' && !focusedTile.hasMicrophone
                  "
                  class="mic-muted-indicator"
                >
                  <v-icon size="24" color="white">mdi-microphone-off</v-icon>
                </div>

                <div class="video-label">{{ focusedTile.label }}</div>
              </div>
            </div>
          </div>

          <!-- Tiles: full grid, or a compact filmstrip when focusing -->
          <div
            class="videos-grid"
            :class="{ 'videos-filmstrip': isFocusMode }"
            :style="gridStyleVars"
          >
            <div
              v-for="tile in isFocusMode ? otherTiles : tiles"
              :key="tile.id"
              class="video-wrapper tile-clickable"
              @click="focusTile(tile.id)"
            >
              <div
                class="video-container"
                :class="{ 'screen-share-container': tile.type === 'screen' }"
              >
                <video
                  :ref="(el) => attachTileRef(tile, el)"
                  autoplay
                  :muted="tile.muted"
                  playsinline
                  class="video-element"
                  :class="{ 'screen-share-element': tile.type === 'screen' }"
                ></video>

                <div
                  v-if="tile.type === 'camera' && !tile.hasCamera"
                  class="camera-disabled-overlay"
                >
                  <v-icon size="64" color="white" class="mb-2"
                    >mdi-video-off</v-icon
                  >
                  <p class="text-white">
                    {{ t('videoCall.session.cameraOff') }}
                  </p>
                </div>

                <div
                  v-if="tile.type === 'camera' && !tile.hasMicrophone"
                  class="mic-muted-indicator"
                >
                  <v-icon size="24" color="white">mdi-microphone-off</v-icon>
                </div>

                <div class="video-label">{{ tile.label }}</div>
              </div>
            </div>

            <!-- Waiting Message if no peers -->
            <div
              v-if="showWaitingMessage"
              class="d-flex align-center justify-center pa-4 text-grey"
            >
              <v-icon class="mr-2">mdi-account-clock</v-icon>
              <span>{{ t('videoCall.session.waitingForParticipants') }}</span>
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

    <VideoCallPanels
      :show-side-panel="showSidePanel"
      :show-stepper-panel="showStepperPanel"
      :caller="caller"
      :is-observator="isObservator"
      :call-started="callStarted"
      :participants-list="participantsList"
      :current-stepper-value="currentStepperValue"
      :task-dropdown-items="taskDropdownItems"
      :current-task-index="currentTaskIndex"
      :test="test"
      :is-camera-enabled="isCameraEnabled"
      :is-microphone-enabled="isMicrophoneEnabled"
      :is-sharing-screen="isSharingScreen"
      :t="t"
      :toggle-side-panel="toggleSidePanel"
      :toggle-stepper-panel="toggleStepperPanel"
      :close-panels="closePanels"
      :proceed-to-next-step="proceedToNextStep"
      :go-to-step="goToStep"
      :go-to-specific-task="goToSpecificTask"
      :end-call="endCall"
      :toggle-camera="toggleCamera"
      :toggle-microphone="toggleMicrophone"
      :toggle-screen-share="toggleScreenShare"
    />
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
import { useVideoFocus } from '../composables/useVideoFocus'
import VideoCallPanels from '../VideoCallPanels.vue'

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

const remoteEntries = computed(() =>
  remoteParticipants.value.map((participant) => ({
    ...participant,
    id: participant.identity,
    email: participant.email,
    name: participant.name || participant.identity,
  })),
)

const buildRemoteTile = (remote) => {
  const roleSuffix =
    remote.role === 'moderator' ? ` (${t('videoCall.panel.moderator')})` : ''

  return {
    id: `camera:${remote.identity}`,
    type: 'camera',
    kind: 'remote',
    identity: remote.identity,
    label: `${remote.name}${roleSuffix}`,
    hasCamera: remote.hasCamera,
    hasMicrophone: remote.hasMicrophone,
    muted: false,
  }
}

const buildParticipantItem = (remote, isSelf) => {
  if (isSelf) {
    return {
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
    }
  }

  return {
    id: remote.identity,
    name: remote.name,
    email: remote.email,
    isSelf: false,
    role: remote.role,
    connected: remote.isConnected,
    hasCamera: remote.hasCamera,
    hasMicrophone: remote.hasMicrophone,
  }
}

const {
  tiles,
  focusedTile,
  otherTiles,
  isFocusMode,
  focusTile,
  clearFocus,
  showWaitingMessage,
  gridStyleVars,
  participantsList,
} = useVideoCallBoard({
  t,
  isObservator,
  isCameraEnabled,
  isMicrophoneEnabled,
  user: computed(() => props.user),
  remoteEntries,
  screenShareFeeds,
  buildRemoteTile,
  buildParticipantItem,
})

// Routes a video element to the correct LiveKit attach helper. Null (unmount)
// is ignored so a re-mount in another slot doesn't clobber the active element.
function attachTileRef(tile, el) {
  if (!el || !tile) return
  if (tile.type === 'screen') {
    setScreenShareVideoElement(tile.feedKey, el)
  } else if (tile.kind === 'local') {
    setLocalVideoRef(el)
  } else {
    setRemoteVideoElement(tile.identity, el)
  }
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

function closePanels() {
  showSidePanel.value = false
  showStepperPanel.value = false
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
