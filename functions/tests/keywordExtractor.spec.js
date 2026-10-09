import { extractKeywords } from '../src/features/focusGroupAnalysis/keywordExtractor.js'

describe('extractKeywords', () => {
  it('keeps informative multi-word phrases and drops isolated generic words', () => {
    const text =
      'Navigation confusion is the main issue. Users reported navigation confusion on every page. The layout itself is fine.'
    const keywords = extractKeywords(text, { maxKeywords: 5 })
    expect(keywords).toContain('navigation confusion')
    expect(keywords).not.toContain('layout')
    expect(keywords).not.toContain('fine')
  })

  it('filters generic reactions and modifiers while retaining useful UX concepts', () => {
    const text =
      'The layout felt clean and easy to scan. I noticed the color contrast right away — nice. Took me a second to find the search bar. The checkout flow had too many steps. I liked the autosave — never lost my progress. The confirmation screen was confusing, unclear what happened next. A summary before the final submit would help.'
    const keywords = extractKeywords(text, { maxKeywords: 12 })

    expect(keywords).toEqual(
      expect.arrayContaining([
        'layout clean',
        'color contrast',
        'search bar',
        'checkout flow',
        'too many steps',
        'summary before final submit',
        'confirmation screen confusing',
        'autosave never lost progress',
      ]),
    )
    expect(keywords).not.toContain('easy')
    expect(keywords).not.toContain('scan')
    expect(keywords).not.toContain('many steps')
    expect(keywords).not.toContain('final submit')
    expect(keywords).not.toContain('happened next')
    expect(keywords.every((phrase) => phrase.split(' ').length > 1)).toBe(true)
    expect(keywords.slice(0, 3)).toEqual(
      expect.arrayContaining([
        'too many steps',
        'summary before final submit',
        'confirmation screen confusing',
      ]),
    )
    expect(keywords.indexOf('too many steps')).toBeLessThan(keywords.indexOf('checkout flow'))
  })

  it('keeps phrase boundaries at sentence punctuation instead of merging across sentences', () => {
    const text = 'Alpha bravo. Charlie delta.'
    expect(extractKeywords(text, { maxKeywords: 5 })).toEqual(
      expect.arrayContaining(['alpha bravo', 'charlie delta']),
    )
    expect(extractKeywords(text)).not.toContain('bravo charlie')
  })

  it('returns an empty array for empty input', () => {
    expect(extractKeywords('')).toEqual([])
  })

  it('respects maxKeywords', () => {
    const text = 'Alpha bravo. Charlie delta. Echo foxtrot. Golf hotel.'
    expect(extractKeywords(text, { maxKeywords: 2 })).toHaveLength(2)
  })
})
