import { computeParticipation } from '@/ux/FocusGroup/utils/participation'

describe('computeParticipation', () => {
  it('returns an empty object when there are no messages', () => {
    expect(computeParticipation({})).toEqual({})
    expect(computeParticipation(undefined)).toEqual({})
  })

  it('splits participation evenly across two equally active participants', () => {
    const messages = {
      'topic-1': {
        m1: { userId: 'alice' },
        m2: { userId: 'bob' },
      },
      'topic-2': {
        m3: { userId: 'alice' },
        m4: { userId: 'bob' },
      },
    }

    expect(computeParticipation(messages)).toEqual({ alice: 50, bob: 50 })
  })

  it('weights participation by message share across all topics', () => {
    const messages = {
      'topic-1': {
        m1: { userId: 'alice' },
        m2: { userId: 'alice' },
        m3: { userId: 'bob' },
      },
      'topic-2': {
        m4: { userId: 'alice' },
      },
    }

    // alice: 3/4 = 75%, bob: 1/4 = 25%
    expect(computeParticipation(messages)).toEqual({ alice: 75, bob: 25 })
  })

  it('ignores messages with no userId', () => {
    const messages = {
      'topic-1': {
        m1: { userId: 'alice' },
        m2: { text: 'orphaned, no userId' },
      },
    }

    expect(computeParticipation(messages)).toEqual({ alice: 100 })
  })
})
