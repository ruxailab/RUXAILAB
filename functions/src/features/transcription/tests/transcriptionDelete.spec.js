import { jest } from '@jest/globals'

const mockAnswerGet = jest.fn()
const mockAnswerUpdate = jest.fn()
const mockUserGet = jest.fn()
const mockStudyGet = jest.fn()
const mockTranscriptionGet = jest.fn()
const mockTranscriptionDelete = jest.fn()
const mockTranscriptionQueryGet = jest.fn()
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
      const whereChain = {
        where: jest.fn(() => whereChain),
        get: mockTranscriptionQueryGet,
      }
      return {
        doc: jest.fn((id) => ({
          get: () => mockTranscriptionGet(id),
          delete: () => mockTranscriptionDelete(id),
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

const { transcriptionDelete } = await import(
  '../interface/transcriptionDelete.js'
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

describe('transcriptionDelete', () => {
  let answerState

  beforeEach(() => {
    jest.clearAllMocks()

    answerState = {
      studyId: 'study-1',
      taskAnswers: {
        'evaluator-1': {
          tasks: {
            '0': {
              transcriptionDocId: 'tr-1',
            },
          },
        },
      },
    }

    mockAnswerGet.mockImplementation(async () => snap(true, answerState))
    mockAnswerUpdate.mockImplementation(async (payload) => {
      const key = Object.keys(payload)[0]
      const match = key.match(
        /^taskAnswers\.([^.]+)\.tasks\.([^.]+)\.transcriptionDocId$/,
      )
      if (match) {
        const [, userDocId, taskId] = match
        answerState.taskAnswers[userDocId].tasks[taskId].transcriptionDocId =
          payload[key]
      }
    })
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
    mockTranscriptionDelete.mockResolvedValue(undefined)

    mockTranscriptionGet.mockImplementation(async (id) => {
      if (id === 'tr-1') {
        return snap(true, transcriptionData(), 'tr-1')
      }
      if (id === 'tr-old') {
        return snap(
          true,
          transcriptionData({
            createdAt: { seconds: 50, nanoseconds: 0 },
            sessionDuration: 5,
            wordsSpoken: 10,
            speakingTime: 4,
            speechRate: 150,
            keywords: { checkout: 2 },
          }),
          'tr-old',
        )
      }
      return snap(false, null, id)
    })

    mockTranscriptionQueryGet.mockResolvedValue({
      docs: [
        {
          id: 'tr-1',
          data: () =>
            transcriptionData({ createdAt: { seconds: 100, nanoseconds: 0 } }),
        },
        {
          id: 'tr-old',
          data: () =>
            transcriptionData({ createdAt: { seconds: 50, nanoseconds: 0 } }),
        },
      ],
    })
  })

  it('requires authentication', async () => {
    await expect(
      transcriptionDelete(request(null, { transcriptionId: 'tr-1' })),
    ).rejects.toMatchObject({ code: 'unauthenticated' })
  })

  it('returns not-found when transcription does not exist', async () => {
    mockTranscriptionGet.mockResolvedValue(snap(false, null, 'missing'))

    await expect(
      transcriptionDelete(
        request('owner', { transcriptionId: 'missing', studyId: 'study-1' }),
      ),
    ).rejects.toMatchObject({ code: 'not-found' })
  })

  it('rejects callers without study permission', async () => {
    mockStudyGet.mockResolvedValue(
      snap(true, {
        answersDocId: 'answer-1',
        testAdmin: { userDocId: 'owner' },
        studyRoleMap: { owner: 0 },
      }),
    )

    await expect(
      transcriptionDelete(
        request('stranger', {
          transcriptionId: 'tr-1',
          studyId: 'study-1',
        }),
      ),
    ).rejects.toMatchObject({ code: 'permission-denied' })
  })

  it('deletes the current pointer and points to the newest sibling', async () => {
    const result = await transcriptionDelete(
      request('owner', {
        transcriptionId: 'tr-1',
        studyId: 'study-1',
      }),
    )

    expect(mockTranscriptionDelete).toHaveBeenCalledWith('tr-1')
    expect(mockAnswerUpdate).toHaveBeenCalledWith({
      'taskAnswers.evaluator-1.tasks.0.transcriptionDocId': 'tr-old',
    })
    expect(mockAnalyticsSet).toHaveBeenCalledWith(
      expect.objectContaining({
        tasks: {
          task0: expect.objectContaining({
            wordsSpoken: 10,
            speakingTime: 4,
            sessionDuration: 5,
            keywords: { checkout: 2 },
          }),
        },
        general: expect.objectContaining({
          wordsSpoken: 10,
          speakingTime: 4,
          sessionDuration: 5,
        }),
        updatedAt: 'mock-server-timestamp',
      }),
      { merge: true },
    )
    expect(result).toEqual({
      id: 'tr-1',
      answersDocId: 'answer-1',
      userDocId: 'evaluator-1',
      taskId: '0',
      transcriptionDocId: 'tr-old',
    })
  })

  it('clears the pointer when deleting the only transcription', async () => {
    mockTranscriptionQueryGet.mockResolvedValue({
      docs: [
        {
          id: 'tr-1',
          data: () => transcriptionData(),
        },
      ],
    })

    const result = await transcriptionDelete(
      request('owner', {
        transcriptionId: 'tr-1',
        studyId: 'study-1',
      }),
    )

    expect(mockAnswerUpdate).toHaveBeenCalledWith({
      'taskAnswers.evaluator-1.tasks.0.transcriptionDocId': null,
    })
    expect(mockAnalyticsSet).toHaveBeenCalledWith(
      expect.objectContaining({
        general: expect.objectContaining({
          wordsSpoken: 0,
          speakingTime: 0,
          sessionDuration: 0,
          keywords: {},
        }),
        tasks: {},
      }),
      { merge: true },
    )
    expect(result.transcriptionDocId).toBeNull()
  })

  it('does not change transcriptionDocId when deleting a non-pointer run', async () => {
    answerState.taskAnswers['evaluator-1'].tasks['0'].transcriptionDocId =
      'tr-1'

    const result = await transcriptionDelete(
      request('owner', {
        transcriptionId: 'tr-old',
        studyId: 'study-1',
      }),
    )

    expect(mockTranscriptionDelete).toHaveBeenCalledWith('tr-old')
    expect(mockAnswerUpdate).not.toHaveBeenCalled()
    expect(mockAnalyticsSet).toHaveBeenCalled()
    expect(result).toEqual({
      id: 'tr-old',
      answersDocId: 'answer-1',
      userDocId: 'evaluator-1',
      taskId: '0',
      transcriptionDocId: 'tr-1',
    })
  })
})
