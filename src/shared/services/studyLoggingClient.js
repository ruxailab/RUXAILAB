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
  if (eventType === 'TASK_STARTED') {
    const keys = Object.keys(details || {})
    const match = /^task:(0|[1-9]\d*)$/.exec(details?.taskRef || '')
    if (
      keys.length !== 1 ||
      keys[0] !== 'taskRef' ||
      !match ||
      !Number.isSafeInteger(Number(match[1]))
    ) {
      return null
    }
    return { taskRef: details.taskRef }
  }
  if (eventType === 'MEDIA_RECORDING_OUTCOME') {
    if (
      typeof details?.taskRef !== 'string' ||
      !/^task:(0|[1-9]\d*)$/.test(details.taskRef) ||
      !['audio', 'webcam', 'screen'].includes(details?.mediaType) ||
      !['completed', 'failed', 'permission_denied', 'cancelled'].includes(
        details?.outcome,
      ) ||
      !['permission', 'capture', 'upload'].includes(details?.stage) ||
      (details?.reason !== undefined &&
        ![
          'unsupported',
          'cancelled',
          'wrongSurface',
          'error',
          'permissionDenied',
          'deviceUnavailable',
          'captureError',
          'emptyRecording',
          'uploadError',
        ].includes(details.reason))
    )
      return null
    return {
      taskRef: details.taskRef,
      mediaType: details.mediaType,
      outcome: details.outcome,
      stage: details.stage,
      ...(details.reason !== undefined ? { reason: details.reason } : {}),
    }
  }
  if (eventType === 'STRUCTURED_RESPONSE_ACTIVITY') {
    const keys = Object.keys(details || {}).sort()
    const scopeRef = details?.scopeRef
    const scopeMatch = /^task:(0|[1-9]\d*)$/.exec(scopeRef || '')
    const validScope =
      (scopeMatch && Number.isSafeInteger(Number(scopeMatch[1]))) ||
      scopeRef === 'preTest' ||
      scopeRef === 'postTest'
    const itemPattern =
      /^(?:sus:question:[0-9]|nasa-tlx:(?:mentalDemand|physicalDemand|temporalDemand|performance|effort|frustration)|sart:(?:instability|complexity|variability|arousal|concentration|division|spareCapacity|informationQuantity|informationQuality|familiarity)|tam-[123]:[A-Za-z][A-Za-z0-9]*:(0|[1-9]\d*)|(?:preTest|postTest):question:(0|[1-9]\d*))$/
    if (
      keys.join(',') !== 'items,scopeRef' ||
      !validScope ||
      !Array.isArray(details.items) ||
      details.items.length < 1
    ) {
      return null
    }
    const seen = new Set()
    const items = []
    for (const item of details.items) {
      const itemKeys = Object.keys(item || {}).sort()
      if (
        itemKeys.join(',') !== 'changes,itemRef' ||
        typeof item.itemRef !== 'string' ||
        !itemPattern.test(item.itemRef) ||
        seen.has(item.itemRef) ||
        !Number.isInteger(item.changes) ||
        item.changes < 1 ||
        item.changes > 10000
      ) {
        return null
      }
      seen.add(item.itemRef)
      items.push({ itemRef: item.itemRef, changes: item.changes })
    }
    items.sort((left, right) => left.itemRef.localeCompare(right.itemRef))
    return { scopeRef, items }
  }
  if (eventType === 'QUESTION_RESPONSE_UPDATED') {
    if (!/^heuristic:\d+:question:\d+$/.test(details?.questionRef)) return null
    return {
      questionRef: details.questionRef,
      changedFields: [...(details.changedFields || [])],
      interactionSpanMs: details.interactionSpanMs,
      frequencyChanges: details.frequencyChanges,
      severityChanges: details.severityChanges,
      answerChanges: details.answerChanges,
      commentInputChanges: details.commentInputChanges,
    }
  }
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

const QUESTION_RESPONSE_FIELDS = Object.freeze({
  frequency: 'frequencyChanges',
  severity: 'severityChanges',
  answer: 'answerChanges',
  comment: 'commentInputChanges',
})

