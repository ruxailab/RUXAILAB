const MAX_BATCH_SIZE = 25
const CLAIM_TIMEOUT_MS = 2 * 60 * 1000
const QUEUE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000
const MAX_RETRY_MS = 15 * 60 * 1000
const PERMANENT_BATCH_REASONS = new Set([
  'NOT_ELIGIBLE',
  'CONSENT_REQUIRED',
  'STUDY_REMOVED',
  'SESSION_CLOSED',
  'MALFORMED_ENVELOPE',
  'BUDGET_EXHAUSTED',
])
const PERMANENT_EVENT_REASONS = new Set([
  'EVENT_ID_CONFLICT',
  'DUPLICATE_EVENT_ID',
  'UNKNOWN_EVENT_TYPE',
  'INVALID_EVENT_DETAILS',
  'INVALID_OCCURRED_AT',
  'SESSION_CLOSED',
  'SUBMISSION_CUTOFF',
])

const openQueueDatabase = (name) =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore('queues', { keyPath: 'key' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

export const createIndexedDbQueueStore = ({
  name = 'ruxailab-study-logging',
} = {}) => {
  const database = openQueueDatabase(name)
  return {
    async mutate(key, change) {
      const db = await database
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('queues', 'readwrite')
        const store = transaction.objectStore('queues')
        const request = store.get(key)
        let result
        request.onsuccess = () => {
          result = change(request.result || null)
          if (result) store.put(result)
          else store.delete(key)
        }
        transaction.oncomplete = () => resolve(result || null)
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
      })
    },
    async cleanupOwner(ownerUid) {
      const db = await database
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('queues', 'readwrite')
        const request = transaction.objectStore('queues').openCursor()
        request.onsuccess = () => {
          const cursor = request.result
          if (!cursor) return
          if (cursor.value.ownerUid === ownerUid) cursor.delete()
          cursor.continue()
        }
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
      })
    },
    async sweepExpired(now) {
      const db = await database
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('queues', 'readwrite')
        const request = transaction.objectStore('queues').openCursor()
        request.onsuccess = () => {
          const cursor = request.result
          if (!cursor) return
          const queue = cursor.value
          sweepExpired(queue, now)
          if (queue.events.length) cursor.update(queue)
          else cursor.delete()
          cursor.continue()
        }
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
      })
    },
  }
}

export const cleanupStudyLoggingForOwner = async (ownerUid, queueStore) => {
  if (!ownerUid) return
  try {
    await (queueStore || createIndexedDbQueueStore()).cleanupOwner(ownerUid)
  } catch {
    // Logging cleanup is fail-open for the primary logout flow.
  }
}

export const sweepExpiredStudyLogging = async (
  queueStore,
  now = Date.now(),
) => {
  try {
    await (queueStore || createIndexedDbQueueStore()).sweepExpired(now)
  } catch {
    // Logging maintenance is fail-open for application startup.
  }
}

const sanitizeDetails = (eventType, details) => {
  if (eventType === 'STUDY_VIEW_OPENED') return {}
  if (eventType !== 'ANSWER_EDITED') return null
  if (
    !/^(heuristic:\d+:question:\d+:(comment|answer)|(preTest|postTest|task):\d+:(answer|comment))$/.test(
      details?.fieldRef,
    )
  ) {
    return null
  }
  return {
    fieldRef: details.fieldRef,
    editSpanMs: details.editSpanMs,
    editOperations: details.editOperations,
    pasteOperations: details.pasteOperations,
    initialLength: details.initialLength,
    resultingLength: details.resultingLength,
  }
}

const freshQueue = (key, ownerUid, studyId) => ({
  key,
  ownerUid,
  studyId,
  events: [],
  claim: null,
})

const sweepExpired = (queue, now) => {
  const expired = (event) => now - event.queuedAt > QUEUE_LIFETIME_MS
  if (queue.claim) {
    const claimedIds = new Set(queue.claim.eventIds)
    const invalidClaim =
      queue.claim.eventIds.some(
        (eventId) => !queue.events.some((event) => event.eventId === eventId),
      ) ||
      queue.events.some(
        (event) => claimedIds.has(event.eventId) && expired(event),
      )
    if (invalidClaim) {
      queue.events = queue.events.filter(
        (event) => !claimedIds.has(event.eventId),
      )
      queue.claim = null
    }
  }
  queue.events = queue.events.filter((event) => !expired(event))
}

const callableDetails = (caught) =>
  caught?.details || caught?.data?.details || caught?.cause?.details

const classifyPermanentRejection = (details, claim) => {
  if (details?.retryable !== false) return null
  if (
    details.scope === 'batch' &&
    PERMANENT_BATCH_REASONS.has(details.reasonCode)
  ) {
    return { scope: 'batch' }
  }
  if (
    details.scope !== 'events' ||
    !Array.isArray(details.invalidEvents) ||
    details.invalidEvents.length === 0
  ) {
    return null
  }

  const claimIds = new Set(claim.eventIds)
  const invalidIds = new Set()
  for (const invalid of details.invalidEvents) {
    if (
      !invalid ||
      typeof invalid.eventId !== 'string' ||
      invalidIds.has(invalid.eventId) ||
      !claimIds.has(invalid.eventId) ||
      !PERMANENT_EVENT_REASONS.has(invalid.reasonCode)
    ) {
      return null
    }
    invalidIds.add(invalid.eventId)
  }
  return { scope: 'events', invalidIds }
}

