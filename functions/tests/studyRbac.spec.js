import { jest } from '@jest/globals'

const serverTimestamp = jest.fn(() => 'server-time')

jest.unstable_mockModule('../src/f.firebase.js', () => ({
  admin: {
    firestore: Object.assign(jest.fn(), {
      FieldValue: { serverTimestamp, delete: jest.fn() },
    }),
    storage: jest.fn(),
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

const { authorizeStudyUpdate } = await import(
  '../src/https/studyUpdate.js'
)
const { assertStorageDeletionAllowed } = await import(
  '../src/https/studyStorage.js'
)
const { writeAuditEvent } = await import('../src/utils/auditTrail.js')

const study = {
  testType: 'USER',
  testAdmin: { userDocId: 'owner' },
  cooperators: [
    { userDocId: 'admin', accessLevel: 0, accepted: true },
    { userDocId: 'manager', accessLevel: 4, accepted: true },
  ],
}

describe('trusted study RBAC operations', () => {
  it('lets Managers edit content but not settings or protected fields', () => {
    const result = authorizeStudyUpdate({
      current: { ...study, testTitle: 'Old', isPublic: false },
      requestedUpdates: {
        testTitle: 'New',
        testAdmin: { userDocId: 'attacker' },
      },
      uid: 'manager',
    })
    expect(result.updates).toEqual({ testTitle: 'New' })
    expect(result.changedFields).toEqual(['testTitle'])

    expect(() =>
      authorizeStudyUpdate({
        current: { ...study, isPublic: false },
        requestedUpdates: { isPublic: true },
        uid: 'manager',
      }),
    ).toThrow(expect.objectContaining({ code: 'permission-denied' }))
  })

  it('allows storage deletion only for an owner, SuperAdmin, or study Admin', () => {
    expect(() =>
      assertStorageDeletionAllowed({ study, uid: 'admin' }),
    ).not.toThrow()
    expect(() =>
      assertStorageDeletionAllowed({ study, uid: 'manager' }),
    ).toThrow(expect.objectContaining({ code: 'permission-denied' }))
  })

  it('writes immutable server-timestamped audit data through a transaction', () => {
    const auditRef = { id: 'event-1' }
    const studyRef = {
      collection: jest.fn(() => ({ doc: jest.fn(() => auditRef) })),
    }
    const transaction = { set: jest.fn() }

    writeAuditEvent(transaction, studyRef, {
      action: 'study.edited',
      actorId: 'manager',
      target: 'study-1',
      details: { changedFields: ['testTitle'] },
    })

    expect(transaction.set).toHaveBeenCalledWith(auditRef, {
      action: 'study.edited',
      actorId: 'manager',
      target: 'study-1',
      details: { changedFields: ['testTitle'] },
      timestamp: 'server-time',
    })
  })
})
