import { jest } from '@jest/globals'

// Mutable fixture state shared with the mocked Firebase Admin.
const state = {
  studyExists: false,
  study: {},
  actorExists: true,
  actor: { accessLevel: 0 },
}

const getMock = jest.fn(() =>
  Promise.resolve({ empty: true, docs: [] }),
)
const limitMock = jest.fn(() => ({ get: getMock }))
const whereMock = jest.fn(() => ({ limit: limitMock }))

const makeSnap = (exists, data) => ({
  exists,
  data: () => data,
})

const collectionMock = jest.fn((name) => ({
  doc: jest.fn((id) => ({
    get: jest.fn(async () => {
      if (name === 'tests') return makeSnap(state.studyExists, state.study)
      if (name === 'users') return makeSnap(state.actorExists, state.actor)
      return makeSnap(false, null)
    }),
    collection: jest.fn(() => ({ get: async () => ({ empty: true, docs: [] }) })),
  })),
  where: whereMock,
  get: getMock,
  doc: jest.fn((id) => ({
    get: jest.fn(async () => {
      if (name === 'tests') return makeSnap(state.studyExists, state.study)
      if (name === 'users') return makeSnap(state.actorExists, state.actor)
      return makeSnap(false, null)
    }),
  })),
}))

const firestoreMock = jest.fn(() => ({
  collection: collectionMock,
  FieldValue: {
    serverTimestamp: jest.fn(() => 'ts'),
    delete: jest.fn(),
    arrayUnion: jest.fn((x) => x),
    increment: jest.fn((x) => x),
  },
}))

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: {
    firestore: Object.assign(firestoreMock, {
      FieldValue: {
        serverTimestamp: jest.fn(() => 'ts'),
        delete: jest.fn(),
        arrayUnion: jest.fn((x) => x),
        increment: jest.fn((x) => x),
      },
    }),
    storage: jest.fn(),
    auth: jest.fn(() => ({})),
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

const generateInviteLinkMock = jest.fn().mockResolvedValue({
  inviteLink: 'https://example.com/invite/abc',
  inviteToken: 'abc',
  expirationDate: 1700000000000,
})

jest.unstable_mockModule('../src/utils/inviteUtils.js', () => ({
  default: {
    generateInviteLink: generateInviteLinkMock,
    isAccepted: jest.fn(() => false),
    createMembership: jest.fn(),
  },
  INVITE_STATUS: {
    ACCEPTED: 'accepted',
    PENDING: 'pending',
    REJECTED: 'rejected',
  },
}))

const { isAcceptedInviteRetry, validateInvite, generateInvitationLink } = await import(
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

describe('generateInvitationLink authentication and authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    state.studyExists = false
    state.study = {}
    state.actorExists = true
    state.actor = { accessLevel: 0 }
    generateInviteLinkMock.mockClear()
    generateInviteLinkMock.mockResolvedValue({
      inviteLink: 'https://example.com/invite/abc',
      inviteToken: 'abc',
      expirationDate: 1700000000000,
    })
  })

  it('rejects with invalid-argument when studyId and accessLevel are missing', async () => {
    await expect(
      generateInvitationLink({ data: {}, auth: { uid: 'actor-1' } }),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })

  it('rejects with invalid-argument when a private invite has no recipient email', async () => {
    await expect(
      generateInvitationLink({
        data: {
          studyId: 'study-1',
          accessLevel: 1,
          isPublic: false,
        },
        auth: { uid: 'actor-1' },
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })

  it('rejects an unauthenticated caller with unauthenticated', async () => {
    await expect(
      generateInvitationLink({
        data: { studyId: 'study-1', accessLevel: 1, isPublic: true },
        auth: undefined,
      }),
    ).rejects.toMatchObject({ code: 'unauthenticated' })
  })

  it('rejects an unknown study with not-found', async () => {
    state.studyExists = false
    await expect(
      generateInvitationLink({
        data: { studyId: 'missing', accessLevel: 1, isPublic: true },
        auth: { uid: 'actor-1' },
      }),
    ).rejects.toMatchObject({ code: 'not-found' })
  })

  it('does not generate a link for an unknown study', async () => {
    state.studyExists = false
    try {
      await generateInvitationLink({
        data: { studyId: 'missing', accessLevel: 1, isPublic: true },
        auth: { uid: 'actor-1' },
      })
    } catch (error) {}
    expect(generateInviteLinkMock).not.toHaveBeenCalled()
  })

  it('allows an authorized super-admin to generate a public link', async () => {
    state.studyExists = true
    state.study = {
      testType: 'USER',
      testAdmin: { userDocId: 'owner-1' },
      cooperators: [],
    }
    state.actorExists = true
    state.actor = { accessLevel: 0 }

    const result = await generateInvitationLink({
      data: {
        studyId: 'study-1',
        accessLevel: 5,
        isPublic: true,
        studyTitle: 'Test study',
      },
      auth: { uid: 'super-admin-uid' },
    })

    expect(result).toEqual(
      expect.objectContaining({
        inviteLink: 'https://example.com/invite/abc',
        inviteToken: 'abc',
      }),
    )
    expect(generateInviteLinkMock).toHaveBeenCalled()
  })
})