export const createStudyLogger = ({
  ownerUid,
  studyId,
  submitBatch,
  queueStore = createIndexedDbQueueStore(),
  now = Date.now,
  random = Math.random,
  createId = () => crypto.randomUUID(),
  enabled = true,
}) => {
  const key = `${ownerUid}:${studyId}`
  let loggingEnabled = enabled

  const mutate = (change) => queueStore.mutate(key, change)

  const record = async (eventType, details, occurredAt) => {
    if (!loggingEnabled || !ownerUid || !studyId) return null
    const safeDetails = sanitizeDetails(eventType, details)
    if (!safeDetails) return null
    const eventId = createId()
    const queuedAt = now()
    const event = {
      eventId,
      eventType,
      occurredAt: occurredAt || new Date(queuedAt).toISOString(),
      details: safeDetails,
      queuedAt,
    }
    try {
      let batchReady = false
      await mutate((current) => {
        const queue = current || freshQueue(key, ownerUid, studyId)
        sweepExpired(queue, queuedAt)
        queue.events.push(event)
        batchReady = !queue.claim && queue.events.length >= MAX_BATCH_SIZE
        return queue
      })
      if (batchReady) void flush()
      return eventId
    } catch {
      return null
    }
  }

  const updateClaim = async (batchId, change) => {
    try {
      return await mutate((queue) => {
        if (!queue?.claim || queue.claim.batchId !== batchId) return queue
        return change(queue)
      })
    } catch {
      return null
    }
  }

  const flush = async ({ online = false } = {}) => {
    if (!loggingEnabled) return { status: 'disabled' }
    const currentTime = now()
    let deliver = false
    let queue
    try {
      queue = await mutate((current) => {
        if (!current) return null
        sweepExpired(current, currentTime)
        if (!current.events.length) return null

        if (current.claim) {
          const leaseActive =
            current.claim.inFlight &&
            currentTime - current.claim.claimedAt < CLAIM_TIMEOUT_MS
          const retryDue = currentTime >= current.claim.nextAttemptAt
          if (leaseActive || (!retryDue && !online)) return current
          current.claim.inFlight = true
          current.claim.claimedAt = currentTime
          deliver = true
          return current
        }

        current.claim = {
          batchId: createId(),
          eventIds: current.events
            .slice(0, MAX_BATCH_SIZE)
            .map((event) => event.eventId),
          claimedAt: currentTime,
          inFlight: true,
          attemptCount: 0,
          nextAttemptAt: 0,
        }
        deliver = true
        return current
      })
    } catch {
      return { status: 'deferred' }
    }

    if (!deliver || !queue?.claim) return { status: 'deferred' }
    const claim = queue.claim
    const claimedEvents = claim.eventIds.map((eventId) =>
      queue.events.find((event) => event.eventId === eventId),
    )
    const payload = {
      studyId,
      batchId: claim.batchId,
      events: claimedEvents.map(({ queuedAt: _queuedAt, ...event }) => event),
    }

    try {
      const response = await submitBatch(payload)
      const acknowledgement = response?.data || response
      if (
        ['accepted', 'duplicate'].includes(acknowledgement?.status) &&
        acknowledgement?.batchId === claim.batchId
      ) {
        await updateClaim(claim.batchId, (current) => {
          const acknowledged = new Set(current.claim.eventIds)
          current.events = current.events.filter(
            (event) => !acknowledged.has(event.eventId),
          )
          current.claim = null
          return current.events.length ? current : null
        })
        return acknowledgement
      }
      throw new Error('Unrecognized logging acknowledgement')
    } catch (caught) {
      const details = callableDetails(caught)
      const permanent = classifyPermanentRejection(details, claim)
      if (permanent) {
        await updateClaim(claim.batchId, (current) => {
          const discarded =
            permanent.scope === 'batch'
              ? new Set(current.claim.eventIds)
              : permanent.invalidIds
          current.events = current.events.filter(
            (event) => !discarded.has(event.eventId),
          )
          current.claim = null
          return current.events.length ? current : null
        })
        return { status: 'discarded' }
      }
      await updateClaim(claim.batchId, (current) => {
        const attemptCount = current.claim.attemptCount + 1
        const retryWindow = Math.min(
          5000 * 2 ** current.claim.attemptCount,
          MAX_RETRY_MS,
        )
        current.claim = {
          ...current.claim,
          inFlight: false,
          attemptCount,
          nextAttemptAt: now() + retryWindow / 2 + random() * (retryWindow / 2),
        }
        return current
      })
      return { status: 'deferred', details }
    }
  }

  const cleanup = async () => {
    try {
      await mutate(() => null)
    } catch {
      // Logging cleanup is fail-open for the primary logout flow.
    }
  }

  return {
    record,
    flush,
    cleanup,
    setEnabled(value) {
      loggingEnabled = value === true
    },
  }
}

export const createAnswerEditTracker = ({ logger, now = Date.now }) => {
  const edits = new Map()
  return {
    begin(fieldRef, initialLength) {
      edits.set(fieldRef, {
        initialLength,
        resultingLength: initialLength,
        firstInputAt: null,
        lastInputAt: null,
        editOperations: 0,
        pasteOperations: 0,
      })
    },
    input(fieldRef, resultingLength, { pasted = false } = {}) {
      const edit = edits.get(fieldRef)
      if (!edit) return
      const inputAt = now()
      edit.firstInputAt ??= inputAt
      edit.lastInputAt = inputAt
      edit.resultingLength = resultingLength
      edit.editOperations += 1
      if (pasted) edit.pasteOperations += 1
    },
    async finish(fieldRef) {
      const edit = edits.get(fieldRef)
      edits.delete(fieldRef)
      if (!edit?.editOperations) return null
      return logger.record('ANSWER_EDITED', {
        fieldRef,
        editSpanMs: edit.lastInputAt - edit.firstInputAt,
        editOperations: edit.editOperations,
        pasteOperations: edit.pasteOperations,
        initialLength: edit.initialLength,
        resultingLength: edit.resultingLength,
      })
    },
  }
}
