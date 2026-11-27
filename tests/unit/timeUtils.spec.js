import {
  formatTime,
  formatTimeDetailed,
  formatTimeDetailedFromMs,
} from '@/shared/utils/timeUtils'

describe('timeUtils', () => {
  describe('formatTime', () => {
    it('returns "0:00" for 0', () => {
      expect(formatTime(0)).toBe('0:00')
    })

    it('returns "0:00" for negative numbers', () => {
      expect(formatTime(-10)).toBe('0:00')
      expect(formatTime(-1)).toBe('0:00')
    })

    it('returns "0:00" for null and undefined', () => {
      expect(formatTime(null)).toBe('0:00')
      expect(formatTime(undefined)).toBe('0:00')
    })

    it('returns "0:00" for NaN and Infinity', () => {
      expect(formatTime(NaN)).toBe('0:00')
      expect(formatTime(Infinity)).toBe('0:00')
      expect(formatTime(-Infinity)).toBe('0:00')
    })

    it('returns "0:00" for non-numeric strings', () => {
      expect(formatTime('abc')).toBe('0:00')
      expect(formatTime('invalid')).toBe('0:00')
      expect(formatTime('')).toBe('0:00')
    })

    it('formats seconds under one minute with padding', () => {
      expect(formatTime(5)).toBe('0:05')
      expect(formatTime(45)).toBe('0:45')
      expect(formatTime(59)).toBe('0:59')
    })

    it('formats minutes and seconds under one hour', () => {
      expect(formatTime(60)).toBe('1:00')
      expect(formatTime(125)).toBe('2:05')
      expect(formatTime(150)).toBe('2:30')
      expect(formatTime(3599)).toBe('59:59')
    })

    it('coerces valid numeric strings', () => {
      expect(formatTime('125')).toBe('2:05')
      expect(formatTime('3665')).toBe('1:01:05')
    })

    it('floors fractional seconds', () => {
      expect(formatTime(125.7)).toBe('2:05')
      expect(formatTime(59.9)).toBe('0:59')
    })

    it('formats durations >= 1 hour in H:MM:SS format', () => {
      expect(formatTime(3600)).toBe('1:00:00')
      expect(formatTime(3665)).toBe('1:01:05')
      expect(formatTime(7200)).toBe('2:00:00')
      expect(formatTime(7325)).toBe('2:02:05')
      expect(formatTime(36650)).toBe('10:10:50')
    })
  })

  describe('formatTimeDetailed', () => {
    it('returns fallback structure for 0 and negative numbers', () => {
      const fallback = {
        formatedTime: '0:00',
        formattedTime: '0:00',
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
      expect(formatTimeDetailed(0)).toEqual(fallback)
      expect(formatTimeDetailed(-50)).toEqual(fallback)
    })

    it('returns fallback structure for invalid or non-numeric inputs', () => {
      const fallback = {
        formatedTime: '0:00',
        formattedTime: '0:00',
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
      expect(formatTimeDetailed(null)).toEqual(fallback)
      expect(formatTimeDetailed(undefined)).toEqual(fallback)
      expect(formatTimeDetailed('invalid')).toEqual(fallback)
      expect(formatTimeDetailed(NaN)).toEqual(fallback)
    })

    it('breaks down durations under 1 hour correctly', () => {
      expect(formatTimeDetailed(125)).toEqual({
        formatedTime: '2:05',
        formattedTime: '2:05',
        hours: 0,
        minutes: 2,
        seconds: 5,
      })
    })

    it('breaks down durations >= 1 hour correctly and includes hours in formatted time', () => {
      expect(formatTimeDetailed(3665)).toEqual({
        formatedTime: '1:01:05',
        formattedTime: '1:01:05',
        hours: 1,
        minutes: 1,
        seconds: 5,
      })
      expect(formatTimeDetailed(7200)).toEqual({
        formatedTime: '2:00:00',
        formattedTime: '2:00:00',
        hours: 2,
        minutes: 0,
        seconds: 0,
      })
    })
  })

  describe('formatTimeDetailedFromMs', () => {
    it('returns fallback structure for 0 and negative ms', () => {
      const fallback = {
        formatedTime: '0:00',
        formattedTime: '0:00',
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
      expect(formatTimeDetailedFromMs(0)).toEqual(fallback)
      expect(formatTimeDetailedFromMs(-5000)).toEqual(fallback)
    })

    it('returns fallback structure for invalid ms', () => {
      const fallback = {
        formatedTime: '0:00',
        formattedTime: '0:00',
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
      expect(formatTimeDetailedFromMs(null)).toEqual(fallback)
      expect(formatTimeDetailedFromMs(undefined)).toEqual(fallback)
      expect(formatTimeDetailedFromMs('abc')).toEqual(fallback)
    })

    it('converts milliseconds to detailed time breakdown correctly', () => {
      expect(formatTimeDetailedFromMs(65000)).toEqual({
        formatedTime: '1:05',
        formattedTime: '1:05',
        hours: 0,
        minutes: 1,
        seconds: 5,
      })

      expect(formatTimeDetailedFromMs(3665000)).toEqual({
        formatedTime: '1:01:05',
        formattedTime: '1:01:05',
        hours: 1,
        minutes: 1,
        seconds: 5,
      })
    })
  })
})
