import i18n from '@/app/plugins/i18n'

/**
 * Formatted date to long format (e.g., "10 January 2024")
 * @param {string|Date} date - The date to format
 * @param {string} locale - The language locale (e.g., 'es', 'en', 'zh')
 * @returns {string} - Formatted date or '-' if invalid
 */
export const formatDateLong = (date, locale = 'en') => {
  if (!date) return '-'

  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch {
    return '-'
  }
}

/**
 * Format date to short format "15/08/2024"
 * @param {string|Date} date - The date to format
 * @param {string} locale - The locale for formatting
 * @returns {string} - Formatted date or '-' if invalid
 */
export const formatDateShort = (date, locale = 'en') => {
  if (!date) return '-'

  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    return d.toLocaleDateString(locale)
  } catch (error) {
    return error
  }
}

/**
 * Format date with full time
 * @param {string|Date} date - The date to format
 * @param {string} locale - The locale for formatting
 * @returns {string} - Formatted date and time
 */
export const formatDateTime = (date, locale = 'en') => {
  if (!date) return '-'

  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    return d.toLocaleString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

/**
 * Calculate relative time (2 days ago, 1 week ago, etc.)
 * @param {string|Date} date - The date to compare
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-'

  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    const t = i18n.global.t
    const now = new Date()
    const diffMs = now - d
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return t('relativeTime.today')
    if (diffDays === 1) return t('relativeTime.yesterday')
    if (diffDays < 7) return t('relativeTime.daysAgo', { count: diffDays })
    if (diffDays < 30)
      return t('relativeTime.weeksAgo', {
        count: Math.floor(diffDays / 7),
      })
    if (diffDays < 365)
      return t('relativeTime.monthsAgo', {
        count: Math.floor(diffDays / 30),
      })

    return t('relativeTime.yearsAgo', {
      count: Math.floor(diffDays / 365),
    })
  } catch {
    return '-'
  }
}

/**
 * Format date for general use (used by many components)
 * @param {string|Date|object} timestamp - Date to format (can be Date, string, or Firestore timestamp)
 * @returns {string} - Formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return ''

  try {
    let date

    // Handle Firestore timestamp objects
    if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate()
    } else {
      date = new Date(timestamp)
    }

    if (isNaN(date.getTime())) return ''

    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return ''
  }
}

/**
 * Format time from timestamp
 * @param {string|Date|object} timestamp - Date to format
 * @returns {string} - Formatted time string (HH:MM)
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return ''

  try {
    let date

    // Handle Firestore timestamp objects
    if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate()
    } else {
      date = new Date(timestamp)
    }

    if (isNaN(date.getTime())) return ''

    const hours = date.getHours()
    const minutes = date.getMinutes()
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`
  } catch {
    return ''
  }
}
