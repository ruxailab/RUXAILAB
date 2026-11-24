const ACTIVITY_ACTIONS = {
  study: new Set(['study.edited']),
  settings: new Set(['study.settingsChanged']),
  team: new Set([
    'cooperator.invited',
    'cooperator.invitationAccepted',
    'cooperator.roleChanged',
    'cooperator.removed',
    'cooperator.invitationCancelled',
  ]),
  files: new Set(['storage.fileDeleted']),
  reports: new Set(['report.downloadRequested']),
}

const timePeriodStart = (when, now) => {
  const days = when === 'last7Days' ? 7 : when === 'last30Days' ? 30 : null
  return days === null ? null : now - days * 24 * 60 * 60 * 1000
}

export const timestampMilliseconds = (timestamp) => {
  if (!timestamp) return null
  if (typeof timestamp?.toMillis === 'function') {
    const ms = timestamp.toMillis()
    return typeof ms === 'number' && !Number.isNaN(ms) ? ms : null
  }
  if (typeof timestamp?.toDate === 'function') {
    const date = timestamp.toDate()
    return date instanceof Date && !Number.isNaN(date.getTime())
      ? date.getTime()
      : null
  }
  if (typeof timestamp?.seconds === 'number') {
    const ms =
      timestamp.seconds * 1000 + Math.floor((timestamp.nanoseconds || 0) / 1e6)
    return Number.isNaN(ms) ? null : ms
  }
  if (typeof timestamp?._seconds === 'number') {
    const ms =
      timestamp._seconds * 1000 +
      Math.floor((timestamp._nanoseconds || 0) / 1e6)
    return Number.isNaN(ms) ? null : ms
  }
  if (typeof timestamp === 'number') {
    return Number.isNaN(timestamp) ? null : timestamp
  }

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

const matchesPerson = (event, person) => {
  if (!person) return true
  if (event.actorId === person) return true
  return event.actorEmail?.toLowerCase() === person.toLowerCase()
}

export function filterAuditEvents(
  events,
  filters = {},
  { now = Date.now() } = {},
) {
  const periodStart = timePeriodStart(filters.when, now)
  const activityActions = ACTIVITY_ACTIONS[filters.activity]

  return events.filter((event) => {
    if (activityActions && !activityActions.has(event.action)) return false
    if (!matchesPerson(event, filters.person)) return false
    if (periodStart === null) return true

    const timestamp = timestampMilliseconds(event.timestamp)
    return timestamp !== null && timestamp >= periodStart && timestamp <= now
  })
}

export function auditPeopleOptions(study = {}, events = []) {
  const people = [
    study.testAdmin,
    ...(study.cooperators || []),
    ...events.map((event) => ({
      userDocId: event.actorId,
      email: event.actorEmail,
    })),
  ]
  const seen = new Set()

  return people.flatMap((person) => {
    const value = person?.userDocId || person?.email
    const title = person?.email || person?.userDocId
    const identifiers = [
      person?.userDocId,
      person?.email?.toLowerCase(),
    ].filter(Boolean)
    if (
      !value ||
      !title ||
      identifiers.some((identifier) => seen.has(identifier))
    ) {
      return []
    }

    identifiers.forEach((identifier) => seen.add(identifier))
    return [{ title, value }]
  })
}
