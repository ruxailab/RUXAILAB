/*
 * Scheduling rules shared by the session and invite dialogs.
 */

const pad = (value) => String(value).padStart(2, '0')

const isSameLocalDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

/**
 * Reads a date picker value as a local date. A "YYYY-MM-DD" string is parsed
 * by `new Date()` as UTC midnight, which is still the previous day in time
 * zones west of UTC, so it is split into its parts instead.
 * @param {Date|string|number} value
 * @returns {Date}
 */
export function toLocalDate(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  return new Date(value)
}

/**
 * Earliest time ("HH:mm") the time picker should offer for the selected date:
 * the current time when the date is today, and no limit for later days.
 * @param {Date|string|number} selectedDate
 * @param {Date} [now]
 * @returns {string}
 */
export function getMinScheduleTime(selectedDate, now = new Date()) {
  const date = toLocalDate(selectedDate)
  if (Number.isNaN(date.getTime()) || !isSameLocalDay(date, now)) {
    return '00:00'
  }
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

/**
 * Whether a scheduled date and time falls in a minute that has already
 * passed. Times in the current minute still count as upcoming.
 * @param {Date} dateTime
 * @param {Date} [now]
 * @returns {boolean}
 */
export function isPastSchedule(dateTime, now = new Date()) {
  const startOfMinute = new Date(now)
  startOfMinute.setSeconds(0, 0)
  return dateTime.getTime() < startOfMinute.getTime()
}
