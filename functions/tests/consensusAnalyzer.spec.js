import { computeConsensus } from '../src/features/focusGroupAnalysis/consensusAnalyzer.js'

describe('computeConsensus', () => {
  it('scores near-identical responses as high consensus with no divergence points', () => {
    const responses = [
      { participantId: 'p1', text: 'The navigation menu is confusing and hard to find.' },
      { participantId: 'p2', text: 'I also found the navigation menu confusing and hard to find.' },
      { participantId: 'p3', text: 'Navigation menu was confusing, hard to find things.' },
    ]
    const result = computeConsensus(responses)
    expect(result.score).toBeGreaterThan(0.5)
    expect(result.divergencePoints).toHaveLength(0)
  })

  it('flags a clear outlier as a divergence point without dropping the shared opinion', () => {
    const responses = [
      { participantId: 'p1', text: 'The checkout flow was smooth and fast for me.' },
      { participantId: 'p2', text: 'Checkout flow felt smooth and fast, no complaints.' },
      { participantId: 'p3', text: 'The pricing page had a broken image and outdated copyright year in the footer.' },
    ]
    const result = computeConsensus(responses)
    expect(result.divergencePoints).toHaveLength(1)
    expect(result.sharedOpinions).toHaveLength(1)
    expect(result.sharedOpinions[0].supportingParticipants).toEqual(['p1', 'p2'])
  })

  it('handles fewer than two responses without dividing by zero', () => {
    expect(computeConsensus([])).toEqual({
      score: 0,
      sharedOpinions: [],
      divergencePoints: [],
      alignment: {},
    })
    expect(
      computeConsensus([{ participantId: 'p1', text: 'Solo response.' }]),
    ).toEqual({
      score: 1,
      sharedOpinions: [],
      divergencePoints: [],
      alignment: { p1: 1 },
    })
  })

  it('gives every participant an alignment score, lower for the outlier', () => {
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
