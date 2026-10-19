import { jest } from '@jest/globals'

const mockAnswerGet = jest.fn()
const mockUserGet = jest.fn()
const mockStudyGet = jest.fn()
const mockJobSet = jest.fn()
const mockJobUpdate = jest.fn()
const mockJobDoc = jest.fn(() => ({
  set: mockJobSet,
  update: mockJobUpdate,
}))
const mockEnqueue = jest.fn()
const mockTaskQueue = jest.fn(() => ({ enqueue: mockEnqueue }))

const mockDb = {
  collection: jest.fn((collectionName) => {
    if (collectionName === 'answers') {
      return { doc: jest.fn(() => ({ get: mockAnswerGet })) }
    }
    if (collectionName === 'users') {
      return { doc: jest.fn(() => ({ get: mockUserGet })) }
    }
    if (collectionName === 'tests') {
      return {
        doc: jest.fn(() => ({ get: mockStudyGet })),
        where: jest.fn(() => ({
          limit: jest.fn(() => ({ get: jest.fn() })),
        })),
      }
    }
    if (collectionName === 'sentiment') {
      return { doc: jest.fn(() => ({ get: jest.fn() })) }
    }
    if (collectionName === 'jobs') {
      return { doc: mockJobDoc }
    }
    throw new Error(`Unexpected collection: ${collectionName}`)
  }),
}

jest.unstable_mockModule('firebase-admin/functions', () => ({
  getFunctions: () => ({ taskQueue: mockTaskQueue }),
}))

jest.unstable_mockModule('../../../core/firebase/f.firebase.js', () => ({
  getRegion: () => 'us-central1',
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
    getRegion: firebase.getRegion,
    requireAuth: middlewares.requireAuth,
    validateRequest: middlewares.validateRequest,
    mapHttpsError: middlewares.mapHttpsError,
  }
})

const { facialSentimentTask } = await import(
  '../interface/facialSentimentTask.js'
)

const request = (uid, data) => ({
  auth: uid ? { uid } : null,
  data,
})

const snap = (exists, data) => ({
  exists,
  data: () => data,
})

const payload = {
  answersDocId: 'answer-1',
  userDocId: 'evaluator-1',
  taskId: '0',
  studyId: 'study-1',
}

describe('facialSentimentTask enqueue', () => {
  const savedBaseUrl = process.env.FACIAL_SENTIMENT_API_BASE_URL

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.FACIAL_SENTIMENT_API_BASE_URL = 'http://facial.test'
    mockEnqueue.mockResolvedValue(undefined)
    mockJobSet.mockResolvedValue(undefined)
    mockJobUpdate.mockResolvedValue(undefined)
    mockAnswerGet.mockResolvedValue(
      snap(true, {
        studyId: 'study-1',
        taskAnswers: {
          'evaluator-1': {
            tasks: {
              '0': {
                webcamRecordURL:
                  'https://firebasestorage.googleapis.com/v0/b/bucket/o/tests%2Fvid.webm?alt=media',
              },
            },
          },
        },
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
  })

  afterEach(() => {
    process.env.FACIAL_SENTIMENT_API_BASE_URL = savedBaseUrl
  })

  it('requires authentication', async () => {
    await expect(
      facialSentimentTask(request(null, payload)),
    ).rejects.toMatchObject({ code: 'unauthenticated' })
    expect(mockEnqueue).not.toHaveBeenCalled()
  })

  it('enqueues the authorized task and returns the job id', async () => {
    const result = await facialSentimentTask(request('owner', payload))

    expect(mockTaskQueue).toHaveBeenCalledWith(
      'locations/us-central1/functions/facialSentimentTaskWorker',
    )
    expect(mockJobDoc).toHaveBeenCalledWith(result.jobId)
    expect(mockJobSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'queued',
        type: 'facial',
        progress: 0,
        uid: 'owner',
        answersDocId: 'answer-1',
        taskId: '0',
      }),
      { merge: true },
    )
    expect(result).toEqual({
      status: 'queued',
      jobId: result.jobId,
      jobDocId: result.jobId,
    })
  })
})
