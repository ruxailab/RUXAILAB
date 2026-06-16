import { jest } from '@jest/globals'

const mockCommit = jest.fn()
const mockBatchSet = jest.fn()
const mockBatchCreate = jest.fn()
const mockTestGet = jest.fn()
const mockLogDoc = jest.fn()
const mockBatchDoc = jest.fn()
const mockCollection = jest.fn()

const mockTestRef = {
  get: mockTestGet,
  collection: mockCollection,
}

const mockTestsCollection = {
  doc: jest.fn(() => mockTestRef),
}

const mockDb = {
  collection: jest.fn((name) => {
    if (name === 'tests') return mockTestsCollection
    return null
  }),
  batch: jest.fn(() => ({
    set: mockBatchSet,
    create: mockBatchCreate,
    commit: mockCommit,
  })),
}

jest.unstable_mockModule('../src/f.firebase.js', () => ({
  admin: {
    firestore: Object.assign(jest.fn(() => mockDb), {
      FieldValue: {
        serverTimestamp: jest.fn(() => 'mock-server-timestamp'),
      },
    }),
  },
  functions: {
    onCall: jest.fn((opts) => opts?.handler || opts),
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

jest.unstable_mockModule('../src/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

const { logEvents } = await import('../src/https/logEvents.js')

describe('logEvents.js -> logEvents', () => {
  const savedSalt = process.env.LOG_ACTOR_HASH_SALT

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.LOG_ACTOR_HASH_SALT = 'test-salt'

    mockCollection.mockImplementation((name) => {
      if (name === 'logs') {
        return { doc: mockLogDoc }
      }
      if (name === 'logBatches') {
        return { doc: mockBatchDoc }
      }
      return null
    })

    mockLogDoc.mockReturnValue({ path: 'tests/test-1/logs/generated-log-id' })
    mockBatchDoc.mockReturnValue({
      path: 'tests/test-1/logBatches/batch-1',
    })
    mockCommit.mockResolvedValue()
    mockTestGet.mockResolvedValue({
      exists: true,
      data: () => ({
        answersDocId: 'answers-1',
        testType: 'USER',
        subType: 'USER_UNMODERATED',
        testAdmin: { userDocId: 'admin-1' },
        cooperators: [{ userDocId: 'user-1', accessLevel: 'evaluator' }],
      }),
    })
  })

  afterEach(() => {
    if (savedSalt !== undefined) {
      process.env.LOG_ACTOR_HASH_SALT = savedSalt
    } else {
      delete process.env.LOG_ACTOR_HASH_SALT
    }
  })

  it('writes a validated log batch into a study logs subcollection', async () => {
    const result = await logEvents({
      auth: { uid: 'user-1' },
      data: {
        testId: 'test-1',
        answersDocId: 'answers-1',
        batchId: 'batch-1',
        clientTimestamp: '2026-06-12T00:00:00.000Z',
        sessionId: 'session-1',
        events: [
          {
            type: 'ANSWER_CHANGED',
            layer: 'methodological',
            level: 'info',
            source: 'client',
            traceId: 'H0-Q2',
            message: 'Answer changed by evaluator@example.com',
            details: {
              heuristicIndex: 0,
              questionIndex: 2,
              email: 'evaluator@example.com',
              fullName: 'Evaluator Name',
            },
          },
          {
            type: 'REVISION_PATTERN',
            layer: 'technical',
            level: 'warn',
            details: { changedFields: 4 },
          },
        ],
      },
    })

    expect(result).toEqual({
      status: 'ok',
      written: 2,
      batchId: 'batch-1',
    })
    expect(mockBatchSet).toHaveBeenCalledTimes(2)
    expect(mockBatchCreate).toHaveBeenCalledTimes(1)
    expect(mockCommit).toHaveBeenCalledTimes(1)

    const firstLog = mockBatchSet.mock.calls[0][1]
    expect(firstLog).toMatchObject({
      type: 'ANSWER_CHANGED',
      layer: 'methodological',
      level: 'info',
      source: 'client',
      traceId: 'H0-Q2',
      testId: 'test-1',
      answersDocId: 'answers-1',
      studyType: 'USER',
      subType: 'USER_UNMODERATED',
      actorRole: 'evaluator',
      actorType: 'cooperator',
      sessionId: 'session-1',
      batchId: 'batch-1',
      timestamp: 'mock-server-timestamp',
      schemaVersion: 1,
    })
    expect(firstLog.actorHash).toHaveLength(64)
    expect(firstLog.message).toBe('Answer changed by [redacted-email]')
    expect(firstLog.details.email).toBeUndefined()
    expect(firstLog.details.fullName).toBeUndefined()
  })

  it('skips duplicate batches when the idempotency marker already exists', async () => {
    mockCommit.mockRejectedValueOnce(
      Object.assign(new Error('document already exists'), { code: 6 }),
    )

    const result = await logEvents({
      auth: { uid: 'user-1' },
      data: {
        testId: 'test-1',
        batchId: 'batch-1',
        events: [
          {
            type: 'TASK_COMPLETED',
            layer: 'methodological',
            level: 'info',
          },
        ],
      },
    })

    expect(result).toEqual({
      status: 'duplicate',
      written: 0,
      batchId: 'batch-1',
    })
  })

  it('rejects unauthenticated callers', async () => {
    await expect(
      logEvents({
        data: {
          testId: 'test-1',
          batchId: 'batch-1',
          events: [
            {
              type: 'TASK_COMPLETED',
              layer: 'methodological',
              level: 'info',
            },
          ],
        },
      }),
    ).rejects.toMatchObject({ code: 'unauthenticated' })
  })

  it('rejects users who are not attached to the study', async () => {
    await expect(
      logEvents({
        auth: { uid: 'stranger-1' },
        data: {
          testId: 'test-1',
          batchId: 'batch-1',
          events: [
            {
              type: 'TASK_COMPLETED',
              layer: 'methodological',
              level: 'info',
            },
          ],
        },
      }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
  })

  it('rejects oversized batches before writing anything', async () => {
    await expect(
      logEvents({
        auth: { uid: 'user-1' },
        data: {
          testId: 'test-1',
          batchId: 'batch-1',
          events: Array.from({ length: 26 }, () => ({
            type: 'ANSWER_CHANGED',
            layer: 'methodological',
            level: 'info',
          })),
        },
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' })

    expect(mockDb.batch).not.toHaveBeenCalled()
  })

  it('rejects non-object log events', async () => {
    await expect(
      logEvents({
        auth: { uid: 'user-1' },
        data: {
          testId: 'test-1',
          batchId: 'batch-1',
          events: ['not-an-object'],
        },
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })

  it('rejects events with invalid type pattern', async () => {
    await expect(
      logEvents({
        auth: { uid: 'user-1' },
        data: {
          testId: 'test-1',
          batchId: 'batch-1',
          events: [
            {
              type: 'lowercase_invalid',
              layer: 'technical',
              level: 'info',
            },
          ],
        },
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })

  it('rejects events with invalid layer', async () => {
    await expect(
      logEvents({
        auth: { uid: 'user-1' },
        data: {
          testId: 'test-1',
          batchId: 'batch-1',
          events: [
            {
              type: 'TASK_COMPLETED',
              layer: 'nonexistent',
              level: 'info',
            },
          ],
        },
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })

  it('rejects events with invalid level', async () => {
    await expect(
      logEvents({
        auth: { uid: 'user-1' },
        data: {
          testId: 'test-1',
          batchId: 'batch-1',
          events: [
            {
              type: 'TASK_COMPLETED',
              layer: 'technical',
              level: 'critical',
            },
          ],
        },
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })

  it('throws internal error when LOG_ACTOR_HASH_SALT is not configured', async () => {
    delete process.env.LOG_ACTOR_HASH_SALT

    await expect(
      logEvents({
        auth: { uid: 'user-1' },
        data: {
          testId: 'test-1',
          batchId: 'batch-1',
          events: [
            {
              type: 'TASK_COMPLETED',
              layer: 'methodological',
              level: 'info',
            },
          ],
        },
      }),
    ).rejects.toMatchObject({ code: 'internal' })
  })
})