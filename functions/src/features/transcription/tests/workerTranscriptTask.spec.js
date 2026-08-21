import { jest } from '@jest/globals'

const mockAnswerGet = jest.fn()
const mockAnswerUpdate = jest.fn()
const mockUserGet = jest.fn()
const mockStudyGet = jest.fn()
const mockTranscriptionAdd = jest.fn()
const mockTranscriptionGet = jest.fn()
const mockTranscriptionSet = jest.fn()
const mockTestsWhereGet = jest.fn()
const mockAnalyticsGet = jest.fn()
const mockAnalyticsSet = jest.fn()

const mockDb = {
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
        doc: jest.fn(() => ({
          get: mockTranscriptionGet,
          set: mockTranscriptionSet,
        })),
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

const snap = (exists, data, id = null) => ({
  exists,
  id,
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
    mockAnalyticsGet.mockResolvedValue(snap(false, null))
    mockAnalyticsSet.mockResolvedValue(undefined)

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
    expect(mockTranscriptionSet).not.toHaveBeenCalled()
    expect(mockAnswerUpdate).toHaveBeenCalledWith({
      'taskAnswers.evaluator-1.tasks.0.transcriptionDocId': 'tr-1',
    })
    expect(mockAnalyticsSet).toHaveBeenCalledWith(
      expect.objectContaining({
        general: expect.objectContaining({
          wordsSpoken: expect.any(Number),
          speakingTime: 2,
          sessionDuration: 1,
        }),
        tasks: {
          task0: expect.objectContaining({
            transcriptionDocId: 'tr-1',
            userDocId: 'evaluator-1',
            speakingTime: 2,
            sessionDuration: 1,
            keywords: [],
          }),
        },
        updatedAt: 'mock-server-timestamp',
      }),
      { merge: true },
    )
    expect(result).toMatchObject({
      id: 'tr-1',
      provider: 'whisper',
      model: 'medium',
      evaluator: { language: 'en' },
      moderator: { language: 'en' },
    })
  })

  it('updates existing transcription when transcriptionDocId is present', async () => {
    mockAnswerGet.mockResolvedValue(
      snap(true, {
        studyId: 'study-1',
        taskAnswers: {
          'evaluator-1': {
            tasks: {
              '0': {
                audioRecordURL: 'https://cdn/eval.webm',
                moderatorAudioURL: 'https://cdn/mod.webm',
                transcriptionDocId: 'tr-existing',
              },
            },
          },
        },
      }),
    )
    mockTranscriptionGet.mockResolvedValue(
      snap(
        true,
        {
          answersDocId: 'answer-1',
          userDocId: 'evaluator-1',
          taskId: '0',
          provider: 'whisper',
          model: 'medium',
          createdAt: 'created-at-original',
          evaluator: { language: 'en', transcript: '', segments: [] },
          moderator: { language: 'en', transcript: '', segments: [] },
        },
        'tr-existing',
      ),
    )
    mockTranscriptionSet.mockResolvedValue(undefined)

    const result = await workerTranscriptTask(
      request('owner', {
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        provider: 'whisper',
        studyId: 'study-1',
      }),
    )

    expect(mockTranscriptionAdd).not.toHaveBeenCalled()
    expect(mockTranscriptionSet).toHaveBeenCalledWith(
      expect.objectContaining({
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        provider: 'whisper',
        model: 'medium',
        createdAt: 'created-at-original',
        updatedAt: 'mock-server-timestamp',
        evaluator: expect.objectContaining({
          language: 'en',
          segments: [{ startTimeSec: 0, endTimeSec: 1, text: 'hello' }],
        }),
      }),
      { merge: true },
    )
    expect(mockAnswerUpdate).not.toHaveBeenCalled()
    expect(mockAnalyticsSet).toHaveBeenCalledWith(
      expect.objectContaining({
        tasks: {
          task0: expect.objectContaining({
            transcriptionDocId: 'tr-existing',
          }),
        },
      }),
      { merge: true },
    )
    expect(result).toMatchObject({
      id: 'tr-existing',
      provider: 'whisper',
      model: 'medium',
    })
  })

  it('creates a new transcription when transcriptionDocId points to a missing doc', async () => {
    mockAnswerGet.mockResolvedValue(
      snap(true, {
        studyId: 'study-1',
        taskAnswers: {
          'evaluator-1': {
            tasks: {
              '0': {
                audioRecordURL: 'https://cdn/eval.webm',
                moderatorAudioURL: 'https://cdn/mod.webm',
                transcriptionDocId: 'tr-missing',
              },
            },
          },
        },
      }),
    )
    mockTranscriptionGet.mockResolvedValue(snap(false, null))
    mockTranscriptionAdd.mockResolvedValue({ id: 'tr-2' })

    const result = await workerTranscriptTask(
      request('owner', {
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        provider: 'whisper',
        studyId: 'study-1',
      }),
    )

    expect(mockTranscriptionAdd).toHaveBeenCalled()
    expect(mockTranscriptionSet).not.toHaveBeenCalled()
    expect(mockAnswerUpdate).toHaveBeenCalledWith({
      'taskAnswers.evaluator-1.tasks.0.transcriptionDocId': 'tr-2',
    })
    expect(mockAnalyticsSet).toHaveBeenCalledWith(
      expect.objectContaining({
        tasks: {
          task0: expect.objectContaining({
            transcriptionDocId: 'tr-2',
          }),
        },
      }),
      { merge: true },
    )
    expect(result).toMatchObject({ id: 'tr-2' })
  })

  it('merges analytics when another task already exists', async () => {
    mockAnalyticsGet.mockResolvedValue(
      snap(true, {
        general: {
          sessionDuration: 5,
          wordsSpoken: 10,
          speakingTime: 4,
          speechRate: 150,
          keywords: [],
        },
        tasks: {
          task1: {
            transcriptionDocId: 'tr-old',
            userDocId: 'evaluator-1',
            sessionDuration: 5,
            wordsSpoken: 10,
            speakingTime: 4,
            speechRate: 150,
            keywords: [],
          },
        },
      }),
    )

    await workerTranscriptTask(
      request('owner', {
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        provider: 'whisper',
        studyId: 'study-1',
      }),
    )

    expect(mockAnalyticsSet).toHaveBeenCalledWith(
      expect.objectContaining({
        tasks: expect.objectContaining({
          task0: expect.objectContaining({
            transcriptionDocId: 'tr-1',
          }),
          task1: expect.objectContaining({
            transcriptionDocId: 'tr-old',
          }),
        }),
        general: expect.objectContaining({
          sessionDuration: 6,
          speakingTime: 6,
          wordsSpoken: expect.any(Number),
        }),
      }),
      { merge: true },
    )
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
