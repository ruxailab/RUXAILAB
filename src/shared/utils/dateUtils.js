const INVALID_DATE_FALLBACK = '-'
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * Parse Date input consistently.
 * Handles Firestore timestamps and keeps date-only strings in local time.
 */
const parseDateInput = (input) => {
  if (!input) return null

  if (typeof input?.toDate === 'function') {
    const d = input.toDate()
    return isNaN(d.getTime()) ? null : d
  }

  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input
  }

  if (typeof input === 'string' && DATE_ONLY_REGEX.test(input)) {
    const [year, month, day] = input.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return isNaN(d.getTime()) ? null : d
  }

  const d = new Date(input)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Formatted date to long format (e.g., "10 January 2024")
 * @param {string|Date|object} date - Date, string or Firestore timestamp
 * @param {string} locale - Locale for formatting (e.g., 'en', 'pt-BR')
 * @returns {string} - Formatted date or '-'
 */
export const formatDateLong = (date, locale = 'en') => {
  try {
    const d = parseDateInput(date)
    if (!d) return INVALID_DATE_FALLBACK

    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch {
    return INVALID_DATE_FALLBACK
  }
}

/**
 * Format date in short format.
 * @param {string|Date|object} date - Date, string or Firestore timestamp
 * @param {string} locale - Locale for formatting
 * @returns {string} - Formatted date or '-'
 */
export const formatDateShort = (date, locale = 'en-GB') => {
  try {
    const d = parseDateInput(date)
    if (!d) return INVALID_DATE_FALLBACK

    return d.toLocaleDateString(locale)
  } catch {
    return INVALID_DATE_FALLBACK
  }
}

/**
 * Format date and time.
 * @param {string|Date|object} date - Date, string or Firestore timestamp
 * @param {string} locale - Locale for formatting
 * @returns {string} - Formatted date-time or '-'
 */
export const formatDateTime = (date, locale = 'en') => {
  try {
    const d = parseDateInput(date)
    if (!d) return INVALID_DATE_FALLBACK

    return d.toLocaleString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return INVALID_DATE_FALLBACK
  }
}

/**
 * Format relative time with Intl.RelativeTimeFormat.
 * @param {string|Date|object} date - Date, string or Firestore timestamp
 * @param {string} locale - Locale for formatting
 * @returns {string} - Relative time or '-'
 */
export const formatRelativeTime = (date, locale = 'en') => {
  try {
    const d = parseDateInput(date)
    if (!d) return INVALID_DATE_FALLBACK

    const now = new Date()
    const diffInSeconds = Math.floor((d.getTime() - now.getTime()) / 1000)
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

    const divisions = [
      { amount: 60, unit: 'second' },
      { amount: 60, unit: 'minute' },
      { amount: 24, unit: 'hour' },
      { amount: 7, unit: 'day' },
      { amount: 4.34524, unit: 'week' },
      { amount: 12, unit: 'month' },
      { amount: Infinity, unit: 'year' },
    ]

    let duration = diffInSeconds

    for (let i = 0; i < divisions.length; i += 1) {
      if (Math.abs(duration) < divisions[i].amount) {
        return rtf.format(Math.round(duration), divisions[i].unit)
      }
      duration /= divisions[i].amount
    }

    return INVALID_DATE_FALLBACK
  } catch {
    return INVALID_DATE_FALLBACK
  }
}

/**
 * Format date as DD/MM/YYYY.
 * @param {string|Date|object} timestamp - Date, string or Firestore timestamp
 * @returns {string} - Formatted date or '-'
 */
export const formatDate = (timestamp) => {
  try {
    const date = parseDateInput(timestamp)
    if (!date) return INVALID_DATE_FALLBACK

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return INVALID_DATE_FALLBACK
  }
}

/**
 * Format time as HH:MM.
 * @param {string|Date|object} timestamp - Date, string or Firestore timestamp
 * @returns {string} - Formatted time or '-'
 */
export const formatTime = (timestamp) => {
  try {
    const date = parseDateInput(timestamp)
    if (!date) return INVALID_DATE_FALLBACK

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } catch {
    return INVALID_DATE_FALLBACK
  }
}
