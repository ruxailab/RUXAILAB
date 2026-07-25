<template>
  <!-- Hold rendering until the session state arrives, so the consent gate does
       not flash for someone who has already agreed -->
  <div
    v-if="!loaded"
    class="d-flex align-center justify-center"
    style="height: 100vh"
  >
    <v-progress-circular indeterminate color="primary" size="48" />
  </div>

  <!-- Lobby: branded welcome shown before the session is live and after it ends -->
  <SessionLobby
    v-else-if="!isLive"
    :title="test?.testTitle"
    :description="test?.testDescription"
    :status="status"
    :is-facilitator="isFacilitator"
    :has-topics="hasTopics"
    :participant-count="connectedCount"
    :starting="starting"
    @start="onStart"
  />

  <!-- Consent gate: sits between the lobby and the discussion, mirroring the
       moderated test where consent follows the welcome step -->
  <v-container v-else-if="needsConsent" class="pa-6">
    <ConsentStep
      :test-title="test?.testTitle"
      :consent-text="consentText"
      :full-name-model="fullName"
      :consent-completed-model="consentAccepted"
      @update:full-name-model="(val) => (fullName = val)"
      @update:consent-completed-model="(val) => (consentAccepted = val)"
      @continue="onConsentAccept"
      @decline-consent="onConsentDecline"
    />
  </v-container>

  <!-- Live discussion: full-bleed stage plus a fixed control bar and a
       slide-in participants panel, mirroring the moderated session layout -->
  <template v-else>
    <div class="fg-stage" :class="{ 'panel-open': showPanel }">
      <!-- Header -->
      <div class="d-flex align-center flex-wrap ga-3 mb-4">
        <div class="flex-grow-1">
          <h1 class="text-h5 mb-0">
            {{ test?.testTitle || t('focusGroup.dashboard.typeLabel') }}
          </h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t('focusGroup.session.title') }}
          </p>
        </div>
        <v-chip :color="statusColor" variant="flat" :prepend-icon="statusIcon">
          {{ t(`focusGroup.session.status.${status}`) }}
        </v-chip>
      </div>

      <SessionVideoStage
        v-if="videoEnabled"
        :remote-participants="remoteParticipants"
        :screen-share-feeds="screenShareFeeds"
        :local-state="localVideoState"
        :connection-error="connectionError"
        :presence-roles="participants"
        :set-local-video="setLocalVideo"
        :set-remote-video="setRemoteVideoElement"
        :set-screen-video="setScreenShareVideoElement"
      />

      <TopicPanel
        v-if="currentTopic"
        :topic="currentTopic"
        :index="currentTopicIndex"
        :total="topicCount"
        class="mb-4"
      />

      <TopicDiscussion
        :messages="currentMessages"
        :current-user-id="user?.id"
        :can-post="canPost"
        :sending="sending"
        @send="onSend"
      />
    </div>

    <!-- Bottom control bar -->
    <div class="fg-control-bar">
      <div class="fg-control-left">
        <v-tooltip
          location="top"
          :text="t('focusGroup.session.backToDashboard')"
        >
          <template #activator="{ props: tip }">
            <v-btn
              v-bind="tip"
              icon="mdi-arrow-left"
              variant="text"
              color="white"
              @click="goToDashboard"
            />
          </template>
        </v-tooltip>
      </div>

      <div class="fg-control-center">
        <template v-if="showMediaControls">
          <v-tooltip
            location="top"
            :text="
              isMicrophoneEnabled
                ? t('focusGroup.session.muteMicrophone')
                : t('focusGroup.session.unmuteMicrophone')
            "
          >
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="tip"
                class="fg-round"
                :class="{ 'fg-round-off': !isMicrophoneEnabled }"
                :icon="
                  isMicrophoneEnabled ? 'mdi-microphone' : 'mdi-microphone-off'
                "
                @click="toggleMicrophone"
              />
            </template>
          </v-tooltip>
          <v-tooltip
            location="top"
            :text="
              isCameraEnabled
                ? t('focusGroup.session.turnCameraOff')
                : t('focusGroup.session.turnCameraOn')
            "
          >
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="tip"
                class="fg-round"
                :class="{ 'fg-round-off': !isCameraEnabled }"
                :icon="isCameraEnabled ? 'mdi-video' : 'mdi-video-off'"
                @click="toggleCamera"
              />
            </template>
          </v-tooltip>
          <v-tooltip
            v-if="isFacilitator"
            location="top"
            :text="
              isSharingScreen
                ? t('focusGroup.session.stopSharingScreen')
                : t('focusGroup.session.shareScreen')
            "
          >
            <template #activator="{ props: tip }">
              <v-btn
                v-bind="tip"
                class="fg-round"
                :class="{ 'fg-round-active': isSharingScreen }"
                icon="mdi-monitor-share"
                @click="toggleScreenShare"
              />
            </template>
          </v-tooltip>
          <div class="fg-control-divider" />
        </template>

        <template v-if="isFacilitator">
          <v-btn
            v-if="status === 'idle'"
            class="fg-pill"
            color="white"
            variant="flat"
            prepend-icon="mdi-play"
            :disabled="topicCount === 0"
            @click="onStart"
          >
            {{ t('focusGroup.session.startSession') }}
          </v-btn>

          <template v-else-if="status === 'live'">
            <v-tooltip location="top" :text="t('focusGroup.session.previous')">
              <template #activator="{ props: tip }">
                <v-btn
                  v-bind="tip"
                  class="fg-round"
                  icon="mdi-chevron-left"
                  :disabled="currentTopicIndex <= 0"
                  @click="onPrev"
                />
              </template>
            </v-tooltip>
            <span class="text-white text-body-2 mx-1">
              {{
                t('focusGroup.session.topicProgress', {
                  current: currentTopicIndex + 1,
                  total: topicCount,
                })
              }}
            </span>
            <v-tooltip location="top" :text="t('focusGroup.session.next')">
              <template #activator="{ props: tip }">
                <v-btn
                  v-bind="tip"
                  class="fg-round"
                  icon="mdi-chevron-right"
                  :disabled="currentTopicIndex >= topicCount - 1"
                  @click="onNext"
                />
              </template>
            </v-tooltip>
            <v-btn
              class="fg-pill fg-pill-danger ms-2"
              prepend-icon="mdi-stop"
              @click="onEnd"
            >
              {{ t('focusGroup.session.endSession') }}
            </v-btn>
          </template>

          <span v-else class="text-white text-body-2">
            {{ t('focusGroup.session.sessionEnded') }}
          </span>
        </template>

        <span v-else class="text-white text-body-2 text-truncate">
          {{
            currentTopic?.title || t('focusGroup.session.waitingParticipant')
          }}
        </span>
      </div>

      <div class="fg-control-right">
        <v-tooltip
          location="top"
          :text="
            showPanel
              ? t('focusGroup.session.hideParticipants')
              : t('focusGroup.session.showParticipants')
          "
        >
          <template #activator="{ props: tip }">
            <v-btn
              v-bind="tip"
              class="fg-round"
              :class="{ 'fg-round-active': showPanel }"
              @click="togglePanel"
            >
              <v-badge
                :content="connectedCount"
                :model-value="connectedCount > 0"
                color="success"
              >
                <v-icon>mdi-account-group</v-icon>
              </v-badge>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </div>

    <!-- Participants side panel -->
    <div class="fg-side-panel" :class="{ 'fg-side-panel-open': showPanel }">
      <div class="fg-side-panel-header">
        <h3>{{ t('focusGroup.session.participants') }}</h3>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="togglePanel"
        />
      </div>

      <div class="fg-side-panel-content">
        <div class="fg-panel-section">
          <h4>{{ t('focusGroup.session.sessionInfo') }}</h4>
          <div class="d-flex align-center flex-wrap ga-2">
            <v-chip
              :color="statusColor"
              size="small"
              variant="flat"
              :prepend-icon="statusIcon"
            >
              {{ t(`focusGroup.session.status.${status}`) }}
            </v-chip>
            <span
              v-if="status === 'live'"
              class="text-body-2 text-medium-emphasis"
            >
              {{
                t('focusGroup.session.topicProgress', {
                  current: currentTopicIndex + 1,
                  total: topicCount,
                })
              }}
            </span>
          </div>
        </div>

        <div class="fg-panel-section">
          <h4>
            {{ t('focusGroup.session.participants') }}
            <span class="text-medium-emphasis font-weight-regular">
              ({{ connectedCount }}/{{ participantCount }})
            </span>
          </h4>
          <ParticipantList
            :participants="participants"
            :responded-ids="respondedIds"
            :current-user-id="user?.id"
          />
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { Track } from 'livekit-client'
import { getStatusColor, getStatusIcon } from '@/shared/utils/statusUtils'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import { useLiveKitRoom } from '@/shared/components/videoCall/composables/useLiveKitRoom'
import {
  useFocusGroupSession,
  SESSION_STATUS,
} from '@/ux/FocusGroup/composables/useFocusGroupSession'
import SessionLobby from '@/ux/FocusGroup/components/session/SessionLobby.vue'
import SessionVideoStage from '@/ux/FocusGroup/components/session/SessionVideoStage.vue'
import TopicPanel from '@/ux/FocusGroup/components/session/TopicPanel.vue'
import TopicDiscussion from '@/ux/FocusGroup/components/session/TopicDiscussion.vue'
import ParticipantList from '@/ux/FocusGroup/components/session/ParticipantList.vue'
import ConsentStep from '@/ux/UserTest/components/steps/ConsentStep.vue'

