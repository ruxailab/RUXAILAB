import { jest } from '@jest/globals'

const mockAnswerGet = jest.fn()
const mockUserGet = jest.fn()
const mockStudyGet = jest.fn()
const mockTranscriptionQueryGet = jest.fn()
const mockTranscriptionGet = jest.fn()
const mockTestsWhereGet = jest.fn()
const mockAnalyticsGet = jest.fn()
const mockAnalyticsSet = jest.fn()
const mockBatchDelete = jest.fn()
const mockBatchCommit = jest.fn()

const mockDb = {
  batch: jest.fn(() => ({
    delete: mockBatchDelete,
    commit: mockBatchCommit,
  })),
  doc: jest.fn((documentPath) => {
    if (/^answers\/[^/]+\/analytics\/[^/]+$/.test(documentPath)) {
      return {
        get: mockAnalyticsGet,
        set: mockAnalyticsSet,
        delete: jest.fn(),
      }
    }
    throw new Error(`Unexpected doc path: ${documentPath}`)
  }),
  collection: jest.fn((collectionName) => {
    if (collectionName === 'answers') {
      return {
        doc: jest.fn(() => ({
          get: mockAnswerGet,
          update: jest.fn(),
        })),
      }
    }
    if (collectionName === 'users') {
      return {
        doc: jest.fn(() => ({
          get: mockUserGet,
        })),
      }
    }
    if (collectionName === 'tests') {
      return {
        doc: jest.fn(() => ({
          get: mockStudyGet,
        })),
        where: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: mockTestsWhereGet,
          })),
        })),
      }
    }
    if (collectionName === 'transcriptions') {
      const whereChain = {
        where: jest.fn(() => whereChain),
        get: mockTranscriptionQueryGet,
      }
      return {
        doc: jest.fn((id) => ({
          id,
          path: `transcriptions/${id}`,
          get: () => mockTranscriptionGet(id),
          delete: jest.fn(),
        })),
        where: jest.fn(() => whereChain),
      }
    }
    throw new Error(`Unexpected collection: ${collectionName}`)
  }),
}

jest.unstable_mockModule('../../../core/firebase/f.firebase.js', () => ({
  admin: {
    firestore: Object.assign(jest.fn(() => mockDb), {
      FieldValue: {
        serverTimestamp: jest.fn(() => 'mock-server-timestamp'),
      },
    }),
  },
  functions: {
    onCall: jest.fn(({ handler, middlewares = [] }) => {
      const composed = middlewares.reduceRight(
        (next, middleware) => (request) =>
          middleware(request, () => next(request)),
        handler,
      )
      return composed
    }),
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

jest.unstable_mockModule('../../../core/firebase/index.js', async () => {
  const firebase = await import('../../../core/firebase/f.firebase.js')
  const middlewares = await import('../../../core/firebase/middlewares.js')
  return {
    admin: firebase.admin,
    functions: firebase.functions,
    requireAuth: middlewares.requireAuth,
    validateRequest: middlewares.validateRequest,
    mapHttpsError: middlewares.mapHttpsError,
  }
})

const { transcriptionDeleteByUser } = await import(
  '../interface/transcriptionDeleteByUser.js'
)

const request = (uid, data) => ({
  auth: uid ? { uid } : null,
  data,
})

const snap = (exists, data, id = null) => ({
  exists,
  id,
  data: () => data,
})

const transcriptionData = (overrides = {}) => ({
  answersDocId: 'answer-1',
  userDocId: 'evaluator-1',
  taskId: '0',
  provider: 'whisper',
  model: 'medium',
  createdAt: { seconds: 100, nanoseconds: 0 },
  evaluator: { language: 'en', transcript: '', segments: [] },
  moderator: { language: 'en', transcript: '', segments: [] },
  sessionDuration: 2,
  wordsSpoken: 4,
  speakingTime: 2,
  speechRate: 120,
  keywords: { produto: 1 },
  ...overrides,
})

describe('transcriptionDeleteByUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockAnswerGet.mockResolvedValue(
      snap(true, {
        studyId: 'study-1',
        taskAnswers: {},
      }),
    )
    mockUserGet.mockResolvedValue(snap(true, { accessLevel: 1 }))
    mockStudyGet.mockResolvedValue(
      snap(true, {
        answersDocId: 'answer-1',
        testAdmin: { userDocId: 'owner' },
        studyRoleMap: { owner: 0 },
      }),
    )
    mockAnalyticsGet.mockResolvedValue(snap(false, null))
    mockAnalyticsSet.mockResolvedValue(undefined)
    mockBatchCommit.mockResolvedValue(undefined)
    mockTranscriptionGet.mockResolvedValue(snap(false, null))

    mockTranscriptionQueryGet.mockResolvedValue({
      docs: [
        {
          id: 'tr-1',
          data: () =>
            transcriptionData({
              taskId: '0',
              createdAt: { seconds: 100, nanoseconds: 0 },
            }),
        },
        {
          id: 'tr-2',
          data: () =>
            transcriptionData({
              taskId: '1',
              createdAt: { seconds: 90, nanoseconds: 0 },
            }),
        },
      ],
    })
  })

  it('requires authentication', async () => {
    await expect(
      transcriptionDeleteByUser(
        request(null, {
          answersDocId: 'answer-1',
          userDocId: 'evaluator-1',
        }),
      ),
    ).rejects.toMatchObject({ code: 'unauthenticated' })
  })

  it('returns not-found when answer does not exist', async () => {
    mockAnswerGet.mockResolvedValue(snap(false, null))

    await expect(
      transcriptionDeleteByUser(
        request('owner', {
          answersDocId: 'missing',
          userDocId: 'evaluator-1',
          studyId: 'study-1',
        }),
      ),
    ).rejects.toMatchObject({ code: 'not-found' })
  })

  it('rejects callers without study permission', async () => {
    await expect(
      transcriptionDeleteByUser(
        request('stranger', {
          answersDocId: 'answer-1',
          userDocId: 'evaluator-1',
          studyId: 'study-1',
        }),
      ),
    ).rejects.toMatchObject({ code: 'permission-denied' })
  })

  it('batch-deletes all transcriptions for the user and rebuilds analytics', async () => {
    const result = await transcriptionDeleteByUser(
      request('owner', {
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        studyId: 'study-1',
      }),
    )

    expect(mockDb.batch).toHaveBeenCalledTimes(1)
    expect(mockBatchDelete).toHaveBeenCalledTimes(2)
    expect(mockBatchCommit).toHaveBeenCalledTimes(1)
    expect(mockAnalyticsSet).toHaveBeenCalledWith(
      expect.objectContaining({
        general: expect.objectContaining({
          wordsSpoken: 0,
          speakingTime: 0,
          sessionDuration: 0,
          keywords: {},
        }),
        tasks: {},
        updatedAt: 'mock-server-timestamp',
      }),
      { merge: true },
    )
    expect(result).toEqual({
      deletedCount: 2,
      answersDocId: 'answer-1',
      userDocId: 'evaluator-1',
    })
  })

  it('rebuilds analytics with zero deleted docs when none exist', async () => {
    mockTranscriptionQueryGet.mockResolvedValue({ docs: [] })

    const result = await transcriptionDeleteByUser(
      request('owner', {
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        studyId: 'study-1',
      }),
    )

    expect(mockDb.batch).not.toHaveBeenCalled()
    expect(mockAnalyticsSet).toHaveBeenCalled()
    expect(result.deletedCount).toBe(0)
  })
})
