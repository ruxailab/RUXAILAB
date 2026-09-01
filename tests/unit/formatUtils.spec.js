import { formatInitials, formatBytes } from '@/shared/utils/formatUtils'

describe('formatInitials', () => {
  it('extracts initials from a standard email', () => {
    expect(formatInitials('john@example.com')).toBe('JO')
  })

  it('extracts initials from a two-word name', () => {
    expect(formatInitials('John Doe')).toBe('JD')
  })

  it('handles names with multiple consecutive spaces', () => {
    expect(formatInitials('John  Doe')).toBe('JD')
  })

  it('handles names with many consecutive spaces', () => {
    expect(formatInitials('Jane   Smith')).toBe('JS')
  })

  it('returns fallback for whitespace-only input', () => {
    expect(formatInitials('   ')).toBe('?')
  })

  it('returns fallback for null', () => {
    expect(formatInitials(null)).toBe('?')
  })

  it('returns fallback for undefined', () => {
    expect(formatInitials(undefined)).toBe('?')
  })

  it('returns fallback for empty string', () => {
    expect(formatInitials('')).toBe('?')
  })

  it('returns first two characters for a single word', () => {
    expect(formatInitials('John')).toBe('JO')
  })

  it('returns fallback for non-string input', () => {
    expect(formatInitials(12345)).toBe('?')
  })

  it('handles a name with leading and trailing spaces', () => {
    expect(formatInitials('  Alice Bob  ')).toBe('AB')
  })
})

describe('formatBytes', () => {
  it('returns "0 B" for zero bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats bytes correctly', () => {
    expect(formatBytes(500)).toBe('500 B')
  })

  it('formats kilobytes correctly', () => {
    expect(formatBytes(1024)).toBe('1 KB')
  })

  it('formats megabytes correctly', () => {
    expect(formatBytes(1572864)).toBe('1.5 MB')
  })

  it('returns "0 B" for non-numeric string input', () => {
    expect(formatBytes('abc')).toBe('0 B')
  })

  it('returns "0 B" for NaN', () => {
    expect(formatBytes(NaN)).toBe('0 B')
  })

  it('returns "0 B" for negative values', () => {
    expect(formatBytes(-100)).toBe('0 B')
  })

  it('returns "0 B" for null', () => {
    expect(formatBytes(null)).toBe('0 B')
  })

  it('coerces numeric strings correctly', () => {
    expect(formatBytes('1024')).toBe('1 KB')
  })

  it('respects custom decimal places', () => {
    expect(formatBytes(1536, 1)).toBe('1.5 KB')
  })
})
