import {
  computeTfIdf,
  cosineSimilarity,
  splitSentences,
  tokenize,
} from '../src/features/focusGroupAnalysis/textVectorize.js'

describe('tokenize', () => {
  it('lowercases, strips punctuation, and drops stopwords', () => {
    expect(tokenize('The Navigation is confusing!')).toEqual([
      'navigation',
      'confusing',
    ])
  })

  it('returns an empty array for empty input', () => {
    expect(tokenize('')).toEqual([])
    expect(tokenize(null)).toEqual([])
  })
})

describe('splitSentences', () => {
  it('splits on sentence-ending punctuation', () => {
    expect(splitSentences('The nav is confusing. It took a while to find it!')).toEqual([
      'The nav is confusing.',
      'It took a while to find it!',
    ])
  })
})

describe('computeTfIdf', () => {
  it('gives a term unique to one document a higher weight than a term shared by all', () => {
    const docs = [
      ['navigation', 'confusing', 'menu'],
      ['navigation', 'clear'],
      ['navigation', 'easy'],
    ]
    const [vectorA] = computeTfIdf(docs)
    expect(vectorA.confusing).toBeGreaterThan(vectorA.navigation)
  })
})

describe('cosineSimilarity', () => {
  it('is 1 for identical vectors', () => {
    const v = { a: 1, b: 2 }
    expect(cosineSimilarity(v, v)).toBeCloseTo(1)
  })

  it('is 0 for vectors with no shared terms', () => {
    expect(cosineSimilarity({ a: 1 }, { b: 1 })).toBe(0)
  })

  it('is 0 when either vector is empty', () => {
    expect(cosineSimilarity({}, { a: 1 })).toBe(0)
  })
})
