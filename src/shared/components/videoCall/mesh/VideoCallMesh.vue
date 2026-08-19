<template>
  <v-container
    fluid
    class="video-call-container mt-6"
    :class="{ 'panel-open': showSidePanel }"
  >
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
                  :srcObject="focusedTile.stream"
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
                  :srcObject="tile.stream"
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

      <!-- Moderator Preview (before opening room) -->
      <v-col
        v-if="caller && !callStarted && !isObservator && localStream"
        cols="12"
      >
        <div
          class="videos-grid single-video-grid"
          :style="{ '--grid-cols': 1 }"
        >
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
                <p class="text-white">
                  {{ t('videoCall.session.cameraOff') }}
                </p>
              </div>

              <!-- Microphone muted indicator -->
              <div v-if="!isMicrophoneEnabled" class="mic-muted-indicator">
                <v-icon size="24" color="white">mdi-microphone-off</v-icon>
              </div>

              <div class="video-label">
                {{ t('videoCall.session.yourPreview') }} ({{
                  user?.email?.split('@')[0]
                }})
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

    <VideoCallPanels
      :show-side-panel="showSidePanel"
      :show-stepper-panel="showStepperPanel"
      :caller="caller"
      :is-observator="isObservator"
      :call-started="callStarted"
      :participants-list="participantsList"
      :staff-list="staffParticipants"
      :participant-list="panelParticipantList"
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
      :toggle-screen-share="handleScreenShare"
    />
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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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
import { useStore } from 'vuex'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import { useVideoCallBoard } from '../composables/useVideoCallBoard'
import VideoCallPanels from '../VideoCallPanels.vue'

const props = defineProps({
  roomId: String,
  isModerator: Boolean,
  isObservator: Boolean,
  user: Object,
  accessLevel: Number,
  currentGlobalIndex: Number,
  currentTaskIndex: Number,
  test: Object,
  localTestAnswer: Object,
  sessionStaff: Array,
  sessionParticipants: Array,
})

const emit = defineEmits([
  'setRemoteStream',
  'proceedToNextStep',
  'stepSelected',
  'moderatorStatusChange',
])
const { t } = useI18n()
const store = useStore()

// Local State
const localVideo = ref(null)
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
const peers = reactive({}) // userId -> { connection, stream, screenStream, screenSender, pendingCandidates }
const participants = ref({}) // userId -> user info (name, etc)

// Watch for moderator connected status changes and emit to parent
watch(
  () => {
    const allParts = participants.value
    for (const [userId, data] of Object.entries(allParts)) {
      if (data.isModerator && userId !== props.user.id) {
        return data.connected
      }
    }
    return null
  },
  (connected, oldConnected) => {
    if (connected === null || oldConnected === null) return
    emit('moderatorStatusChange', connected)
  },
)

// Computed
const isObservator = computed(
  () => props.isObservator || props.accessLevel === ACCESS_LEVEL.OBSERVATOR,
)
const remoteStreams = computed(() => {
  const streams = {}
  for (const [userId, peer] of Object.entries(peers)) {
    if (peer.stream) streams[userId] = peer.stream
  }
  return streams
})