export const createQuestionResponseTracker = ({ logger, now = Date.now }) => {
  const responses = new Map()
  return {
    change(questionRef, field) {
      const countKey = QUESTION_RESPONSE_FIELDS[field]
      if (!countKey) return
      const changedAt = now()
      const response = responses.get(questionRef) || {
        firstChangeAt: changedAt,
        lastChangeAt: changedAt,
        frequencyChanges: 0,
        severityChanges: 0,
        answerChanges: 0,
        commentInputChanges: 0,
      }
      response.lastChangeAt = changedAt
      response[countKey] += 1
      responses.set(questionRef, response)
    },
    async finish(questionRef) {
      const response = responses.get(questionRef)
      responses.delete(questionRef)
      if (!response) return null
      const changedFields = Object.entries(QUESTION_RESPONSE_FIELDS)
        .filter(([, countKey]) => response[countKey] > 0)
        .map(([field]) => field)
      return logger.record(
        'QUESTION_RESPONSE_UPDATED',
        {
          questionRef,
          changedFields,
          interactionSpanMs: response.lastChangeAt - response.firstChangeAt,
          frequencyChanges: response.frequencyChanges,
          severityChanges: response.severityChanges,
          answerChanges: response.answerChanges,
          commentInputChanges: response.commentInputChanges,
        },
        new Date(response.lastChangeAt).toISOString(),
      )
    },
  }
}

