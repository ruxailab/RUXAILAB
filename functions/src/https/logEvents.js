import crypto from 'crypto'
import { admin, functions } from '../core/firebase/f.firebase.js'
import logger from '../utils/logger.js'

const MAX_EVENTS_PER_BATCH = 25
const MAX_STRING_LENGTH = 240
const MAX_TRACE_ID_LENGTH = 120
const MAX_DETAILS_DEPTH = 4
const MAX_ARRAY_ITEMS = 20
const MAX_OBJECT_KEYS = 40

const ALLOWED_LAYERS = new Set(['technical', 'methodological', 'ai'])
const ALLOWED_LEVELS = new Set(['info', 'warn', 'error'])

// Mirrors src/shared/utils/accessLevel.js — must stay in sync
const COOPERATOR_ROLE_MAP = new Map([
  [0, 'admin'],
  [1, 'evaluator'],
  [2, 'guest'],
  [3, 'observator'],
])
const TYPE_PATTERN = /^[A-Z][A-Z0-9_]{1,63}$/
const SAFE_ID_PATTERN = /^[A-Za-z0-9:_-]{3,160}$/
const SENSITIVE_KEY_PATTERN = /email|fullName|displayName|phone|token|secret/i
const EMAIL_PATTERN = /\b[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,63}\b/g

function httpsError(code, message) {
  return new functions.https.HttpsError(code, message)
}

function getRequestData(request) {
  return request?.data || request || {}
}

function getAuthUid(request) {
  return request?.auth?.uid || null
}

function assertSafeId(value, fieldName) {
  if (typeof value !== 'string' || !SAFE_ID_PATTERN.test(value)) {
    throw httpsError('invalid-argument', `${fieldName} is invalid`)
  }
  return value
}

function sanitizeString(value, maxLength = MAX_STRING_LENGTH) {
  if (value === undefined || value === null) return ''
  return String(value).replace(EMAIL_PATTERN, '[redacted-email]').slice(0, maxLength)
}

function sanitizeDetails(value, depth = 0) {
  if (value === null || value === undefined) return null

  if (depth >= MAX_DETAILS_DEPTH) {
    return '[truncated]'
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeDetails(item, depth + 1))
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
        .slice(0, MAX_OBJECT_KEYS)
        .map(([key, item]) => [
          sanitizeString(key, 80),
          sanitizeDetails(item, depth + 1),
        ]),
    )
  }

  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'boolean') return value
  return sanitizeString(value)
}

function validateEvent(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    throw httpsError('invalid-argument', 'Each log event must be an object')
  }

  if (typeof event.type !== 'string' || !TYPE_PATTERN.test(event.type)) {
    throw httpsError('invalid-argument', 'Log event type is invalid')
  }

  if (!ALLOWED_LAYERS.has(event.layer)) {
    throw httpsError('invalid-argument', 'Log event layer is invalid')
  }

  if (!ALLOWED_LEVELS.has(event.level)) {
    throw httpsError('invalid-argument', 'Log event level is invalid')
  }

  return {
    type: event.type,
    layer: event.layer,
    level: event.level,
    source: sanitizeString(event.source ?? 'client', 80),
    traceId: sanitizeString(event.traceId ?? '', MAX_TRACE_ID_LENGTH),
    message: sanitizeString(event.message ?? event.type),
    details: sanitizeDetails(event.details ?? {}),
  }
}

function validatePayload(payload) {
  const testId = assertSafeId(payload.testId, 'testId')
  const batchId = assertSafeId(payload.batchId, 'batchId')
  const answersDocId =
    payload.answersDocId === undefined || payload.answersDocId === null
      ? ''
      : assertSafeId(payload.answersDocId, 'answersDocId')

  if (!Array.isArray(payload.events) || payload.events.length === 0) {
    throw httpsError('invalid-argument', 'events must contain at least one log event')
  }

  if (payload.events.length > MAX_EVENTS_PER_BATCH) {
    throw httpsError(
      'invalid-argument',
      `events cannot contain more than ${MAX_EVENTS_PER_BATCH} items`,
    )
  }

  return {
    testId,
    batchId,
    answersDocId,
    clientTimestamp: sanitizeString(payload.clientTimestamp ?? '', 80),
    sessionId: sanitizeString(payload.sessionId ?? '', 120),
    events: payload.events.map(validateEvent),
  }
}

