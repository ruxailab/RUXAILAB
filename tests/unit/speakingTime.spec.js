import { applyActiveSpeakersChange } from '@/ux/FocusGroup/utils/speakingTime'

describe('applyActiveSpeakersChange', () => {
  it('starts timing a newly-speaking identity without accumulating anything yet', () => {
    const result = applyActiveSpeakersChange({
      accumulatedMs: {},
      activeSince: {},
      speakingIdentities: ['alice'],
      now: 1000,
    })
    expect(result.accumulatedMs).toEqual({})
    expect(result.activeSince).toEqual({ alice: 1000 })
  })

  it('accumulates elapsed time when a speaker stops', () => {
    const result = applyActiveSpeakersChange({
      accumulatedMs: {},
      activeSince: { alice: 1000 },
      speakingIdentities: [],
      now: 4000,
    })
    expect(result.accumulatedMs).toEqual({ alice: 3000 })
    expect(result.activeSince).toEqual({})
  })

  it('adds to existing accumulated time rather than overwriting it', () => {
    const result = applyActiveSpeakersChange({
      accumulatedMs: { alice: 2000 },
      activeSince: { alice: 5000 },
      speakingIdentities: [],
      now: 7500,
    })
    expect(result.accumulatedMs).toEqual({ alice: 4500 })
  })

  it('does not double-count a speaker who is still speaking across two updates', () => {
    const first = applyActiveSpeakersChange({
      accumulatedMs: {},
      activeSince: {},
      speakingIdentities: ['alice'],
      now: 1000,
    })
    // A second "still speaking" update should not reset the start time.
    const second = applyActiveSpeakersChange({
      accumulatedMs: first.accumulatedMs,
      activeSince: first.activeSince,
      speakingIdentities: ['alice'],
      now: 2000,
    })
    expect(second.activeSince).toEqual({ alice: 1000 })
    expect(second.accumulatedMs).toEqual({})
  })

  it('tracks multiple simultaneous speakers independently', () => {
    const started = applyActiveSpeakersChange({
      accumulatedMs: {},
      activeSince: {},
      speakingIdentities: ['alice', 'bob'],
      now: 0,
    })
    const aliceStops = applyActiveSpeakersChange({
      accumulatedMs: started.accumulatedMs,
      activeSince: started.activeSince,
      speakingIdentities: ['bob'],
      now: 1000,
    })
    const bobStops = applyActiveSpeakersChange({
      accumulatedMs: aliceStops.accumulatedMs,
      activeSince: aliceStops.activeSince,
      speakingIdentities: [],
      now: 3000,
    })
    expect(bobStops.accumulatedMs).toEqual({ alice: 1000, bob: 3000 })
  })

  it('does not mutate the input accumulatedMs/activeSince objects', () => {
    const accumulatedMs = { alice: 100 }
    const activeSince = { bob: 500 }
    applyActiveSpeakersChange({
      accumulatedMs,
      activeSince,
      speakingIdentities: [],
      now: 1500,
    })
    expect(accumulatedMs).toEqual({ alice: 100 })
    expect(activeSince).toEqual({ bob: 500 })
  })
})
