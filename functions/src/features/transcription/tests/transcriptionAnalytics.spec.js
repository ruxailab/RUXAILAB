import { jest } from '@jest/globals'
import {
  computeTranscriptMetrics,
  countWords,
  toTaskAnalyticsKey,
} from '../models/computeTranscriptMetrics.js'
import { TranscriptionAnalytics } from '../models/TranscriptionAnalytics.js'
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

describe('TranscriptionAnalytics', () => {
  it('upserts task0 and recomputes general', () => {
    const analytics = TranscriptionAnalytics.empty()
    analytics.upsertTask(0, {
      transcriptionDocId: 'tr-1',
      userDocId: 'user-1',
      sessionDuration: 10,
      wordsSpoken: 20,
      speakingTime: 5,
      speechRate: 240,
      keywords: [],
    })
    analytics.upsertTask(1, {
      transcriptionDocId: 'tr-2',
      userDocId: 'user-1',
      sessionDuration: 4,
      wordsSpoken: 10,
      speakingTime: 5,
      speechRate: 120,
      keywords: [],
    })

    expect(analytics.tasks.task0.transcriptionDocId).toBe('tr-1')
    expect(analytics.tasks.task1.wordsSpoken).toBe(10)
    expect(analytics.general).toMatchObject({
      sessionDuration: 14,
      wordsSpoken: 30,
      speakingTime: 10,
      speechRate: 180,
      keywords: [],
    })
  })
})

describe('UpsertTranscriptionAnalyticsService', () => {
  it('creates analytics document when missing', async () => {
    const analyticsRepository = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    }
    const service = new UpsertTranscriptionAnalyticsService({
      analyticsRepository,
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
        evaluator: {
          transcript: 'hello world',
          segments: [{ start: 0, end: 2, text: 'hello world' }],
        },
        moderator: {
          transcript: '',
          segments: [],
        },
      },
    })

    expect(analyticsRepository.get).toHaveBeenCalledWith()
    expect(analyticsRepository.set).toHaveBeenCalledWith(
      expect.any(TranscriptionAnalytics),
    )
    expect(result.tasks.task0).toMatchObject({
      transcriptionDocId: 'tr-1',
      userDocId: 'evaluator-1',
      wordsSpoken: 2,
      speakingTime: 2,
      sessionDuration: 2,
      keywords: [],
    })
    expect(result.updatedAt).toBe('ts')
  })
})
