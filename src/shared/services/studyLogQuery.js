import {
  collection,
  documentId,
  endAt,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
} from 'firebase/firestore'

const FILTER_FIELDS = ['participantLabel', 'eventType', 'level', 'source']
const VISIBLE_FIELDS = [
  'participantLabel',
  'actorRole',
  'eventType',
  'layer',
  'level',
  'source',
  'message',
  'occurredAt',
  'receivedAt',
  'timeQuality',
  'details',
]

const filterConstraints = (filters = {}) => {
  const constraints = FILTER_FIELDS.flatMap((field) =>
    filters[field] ? [where(field, '==', filters[field])] : [],
  )
  if (filters.occurredFrom) {
    constraints.push(where('occurredAt', '>=', filters.occurredFrom))
  }
  if (filters.occurredBefore) {
    constraints.push(where('occurredAt', '<', filters.occurredBefore))
  }
  return constraints
}

const visibleEvent = (snapshot) => {
  const stored = snapshot.data()
  return Object.fromEntries(
    VISIBLE_FIELDS.flatMap((field) =>
      stored[field] === undefined ? [] : [[field, stored[field]]],
    ),
  )
}

export const getStudyLogPage = async ({
  db,
  studyId,
  filters = {},
  pageSize = 20,
  after = null,
}) => {
  const constraints = [
    ...filterConstraints(filters),
    orderBy('occurredAt', 'desc'),
    orderBy(documentId(), 'desc'),
    ...(after ? [startAfter(after)] : []),
    limit(pageSize + 1),
  ]
  const snapshot = await getDocs(
    query(collection(db, `tests/${studyId}/logs`), ...constraints),
  )
  const pageDocuments = snapshot.docs.slice(0, pageSize)
  return {
    events: pageDocuments.map(visibleEvent),
    firstCursor: pageDocuments[0] || null,
    lastCursor: pageDocuments.at(-1) || null,
    hasNextPage: snapshot.docs.length > pageSize,
  }
}

export const getStudyLogCount = async ({ db, studyId, filters = {} }) => {
  const snapshot = await getCountFromServer(
    query(
      collection(db, `tests/${studyId}/logs`),
      ...filterConstraints(filters),
    ),
  )
  return snapshot.data().count
}

export const getParticipantLabels = async ({ db, studyId, prefix = '' }) => {
  const normalized = prefix.trim().toUpperCase()
  const snapshot = await getDocs(
    query(
      collection(db, `tests/${studyId}/studySessions`),
      orderBy('participantLabel'),
      ...(normalized
        ? [startAt(normalized), endAt(`${normalized}\uf8ff`)]
        : []),
      limit(10),
    ),
  )
  return snapshot.docs.map((item) => item.data().participantLabel)
}

const localDay = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '')
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? null : date
}

export const localDateRange = (startDate, endDate) => {
  const occurredFrom = localDay(startDate)
  const end = localDay(endDate)
  if (!occurredFrom && !end) return {}
  const occurredBefore = end
    ? new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
    : null
  if (
    occurredFrom &&
    occurredBefore &&
    occurredFrom.getTime() >= occurredBefore.getTime()
  ) {
    throw new Error('Invalid date range')
  }
  return {
    ...(occurredFrom ? { occurredFrom } : {}),
    ...(occurredBefore ? { occurredBefore } : {}),
  }
}
