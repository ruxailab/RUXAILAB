import {
  getEstimateComparisonStatus,
  getTaskAnswerOutcome,
} from '@/ux/UserTest/utils/taskAnalytics'

describe('task analytics helpers', () => {
  it('keeps unstarted tasks separate from unsuccessful attempts', () => {
    expect(getTaskAnswerOutcome(undefined)).toBe('notStarted')
    expect(getTaskAnswerOutcome({})).toBe('notStarted')
    expect(getTaskAnswerOutcome({ attempted: true })).toBe('couldNotFinish')
    expect(getTaskAnswerOutcome({ completed: true, success: false })).toBe(
      'couldNotFinish',
    )
    expect(getTaskAnswerOutcome({ completed: true })).toBe('success')
  })

  it('compares estimate values without rounding away small overruns', () => {
    expect(getEstimateComparisonStatus(1.04, 1)).toBe('overEstimate')
    expect(getEstimateComparisonStatus(0.99, 1)).toBe('underEstimate')
    expect(getEstimateComparisonStatus(1, 1)).toBe('withinEstimate')
    expect(getEstimateComparisonStatus(null, 1)).toBe('noData')
    expect(getEstimateComparisonStatus(1, null)).toBe('noEstimate')
  })
})
