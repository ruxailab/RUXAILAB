import crypto from 'crypto'
import { admin, functions } from '../f.firebase.js'
import logger from '../utils/logger.js'

const MAX_EVENTS_PER_BATCH = 25
const CLIENT_EVENT_BUDGET = 1000
const MAX_TASK_DURATION_MS = 24 * 60 * 60 * 1000
const POST_SUBMISSION_OCCURRENCE_GRACE_MS = 5 * 60 * 1000
const POST_SUBMISSION_RECEIPT_GRACE_MS = 7 * 24 * 60 * 60 * 1000
const ID_PATTERN = /^[A-Za-z0-9_-]{3,160}$/
const CLIENT_EVENT_POLICIES = Object.freeze({
  STUDY_VIEW_OPENED: {
    message: 'Study view opened',
    detailKeys: [],
  },
  ANSWER_EDITED: {
    message: 'Answer field edited',
    detailKeys: [
      'fieldRef',
      'editSpanMs',
      'editOperations',
      'pasteOperations',
      'initialLength',
      'resultingLength',
    ],
  },
})
const ROLE_NAMES = new Map([
  [0, 'admin'],
  [1, 'evaluator'],
  [2, 'guest'],
  [3, 'observator'],
  [4, 'manager'],
  [5, 'user'],
])

const error = (code, message, details) => {
  const rejection = new functions.https.HttpsError(code, message, details)
  rejection.loggingRejection = true
  return rejection
}

const reject = ({ code, reasonCode, studyId, batchId }) => {
  const details = { retryable: false, scope: 'batch', reasonCode }
  logger.warn('Log batch rejected', {
    rejectionScope: 'batch',
    reasonCodes: [reasonCode],
    ...(studyId ? { studyId } : {}),
    ...(batchId ? { batchId } : {}),
  })
  throw error(code, 'Log batch was rejected', details)
}

const rejectEvents = ({ invalidEvents, studyId, batchId }) => {
  const details = { retryable: false, scope: 'events', invalidEvents }
  logger.warn('Log batch rejected', {
    rejectionScope: 'events',
    reasonCodes: [...new Set(invalidEvents.map((item) => item.reasonCode))],
    batchSize: invalidEvents.length,
    invalidEventCount: invalidEvents.length,
    studyId,
    batchId,
  })
  throw error('invalid-argument', 'Log batch was rejected', details)
}

const rejectVerified = ({
  code = 'failed-precondition',
  reasonCode,
  studyId,
}) => {
  logger.warn('Verified log event rejected', {
    rejectionScope: 'batch',
    reasonCodes: [reasonCode],
    ...(studyId ? { studyId } : {}),
  })
  throw error(code, 'Verified log event was rejected', {
    retryable: false,
    scope: 'batch',
    reasonCode,
  })
}

const dataFor = (request) => request?.data || request || {}

const safeId = (value) =>
  typeof value === 'string' && ID_PATTERN.test(value) ? value : null

const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const normalizeStudyType = (type) => {
  const normalized = String(type || '').toUpperCase()
  return normalized === 'HEURISTICS' ? 'HEURISTIC' : normalized
}

const roleFor = (study, uid) => study?.studyRoleMap?.[uid] ?? null

const canAnswerStudy = ({ study, uid, isSuperAdmin }) => {
  const type = normalizeStudyType(study?.testType)
  const role = roleFor(study, uid)

  if (!['USER', 'HEURISTIC'].includes(type)) return false
  return (
    study?.isPublic === true ||
    isSuperAdmin ||
    study?.testAdmin?.userDocId === uid ||
    role === 0 ||
    role === 4 ||
    (type === 'USER' &&
      (role === 5 || (role === 3 && study?.subType === 'USER_MODERATED'))) ||
    (type === 'HEURISTIC' && role === 1)
  )
}

const actorRoleFor = ({ study, uid, isSuperAdmin }) => {
  if (isSuperAdmin || study?.testAdmin?.userDocId === uid) return 'admin'
  return ROLE_NAMES.get(roleFor(study, uid))
}

const sessionIdFor = (studyId, uid) => {
  const secret = process.env.LOG_ACTOR_HASH_SALT
  if (!secret) throw error('internal', 'Logging service is unavailable')
  return crypto
    .createHash('sha256')
    .update(`${secret}:${studyId}:${uid}`)
    .digest('hex')
}

const documentIdFor = (sessionId, requestId) =>
  crypto.createHash('sha256').update(`${sessionId}:${requestId}`).digest('hex')