export const createStructuredResponseTracker = ({
  logger,
  now = Date.now,
  enabled = true,
} = {}) => {
  const scopes = new Map()
  let telemetryEnabled = enabled

  const isEnabled = () =>
    typeof telemetryEnabled === 'function'
      ? telemetryEnabled()
      : telemetryEnabled === true
  const timestampFor = (value) => {
    if (Number.isFinite(value)) return value
    const parsed = Date.parse(value || '')
    return Number.isFinite(parsed) ? parsed : now()
  }
  const stateFor = (scopeRef) => {
    let state = scopes.get(scopeRef)
    if (!state) {
      state = {
        priorValues: new Map(),
        dirty: new Map(),
        dirtyLastAt: null,
        inFlight: null,
        needsRetry: false,
        episodes: new Map(),
        focused: new Set(),
      }
      scopes.set(scopeRef, state)
    }
    return state
  }
  const valueEntries = (currentValues) =>
    currentValues instanceof Map
      ? currentValues.entries()
      : Object.entries(currentValues || {})
  const setBaseline = (state, itemRef, value, rebase) => {
    if (
      typeof itemRef === 'string' &&
      (rebase || !state.priorValues.has(itemRef))
    ) {
      state.priorValues.set(itemRef, value)
    }
  }
  const markChanged = (state, itemRef, value, at) => {
    const previous = state.priorValues.get(itemRef)
    state.priorValues.set(itemRef, value)
    if (!isEnabled() || Object.is(previous, value)) return false
    state.dirty.set(itemRef, (state.dirty.get(itemRef) || 0) + 1)
    state.dirtyLastAt = Math.max(
      state.dirtyLastAt === null ? 0 : state.dirtyLastAt,
      timestampFor(at),
    )
    return true
  }
  const commitEpisode = (state, itemRef, episode) => {
    if (episode.mode === 'pointer') {
      state.priorValues.set(itemRef, episode.currentValue)
      return false
    }
    return markChanged(
      state,
      itemRef,
      episode.currentValue,
      episode.lastChangedAt,
    )
  }
  const finishEpisodes = (state) => {
    for (const [itemRef, episode] of state.episodes) {
      commitEpisode(state, itemRef, episode)
    }
    state.episodes.clear()
    state.focused.clear()
  }
  const mergeFailedSnapshot = (state, snapshot, occurredAt) => {
    for (const [itemRef, changes] of snapshot) {
      state.dirty.set(itemRef, (state.dirty.get(itemRef) || 0) + changes)
    }
    const laterAt = state.dirtyLastAt
    state.dirtyLastAt = Math.max(
      laterAt === null ? 0 : laterAt,
      occurredAt === null ? 0 : occurredAt,
    )
    state.needsRetry = true
  }
  const checkpoint = (scopeRef) => {
    const state = scopes.get(scopeRef)
    if (!state) return Promise.resolve(null)
    finishEpisodes(state)
    if (state.inFlight) {
      return state.inFlight.promise.then(() => checkpoint(scopeRef))
    }
    if (!state.dirty.size) return Promise.resolve(null)

    const snapshot = new Map(state.dirty)
    const occurredAt = state.dirtyLastAt
    state.dirty = new Map()
    state.dirtyLastAt = null
    const items = [...snapshot.entries()]
      .map(([itemRef, changes]) => ({ itemRef, changes }))
      .sort((left, right) => left.itemRef.localeCompare(right.itemRef))
    const attempt = Promise.resolve()
      .then(() =>
        logger.record(
          'STRUCTURED_RESPONSE_ACTIVITY',
          { scopeRef, items },
          new Date(
            occurredAt === null ? timestampFor() : occurredAt,
          ).toISOString(),
        ),
      )
      .then(
        (eventId) => {
          if (eventId !== null && eventId !== undefined) {
            state.needsRetry = false
            return eventId
          }
          mergeFailedSnapshot(state, snapshot, occurredAt)
          return null
        },
        () => {
          mergeFailedSnapshot(state, snapshot, occurredAt)
          return null
        },
      )
    const completion = attempt.finally(() => {
      if (state.inFlight?.promise === completion) state.inFlight = null
    })
    state.inFlight = { snapshot, occurredAt, promise: completion }
    return completion
  }

  return {
    seedScope(scopeRef, currentValues, { rebase = false } = {}) {
      const state = stateFor(scopeRef)
      for (const [itemRef, value] of valueEntries(currentValues)) {
        setBaseline(state, itemRef, value, rebase)
      }
    },
    choiceChanged(scopeRef, itemRef, value, at) {
      if (typeof scopeRef !== 'string' || typeof itemRef !== 'string') return
      const state = stateFor(scopeRef)
      markChanged(state, itemRef, value, at)
    },
    sliderFocus(scopeRef, itemRef) {
      const state = stateFor(scopeRef)
      state.focused.add(itemRef)
    },
    sliderPointerStart(scopeRef, itemRef, value, at) {
      const state = stateFor(scopeRef)
      state.focused.add(itemRef)
      state.episodes.set(itemRef, {
        mode: 'pointer',
        startValue: value,
        currentValue: value,
        lastChangedAt: timestampFor(at),
      })
    },
    sliderValueChanged(scopeRef, itemRef, value, at) {
      const state = stateFor(scopeRef)
      const changedAt = timestampFor(at)
      const episode = state.episodes.get(itemRef)
      if (episode) {
        episode.currentValue = value
        episode.lastChangedAt = changedAt
        return
      }
      if (!state.focused.has(itemRef)) {
        state.priorValues.set(itemRef, value)
        return
      }
      state.episodes.set(itemRef, {
        mode: 'keyboard',
        startValue: state.priorValues.get(itemRef),
        currentValue: value,
        lastChangedAt: changedAt,
      })
    },
    sliderPointerEnd(scopeRef, itemRef, value, at) {
      const state = stateFor(scopeRef)
      const episode = state.episodes.get(itemRef)
      if (!episode || episode.mode !== 'pointer') return
      episode.currentValue = value
      episode.lastChangedAt = timestampFor(at)
      if (Object.is(episode.startValue, value)) {
        state.priorValues.set(itemRef, value)
      } else {
        markChanged(state, itemRef, value, episode.lastChangedAt)
      }
      state.episodes.delete(itemRef)
    },
    sliderBlur(scopeRef, itemRef) {
      const state = scopes.get(scopeRef)
      const episode = state?.episodes.get(itemRef)
      if (!state || !episode || episode.mode !== 'keyboard') {
        state?.focused.delete(itemRef)
        return
      }
      commitEpisode(state, itemRef, episode)
      state.episodes.delete(itemRef)
      state.focused.delete(itemRef)
    },
    checkpoint,
    checkpointDirtyScopes() {
      return Promise.all(
        [...scopes.entries()]
          .filter(([, state]) =>
            state.dirty.size || state.inFlight || state.episodes.size,
          )
          .map(([scopeRef]) => checkpoint(scopeRef)),
      )
    },
    retryFailedCheckpoints() {
      return Promise.all(
        [...scopes.entries()]
          .filter(([, state]) => state.needsRetry && state.dirty.size)
          .map(([scopeRef]) => checkpoint(scopeRef)),
      )
    },
    hasPending() {
      return [...scopes.values()].some(
        (state) => state.dirty.size || state.inFlight || state.episodes.size,
      )
    },
    setEnabled(value) {
      telemetryEnabled = value
    },
  }
}
