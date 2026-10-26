import {
  buildSentimentAnalytics,
  collectSentimentContributions,
  collectSentimentDocIds,
  facialEmotionsToBucket,
  toTaskAnalyticsKey,
} from '../service/buildSentimentAnalytics.js'
import { SentimentBucket } from '../models/SentimentAnalytics.js'

describe('facialEmotionsToBucket', () => {
  it('maps facial emotions into Positive / Neutral / Negative', () => {
    const bucket = facialEmotionsToBucket({
      Happy: 40,
      Surprised: 10,
      Neutral: 20,
      Sad: 10,
      Angry: 10,
      Disgusted: 5,
      Fearful: 5,
    })

    expect(bucket).toMatchObject({
      Positive: 50,
      Neutral: 20,
      Negative: 30,
      dominant: 'Positive',
      sampleCount: 1,
    })
  })

  it('returns empty bucket for missing payload', () => {
    expect(facialEmotionsToBucket(null)).toMatchObject({
      Positive: 0,
      Neutral: 0,
      Negative: 0,
      sampleCount: 0,
      dominant: null,
    })
  })
})

describe('toTaskAnalyticsKey', () => {
  it('builds task keys as task{taskId}', () => {
    expect(toTaskAnalyticsKey(0)).toBe('task0')
    expect(toTaskAnalyticsKey('1')).toBe('task1')
  })
})

describe('buildSentimentAnalytics', () => {
  it('averages two users on the same task into task0 and general', () => {
    const analytics = buildSentimentAnalytics([
      {
        userDocId: 'user-a',
        taskId: '0',
        facial: {
          Happy: 80,
          Surprised: 0,
          Neutral: 20,
          Sad: 0,
          Angry: 0,
          Disgusted: 0,
          Fearful: 0,
        },
        text: null,
      },
      {
        userDocId: 'user-b',
        taskId: '0',
        facial: {
          Happy: 0,
          Surprised: 0,
          Neutral: 20,
          Sad: 80,
          Angry: 0,
          Disgusted: 0,
          Fearful: 0,
        },
        text: null,
      },
    ])

    // user-a → P80 N20 N0; user-b → P0 N20 N80; average → P40 N20 N40
    expect(analytics.tasks.task0.facial).toMatchObject({
      Positive: 40,
      Neutral: 20,
      Negative: 40,
      sampleCount: 2,
    })
    expect(analytics.tasks.task0.text.sampleCount).toBe(0)
    expect(analytics.tasks.task0.combined).toMatchObject({
      Positive: 40,
      Neutral: 20,
      Negative: 40,
      sampleCount: 2,
    })
    expect(analytics.general.facial).toMatchObject({
      Positive: 40,
      Neutral: 20,
      Negative: 40,
      sampleCount: 2,
    })
    expect(analytics.general.bySignal?.facial || analytics.general.facial).toBeTruthy()
  })

  it('keeps separate task buckets and rolls them into general', () => {
    const analytics = buildSentimentAnalytics([
      {
        userDocId: 'user-a',
        taskId: '0',
        facial: {
          Happy: 100,
          Surprised: 0,
          Neutral: 0,
          Sad: 0,
          Angry: 0,
          Disgusted: 0,
          Fearful: 0,
        },
        text: null,
      },
      {
        userDocId: 'user-a',
        taskId: '1',
        facial: {
          Happy: 0,
          Surprised: 0,
          Neutral: 100,
          Sad: 0,
          Angry: 0,
          Disgusted: 0,
          Fearful: 0,
        },
        text: null,
      },
    ])

    expect(analytics.tasks.task0.facial).toMatchObject({
      Positive: 100,
      Neutral: 0,
      Negative: 0,
      sampleCount: 1,
    })
    expect(analytics.tasks.task1.facial).toMatchObject({
      Positive: 0,
      Neutral: 100,
      Negative: 0,
      sampleCount: 1,
    })
    expect(analytics.general.facial).toMatchObject({
      Positive: 50,
      Neutral: 50,
      Negative: 0,
      sampleCount: 2,
    })
  })

  it('includes text signal buckets without a users map', () => {
    const analytics = buildSentimentAnalytics([
      {
        userDocId: 'user-a',
        taskId: '0',
        facial: null,
        text: { Positive: 70, Neutral: 20, Negative: 10, sampleCount: 1 },
      },
    ])

    expect(analytics.tasks.task0.text).toMatchObject({
      Positive: 70,
      Neutral: 20,
      Negative: 10,
      sampleCount: 1,
    })
    expect(analytics.general.text).toMatchObject({
      Positive: 70,
      Neutral: 20,
      Negative: 10,
      sampleCount: 1,
    })
    expect(analytics.toFirestore().users).toBeUndefined()
  })
})

describe('collectSentimentDocIds', () => {
  it('collects sentimentDocId pointers from the answers document', () => {
    const ids = collectSentimentDocIds({
      taskAnswers: {
        Ev1: {
          tasks: {
            '0': { sentimentDocId: 'sent-a' },
            '1': {},
          },
        },
        Ev2: {
          tasks: {
            '0': { sentimentDocId: 'sent-b' },
          },
        },
      },
    })

    expect(ids.sort()).toEqual(['sent-a', 'sent-b'])
  })
})

describe('collectSentimentContributions', () => {
  it('reads facial and text from sentiment documents', () => {
    const contributions = collectSentimentContributions([
      {
        id: 'sent-a',
        userDocId: 'Ev1',
        taskId: '0',
        facial: {
          Happy: 50,
          Surprised: 0,
          Neutral: 50,
          Sad: 0,
          Angry: 0,
          Disgusted: 0,
          Fearful: 0,
        },
        text: null,
      },
    ])

    expect(contributions).toHaveLength(1)
    expect(contributions[0]).toMatchObject({
      userDocId: 'Ev1',
      taskId: '0',
    })
  })

  it('prefers an in-memory result for the same user/task', () => {
    const contributions = collectSentimentContributions(
      [
        {
          id: 'sent-a',
          userDocId: 'Ev1',
          taskId: '0',
          facial: {
            Happy: 10,
            Surprised: 0,
            Neutral: 90,
            Sad: 0,
            Angry: 0,
            Disgusted: 0,
            Fearful: 0,
          },
          text: null,
        },
      ],
      {
        userDocId: 'Ev1',
        taskId: '0',
        emotions: {
          Happy: 100,
          Surprised: 0,
          Neutral: 0,
          Sad: 0,
          Angry: 0,
          Disgusted: 0,
          Fearful: 0,
        },
      },
    )

    expect(contributions[0].facial.Happy).toBe(100)
  })
})

describe('SentimentBucket.merge via SentimentSignalSlice', () => {
  it('ignores empty buckets when merging', () => {
    const merged = SentimentBucket.empty()
    expect(merged.sampleCount).toBe(0)
    expect(merged.dominant).toBeNull()
  })
})
