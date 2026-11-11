import {
  getMinScheduleTime,
  isPastSchedule,
  toLocalDate,
} from '@/shared/utils/sessionSchedule'

// Nov 11, 2026, 09:05:30 local time
const NOW = new Date(2026, 10, 11, 9, 5, 30)

describe('getMinScheduleTime', () => {
  it('limits today to the current time, zero-padded', () => {
    expect(getMinScheduleTime(new Date(2026, 10, 11), NOW)).toBe('09:05')
  })

  it('does not limit later days', () => {
    expect(getMinScheduleTime(new Date(2026, 10, 12), NOW)).toBe('00:00')
  })

  it('reads a "YYYY-MM-DD" date picker value as a local date', () => {
    expect(getMinScheduleTime('2026-11-11', NOW)).toBe('09:05')
    expect(getMinScheduleTime('2026-11-12', NOW)).toBe('00:00')
  })

  it('does not limit an invalid date', () => {
    expect(getMinScheduleTime('not a date', NOW)).toBe('00:00')
  })
})

describe('toLocalDate', () => {
  it('keeps the calendar day of a "YYYY-MM-DD" string', () => {
    const date = toLocalDate('2026-11-11')
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
      2026, 10, 11,
    ])
  })
})

describe('isPastSchedule', () => {
  it('treats an earlier minute as past', () => {
    expect(isPastSchedule(new Date(2026, 10, 11, 9, 4), NOW)).toBe(true)
    expect(isPastSchedule(new Date(2026, 10, 10, 18, 0), NOW)).toBe(true)
  })

  it('treats the current minute and later as upcoming', () => {
    expect(isPastSchedule(new Date(2026, 10, 11, 9, 5), NOW)).toBe(false)
    expect(isPastSchedule(new Date(2026, 10, 11, 9, 6), NOW)).toBe(false)
    expect(isPastSchedule(new Date(2026, 10, 12, 0, 0), NOW)).toBe(false)
  })
})
