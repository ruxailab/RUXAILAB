/**
 * Export projection for canonical study logs.
 *
 * Every field starts denied: a row is rebuilt from an allowlist, never by
 * spreading the stored document. Identifiers (`sessionId`, `eventId`,
 * `batchId`, document IDs, UIDs) are never copied, and detail values must be
 * structural tokens, references or counters, so free text cannot pass through.
 */

const PARTICIPANT_LABEL = /^P-\d{3,}$/
const EVENT_TYPE = /^[A-Z][A-Z0-9_]{2,63}$/
const TOKEN = /^[A-Za-z][A-Za-z0-9_-]{0,39}$/
const REFERENCE = /^[A-Za-z][A-Za-z0-9_-]*(:[A-Za-z0-9_-]+){0,6}$/
const MAX_REFERENCE_LENGTH = 160
const MAX_MESSAGE_LENGTH = 200
const MAX_LIST_LENGTH = 200

const ACTOR_ROLES = new Set([
  'admin',
  'evaluator',
  'guest',
  'observator',
  'manager',
  'user',
])
const LAYERS = new Set(['methodological', 'technical'])
const LEVELS = new Set(['info', 'warning', 'error'])
const SOURCES = new Set(['study-client', 'logging-service'])
const TIME_QUALITIES = new Set(['client-unverified'])

const token = (value) =>
  typeof value === 'string' && TOKEN.test(value) ? value : undefined
const reference = (value) =>
  typeof value === 'string' &&
  value.length <= MAX_REFERENCE_LENGTH &&
  REFERENCE.test(value)
    ? value
    : undefined
const count = (value) =>
  Number.isSafeInteger(value) && value >= 0 ? value : undefined
const tokenList = (value) =>
  Array.isArray(value)
    ? value.slice(0, MAX_LIST_LENGTH).map(token).filter(Boolean)
    : undefined
const itemChanges = (value) =>
  Array.isArray(value)
    ? value.slice(0, MAX_LIST_LENGTH).flatMap((item) => {
        const itemRef = reference(item?.itemRef)
        const changes = count(item?.changes)
        return itemRef && changes !== undefined ? [{ itemRef, changes }] : []
      })
    : undefined

/**
 * Detail keys each event type may export, matching what `logEvents` stores.
 * Event types missing here still export their common fields, with empty
 * details, so a new producer never leaks data before it is listed.
 */
export const EXPORTED_DETAILS = Object.freeze({
  STUDY_VIEW_OPENED: {},
  CONSENT_ACCEPTED: {},
  STUDY_SUBMITTED: {},
  TASK_STARTED: { taskRef: reference, taskType: token },
  ANSWER_EDITED: {
    fieldRef: reference,
    editSpanMs: count,
    editOperations: count,
    pasteOperations: count,
    initialLength: count,
    resultingLength: count,
    taskType: token,
  },
  STRUCTURED_RESPONSE_ACTIVITY: {
    scopeRef: reference,
    items: itemChanges,
    taskType: token,
  },
  QUESTION_RESPONSE_UPDATED: {
    questionRef: reference,
    changedFields: tokenList,
    interactionSpanMs: count,
    frequencyChanges: count,
    severityChanges: count,
    answerChanges: count,
    commentInputChanges: count,
  },
  MEDIA_RECORDING_OUTCOME: {
    taskRef: reference,
    mediaType: token,
    outcome: token,
    stage: token,
    reason: token,
    taskType: token,
  },
  TASK_ATTEMPT_FINISHED: {
    taskRef: reference,
    taskType: token,
    recordingTypes: tokenList,
    outcome: token,
    taskDurationMs: count,
  },
})

const allowed = (set, value) =>
  typeof value === 'string' && set.has(value) ? value : ''

const isoTime = (value) => {
  const date = value?.toDate?.() ?? (value instanceof Date ? value : null)
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : ''
}

const plainText = (value) =>
  typeof value === 'string'
    ? value
        .replace(/[\u0000-\u001f\u007f]+/g, ' ')
        .trim()
        .slice(0, MAX_MESSAGE_LENGTH)
    : ''

const exportedDetails = (eventType, details) => {
  const fields = EXPORTED_DETAILS[eventType]
  if (!fields || !details || typeof details !== 'object') return {}
  return Object.fromEntries(
    Object.entries(fields).flatMap(([key, sanitize]) => {
      const value = sanitize(details[key])
      return value === undefined ? [] : [[key, value]]
    }),
  )
}

/**
 * @param {object} stored A canonical `tests/{studyId}/logs` document.
 * @returns {object} The row as it appears in CSV and JSON exports.
 */
export const toLogExportRow = (stored = {}) => {
  const eventType =
    typeof stored.eventType === 'string' && EVENT_TYPE.test(stored.eventType)
      ? stored.eventType
      : ''
  return {
    occurredAt: isoTime(stored.occurredAt),
    receivedAt: isoTime(stored.receivedAt),
    participantLabel:
      typeof stored.participantLabel === 'string' &&
      PARTICIPANT_LABEL.test(stored.participantLabel)
        ? stored.participantLabel
        : '',
    actorRole: allowed(ACTOR_ROLES, stored.actorRole),
    eventType,
    level: allowed(LEVELS, stored.level),
    layer: allowed(LAYERS, stored.layer),
    source: allowed(SOURCES, stored.source),
    message: plainText(stored.message),
    timeQuality: allowed(TIME_QUALITIES, stored.timeQuality),
    details: exportedDetails(eventType, stored.details),
  }
}

export const CSV_COLUMNS = Object.freeze([
  'occurredAt',
  'receivedAt',
  'participantLabel',
  'actorRole',
  'eventType',
  'level',
  'layer',
  'source',
  'message',
  'timeQuality',
  'detailsJson',
])

// Spreadsheets run cells that start with these characters as formulas.
const FORMULA_START = /^[=+\-@\t\r]/

/**
 * @param {unknown} value
 * @returns {string} One RFC 4180 cell that spreadsheets show as plain text.
 */
export const csvCell = (value) => {
  let text = value === undefined || value === null ? '' : String(value)
  if (FORMULA_START.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const csvLine = (cells) => `${cells.map(csvCell).join(',')}\r\n`

export const csvHeader = () => csvLine(CSV_COLUMNS)

/**
 * @param {ReturnType<typeof toLogExportRow>} row
 * @returns {string}
 */
export const toCsvLine = (row) =>
  csvLine(
    CSV_COLUMNS.map((column) =>
      column === 'detailsJson'
        ? Object.keys(row.details).length
          ? JSON.stringify(row.details)
          : ''
        : row[column],
    ),
  )
