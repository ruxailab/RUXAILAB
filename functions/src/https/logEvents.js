import crypto from 'crypto'
import { admin, functions } from '../core/firebase/f.firebase.js'
import logger from '../utils/logger.js'
import { taskContext, recordingPolicy } from '../shared/logging/taskContext.js'

const MAX_EVENTS_PER_BATCH = 25
const CLIENT_EVENT_BUDGET = 1000
const MAX_TASK_DURATION_MS = 24 * 60 * 60 * 1000
const MAX_VERIFIED_OCCURRENCE_FUTURE_MS = 5 * 60 * 1000
const POST_SUBMISSION_OCCURRENCE_GRACE_MS = 5 * 60 * 1000
const POST_SUBMISSION_RECEIPT_GRACE_MS = 7 * 24 * 60 * 60 * 1000
const ID_PATTERN = /^[A-Za-z0-9_-]{3,160}$/
const compareStrings = (left, right) => left.localeCompare(right)
const CLIENT_EVENT_POLICIES = Object.freeze({
  MEDIA_RECORDING_OUTCOME: {
    detailKeys: ['taskRef', 'mediaType', 'outcome', 'stage', 'reason'],
  },
  STUDY_VIEW_OPENED: {
    message: 'Study view opened',
    detailKeys: [],
  },
  TASK_STARTED: {
    message: 'Task started',
    detailKeys: ['taskRef'],
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
  STRUCTURED_RESPONSE_ACTIVITY: {
    message: 'Structured response activity recorded',
    detailKeys: ['scopeRef', 'items'],
  },
  QUESTION_RESPONSE_UPDATED: {
    message: 'Question response updated',
    detailKeys: [
      'questionRef',
      'changedFields',
      'interactionSpanMs',
      'frequencyChanges',
      'severityChanges',
      'answerChanges',
      'commentInputChanges',
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

const rejectEvents = ({ invalidEvents, batchSize, studyId, batchId }) => {
  const details = { retryable: false, scope: 'events', invalidEvents }
  logger.warn('Log batch rejected', {
    rejectionScope: 'events',
    reasonCodes: [...new Set(invalidEvents.map((item) => item.reasonCode))],
    batchSize,
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
  if (!secret) {
    logger.error('LOG_ACTOR_HASH_SALT environment variable is not configured')
    throw error('internal', 'Logging service is unavailable')
  }
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

const verifiedOccurrenceFor = (value) => {
  const milliseconds =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Date.parse(value)
        : Number.NaN
  const occurredAt = new Date(milliseconds)
  if (
    !Number.isFinite(milliseconds) ||
    Number.isNaN(occurredAt.getTime()) ||
    occurredAt.getUTCFullYear() < 1 ||
    occurredAt.getUTCFullYear() > 9999 ||
    occurredAt.getTime() > Date.now() + MAX_VERIFIED_OCCURRENCE_FUTURE_MS
  ) {
    return null
  }
  return admin.firestore.Timestamp.fromDate(occurredAt)
}

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
  const keys = Object.keys(details || {}).sort(compareStrings)
  if (
    keys.join(',') !==
    CLIENT_EVENT_POLICIES.ANSWER_EDITED.detailKeys
      .slice()
      .sort(compareStrings)
      .join(',')
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

const validTaskStarted = (details, study) => {
  const keys = Object.keys(details || {}).sort(compareStrings)
  const match = /^task:(0|[1-9]\d*)$/.exec(details?.taskRef || '')
  if (
    keys.join(',') !== 'taskRef' ||
    !match ||
    normalizeStudyType(study.testType) !== 'USER' ||
    study.subType !== 'USER_UNMODERATED'
  ) {
    return false
  }
  const taskIndex = Number(match[1])
  return (
    Number.isSafeInteger(taskIndex) &&
    Boolean(study.testStructure?.userTasks?.[taskIndex])
  )
}

const structuredItemRefs = (taskType, constructs) =>
  constructs.flatMap(([construct, count]) =>
    Array.from({ length: count }, (_, index) =>
      `${taskType}:${construct}:${index}`,
    ),
  )

const STRUCTURED_TASK_ITEM_REFS = Object.freeze({
  sus: structuredItemRefs('sus', [['question', 10]]),
  'nasa-tlx': [
    'nasa-tlx:mentalDemand',
    'nasa-tlx:physicalDemand',
    'nasa-tlx:temporalDemand',
    'nasa-tlx:performance',
    'nasa-tlx:effort',
    'nasa-tlx:frustration',
  ],
  sart: [
    'sart:instability',
    'sart:complexity',
    'sart:variability',
    'sart:arousal',
    'sart:concentration',
    'sart:division',
    'sart:spareCapacity',
    'sart:informationQuantity',
    'sart:informationQuality',
    'sart:familiarity',
  ],
  'tam-1': structuredItemRefs('tam-1', [
    ['perceivedUsefulness', 10],
    ['perceivedEaseOfUse', 10],
  ]),
  'tam-2': structuredItemRefs('tam-2', [
    ['intentionToUse', 2],
    ['perceivedUsefulness', 4],
    ['perceivedEaseOfUse', 4],
    ['subjectiveNorm', 2],
    ['voluntariness', 3],
    ['image', 3],
    ['jobRelevance', 2],
    ['outputQuality', 2],
    ['resultDemonstrability', 4],
  ]),
  'tam-3': structuredItemRefs('tam-3', [
    ['perceivedUsefulness', 3],
    ['perceivedEaseOfUse', 3],
    ['subjectiveNorm', 3],
    ['image', 2],
    ['jobRelevance', 3],
    ['outputQuality', 3],
    ['resultDemonstrability', 2],
    ['computerSelfEfficacy', 3],
    ['perceptionsOfExternalControl', 3],
    ['computerAnxiety', 2],
    ['computerPlayfulness', 2],
    ['perceivedEnjoyment', 3],
    ['objectiveUsability', 2],
    ['behavioralIntention', 2],
    ['usePatterns', 2],
    ['experience', 2],
    ['voluntariness', 2],
  ]),
})

const validStructuredResponse = (details, study) => {
  const keys = Object.keys(details || {}).sort(compareStrings)
  if (
    keys.join(',') !==
    CLIENT_EVENT_POLICIES.STRUCTURED_RESPONSE_ACTIVITY.detailKeys
      .slice()
      .sort(compareStrings)
      .join(',') ||
    normalizeStudyType(study.testType) !== 'USER' ||
    study.subType !== 'USER_UNMODERATED'
  ) {
    return false
  }

  let allowedRefs
  const taskMatch = /^task:(0|[1-9]\d*)$/.exec(details.scopeRef || '')
  if (taskMatch) {
    const taskIndex = Number(taskMatch[1])
    const task = study.testStructure?.userTasks?.[taskIndex]
    if (!Number.isSafeInteger(taskIndex) || !task) return false
    allowedRefs = STRUCTURED_TASK_ITEM_REFS[task.taskType]
  } else if (['preTest', 'postTest'].includes(details.scopeRef)) {
    const questions = study.testStructure?.[details.scopeRef]
    if (!Array.isArray(questions)) return false
    allowedRefs = questions.flatMap((question, index) =>
      question?.selectionField === true &&
      Array.isArray(question.selectionFields) &&
      question.selectionFields.length > 0
        ? [`${details.scopeRef}:question:${index}`]
        : [],
    )
  } else {
    return false
  }

  if (
    !Array.isArray(allowedRefs) ||
    !Array.isArray(details.items) ||
    details.items.length < 1 ||
    details.items.length > allowedRefs.length
  ) {
    return false
  }

  const allowed = new Set(allowedRefs)
  const seen = new Set()
  return details.items.every((item) => {
    const itemKeys = Object.keys(item || {}).sort(compareStrings)
    if (
      itemKeys.join(',') !== 'changes,itemRef' ||
      typeof item.itemRef !== 'string' ||
      !allowed.has(item.itemRef) ||
      seen.has(item.itemRef) ||
      !Number.isInteger(item.changes) ||
      item.changes < 1 ||
      item.changes > 10000
    ) {
      return false
    }
    seen.add(item.itemRef)
    return true
  })
}
const RESPONSE_FIELD_COUNTS = Object.freeze({
  frequency: 'frequencyChanges',
  severity: 'severityChanges',
  answer: 'answerChanges',
  comment: 'commentInputChanges',
})

const validQuestionResponse = (details, study) => {
  const keys = Object.keys(details || {}).sort(compareStrings)
  if (
    keys.join(',') !==
    CLIENT_EVENT_POLICIES.QUESTION_RESPONSE_UPDATED.detailKeys
      .slice()
      .sort(compareStrings)
      .join(',')
  ) {
    return false
  }
  const changedFields = details.changedFields
  if (!Array.isArray(changedFields)) return false
  const uniqueFields = new Set(changedFields)
  return (
    normalizeStudyType(study.testType) === 'HEURISTIC' &&
    /^heuristic:\d+:question:\d+$/.test(details.questionRef) &&
    fieldExists(study, `${details.questionRef}:comment`) &&
    changedFields.length > 0 &&
    changedFields.length === uniqueFields.size &&
    changedFields.every((field) => RESPONSE_FIELD_COUNTS[field]) &&
    nonNegativeInteger(details.interactionSpanMs, 24 * 60 * 60 * 1000) &&
    Object.entries(RESPONSE_FIELD_COUNTS).every(([field, countKey]) => {
      const count = details[countKey]
      return (
        nonNegativeInteger(count, 10000) &&
        (changedFields.includes(field) ? count > 0 : count === 0)
      )
    })
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
    const recording =
      event?.eventType === 'MEDIA_RECORDING_OUTCOME' && isRecord(event?.details)
        ? recordingPolicy(study, event.details)
        : null
    const validDetails = (() => {
      if (recording) return true
      if (!isRecord(event?.details)) return false
      if (policy?.detailKeys.length === 0) {
        return Object.keys(event.details).length === 0
      }
      if (event?.eventType === 'ANSWER_EDITED') {
        return validAnswerEdit(event.details, study)
      }
      if (event?.eventType === 'QUESTION_RESPONSE_UPDATED') {
        return validQuestionResponse(event.details, study)
      }
      if (event?.eventType === 'TASK_STARTED') {
        return validTaskStarted(event.details, study)
      }
      if (event?.eventType === 'STRUCTURED_RESPONSE_ACTIVITY') {
        return validStructuredResponse(event.details, study)
      }
      return false
    })()
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
        layer: recording?.layer || 'methodological',
        level: recording?.level || 'info',
        details: recording?.details || {
          ...event.details,
          ...(event.eventType === 'TASK_STARTED'
            ? taskContext(study, event.details.taskRef)
            : {}),
          ...(event.eventType === 'ANSWER_EDITED' &&
          /^task:(0|[1-9]\d*):(answer|comment)$/.test(event.details.fieldRef)
            ? taskContext(
                study,
                event.details.fieldRef.split(':').slice(0, 2).join(':'),
              )
            : {}),
          ...(event.eventType === 'STRUCTURED_RESPONSE_ACTIVITY' &&
          /^task:(0|[1-9]\d*)$/.test(event.details.scopeRef)
            ? taskContext(study, event.details.scopeRef)
            : {}),
        },
        message: recording?.message || policy.message,
      })
    }
  }

  if (invalidEvents.length) {
    rejectEvents({
      invalidEvents,
      batchSize: payload.events.length,
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
      Object.keys(requestData).sort(compareStrings).join(',') !==
      'batchId,events,studyId'
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
      rejectEvents({
        invalidEvents,
        batchSize: events.length,
        studyId,
        batchId,
      })
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
        layer: event.layer,
        level: event.level,
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
  const keys = Object.keys(requestData).sort(compareStrings)
  const requiredKeys =
    requestData.eventType === 'TASK_ATTEMPT_FINISHED'
      ? ['eventType', 'studyId', 'taskRef']
      : ['eventType', 'studyId']
  const optionalKeys =
    requestData.eventType === 'TASK_ATTEMPT_FINISHED' ? ['occurredAt'] : []
  if (
    requiredKeys.some((key) => !keys.includes(key)) ||
    keys.some(
      (key) => !requiredKeys.includes(key) && !optionalKeys.includes(key),
    )
  ) {
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
        ...taskContext(study, requestData.taskRef, true),
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
    const occurredAt =
      event.eventType === 'TASK_ATTEMPT_FINISHED'
        ? verifiedOccurrenceFor(requestData.occurredAt)
        : null

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
      occurredAt: occurredAt || now,
      receivedAt: now,
      ...(event.eventType === 'TASK_ATTEMPT_FINISHED'
        ? { timeQuality: 'client-unverified' }
        : {}),
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
