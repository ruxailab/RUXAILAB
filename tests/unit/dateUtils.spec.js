import {
  formatDateLong,
  formatDateTime,
  formatDate,
  formatTime,
  toSortableTimestamp,
} from '@/shared/utils/dateUtils'

describe('dateUtils', () => {
  const testDate = new Date(2026, 10, 20, 14, 30, 0) // 20 Nov 2026 14:30

  describe('formatDateLong', () => {
    it('formats a Date object correctly', () => {
      const result = formatDateLong(testDate, 'en')
      expect(result).toContain('2026')
      expect(result).toContain('November')
    })

    it('normalizes locale with underscores', () => {
      const result = formatDateLong(testDate, 'pt_BR')
      expect(result).not.toBe('-')
    })

    it('handles plain serialized Firestore timestamp object', () => {
      const plainTimestamp = {
        seconds: Math.floor(testDate.getTime() / 1000),
        nanoseconds: 0,
      }
      const result = formatDateLong(plainTimestamp, 'en')
      expect(result).not.toBe('-')
      expect(result).toContain('2026')
    })

    it('returns fallback for invalid or null input', () => {
      expect(formatDateLong(null)).toBe('-')
      expect(formatDateLong('invalid-date')).toBe('-')
      expect(formatDateLong({})).toBe('-')
    })
  })

  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const result = formatDateTime(testDate, 'en')
      expect(result).toContain('2026')
      expect(result).not.toBe('-')
    })

    it('safely normalizes locale with underscores (e.g. pt_BR) without throwing RangeError', () => {
      // In V8, toLocaleString('pt_BR') throws RangeError unless normalized to 'pt-BR'
      const result = formatDateTime(testDate, 'pt_BR')
      expect(result).not.toBe('-')
    })

    it('formats plain serialized Firestore timestamp { seconds } without returning fallback', () => {
      const plainTimestamp = {
        seconds: Math.floor(testDate.getTime() / 1000),
        nanoseconds: 0,
      }
      const result = formatDateTime(plainTimestamp, 'en')
      expect(result).not.toBe('-')
      expect(result).toContain('2026')
    })

    it('formats admin SDK timestamp { _seconds }', () => {
      const adminTimestamp = {
        _seconds: Math.floor(testDate.getTime() / 1000),
        _nanoseconds: 0,
      }
      const result = formatDateTime(adminTimestamp, 'en')
      expect(result).not.toBe('-')
      expect(result).toContain('2026')
    })

    it('returns fallback for invalid date', () => {
      expect(formatDateTime(null)).toBe('-')
      expect(formatDateTime(undefined)).toBe('-')
      expect(formatDateTime('invalid')).toBe('-')
    })
  })

  describe('formatDate and formatTime', () => {
    it('formats date as DD/MM/YYYY', () => {
      const result = formatDate(testDate)
      expect(result).toBe('20/11/2026')
    })

    it('formats time as HH:MM', () => {
      const result = formatTime(testDate)
      expect(result).toBe('14:30')
    })

    it('formats plain Firestore timestamp for formatDate and formatTime', () => {
      const plainTimestamp = {
        seconds: Math.floor(testDate.getTime() / 1000),
        nanoseconds: 0,
      }
      expect(formatDate(plainTimestamp)).toBe('20/11/2026')
      expect(formatTime(plainTimestamp)).toBe('14:30')
    })

    it('returns fallback for invalid inputs', () => {
      expect(formatDate(null)).toBe('-')
      expect(formatTime(null)).toBe('-')
    })
  })

  describe('toSortableTimestamp', () => {
    it('turns numbers, ISO strings and Firestore timestamps into milliseconds', () => {
      const ms = testDate.getTime()
      expect(toSortableTimestamp(ms)).toBe(ms)
      expect(toSortableTimestamp(testDate.toISOString())).toBe(ms)
      expect(toSortableTimestamp({ toMillis: () => ms })).toBe(ms)
    })

    it('returns 0 for missing or invalid dates', () => {
      expect(toSortableTimestamp(undefined)).toBe(0)
      expect(toSortableTimestamp('invalid')).toBe(0)
    })
  })
})
