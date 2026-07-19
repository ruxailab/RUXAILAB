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

  <!-- Live discussion -->
  <v-container v-else fluid class="pa-4 pa-md-6">
    <!-- Header -->
    <div class="d-flex align-center flex-wrap ga-3 mb-4">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        :title="t('focusGroup.session.backToDashboard')"
        @click="goToDashboard"
      />
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

    <!-- Facilitator controls -->
    <FacilitatorControls
      v-if="isFacilitator"
      class="mb-4"
      :status="status"
      :current-index="currentTopicIndex"
      :total="topicCount"
      @start="onStart"
      @prev="onPrev"
      @next="onNext"
      @end="onEnd"
    />

    <v-row>
      <!-- Main column -->
      <v-col cols="12" md="8">
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
      </v-col>

      <!-- Sidebar -->
      <v-col cols="12" md="4">
        <ParticipantList
          :participants="participants"
          :responded-ids="respondedIds"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { getStatusColor, getStatusIcon } from '@/shared/utils/statusUtils'
import { ACCESS_LEVEL } from '@/shared/utils/accessLevel'
import {
  useFocusGroupSession,
  SESSION_STATUS,
} from '@/ux/FocusGroup/composables/useFocusGroupSession'
import SessionLobby from '@/ux/FocusGroup/components/session/SessionLobby.vue'
import FacilitatorControls from '@/ux/FocusGroup/components/session/FacilitatorControls.vue'
import TopicPanel from '@/ux/FocusGroup/components/session/TopicPanel.vue'
import TopicDiscussion from '@/ux/FocusGroup/components/session/TopicDiscussion.vue'
import ParticipantList from '@/ux/FocusGroup/components/session/ParticipantList.vue'
import ConsentStep from '@/ux/UserTest/components/steps/ConsentStep.vue'

const store = useStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const studyId = route.params.id
const {
  status,
  currentTopicIndex,
  participants,
  messages,
  consents,
  loaded,
  isLive,
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
// Mirrors the moderated test: consent is not role gated, everyone attending
// agrees before taking part. Requires actual consent text, so a study that has
// the flag on but no form authored is not blocked behind an empty screen.
const needsConsent = computed(
  () =>
    sessionConfig.value.requireConsent === true &&
    hasConsentText.value &&
    !hasConsented.value,
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

// --- Presence ---
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
