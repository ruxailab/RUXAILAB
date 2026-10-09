import { computeConsensus } from '../src/features/focusGroupAnalysis/consensusAnalyzer.js'

describe('computeConsensus', () => {
  it('reports quote-backed shared stance cues separately from wording similarity', () => {
    const responses = [
      { participantId: 'p1', text: 'The navigation menu is confusing and hard to find.' },
      { participantId: 'p2', text: 'I also found the navigation menu confusing and hard to find.' },
      { participantId: 'p3', text: 'Navigation menu was confusing, hard to find things.' },
    ]
    const result = computeConsensus(responses)
    expect(result.score).toBeGreaterThan(0.5)
    expect(result.respondentCount).toBe(3)
    expect(result.divergencePoints).toHaveLength(0)
    expect(result.sharedOpinions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        aspect: 'navigation menu',
        stance: 'negative',
        evidence: expect.arrayContaining([
          expect.objectContaining({ participantId: 'p1', quote: 'The navigation menu is confusing and hard to find.' }),
          expect.objectContaining({ participantId: 'p2' }),
        ]),
      }),
    ]))
  })

  it('does not infer agreement or disagreement from a lexical outlier', () => {
    const responses = [
      { participantId: 'p1', text: 'The checkout flow was smooth and fast for me.' },
      { participantId: 'p2', text: 'Checkout flow felt smooth and fast, no complaints.' },
      { participantId: 'p3', text: 'The pricing page had a broken image and outdated copyright year in the footer.' },
    ]
    const result = computeConsensus(responses)
    expect(result.divergencePoints).toHaveLength(0)
    expect(result.sharedOpinions.some(({ aspect, stance }) => aspect === 'checkout flow' && stance === 'positive')).toBe(true)
    expect(result.alignment.p3).toBeLessThan(result.alignment.p1)
  })

  it('surfaces divergent explicit views about a shared aspect with source quotes', () => {
    const result = computeConsensus([
      { participantId: 'p1', text: 'The navigation menu is confusing.' },
      { participantId: 'p2', text: 'The navigation menu is clear.' },
      { participantId: 'p3', text: 'The navigation menu is easy to use.' },
    ])

    expect(result.divergencePoints).toEqual(expect.arrayContaining([
      expect.objectContaining({
        aspect: 'navigation menu',
        positions: {
          positive: expect.arrayContaining([expect.objectContaining({ participantId: 'p2' })]),
          negative: expect.arrayContaining([expect.objectContaining({ participantId: 'p1' })]),
        },
      }),
    ]))
  })

  it('does not turn lexical overlap or one participant mixed cues into stance findings', () => {
    const result = computeConsensus([
      { participantId: 'p1', text: 'Navigation menu is easy but confusing.' },
      { participantId: 'p2', text: 'I use the navigation menu every day.' },
      { participantId: 'p3', text: 'The navigation menu is available.' },
    ])

    expect(result.sharedOpinions).toHaveLength(0)
    expect(result.divergencePoints).toHaveLength(0)
  })

  it('handles explicit negation instead of treating it as positive wording', () => {
    const result = computeConsensus([
      { participantId: 'p1', text: 'The search is not easy.' },
      { participantId: 'p2', text: 'Search is difficult.' },
    ])

    expect(result.sharedOpinions).toEqual(expect.arrayContaining([
      expect.objectContaining({ aspect: 'search', stance: 'negative' }),
    ]))
  })

  it('recognizes explicit overload wording without treating neutral verbs as sentiment', () => {
    const result = computeConsensus([
      { participantId: 'p1', text: 'The checkout flow has too many steps.' },
      { participantId: 'p2', text: 'I found the checkout flow has too many steps.' },
    ])

    expect(result.sharedOpinions).toEqual(expect.arrayContaining([
      expect.objectContaining({ aspect: 'checkout flow steps', stance: 'negative' }),
    ]))
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
