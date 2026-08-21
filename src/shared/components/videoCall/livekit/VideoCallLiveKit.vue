<template>
  <v-container
    fluid
    class="video-call-container mt-6"
    :class="{
      'panel-open': showSidePanel || showStepperPanel || props.notesDrawerOpen,
    }"
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
            <div :key="focusedTile.id" class="spotlight-item">
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
    </v-row>

    <v-row
      v-if="!caller && !callStarted && waitingPreviewStream"
      class="video-row justify-center"
      no-gutters
    >
      <v-col cols="12">
        <div
          class="videos-grid video-preview-grid"
          :style="{ '--grid-cols': 1 }"
        >
          <div>
            <div class="video-container">
              <video
                ref="waitingPreviewVideo"
                autoplay
                muted
                playsinline
                class="video-element"
              ></video>

              <div class="video-label">
                {{ t('videoCall.session.yourPreview') }} ({{
                  user?.email?.split('@')[0]
                }})
              </div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Participant/Observator Waiting State (only when not started) -->
    <v-row
      v-if="!caller && !callStarted"
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
            {{ t('videoCall.session.moderatorWillAdmitParticipant') }}
          </p>
        </div>
      </v-col>
    </v-row>

    <VideoCallControlBar
      :caller="caller"
      :is-observator="isObservator"
      :call-started="callStarted"
      :is-camera-enabled="isCameraEnabled"
      :is-microphone-enabled="isMicrophoneEnabled"
      :is-sharing-screen="isSharingScreen"
      :show-stepper-panel="showStepperPanel"
      :show-side-panel="showSidePanel"
      :notes-drawer-open="props.notesDrawerOpen"
      :notes-count="props.notesCount"
      :toggle-camera="toggleCamera"
      :toggle-microphone="toggleMicrophone"
      :toggle-screen-share="toggleScreenShare"
      :start-call="startCall"
      :leave-call="leaveCall"
      :end-call="endCall"
      :toggle-stepper-panel="toggleStepperPanel"
      :toggle-side-panel="toggleSidePanel"
      :toggle-notes-drawer="handleToggleNotesDrawer"
    />

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
      :toggle-screen-share="toggleScreenShare"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Track } from 'livekit-client'
import { database } from '@/app/plugins/firebase/index'
import { ref as dbRef, get, onValue, update, remove } from 'firebase/database'
import { useLiveKitRoom } from '../composables/useLiveKitRoom'
import VideoCallPanels from '../VideoCallPanels.vue'
import VideoCallControlBar from '../VideoCallControlBar.vue'
import { normalizeSessionMember } from '@/ux/UserTest/utils/sessionPresence'

