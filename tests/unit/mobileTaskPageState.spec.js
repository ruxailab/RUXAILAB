import {
  applyAcceptedOutcome,
  buildMobileTaskLivePayload,
  createMobileTaskAttemptId,
  resolveMobileTaskChannel,
  isMobileTaskIndexEligible,
  isPhoneConnected,
  mapMobileTaskUiState,
  mobileTaskId,
  mobileTaskLiveConnectedPath,
  mobileTaskLivePath,
  mobileTaskLiveUpdate,
  mobileTaskPairingPath,
  resolveDisplayedOutcome,
  settleMobileTaskSubmit,
} from '@/ux/UserTest/utils/mobileTaskPageState'

const accepted = {
  accepted: true,
  duplicate: false,
  outcome: 'completed',
  completed: true,
  taskIndex: 0,
  taskId: 'task-a',
  attemptId: 'attempt-1',
  startedAt: 1000,
  endedAt: 5000,
  taskTime: 4000,
  participationMode: 'mobile-task-instructions',
}

describe('mobile task page state', () => {
  it('maps the server states and keeps sending, loading and disconnected local', () => {
    expect(mapMobileTaskUiState({ serverState: 'waiting' })).toBe('waiting')
    expect(mapMobileTaskUiState({ serverState: 'active' })).toBe('active')
    expect(mapMobileTaskUiState({ serverState: 'accepted' })).toBe('accepted')
    expect(mapMobileTaskUiState({ serverState: 'completed' })).toBe('completed')
    expect(mapMobileTaskUiState({ serverState: 'ended' })).toBe('ended')
    expect(
      mapMobileTaskUiState({ serverState: 'active', submitting: true }),
    ).toBe('sending')
    expect(
      mapMobileTaskUiState({ serverState: 'sending' }),
    ).toBe('disconnected')
    expect(mapMobileTaskUiState({ serverState: null })).toBe('loading')
  })

  it('shows a connection problem instead of the saved confirmation', () => {
    expect(
      mapMobileTaskUiState({
        serverState: 'accepted',
        networkFailure: true,
      }),
    ).toBe('disconnected')
    expect(
      mapMobileTaskUiState({
        serverState: 'accepted',
        submitting: true,
        networkFailure: true,
      }),
    ).toBe('sending')
    expect(
      mapMobileTaskUiState({ serverState: null, networkFailure: true }),
    ).toBe('disconnected')
  })

  it('keeps a short local saved confirmation until waiting, not the next task', () => {
    expect(
      mapMobileTaskUiState({
        serverState: 'waiting',
        localAccepted: true,
        localAcceptedAttemptId: 'attempt-1',
      }),
    ).toBe('accepted')
    expect(
      mapMobileTaskUiState({
        serverState: 'active',
        localAccepted: true,
        localAcceptedAttemptId: 'attempt-1',
        serverAttemptId: 'attempt-1',
      }),
    ).toBe('accepted')
    expect(
      mapMobileTaskUiState({
        serverState: 'active',
        localAccepted: true,
        localAcceptedAttemptId: 'attempt-1',
        serverAttemptId: 'attempt-2',
      }),
    ).toBe('active')
    expect(
      mapMobileTaskUiState({
        serverState: 'completed',
        localAccepted: true,
      }),
    ).toBe('completed')
  })

  it('treats success as a resolved accept and keeps the server outcome', async () => {
    expect(resolveDisplayedOutcome(null).success).toBe(false)
    expect(resolveDisplayedOutcome({ accepted: false }).success).toBe(false)
    expect(resolveDisplayedOutcome(accepted)).toMatchObject({
      success: true,
      outcome: 'completed',
      completed: true,
      participationMode: 'mobile-task-instructions',
    })

    const opposite = await settleMobileTaskSubmit(async () => ({
      ...accepted,
      duplicate: true,
      outcome: 'not_completed',
      completed: false,
    }))
    expect(opposite).toMatchObject({
      success: true,
      duplicate: true,
      outcome: 'not_completed',
      completed: false,
    })
  })

  it('does not treat a thrown submit as success', async () => {
    const settled = await settleMobileTaskSubmit(async () => {
      throw new Error('Task attempt is no longer active')
    })
    expect(settled).toEqual({
      success: false,
      outcome: null,
      completed: null,
      duplicate: false,
    })
  })

  it('copies the accepted outcome onto the local task before the next save', () => {
    const task = {
      taskObservations: 'kept',
      susAnswers: [1],
      taskTime: 99,
    }
    applyAcceptedOutcome(task, resolveDisplayedOutcome(accepted))
    expect(task).toEqual({
      taskObservations: 'kept',
      susAnswers: [1],
      completed: true,
      attempted: true,
      startedAt: 1000,
      endedAt: 5000,
      taskTime: 4000,
      participationMode: 'mobile-task-instructions',
    })
    const untouched = { taskObservations: 'kept', attempted: false }
    applyAcceptedOutcome(untouched, resolveDisplayedOutcome(null))
    expect(untouched).toEqual({ taskObservations: 'kept', attempted: false })
  })

  it('limits this mode to task indexes 0 through 15 and RTDB presence', () => {
    const token = 'ab'.repeat(32)
    expect(mobileTaskId({ id: 'task-a' }, 2)).toBe('task-a')
    expect(mobileTaskId({}, 2)).toBe('2')
    expect(isMobileTaskIndexEligible(0)).toBe(true)
    expect(isMobileTaskIndexEligible(15)).toBe(true)
    expect(isMobileTaskIndexEligible(16)).toBe(false)
    expect(isPhoneConnected(true)).toBe(true)
    expect(isPhoneConnected(false)).toBe(false)
    expect(isPhoneConnected(null)).toBe(false)
    expect(mobileTaskLivePath(token)).toBe(`mobileTaskLive/${token}`)
    expect(mobileTaskLivePath('short')).toBe('')
    expect(mobileTaskLiveConnectedPath(token)).toBe(
      `mobileTaskLive/${token}/connected`,
    )
    expect(mobileTaskLiveConnectedPath('short')).toBe('')
  })

  it('builds the live task payload the phone renders immediately', () => {
    const attemptId = createMobileTaskAttemptId(() => new Uint8Array(16).fill(0xab))
    expect(attemptId).toBe('ab'.repeat(16))
    expect(
      buildMobileTaskLivePayload({
        state: 'active',
        taskIndex: 1,
        taskId: 'task-b',
        attemptId,
        title: 'Checkout',
        description: 'Pay',
        updatedAt: 20,
      }),
    ).toEqual({
      state: 'active',
      updatedAt: 20,
      taskNumber: 2,
      title: 'Checkout',
      description: 'Pay',
      taskIndex: 1,
      taskId: 'task-b',
      attemptId,
    })
    expect(buildMobileTaskLivePayload({ state: 'completed', updatedAt: 30 })).toEqual({
      state: 'completed',
      updatedAt: 30,
    })
    expect(
      buildMobileTaskLivePayload({
        state: 'active',
        taskIndex: 0,
        taskId: 'task-a',
        attemptId: 'attempt-1',
        updatedAt: 1,
      }),
    ).toBeNull()
    expect(
      mobileTaskLiveUpdate({ state: 'waiting', updatedAt: 30 }),
    ).toEqual({
      state: 'waiting',
      updatedAt: 30,
      taskNumber: null,
      title: null,
      description: null,
      taskIndex: null,
      taskId: null,
      attemptId: null,
    })
    expect(
      mobileTaskLiveUpdate({
        state: 'active',
        updatedAt: 20,
        taskNumber: 2,
        title: 'Checkout',
        description: 'Pay',
        taskIndex: 1,
        taskId: 'task-b',
        attemptId,
      }),
    ).toEqual({
      state: 'active',
      updatedAt: 20,
      taskNumber: 2,
      title: 'Checkout',
      description: 'Pay',
      taskIndex: 1,
      taskId: 'task-b',
      attemptId,
    })
  })

  it('keeps the phone paired while the realtime node is still missing', () => {
    const waiting = { state: 'waiting' }
    expect(resolveMobileTaskChannel({ rtdb: undefined })).toEqual({
      status: 'loading',
    })
    expect(
      resolveMobileTaskChannel({ rtdb: { connected: true } }),
    ).toEqual({ status: 'payload', payload: { state: 'waiting' } })
    expect(resolveMobileTaskChannel({ rtdb: waiting })).toEqual({
      status: 'payload',
      payload: waiting,
    })
    expect(
      resolveMobileTaskChannel({
        rtdb: { state: 'active', title: 'Find the price', connected: true },
      }),
    ).toEqual({
      status: 'payload',
      payload: { state: 'active', title: 'Find the price', connected: true },
    })
    expect(resolveMobileTaskChannel({ rtdb: null })).toEqual({
      status: 'payload',
      payload: { state: 'waiting' },
    })
    expect(
      resolveMobileTaskChannel({ rtdb: null, sawPayload: true }),
    ).toEqual({ status: 'ended' })
    expect(
      resolveMobileTaskChannel({ rtdb: null, rtdbFailed: true }),
    ).toEqual({ status: 'disconnected' })
  })

  it('builds the phone pairing path from study, participant and token', () => {
    expect(mobileTaskPairingPath({})).toBe('')
    expect(
      mobileTaskPairingPath({
        studyId: 'study-1',
        participantUid: 'user-1',
        token: 'ab'.repeat(32),
      }),
    ).toBe(`/mobile-task/study-1/user-1/${'ab'.repeat(32)}`)
  })
})