const consentAccepted = async (transaction, db, study, uid) => {
  if (normalizeStudyType(study.testType) !== 'USER') return true
  if (!study.answersDocId) return false
  const answer = await transaction.get(
    db.collection('answers').doc(study.answersDocId),
  )
  return (
    answer.exists &&
    answer.data()?.taskAnswers?.[uid]?.consentCompleted === true
  )
}

const nonNegativeInteger = (value, maximum) =>
  Number.isInteger(value) && value >= 0 && value <= maximum

const fieldExists = (study, fieldRef) => {
  const type = normalizeStudyType(study.testType)
  const parts = String(fieldRef || '').split(':')
  if (type === 'HEURISTIC') {
    const [, heuristicIndex, , questionIndex, field] = parts
    return (
      parts[0] === 'heuristic' &&
      parts[2] === 'question' &&
      ['comment', 'answer'].includes(field) &&
      Boolean(
        study.testStructure?.[Number(heuristicIndex)]?.questions?.[
          Number(questionIndex)
        ],
      )
    )
  }
  if (type === 'USER') {
    const [section, index, field] = parts
    const collections = {
      preTest: study.testStructure?.preTest,
      postTest: study.testStructure?.postTest,
      task: study.testStructure?.userTasks,
    }
    return (
      ['preTest', 'postTest', 'task'].includes(section) &&
      ['answer', 'comment'].includes(field) &&
      Boolean(collections[section]?.[Number(index)])
    )
  }
  return false
}

const validAnswerEdit = (details, study) => {
  const keys = Object.keys(details || {}).sort()
  if (
    keys.join(',') !==
    CLIENT_EVENT_POLICIES.ANSWER_EDITED.detailKeys.slice().sort().join(',')
  ) {
    return false
  }
  return (
    fieldExists(study, details.fieldRef) &&
    nonNegativeInteger(details.editSpanMs, 24 * 60 * 60 * 1000) &&
    nonNegativeInteger(details.editOperations, 10000) &&
    nonNegativeInteger(details.pasteOperations, 10000) &&
    details.pasteOperations <= details.editOperations &&
    nonNegativeInteger(details.initialLength, 1000000) &&
    nonNegativeInteger(details.resultingLength, 1000000)
  )
}

const validateClientBatch = (payload, study) => {
  if (
    !Array.isArray(payload.events) ||
    payload.events.length < 1 ||
    payload.events.length > MAX_EVENTS_PER_BATCH
  ) {
    reject({
      code: 'invalid-argument',
      reasonCode: 'MALFORMED_ENVELOPE',
      studyId: payload.studyId,
      batchId: payload.batchId,
    })
  }

  const invalidEvents = []
  const seenEventIds = new Set()
  const events = []

  for (const event of payload.events) {
    const keys = event && typeof event === 'object' ? Object.keys(event) : []
    const eventId = safeId(event?.eventId)
    if (!eventId) {
      reject({
        code: 'invalid-argument',
        reasonCode: 'MALFORMED_ENVELOPE',
        studyId: payload.studyId,
        batchId: payload.batchId,
      })
    }
    const occurredAt =
      typeof event?.occurredAt === 'string'
        ? new Date(event.occurredAt)
        : new Date(Number.NaN)
    const occurrenceYear = occurredAt.getUTCFullYear()
    const policy = CLIENT_EVENT_POLICIES[event?.eventType]
    const validDetails =
      isRecord(event?.details) && policy?.detailKeys.length === 0
        ? Object.keys(event.details).length === 0
        : event?.eventType === 'ANSWER_EDITED' &&
          isRecord(event?.details) &&
          validAnswerEdit(event?.details, study)
    let reasonCode
    if (seenEventIds.has(eventId)) {
      reasonCode = 'DUPLICATE_EVENT_ID'
    } else if (!policy) {
      reasonCode = 'UNKNOWN_EVENT_TYPE'
    } else if (
      keys.some(
        (key) =>
          !['eventId', 'eventType', 'occurredAt', 'details'].includes(key),
      ) ||
      !validDetails
    ) {
      reasonCode = 'INVALID_EVENT_DETAILS'
    } else if (
      Number.isNaN(occurredAt.getTime()) ||
      occurrenceYear < 1 ||
      occurrenceYear > 9999
    ) {
      reasonCode = 'INVALID_OCCURRED_AT'
    }

    seenEventIds.add(eventId)
    if (reasonCode) {
      invalidEvents.push({ eventId, reasonCode })
    } else {
      events.push({
        eventId,
        eventType: event.eventType,
        occurredAt,
        details: event.details,
        message: policy.message,
      })
    }
  }

  if (invalidEvents.length) {
    rejectEvents({
      invalidEvents,
      studyId: payload.studyId,
      batchId: payload.batchId,
    })
  }
  return events
}

