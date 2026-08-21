import { jest } from '@jest/globals'
import {
  computeTranscriptMetrics,
  countWords,
} from '../service/computeTranscriptMetrics.js'
import {
  extractKeywords,
  limitKeywordMap,
  mergeKeywordMaps,
  tokenize,
  TOP_KEYWORDS_LIMIT,
} from '../service/extractKeywords.js'
import { TranscriptionAnalytics } from '../models/TranscriptionAnalytics.js'
import {
  buildTranscriptionAnalytics,
  toTaskAnalyticsKey,
} from '../service/buildTranscriptionAnalytics.js'
import { UpsertTranscriptionAnalyticsService } from '../service/UpsertTranscriptionAnalyticsService.js'

describe('computeTranscriptMetrics', () => {
  it('counts words from whitespace-separated text', () => {
    expect(countWords('hello world')).toBe(2)
    expect(countWords('  one   two  ')).toBe(2)
    expect(countWords('')).toBe(0)
    expect(countWords(null)).toBe(0)
  })

  it('builds task keys as task{taskId}', () => {
    expect(toTaskAnalyticsKey(0)).toBe('task0')
    expect(toTaskAnalyticsKey('1')).toBe('task1')
  })

  it('computes duration, words, speaking time and speech rate', () => {
    const metrics = computeTranscriptMetrics({
      evaluator: {
        transcript: 'one two three four',
        segments: [
          { start: 0, end: 2, text: 'one two' },
          { start: 2, end: 4, text: 'three four' },
        ],
      },
      moderator: {
        transcript: 'five six',
        segments: [{ start: 0, end: 2, text: 'five six' }],
      },
    })

    expect(metrics.wordsSpoken).toBe(6)
    expect(metrics.speakingTime).toBe(6)
    expect(metrics.sessionDuration).toBe(4)
    expect(metrics.speechRate).toBe(60)
  })
})

describe('extractKeywords', () => {
  it('filters portuguese and english stopwords into a map', () => {
    const keywords = extractKeywords({
      evaluator: { transcript: 'a o e the produto checkout' },
      moderator: { transcript: '' },
    })

    expect(keywords).toEqual({
      checkout: 1,
      produto: 1,
    })
  })

  it('is case-insensitive and strips punctuation', () => {
    expect(tokenize('Checkout, checkout!')).toEqual(['checkout', 'checkout'])

    const keywords = extractKeywords({
      evaluator: { transcript: 'Checkout, checkout!' },
      moderator: { transcript: '' },
    })

    expect(keywords).toEqual({ checkout: 2 })
  })

  it('merges keyword maps by summing counts', () => {
    expect(
      mergeKeywordMaps([
        { checkout: 2, produto: 1 },
        { checkout: 3 },
      ]),
    ).toEqual({
      checkout: 5,
      produto: 1,
    })
  })

  it('limits keyword maps to top N by count', () => {
    const map = {}
    for (let i = 1; i <= 40; i += 1) {
      map[`word${String(i).padStart(2, '0')}`] = i
    }

    const limited = limitKeywordMap(map)
    expect(Object.keys(limited)).toHaveLength(TOP_KEYWORDS_LIMIT)
    expect(limited.word40).toBe(40)
    expect(limited.word11).toBe(11)
    expect(limited.word10).toBeUndefined()
  })
})