const screenShareFeeds = computed(() => {
  const feeds = []

  if (isSharingScreen.value && screenStream.value) {
    feeds.push({
      key: 'local-screen',
      stream: screenStream.value,
      label: `${t('videoCall.session.screenSharingLabel')} (${props.user?.email?.split('@')[0]})`,
    })
  }

  for (const [userId, peer] of Object.entries(peers)) {
    if (peer.screenStream?.getVideoTracks().length) {
      feeds.push({
        key: `${userId}-screen`,
        stream: peer.screenStream,
        label: `${getPeerName(userId)} - ${t('videoCall.session.screenSharingLabel')}`,
      })
    }
  }

  return feeds
})
const callStarted = computed(
  () =>
    roomReady.value && (Object.keys(peers).length > 0 || !!localStream.value),
)

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
  // Moderator preview should appear immediately in the lobby when the test starts.
  if (props.isModerator) {
    if (!localStream.value) {
      await initLocalMedia()
    }
    return
  }

  // Participants and observators wait for room to be opened by moderator
  const showVideoCallRef = dbRef(
    database,
    `rooms/${props.roomId}/showVideoCall`,
  )

  // Check initial value first
  const initialSnapshot = await get(showVideoCallRef)
  const shouldShow = initialSnapshot.val()
  if (shouldShow && !roomReady.value) {
    roomReady.value = true
    await joinRoom()
  }

  // Then listen for changes
  onValue(showVideoCallRef, (snapshot) => {
    const shouldShow = snapshot.val()
    if (shouldShow) {
      if (!roomReady.value) {
        roomReady.value = true
        joinRoom()
      }
    }
  })
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

  // Restore media settings from DB if available (persistence)
  const snapshot = await get(myRef)
  const existingData = snapshot.val()
  if (existingData && existingData.media) {
    isCameraEnabled.value = existingData.media.cameraEnabled
    isMicrophoneEnabled.value = existingData.media.microphoneEnabled
  }

  // Enforce restored state on tracks
  if (localStream.value) {
    const vTrack = localStream.value.getVideoTracks()[0]
    if (vTrack) vTrack.enabled = isCameraEnabled.value

    const aTrack = localStream.value.getAudioTracks()[0]
    if (aTrack) aTrack.enabled = isMicrophoneEnabled.value
  }

  await update(myRef, {
    email: props.user.email,
    name: props.user.email?.split('@')[0],
    joinedAt: Date.now(),
    connected: true,
    isModerator: props.isModerator,
    taskIndex: props.isModerator ? 0 : props.currentTaskIndex,
    media: {
      cameraEnabled: isCameraEnabled.value,
      microphoneEnabled: isMicrophoneEnabled.value,
    },
  })

  // Mark as disconnected on close tab, but do NOT remove (to persist media settings)
  onDisconnect(myRef).update({ connected: false })

  // 3. Listen to participants to initiate connections
  const participantsRef = dbRef(database, `calls/${props.roomId}/participants`)
  onValue(participantsRef, (snapshot) => {
    const val = snapshot.val() || {}
    participants.value = val

    // Check for new peers to connect to
    Object.keys(val).forEach((userId) => {
      if (userId === props.user.id) return

      // Only connect if they are actually connected
      const pData = val[userId]
      if (!pData || !pData.connected) {
        if (peers[userId]) closePeerConnection(userId)
        return
      }

      if (!peers[userId]) {
        // Found a peer we look not connected to.
        // Rule: Initiator is the one with lexicographically smaller ID (or simply: if I am newer? No, consistent sort is better)
        // Actually, simplest Mesh strategy:
        // "I connect to everyone ALREADY in the room".
        // When I join, I see existing users -> I offer.
        // They see me -> They wait for offer.
        // How to distinguish? 'joinedAt' timestamp.
        const otherJoinedAt = pData.joinedAt
        const myJoinedAt = val[props.user.id]?.joinedAt

        // If I joined AFTER them, I initiate.
        // If timestamps equal (rare), fall back to ID comparison.
        const shouldInitiate =
          myJoinedAt > otherJoinedAt ||
          (myJoinedAt === otherJoinedAt && props.user.id > userId)

        createPeerConnection(userId, shouldInitiate)
      }
    })

    // Cleanup left peers (if removed from DB or marked disconnected)
    Object.keys(peers).forEach((userId) => {
      if (!val[userId] || !val[userId].connected) {
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
        // console.error('Error handling offer logic:', err)
      }

      // Process pending candidates
      if (peers[senderId].pendingCandidates.length > 0) {
        peers[senderId].pendingCandidates.forEach((c) => {
          pc.addIceCandidate(new RTCIceCandidate(c)).catch((e) => {
            // console.error('Error adding buffered candidate:', e)
          })
        })
        peers[senderId].pendingCandidates = []
      }
    } else if (signal.type === 'answer') {
      // Only set answer if we're waiting for one (have-local-offer state)
      if (pc.signalingState === 'have-local-offer') {
        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }),
          )
        } catch (err) {
          console.error('Error setting remote answer:', err)
        }
      }
    } else if (signal.candidate) {
      if (pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate))
        } catch (err) {
          console.error('Error adding ICE candidate:', err)
        }
      } else if (peers[senderId]) {
        // Buffer candidate
        peers[senderId].pendingCandidates.push(signal.candidate)
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
  // Remove self (mark as disconnected)
  const myRef = dbRef(
    database,
    `calls/${props.roomId}/participants/${props.user.id}`,
  )
  update(myRef, { connected: false })

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
  } catch (error) {
    console.error('getUserMedia failed', error)
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
    screenStream: null,
    screenSender: null,
    pendingCandidates: [],
  }

  // Add local tracks ONLY if not an observator
  // Observators receive-only to save bandwidth
  if (!isObservator.value && localStream.value) {
    localStream.value.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.value)
    })
  }

  if (!isObservator.value && screenStream.value) {
    const screenTrack = screenStream.value.getVideoTracks()[0]
    if (screenTrack) {
      peers[targetUserId].screenSender = pc.addTrack(
        screenTrack,
        screenStream.value,
      )
    }
  }

  // If observator, set up receive-only transceivers
  if (isObservator.value) {
    pc.addTransceiver('video', { direction: 'recvonly' })
    pc.addTransceiver('audio', { direction: 'recvonly' })
  }

  pc.ontrack = (event) => {
    const track = event.track
    const peer = peers[targetUserId]
    if (!peer || !track) return

    if (track.kind === 'video') {
      const isScreenTrack =
        /screen|window|monitor|display/i.test(track.label) ||
        (peer.stream?.getVideoTracks().length ?? 0) > 0

      if (isScreenTrack) {
        if (!peer.screenStream) {
          peer.screenStream = new MediaStream()
        }
        peer.screenStream.getVideoTracks().forEach((existingTrack) => {
          peer.screenStream.removeTrack(existingTrack)
        })
        peer.screenStream.addTrack(track)
        return
      }

      if (!peer.stream) {
        peer.stream = event.streams?.[0] || new MediaStream()
      }
      if (
        !peer.stream.getTracks().some((existing) => existing.id === track.id)
      ) {
        peer.stream.addTrack(track)
      }
      return
    }

    if (track.kind === 'audio') {
      if (!peer.stream) {
        peer.stream = event.streams?.[0] || new MediaStream()
      }
      if (
        !peer.stream.getTracks().some((existing) => existing.id === track.id)
      ) {
        peer.stream.addTrack(track)
      }
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

const returnToVideoCall = async () => {
  try {
    const roomRef = dbRef(database, `rooms/${props.roomId}`)

    await update(roomRef, {
      showVideoCall: true,
    })
  } catch {
    store.commit('SET_TOAST', {
      type: 'error',
      message: 'Failed to bring participant back to the video call.',
    })
  }
}

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
      media: {
        cameraEnabled: isCameraEnabled.value,
        microphoneEnabled: isMicrophoneEnabled.value,
      },
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error('Error updating participant status:', error) // eslint-disable-line no-console
  }
}

