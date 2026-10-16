import { jest } from '@jest/globals'

const serverTimestamp = jest.fn(() => 'server-time')

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
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

const { authorizeStudyUpdate, buildStudyAuditDetails } =
  await import('../src/https/studyUpdate.js')
const { assertStorageDeletionAllowed } =
  await import('../src/https/studyStorage.js')
const { assertSummaryExportAllowed } =
  await import('../src/https/studySummary.js')
const { resolveStudyRole, ROLE } =
  await import('../src/shared/auth/studyAccess.js')
const { buildAuditEvent, writeAuditEvent } =
  await import('../src/utils/auditTrail.js')

const study = {
  testType: 'USER',
  testAdmin: { userDocId: 'owner' },
  cooperators: [
    { userDocId: 'admin', accessLevel: 0, accepted: true },
    { userDocId: 'manager', accessLevel: 4, accepted: true },
    { userDocId: 'evaluator', accessLevel: 1, accepted: true },
  ],
}

const modernStudy = {
  testType: 'USER',
  testAdmin: { userDocId: 'owner' },
  studyRoleMap: {
    admin: 0,
    manager: 4,
    evaluator: 1,
  },
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

  it('supports modern studyRoleMap studies for update, storage, and summary export', () => {
    const updateResult = authorizeStudyUpdate({
      current: { ...modernStudy, testTitle: 'Old Title', isPublic: false },
      requestedUpdates: { testTitle: 'Updated Title' },
      uid: 'manager',
    })
    expect(updateResult.updates).toEqual({ testTitle: 'Updated Title' })

    expect(() =>
      assertStorageDeletionAllowed({ study: modernStudy, uid: 'admin' }),
    ).not.toThrow()
    expect(() =>
      assertStorageDeletionAllowed({ study: modernStudy, uid: 'manager' }),
    ).toThrow(expect.objectContaining({ code: 'permission-denied' }))

    expect(() =>
      assertSummaryExportAllowed(modernStudy, 'manager', false),
    ).not.toThrow()
    expect(() =>
      assertSummaryExportAllowed(modernStudy, 'unauthorized', false),
    ).toThrow(expect.objectContaining({ code: 'permission-denied' }))
  })

  it('resolves roles equivalently between modern studyRoleMap and legacy cooperators', () => {
    // SuperAdmin
    expect(resolveStudyRole(modernStudy, 'any-uid', true)).toBe(ROLE.ADMIN)
    expect(resolveStudyRole(study, 'any-uid', true)).toBe(ROLE.ADMIN)

    // Owner
    expect(resolveStudyRole(modernStudy, 'owner', false)).toBe(ROLE.ADMIN)
    expect(resolveStudyRole(study, 'owner', false)).toBe(ROLE.ADMIN)

    // Admin
    expect(resolveStudyRole(modernStudy, 'admin', false)).toBe(ROLE.ADMIN)
    expect(resolveStudyRole(study, 'admin', false)).toBe(ROLE.ADMIN)

    // Manager
    expect(resolveStudyRole(modernStudy, 'manager', false)).toBe(ROLE.MANAGER)
    expect(resolveStudyRole(study, 'manager', false)).toBe(ROLE.MANAGER)

    // Evaluator
    expect(resolveStudyRole(modernStudy, 'evaluator', false)).toBe(ROLE.EVALUATOR)
    expect(resolveStudyRole(study, 'evaluator', false)).toBe(ROLE.EVALUATOR)

    // Unauthorized
    expect(resolveStudyRole(modernStudy, 'stranger', false)).toBeNull()
    expect(resolveStudyRole(study, 'stranger', false)).toBeNull()
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
      actorEmail: 'manager@example.com',
      target: 'study-1',
      targetLabel: 'Checkout usability study',
      targetType: 'study',
      details: { changedFields: ['testTitle'] },
    })

    expect(transaction.set).toHaveBeenCalledWith(auditRef, {
      action: 'study.edited',
      actorId: 'manager',
      actorEmail: 'manager@example.com',
      target: 'study-1',
      targetLabel: 'Checkout usability study',
      targetType: 'study',
      details: { changedFields: ['testTitle'] },
      timestamp: 'server-time',
    })
  })

  it('omits optional audit display fields when no readable labels are available', () => {
    expect(
      buildAuditEvent({
        action: 'storage.fileDeleted',
        actorId: 'admin',
        target: 'tests/study-1/file.webm',
      }),
    ).toEqual({
      action: 'storage.fileDeleted',
      actorId: 'admin',
      target: 'tests/study-1/file.webm',
      details: {},
      timestamp: 'server-time',
    })
  })

  it('builds readable study audit details without storing large objects', () => {
    expect(
      buildStudyAuditDetails({
        current: {
          testTitle: 'Old title',
          testDescription: 'Old description',
          isPublic: true,
          testStructure: [{ task: 'old' }],
        },
        requestedUpdates: {
          testTitle: 'New title',
          testDescription: 'New description',
          isPublic: false,
          testStructure: [{ task: 'new' }],
        },
        changedFields: [
          'testTitle',
          'testDescription',
          'isPublic',
          'testStructure',
        ],
      }),
    ).toEqual({
      changedFields: [
        'testTitle',
        'testDescription',
        'isPublic',
        'testStructure',
      ],
      changes: {
        testTitle: { before: 'Old title', after: 'New title' },
        testDescription: {
          before: 'Old description',
          after: 'New description',
        },
        isPublic: { before: true, after: false },
        testStructure: { changed: true },
      },
    })
  })
})
