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

  it('suggests cohesive groups only when they have multiple participants', () => {
    const messages = [
      message({ messageId: 'm1', participantId: 'p1', text: 'The navigation menu is confusing.' }),
      message({ messageId: 'm2', participantId: 'p2', text: 'Navigation menu confused me too.' }),
      message({ messageId: 'm3', participantId: 'p3', text: 'I find the navigation menu confusing.' }),
      message({ messageId: 'm4', participantId: 'p1', text: 'The checkout flow was fast and smooth.' }),
      message({ messageId: 'm5', participantId: 'p2', text: 'Checkout was smooth and quick for me.' }),
      message({ messageId: 'm6', participantId: 'p3', text: 'The checkout process felt fast and smooth.' }),
    ]
    const themes = extractThemes(messages, { k: 2 })
    expect(themes).toHaveLength(2)
    themes.forEach((theme) => {
      expect(theme.source).toBe('nlp')
      expect(theme.frequency).toBeGreaterThanOrEqual(2)
      expect(theme.responseRefs.length).toBeGreaterThanOrEqual(2)
      expect(theme.label.trim().split(/\s+/).length).toBeGreaterThan(1)
      expect(theme.responseRefs.some((ref) =>
        ref.excerpt.toLowerCase().includes(theme.label.toLowerCase()),
      )).toBe(true)
    })
  })

  it('does not invent clusters for a small topic sample', () => {
    const messages = [
      message({ messageId: 'm1', participantId: 'p1', text: 'Navigation was confusing.' }),
      message({ messageId: 'm2', participantId: 'p2', text: 'Navigation was hard.' }),
      message({ messageId: 'm3', participantId: 'p3', text: 'I disliked navigation.' }),
      message({ messageId: 'm4', participantId: 'p1', text: 'Finding things was difficult.' }),
    ]
    expect(extractThemes(messages)).toEqual([])
  })

  it('does not suggest themes supported by only one participant', () => {
    const messages = Array.from({ length: 6 }, (_, i) =>
      message({ messageId: `m${i}`, participantId: 'p1', text: `Navigation is confusing ${i}.` }),
    )
    expect(extractThemes(messages)).toEqual([])
  })

  it('keeps topic clusters separate and response references intact', () => {
    const messages = [
      ...[
        ['p1', 'The navigation menu is confusing.'],
        ['p2', 'Navigation menu confused me too.'],
        ['p3', 'I find the navigation menu confusing.'],
        ['p1', 'The checkout flow was fast and smooth.'],
        ['p2', 'Checkout was smooth and quick for me.'],
        ['p3', 'The checkout process felt fast and smooth.'],
      ].map(([participantId, text], i) => message({
        messageId: `topic-1-${i}`,
        participantId,
        text,
      })),
      ...[
        ['p1', 'The restaurant menu has many options.'],
        ['p2', 'Too many choices on the restaurant menu.'],
        ['p3', 'I struggle to choose from the restaurant menu.'],
        ['p1', 'Delivery arrived very quickly.'],
        ['p2', 'The food delivery was fast.'],
        ['p3', 'My delivery arrived quickly.'],
      ].map(([participantId, text], i) => message({
        messageId: `topic-2-${i}`,
        topicId: 'topic-2',
        participantId,
        text,
      })),
    ]

    const themes = extractThemes(messages, { k: 2 })
    expect(themes.length).toBeGreaterThan(0)
    themes.forEach((theme) => {
      expect(new Set(theme.responseRefs.map((ref) => ref.topicId)).size).toBe(1)
      expect(theme.id).toContain(theme.responseRefs[0].topicId)
    })
    expect(themes.flatMap((theme) => theme.responseRefs).every((ref) =>
      messages.some((source) => source.messageId === ref.messageId && source.text === ref.excerpt),
    )).toBe(true)
  })
})
