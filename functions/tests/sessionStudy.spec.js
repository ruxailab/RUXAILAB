import { jest } from '@jest/globals'

let mockStudy
let mockSession
const mockStudyGet = jest.fn(async () => ({
  id: 'study-1',
  exists: Boolean(mockStudy),
  data: () => mockStudy,
}))
const mockSessionUpdate = jest.fn(async () => {})
const mockSessionGet = jest.fn(async () => ({
  id: 'session-1',
  exists: Boolean(mockSession),
  data: () => mockSession,
}))

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: {
    firestore: Object.assign(() => ({
      collection: () => ({
        doc: () => ({
          get: mockStudyGet,
          collection: () => ({
            doc: () => ({ get: mockSessionGet, update: mockSessionUpdate }),
          }),
        }),
      }),
    }), { FieldValue: { serverTimestamp: () => 'SERVER_TIMESTAMP' } }),
  },
  functions: {
    onCall: jest.fn((options) => options.handler),
    https: {
      HttpsError: class HttpsError extends Error {
        constructor(code, message) {
          super(message)
          this.code = code
        }
      },
    },
  },
}))

const {
  getStudyForSession,
  isStudySessionMember,
  markFocusGroupSessionEnded,
} =
  await import('../src/https/sessionStudy.js')

describe('session-scoped study access', () => {
  beforeEach(() => {
    mockStudy = {
      testType: 'FOCUS_GROUP',
      testAdmin: { userDocId: 'owner' },
      studyRoleMap: {},
      testType: 'FOCUS_GROUP',
    }
    mockSession = {
      participantIds: ['participant-1'],
      staffEmails: ['observer@example.com'],
      staff: [
        { userDocId: 'facilitator-1', role: 'FACILITATOR' },
        { email: 'facilitator@example.com', role: 'FACILITATOR' },
      ],
    }
    mockStudyGet.mockClear()
    mockSessionGet.mockClear()
    mockSessionUpdate.mockClear()
  })

  it('allows an attendee listed by user id or email', () => {
    expect(
      isStudySessionMember({
        study: mockStudy,
        session: mockSession,
        uid: 'participant-1',
      }),
    ).toBe(true)
    expect(
      isStudySessionMember({
        study: mockStudy,
        session: mockSession,
        uid: 'observer',
        email: 'Observer@Example.com',
      }),
    ).toBe(true)
  })

  it('allows existing study members and the owner', () => {
    expect(
      isStudySessionMember({
        study: { ...mockStudy, studyRoleMap: { observer: 3 } },
        session: {},
        uid: 'observer',
      }),
    ).toBe(true)
    expect(
      isStudySessionMember({ study: mockStudy, session: {}, uid: 'owner' }),
    ).toBe(true)
  })

  it('denies users who are not members of the session or study', () => {
    expect(
      isStudySessionMember({
        study: mockStudy,
        session: mockSession,
        uid: 'stranger',
        email: 'stranger@example.com',
      }),
    ).toBe(false)
  })

  it('returns study data only after confirming scheduled-session membership', async () => {
    const result = await getStudyForSession({
      auth: { uid: 'participant-1', token: {} },
      data: { studyId: 'study-1', sessionId: 'session-1' },
    })

    expect(result.study).toEqual({ id: 'study-1', ...mockStudy })
    expect(mockStudyGet).toHaveBeenCalledTimes(1)
    expect(mockSessionGet).toHaveBeenCalledTimes(1)
  })

  it('rejects a caller outside the scheduled-session roster', async () => {
    await expect(
      getStudyForSession({
        auth: { uid: 'stranger', token: { email: 'stranger@example.com' } },
        data: { studyId: 'study-1', sessionId: 'session-1' },
      }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
  })

  it('requires authentication and both ids', async () => {
    await expect(
      getStudyForSession({ data: { studyId: 'study-1', sessionId: 'session-1' } }),
    ).rejects.toMatchObject({ code: 'unauthenticated' })
    await expect(
      getStudyForSession({
        auth: { uid: 'participant-1' },
        data: { studyId: 'study-1' },
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })

  it('lets the scheduled facilitator mark the Focus Group as ended', async () => {
    await expect(
      markFocusGroupSessionEnded({
        auth: { uid: 'facilitator-1', token: {} },
        data: { studyId: 'study-1', sessionId: 'session-1' },
      }),
    ).resolves.toEqual({ success: true })
    expect(mockSessionUpdate).toHaveBeenCalledWith({
      lifecycleStatus: 'ended',
      endedAt: 'SERVER_TIMESTAMP',
    })
  })

  it('allows the scheduled facilitator to be matched by email', async () => {
    await expect(
      markFocusGroupSessionEnded({
        auth: { uid: 'facilitator-2', token: { email: 'FACILITATOR@example.com' } },
        data: { studyId: 'study-1', sessionId: 'session-1' },
      }),
    ).resolves.toEqual({ success: true })
  })

  it('does not allow participants or observers to mark a session ended', async () => {
    await expect(
      markFocusGroupSessionEnded({
        auth: { uid: 'participant-1', token: {} },
        data: { studyId: 'study-1', sessionId: 'session-1' },
      }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(
      markFocusGroupSessionEnded({
        auth: { uid: 'observer-1', token: { email: 'observer@example.com' } },
        data: { studyId: 'study-1', sessionId: 'session-1' },
      }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    expect(mockSessionUpdate).not.toHaveBeenCalled()
  })
})
