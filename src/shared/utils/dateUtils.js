const MONTHS_ES = {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
}

/**
 * Formatea una fecha al formato "10 Enero 2024"
 * @param {string|Date} date - La fecha a formatear
 * @param {string} locale - El idioma ('es' para español, 'en' para inglés)
 * @returns {string} - Fecha formateada o '-' si no hay fecha
 */
export const formatDateLong = (date, locale = 'es') => {
    if (!date) return '-'

    try {
        const d = new Date(date)
        if (isNaN(d.getTime())) return '-'

        const day = d.getDate()
        const month = d.getMonth()
        const year = d.getFullYear()

        if (locale === 'es') {
            return `${day} ${MONTHS_ES[month]} ${year}`
        } else {
            // Inglés por defecto
            return d.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        }
    } catch (error) {
        console.warn('Error formatting date:', error)
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
        console.warn('Error formatting date:', error)
        return '-'
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
            minute: '2-digit'
        })
    } catch (error) {
        console.warn('Error formatting datetime:', error)
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
    } catch (error) {
        console.warn('Error formatting relative time:', error)
        return '-'
    }
}
