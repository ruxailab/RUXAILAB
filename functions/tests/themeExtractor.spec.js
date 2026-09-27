import { extractThemes } from '../src/features/focusGroupAnalysis/themeExtractor.js'

const message = (overrides) => ({
  sessionId: 'session-1',
  topicId: 'topic-1',
  messageId: `m-${Math.random()}`,
  participantId: 'p1',
  text: '',
  ...overrides,
})

describe('extractThemes', () => {
  it('returns an empty array for no messages', () => {
    expect(extractThemes([])).toEqual([])
  })

  it('groups messages into the requested number of clusters', () => {
    const messages = [
      message({ messageId: 'm1', participantId: 'p1', text: 'The navigation menu is confusing.' }),
      message({ messageId: 'm2', participantId: 'p2', text: 'Navigation menu confused me too.' }),
      message({ messageId: 'm3', participantId: 'p1', text: 'The checkout flow was fast and smooth.' }),
      message({ messageId: 'm4', participantId: 'p2', text: 'Checkout was smooth and quick for me.' }),
    ]
    const themes = extractThemes(messages, { k: 2 })
    expect(themes).toHaveLength(2)
    themes.forEach((theme) => {
      expect(theme.source).toBe('nlp')
      expect(theme.responseRefs.length).toBeGreaterThan(0)
    })
  })

  it('keeps each responseRef pointing at its original message for board compatibility', () => {
    const messages = [
      message({ messageId: 'm1', participantId: 'p1', text: 'Navigation was confusing.' }),
    ]
    const [theme] = extractThemes(messages, { k: 1 })
    expect(theme.responseRefs[0]).toEqual({
      sessionId: 'session-1',
      topicId: 'topic-1',
      messageId: 'm1',
      participantId: 'p1',
      excerpt: 'Navigation was confusing.',
    })
  })

  it('never requests more clusters than there are messages', () => {
    const messages = [message({ messageId: 'm1', text: 'Only one message here.' })]
    const themes = extractThemes(messages, { k: 5 })
    expect(themes).toHaveLength(1)
  })
})
