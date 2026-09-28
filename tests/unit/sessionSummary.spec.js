import {
  sortSessionsByStartedAt,
  flattenTopicMessages,
  groupTopicMessagesByPrompt,
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

describe('groupTopicMessagesByPrompt', () => {
  it('splits a topic into one group per prompt, in first-asked order', () => {
    const messages = {
      'topic-1': {
        m1: { text: 'answer to A', promptText: 'Prompt A', timestamp: 100 },
        m2: { text: 'answer to B', promptText: 'Prompt B', timestamp: 200 },
        m3: { text: 'also answers A', promptText: 'Prompt A', timestamp: 300 },
      },
    }
    const groups = groupTopicMessagesByPrompt(messages, 'topic-1')
    expect(groups.map((g) => g.promptText)).toEqual(['Prompt A', 'Prompt B'])
    expect(groups[0].messages.map((m) => m.text)).toEqual([
      'answer to A',
      'also answers A',
    ])
    expect(groups[1].messages.map((m) => m.text)).toEqual(['answer to B'])
  })

  it('puts unprompted messages in their own group, first', () => {
    const messages = {
      'topic-1': {
        m1: { text: 'answer to A', promptText: 'Prompt A', timestamp: 100 },
        m2: { text: 'open floor chatter', promptText: null, timestamp: 50 },
      },
    }
    const groups = groupTopicMessagesByPrompt(messages, 'topic-1')
    expect(groups.map((g) => g.promptText)).toEqual([null, 'Prompt A'])
    expect(groups[0].messages.map((m) => m.text)).toEqual(['open floor chatter'])
  })

  it('treats an old message with no promptText field the same as unprompted', () => {
    const messages = { 'topic-1': { m1: { text: 'legacy message' } } }
    const groups = groupTopicMessagesByPrompt(messages, 'topic-1')
    expect(groups).toEqual([
      { promptText: null, messages: [{ id: 'm1', text: 'legacy message' }] },
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
