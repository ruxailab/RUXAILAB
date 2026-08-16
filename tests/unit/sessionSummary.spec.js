import {
  sortSessionsByStartedAt,
  flattenTopicMessages,
  countMessagesByTopic,
} from '@/ux/FocusGroup/utils/sessionSummary'

describe('sortSessionsByStartedAt', () => {
  it('returns an empty array when there are no sessions', () => {
    expect(sortSessionsByStartedAt(undefined)).toEqual([])
    expect(sortSessionsByStartedAt({})).toEqual([])
  })

  it('sorts sessions newest-first and keeps the session id on each entry', () => {
    const sessions = {
      'session-a': { startedAt: 100, facilitatorId: 'f1' },
      'session-b': { startedAt: 300, facilitatorId: 'f1' },
      'session-c': { startedAt: 200, facilitatorId: 'f1' },
    }
    expect(sortSessionsByStartedAt(sessions).map((s) => s.sessionId)).toEqual([
      'session-b',
      'session-c',
      'session-a',
    ])
  })

  it('treats a missing startedAt as oldest', () => {
    const sessions = {
      'session-a': { startedAt: 100 },
      'session-b': {},
    }
    expect(sortSessionsByStartedAt(sessions).map((s) => s.sessionId)).toEqual([
      'session-a',
      'session-b',
    ])
  })
})

describe('flattenTopicMessages', () => {
  it('returns an empty array when the topic has no messages', () => {
    expect(flattenTopicMessages({}, 'topic-1')).toEqual([])
    expect(flattenTopicMessages(undefined, 'topic-1')).toEqual([])
  })

  it('sorts messages chronologically', () => {
    const messages = {
      'topic-1': {
        m2: { userId: 'a', text: 'second', timestamp: 200 },
        m1: { userId: 'a', text: 'first', timestamp: 100 },
      },
    }
    expect(flattenTopicMessages(messages, 'topic-1').map((m) => m.text)).toEqual([
      'first',
      'second',
    ])
  })
})

describe('countMessagesByTopic', () => {
  it('counts messages per topic', () => {
    const messages = {
      'topic-1': { m1: {}, m2: {} },
      'topic-2': { m3: {} },
    }
    expect(countMessagesByTopic(messages)).toEqual({
      'topic-1': 2,
      'topic-2': 1,
    })
  })

  it('returns an empty object for no messages', () => {
    expect(countMessagesByTopic(undefined)).toEqual({})
  })
})
