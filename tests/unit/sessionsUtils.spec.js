import {
  getSessionStatus,
  isWithinDateRange,
  SESSION_STATUSES,
} from '@/shared/utils/sessionsUtils'

describe('getSessionStatus', () => {
  it('reports a recorded lifecycle end before applying date-based status', () => {
    expect(getSessionStatus(new Date(), 'ended')).toBe(SESSION_STATUSES.ENDED)
    expect(getSessionStatus(null, 'ended')).toBe(SESSION_STATUSES.ENDED)
  })

  it('keeps date-based status for sessions without a lifecycle state', () => {
    expect(getSessionStatus(null)).toBe(SESSION_STATUSES.UNKNOWN)
    expect(getSessionStatus(new Date(), 'scheduled')).toBe(
      SESSION_STATUSES.TODAY,
    )
  })
})

describe('isWithinDateRange', () => {
  const range = [new Date(2026, 10, 1), new Date(2026, 10, 5)]

  it('includes sessions scheduled later in the day on the last selected date', () => {
    expect(
      isWithinDateRange(new Date(2026, 10, 5, 14, 30).toISOString(), range),
    ).toBe(true)
    expect(
      isWithinDateRange(new Date(2026, 10, 5, 23, 59).toISOString(), range),
    ).toBe(true)
  })

  it('excludes sessions outside the selected days', () => {
    expect(
      isWithinDateRange(new Date(2026, 9, 31, 23, 59).toISOString(), range),
    ).toBe(false)
    expect(
      isWithinDateRange(new Date(2026, 10, 6, 0, 0).toISOString(), range),
    ).toBe(false)
  })

  it('keeps every session while no full range is selected', () => {
    const date = new Date(2026, 10, 9).toISOString()
    expect(isWithinDateRange(date, [])).toBe(true)
    expect(isWithinDateRange(date, [new Date(2026, 10, 1)])).toBe(true)
    expect(isWithinDateRange(null, range)).toBe(true)
  })
})
