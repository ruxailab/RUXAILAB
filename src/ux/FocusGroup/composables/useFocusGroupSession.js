import { ref, computed, onUnmounted } from 'vue'
import {
  ref as dbRef,
  onValue,
  set,
  update,
  push,
  onDisconnect,
  serverTimestamp,
} from 'firebase/database'
import { database } from '@/app/plugins/firebase/index'

export const SESSION_STATUS = {
  IDLE: 'idle',
  LIVE: 'live',
  ENDED: 'ended',
}

/**
 * Live-session state for a Focus Group, synced through Realtime Database.
 *
 * Namespaced under `focusGroupSessions/{studyId}` so it never collides with the
 * `rooms/{studyId}` tree owned by the video-call components. Encapsulates the
 * facilitator controls (start / advance topic / end), participant presence, and
 * per-topic response capture behind a small reactive surface.
 *
 * @param {string} studyId - Study document id, used as the session room id.
 */
export function useFocusGroupSession(studyId) {
  const rootPath = `focusGroupSessions/${studyId}`
  const rootRef = dbRef(database, rootPath)

  const snapshot = ref(null)
  // False until the first RTDB value arrives, so consumers can hold off on
  // gating decisions that would otherwise flash the wrong state on mount.
  const loaded = ref(false)
  let unsubscribe = null

  const status = computed(() => snapshot.value?.status ?? SESSION_STATUS.IDLE)
  const currentTopicIndex = computed(
    () => snapshot.value?.currentTopicIndex ?? 0,
  )
  const facilitatorId = computed(() => snapshot.value?.facilitatorId ?? null)
  const sessionId = computed(() => snapshot.value?.sessionId ?? null)
  const startedAt = computed(() => snapshot.value?.startedAt ?? null)
  const endedAt = computed(() => snapshot.value?.endedAt ?? null)
  const participants = computed(() => snapshot.value?.participants ?? {})
  // Per-topic discussion messages: { [topicId]: { [messageId]: { userId, name, text, timestamp } } }
  const messages = computed(() => snapshot.value?.messages ?? {})
  // Consent decisions: { [userId]: { name, accepted, timestamp } }
  const consents = computed(() => snapshot.value?.consents ?? {})

  const isLive = computed(() => status.value === SESSION_STATUS.LIVE)
  const isEnded = computed(() => status.value === SESSION_STATUS.ENDED)

  function subscribe() {
    if (unsubscribe) return
    unsubscribe = onValue(rootRef, (snap) => {
      snapshot.value = snap.val() || null
      loaded.value = true
    })
  }

  function stop() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  async function startSession(facilitator) {
    await update(rootRef, {
      status: SESSION_STATUS.LIVE,
      currentTopicIndex: 0,
      facilitatorId: facilitator,
      sessionId: `session-${Date.now()}`,
      startedAt: serverTimestamp(),
      endedAt: null,
      lastUpdate: serverTimestamp(),
    })
  }

  async function goToTopic(index) {
    await update(rootRef, {
      currentTopicIndex: index,
      lastUpdate: serverTimestamp(),
    })
  }

  async function endSession() {
    await update(rootRef, {
      status: SESSION_STATUS.ENDED,
      endedAt: serverTimestamp(),
      lastUpdate: serverTimestamp(),
    })
  }

  async function joinPresence({ userId, name, role }) {
    const presenceRef = dbRef(database, `${rootPath}/participants/${userId}`)
    await set(presenceRef, {
      name: name ?? '',
      role: role ?? '',
      connected: true,
      joinedAt: serverTimestamp(),
    })
    onDisconnect(presenceRef).update({ connected: false })
  }

  async function leavePresence(userId) {
    const presenceRef = dbRef(database, `${rootPath}/participants/${userId}`)
    await update(presenceRef, { connected: false })
  }

  /**
   * Record a consent decision for an attendee. Kept outside the presence node so
   * it survives disconnects, and carried into the persisted session record as an
   * audit trail of who agreed to take part.
   */
  async function recordConsent({ userId, name, accepted }) {
    const consentRef = dbRef(database, `${rootPath}/consents/${userId}`)
    await set(consentRef, {
      name: name ?? '',
      accepted: accepted === true,
      timestamp: serverTimestamp(),
    })
  }

  /**
   * Append a message to the current topic's discussion stream. Append-only, so
   * participants can post multiple times and the feed reads chronologically.
   */
  async function sendMessage({ topicId, userId, name, text }) {
    const listRef = dbRef(database, `${rootPath}/messages/${topicId}`)
    await push(listRef, {
      userId: userId ?? '',
      name: name ?? '',
      text: text ?? '',
      timestamp: serverTimestamp(),
    })
  }

  /**
   * Snapshot of the finished session, shaped for Firestore persistence.
   */
  function toSessionRecord() {
    return {
      sessionId: sessionId.value,
      facilitatorId: facilitatorId.value,
      startedAt: startedAt.value,
      endedAt: endedAt.value,
      participants: participants.value,
      messages: messages.value,
      consents: consents.value,
    }
  }

  onUnmounted(stop)

  return {
    // reactive state
    status,
    currentTopicIndex,
    facilitatorId,
    sessionId,
    startedAt,
    endedAt,
    participants,
    messages,
    consents,
    loaded,
    isLive,
    isEnded,
    // lifecycle
    subscribe,
    stop,
    // actions
    startSession,
    goToTopic,
    endSession,
    joinPresence,
    leavePresence,
    recordConsent,
    sendMessage,
    toSessionRecord,
  }
}
