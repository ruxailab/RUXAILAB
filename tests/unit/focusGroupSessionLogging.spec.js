import { logFocusGroupSessionEvent } from '@/ux/FocusGroup/utils/sessionLogging'

jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: { callHttpsCallableFunction: jest.fn() },
}))

describe('logFocusGroupSessionEvent', () => {
  it('sends only the study, scheduled session and event type', async () => {
    const callFunction = jest.fn(() =>
      Promise.resolve({ data: { status: 'accepted' } }),
    )

    await expect(
      logFocusGroupSessionEvent(
        {
          studyId: 'study-1',
          sessionId: 'scheduled-1',
          eventType: 'SESSION_STARTED',
          topic: 'Pricing page',
        },
        callFunction,
      ),
    ).resolves.toEqual({ status: 'accepted' })
    expect(callFunction).toHaveBeenCalledWith('requestLogEvent', {
      studyId: 'study-1',
      eventType: 'SESSION_STARTED',
      sessionRef: 'scheduled-1',
    })
  })

  it('skips the legacy open room and unknown events', async () => {
    const callFunction = jest.fn()
    await logFocusGroupSessionEvent(
      { studyId: 'study-1', sessionId: null, eventType: 'SESSION_STARTED' },
      callFunction,
    )
    await logFocusGroupSessionEvent(
      { studyId: 'study-1', sessionId: 'scheduled-1', eventType: 'TOPIC_CHANGED' },
      callFunction,
    )
    expect(callFunction).not.toHaveBeenCalled()
  })

  it('never throws into the session workflow', async () => {
    const rejected = jest.fn(() => Promise.reject(new Error('offline')))
    const thrown = jest.fn(() => {
      throw new Error('not initialised')
    })
    for (const callFunction of [rejected, thrown]) {
      await expect(
        logFocusGroupSessionEvent(
          {
            studyId: 'study-1',
            sessionId: 'scheduled-1',
            eventType: 'SESSION_ENDED',
          },
          callFunction,
        ),
      ).resolves.toBeNull()
    }
  })
})