const store = useStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { mdAndUp } = useDisplay()

// Participants panel: open by default on desktop, hidden on mobile so the
// discussion stays front and centre.
const showPanel = ref(mdAndUp.value)
const togglePanel = () => (showPanel.value = !showPanel.value)

const studyId = route.params.id
const {
  status,
  currentTopicIndex,
  participants,
  messages,
  consents,
  loaded,
  isLive,
  isEnded,
  startSession,
  goToTopic,
  endSession,
  joinPresence,
  leavePresence,
  recordConsent,
  sendMessage,
  subscribe,
  toSessionRecord,
} = useFocusGroupSession(studyId)

const user = computed(() => store.getters.user)
const test = computed(() => store.getters.test)

const sending = ref(false)
const starting = ref(false)

// --- Session configuration selected by the facilitator on the Test screen ---
const sessionConfig = computed(() => test.value?.config ?? {})
const consentText = computed(() => sessionConfig.value.consentText ?? '')
// Quill stores empty content as markup such as "<p><br></p>", so strip tags
// before treating the form as authored.
const hasConsentText = computed(
  () => consentText.value.replace(/<[^>]*>/g, '').trim().length > 0,
)
const allowParticipantChat = computed(
  () => sessionConfig.value.allowParticipantChat !== false,
)