function isRemoteCameraEnabled(userId) {
  // Check new media structure fallback to old
  const p = participants.value[userId]
  if (p?.media) return p.media.cameraEnabled
  return p?.cameraEnabled !== false
}

function isRemoteMicrophoneEnabled(userId) {
  const p = participants.value[userId]
  if (p?.media) return p.media.microphoneEnabled
  return p?.microphoneEnabled !== false
}

const remoteEntries = computed(() =>
  Object.keys(remoteStreams.value).map((userId) => ({
    id: userId,
    userId,
    name: getPeerName(userId),
    email: participants.value[userId]?.email || undefined,
    role: participants.value[userId]?.role || 'participant',
    connected: !!peers[userId],
    hasCamera: isRemoteCameraEnabled(userId),
    hasMicrophone: isRemoteMicrophoneEnabled(userId),
    stream: remoteStreams.value[userId],
  })),
)

const buildRemoteTile = (remote) => ({
  id: `camera:${remote.userId}`,
  type: 'camera',
  kind: 'remote',
  userId: remote.userId,
  label: remote.name,
  hasCamera: remote.hasCamera,
  hasMicrophone: remote.hasMicrophone,
  muted: false,
  stream: remote.stream,
})

const buildParticipantItem = (remote, isSelf) => {
  if (isSelf) {
    return {
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
    }
  }

  const coop = props.test?.cooperators?.find(
    (c) => c.userDocId === remote.userId,
  )
  let role = 'participant'
  if (coop) {
    if (coop.accessLevel === ACCESS_LEVEL.OBSERVATOR) {
      role = 'observator'
    } else if (coop.accessLevel === ACCESS_LEVEL.ADMIN) {
      role = 'moderator'
    }
  }

  return {
    id: remote.userId,
    name:
      participants.value[remote.userId]?.name ||
      participants.value[remote.userId]?.email?.split('@')[0] ||
      coop?.email?.split('@')[0] ||
      'Unknown',
    email: participants.value[remote.userId]?.email || coop?.email,
    isSelf: false,
    role,
    connected: !!peers[remote.userId],
    hasCamera: role !== 'observator',
    hasMicrophone: role !== 'observator',
  }
}

