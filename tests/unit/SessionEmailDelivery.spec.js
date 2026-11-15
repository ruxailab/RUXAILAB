import Session from '@/shared/store/Session'
import EmailController from '@/shared/controllers/EmailController'
import SessionController from '@/shared/controllers/SessionController'

jest.mock('@/shared/controllers/EmailController', () => jest.fn())
jest.mock('@/shared/controllers/SessionController', () => jest.fn())

const getters = {
  user: { username: 'Owner', email: 'owner@example.test' },
  test: { id: 'study-1', testType: 'USER' },
}

// EmailController.send() never throws; a failure is { success: false }.
const failEmailsTo = (...failing) => {
  const send = jest.fn(async ({ to }) =>
    failing.includes(to)
      ? { success: false, message: 'Request failed with status code 500' }
      : { success: true },
  )
  EmailController.mockImplementation(() => ({ send }))
  return send
}

const members = [
  {
    email: 'ana@example.test',
    userDocId: 'user-1',
    membershipType: 'cooperator',
  },
  { email: 'ben@example.test', userDocId: null, membershipType: 'participant' },
]

describe('Session store email delivery', () => {
  it('returns the session invitation emails that were not sent', async () => {
    failEmailsTo('ben@example.test')
    const dispatch = jest.fn()

    const result = await Session.actions.notifySessionMembers(
      { getters, dispatch },
      {
        session: { id: 'session-1', title: 'Kickoff', message: '' },
        members,
        studyId: 'study-1',
        studyTitle: 'Checkout',
        studyDescription: '',
        scheduledAt: '15 November 2026, 15:00',
      },
    )

    expect(result).toEqual({ failedEmails: ['ben@example.test'] })
    // The in-app notification still reaches the registered member.
    expect(dispatch).toHaveBeenCalledWith(
      'addNotification',
      expect.objectContaining({ userId: 'user-1' }),
    )
  })

  it('returns no failed emails when every email is sent', async () => {
    failEmailsTo()

    const result = await Session.actions.notifySessionMembers(
      { getters, dispatch: jest.fn() },
      {
        session: { id: 'session-1', title: 'Kickoff', message: '' },
        members,
        studyId: 'study-1',
      },
    )

    expect(result).toEqual({ failedEmails: [] })
  })

  it('returns the session message emails that were not sent', async () => {
    failEmailsTo('ana@example.test', 'ben@example.test')

    const result = await Session.actions.sendMessageSessionMembers(
      {
        state: {
          sessions: [
            {
              id: 'session-1',
              title: 'Kickoff',
              staff: [members[0]],
              participants: [members[1]],
            },
          ],
        },
        getters,
        dispatch: jest.fn(),
        commit: jest.fn(),
      },
      {
        studyId: 'study-1',
        sessionId: 'session-1',
        recipientType: 'ALL',
        message: 'See you soon',
      },
    )

    expect(result.failedEmails.sort()).toEqual([
      'ana@example.test',
      'ben@example.test',
    ])
  })

  it('passes failed invitation emails back from createSession', async () => {
    const session = {
      id: 'session-1',
      title: 'Kickoff',
      staff: [],
      participants: [],
    }
    SessionController.mockImplementation(() => ({
      createSession: jest.fn().mockResolvedValue({ success: true, session }),
    }))
    const dispatch = jest.fn(async (action) =>
      action === 'notifySessionMembers'
        ? { failedEmails: ['ben@example.test'] }
        : undefined,
    )

    const result = await Session.actions.createSession(
      { commit: jest.fn(), dispatch },
      {
        studyId: 'study-1',
        study: { testTitle: 'Checkout', testDescription: '' },
        session: { title: 'Kickoff', scheduledAt: new Date().toISOString() },
      },
    )

    expect(result).toEqual({ session, failedEmails: ['ben@example.test'] })
  })
})
