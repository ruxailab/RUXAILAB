export const SESSION_STATUSES = {
  UNKNOWN: { status: 'unknown', variant: 'default', label: 'Unknown' },
  TODAY: { status: 'today', variant: 'warning', label: 'Today' },
  UPCOMING: { status: 'upcoming', variant: 'info', label: 'Upcoming' },
  COMPLETED: { status: 'completed', variant: 'success', label: 'Completed' },
}

export function getSessionStatus(testDate) {
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
