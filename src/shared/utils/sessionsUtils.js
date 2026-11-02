export const SESSION_STATUSES = {
  UNKNOWN: { status: 'unknown', variant: 'default', label: 'Unknown' },
  TODAY: { status: 'today', variant: 'warning', label: 'Today' },
  UPCOMING: { status: 'upcoming', variant: 'info', label: 'Upcoming' },
  COMPLETED: { status: 'completed', variant: 'success', label: 'Completed' },
  ENDED: { status: 'ended', variant: 'success', label: 'Ended' },
}

function toDate(value) {
  if (!value) return null
  const date =
    typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Pick the upcoming session that starts first.
 * Sessions are read from the store shape (`scheduledAt`), sessions without a
 * valid future date are ignored.
 */
export function getNextSession(sessions, now = new Date()) {
  if (!Array.isArray(sessions)) return null

  const upcoming = sessions
    .map((session) => ({ session, date: toDate(session?.scheduledAt) }))
    .filter(({ date }) => date && date > now)
    .sort((a, b) => a.date - b.date)

  return upcoming[0]?.session ?? null
}

export function isWithinDateRange(value, range) {
  if (!Array.isArray(range) || range.length < 2 || !value) return true
  const date = toDate(value)
  if (!date) return false

  const start = new Date(range[0])
  start.setHours(0, 0, 0, 0)
  const end = new Date(range[range.length - 1])
  end.setHours(23, 59, 59, 999)

  return date >= start && date <= end
}

export function getSessionStatus(testDate, lifecycleStatus) {
  if (lifecycleStatus === 'ended') return SESSION_STATUSES.ENDED
  if (!testDate) return SESSION_STATUSES.UNKNOWN

  const now = new Date()
  const testDateObj = new Date(testDate)

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sessionDay = new Date(
    testDateObj.getFullYear(),
    testDateObj.getMonth(),
    testDateObj.getDate(),
  )

  if (sessionDay.getTime() === today.getTime()) {
    return SESSION_STATUSES.TODAY
  } else if (sessionDay > today) {
    return SESSION_STATUSES.UPCOMING
  } else {
    return SESSION_STATUSES.COMPLETED
  }
}
