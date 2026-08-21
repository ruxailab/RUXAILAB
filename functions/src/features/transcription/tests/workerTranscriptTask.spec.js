import { jest } from '@jest/globals'

const mockAnswerGet = jest.fn()
const mockAnswerUpdate = jest.fn()
const mockUserGet = jest.fn()
const mockStudyGet = jest.fn()
const mockTranscriptionAdd = jest.fn()
const mockTestsWhereGet = jest.fn()

const mockDb = {
  collection: jest.fn((collectionName) => {
    if (collectionName === 'answers') {
      return {
        doc: jest.fn(() => ({
          get: mockAnswerGet,
          update: mockAnswerUpdate,
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
      return {
        add: mockTranscriptionAdd,
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

const { workerTranscriptTask } = await import(
  '../interface/workerTranscriptTask.js'
)

const request = (uid, data) => ({
  auth: uid ? { uid } : null,
  data,
})

const snap = (exists, data) => ({
  exists,
  data: () => data,
})

describe('workerTranscriptTask', () => {
  const originalFetch = global.fetch
  const savedBaseUrl = process.env.TRANSCRIPTION_API_BASE_URL

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.TRANSCRIPTION_API_BASE_URL = 'http://transcription.test'

    mockAnswerGet.mockResolvedValue(
      snap(true, {
        studyId: 'study-1',
        taskAnswers: {
          'evaluator-1': {
            tasks: {
              '0': {
                audioRecordURL: 'https://cdn/eval.webm',
                moderatorAudioURL: 'https://cdn/mod.webm',
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
    mockTranscriptionAdd.mockResolvedValue({ id: 'tr-1' })
    mockAnswerUpdate.mockResolvedValue(undefined)

    global.fetch = jest.fn(async (_url, options) => {
      const body = JSON.parse(options.body)
      return {
        ok: true,
        json: async () => ({
          status: 'success',
          language: 'en',
          transcript: `text for ${body.audio_url}`,
          segments: [{ start: 0, end: 1, text: 'hello' }],
        }),
      }
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env.TRANSCRIPTION_API_BASE_URL = savedBaseUrl
  })

  it('requires authentication', async () => {
    await expect(
      workerTranscriptTask(
        request(null, {
          answersDocId: 'answer-1',
          userDocId: 'evaluator-1',
          taskId: '0',
          provider: 'whisper',
        }),
      ),
    ).rejects.toMatchObject({ code: 'unauthenticated' })
  })

  it('orchestrates transcription and persists result', async () => {
    const result = await workerTranscriptTask(
      request('owner', {
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        provider: 'whisper',
        studyId: 'study-1',
      }),
    )

    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(mockTranscriptionAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        provider: 'whisper',
        model: 'medium',
        evaluator: expect.objectContaining({
          language: 'en',
          segments: [{ startTimeSec: 0, endTimeSec: 1, text: 'hello' }],
        }),
        moderator: expect.objectContaining({
          language: 'en',
        }),
      }),
    )
    expect(mockAnswerUpdate).toHaveBeenCalledWith({
      'taskAnswers.evaluator-1.tasks.0.latestTranscriptionDocId': 'tr-1',
    })
    expect(result).toMatchObject({
      id: 'tr-1',
      provider: 'whisper',
      model: 'medium',
      evaluator: { language: 'en' },
      moderator: { language: 'en' },
    })
  })

  it('rejects invalid provider', async () => {
    await expect(
      workerTranscriptTask(
        request('owner', {
          answersDocId: 'answer-1',
          userDocId: 'evaluator-1',
          taskId: '0',
          provider: 'other',
        }),
      ),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })
})
