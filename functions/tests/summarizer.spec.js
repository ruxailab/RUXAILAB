import { summarize } from '../src/features/focusGroupAnalysis/summarizer.js'

describe('summarize', () => {
  it('returns the full text unchanged when already within the sentence limit', () => {
    const text = 'The nav is confusing. It took a while to find search.'
    expect(summarize(text, { maxSentences: 3 })).toBe(text)
  })

  it('picks a subset of the original sentences, in original order', () => {
    const sentences = [
      'The navigation menu is confusing to first-time users.',
      'Several participants mentioned the search bar is hard to find.',
      'The color scheme received positive feedback from most participants.',
      'One participant suggested moving the search bar to the top.',
      'The checkout flow was described as straightforward by everyone.',
    ]
    const text = sentences.join(' ')
    const summary = summarize(text, { maxSentences: 2 })
    const chosen = summary.split(/(?<=[.!?])\s+/)

    expect(chosen).toHaveLength(2)
    chosen.forEach((sentence) => expect(sentences).toContain(sentence))
    const firstIndex = sentences.indexOf(chosen[0])
    const secondIndex = sentences.indexOf(chosen[1])
    expect(firstIndex).toBeLessThan(secondIndex)
  })

  it('returns an empty string for empty input', () => {
    expect(summarize('')).toBe('')
  })
})