function createActorHash(uid, testId) {
  const salt = process.env.LOG_ACTOR_HASH_SALT
  if (!salt) {
    logger.error('LOG_ACTOR_HASH_SALT environment variable is not configured')
    throw httpsError('internal', 'Logging service is misconfigured')
  }
  return crypto.createHash('sha256').update(`${salt}:${testId}:${uid}`).digest('hex')
}

function resolveActorRole(testData, uid) {
  if (testData?.testAdmin?.userDocId === uid) return 'admin'

  const cooperator = (testData?.cooperators || []).find(
    (item) => item?.userDocId === uid,
  )

  if (cooperator) {
    // accessLevel is stored as a number (0=admin, 1=evaluator, 2=guest, 3=observer).
    // Using ?? so accessLevel=0 is not incorrectly treated as falsy.
    const level = cooperator.accessLevel ?? null
    return COOPERATOR_ROLE_MAP.get(level) ?? 'cooperator'
  }

  return null
}

function isDuplicateBatchError(error) {
  return (
    error?.code === 6 ||
    error?.code === 'already-exists' ||
    String(error?.message || '').toLowerCase().includes('already exists')
  )
}

export const logEvents = functions.onCall({
  handler: async (request) => {
    const uid = getAuthUid(request)
    if (!uid) {
      throw httpsError('unauthenticated', 'Authentication is required')
    }

    const payload = validatePayload(getRequestData(request))
    const db = admin.firestore()
    const testRef = db.collection('tests').doc(payload.testId)
    const testSnap = await testRef.get()

    if (!testSnap.exists) {
      throw httpsError('not-found', 'Study not found')
    }

    const testData = testSnap.data()
    const actorRole = resolveActorRole(testData, uid)

    if (!actorRole) {
      throw httpsError('permission-denied', 'User cannot write logs for this study')
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp()
    const actorHash = createActorHash(uid, payload.testId)
    const batch = db.batch()
    const batchRef = testRef.collection('logBatches').doc(payload.batchId)
    const answersDocId = payload.answersDocId || testData.answersDocId || ''

    for (const event of payload.events) {
      const logRef = testRef.collection('logs').doc()
      batch.set(logRef, {
        ...event,
        testId: payload.testId,
        answersDocId,
        studyType: testData.testType || '',
        subType: testData.subType || '',
        actorHash,
        actorType: actorRole === 'admin' ? 'researcher' : 'cooperator',
        actorRole,
        sessionId: payload.sessionId,
        batchId: payload.batchId,
        clientTimestamp: payload.clientTimestamp,
        timestamp,
        schemaVersion: 1,
      })
    }

    batch.create(batchRef, {
      batchId: payload.batchId,
      testId: payload.testId,
      answersDocId,
      actorHash,
      eventCount: payload.events.length,
      createdAt: timestamp,
      schemaVersion: 1,
    })

    try {
      await batch.commit()
    } catch (error) {
      if (isDuplicateBatchError(error)) {
        logger.warn('Duplicate log batch skipped', {
          testId: payload.testId,
          batchId: payload.batchId,
        })
        return {
          status: 'duplicate',
          written: 0,
          batchId: payload.batchId,
        }
      }

      logger.error('Failed to write log batch', {
        errorCode: error?.code,
        errorMessage: error?.message,
        testId: payload.testId,
        batchId: payload.batchId,
      })
      throw httpsError('internal', 'Failed to write log batch')
    }

    return {
      status: 'ok',
      written: payload.events.length,
      batchId: payload.batchId,
    }
  },
})
