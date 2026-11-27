/**
 * Time formatting utilities
 * Centralized time formatting functions to eliminate duplication across components
 */

/**
 * Format time in seconds to M:SS or H:MM:SS format
 * @param {number|string} timeInSeconds - Time in seconds
 * @returns {string} Formatted time string (e.g., "2:30", "1:01:05")
 */
export const formatTime = (timeInSeconds) => {
  const num = Number(timeInSeconds)
  if (!Number.isFinite(num) || num <= 0) return '0:00'

  const totalSeconds = Math.floor(num)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const paddedSeconds = seconds.toString().padStart(2, '0')

  if (hours > 0) {
    const paddedMinutes = minutes.toString().padStart(2, '0')
    return `${hours}:${paddedMinutes}:${paddedSeconds}`
  }

  return `${minutes}:${paddedSeconds}`
}

/**
 * Format time with detailed breakdown
 * @param {number|string} timeInSeconds - Time in seconds
 * @returns {object} Object with formatted time and components
 */
export const formatTimeDetailed = (timeInSeconds) => {
  const num = Number(timeInSeconds)
  if (!Number.isFinite(num) || num <= 0) {
    return {
      formatedTime: '0:00',
      formattedTime: '0:00',
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }

  const formatted = formatTime(num)
  const totalSeconds = Math.floor(num)

  return {
    formatedTime: formatted,
    formattedTime: formatted,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

/**
 * Format time from milliseconds with detailed breakdown
 * @param {number|string} timeInMs - Time in milliseconds
 * @returns {object} Object with formatted time and components
 */
export const formatTimeDetailedFromMs = (timeInMs) => {
  const num = Number(timeInMs)
  if (!Number.isFinite(num) || num <= 0) {
    return formatTimeDetailed(0)
  }

  const seconds = Math.floor(num / 1000)
  return formatTimeDetailed(seconds)
}
