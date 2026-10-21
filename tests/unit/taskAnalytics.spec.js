import {
  getAdditionalTimePercentage,
  getAverageTaskEfficiencyPercentage,
  getEstimateComparisonStatus,
  getTimeEfficiencyPercentage,
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

  it('calculates time efficiency and overrun against the estimate', () => {
    const averageTimeMinutes = 176 / 60
    const estimatedTimeMinutes = 1

    expect(
      getTimeEfficiencyPercentage(averageTimeMinutes, estimatedTimeMinutes),
    ).toBeCloseTo(34.1, 1)
    expect(
      getAdditionalTimePercentage(averageTimeMinutes, estimatedTimeMinutes),
    ).toBeCloseTo(193.3, 1)
  })

  it('does not calculate time efficiency when timing or estimate is invalid', () => {
    expect(getTimeEfficiencyPercentage(null, 1)).toBeNull()
    expect(getTimeEfficiencyPercentage(1, 0)).toBeNull()
    expect(getAdditionalTimePercentage(2, 0)).toBeNull()
  })

  it('averages task efficiency percentages equally and ignores missing estimates', () => {
    expect(getAverageTaskEfficiencyPercentage([50, 100, null])).toBe(75)
    expect(
      getAverageTaskEfficiencyPercentage([
        getTimeEfficiencyPercentage(176 / 60, 1),
        100,
      ]),
    ).toBeCloseTo(67.05, 2)
    expect(getAverageTaskEfficiencyPercentage([null, NaN])).toBeNull()
  })
})