// --- Consent ---
const fullName = ref('')
const consentAccepted = ref(null)
const hasConsented = computed(
  () => consents.value?.[user.value?.id]?.accepted === true,
)

// --- Discussion guide ---
const discussionGuide = computed(() =>
  Array.isArray(test.value?.discussionGuide) ? test.value.discussionGuide : [],
)
const topicCount = computed(() => discussionGuide.value.length)
const hasTopics = computed(() => topicCount.value > 0)
const currentTopic = computed(
  () => discussionGuide.value[currentTopicIndex.value] ?? null,
)
const currentTopicId = computed(() => currentTopic.value?.id ?? null)

// --- Role resolution (mirrors ManagerView) ---
const accessLevel = computed(() => {
  const currentUser = user.value
  const currentTest = test.value
  if (!currentUser) return ACCESS_LEVEL.GUEST
  if (currentUser.accessLevel === 0) return ACCESS_LEVEL.ADMIN
  if (currentTest?.testAdmin?.userDocId === currentUser.id)
    return ACCESS_LEVEL.ADMIN
  const coop = currentTest?.cooperators?.find(
    (c) => c.userDocId === currentUser.id,
  )
  if (coop?.accepted === true) return coop.accessLevel
  return ACCESS_LEVEL.GUEST
})

const isFacilitator = computed(() => accessLevel.value === ACCESS_LEVEL.ADMIN)
const isParticipant = computed(
  () => accessLevel.value === ACCESS_LEVEL.EVALUATOR,
)
// Facilitator and participants can post; observers read the discussion only.
// Participant posting also depends on chat being enabled for this session.
const canPost = computed(
  () =>
    isFacilitator.value ||
    (isParticipant.value && allowParticipantChat.value),
)
const roleLabel = computed(() => {
  if (isFacilitator.value) return t('focusGroup.session.roleFacilitator')
  if (isParticipant.value) return t('focusGroup.session.roleParticipant')
  return t('focusGroup.session.roleObserver')
})

