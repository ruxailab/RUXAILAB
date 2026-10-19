import { jest } from '@jest/globals'
import { FirestoreUserRepository } from '../../../shared/repositories/FirestoreUserRepository.js'
import { FirestoreAnswerRepository } from '../../../shared/repositories/FirestoreAnswerRepository.js'
import { FirestoreStudyRepository } from '../../../shared/repositories/FirestoreStudyRepository.js'
import { FirestoreSentimentRepository } from '../../../shared/repositories/FirestoreSentimentRepository.js'
import { FirestoreSentimentAnalyticsRepository } from '../repositories/FirestoreSentimentAnalyticsRepository.js'
import { AnalyzeFacialSentimentTaskService } from '../service/AnalyzeFacialSentimentTaskService.js'
import { ProcessFacialSentimentTaskService } from '../service/ProcessFacialSentimentTaskService.js'
import { UpsertSentimentAnalyticsService } from '../service/UpsertSentimentAnalyticsService.js'

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
  runTransaction: async (fn) =>
    fn({
      get: (ref) => ref.get(),
      set: (ref, data) => ref.set(data),
      update: (ref, data) => ref.update(data),
    }),
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

const FieldValue = {
  serverTimestamp: () => 'mock-server-timestamp',
}

function facialSentimentTask(request) {
  const input = request.data || {}
  const answerRepository = new FirestoreAnswerRepository(mockDb)
  const sentimentRepository = new FirestoreSentimentRepository(mockDb)
  const service = new ProcessFacialSentimentTaskService({
    analyzeService: new AnalyzeFacialSentimentTaskService({
      userRepository: new FirestoreUserRepository(mockDb),
      answerRepository,
      studyRepository: new FirestoreStudyRepository(mockDb),
      sentimentRepository,
      FieldValue,
      facialSentimentApiBaseUrl: process.env.FACIAL_SENTIMENT_API_BASE_URL,
    }),
    analyticsService: new UpsertSentimentAnalyticsService({
      analyticsRepository: new FirestoreSentimentAnalyticsRepository(
        mockDb,
        input.answersDocId,
      ),
      answerRepository,
      sentimentRepository,
      FieldValue,
    }),
  })
  return service.execute({ uid: request.auth?.uid, input })
}

const request = (uid, data) => ({
  auth: uid ? { uid } : null,
  data,
})

const snap = (exists, data, id = null) => ({
  exists,
  id,
  data: () => data,
})

const emotionsPayload = {
  Happy: 40,
  Sad: 10,
  Angry: 5,
  Surprised: 15,
  Neutral: 20,
  Disgusted: 5,
  Fearful: 5,
}

const webcamUrl =
  'https://firebasestorage.googleapis.com/v0/b/bucket/o/tests%2Fvid.webm?alt=media'

describe('facialSentimentTask', () => {
  const originalFetch = global.fetch
  const savedBaseUrl = process.env.FACIAL_SENTIMENT_API_BASE_URL

  beforeEach(() => {
    jest.clearAllMocks()
    sentimentStore.clear()
    process.env.FACIAL_SENTIMENT_API_BASE_URL = 'http://facial.test'

    mockAnswerGet.mockResolvedValue(
      snap(true, {
        studyId: 'study-1',
        taskAnswers: {
          'evaluator-1': {
            tasks: {
              '0': {
                webcamRecordURL: webcamUrl,
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
        emotions: emotionsPayload,
      }),
    }))
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env.FACIAL_SENTIMENT_API_BASE_URL = savedBaseUrl
  })

  it('fails when webcam recording is missing', async () => {
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
      facialSentimentTask(
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
      facialSentimentTask(
        request('owner', {
          answersDocId: 'answer-1',
          userDocId: 'evaluator-1',
          taskId: '0',
          studyId: 'study-1',
        }),
      ),
    ).rejects.toMatchObject({ code: 'not-found' })
  })

  it('analyzes video, stores sentiment doc + sentimentDocId, and rebuilds analytics', async () => {
    const result = await facialSentimentTask(
      request('owner', {
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        studyId: 'study-1',
      }),
    )

    expect(global.fetch).toHaveBeenCalledWith(
      'http://facial.test/process_video',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ video_name: 'tests/vid.webm' }),
      }),
    )
    expect(mockSentimentAdd).not.toHaveBeenCalled()
    expect(mockSentimentSet).toHaveBeenCalledWith(
      'answer-1__evaluator-1__0',
      expect.objectContaining({
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        facial: emotionsPayload,
        text: null,
      }),
    )
    expect(mockAnswerUpdate).toHaveBeenCalledWith({
      'taskAnswers.evaluator-1.tasks.0.sentimentDocId': 'answer-1__evaluator-1__0',
    })
    expect(mockAnalyticsSet).toHaveBeenCalledWith(
      expect.objectContaining({
        general: expect.objectContaining({
          bySignal: expect.objectContaining({
            facial: expect.objectContaining({
              sampleCount: 1,
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
      sentimentDocId: 'answer-1__evaluator-1__0',
      videoName: 'tests/vid.webm',
      emotions: emotionsPayload,
    })
  })

  it('updates existing sentiment doc on re-analyze without changing pointer', async () => {
    sentimentStore.set('sent-existing', {
      answersDocId: 'answer-1',
      userDocId: 'evaluator-1',
      taskId: '0',
      facial: {
        Happy: 1,
        Sad: 0,
        Angry: 0,
        Surprised: 0,
        Neutral: 99,
        Disgusted: 0,
        Fearful: 0,
      },
      text: { Positive: 10, Neutral: 80, Negative: 10, sampleCount: 1 },
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
                webcamRecordURL: webcamUrl,
                sentimentDocId: 'sent-existing',
              },
            },
          },
        },
      }),
    )

    await facialSentimentTask(
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
        facial: emotionsPayload,
        text: expect.objectContaining({ Positive: 10 }),
      }),
    )
    expect(mockAnswerUpdate).not.toHaveBeenCalled()
    expect(mockAnalyticsSet).toHaveBeenCalled()
  })
})
