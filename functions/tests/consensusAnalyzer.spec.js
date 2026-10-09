import { computeConsensus } from '../src/features/focusGroupAnalysis/consensusAnalyzer.js'

describe('computeConsensus', () => {
  it('scores near-identical wording as high text similarity without calling it consensus', () => {
    const responses = [
      { participantId: 'p1', text: 'The navigation menu is confusing and hard to find.' },
      { participantId: 'p2', text: 'I also found the navigation menu confusing and hard to find.' },
      { participantId: 'p3', text: 'Navigation menu was confusing, hard to find things.' },
    ]
    const result = computeConsensus(responses)
    expect(result.score).toBeGreaterThan(0.5)
    expect(result.respondentCount).toBe(3)
    expect(result.divergencePoints).toHaveLength(0)
    expect(result.sharedOpinions).toHaveLength(0)
  })

  it('does not infer agreement or disagreement from a lexical outlier', () => {
    const responses = [
      { participantId: 'p1', text: 'The checkout flow was smooth and fast for me.' },
      { participantId: 'p2', text: 'Checkout flow felt smooth and fast, no complaints.' },
      { participantId: 'p3', text: 'The pricing page had a broken image and outdated copyright year in the footer.' },
    ]
    const result = computeConsensus(responses)
    expect(result.divergencePoints).toHaveLength(0)
    expect(result.sharedOpinions).toHaveLength(0)
    expect(result.alignment.p3).toBeLessThan(result.alignment.p1)
  })

  it('does not report consensus until at least two people have responded', () => {
    expect(computeConsensus([])).toEqual({
      score: null,
      respondentCount: 0,
      sharedOpinions: [],
      divergencePoints: [],
      alignment: {},
    })
    expect(
      computeConsensus([{ participantId: 'p1', text: 'Solo response.' }]),
    ).toEqual({
      score: null,
      respondentCount: 1,
      sharedOpinions: [],
      divergencePoints: [],
      alignment: {},
    })
  })

  it('gives every participant a text-similarity score, lower for different wording', () => {
    const responses = [
      { participantId: 'p1', text: 'The checkout flow was smooth and fast for me.' },
      { participantId: 'p2', text: 'Checkout flow felt smooth and fast, no complaints.' },
      { participantId: 'p3', text: 'The pricing page had a broken image and outdated copyright year in the footer.' },
    ]
    const { alignment } = computeConsensus(responses)
    expect(Object.keys(alignment).sort()).toEqual(['p1', 'p2', 'p3'])
    expect(alignment.p3).toBeLessThan(alignment.p1)
    expect(alignment.p3).toBeLessThan(alignment.p2)
  })
})
