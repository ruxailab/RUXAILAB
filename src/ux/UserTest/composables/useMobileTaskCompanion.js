import { computed, onBeforeUnmount, ref } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { onValue, ref as dbRef } from 'firebase/database'
import { database, db } from '@/app/plugins/firebase'
import {
  activateMobileTask,
  completeMobileTaskPhase,
  createMobileTaskCompanion,
  endMobileTaskCompanion,
  getMobileTaskCompanion,
  submitMobileTaskOutcome,
} from '@/ux/UserTest/services/mobileTaskCompanionClient'
import {
  isMobileTaskIndexEligible,
  isPhoneConnected,
  mobileTaskPairingPath,
  mobileTaskPresencePath,
  resolveDisplayedOutcome,
  settleMobileTaskSubmit,
} from '@/ux/UserTest/utils/mobileTaskPageState'

/**
 * Desktop pairing for unmoderated task instructions.
 * The phone never reads this companion document. It listens to the public
 * view and writes RTDB presence; this listener is the owner's document.
 *
 * @param {object} options
 * @param {() => string|null|undefined} options.getStudyId
 * @param {() => string|null|undefined} options.getAnswerId
 * @param {() => string|null|undefined} options.getOwnerUid auth uid, including anonymous
 */
export function useMobileTaskCompanion({
  getStudyId,
  getAnswerId,
  getOwnerUid,
}) {
  const enabled = ref(false)
  const busy = ref(false)
  const error = ref(false)
  const sessionOpen = ref(false)
  const companion = ref(null)
  const presenceConnected = ref(false)

  let unsubscribe = null
  let presenceUnsubscribe = null
  let presenceToken = ''
  let restored = false
  let ensuring = false

  const token = computed(() => companion.value?.token || '')
  const pairingPath = computed(() =>
    mobileTaskPairingPath({
      studyId: getStudyId(),
      participantUid: getOwnerUid(),
      token: token.value,
    }),
  )
  const phoneConnected = computed(() => isPhoneConnected(presenceConnected.value))

  function stopPresence() {
    if (typeof presenceUnsubscribe === 'function') presenceUnsubscribe()
    presenceUnsubscribe = null
    presenceToken = ''
    presenceConnected.value = false
  }

  function stopListening() {
    if (typeof unsubscribe === 'function') unsubscribe()
    unsubscribe = null
    stopPresence()
  }

  function listenPresence(nextToken) {
    if (presenceToken === nextToken && presenceUnsubscribe) return
    stopPresence()
    const path = mobileTaskPresencePath(nextToken)
    if (!path) return
    presenceToken = nextToken
    presenceUnsubscribe = onValue(
      dbRef(database, path),
      (snapshot) => {
        presenceConnected.value = snapshot.val()?.connected === true
      },
      () => {
        presenceConnected.value = false
      },
    )
  }

  function listen(studyId, ownerUid) {
    stopListening()
    const companionRef = doc(
      db,
      'tests',
      studyId,
      'mobileTaskCompanions',
      ownerUid,
    )
    unsubscribe = onSnapshot(
      companionRef,
      (snapshot) => {
        if (!snapshot.exists()) return
        const data = snapshot.data() || {}
        companion.value = {
          companionId: snapshot.id,
          token:
            data.token ||
            (data.status === 'paired' ? companion.value?.token : '') ||
            '',
          status: data.status || 'paired',
          activeTask: data.activeTask || null,
          lastOutcome: data.lastOutcome || null,
        }
        listenPresence(companion.value.token)
      },
      () => {
        // A failed listener must not mark the offer as failed. Desktop
        // outcome buttons still submit on their own.
      },
    )
    listenPresence(token.value)
  }

  function requireContext() {
    const studyId = getStudyId()
    const answerId = getAnswerId()
    const ownerUid = getOwnerUid()
    if (!studyId || !answerId || !ownerUid) {
      throw new Error('Mobile task companion is missing its study context')
    }
    return { studyId, answerId, ownerUid }
  }

  async function enable() {
    if (busy.value || enabled.value) return
    busy.value = true
    error.value = false
    try {
      const { studyId, answerId, ownerUid } = requireContext()
      const result = await createMobileTaskCompanion({ studyId, answerId })
      if (!result?.companion?.token) {
        throw new Error('Mobile task companion did not return a token')
      }
      companion.value = result.companion
      enabled.value = true
      sessionOpen.value = true
      listen(studyId, ownerUid)
    } catch {
      enabled.value = false
      error.value = true
    } finally {
      busy.value = false
    }
  }

  /**
   * Reload restores a paired companion. It must not end or rotate the token.
   */
  async function restore() {
    if (restored || sessionOpen.value) return
    const studyId = getStudyId()
    const answerId = getAnswerId()
    const ownerUid = getOwnerUid()
    if (!studyId || !answerId || !ownerUid) return
    restored = true
    try {
      const result = await getMobileTaskCompanion({ studyId, answerId })
      if (!result?.companion?.token || result.companion.status !== 'paired') {
        return
      }
      companion.value = result.companion
      enabled.value = true
      sessionOpen.value = true
      listen(studyId, ownerUid)
    } catch {
      restored = false
    }
  }

  async function endSession() {
    if (!sessionOpen.value) return
    const { studyId, answerId } = requireContext()
    await endMobileTaskCompanion({ studyId, answerId })
    sessionOpen.value = false
    enabled.value = false
    companion.value = null
    stopListening()
  }

  /**
   * Thank-you on the phone when the desktop leaves the last task.
   * Does not end the pairing. A missing session is a no-op.
   */
  async function completeTaskPhase() {
    if (!sessionOpen.value) return
    try {
      const { studyId, answerId } = requireContext()
      await completeMobileTaskPhase({ studyId, answerId })
    } catch {
      /* Thank-you is best-effort; the computer flow continues. */
    }
  }

  async function disable() {
    if (busy.value || !enabled.value) return
    busy.value = true
    error.value = false
    try {
      await endSession()
    } catch {
      error.value = true
    } finally {
      busy.value = false
    }
  }

  /**
   * Restores a paired session after reload, or creates one when none exists.
   * The admin kill switch is applied by the caller before invoking this.
   */
  async function ensureEnabled() {
    if (enabled.value || busy.value || ensuring) return
    const studyId = getStudyId()
    const answerId = getAnswerId()
    const ownerUid = getOwnerUid()
    if (!studyId || !answerId || !ownerUid) return
    ensuring = true
    try {
      await restore()
      if (!enabled.value) await enable()
    } finally {
      ensuring = false
    }
  }

  /**
   * Called after the desktop task has already started. Throws on failure so
   * the caller can keep the computer flow going.
   *
   * @param {{ taskIndex: number, taskId: string }} input
   */
  async function activate({ taskIndex, taskId }) {
    if (!enabled.value || !isMobileTaskIndexEligible(taskIndex)) return null
    const { studyId, answerId } = requireContext()
    const result = await activateMobileTask({
      studyId,
      answerId,
      taskIndex,
      taskId,
    })
    companion.value = {
      ...(companion.value || {}),
      activeTask: {
        ...(companion.value?.activeTask || {}),
        taskIndex: result.taskIndex,
        taskId: result.taskId,
        attemptId: result.attemptId,
        startedAt: result.startedAt,
        taskNumber: result.taskNumber,
      },
    }
    return result
  }

  /**
   * @param {{ taskIndex: number, outcome: 'completed'|'not_completed' }} input
   */
  function submitOutcome({ taskIndex, outcome }) {
    const active = companion.value?.activeTask
    if (
      !enabled.value ||
      !isMobileTaskIndexEligible(taskIndex) ||
      !active?.attemptId ||
      Number(active.taskIndex) !== Number(taskIndex)
    ) {
      return Promise.resolve(resolveDisplayedOutcome(null))
    }

    return settleMobileTaskSubmit(() =>
      submitMobileTaskOutcome({
        studyId: getStudyId(),
        answerId: getAnswerId(),
        taskIndex: active.taskIndex,
        taskId: active.taskId,
        attemptId: active.attemptId,
        outcome,
      }),
    )
  }

  /**
   * Accepted outcome for the task currently on screen, when it matches the
   * open attempt. Null until the server has stored that attempt's outcome.
   *
   * @param {number} taskIndex
   */
  function outcomeMatchingActiveTask(taskIndex) {
    const last = companion.value?.lastOutcome
    if (!last?.attemptId) return null
    if (Number(last.taskIndex) !== Number(taskIndex)) return null
    const active = companion.value?.activeTask
    if (
      active?.attemptId &&
      (last.attemptId !== active.attemptId ||
        Number(active.taskIndex) !== Number(taskIndex))
    ) {
      return null
    }
    return resolveDisplayedOutcome({
      accepted: true,
      duplicate: false,
      ...last,
    })
  }

  onBeforeUnmount(() => {
    stopListening()
  })

  return {
    enabled,
    busy,
    error,
    companion,
    token,
    pairingPath,
    phoneConnected,
    enable,
    disable,
    restore,
    ensureEnabled,
    endSession,
    completeTaskPhase,
    activate,
    submitOutcome,
    outcomeMatchingActiveTask,
  }
}
