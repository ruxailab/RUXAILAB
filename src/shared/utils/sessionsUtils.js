export const SESSION_STATUSES = {
  UNKNOWN: { status: 'unknown', variant: 'default', label: 'Unknown' },
  TODAY: { status: 'today', variant: 'warning', label: 'Today' },
  UPCOMING: { status: 'upcoming', variant: 'info', label: 'Upcoming' },
  COMPLETED: { status: 'completed', variant: 'success', label: 'Completed' },
  ENDED: { status: 'ended', variant: 'success', label: 'Ended' },
}

function toDate(value) {
  if (!value) return null
  if (typeof value?.toDate === 'function') {
    const d = value.toDate()
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null
  }
  if (typeof value?.seconds === 'number') {
    const ms = value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6)
    const d = new Date(ms)
    return !Number.isNaN(d.getTime()) ? d : null
  }
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime()) ? value : null
  }
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) ? date : null
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

export function getSessionStatus(testDate, lifecycleStatus) {
  if (lifecycleStatus === 'ended') return SESSION_STATUSES.ENDED

  const testDateObj = toDate(testDate)
  if (!testDateObj) return SESSION_STATUSES.UNKNOWN

  const now = new Date()
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