async function submitLogEvents(request) {
  const uid = request?.auth?.uid
  if (!uid) reject({ code: 'unauthenticated', reasonCode: 'NOT_ELIGIBLE' })

  const requestData = dataFor(request)
  const studyId = safeId(requestData.studyId)
  const batchId = safeId(requestData.batchId)
  if (!studyId || !batchId) {
    reject({ code: 'permission-denied', reasonCode: 'NOT_ELIGIBLE' })
  }

  const db = admin.firestore()
  const studyRef = db.collection('tests').doc(studyId)
  const userRef = db.collection('users').doc(uid)
  const sessionId = sessionIdFor(studyId, uid)
  const sessionRef = studyRef.collection('studySessions').doc(sessionId)
  const metaRef = studyRef.collection('loggingMeta').doc('state')
  const batchRef = studyRef
    .collection('logBatches')
    .doc(documentIdFor(sessionId, batchId))

  return db.runTransaction(async (transaction) => {
    const [studySnap, userSnap, batchSnap] = await Promise.all([
      transaction.get(studyRef),
      transaction.get(userRef),
      transaction.get(batchRef),
    ])
    const study = studySnap.exists ? studySnap.data() : null
    const isSuperAdmin = userSnap.exists && userSnap.data()?.accessLevel === 0

    if (!study || !canAnswerStudy({ study, uid, isSuperAdmin })) {
      reject({ code: 'permission-denied', reasonCode: 'NOT_ELIGIBLE' })
    }
    if (batchSnap.exists) return { status: 'duplicate', batchId }
    if (!(await consentAccepted(transaction, db, study, uid))) {
      reject({
        code: 'failed-precondition',
        reasonCode: 'CONSENT_REQUIRED',
        studyId,
        batchId,
      })
    }
    if (
      Object.keys(requestData).sort().join(',') !== 'batchId,events,studyId'
    ) {
      reject({
        code: 'invalid-argument',
        reasonCode: 'MALFORMED_ENVELOPE',
        studyId,
        batchId,
      })
    }

    const events = validateClientBatch(
      { ...requestData, studyId, batchId },
      study,
    )
    const eventRefs = events.map((event) =>
      studyRef.collection('logs').doc(documentIdFor(sessionId, event.eventId)),
    )
    const [sessionSnap, metaSnap, ...eventSnaps] = await Promise.all([
      transaction.get(sessionRef),
      transaction.get(metaRef),
      ...eventRefs.map((eventRef) => transaction.get(eventRef)),
    ])
    const conflicts = eventSnaps
      .map((snapshot, index) =>
        snapshot.exists
          ? { eventId: events[index].eventId, reasonCode: 'EVENT_ID_CONFLICT' }
          : null,
      )
      .filter(Boolean)
    const submittedAt = sessionSnap.data()?.submittedAt?.toMillis?.()
    const receiptExpired =
      submittedAt !== undefined &&
      Date.now() > submittedAt + POST_SUBMISSION_RECEIPT_GRACE_MS
    const closedEvents =
      submittedAt === undefined
        ? []
        : events
            .filter(
              (event) =>
                receiptExpired ||
                event.occurredAt.getTime() >
                  submittedAt + POST_SUBMISSION_OCCURRENCE_GRACE_MS,
            )
            .map((event) => ({
              eventId: event.eventId,
              reasonCode: 'SESSION_CLOSED',
            }))
    const invalidEvents = [...conflicts]
    for (const item of closedEvents) {
      if (!invalidEvents.some(({ eventId }) => eventId === item.eventId)) {
        invalidEvents.push(item)
      }
    }
    if (invalidEvents.length) {
      rejectEvents({ invalidEvents, studyId, batchId })
    }
    const now = admin.firestore.FieldValue.serverTimestamp()
    let participantLabel

    if (sessionSnap.exists) {
      participantLabel = sessionSnap.data().participantLabel
      const nextCount = sessionSnap.data().clientEventCount + events.length
      if (nextCount > CLIENT_EVENT_BUDGET) {
        reject({
          code: 'resource-exhausted',
          reasonCode: 'BUDGET_EXHAUSTED',
          studyId,
          batchId,
        })
      }
      transaction.update(sessionRef, { clientEventCount: nextCount })
    } else {
      const participantNumber = metaSnap.exists
        ? metaSnap.data().nextParticipantNumber
        : 1
      participantLabel = `P-${String(participantNumber).padStart(3, '0')}`
      transaction.set(metaRef, {
        nextParticipantNumber: participantNumber + 1,
      })
      transaction.set(sessionRef, {
        participantLabel,
        createdAt: now,
        clientEventCount: events.length,
      })
    }

    const actorRole = actorRoleFor({ study, uid, isSuperAdmin })
    for (const [index, event] of events.entries()) {
      const eventRef = eventRefs[index]
      transaction.create(eventRef, {
        eventId: event.eventId,
        batchId,
        sessionId,
        participantLabel,
        ...(actorRole ? { actorRole } : {}),
        eventType: event.eventType,
        layer: 'methodological',
        level: 'info',
        source: 'study-client',
        message: event.message,
        occurredAt: admin.firestore.Timestamp.fromDate(event.occurredAt),
        receivedAt: now,
        timeQuality: 'client-unverified',
        details: event.details,
      })
    }
    transaction.create(batchRef, {
      acceptedAt: now,
      eventCount: events.length,
    })
    return { status: 'accepted', batchId }
  })
}

