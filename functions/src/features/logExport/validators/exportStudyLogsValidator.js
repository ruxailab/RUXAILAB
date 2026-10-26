import { fail } from '../../../core/errors.js'

/**
 * Request validator document for exportStudyLogs.
 */
export const exportStudyLogsValidator = {
  studyId: { type: 'string', required: true },
  format: { type: 'string', required: true, enum: ['csv', 'json'] },
  filters: { type: 'object', required: false },
  cursor: { type: 'string', required: false },
}

const REQUEST_KEYS = new Set(['studyId', 'format', 'filters', 'cursor'])
const STUDY_ID = /^[A-Za-z0-9_-]{3,160}$/
const PARTICIPANT_LABEL = /^P-\d{3,}$/
const EVENT_TYPE = /^[A-Z][A-Z0-9_]{2,63}$/
const LEVELS = new Set(['info', 'warning', 'error'])
const SOURCES = new Set(['study-client', 'logging-service'])
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/
const MAX_CURSOR_LENGTH = 1024

const invalid = (message) => fail('invalid-argument', message)

/**
 * Checked before authorization, so it reveals nothing about the study.
 *
 * @param {object} input
 * @returns {string}
 */
export const parseStudyId = (input) => {
  const studyId = input?.studyId
  if (typeof studyId !== 'string' || !STUDY_ID.test(studyId)) {
    fail('permission-denied', 'Access denied')
  }
  return studyId
}

const instant = (value, name) => {
  if (typeof value !== 'string' || !ISO_INSTANT.test(value)) {
    invalid(`${name} must be an ISO 8601 UTC timestamp`)
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) invalid(`${name} is not a valid date`)
  return date
}

/**
 * Accepts only the Log Explorer's filter vocabulary.
 *
 * @param {object|undefined} filters
 * @returns {{
 *   participantLabel?: string,
 *   eventType?: string,
 *   level?: string,
 *   source?: string,
 *   occurredFrom?: Date,
 *   occurredBefore?: Date,
 * }}
 */
export const parseExportFilters = (filters) => {
  if (filters === undefined || filters === null) return {}
  if (typeof filters !== 'object' || Array.isArray(filters)) {
    invalid('filters must be an object')
  }
  const parsed = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue
    if (key === 'participantLabel') {
      if (typeof value !== 'string' || !PARTICIPANT_LABEL.test(value)) {
        invalid('participantLabel must look like P-001')
      }
      parsed.participantLabel = value
    } else if (key === 'eventType') {
      if (typeof value !== 'string' || !EVENT_TYPE.test(value)) {
        invalid('eventType is not a valid event type')
      }
      parsed.eventType = value
    } else if (key === 'level') {
      if (!LEVELS.has(value)) invalid('level must be info, warning or error')
      parsed.level = value
    } else if (key === 'source') {
      if (!SOURCES.has(value)) invalid('source is not a valid log source')
      parsed.source = value
    } else if (key === 'occurredFrom' || key === 'occurredBefore') {
      parsed[key] = instant(value, key)
    } else {
      invalid(`Unknown filter: ${key}`)
    }
  }
  if (
    parsed.occurredFrom &&
    parsed.occurredBefore &&
    parsed.occurredFrom >= parsed.occurredBefore
  ) {
    invalid('occurredFrom must be before occurredBefore')
  }
  return parsed
}

/**
 * @param {object} input
 * @returns {void}
 */
export const assertKnownRequestKeys = (input) => {
  const unknown = Object.keys(input || {}).filter(
    (key) => !REQUEST_KEYS.has(key),
  )
  if (unknown.length) invalid(`Unknown request field: ${unknown[0]}`)
}

/**
 * The cursor is opaque to the browser. It carries the receipt cutoff fixed
 * by the first page, so every page describes the same set of events.
 *
 * @param {{ cutoffMs: number, after: { seconds: number, nanoseconds: number, id: string } }} position
 * @returns {string}
 */
export const encodeCursor = ({ cutoffMs, after }) =>
  Buffer.from(
    JSON.stringify({
      v: 1,
      c: cutoffMs,
      s: after.seconds,
      n: after.nanoseconds,
      id: after.id,
    }),
  ).toString('base64url')

/**
 * @param {string} cursor
 * @returns {{ cutoffMs: number, after: { seconds: number, nanoseconds: number, id: string } }}
 */
export const decodeCursor = (cursor) => {
  let value
  try {
    if (cursor.length > MAX_CURSOR_LENGTH) throw new Error('too long')
    value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))
  } catch {
    invalid('cursor is not valid')
  }
  if (
    value?.v !== 1 ||
    !Number.isSafeInteger(value.c) ||
    value.c <= 0 ||
    !Number.isSafeInteger(value.s) ||
    !Number.isInteger(value.n) ||
    value.n < 0 ||
    value.n > 999999999 ||
    typeof value.id !== 'string' ||
    !/^[A-Za-z0-9_-]{1,160}$/.test(value.id)
  ) {
    invalid('cursor is not valid')
  }
  return {
    cutoffMs: value.c,
    after: { seconds: value.s, nanoseconds: value.n, id: value.id },
  }
}
