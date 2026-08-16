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

  <!-- Live session — a fixed, full-viewport layout in the spirit of a video-call
       app: a slim top bar, a stage that fills the screen and scales with the
       number of people, its control dock beneath it, and a full-height tabbed
       side panel. Nothing scrolls the page; the stage and each panel scroll on
       their own. -->
  <div v-else class="fg-live">
    <header class="fg-topbar">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        density="comfortable"
        :title="t('focusGroup.session.backToDashboard')"
        @click="goToDashboard"
      />
      <div class="fg-topbar-title">
        <span class="fg-topbar-name">
          {{ test?.testTitle || t('focusGroup.dashboard.typeLabel') }}
        </span>
        <span class="fg-topbar-meta">
          <span class="fg-live-dot" :class="`fg-live-dot--${status}`"></span>
          {{ t(`focusGroup.session.status.${status}`) }}
          <template v-if="currentTopic">
            <span class="fg-meta-sep">•</span>
            {{
              t('focusGroup.session.topicProgress', {
                current: currentTopicIndex + 1,
                total: topicCount,
              })
            }}
          </template>
        </span>
      </div>
      <v-spacer />
      <SessionTimer
        v-if="currentTopic && timerFallbackMs > 0"
        :timer="timerForTopic"
        :fallback-ms="timerFallbackMs"
        :is-facilitator="isFacilitator"
        class="me-1"
        @play="onTimerPlay"
        @pause="onTimerPause"
        @reset="onTimerReset"
      />
      <v-chip
        :color="roleColor"
        variant="tonal"
        :prepend-icon="roleIcon"
        size="small"
      >
        {{ roleLabel }}
      </v-chip>
    </header>

    <div class="fg-body">
      <!-- Stage column: the stage plus its control dock, side by side with the
           full-height panel. -->
      <div class="fg-stage-col">
        <main class="fg-stage-area">
          <div v-if="isObserver" class="fg-observer-strip">
            <v-icon size="16" class="me-1">mdi-eye-outline</v-icon>
            {{ t('focusGroup.session.observerModeHint') }}
          </div>

          <div v-if="isInBreakout" class="fg-observer-strip">
            <v-icon size="16" class="me-1">mdi-call-split</v-icon>
            {{ t('focusGroup.session.breakoutInGroup', { name: myBreakoutGroupName }) }}
          </div>
          <div v-if="isInBreakout && breakout?.broadcast?.text" class="fg-observer-strip">
            <v-icon size="16" class="me-1">mdi-bullhorn-outline</v-icon>
            {{ breakout.broadcast.text }}
          </div>

          <CurrentQuestion
            :text="activePromptText"
            :can-clear="isFacilitator"
            @clear="onClearPrompt"
          />

          <div class="fg-stage-body">
            <SessionVideoStage
              v-if="videoEnabled"
              class="fg-fill"
              :remote-participants="remoteParticipants"
              :screen-share-feeds="screenShareFeeds"
              :local-state="localVideoState"
              :connection-error="connectionError"
              :presence-roles="participants"
              :set-local-video="setLocalVideo"
              :set-remote-video="setRemoteVideoElement"
              :set-screen-video="setScreenShareVideoElement"
            />
            <TopicDiscussion
              v-else
              class="fg-fill"
              :messages="activeMessages"
              :current-user-id="user?.id"
              :can-post="canPost"
              :sending="sending"
              @send="onSend"
            />
          </div>
        </main>

        <!-- Control dock -->
        <div class="fg-controls">
          <div class="fg-control-bar">
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
                      isMicrophoneEnabled
                        ? 'mdi-microphone'
                        : 'mdi-microphone-off'
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
                <v-tooltip
                  location="top"
                  :text="t('focusGroup.session.previous')"
                >
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
                <span class="text-white text-body-2 mx-1 fg-nowrap">
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

            <span v-else class="text-white text-body-2 text-truncate fg-nowrap">
              {{
                currentTopic?.title || t('focusGroup.session.waitingParticipant')
              }}
            </span>

            <div class="fg-control-divider" />

            <v-tooltip
              v-if="videoEnabled"
              location="top"
              :text="t('focusGroup.session.discussion')"
            >
              <template #activator="{ props: tip }">
                <v-btn
                  v-bind="tip"
                  class="fg-round"
                  :class="{
                    'fg-round-active': showPanel && panelTab === 'discussion',
                  }"
                  icon="mdi-message-text"
                  @click="togglePanelTab('discussion')"
                />
              </template>
            </v-tooltip>
            <v-tooltip
              location="top"
              :text="t('focusGroup.session.participants')"
            >
              <template #activator="{ props: tip }">
                <v-btn
                  v-bind="tip"
                  class="fg-round"
                  :class="{
                    'fg-round-active': showPanel && panelTab === 'people',
                  }"
                  @click="togglePanelTab('people')"
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
      </div>

      <!-- Full-height side panel -->
      <aside v-if="showPanel" class="fg-panel">
        <div class="fg-panel-tabs">
          <button
            v-for="tab in panelTabs"
            :key="tab.key"
            type="button"
            class="fg-tab"
            :class="{ 'fg-tab--active': panelTab === tab.key }"
            @click="panelTab = tab.key"
          >
            <v-icon size="18">{{ tab.icon }}</v-icon>
            <span>{{ t(tab.label) }}</span>
          </button>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            @click="showPanel = false"
          />
        </div>

        <div class="fg-panel-body">
          <TopicDiscussion
            v-if="panelTab === 'discussion'"
            class="fg-fill"
            :messages="activeMessages"
            :current-user-id="user?.id"
            :can-post="canPost"
            :sending="sending"
            @send="onSend"
          />

          <div v-else-if="panelTab === 'people'" class="fg-panel-scroll">
            <div class="fg-panel-count">
              {{ t('focusGroup.session.participants') }}
              <span class="text-medium-emphasis">
                {{ connectedCount }}/{{ participantCount }}
              </span>
            </div>
            <ParticipantList
              :participants="participants"
              :responded-ids="respondedIds"
              :current-user-id="user?.id"
            />
          </div>

          <div v-else-if="panelTab === 'guide'" class="fg-panel-scroll">
            <TopicPanel
              v-if="currentTopic"
              :topic="currentTopic"
              :index="currentTopicIndex"
              :total="topicCount"
              :is-facilitator="true"
              :current-prompt-text="activePromptText"
              @ask="onAsk"
            />
            <p v-else class="text-body-2 text-medium-emphasis pa-2 mb-0">
              {{ t('focusGroup.session.waitingParticipant') }}
            </p>
          </div>

          <div v-else-if="panelTab === 'breakout'" class="fg-panel-scroll">
            <BreakoutPanel
              :breakout="breakout"
              :eligible-participants="eligibleBreakoutParticipants"
              :timer="timer"
              :messages="messages"
              @start="onStartBreakout"
              @reassign="onReassignBreakout"
              @broadcast="onBroadcastBreakout"
              @recall="onRecallBreakout"
              @play="onBreakoutTimerPlay"
              @pause="onBreakoutTimerPause"
              @reset="onBreakoutTimerReset"
            />
          </div>

          <div v-else-if="panelTab === 'notes'" class="fg-fill fg-notes">
            <ObservatorNotes
              v-model="observerNotes"
              :context-label="currentTopic?.title || ''"
              @save="onSaveNotes"
            />
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { Track } from 'livekit-client'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import { useLiveKitRoom } from '@/shared/components/videoCall/composables/useLiveKitRoom'
import { useFocusGroupSession } from '@/ux/FocusGroup/composables/useFocusGroupSession'
import SessionLobby from '@/ux/FocusGroup/components/session/SessionLobby.vue'
import SessionVideoStage from '@/ux/FocusGroup/components/session/SessionVideoStage.vue'
import TopicPanel from '@/ux/FocusGroup/components/session/TopicPanel.vue'
import SessionTimer from '@/ux/FocusGroup/components/session/SessionTimer.vue'
import CurrentQuestion from '@/ux/FocusGroup/components/session/CurrentQuestion.vue'
import TopicDiscussion from '@/ux/FocusGroup/components/session/TopicDiscussion.vue'
import ParticipantList from '@/ux/FocusGroup/components/session/ParticipantList.vue'
import BreakoutPanel from '@/ux/FocusGroup/components/session/BreakoutPanel.vue'
import ObservatorNotes from '@/ux/UserTest/components/ObservatorNotes.vue'
import ConsentStep from '@/ux/UserTest/components/steps/ConsentStep.vue'
import {
  splitIntoGroups,
  reassignParticipant,
} from '@/ux/FocusGroup/utils/breakoutGroups'