const verifiedEventFor = ({ requestData, study, participantAnswer }) => {
  const keys = Object.keys(requestData).sort()
  const expectedKeys =
    requestData.eventType === 'TASK_ATTEMPT_FINISHED'
      ? ['eventType', 'studyId', 'taskRef']
      : ['eventType', 'studyId']
  if (keys.join(',') !== expectedKeys.sort().join(',')) {
    rejectVerified({
      code: 'invalid-argument',
      reasonCode: 'MALFORMED_REQUEST',
      studyId: requestData.studyId,
    })
  }

  if (requestData.eventType === 'CONSENT_ACCEPTED') {
    if (
      normalizeStudyType(study.testType) !== 'USER' ||
      participantAnswer?.consentCompleted !== true
    ) {
      rejectVerified({
        reasonCode: 'UNVERIFIED_TRANSITION',
        studyId: requestData.studyId,
      })
    }
    return {
      eventId: 'CONSENT_ACCEPTED',
      eventType: 'CONSENT_ACCEPTED',
      level: 'info',
      message: 'Consent accepted',
      details: {},
      sessionField: 'consentAcceptedAt',
    }
  }

  if (requestData.eventType === 'TASK_ATTEMPT_FINISHED') {
    const match = /^task:(0|[1-9]\d*)$/.exec(requestData.taskRef || '')
    const taskIndex = match ? Number(match[1]) : -1
    const controlledTask = study.testStructure?.userTasks?.[taskIndex]
    const answer = participantAnswer?.tasks?.[taskIndex]
    if (
      normalizeStudyType(study.testType) !== 'USER' ||
      !controlledTask ||
      answer?.attempted !== true
    ) {
      rejectVerified({
        reasonCode: 'UNVERIFIED_TRANSITION',
        studyId: requestData.studyId,
      })
    }
    const outcome = answer.completed === true ? 'completed' : 'not_completed'
    const duration = answer.taskTime
    return {
      eventId: `TASK_ATTEMPT_FINISHED:${requestData.taskRef}`,
      eventType: 'TASK_ATTEMPT_FINISHED',
      level: outcome === 'completed' ? 'info' : 'warning',
      message: 'Task attempt finished',
      details: {
        taskRef: requestData.taskRef,
        outcome,
        ...(nonNegativeInteger(duration, MAX_TASK_DURATION_MS)
          ? { taskDurationMs: duration }
          : {}),
      },
    }
  }

  if (
    requestData.eventType === 'STUDY_SUBMITTED' &&
    participantAnswer?.submitted === true
  ) {
    return {
      eventId: 'STUDY_SUBMITTED',
      eventType: 'STUDY_SUBMITTED',
      level: 'info',
      message: 'Study submitted',
      details: {},
      sessionField: 'submittedAt',
    }
  }

  rejectVerified({
    reasonCode: 'UNVERIFIED_TRANSITION',
    studyId: requestData.studyId,
  })
}

const participantAnswerFor = (answerDocument, studyType, uid) =>
  studyType === 'USER'
    ? answerDocument?.taskAnswers?.[uid]
    : answerDocument?.heuristicAnswers?.[uid]

