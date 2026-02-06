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
 * Formatea una fecha al formato corto "15/08/2024"
 * @param {string|Date} date - La fecha a formatear
 * @param {string} locale - El locale para el formato
 * @returns {string} - Fecha formateada o '-' si no hay fecha
 */
export const formatDateShort = (date, locale = 'en-GB') => {
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
 * Formatea una fecha con hora completa
 * @param {string|Date} date - La fecha a formatear
 * @param {string} locale - El locale para el formato
 * @returns {string} - Fecha y hora formateada
 */
export const formatDateTime = (date, locale = 'es-ES') => {
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
 * Calcula el tiempo relativo (hace 2 días, hace 1 semana, etc.)
 * @param {string|Date} date - La fecha a comparar
 * @returns {string} - Tiempo relativo
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-'

  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    const now = new Date()
    const diffMs = now - d
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`

    return `Hace ${Math.floor(diffDays / 365)} años`
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