describe('buildTranscriptionAnalytics', () => {
  it('sums two users on the same task into task0 and general', () => {
    const analytics = buildTranscriptionAnalytics([
      {
        id: 'tr-a',
        userDocId: 'user-a',
        taskId: '0',
        sessionDuration: 10,
        wordsSpoken: 20,
        speakingTime: 5,
        speechRate: 240,
        keywords: { checkout: 2, bug: 2 },
      },
      {
        id: 'tr-b',
        userDocId: 'user-b',
        taskId: '0',
        sessionDuration: 4,
        wordsSpoken: 10,
        speakingTime: 5,
        speechRate: 120,
        keywords: { checkout: 1, produto: 4 },
      },
    ])

    expect(analytics.tasks.task0).toMatchObject({
      sessionDuration: 14,
      wordsSpoken: 30,
      speakingTime: 10,
      speechRate: 180,
      keywords: {
        checkout: 3,
        bug: 2,
        produto: 4,
      },
    })
    expect(analytics.general).toMatchObject({
      sessionDuration: 14,
      wordsSpoken: 30,
      speakingTime: 10,
      speechRate: 180,
      keywords: {
        checkout: 3,
        bug: 2,
        produto: 4,
      },
    })
  })

  it('replaces one user contribution when that transcription is updated', () => {
    const before = buildTranscriptionAnalytics([
      {
        id: 'tr-a',
        taskId: '0',
        sessionDuration: 10,
        wordsSpoken: 20,
        speakingTime: 5,
        keywords: { checkout: 5 },
      },
      {
        id: 'tr-b',
        taskId: '0',
        sessionDuration: 4,
        wordsSpoken: 10,
        speakingTime: 5,
        keywords: { checkout: 1 },
      },
    ])
    expect(before.general.keywords.checkout).toBe(6)

    const after = buildTranscriptionAnalytics([
      {
        id: 'tr-a',
        taskId: '0',
        sessionDuration: 8,
        wordsSpoken: 8,
        speakingTime: 4,
        keywords: { checkout: 1 },
      },
      {
        id: 'tr-b',
        taskId: '0',
        sessionDuration: 4,
        wordsSpoken: 10,
        speakingTime: 5,
        keywords: { checkout: 1 },
      },
    ])

    expect(after.tasks.task0.wordsSpoken).toBe(18)
    expect(after.general.keywords.checkout).toBe(2)
  })

  it('keeps only top 30 keywords per task and in general after summing', () => {
    const many = {}
    for (let i = 1; i <= 40; i += 1) {
      many[`w${String(i).padStart(2, '0')}`] = i
    }

    const analytics = buildTranscriptionAnalytics([
      {
        id: 'tr-a',
        taskId: '0',
        sessionDuration: 1,
        wordsSpoken: 1,
        speakingTime: 1,
        keywords: many,
      },
    ])

    expect(Object.keys(analytics.tasks.task0.keywords)).toHaveLength(30)
    expect(Object.keys(analytics.general.keywords)).toHaveLength(30)
    expect(analytics.tasks.task0.keywords.w40).toBe(40)
    expect(analytics.tasks.task0.keywords.w10).toBeUndefined()
  })

  it('sums keywords across tasks into general before limiting', () => {
    const analytics = buildTranscriptionAnalytics([
      {
        id: 'tr-0',
        taskId: '0',
        sessionDuration: 1,
        wordsSpoken: 1,
        speakingTime: 1,
        keywords: { shared: 2, only0: 1 },
      },
      {
        id: 'tr-1',
        taskId: '1',
        sessionDuration: 1,
        wordsSpoken: 1,
        speakingTime: 1,
        keywords: { shared: 3, only1: 4 },
      },
    ])

    expect(analytics.tasks.task0.keywords).toEqual({ shared: 2, only0: 1 })
    expect(analytics.tasks.task1.keywords).toEqual({ shared: 3, only1: 4 })
    expect(analytics.general.keywords).toEqual({
      shared: 5,
      only0: 1,
      only1: 4,
    })
  })
})

describe('UpsertTranscriptionAnalyticsService', () => {
  it('rebuilds aggregates from answer pointers using preferTranscription metrics', async () => {
    const analyticsRepository = {
      set: jest.fn().mockResolvedValue(undefined),
    }
    const transcriptionRepository = {
      update: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        id: 'tr-1',
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        sessionDuration: 2,
        wordsSpoken: 2,
        speakingTime: 2,
        speechRate: 60,
        keywords: { checkout: 1, produto: 1 },
      }),
    }
    const answerRepository = {
      get: jest.fn().mockResolvedValue({
        taskAnswers: {
          'evaluator-1': {
            tasks: {
              '0': { transcriptionDocId: 'tr-1' },
            },
          },
        },
      }),
    }

    const service = new UpsertTranscriptionAnalyticsService({
      analyticsRepository,
      transcriptionRepository,
      answerRepository,
      FieldValue: {
        serverTimestamp: () => 'ts',
      },
    })

    const result = await service.execute({
      transcription: {
        id: 'tr-1',
        answersDocId: 'answer-1',
        userDocId: 'evaluator-1',
        taskId: '0',
        sessionDuration: 2,
        wordsSpoken: 2,
        speakingTime: 2,
        speechRate: 60,
        keywords: { checkout: 1, produto: 1 },
        evaluator: {
          transcript: 'produto checkout',
          segments: [{ start: 0, end: 2, text: 'produto checkout' }],
        },
        moderator: {
          transcript: '',
          segments: [],
        },
      },
    })

    expect(transcriptionRepository.update).not.toHaveBeenCalled()
    expect(analyticsRepository.set).toHaveBeenCalledWith(
      expect.any(TranscriptionAnalytics),
    )
    expect(result.tasks.task0).toMatchObject({
      wordsSpoken: 2,
      speakingTime: 2,
      sessionDuration: 2,
      keywords: { checkout: 1, produto: 1 },
    })
    expect(result.general.keywords).toEqual({ checkout: 1, produto: 1 })
    expect(result.updatedAt).toBe('ts')
  })
})
