import { computed, onBeforeUnmount, ref } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import {
  onDisconnect,
  onValue,
  ref as dbRef,
  remove,
  update,
} from 'firebase/database'
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
  buildMobileTaskLivePayload,
  createMobileTaskAttemptId,
  isMobileTaskIndexEligible,
  isPhoneConnected,
  mobileTaskLiveConnectedPath,
  mobileTaskLiveDisconnectUpdate,
  mobileTaskLivePath,
  mobileTaskLiveReturnToTaskPath,
  mobileTaskLiveUpdate,
  mobileTaskPairingPath,
  resolveDisplayedOutcome,
  settleMobileTaskSubmit,
} from '@/ux/UserTest/utils/mobileTaskPageState'

/**
 * Desktop pairing for unmoderated task instructions.
 * The phone never reads this companion document. It listens to the RTDB
 * live channel and writes `connected` on that node; this listener is the
 * owner's document.
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
  const lastReturnToTaskAt = ref(0)

  let unsubscribe = null
  let presenceUnsubscribe = null
  let presenceToken = ''
  let returnToTaskUnsubscribe = null
  let returnToTaskToken = ''
  let returnToTaskPrimed = false
  let handledReturnToTaskAt = 0
  let restored = false
  let ensuring = false
  let liveDisconnect = null
  let liveDisconnectToken = ''

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

  function stopReturnToTask() {
    if (typeof returnToTaskUnsubscribe === 'function') returnToTaskUnsubscribe()
    returnToTaskUnsubscribe = null
    returnToTaskToken = ''
    returnToTaskPrimed = false
  }

  function stopListening() {
    if (typeof unsubscribe === 'function') unsubscribe()
    unsubscribe = null
    stopPresence()
    stopReturnToTask()
  }

  function listenPresence(nextToken) {
    if (presenceToken === nextToken && presenceUnsubscribe) return
    stopPresence()
    const path = mobileTaskLiveConnectedPath(nextToken)
    if (!path) return
    presenceToken = nextToken
    presenceUnsubscribe = onValue(
      dbRef(database, path),
      (snapshot) => {
        presenceConnected.value = snapshot.val() === true
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
        listenReturnToTask(companion.value.token)
        void armLiveDisconnect(companion.value.token)
      },
      () => {
        // A failed listener must not mark the offer as failed. Desktop
        // outcome buttons still submit on their own.
      },
    )
    listenPresence(token.value)
    listenReturnToTask(token.value)
    void armLiveDisconnect(token.value)
  }

  /**
   * When the computer drops from Realtime, the task fields are cleared and
   * the phone goes back to waiting. The node stays so the pairing is not
   * `ended`. Reload must not cancel this; only an intentional end does.
   *
   * @param {string} nextToken
   */
  async function armLiveDisconnect(nextToken) {
    if (liveDisconnectToken === nextToken && liveDisconnect) return
    await cancelLiveDisconnect()
    const path = mobileTaskLivePath(nextToken)
    const payload = mobileTaskLiveDisconnectUpdate()
    if (!path || !payload) return
    liveDisconnect = onDisconnect(dbRef(database, path))
    liveDisconnectToken = nextToken
    try {
      await liveDisconnect.update(payload)
    } catch {
      liveDisconnect = null
      liveDisconnectToken = ''
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async function cancelLiveDisconnect() {
    const op = liveDisconnect
    liveDisconnect = null
    liveDisconnectToken = ''
    if (!op) return
    try {
      await op.cancel()
    } catch {
      /* already disconnected */
    }
  }

  /**
   * The first snapshot is whatever was already on the node. Later increases
   * mean the phone asked the desktop to close the external site.
   *
   * @param {string} nextToken
   */
  function listenReturnToTask(nextToken) {
    if (returnToTaskToken === nextToken && returnToTaskUnsubscribe) return
    stopReturnToTask()
    const path = mobileTaskLiveReturnToTaskPath(nextToken)
    if (!path) return
    returnToTaskToken = nextToken
    returnToTaskUnsubscribe = onValue(
      dbRef(database, path),
      (snapshot) => {
        const value = snapshot.val()
        if (!returnToTaskPrimed) {
          returnToTaskPrimed = true
          handledReturnToTaskAt = typeof value === 'number' ? value : 0
          return
        }
        if (typeof value === 'number' && value > handledReturnToTaskAt) {
          handledReturnToTaskAt = value
          lastReturnToTaskAt.value = value
        }
      },
    )
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

  /**
   * Writes the phone channel directly without replacing `connected`.
   * A failure leaves the Cloud Function mirror as the slower path.
   *
   * @param {object|null|undefined} payload
   * @returns {Promise<void>}
   */
  async function publishLive(payload) {
    const path = mobileTaskLivePath(token.value)
    const next = mobileTaskLiveUpdate(payload)
    if (!path || !next) return
    try {
      await update(dbRef(database, path), next)
    } catch {
      /* The server mirror still updates the phone. */
    }
  }

  /**
   * @returns {object|null}
   */
  function livePayloadFromCompanion() {
    const active = companion.value?.activeTask
    if (active?.attemptId) {
      const payload = buildMobileTaskLivePayload({
        state: 'active',
        taskIndex: active.taskIndex,
        taskId: active.taskId,
        attemptId: active.attemptId,
        taskNumber: active.taskNumber,
        title: active.title,
        description: active.description,
        taskType: active.taskType,
      })
      if (payload) return payload
    }
    return buildMobileTaskLivePayload({ state: 'waiting' })
  }

  /**
   * @returns {Promise<void>}
   */
  async function clearLive() {
    const path = mobileTaskLivePath(token.value)
    if (!path) return
    try {
      await remove(dbRef(database, path))
    } catch {
      /* Ending the session also deletes this node. */
    }
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
      await publishLive(livePayloadFromCompanion())
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
      await publishLive(livePayloadFromCompanion())
    } catch {
      restored = false
    }
  }

  async function endSession() {
    if (!sessionOpen.value) return
    const { studyId, answerId } = requireContext()
    await cancelLiveDisconnect()
    await endMobileTaskCompanion({ studyId, answerId })
    await clearLive()
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
    const previous = livePayloadFromCompanion()
    await publishLive(buildMobileTaskLivePayload({ state: 'completed' }))
    try {
      const { studyId, answerId } = requireContext()
      await completeMobileTaskPhase({ studyId, answerId })
    } catch {
      await publishLive(previous)
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
   * the caller can keep the computer flow going. The phone sees the task
   * from the Realtime Database before the callable returns.
   *
   * @param {{ taskIndex: number, taskId: string, title?: string, description?: string, taskType?: string }} input
   */
  async function activate({
    taskIndex,
    taskId,
    title = '',
    description = '',
    taskType = '',
  }) {
    if (!enabled.value || !isMobileTaskIndexEligible(taskIndex)) return null
    const { studyId, answerId } = requireContext()
    const active = companion.value?.activeTask
    const sameOpenAttempt =
      active?.attemptId &&
      Number(active.taskIndex) === Number(taskIndex) &&
      String(active.taskId) === String(taskId)
    const attemptId = sameOpenAttempt ? active.attemptId : createMobileTaskAttemptId()
    const previous = livePayloadFromCompanion()
    const published = buildMobileTaskLivePayload({
      state: 'active',
      taskIndex,
      taskId,
      attemptId,
      taskNumber: taskIndex + 1,
      title,
      description,
      taskType,
    })
    await publishLive(published)
    try {
      const result = await activateMobileTask({
        studyId,
        answerId,
        taskIndex,
        taskId,
        attemptId,
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
          title,
          description,
          taskType,
        },
      }
      if (result.attemptId && result.attemptId !== attemptId) {
        await publishLive(
          buildMobileTaskLivePayload({
            state: 'active',
            taskIndex: result.taskIndex,
            taskId: result.taskId,
            attemptId: result.attemptId,
            taskNumber: result.taskNumber,
            title,
            description,
            taskType,
          }),
        )
      }
      return result
    } catch (error) {
      await publishLive(previous)
      throw error
    }
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
    lastReturnToTaskAt,
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
