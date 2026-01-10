/**
 * Time formatting utilities
 * Centralized time formatting functions to eliminate duplication across components
 */

/**
 * Format time in seconds to MM:SS format
 * @param {number} timeInSeconds - Time in seconds
 * @returns {string} Formatted time string (e.g., "2:30")
 */
export const formatTime = (timeInSeconds) => {
  if (!timeInSeconds || timeInSeconds < 0) return '0:00'

  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format time in milliseconds to MM:SS format
 * @param {number} timeInMs - Time in milliseconds
 * @returns {string} Formatted time string (e.g., "2:30")
 */
export const formatTimeFromMs = (timeInMs) => {
  if (!timeInMs || timeInMs < 0) return '0:00'
  const seconds = Math.floor(timeInMs / 1000)
  return formatTime(seconds)
}

/**
 * Format time duration between two timestamps
 * @param {number} start - Start time in seconds
 * @param {number} end - End time in seconds
 * @returns {string} Formatted duration string (e.g., "1:30 - 2:45")
 */
export const formatDuration = (start, end) => {
  return `${formatTime(start)} - ${formatTime(end)}`
}

/**
 * Format time with detailed breakdown (hours, minutes, seconds)
 * @param {number} timeInSeconds - Time in seconds
 * @returns {object} Object with formatted time and components
 */
export const formatTimeDetailed = (timeInSeconds) => {
  if (!timeInSeconds || timeInSeconds < 0) {
    return {
      formatedTime: '0:00',
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }

  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  const seconds = Math.floor(timeInSeconds % 60)

  let formatedTime
  if (hours > 0) {
    formatedTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  } else {
    formatedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return {
    formatedTime,
    hours,
    minutes,
    seconds,
  }
}

/**
 * Format time from milliseconds with detailed breakdown
 * @param {number} timeInMs - Time in milliseconds
 * @returns {object} Object with formatted time and components
 */
export const formatTimeDetailedFromMs = (timeInMs) => {
  if (!timeInMs || timeInMs < 0) {
    return formatTimeDetailed(0)
  }
  const seconds = Math.floor(timeInMs / 1000)
  return formatTimeDetailed(seconds)
}