const store = useStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { mdAndUp } = useDisplay()

// Side panel: open by default on desktop, hidden on mobile so the stage stays
// front and centre. The active tab is kept valid by a watcher below.
const showPanel = ref(mdAndUp.value)
const panelTab = ref('discussion')

const studyId = route.params.id
const {
  status,
  currentTopicIndex,
  participants,
  messages,
  consents,
  currentPrompt,
  notes,
  timer,
  breakout,
  loaded,
  isLive,
  isEnded,
  startSession,
  goToTopic,
  endSession,
  joinPresence,
  leavePresence,
  recordConsent,
  askPrompt,
  clearPrompt,
  saveNotes,
  playTimer,
  pauseTimer,
  resetTimer,
  sendMessage,
  setBreakoutState,
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

// The active question shown to everyone, scoped to the current topic so a stale
// prompt from a previous topic never leaks onto the next one.
const activePromptText = computed(() =>
  currentPrompt.value?.topicId === currentTopicId.value
    ? (currentPrompt.value?.text ?? '')
    : '',
)

// --- Topic timer ---
const timerFallbackMs = computed(
  () => (currentTopic.value?.durationMinutes || 0) * 60000,
)
// Only use the shared timer when it belongs to the current topic; otherwise the
// display falls back to the topic's full planned duration (paused).
const timerForTopic = computed(() =>
  timer.value?.topicId === currentTopicId.value ? timer.value : null,
)
const onTimerPlay = (remainingMs) =>
  playTimer({ topicId: currentTopicId.value, remainingMs })
const onTimerPause = (remainingMs) =>
  pauseTimer({ topicId: currentTopicId.value, remainingMs })
const onTimerReset = () =>
  resetTimer({
    topicId: currentTopicId.value,
    durationMs: timerFallbackMs.value,
  })

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
// Anyone who is neither running the session nor taking part in it observes it:
// a dedicated OBSERVATOR cooperator, but also any signed-in viewer who opens
// the session link without a posting role. This mirrors roleLabel, so the
// "Observer" badge and the observer tools (notes pad, observing strip) always
// agree instead of the badge showing while the tools stay hidden.
const isObserver = computed(
  () => !isFacilitator.value && !isParticipant.value,
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
// Role badge styling, shared visual language with ParticipantList so a person's
// own role in the header matches how they appear in the roster.
const roleIcon = computed(() => {
  if (isFacilitator.value) return 'mdi-account-star'
  if (isObserver.value) return 'mdi-eye'
  return 'mdi-account'
})
const roleColor = computed(() => {
  if (isFacilitator.value) return 'blue'
  if (isObserver.value) return 'orange'
  return 'green'
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

// A participant assigned to an active breakout group connects to that
// group's own LiveKit room instead of the main one; the facilitator and
// observers always stay in the main room. `myBreakoutGroupId` is declared
// further below (breakout section) — safe here since this getter is lazy.
const effectiveRoomId = computed(() =>
  myBreakoutGroupId.value
    ? `${studyId}-breakout-${myBreakoutGroupId.value}`
    : studyId,
)

// Side-panel tabs, in reading order: the facilitator's guide, the discussion
// (a tab only when video owns the stage, otherwise the discussion IS the
// stage), then the people roster.
const panelTabs = computed(() => {
  const tabs = []
  if (isFacilitator.value)
    tabs.push({
      key: 'guide',
      icon: 'mdi-script-text-outline',
      label: 'focusGroup.session.guide',
    })
  // Breakout rooms split video/audio into isolated LiveKit rooms, so they
  // only make sense when the session has video enabled.
  if (isFacilitator.value && videoEnabled.value)
    tabs.push({
      key: 'breakout',
      icon: 'mdi-call-split',
      label: 'focusGroup.session.breakout',
    })
  if (videoEnabled.value)
    tabs.push({
      key: 'discussion',
      icon: 'mdi-message-text-outline',
      label: 'focusGroup.session.discussion',
    })
  tabs.push({
    key: 'people',
    icon: 'mdi-account-group',
    label: 'focusGroup.session.participants',
  })
  // Observers/note-takers get a private notes pad, reusing the moderated tool.
  if (isObserver.value)
    tabs.push({
      key: 'notes',
      icon: 'mdi-notebook-edit-outline',
      label: 'focusGroup.session.notes',
    })
  return tabs
})
// Keep the active tab valid; prefer the discussion, else the first tab.
watch(
  panelTabs,
  (tabs) => {
    if (!tabs.some((item) => item.key === panelTab.value))
      panelTab.value = tabs.some((item) => item.key === 'discussion')
        ? 'discussion'
        : (tabs[0]?.key ?? 'people')
  },
  { immediate: true },
)
const togglePanelTab = (tab) => {
  if (showPanel.value && panelTab.value === tab) {
    showPanel.value = false
  } else {
    panelTab.value = tab
    showPanel.value = true
  }
}

const {
  room: callRoom,
  callStarted,
  isConnecting: isCallConnecting,
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
  testId: effectiveRoomId,
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
// Entering or leaving a breakout group changes which LiveKit room this
// client should be in; move the existing call across rather than waiting
// for a fresh mount. No-ops if a call was never started.
watch(effectiveRoomId, async (next, previous) => {
  if (!previous || next === previous) return
  if (!callStarted.value && !isCallConnecting.value) return
  await disconnectCall()
  try {
    await connectCall()
  } catch {
    // Best-effort, same as the initial connect above.
  }
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

// --- Breakout rooms ---
// Only participants get split into groups; the facilitator stays in the main
// room to monitor/broadcast/recall, and observers stay put too (they watch,
// they don't work in groups).
const eligibleBreakoutParticipants = computed(() =>
  Object.entries(participants.value || {})
    .filter(([, p]) => p?.role === t('focusGroup.session.roleParticipant'))
    .map(([id, p]) => ({ id, name: p?.name || '' })),
)
const myBreakoutGroupId = computed(() => {
  if (!isParticipant.value || !breakout.value?.active) return null
  const groups = breakout.value.groups ?? {}
  const entry = Object.entries(groups).find(([, group]) =>
    (group.participantIds ?? []).includes(user.value?.id),
  )
  return entry?.[0] ?? null
})
const isInBreakout = computed(() => myBreakoutGroupId.value !== null)
const myBreakoutGroupName = computed(
  () => breakout.value?.groups?.[myBreakoutGroupId.value]?.name ?? '',
)

const onStartBreakout = (groupCount) => {
  const groups = splitIntoGroups(
    eligibleBreakoutParticipants.value.map((p) => p.id),
    groupCount,
  )
  setBreakoutState({ active: true, groups, broadcast: null })
}
const onReassignBreakout = ({ userId, groupId }) => {
  if (!breakout.value) return
  const groups = reassignParticipant(breakout.value.groups, userId, groupId)
  setBreakoutState({ ...breakout.value, groups })
}
const onBroadcastBreakout = (text) => {
  if (!breakout.value) return
  setBreakoutState({
    ...breakout.value,
    broadcast: { text, sentAt: Date.now() },
  })
}
const onRecallBreakout = () => {
  setBreakoutState({ active: false, groups: {}, broadcast: null })
}
const onBreakoutTimerPlay = (remainingMs) =>
  playTimer({ topicId: 'breakout', remainingMs })
const onBreakoutTimerPause = (remainingMs) =>
  pauseTimer({ topicId: 'breakout', remainingMs })
const onBreakoutTimerReset = () =>
  resetTimer({ topicId: 'breakout', durationMs: 10 * 60 * 1000 })

// The stage/panel discussion swaps to a participant's breakout-group chat
// while they're in one, reusing the exact per-topic messages plumbing above
// via a synthetic topic id — no new RTDB shape, no new UI component.
const activeChatTopicId = computed(() =>
  isInBreakout.value ? `breakout-${myBreakoutGroupId.value}` : currentTopicId.value,
)
const activeMessages = computed(() => {
  const byTopic = messages.value?.[activeChatTopicId.value] ?? {}
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
  if (!activeChatTopicId.value || !text?.trim()) return
  sending.value = true
  try {
    await sendMessage({
      topicId: activeChatTopicId.value,
      userId: user.value?.id,
      name: user.value?.name || user.value?.email || '',
      text: text.trim(),
    })
  } finally {
    sending.value = false
  }
}

// Facilitator surfaces a prompt as the current question (or retires it).
const onAsk = (prompt) => {
  if (!currentTopicId.value || !prompt?.trim()) return
  askPrompt({ text: prompt.trim(), topicId: currentTopicId.value })
}
const onClearPrompt = () => clearPrompt()

// --- Observer notes (reuses the moderated ObservatorNotes tool) ---
const observerNotes = ref([])
let notesSeeded = false
// Seed once from any persisted notes so a refresh keeps the observer's pad.
watch(
  () => notes.value?.[user.value?.id],
  (stored) => {
    if (!notesSeeded && Array.isArray(stored) && stored.length) {
      observerNotes.value = [...stored]
      notesSeeded = true
    }
  },
  { immediate: true },
)
const onSaveNotes = () => {
  if (!user.value?.id) return
  saveNotes({ userId: user.value.id, notes: observerNotes.value })
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
/* --- Live session shell: fixed viewport, page never scrolls --- */
.fg-live {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-background));
}

/* Top bar */
.fg-topbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 60px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.fg-topbar-title {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}

.fg-topbar-name {
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fg-topbar-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.fg-meta-sep {
  opacity: 0.5;
}

.fg-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(var(--v-theme-on-surface), 0.4);
}

.fg-live-dot--live {
  background: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.18);
}

/* Body: stage column + full-height panel */
.fg-body {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.fg-stage-col {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.fg-stage-area {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 16px;
  gap: 12px;
}

.fg-observer-strip {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.85rem;
  color: rgb(var(--v-theme-info));
  background: rgba(var(--v-theme-info), 0.1);
}

.fg-stage-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}

.fg-fill {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  width: 100%;
}

/* Side panel — matches the moderated video-call side panel: a distinct surface
   that casts a shadow onto the stage, with a header band above the content. */
.fg-panel {
  position: relative;
  z-index: 1;
  flex: 0 0 360px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: rgb(var(--v-theme-surface));
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.12);
}

.fg-panel-tabs {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.fg-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.6);
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.fg-tab:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.fg-tab--active {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
}

.fg-panel-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.fg-panel-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
}

.fg-panel-count {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Make the reused ObservatorNotes tool read like the FG Discussion panel: it
   ships its own header + footer chrome for the moderated sidebar, which doubles
   up here since the panel tab bar already labels it. Scoped to the Notes tab
   only, so the moderated-test styling is left untouched. */
.fg-notes :deep(.observator-notes-container) {
  border-left: none;
  background: transparent;
}

/* The tab bar already says "Notes" (like Discussion, which has no sub-header). */
.fg-notes :deep(.header) {
  display: none;
}

.fg-notes :deep(.notes-list) {
  padding: 16px !important;
  background: transparent;
}

/* Echo the discussion message bubble: flat, softly tinted, rounded. */
.fg-notes :deep(.note-item) {
  border: none !important;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.04) !important;
  box-shadow: none !important;
}

/* Match the discussion composer: no grey slab, just a divider line on top. */
.fg-notes :deep(.input-area) {
  background: transparent !important;
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}

/* Control dock (under the stage) */
.fg-controls {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  padding: 12px;
}

.fg-control-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  padding: 8px 14px;
  border-radius: 20px;
  background: rgba(var(--v-theme-primary), 0.97);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
}

.fg-round {
  width: 44px !important;
  height: 44px !important;
  border-radius: 50% !important;
  color: white !important;
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  transition:
    background 0.15s ease,
    transform 0.1s ease;
}

.fg-round:hover {
  background: rgba(255, 255, 255, 0.22) !important;
}

.fg-round:active {
  transform: scale(0.94);
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
  margin: 0 2px;
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

.fg-nowrap {
  white-space: nowrap;
}

/* On narrow screens the panel overlays the stage instead of squeezing it. */
@media (max-width: 860px) {
  .fg-panel {
    position: absolute;
    inset: 0;
    width: 100%;
    flex-basis: auto;
    z-index: 20;
  }
}
</style>
