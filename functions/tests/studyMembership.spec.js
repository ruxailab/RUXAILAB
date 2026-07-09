import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/f.firebase.js', () => ({
  admin: {
    firestore: Object.assign(jest.fn(), {
      FieldValue: { delete: jest.fn() },
    }),
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
  assertMembershipMutationAllowed,
  assertValidInviteTarget,
  findMatchingPendingInvitation,
  resolveInviteTargetUserId,
} = await import('../src/https/studyMembership.js')

const study = (testType, actorRole) => ({
  testType,
  testAdmin: { userDocId: 'owner' },
  cooperators: [
    { userDocId: 'actor', accessLevel: actorRole, accepted: true },
  ],
})

describe('study membership authorization', () => {
  it('matches a pending invitation only to the invited account and token', () => {
    const invitedStudy = {
      cooperators: [
        {
          userDocId: 'invitee',
          email: 'invitee@example.com',
          token: 'invite-token',
          accepted: false,
        },
      ],
    }

    expect(
      findMatchingPendingInvitation(invitedStudy, {
        uid: 'invitee',
        email: 'invitee@example.com',
        token: 'invite-token',
      }),
    ).toEqual(expect.objectContaining({ userDocId: 'invitee' }))
    expect(
      findMatchingPendingInvitation(invitedStudy, {
        uid: 'forwarded-user',
        email: 'other@example.com',
        token: 'invite-token',
      }),
    ).toBeNull()
  })

  it('allows a user-study Manager to invite User and Observator only', () => {
    expect(() =>
      assertMembershipMutationAllowed({
        study: study('USER', 4),
        actorId: 'actor',
        action: 'invite',
        role: 5,
      }),
    ).not.toThrow()

    expect(() =>
      assertMembershipMutationAllowed({
        study: study('USER', 4),
        actorId: 'actor',
        action: 'invite',
        role: 4,
      }),
    ).toThrow(expect.objectContaining({ code: 'permission-denied' }))
  })

  it('prevents a Manager from changing or removing another Manager', () => {
    const managerStudy = study('USER', 4)
    const target = { userDocId: 'target', accessLevel: 4, accepted: true }

    expect(() =>
      assertMembershipMutationAllowed({
        study: managerStudy,
        actorId: 'actor',
        action: 'assignRole',
        target,
        role: 5,
      }),
    ).toThrow(expect.objectContaining({ code: 'permission-denied' }))
    expect(() =>
      assertMembershipMutationAllowed({
        study: managerStudy,
        actorId: 'actor',
        action: 'remove',
        target,
      }),
    ).toThrow(expect.objectContaining({ code: 'permission-denied' }))
  })

  it('allows an Admin to manage invited Admin memberships but not itself', () => {
    const adminStudy = study('HEURISTIC', 0)

    expect(() =>
      assertMembershipMutationAllowed({
        study: adminStudy,
        actorId: 'actor',
        action: 'remove',
        target: { userDocId: 'other-admin', accessLevel: 0, accepted: true },
      }),
    ).not.toThrow()
    expect(() =>
      assertMembershipMutationAllowed({
        study: adminStudy,
        actorId: 'actor',
        action: 'remove',
        target: { userDocId: 'actor', accessLevel: 0, accepted: true },
      }),
    ).toThrow(expect.objectContaining({ code: 'permission-denied' }))
  })

  it('validates invite targets server-side', () => {
    const ownedStudy = {
      testAdmin: { userDocId: 'owner', email: 'owner@example.com' },
    }

    expect(() =>
      assertValidInviteTarget({
        study: ownedStudy,
        actorId: 'actor',
        actorEmail: 'actor@example.com',
        targetUserId: 'target',
        targetEmail: 'target@example.com',
      }),
    ).not.toThrow()

    expect(() =>
      assertValidInviteTarget({
        study: ownedStudy,
        actorId: 'actor',
        actorEmail: 'actor@example.com',
        targetUserId: 'target',
        targetEmail: 'not-an-email',
      }),
    ).toThrow(expect.objectContaining({ code: 'invalid-argument' }))

    expect(() =>
      assertValidInviteTarget({
        study: ownedStudy,
        actorId: 'actor',
        actorEmail: 'actor@example.com',
        targetUserId: 'actor',
        targetEmail: 'actor@example.com',
      }),
    ).toThrow(expect.objectContaining({ code: 'permission-denied' }))

    expect(() =>
      assertValidInviteTarget({
        study: ownedStudy,
        actorId: 'actor',
        actorEmail: 'actor@example.com',
        targetUserId: 'owner',
        targetEmail: 'owner@example.com',
      }),
    ).toThrow(expect.objectContaining({ code: 'permission-denied' }))
  })

  it('resolves an email-only invite to an existing Firebase Auth user', async () => {
    const auth = {
      getUserByEmail: jest.fn().mockResolvedValue({ uid: 'registered-user' }),
    }

    await expect(
      resolveInviteTargetUserId({
        auth,
        targetUserId: null,
        targetEmail: ' Registered@Example.com ',
      }),
    ).resolves.toBe('registered-user')
    expect(auth.getUserByEmail).toHaveBeenCalledWith('registered@example.com')
  })

  it('keeps an unregistered invite email-only', async () => {
    const auth = {
      getUserByEmail: jest.fn().mockRejectedValue({
        code: 'auth/user-not-found',
      }),
    }

    await expect(
      resolveInviteTargetUserId({
        auth,
        targetUserId: null,
        targetEmail: 'external@example.com',
      }),
    ).resolves.toBeNull()
  })

  it('rejects a target user id that belongs to another email', async () => {
    const auth = {
      getUserByEmail: jest.fn().mockResolvedValue({ uid: 'registered-user' }),
    }

    await expect(
      resolveInviteTargetUserId({
        auth,
        targetUserId: 'different-user',
        targetEmail: 'registered@example.com',
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })
})