// Only participants consent. This matches the moderated test, where the
// moderator is pinned to the video call and so never sees the consent step:
// consent is for the people being researched, not the research team. Also
// requires authored consent text, so a study with the flag on but no form is
// not blocked behind an empty screen.
const needsConsent = computed(
  () =>
    isParticipant.value &&
    sessionConfig.value.requireConsent === true &&
    hasConsentText.value &&
    !hasConsented.value,
)

// --- Video call (LiveKit) ---
// Reuses the moderated transport composable as-is; FG only owns the
// presentation (tile stage + control bar buttons). Opt-in per study.
const videoEnabled = computed(
  () => sessionConfig.value.enableVideoCall === true,
)

const {
  room: callRoom,
  callStarted,
  isObservator: isCallObservator,
  isCameraEnabled,
  isMicrophoneEnabled,
  isSharingScreen,
  remoteParticipants,
  screenShareFeeds,
  connectionError,
  localVideoElement,
  connect: connectCall,
  disconnect: disconnectCall,
  toggleCamera,
  toggleMicrophone,
  toggleScreenShare,
  setRemoteVideoElement,
  setScreenShareVideoElement,
} = useLiveKitRoom({
  testId: computed(() => studyId),
  userId: computed(() => user.value?.id),
  displayName: computed(() => user.value?.name || user.value?.email || ''),
  accessLevel,
  cooperators: computed(() => test.value?.cooperators || []),
})

const localVideoState = computed(() => ({
  name: user.value?.name || user.value?.email?.split('@')[0] || '',
  isObservator: isCallObservator.value,
  isCameraEnabled: isCameraEnabled.value,
  isMicrophoneEnabled: isMicrophoneEnabled.value,
}))

const showMediaControls = computed(
  () => videoEnabled.value && callStarted.value && !isCallObservator.value,
)

// Mirrors setLocalVideoRef in the moderated view: reattach the camera track
// when the local <video> element remounts (e.g. after a tile grid reflow).
const setLocalVideo = (el) => {
  if (localVideoElement.value === el) return
  localVideoElement.value = el
  if (!el || !callRoom.value) return
  const camPub = callRoom.value.localParticipant?.getTrackPublication(
    Track.Source.Camera,
  )
  if (camPub?.track) camPub.track.attach(el)
}

// Join once the discussion is actually reachable: session live, consent
// settled, and the user resolved. The composable ignores repeat calls.
const shouldConnectVideo = computed(
  () =>
    videoEnabled.value &&
    isLive.value &&
    !needsConsent.value &&
    !!user.value?.id,
)
watch(
  shouldConnectVideo,
  async (ready) => {
    if (!ready) return
    try {
      await connectCall()
    } catch {
      // Video is best-effort: the error surfaces via connectionError and the
      // chat keeps working.
    }
  },
  { immediate: true },
)
watch(isEnded, (ended) => {
  if (ended) disconnectCall()
})

// --- Presence ---
const participantCount = computed(
  () => Object.keys(participants.value || {}).length,
)
const connectedCount = computed(
  () =>
    Object.values(participants.value || {}).filter((p) => p?.connected === true)
      .length,
)

