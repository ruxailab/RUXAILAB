import {
  computeParticipation,
  countMessagesByUser,
} from '@/ux/FocusGroup/utils/participation'

describe('countMessagesByUser', () => {
  it('returns an empty object when there are no messages', () => {
    expect(countMessagesByUser({})).toEqual({})
    expect(countMessagesByUser(undefined)).toEqual({})
  })

  it('counts messages per author across all topics', () => {
    const messages = {
      'topic-1': { m1: { userId: 'alice' }, m2: { userId: 'bob' } },
      'topic-2': { m3: { userId: 'alice' } },
    }
    expect(countMessagesByUser(messages)).toEqual({ alice: 2, bob: 1 })
  })

  it('ignores messages with no userId', () => {
    const messages = {
      'topic-1': { m1: { userId: 'alice' }, m2: { text: 'orphaned' } },
    }
    expect(countMessagesByUser(messages)).toEqual({ alice: 1 })
  })
})

describe('computeParticipation', () => {
  it('returns an empty object when there are no messages and no speaking time', () => {
    expect(computeParticipation({})).toEqual({})
    expect(computeParticipation({ messages: {}, speakingMs: {} })).toEqual({})
    expect(computeParticipation()).toEqual({})
  })

  describe('message-only (no one has spoken yet)', () => {
    it('splits participation evenly across two equally active participants', () => {
      const messages = {
        'topic-1': { m1: { userId: 'alice' }, m2: { userId: 'bob' } },
        'topic-2': { m3: { userId: 'alice' }, m4: { userId: 'bob' } },
      }
      expect(computeParticipation({ messages })).toEqual({ alice: 50, bob: 50 })
    })

    it('weights participation by message share across all topics', () => {
      const messages = {
        'topic-1': {
          m1: { userId: 'alice' },
          m2: { userId: 'alice' },
          m3: { userId: 'bob' },
        },
        'topic-2': { m4: { userId: 'alice' } },
      }
      // alice: 3/4 = 75%, bob: 1/4 = 25%
      expect(computeParticipation({ messages })).toEqual({ alice: 75, bob: 25 })
    })
  })

  describe('speaking-only (no one has typed yet)', () => {
    it('uses speaking share alone when there are no messages', () => {
      const speakingMs = { alice: 3000, bob: 1000 }
      expect(computeParticipation({ messages: {}, speakingMs })).toEqual({
        alice: 75,
        bob: 25,
      })
    })
  })

  describe('blended (both signals present)', () => {
    it('averages message share and speaking share per participant', () => {
      // alice: 100% of messages, 0% of speaking -> (100 + 0) / 2 = 50
      // bob:     0% of messages, 100% of speaking -> (0 + 100) / 2 = 50
      const messages = { 'topic-1': { m1: { userId: 'alice' } } }
      const speakingMs = { bob: 5000 }
      expect(computeParticipation({ messages, speakingMs })).toEqual({
        alice: 50,
        bob: 50,
      })
    })

    it('does not let a silent typist erase a heavy talker', () => {
      // Without blending, bob (1 short message) would read as "more active"
      // than alice, who spoke the whole time but never typed.
      const messages = {
        'topic-1': { m1: { userId: 'bob' } },
      }
      const speakingMs = { alice: 60000 }
      const result = computeParticipation({ messages, speakingMs })
      expect(result.alice).toBeGreaterThan(0)
      expect(result.alice).toBe(50)
    })

    it('includes a participant who only appears in one of the two signals', () => {
      const messages = {
        'topic-1': { m1: { userId: 'alice' }, m2: { userId: 'carol' } },
      }
      const speakingMs = { bob: 2000 }
      const result = computeParticipation({ messages, speakingMs })
      expect(Object.keys(result).sort()).toEqual(['alice', 'bob', 'carol'])
    })
  })
})
