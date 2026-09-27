import {
  flattenSessionMessages,
  groupTextByTopicAndParticipant,
} from '../src/features/focusGroupAnalysis/flattenSession.js'

describe('flattenSessionMessages', () => {
  it('flattens the nested topic/message tree into a flat array', () => {
    const session = {
      sessionId: 'session-1',
      messages: {
        'topic-1': {
          'msg-1': { userId: 'p1', text: 'hello', timestamp: 1 },
          'msg-2': { userId: 'p2', text: 'hi', timestamp: 2 },
        },
      },
    }
    expect(flattenSessionMessages(session)).toEqual([
      { sessionId: 'session-1', topicId: 'topic-1', messageId: 'msg-1', participantId: 'p1', text: 'hello', timestamp: 1 },
      { sessionId: 'session-1', topicId: 'topic-1', messageId: 'msg-2', participantId: 'p2', text: 'hi', timestamp: 2 },
    ])
  })

  it('returns an empty array when there are no messages', () => {
    expect(flattenSessionMessages({ sessionId: 's1', messages: {} })).toEqual([])
    expect(flattenSessionMessages({ sessionId: 's1' })).toEqual([])
  })

  it('filters to participant roster IDs and excludes the facilitator', () => {
    const session = {
      sessionId: 'session-1',
      facilitatorId: 'facilitator',
      messages: {
        'topic-1': {
          participant: { userId: 'p1', text: 'response', timestamp: 1 },
          facilitator: { userId: 'facilitator', text: 'prompt', timestamp: 2 },
          observer: { userId: 'observer', text: 'note', timestamp: 3 },
        },
      },
    }

    expect(flattenSessionMessages(session, new Set(['p1']))).toMatchObject([
      { participantId: 'p1', text: 'response' },
    ])
  })
})

describe('groupTextByTopicAndParticipant', () => {
  it('concatenates one participant’s messages in chronological order', () => {
    const flat = [
      { topicId: 't1', participantId: 'p1', text: 'second', timestamp: 2 },
      { topicId: 't1', participantId: 'p1', text: 'first', timestamp: 1 },
    ]
    expect(groupTextByTopicAndParticipant(flat)).toEqual({
      t1: [{ participantId: 'p1', text: 'first second' }],
    })
  })

  it('keeps different participants and topics separate', () => {
    const flat = [
      { topicId: 't1', participantId: 'p1', text: 'a', timestamp: 1 },
      { topicId: 't1', participantId: 'p2', text: 'b', timestamp: 1 },
      { topicId: 't2', participantId: 'p1', text: 'c', timestamp: 1 },
    ]
    const grouped = groupTextByTopicAndParticipant(flat)
    expect(Object.keys(grouped)).toEqual(['t1', 't2'])
    expect(grouped.t1).toHaveLength(2)
    expect(grouped.t2).toHaveLength(1)
  })
})