// --- Discussion messages for the current topic (chronological) ---
const currentMessages = computed(() => {
  const byTopic = messages.value?.[currentTopicId.value] ?? {}
  return Object.entries(byTopic)
    .map(([id, value]) => ({
      id,
      userId: value?.userId ?? '',
      name: value?.name ?? '',
      text: value?.text ?? '',
      timestamp: value?.timestamp ?? 0,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
})
// participants who have posted at least one message for the current topic
const respondedIds = computed(() => [
  ...new Set(currentMessages.value.map((m) => m.userId)),
])

// --- Status chip ---
const statusColor = computed(() => {
  if (status.value === SESSION_STATUS.LIVE) return getStatusColor('active')
  if (status.value === SESSION_STATUS.ENDED) return getStatusColor('finished')
  return getStatusColor('pending')
})
const statusIcon = computed(() => {
  if (status.value === SESSION_STATUS.LIVE) return getStatusIcon('active')
  if (status.value === SESSION_STATUS.ENDED) return getStatusIcon('finished')
  return getStatusIcon('pending')
})

// --- Facilitator actions ---
const onStart = async () => {
  starting.value = true
  try {
    await startSession(user.value?.id)
  } finally {
    starting.value = false
  }
}
const onPrev = () => {
  if (currentTopicIndex.value > 0) goToTopic(currentTopicIndex.value - 1)
}
const onNext = () => {
  if (currentTopicIndex.value < topicCount.value - 1)
    goToTopic(currentTopicIndex.value + 1)
}
const onEnd = async () => {
  await endSession()
  const record = { ...toSessionRecord(), endedAt: Date.now() }
  try {
    await store.dispatch('endFocusGroupSession', {
      answersDocId: test.value?.answersDocId,
      session: record,
    })
    store.commit('SET_TOAST', {
      message: t('focusGroup.session.sessionSaved'),
      type: 'success',
    })
  } catch {
    store.commit('SET_TOAST', {
      message: t('errors.globalError'),
      type: 'error',
    })
  }
}

// --- Post a message to the current topic discussion ---
const onSend = async (text) => {
  if (!currentTopicId.value || !text?.trim()) return
  sending.value = true
  try {
    await sendMessage({
      topicId: currentTopicId.value,
      userId: user.value?.id,
      name: user.value?.name || user.value?.email || '',
      text: text.trim(),
    })
  } finally {
    sending.value = false
  }
}

const goToDashboard = () => {
  disconnectCall()
  leavePresence(user.value?.id)
  router.push(`/focusGroup/dashboard/${studyId}`).catch(() => {})
}

// --- Consent handlers ---
const joined = ref(false)

// Idempotent, so presence is only ever claimed once per mount.
const enterSession = async () => {
  if (joined.value || !user.value?.id) return
  joined.value = true
  await joinPresence({
    userId: user.value?.id,
    name: user.value?.name || user.value?.email || '',
    role: roleLabel.value,
  })
}

const onConsentAccept = async () => {
  await recordConsent({
    userId: user.value?.id,
    name: fullName.value,
    accepted: true,
  })
}

const onConsentDecline = async () => {
  await recordConsent({
    userId: user.value?.id,
    name: fullName.value,
    accepted: false,
  })
  // Drop out of the room rather than lingering as a present-but-unconsented
  // attendee.
  await leavePresence(user.value?.id)
  store.commit('SET_TOAST', {
    message: t('focusGroup.session.consentDeclined'),
    type: 'info',
  })
  router.push(`/focusGroup/dashboard/${studyId}`).catch(() => {})
}

onMounted(async () => {
  await store.dispatch('getStudy', { id: studyId })
  subscribe()
  // Presence is claimed on arrival so the lobby can show who is waiting.
  await enterSession()
})
</script>

<style scoped>
.fg-stage {
  max-width: 1100px;
  margin: 0 auto;
  /* leave room for the fixed control bar */
  padding: 24px 24px 132px;
  transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (min-width: 960px) {
  .fg-stage.panel-open {
    margin-right: 360px;
  }
}

/* --- Bottom control bar --- */
.fg-control-bar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 720px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 24px;
  background: rgba(var(--v-theme-primary), 0.97);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.fg-control-left,
.fg-control-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

.fg-control-center {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 0;
}

.fg-round {
  width: 44px !important;
  height: 44px !important;
  border-radius: 50% !important;
  color: white !important;
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.fg-round:hover {
  background: rgba(255, 255, 255, 0.22) !important;
}

.fg-round-active {
  background: #1976d2 !important;
  border-color: #1976d2 !important;
}

.fg-round-off {
  background: #f44336 !important;
  border-color: #f44336 !important;
}

.fg-control-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.25);
  margin: 0 4px;
}

.fg-round.v-btn--disabled {
  opacity: 0.4;
}

.fg-pill {
  height: 44px !important;
  border-radius: 22px !important;
  font-weight: 600;
  text-transform: none;
}

.fg-pill-danger {
  background: #f44336 !important;
  color: white !important;
}

/* --- Slide-in participants panel --- */
.fg-side-panel {
  position: fixed;
  top: 0;
  right: -360px;
  width: 360px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-surface));
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.25);
  z-index: 1500;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fg-side-panel-open {
  right: 0;
}

.fg-side-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.fg-side-panel-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}

.fg-side-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.fg-panel-section {
  margin-bottom: 28px;
}

.fg-panel-section h4 {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

@media (max-width: 959px) {
  .fg-side-panel {
    width: 100%;
    right: -100%;
  }
}
</style>
