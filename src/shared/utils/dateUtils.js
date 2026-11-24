const INVALID_DATE_FALLBACK = '-'
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/

const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime())

/**
 * Parses Firestore timestamps (objects with toDate/toMillis or seconds/_seconds).
 */
const parseFirestoreTimestamp = (input) => {
  if (typeof input?.toDate === 'function') {
    return input.toDate()
  }
  if (typeof input?.toMillis === 'function') {
    return new Date(input.toMillis())
  }
  if (typeof input?.seconds === 'number') {
    const ms = input.seconds * 1000 + Math.floor((input.nanoseconds || 0) / 1e6)
    return new Date(ms)
  }
  if (typeof input?._seconds === 'number') {
    const ms = input._seconds * 1000 + Math.floor((input._nanoseconds || 0) / 1e6)
    return new Date(ms)
  }
  return null
}

/**
 * Parse Date input consistently.
 * Handles Firestore timestamps and keeps date-only strings in local time.
 */
const parseDateInput = (input) => {
  if (!input) return null

  const fsDate = parseFirestoreTimestamp(input)
  if (fsDate) {
    return isValidDate(fsDate) ? fsDate : null
  }

  if (input instanceof Date) {
    return isValidDate(input) ? input : null
  }

  if (typeof input === 'number') {
    const d = new Date(input)
    return isValidDate(d) ? d : null
  }

  if (typeof input === 'string' && DATE_ONLY_REGEX.test(input)) {
    const [year, month, day] = input.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return isValidDate(d) ? d : null
  }

  const d = new Date(input)
  return isValidDate(d) ? d : null
}

/**
 * Formatted date to long format (e.g., "10 January 2024")
 * @param {string|Date|object} date - Date, string or Firestore timestamp
 * @param {string} locale - Locale for formatting (e.g., 'en', 'pt-BR')
 * @returns {string} - Formatted date or '-'
 */
export const formatDateLong = (date, locale = 'en') => {
  const normalizedLocale =
    typeof locale === 'string' ? locale.replace('_', '-') : 'en'

  try {
    const d = parseDateInput(date)
    if (!d) return INVALID_DATE_FALLBACK

    return new Intl.DateTimeFormat(normalizedLocale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
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
  const normalizedLocale =
    typeof locale === 'string' && locale ? locale.replace('_', '-') : 'en'

  try {
    const d = parseDateInput(date)
    if (!d) return INVALID_DATE_FALLBACK

    return d.toLocaleString(normalizedLocale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error formatting date-time:', e)
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

export const toSortableTimestamp = (value) => {
  if (!value) return 0
  if (typeof value?.toMillis === 'function') return value.toMillis()

  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}
