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

const { assertMembershipMutationAllowed } = await import(
  '../src/https/studyMembership.js'
)

const study = (testType, actorRole) => ({
  testType,
  testAdmin: { userDocId: 'owner' },
  cooperators: [
    { userDocId: 'actor', accessLevel: actorRole, accepted: true },
  ],
})

describe('study membership authorization', () => {
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
})
