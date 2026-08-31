import { jest } from '@jest/globals'
import {
  aggregateUtteranceSentiment,
  mapUtteranceLabel,
} from '../service/aggregateUtteranceSentiment.js'

const mockAnswerGet = jest.fn()
const mockAnswerUpdate = jest.fn()
const mockUserGet = jest.fn()
const mockStudyGet = jest.fn()
const mockTestsWhereGet = jest.fn()
const mockAnalyticsGet = jest.fn()
const mockAnalyticsSet = jest.fn()
const mockSentimentGet = jest.fn()
const mockSentimentSet = jest.fn()
const mockSentimentAdd = jest.fn()

const sentimentStore = new Map()

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
    if (collectionName === 'sentiment') {
      return {
        doc: jest.fn((id) => ({
          get: async () => {
            mockSentimentGet(id)
            const data = sentimentStore.get(id)
            return {
              exists: Boolean(data),
              id,
              data: () => data,
            }
          },
          set: async (payload) => {
            mockSentimentSet(id, payload)
            sentimentStore.set(id, payload)
          },
        })),
        add: async (payload) => {
          const id = `sent-${sentimentStore.size + 1}`
          mockSentimentAdd(payload)
          sentimentStore.set(id, payload)
          return { id }
        },
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

const { textSentimentTask } = await import('../interface/textSentimentTask.js')

const request = (uid, data) => ({
  auth: uid ? { uid } : null,
  data,
})

const snap = (exists, data, id = null) => ({
  exists,
  id,
  data: () => data,
})

const audioUrl =
  'https://firebasestorage.googleapis.com/v0/b/bucket/o/tests%2Faudio.webm?alt=media'

const textPayload = {
  Positive: 50,
  Neutral: 25,
  Negative: 25,
  sampleCount: 4,
}

describe('aggregateUtteranceSentiment', () => {
  it('maps POS / NEU / NEG labels', () => {
    expect(mapUtteranceLabel('POS')).toBe('Positive')
    expect(mapUtteranceLabel('neu')).toBe('Neutral')
    expect(mapUtteranceLabel('NEG')).toBe('Negative')
    expect(mapUtteranceLabel('unknown')).toBeNull()
  })

  it('aggregates utterance labels into percentages', () => {
    const result = aggregateUtteranceSentiment([
      { label: 'POS' },
      { label: 'POS' },
      { label: 'NEU' },
      { label: 'NEG' },
    ])
    expect(result.toJSON()).toEqual(textPayload)
  })
})

describe('textSentimentTask', () => {
  const originalFetch = global.fetch
  const savedBaseUrl = process.env.TRANSCRIPTION_SENTIMENT_API_BASE_URL

  beforeEach(() => {
    jest.clearAllMocks()
    sentimentStore.clear()
    process.env.TRANSCRIPTION_SENTIMENT_API_BASE_URL =
      'http://sentiment.test/audio-transcript-sentiment'

    mockAnswerGet.mockResolvedValue(
      snap(true, {
        studyId: 'study-1',
        taskAnswers: {
          'evaluator-1': {
            tasks: {
              '0': {
                audioRecordURL: audioUrl,
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
    mockAnswerUpdate.mockResolvedValue(undefined)
    mockAnalyticsGet.mockResolvedValue(snap(false, null))
    mockAnalyticsSet.mockResolvedValue(undefined)

    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        status: 'success',
        data: {
          utterances_sentiment: [
            { label: 'POS', text: 'great', confidence: 0.9, timestamp: [0, 1] },
            { label: 'POS', text: 'nice', confidence: 0.8, timestamp: [1, 2] },
            { label: 'NEU', text: 'ok', confidence: 0.7, timestamp: [2, 3] },
            { label: 'NEG', text: 'hard', confidence: 0.6, timestamp: [3, 4] },
          ],
        },
      }),
    }))
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env.TRANSCRIPTION_SENTIMENT_API_BASE_URL = savedBaseUrl
  })

  it('requires authentication', async () => {
    await expect(
      textSentimentTask(
        request(null, {
          answersDocId: 'answer-1',
          userDocId: 'evaluator-1',
          taskId: '0',
        }),
      ),
    ).rejects.toMatchObject({ code: 'unauthenticated' })
  })

  it('fails when audio recording is missing', async () => {
    mockAnswerGet.mockResolvedValue(
      snap(true, {
        studyId: 'study-1',
        taskAnswers: {
          'evaluator-1': {
            tasks: {
              '0': {},
            },
          },
        },
      }),
    )

    await expect(
      textSentimentTask(
        request('owner', {
          answersDocId: 'answer-1',
          userDocId: 'evaluator-1',
          taskId: '0',
          studyId: 'study-1',
        }),
      ),
    ).rejects.toMatchObject({ code: 'failed-precondition' })
  })

  it('fails when task is not found', async () => {
    mockAnswerGet.mockResolvedValue(
      snap(true, {
        studyId: 'study-1',
        taskAnswers: {
          'evaluator-1': {
            tasks: {},
          },
        },
      }),
    )

    await expect(
      textSentimentTask(
        request('owner', {
          answersDocId: 'answer-1',
          userDocId: 'evaluator-1',
          taskId: '0',
          studyId: 'study-1',
        }),
      ),
    ).rejects.toMatchObject({ code: 'not-found' })
  })

  it('analyzes audio, stores sentiment doc + sentimentDocId, and rebuilds analytics', async () => {
    const result = await textSentimentTask(
      request('owner', {
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        studyId: 'study-1',
      }),
    )

    expect(global.fetch).toHaveBeenCalledWith(
      'http://sentiment.test/audio-transcript-sentiment/process',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          url: audioUrl,
          start_time_ms: 0,
          end_time_ms: 12 * 60 * 60 * 1000,
        }),
      }),
    )
    expect(mockSentimentAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        facial: null,
        text: textPayload,
      }),
    )
    expect(mockAnswerUpdate).toHaveBeenCalledWith({
      'taskAnswers.evaluator-1.tasks.0.sentimentDocId': 'sent-1',
    })
    expect(mockAnalyticsSet).toHaveBeenCalledWith(
      expect.objectContaining({
        general: expect.objectContaining({
          bySignal: expect.objectContaining({
            text: expect.objectContaining({
              sampleCount: 4,
              Positive: 50,
            }),
          }),
        }),
        updatedAt: 'mock-server-timestamp',
      }),
      { merge: false },
    )
    expect(result).toMatchObject({
      answersDocId: 'answer-1',
      userDocId: 'evaluator-1',
      taskId: '0',
      sentimentDocId: 'sent-1',
      text: textPayload,
    })
  })

  it('updates existing sentiment doc on re-analyze without changing pointer', async () => {
    sentimentStore.set('sent-existing', {
      answersDocId: 'answer-1',
      userDocId: 'evaluator-1',
      taskId: '0',
      facial: {
        Happy: 40,
        Sad: 0,
        Angry: 0,
        Surprised: 0,
        Neutral: 60,
        Disgusted: 0,
        Fearful: 0,
      },
      text: {
        Positive: 10,
        Neutral: 80,
        Negative: 10,
        sampleCount: 1,
      },
      createdAt: 'old',
      updatedAt: 'old',
    })

    mockAnswerGet.mockResolvedValue(
      snap(true, {
        studyId: 'study-1',
        taskAnswers: {
          'evaluator-1': {
            tasks: {
              '0': {
                audioRecordURL: audioUrl,
                sentimentDocId: 'sent-existing',
              },
            },
          },
        },
      }),
    )

    await textSentimentTask(
      request('owner', {
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        studyId: 'study-1',
      }),
    )

    expect(mockSentimentAdd).not.toHaveBeenCalled()
    expect(mockSentimentSet).toHaveBeenCalledWith(
      'sent-existing',
      expect.objectContaining({
        text: textPayload,
        facial: expect.objectContaining({ Happy: 40 }),
      }),
    )
    expect(mockAnswerUpdate).not.toHaveBeenCalled()
    expect(mockAnalyticsSet).toHaveBeenCalled()
  })
})