const staffParticipants = computed(() => {
  const staffEntries = Array.isArray(props.sessionStaff)
    ? props.sessionStaff
    : props.test?.cooperators || []

  return staffEntries.map((member) => {
    const role =
      member.role === 'observator' ||
      member.accessLevel === ACCESS_LEVEL.OBSERVATOR
        ? 'observator'
        : member.role === 'moderator' ||
            member.accessLevel === ACCESS_LEVEL.ADMIN
          ? 'moderator'
          : 'participant'

    return {
      id: member.userDocId || member.id || member.email,
      email: member.email,
      name:
        member.name ||
        member.email?.split('@')[0] ||
        member.displayName ||
        'Staff member',
      role,
      connected:
        !!participants.value[member.userDocId || member.id || member.email]
          ?.connected,
      hasCamera: true,
      hasMicrophone: true,
      accessLevel: member.accessLevel ?? member.role,
    }
  })
})

const normalizeMemberKeys = (member) => {
  if (!member) return []

  const rawValues = [
    member.userDocId,
    member.id,
    member.email,
    member.name,
    member.displayName,
  ]
  const normalized = new Set()

  rawValues.forEach((value) => {
    if (value == null || !String(value).trim()) return

    const str = String(value).trim().toLowerCase()
    normalized.add(str)
    normalized.add(str.replace(/[^a-z0-9]/g, ''))

    const localPart = str.includes('@') ? str.split('@')[0] : str
    if (localPart) {
      normalized.add(localPart)
      normalized.add(localPart.replace(/[^a-z0-9]/g, ''))
    }
  })

  return [...normalized]
}

const panelParticipantList = computed(() => {
  const dedupedList = []
  const seen = new Set()

  for (const member of Array.isArray(props.sessionParticipants)
    ? props.sessionParticipants
    : []) {
    if (!member) continue

    const memberId =
      member.userDocId || member.id || member.email || member.name
    if (!memberId) continue

    const memberKey = String(memberId).trim().toLowerCase()
    if (!memberKey || seen.has(memberKey)) continue

    seen.add(memberKey)
    dedupedList.push({
      id: member.userDocId || member.id || member.email || member.name,
      email: member.email,
      name: member.name || member.email?.split('@')[0] || 'Participant',
      role: member.role || 'participant',
      connected: member.connected ?? true,
      isSelf:
        (member.userDocId || member.id || member.email) ===
        (props.user?.id || props.user?.email),
      hasCamera: member.hasCamera ?? true,
      hasMicrophone: member.hasMicrophone ?? true,
    })
  }

  return dedupedList
})

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
  user: computed(() => ({
    ...props.user,
    accessLevel:
      props.accessLevel ?? (props.isModerator ? ACCESS_LEVEL.ADMIN : 0),
    isModerator: props.isModerator,
  })),
  localStream,
  remoteEntries,
  screenShareFeeds,
  staffParticipants,
  buildRemoteTile,
  buildParticipantItem,
})

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
    if (!localStream.value) {
      await initLocalMedia()
    }
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
const router = useRouter() // Ensure router is available

const endCall = async () => {
  if (caller.value) {
    try {
      // Remove both the call interactions and the room state
      await remove(dbRef(database, `calls/${props.roomId}`))
      // Also remove the room to clean up global state (taskIndex, etc.)
      await remove(dbRef(database, `rooms/${props.roomId}`))
    } catch (error) {
      console.error('Error ending call:', error) // eslint-disable-line no-console
    }
    emit('call-ended')
    leaveRoom()
    router.push('/admin')
  } else {
    // Non-moderator: can just leave locally
    leaveRoom()
    router.push('/admin')
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
  if (!navigator.mediaDevices?.getDisplayMedia) {
    return
  }

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    })
    screenStream.value = stream
    isSharingScreen.value = true

    const videoTrack = stream.getVideoTracks()[0]
    videoTrack.onended = () => stopScreenShare()

    for (const userId in peers) {
      const peer = peers[userId]
      if (!peer?.connection || !videoTrack) continue
      peer.screenSender = peer.connection.addTrack(videoTrack, stream)
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

  for (const userId in peers) {
    const peer = peers[userId]
    if (!peer?.connection) continue

    if (peer.screenSender) {
      peer.connection.removeTrack(peer.screenSender)
      peer.screenSender = null
    }

    peer.screenStream = null
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

<style scoped src="../videoCallShared.css"></style>
