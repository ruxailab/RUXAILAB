import { jest } from '@jest/globals'

const getMock = jest.fn()
const limitMock = jest.fn(() => ({ get: getMock }))
const whereMock = jest.fn(() => ({ limit: limitMock }))

const studyGetMock = jest.fn()
const userGetMock = jest.fn()

const docMock = (collectionName) =>
  jest.fn((id) => ({
    get: collectionName === 'tests' ? studyGetMock : userGetMock,
  }))

const collectionMock = jest.fn((name) => ({
  where: whereMock,
  doc: docMock(name),
}))
const firestoreMock = jest.fn(() => ({ collection: collectionMock }))

const generateInviteLinkMock = jest.fn()

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
  default: {
    generateInviteLink: generateInviteLinkMock,
  },
}))

const { isAcceptedInviteRetry, validateInvite, generateInvitationLink } =
  await import('../src/https/invite.js')

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

  describe('generateInvitationLink', () => {
    const studyDoc = {
      testType: 'USER',
      testTitle: 'Test Study',
      testAdmin: { userDocId: 'owner-uid' },
      cooperators: [
        { userDocId: 'admin-coop', accessLevel: 0, accepted: true },
        { userDocId: 'manager-uid', accessLevel: 4, accepted: true },
        { userDocId: 'evaluator-uid', accessLevel: 1, accepted: true },
      ],
      studyRoleMap: {},
    }

    beforeEach(() => {
      jest.clearAllMocks()
      studyGetMock.mockResolvedValue({
        exists: true,
        id: 'study-1',
        data: () => ({ ...studyDoc }),
      })
      userGetMock.mockResolvedValue({
        exists: true,
        data: () => ({ accessLevel: 1 }),
      })
      generateInviteLinkMock.mockResolvedValue({
        inviteLink: 'https://example.com/invite?token=mock-token',
        inviteToken: 'mock-token',
        expirationDate: 123456789,
      })
    })

    it('rejects unauthenticated requests immediately with unauthenticated', async () => {
      await expect(
        generateInvitationLink({
          data: {
            studyId: 'study-1',
            accessLevel: 0,
            isPublic: true,
          },
        }),
      ).rejects.toMatchObject({
        code: 'unauthenticated',
        message: 'Authentication is required',
      })
    })

    it('rejects missing required fields with invalid-argument', async () => {
      await expect(
        generateInvitationLink({
          auth: { uid: 'owner-uid' },
          data: {
            accessLevel: 0,
          },
        }),
      ).rejects.toMatchObject({
        code: 'invalid-argument',
      })
    })

    it('rejects private invites without recipient email with invalid-argument', async () => {
      await expect(
        generateInvitationLink({
          auth: { uid: 'owner-uid' },
          data: {
            studyId: 'study-1',
            accessLevel: 0,
            isPublic: false,
          },
        }),
      ).rejects.toMatchObject({
        code: 'invalid-argument',
      })
    })

    it('rejects non-existent studies with not-found', async () => {
      studyGetMock.mockResolvedValue({ exists: false })

      await expect(
        generateInvitationLink({
          auth: { uid: 'owner-uid' },
          data: {
            studyId: 'non-existent',
            accessLevel: 0,
            isPublic: true,
          },
        }),
      ).rejects.toMatchObject({
        code: 'not-found',
        message: 'Study not found',
      })
    })

    it('rejects callers who are not study owner, admin, or manager with permission-denied', async () => {
      await expect(
        generateInvitationLink({
          auth: { uid: 'evaluator-uid' },
          data: {
            studyId: 'study-1',
            accessLevel: 5,
            isPublic: true,
          },
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
        message: 'Study invitation is not permitted',
      })

      await expect(
        generateInvitationLink({
          auth: { uid: 'stranger-uid' },
          data: {
            studyId: 'study-1',
            accessLevel: 5,
            isPublic: true,
          },
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
        message: 'Study invitation is not permitted',
      })
    })

    it('rejects a Manager attempting to generate an Admin invite link with permission-denied', async () => {
      await expect(
        generateInvitationLink({
          auth: { uid: 'manager-uid' },
          data: {
            studyId: 'study-1',
            accessLevel: 0,
            isPublic: true,
          },
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
        message: 'The assigned role is not permitted',
      })
    })

    it('rejects a Manager attempting to generate another Manager invite link with permission-denied', async () => {
      await expect(
        generateInvitationLink({
          auth: { uid: 'manager-uid' },
          data: {
            studyId: 'study-1',
            accessLevel: 4,
            isPublic: true,
          },
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
        message: 'The assigned role is not permitted',
      })
    })

    it('rejects invalid or unassignable role values with permission-denied', async () => {
      await expect(
        generateInvitationLink({
          auth: { uid: 'owner-uid' },
          data: {
            studyId: 'study-1',
            accessLevel: 99,
            isPublic: true,
          },
        }),
      ).rejects.toMatchObject({
        code: 'permission-denied',
        message: 'The assigned role is not permitted',
      })
    })

    it('allows a Manager to generate an invitation link for permitted roles', async () => {
      const result = await generateInvitationLink({
        auth: { uid: 'manager-uid' },
        data: {
          studyId: 'study-1',
          accessLevel: 5,
          isPublic: true,
        },
      })

      expect(result).toEqual({
        inviteLink: 'https://example.com/invite?token=mock-token',
        inviteToken: 'mock-token',
        expirationDate: 123456789,
      })

      expect(generateInviteLinkMock).toHaveBeenCalledWith(
        'study-1',
        null,
        'Test Study',
        true,
        5,
        undefined,
        undefined,
      )
    })

    it('allows an owner/Admin to generate invitation links for any supported role', async () => {
      const result = await generateInvitationLink({
        auth: { uid: 'owner-uid' },
        data: {
          studyId: 'study-1',
          accessLevel: 0,
          isPublic: true,
          studyTitle: 'Custom Title',
        },
      })

      expect(result).toEqual({
        inviteLink: 'https://example.com/invite?token=mock-token',
        inviteToken: 'mock-token',
        expirationDate: 123456789,
      })

      expect(generateInviteLinkMock).toHaveBeenCalledWith(
        'study-1',
        null,
        'Custom Title',
        true,
        0,
        undefined,
        undefined,
      )
    })

    it('allows a SuperAdmin to generate invitation links even if not a direct study member', async () => {
      userGetMock.mockResolvedValue({
        exists: true,
        data: () => ({ accessLevel: 0 }),
      })

      const result = await generateInvitationLink({
        auth: { uid: 'superadmin-uid' },
        data: {
          studyId: 'study-1',
          accessLevel: 4,
          isPublic: true,
        },
      })

      expect(result.inviteToken).toBe('mock-token')
      expect(generateInviteLinkMock).toHaveBeenCalledWith(
        'study-1',
        null,
        'Test Study',
        true,
        4,
        undefined,
        undefined,
      )
    })
  })
})
