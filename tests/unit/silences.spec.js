import { findSilences, speechIntervals } from '@/ux/UserTest/utils/silences'

describe('silences', () => {
  it('merges both speakers and drops invalid segments', () => {
    const run = {
      evaluator: {
        segments: [
          { start: 1, end: 2 },
          { start: 5, end: 5 },
        ],
      },
      moderator: {
        segments: [
          { start: 'x', end: 3 },
          { start: 3, end: 4 },
        ],
      },
    }
    expect(speechIntervals(run)).toEqual([
      { start: 1, end: 2 },
      { start: 3, end: 4 },
    ])
    expect(speechIntervals(null)).toEqual([])
  })

  it('finds long gaps, including leading and trailing ones', () => {
    const intervals = [
      { start: 30, end: 32 },
      { start: 6, end: 10 },
      { start: 9, end: 25 },
      { start: 34, end: 40 },
    ]
    expect(findSilences(intervals, { duration: 50 })).toEqual([
      { start: 0, end: 6 },
      { start: 25, end: 30 },
      { start: 40, end: 50 },
    ])
    expect(findSilences(intervals)).toEqual([
      { start: 0, end: 6 },
      { start: 25, end: 30 },
    ])
  })

  it('returns nothing without speech', () => {
    expect(findSilences([], { duration: 60 })).toEqual([])
  })
})