async function submitVerifiedEvent(request) {
  const uid = request?.auth?.uid
  if (!uid) reject({ code: 'unauthenticated', reasonCode: 'NOT_ELIGIBLE' })

  const requestData = dataFor(request)
  const studyId = safeId(requestData.studyId)
  if (!studyId) {
    reject({ code: 'permission-denied', reasonCode: 'NOT_ELIGIBLE' })
  }

  const db = admin.firestore()
  const studyRef = db.collection('tests').doc(studyId)
  const userRef = db.collection('users').doc(uid)
  const sessionId = sessionIdFor(studyId, uid)
  const sessionRef = studyRef.collection('studySessions').doc(sessionId)
  const metaRef = studyRef.collection('loggingMeta').doc('state')

  return db.runTransaction(async (transaction) => {
    const [studySnap, userSnap] = await Promise.all([
      transaction.get(studyRef),
      transaction.get(userRef),
    ])
    const study = studySnap.exists ? studySnap.data() : null
    const isSuperAdmin = userSnap.exists && userSnap.data()?.accessLevel === 0
    if (!study || !canAnswerStudy({ study, uid, isSuperAdmin })) {
      reject({ code: 'permission-denied', reasonCode: 'NOT_ELIGIBLE' })
    }

    const studyType = normalizeStudyType(study.testType)
    if (!study.answersDocId) {
      rejectVerified({ reasonCode: 'UNVERIFIED_TRANSITION', studyId })
    }
    const answerRef = db.collection('answers').doc(study.answersDocId)
    const answerSnap = await transaction.get(answerRef)
    const participantAnswer = participantAnswerFor(
      answerSnap.exists ? answerSnap.data() : null,
      studyType,
      uid,
    )
    const event = verifiedEventFor({
      requestData: { ...requestData, studyId },
      study,
      participantAnswer,
    })
    const eventRef = studyRef
      .collection('logs')
      .doc(documentIdFor(sessionId, `verified:${event.eventId}`))
    const [sessionSnap, metaSnap, eventSnap] = await Promise.all([
      transaction.get(sessionRef),
      transaction.get(metaRef),
      transaction.get(eventRef),
    ])

    if (
      studyType === 'USER' &&
      event.eventType !== 'CONSENT_ACCEPTED' &&
      !sessionSnap.data()?.consentAcceptedAt
    ) {
      rejectVerified({ reasonCode: 'UNVERIFIED_TRANSITION', studyId })
    }
    if (eventSnap.exists) return { status: 'duplicate' }

    const now = admin.firestore.FieldValue.serverTimestamp()
    let participantLabel
    if (sessionSnap.exists) {
      participantLabel = sessionSnap.data().participantLabel
      if (event.sessionField) {
        transaction.update(sessionRef, { [event.sessionField]: now })
      }
    } else {
      const participantNumber = metaSnap.exists
        ? metaSnap.data().nextParticipantNumber
        : 1
      participantLabel = `P-${String(participantNumber).padStart(3, '0')}`
      transaction.set(metaRef, {
        nextParticipantNumber: participantNumber + 1,
      })
      transaction.set(sessionRef, {
        participantLabel,
        createdAt: now,
        clientEventCount: 0,
        ...(event.sessionField ? { [event.sessionField]: now } : {}),
      })
    }

    const actorRole = actorRoleFor({ study, uid, isSuperAdmin })
    transaction.create(eventRef, {
      eventId: event.eventId,
      sessionId,
      participantLabel,
      ...(actorRole ? { actorRole } : {}),
      eventType: event.eventType,
      layer: 'methodological',
      level: event.level,
      source: 'logging-service',
      message: event.message,
      occurredAt: now,
      receivedAt: now,
      details: event.details,
    })
    return { status: 'accepted' }
  })
}

export const logEvents = functions.onCall({
  handler: async (request) => {
    try {
      return await submitLogEvents(request)
    } catch (caught) {
      if (caught?.loggingRejection) throw caught
      logger.error('Unexpected log ingestion failure', {
        errorCode: caught?.code,
      })
      throw error('internal', 'Logging service is unavailable')
    }
  },
})

export const requestLogEvent = functions.onCall({
  handler: async (request) => {
    try {
      return await submitVerifiedEvent(request)
    } catch (caught) {
      if (caught?.loggingRejection) throw caught
      logger.error('Unexpected verified event failure', {
        errorCode: caught?.code,
      })
      throw error('internal', 'Logging service is unavailable')
    }
  },
})
