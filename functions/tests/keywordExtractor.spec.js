import { extractKeywords } from '../src/features/focusGroupAnalysis/keywordExtractor.js'

describe('extractKeywords', () => {
  it('ranks phrases built from a repeated term above an unrelated single word', () => {
    const text =
      'Navigation confusion is the main issue. Users reported navigation confusion on every page. The layout itself is fine.'
    const keywords = extractKeywords(text, { maxKeywords: 5 })
    expect(keywords).toContain('navigation confusion')
    expect(keywords.indexOf('navigation confusion')).toBeLessThan(
      keywords.indexOf('layout'),
    )
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
