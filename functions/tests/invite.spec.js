import { jest } from '@jest/globals'

const getMock = jest.fn()
const limitMock = jest.fn(() => ({ get: getMock }))
const whereMock = jest.fn(() => ({ limit: limitMock }))
const collectionMock = jest.fn(() => ({ where: whereMock }))
const firestoreMock = jest.fn(() => ({ collection: collectionMock }))

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: { firestore: firestoreMock },
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

jest.unstable_mockModule('../src/utils/inviteUtils.js', () => ({
  default: {},
}))

const { isAcceptedInviteRetry, validateInvite } = await import(
  '../src/https/invite.js'
)

describe('accepted invitation retries', () => {
  const acceptedInvite = {
    isPublic: false,
    acceptedAt: { toMillis: () => Date.now() },
    acceptedBy: 'invitee-uid',
  }

  it('allows the account that already accepted to retry membership completion', () => {
    expect(
      isAcceptedInviteRetry(acceptedInvite, 'invitee-uid', 'invitee-uid'),
    ).toBe(true)
  })

  it('does not allow another account to reuse an accepted private invite', () => {
    expect(
      isAcceptedInviteRetry(acceptedInvite, 'other-uid', 'other-uid'),
    ).toBe(false)
    expect(
      isAcceptedInviteRetry(acceptedInvite, 'invitee-uid', 'other-uid'),
    ).toBe(false)
  })

  it('does not treat public or unaccepted invites as retries', () => {
    expect(
      isAcceptedInviteRetry(
        { ...acceptedInvite, isPublic: true },
        'invitee-uid',
        'invitee-uid',
      ),
    ).toBe(false)
    expect(
      isAcceptedInviteRetry(
        { ...acceptedInvite, acceptedAt: null },
        'invitee-uid',
        'invitee-uid',
      ),
    ).toBe(false)
  })

  describe('validateInvite', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      getMock.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'invite-1',
            data: () => ({
              ...acceptedInvite,
              expiresAt: { toMillis: () => Date.now() - 1000 },
              studyId: 'study-1',
              studyTitle: 'Test study',
              email: 'invitee@example.com',
              requiredLogin: true,
              membershipType: 'participant',
            }),
          },
        ],
      })
    })

    it('keeps retry dialog validation open for the authenticated original recipient', async () => {
      await expect(
        validateInvite({
          data: { token: 'invite-token' },
          auth: { uid: 'invitee-uid' },
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          valid: true,
          invite: expect.objectContaining({ studyId: 'study-1' }),
        }),
      )
    })

    it('does not validate an accepted invite for a different account', async () => {
      await expect(
        validateInvite({
          data: { token: 'invite-token' },
          auth: { uid: 'other-uid' },
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          valid: false,
        }),
      )
    })
  })
})
