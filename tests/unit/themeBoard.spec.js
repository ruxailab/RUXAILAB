import {
  buildResponseKey,
  flattenSessionResponses,
  partitionResponsesByTheme,
  themesFromBuckets,
} from '@/ux/FocusGroup/utils/themeBoard'

describe('buildResponseKey', () => {
  it('joins session/topic/message into a stable composite key', () => {
    expect(
      buildResponseKey({ sessionId: 's1', topicId: 't1', messageId: 'm1' }),
    ).toBe('s1:t1:m1')
  })
})

describe('flattenSessionResponses', () => {
  it('flattens per-topic messages into a single taggable list', () => {
    const session = {
      sessionId: 's1',
      messages: {
        t1: { m1: { userId: 'u1', text: 'first' } },
        t2: { m2: { userId: 'u2', text: 'second' } },
      },
    }
    const responses = flattenSessionResponses(session)
    expect(responses).toHaveLength(2)
    expect(responses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 's1:t1:m1', excerpt: 'first', participantId: 'u1' }),
        expect.objectContaining({ key: 's1:t2:m2', excerpt: 'second', participantId: 'u2' }),
      ]),
    )
  })

  it('returns an empty array for a session with no messages', () => {
    expect(flattenSessionResponses({ sessionId: 's1', messages: {} })).toEqual([])
    expect(flattenSessionResponses({ sessionId: 's1' })).toEqual([])
  })
})

describe('partitionResponsesByTheme', () => {
  const responses = [
    { key: 's1:t1:m1', sessionId: 's1', topicId: 't1', messageId: 'm1', excerpt: 'a' },
    { key: 's1:t1:m2', sessionId: 's1', topicId: 't1', messageId: 'm2', excerpt: 'b' },
    { key: 's1:t1:m3', sessionId: 's1', topicId: 't1', messageId: 'm3', excerpt: 'c' },
  ]

  it('puts every response in unsorted when no themes exist', () => {
    const { unsorted, buckets } = partitionResponsesByTheme(responses, [])
    expect(unsorted).toHaveLength(3)
    expect(buckets).toEqual({})
  })

  it('moves tagged responses into their theme bucket, leaving the rest unsorted', () => {
    const themes = [
      {
        id: 'theme-1',
        responseRefs: [{ sessionId: 's1', topicId: 't1', messageId: 'm1' }],
      },
    ]
    const { unsorted, buckets } = partitionResponsesByTheme(responses, themes)
    expect(unsorted.map((r) => r.key)).toEqual(['s1:t1:m2', 's1:t1:m3'])
    expect(buckets['theme-1'].map((r) => r.key)).toEqual(['s1:t1:m1'])
  })

  it('creates an empty bucket for a theme with no tagged responses yet', () => {
    const themes = [{ id: 'theme-empty', responseRefs: [] }]
    const { buckets } = partitionResponsesByTheme(responses, themes)
    expect(buckets['theme-empty']).toEqual([])
  })

  it('ignores a ref that points at a response not present in this session', () => {
    const themes = [
      {
        id: 'theme-1',
        responseRefs: [{ sessionId: 's2', topicId: 't9', messageId: 'ghost' }],
      },
    ]
    const { unsorted, buckets } = partitionResponsesByTheme(responses, themes)
    expect(unsorted).toHaveLength(3)
    expect(buckets['theme-1']).toEqual([])
  })
})

describe('themesFromBuckets', () => {
  it('rebuilds responseRefs from bucket contents', () => {
    const themes = [{ id: 'theme-1', label: 'Theme One' }]
    const buckets = {
      'theme-1': [
        {
          key: 's1:t1:m1',
          sessionId: 's1',
          topicId: 't1',
          messageId: 'm1',
          participantId: 'u1',
          excerpt: 'a',
        },
      ],
    }
    const result = themesFromBuckets(themes, buckets)
    expect(result).toEqual([
      {
        id: 'theme-1',
        label: 'Theme One',
        responseRefs: [
          { sessionId: 's1', topicId: 't1', messageId: 'm1', participantId: 'u1', excerpt: 'a' },
        ],
      },
    ])
  })

  it('produces an empty responseRefs array for a theme with an empty bucket', () => {
    const result = themesFromBuckets([{ id: 'theme-1', label: 'Empty' }], {})
    expect(result[0].responseRefs).toEqual([])
  })
})
