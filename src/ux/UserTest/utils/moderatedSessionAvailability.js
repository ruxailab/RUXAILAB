const HOURS_24_MS = 24 * 60 * 60 * 1000

const validDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const moderatedSessionTimingReason = ({
  now = new Date(),
  scheduledAt,
  studyEndDate,
}) => {
  const endDate = validDate(studyEndDate)
  if (endDate && now > endDate) return 'test-expired'

  const sessionDate = validDate(scheduledAt)
  if (sessionDate && sessionDate.getTime() - now.getTime() > HOURS_24_MS) {
    return 'test-session-too-far'
  }

  return null
}