const props = defineProps({
  roomId: String,
  isModerator: Boolean,
  user: Object,
  accessLevel: Number,
  currentGlobalIndex: Number,
  currentTaskIndex: Number,
  test: Object,
  localTestAnswer: Object,
  sessionStaff: Array,
  sessionParticipants: Array,
  notesDrawerOpen: Boolean,
  notesCount: Number,
  toggleNotesDrawer: Function,
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
const waitingPreviewVideo = ref(null)
const waitingPreviewStream = ref(null)

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
      hasCamera: isCameraEnabled.value,
      hasMicrophone: isMicrophoneEnabled.value,
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

const staffParticipants = computed(() => {
  const staffEntries = Array.isArray(props.sessionStaff)
    ? props.sessionStaff
    : props.test?.cooperators || []

  return staffEntries
    .map((member) => normalizeSessionMember(member, 'staff'))
    .filter(Boolean)
    .map((member) => ({
      ...member,
      hasCamera: member.hasCamera ?? true,
      hasMicrophone: member.hasMicrophone ?? true,
      accessLevel: member.accessLevel ?? member.role,
    }))
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

    const normalized = normalizeSessionMember(member, 'participant')
    if (!normalized) continue

    const memberId = normalized.userDocId || normalized.id || normalized.email
    if (!memberId) continue

    const memberKey = String(memberId).trim().toLowerCase()
    if (!memberKey || seen.has(memberKey)) continue

    seen.add(memberKey)
    dedupedList.push({
      ...normalized,
      isSelf:
        (normalized.userDocId || normalized.id || normalized.email) ===
        (props.user?.id || props.user?.email),
      hasCamera: normalized.hasCamera ?? true,
      hasMicrophone: normalized.hasMicrophone ?? true,
    })
  }

  return dedupedList
})

const {
  tiles,
  focusedTile,
  otherTiles,
  isFocusMode,
  showWaitingMessage,
  gridStyleVars,
  participantsList,
} = useVideoCallBoard({
  t,
  isObservator,
  callStarted,
  isCameraEnabled,
  isMicrophoneEnabled,
  user: computed(() => ({
    ...props.user,
    accessLevel:
      props.accessLevel ?? (props.isModerator ? ACCESS_LEVEL.ADMIN : 0),
    isModerator: props.isModerator,
  })),
  remoteEntries,
  screenShareFeeds,
  staffParticipants,
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

watch([waitingPreviewVideo, waitingPreviewStream], ([videoEl, stream]) => {
  if (videoEl && stream) {
    videoEl.srcObject = stream
  }
})

async function initWaitingPreview() {
  if (waitingPreviewStream.value || !navigator.mediaDevices?.getUserMedia) {
    return
  }

  try {
    waitingPreviewStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })
  } catch {
    waitingPreviewStream.value = null
  }
}

function stopWaitingPreview() {
  if (waitingPreviewStream.value) {
    waitingPreviewStream.value.getTracks().forEach((track) => track.stop())
    waitingPreviewStream.value = null
  }
}

function toggleSidePanel() {
  showSidePanel.value = !showSidePanel.value
  if (showSidePanel.value) {
    showStepperPanel.value = false
    if (props.notesDrawerOpen) props.toggleNotesDrawer?.()
  }
}

function toggleStepperPanel() {
  showStepperPanel.value = !showStepperPanel.value
  if (showStepperPanel.value) {
    showSidePanel.value = false
    if (props.notesDrawerOpen) props.toggleNotesDrawer?.()
  }
}

function handleToggleNotesDrawer() {
  if (!props.notesDrawerOpen) {
    showSidePanel.value = false
    showStepperPanel.value = false
  }
  props.toggleNotesDrawer?.()
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
    stopWaitingPreview()
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

async function leaveCall() {
  if (room.value?.localParticipant) {
    const localParticipant = room.value.localParticipant

    if (localParticipant.isCameraEnabled) {
      await localParticipant.setCameraEnabled(false)
    }
    if (localParticipant.isMicrophoneEnabled) {
      await localParticipant.setMicrophoneEnabled(false)
    }

    for (const publication of localParticipant.videoTrackPublications.values()) {
      publication.track?.stop()
    }
    for (const publication of localParticipant.audioTrackPublications.values()) {
      publication.track?.stop()
    }
    for (const publication of localParticipant.screenShareTrackPublications.values()) {
      publication.track?.stop()
    }
  }

  await disconnect()
  router.push('/admin')
}

async function endCall() {
  if (room.value?.localParticipant) {
    const localParticipant = room.value.localParticipant

    if (localParticipant.isCameraEnabled) {
      await localParticipant.setCameraEnabled(false)
    }
    if (localParticipant.isMicrophoneEnabled) {
      await localParticipant.setMicrophoneEnabled(false)
    }

    for (const publication of localParticipant.videoTrackPublications.values()) {
      publication.track?.stop()
    }
    for (const publication of localParticipant.audioTrackPublications.values()) {
      publication.track?.stop()
    }
    for (const publication of localParticipant.screenShareTrackPublications.values()) {
      publication.track?.stop()
    }
  }

  if (!props.isModerator) {
    await disconnect()
    router.push('/admin')
    return
  }

  try {
    // Remove the live call state before disconnecting; otherwise the local
    // disconnect writes can re-create the deleted call node in RTDB.
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

  if (!isObservator.value) {
    await initWaitingPreview()
  }

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
  stopWaitingPreview()
  await disconnect()
})
</script>

<style scoped src="../videoCallShared.css"></style>
