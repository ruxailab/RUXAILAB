import {
  computeTfIdf,
  cosineSimilarity,
  splitSentences,
  termFrequency,
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

describe('termFrequency', () => {
  it('counts words that match inherited object properties', () => {
    expect(termFrequency(['constructor', 'constructor', 'checkout'])).toEqual({
      constructor: 2,
      checkout: 1,
    })
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

  it('keeps inherited-property words as finite numeric weights', () => {
    const vectors = computeTfIdf([
      ['constructor', 'constructor', 'checkout'],
      ['constructor', 'font'],
    ])
    expect(vectors[0].constructor).toBeCloseTo(2 / 3)
    expect(vectors[1].constructor).toBeCloseTo(1 / 2)
    expect(
      vectors.every((vector) => Object.values(vector).every(Number.isFinite)),
    ).toBe(true)
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

  it('does not treat an inherited property as a shared term', () => {
    expect(cosineSimilarity({ constructor: 1 }, { checkout: 1 })).toBe(0)
  })

  it('is 0 when either vector is empty', () => {
    expect(cosineSimilarity({}, { a: 1 })).toBe(0)
  })
})
