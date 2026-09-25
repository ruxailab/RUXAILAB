import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { admin } from '../src/core/firebase/f.firebase.js'
import { logEvents, requestLogEvent } from '../src/https/logEvents.js'
import logger from '../src/utils/logger.js'

const projectId = 'demo-ruxailab-logging'
const compareStrings = (left, right) => left.localeCompare(right)
const savedLogActorHashSalt = process.env.LOG_ACTOR_HASH_SALT
let testEnv
let ownedAdminApp
jest.setTimeout(30000)

const participantRequest = (data, uid = 'participant') => ({
  auth: uid ? { uid } : null,
  data,
})

const verifiedRequest = (eventType, taskRef, overrides = {}) =>
  participantRequest({
    studyId: 'study-1',
    eventType,
    ...(taskRef ? { taskRef } : {}),
    ...overrides,
  })

const useUserStudy = async (answer = {}) => {
  await admin
    .firestore()
    .doc('tests/study-1')
    .update({
      testType: 'USER',
      subType: 'USER_UNMODERATED',
      'studyRoleMap.participant': 5,
      testStructure: { userTasks: [{ id: 'task-1' }] },
    })
  await admin
    .firestore()
    .doc('answers/answer-1')
    .set({
      type: 'USER',
      studyId: 'study-1',
      taskAnswers: {
        participant: {
          consentCompleted: true,
          submitted: false,
          tasks: [{ attempted: false, completed: false, taskTime: 0 }],
          ...answer,
        },
      },
    })
}

const viewBatch = (batchId = 'batch-1', eventId = 'event-1') => ({
  studyId: 'study-1',
  batchId,
  events: [
    {
      eventId,
      eventType: 'STUDY_VIEW_OPENED',
      occurredAt: '2026-08-14T10:00:00.000Z',
      details: {},
    },
  ],
})

const answerEdited = (eventId = 'edit-1', overrides = {}) => ({
  eventId,
  eventType: 'ANSWER_EDITED',
  occurredAt: '2026-08-14T10:01:00.000Z',
  details: {
    fieldRef: 'heuristic:0:question:0:comment',
    editSpanMs: 1400,
    editOperations: 3,
    pasteOperations: 1,
    initialLength: 4,
    resultingLength: 12,
  },
  ...overrides,
})

const questionResponseUpdated = (eventId = 'response-1', overrides = {}) => ({
  eventId,
  eventType: 'QUESTION_RESPONSE_UPDATED',
  occurredAt: '2026-08-14T10:01:18.400Z',
  details: {
    questionRef: 'heuristic:0:question:0',
    changedFields: ['frequency', 'severity', 'comment'],
    interactionSpanMs: 18400,
    frequencyChanges: 1,
    severityChanges: 2,
    answerChanges: 0,
    commentInputChanges: 26,
  },
  ...overrides,
})

beforeAll(async () => {
  if (!admin.apps.length) ownedAdminApp = admin.initializeApp({ projectId })
  testEnv = await initializeTestEnvironment({ projectId })
})

afterAll(async () => {
  await testEnv.cleanup()
  if (ownedAdminApp) await ownedAdminApp.delete()
  if (savedLogActorHashSalt === undefined) {
    delete process.env.LOG_ACTOR_HASH_SALT
  } else {
    process.env.LOG_ACTOR_HASH_SALT = savedLogActorHashSalt
  }
})

afterEach(() => jest.restoreAllMocks())

beforeEach(async () => {
  process.env.LOG_ACTOR_HASH_SALT = 'logging-test-secret'
  await testEnv.clearFirestore()
  await admin
    .firestore()
    .collection('tests')
    .doc('study-1')
    .set({
      testType: 'HEURISTIC',
      answersDocId: 'answer-1',
      isPublic: false,
      testAdmin: { userDocId: 'owner' },
      studyRoleMap: { participant: 1, researcher: 2 },
      testStructure: [{ questions: [{ id: 'question-1' }] }],
    })
})

describe('authenticated logging commands', () => {
  it('reports a missing actor hash salt as an operational failure', async () => {
    const errorLog = jest.spyOn(logger, 'error').mockImplementation(() => {})
    delete process.env.LOG_ACTOR_HASH_SALT

    await expect(
      logEvents.run(participantRequest(viewBatch())),
    ).rejects.toMatchObject({ code: 'internal' })
    expect(errorLog).toHaveBeenCalledWith(
      'LOG_ACTOR_HASH_SALT environment variable is not configured',
    )
  })

  it('initializes a Study Session and exposes its first view observation to an Admin', async () => {
    await expect(
      logEvents.run(participantRequest(viewBatch())),
    ).resolves.toEqual({ status: 'accepted', batchId: 'batch-1' })

    const sessions = await admin
      .firestore()
      .collection('tests/study-1/studySessions')
      .get()
    expect(sessions.docs).toHaveLength(1)
    expect(sessions.docs[0].id).toMatch(/^[a-f0-9]{64}$/)
    expect(sessions.docs[0].data()).toMatchObject({
      participantLabel: 'P-001',
      clientEventCount: 1,
    })

    const meta = await admin
      .firestore()
      .doc('tests/study-1/loggingMeta/state')
      .get()
    expect(meta.data()).toEqual({ nextParticipantNumber: 2 })

    const adminDb = testEnv.authenticatedContext('owner').firestore()
    const page = await assertSucceeds(
      getDocs(
        query(
          collection(adminDb, 'tests/study-1/logs'),
          orderBy('occurredAt', 'desc'),
          orderBy('__name__', 'desc'),
          limit(20),
        ),
      ),
    )
    expect(page.docs).toHaveLength(1)
    expect(page.docs[0].data()).toMatchObject({
      eventId: 'event-1',
      batchId: 'batch-1',
      participantLabel: 'P-001',
      actorRole: 'evaluator',
      eventType: 'STUDY_VIEW_OPENED',
      layer: 'methodological',
      level: 'info',
      source: 'study-client',
      message: 'Study view opened',
      details: {},
      timeQuality: 'client-unverified',
    })
    expect(page.docs[0].data()).not.toHaveProperty('uid')
  })

  it('reuses a participant label while concurrent new participants receive distinct labels', async () => {
    await logEvents.run(participantRequest(viewBatch()))
    await logEvents.run(participantRequest(viewBatch('batch-2', 'event-2')))

    await admin.firestore().doc('tests/study-1').update({
      'studyRoleMap.participant-2': 1,
      'studyRoleMap.participant-3': 1,
    })
    await Promise.all([
      logEvents.run(
        participantRequest(viewBatch('batch-3', 'event-3'), 'participant-2'),
      ),
      logEvents.run(
        participantRequest(viewBatch('batch-4', 'event-4'), 'participant-3'),
      ),
    ])

    const sessions = await admin
      .firestore()
      .collection('tests/study-1/studySessions')
      .get()
    expect(
      sessions.docs
        .map((item) => item.data().participantLabel)
        .sort(compareStrings),
    ).toEqual(['P-001', 'P-002', 'P-003'])
    expect(
      sessions.docs
        .find((item) => item.data().participantLabel === 'P-001')
        .data().clientEventCount,
    ).toBe(2)
    await expect(
      admin.firestore().doc('tests/study-1/loggingMeta/state').get(),
    ).resolves.toMatchObject({ exists: true })
    const meta = await admin
      .firestore()
      .doc('tests/study-1/loggingMeta/state')
      .get()
    expect(meta.data()).toEqual({ nextParticipantNumber: 4 })
  })

  it('denies ineligible callers generically without creating logging state', async () => {
    for (const [uid, expectedCode] of [
      [null, 'unauthenticated'],
      ['stranger', 'permission-denied'],
    ]) {
      await expect(
        logEvents.run(participantRequest(viewBatch(), uid)),
      ).rejects.toMatchObject({
        code: expectedCode,
        details: {
          retryable: false,
          scope: 'batch',
          reasonCode: 'NOT_ELIGIBLE',
        },
      })
    }

    await expect(
      logEvents.run(
        participantRequest({ ...viewBatch(), unexpected: true }, 'stranger'),
      ),
    ).rejects.toMatchObject({
      code: 'permission-denied',
      details: {
        retryable: false,
        scope: 'batch',
        reasonCode: 'NOT_ELIGIBLE',
      },
    })

    for (const name of ['studySessions', 'logs', 'logBatches', 'loggingMeta']) {
      const snapshot = await admin
        .firestore()
        .collection(`tests/study-1/${name}`)
        .get()
      expect(snapshot.empty).toBe(true)
    }
  })

  it('creates no logging state for a consent-gated study before committed acceptance', async () => {
    await admin.firestore().doc('tests/study-1').update({
      testType: 'USER',
      subType: 'USER_UNMODERATED',
      'studyRoleMap.participant': 5,
    })
    await admin
      .firestore()
      .doc('answers/answer-1')
      .set({
        type: 'USER',
        studyId: 'study-1',
        taskAnswers: { participant: { consentCompleted: false } },
      })

    await expect(
      logEvents.run(participantRequest(viewBatch())),
    ).rejects.toMatchObject({
      code: 'failed-precondition',
      details: { scope: 'batch', reasonCode: 'CONSENT_REQUIRED' },
    })

    const state = await Promise.all(
      ['studySessions', 'logs', 'logBatches', 'loggingMeta'].map((name) =>
        admin.firestore().collection(`tests/study-1/${name}`).get(),
      ),
    )
    expect(state.every((snapshot) => snapshot.empty)).toBe(true)
  })

  it('allows only Admin log reads and forbids every direct logging write', async () => {
    await admin.firestore().doc('tests/study-1').update({ isPublic: true })
    await logEvents.run(participantRequest(viewBatch(), 'public-participant'))
    const participantDb = testEnv
      .authenticatedContext('public-participant')
      .firestore()
    const adminDb = testEnv.authenticatedContext('owner').firestore()
    const researcherDb = testEnv.authenticatedContext('researcher').firestore()

    await assertFails(getDocs(collection(participantDb, 'tests/study-1/logs')))
    await assertSucceeds(
      getDocs(collection(adminDb, 'tests/study-1/studySessions')),
    )
    await assertFails(
      getDocs(collection(researcherDb, 'tests/study-1/studySessions')),
    )
    await assertFails(getDoc(doc(adminDb, 'tests/study-1/logBatches/hidden')))
    await assertFails(getDoc(doc(adminDb, 'tests/study-1/loggingMeta/state')))
    await assertFails(
      setDoc(doc(adminDb, 'tests/study-1/logs/forged'), {
        eventType: 'STUDY_VIEW_OPENED',
      }),
    )
    await assertFails(
      setDoc(doc(adminDb, 'tests/study-1/studySessions/forged'), {
        participantLabel: 'P-999',
      }),
    )
  })
})

describe('client-observed batch delivery', () => {
  it('accepts a grouped heuristic question response without response values', async () => {
    await logEvents.run(
      participantRequest({
        ...viewBatch(),
        events: [questionResponseUpdated()],
      }),
    )

    const logs = await admin.firestore().collection('tests/study-1/logs').get()
    expect(logs.docs[0].data()).toMatchObject({
      eventType: 'QUESTION_RESPONSE_UPDATED',
      message: 'Question response updated',
      details: questionResponseUpdated().details,
    })
    expect(JSON.stringify(logs.docs[0].data())).not.toContain('comment text')
  })

  it('rejects grouped heuristic responses from user-test studies', async () => {
    await useUserStudy()

    await expect(
      logEvents.run(
        participantRequest({
          ...viewBatch(),
          events: [questionResponseUpdated()],
        }),
      ),
    ).rejects.toMatchObject({
      code: 'invalid-argument',
      details: {
        invalidEvents: [
          {
            eventId: 'response-1',
            reasonCode: 'INVALID_EVENT_DETAILS',
          },
        ],
      },
    })
  })

  it('atomically stores a valid multi-event batch and charges its full observation count once', async () => {
    await expect(
      logEvents.run(
        participantRequest({
          ...viewBatch(),
          events: [viewBatch().events[0], answerEdited()],
        }),
      ),
    ).resolves.toEqual({ status: 'accepted', batchId: 'batch-1' })

    const [sessions, logs, batches] = await Promise.all([
      admin.firestore().collection('tests/study-1/studySessions').get(),
      admin.firestore().collection('tests/study-1/logs').get(),
      admin.firestore().collection('tests/study-1/logBatches').get(),
    ])
    expect(sessions.docs[0].data().clientEventCount).toBe(2)
    expect(logs.docs).toHaveLength(2)
    expect(batches.docs[0].data()).toMatchObject({ eventCount: 2 })
    const edit = logs.docs.find(
      (item) => item.data().eventType === 'ANSWER_EDITED',
    )
    expect(edit.data()).toMatchObject({
      level: 'info',
      source: 'study-client',
      message: 'Answer field edited',
      details: answerEdited().details,
    })
    expect(JSON.stringify(edit.data())).not.toContain('answer content')
  })

  it('lets the first accepted batch body win and ignores every replay body', async () => {
    await logEvents.run(participantRequest(viewBatch()))
    await expect(
      logEvents.run(
        participantRequest({
          studyId: 'study-1',
          batchId: 'batch-1',
          unexpected: true,
          events: [
            {
              eventId: 'changed-event',
              eventType: 'FORGED_SERVER_EVENT',
              occurredAt: 'not-a-time',
              details: { rawText: 'must be ignored' },
            },
          ],
        }),
      ),
    ).resolves.toEqual({ status: 'duplicate', batchId: 'batch-1' })

    const [logs, sessions] = await Promise.all([
      admin.firestore().collection('tests/study-1/logs').get(),
      admin.firestore().collection('tests/study-1/studySessions').get(),
    ])
    expect(logs.docs).toHaveLength(1)
    expect(logs.docs[0].data().eventId).toBe('event-1')
    expect(sessions.docs[0].data().clientEventCount).toBe(1)
  })

  it('rejects reuse of an accepted Event ID without partially writing its new batch', async () => {
    await logEvents.run(participantRequest(viewBatch()))
    const warnLog = jest.spyOn(logger, 'warn').mockImplementation(() => {})

    await expect(
      logEvents.run(
        participantRequest({
          studyId: 'study-1',
          batchId: 'batch-2',
          events: [viewBatch().events[0], answerEdited('edit-2')],
        }),
      ),
    ).rejects.toMatchObject({
      code: 'invalid-argument',
      details: {
        retryable: false,
        scope: 'events',
        invalidEvents: [
          { eventId: 'event-1', reasonCode: 'EVENT_ID_CONFLICT' },
        ],
      },
    })
    expect(warnLog).toHaveBeenCalledWith(
      'Log batch rejected',
      expect.objectContaining({ batchSize: 2, invalidEventCount: 1 }),
    )

    const [logs, batches, sessions] = await Promise.all([
      admin.firestore().collection('tests/study-1/logs').get(),
      admin.firestore().collection('tests/study-1/logBatches').get(),
      admin.firestore().collection('tests/study-1/studySessions').get(),
    ])
    expect(logs.docs).toHaveLength(1)
    expect(batches.docs).toHaveLength(1)
    expect(sessions.docs[0].data().clientEventCount).toBe(1)
  })

  it('returns every independently invalid Event ID and writes none of the batch', async () => {
    const warnLog = jest.spyOn(logger, 'warn').mockImplementation(() => {})
    await expect(
      logEvents.run(
        participantRequest({
          studyId: 'study-1',
          batchId: 'batch-invalid',
          events: [
            {
              ...viewBatch().events[0],
              eventId: 'bad-type',
              eventType: 'STUDY_SUBMITTED',
            },
            answerEdited('bad-details', {
              details: { ...answerEdited().details, rawText: 'private text' },
            }),
            {
              ...viewBatch().events[0],
              eventId: 'bad-time',
              occurredAt: 'not-a-time',
            },
            { ...viewBatch().events[0], eventId: 'valid-event' },
          ],
        }),
      ),
    ).rejects.toMatchObject({
      code: 'invalid-argument',
      details: {
        retryable: false,
        scope: 'events',
        invalidEvents: [
          { eventId: 'bad-type', reasonCode: 'UNKNOWN_EVENT_TYPE' },
          { eventId: 'bad-details', reasonCode: 'INVALID_EVENT_DETAILS' },
          { eventId: 'bad-time', reasonCode: 'INVALID_OCCURRED_AT' },
        ],
      },
    })
    expect(warnLog).toHaveBeenCalledWith(
      'Log batch rejected',
      expect.objectContaining({ batchSize: 4, invalidEventCount: 3 }),
    )

    const state = await Promise.all(
      ['studySessions', 'logs', 'logBatches', 'loggingMeta'].map((name) =>
        admin.firestore().collection(`tests/study-1/${name}`).get(),
      ),
    )
    expect(state.every((snapshot) => snapshot.empty)).toBe(true)
  })

  it('rejects extra envelope fields, non-map details, and coerced occurrence times', async () => {
    await expect(
      logEvents.run(
        participantRequest({
          ...viewBatch(),
          unexpected: true,
        }),
      ),
    ).rejects.toMatchObject({
      details: expect.objectContaining({ reasonCode: 'MALFORMED_ENVELOPE' }),
    })

    await expect(
      logEvents.run(
        participantRequest({
          ...viewBatch(),
          events: [
            { ...viewBatch().events[0], details: [] },
            {
              ...viewBatch().events[0],
              eventId: 'null-time',
              occurredAt: null,
            },
            {
              ...viewBatch().events[0],
              eventId: 'out-of-range-time',
              occurredAt: '+010000-01-01T00:00:00.000Z',
            },
          ],
        }),
      ),
    ).rejects.toMatchObject({
      details: {
        retryable: false,
        scope: 'events',
        invalidEvents: expect.arrayContaining([
          { eventId: 'event-1', reasonCode: 'INVALID_EVENT_DETAILS' },
          { eventId: 'null-time', reasonCode: 'INVALID_OCCURRED_AT' },
          {
            eventId: 'out-of-range-time',
            reasonCode: 'INVALID_OCCURRED_AT',
          },
        ]),
      },
    })

    await expect(
      admin.firestore().collection('tests/study-1/logs').get(),
    ).resolves.toMatchObject({ empty: true })
  })

  it('scopes Event and Batch identities to the server-derived Study Session', async () => {
    await admin.firestore().doc('tests/study-1').update({
      'studyRoleMap.participant-2': 1,
    })

    await Promise.all([
      logEvents.run(participantRequest(viewBatch(), 'participant')),
      logEvents.run(participantRequest(viewBatch(), 'participant-2')),
    ])

    const [logs, batches] = await Promise.all([
      admin.firestore().collection('tests/study-1/logs').get(),
      admin.firestore().collection('tests/study-1/logBatches').get(),
    ])
    expect(logs.docs).toHaveLength(2)
    expect(batches.docs).toHaveLength(2)
    expect(new Set(logs.docs.map((item) => item.data().sessionId)).size).toBe(2)
  })

  it('accepts one concurrent copy of a batch and acknowledges the other as duplicate', async () => {
    const results = await Promise.all([
      logEvents.run(participantRequest(viewBatch())),
      logEvents.run(participantRequest(viewBatch())),
    ])

    expect(results.map((result) => result.status).sort(compareStrings)).toEqual(
      ['accepted', 'duplicate'],
    )
    const [logs, sessions] = await Promise.all([
      admin.firestore().collection('tests/study-1/logs').get(),
      admin.firestore().collection('tests/study-1/studySessions').get(),
    ])
    expect(logs.docs).toHaveLength(1)
    expect(sessions.docs[0].data().clientEventCount).toBe(1)
  })

  it('cannot exceed the observation budget through concurrent distinct batches', async () => {
    await logEvents.run(participantRequest(viewBatch()))
    const sessions = await admin
      .firestore()
      .collection('tests/study-1/studySessions')
      .get()
    await sessions.docs[0].ref.update({ clientEventCount: 999 })

    const results = await Promise.allSettled([
      logEvents.run(participantRequest(viewBatch('batch-2', 'event-2'))),
      logEvents.run(participantRequest(viewBatch('batch-3', 'event-3'))),
    ])

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1)
    expect(
      results.filter((result) => result.status === 'rejected'),
    ).toHaveLength(1)
    expect(
      results.find((result) => result.status === 'rejected').reason,
    ).toMatchObject({
      code: 'resource-exhausted',
      details: { scope: 'batch', reasonCode: 'BUDGET_EXHAUSTED' },
    })
    const [storedLogs, storedSessions] = await Promise.all([
      admin.firestore().collection('tests/study-1/logs').get(),
      admin.firestore().collection('tests/study-1/studySessions').get(),
    ])
    expect(storedLogs.docs).toHaveLength(2)
    expect(storedSessions.docs[0].data().clientEventCount).toBe(1000)
  })
})

describe('verified lifecycle events', () => {
  it('initializes a consent-gated session only from committed consent and is idempotent', async () => {
    await useUserStudy({ consentCompleted: false })

    await expect(
      requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED')),
    ).rejects.toMatchObject({
      code: 'failed-precondition',
      details: { reasonCode: 'UNVERIFIED_TRANSITION' },
    })

    await admin.firestore().doc('answers/answer-1').update({
      'taskAnswers.participant.consentCompleted': true,
    })
    await expect(
      requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED')),
    ).resolves.toEqual({ status: 'accepted' })
    await expect(
      requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED')),
    ).resolves.toEqual({ status: 'duplicate' })

    const [sessions, logs] = await Promise.all([
      admin.firestore().collection('tests/study-1/studySessions').get(),
      admin.firestore().collection('tests/study-1/logs').get(),
    ])
    expect(sessions.docs).toHaveLength(1)
    expect(sessions.docs[0].data()).toMatchObject({
      participantLabel: 'P-001',
      clientEventCount: 0,
    })
    expect(sessions.docs[0].data().consentAcceptedAt).toBeDefined()
    expect(logs.docs).toHaveLength(1)
    expect(logs.docs[0].data()).toMatchObject({
      eventId: 'CONSENT_ACCEPTED',
      eventType: 'CONSENT_ACCEPTED',
      participantLabel: 'P-001',
      layer: 'methodological',
      level: 'info',
      source: 'logging-service',
      message: 'Consent accepted',
      details: {},
    })
    expect(logs.docs[0].data()).not.toHaveProperty('timeQuality')
  })

  it('derives task outcome and bounded duration from committed answer state', async () => {
    await useUserStudy()
    await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
    await admin
      .firestore()
      .doc('answers/answer-1')
      .update({
        'taskAnswers.participant.tasks.0': {
          attempted: true,
          completed: false,
          taskTime: 4321,
        },
      })

    await expect(
      requestLogEvent.run(
        participantRequest({
          studyId: 'study-1',
          eventType: 'TASK_ATTEMPT_FINISHED',
          taskRef: 'task:0',
          outcome: 'completed',
        }),
      ),
    ).rejects.toMatchObject({
      code: 'invalid-argument',
      details: { reasonCode: 'MALFORMED_REQUEST' },
    })
    await expect(
      requestLogEvent.run(verifiedRequest('TASK_ATTEMPT_FINISHED', 'task:0')),
    ).resolves.toEqual({ status: 'accepted' })
    await expect(
      requestLogEvent.run(verifiedRequest('TASK_ATTEMPT_FINISHED', 'task:0')),
    ).resolves.toEqual({ status: 'duplicate' })

    const logs = await admin
      .firestore()
      .collection('tests/study-1/logs')
      .where('eventType', '==', 'TASK_ATTEMPT_FINISHED')
      .get()
    expect(logs.docs).toHaveLength(1)
    expect(logs.docs[0].data()).toMatchObject({
      eventId: 'TASK_ATTEMPT_FINISHED:task:0',
      level: 'warning',
      source: 'logging-service',
      details: {
        taskRef: 'task:0',
        outcome: 'not_completed',
        taskDurationMs: 4321,
      },
    })
    expect(logs.docs[0].data().occurredAt).toBeDefined()
    expect(logs.docs[0].data().receivedAt).toBeDefined()
  })

  it('stores a valid observed finish time separately from server receipt time', async () => {
    await useUserStudy({
      tasks: [{ attempted: true, completed: true, taskTime: 1 }],
    })
    await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
    const observedAt = new Date(Date.now() - 60_000).toISOString()

    await expect(
      requestLogEvent.run(
        verifiedRequest('TASK_ATTEMPT_FINISHED', 'task:0', {
          occurredAt: observedAt,
        }),
      ),
    ).resolves.toEqual({ status: 'accepted' })

    const logs = await admin
      .firestore()
      .collection('tests/study-1/logs')
      .where('eventType', '==', 'TASK_ATTEMPT_FINISHED')
      .get()
    const event = logs.docs[0].data()
    expect(event.occurredAt.toMillis()).toBe(Date.parse(observedAt))
    expect(event.receivedAt.toMillis()).toBeGreaterThan(
      event.occurredAt.toMillis(),
    )
    expect(event.timeQuality).toBe('client-unverified')
  })

  it.each(['not-a-time', '9999-01-01T00:00:00.000Z'])(
    'falls back to server time for an invalid observed finish time: %s',
    async (occurredAt) => {
      await useUserStudy({
        tasks: [{ attempted: true, completed: true, taskTime: 1 }],
      })
      await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))

      await expect(
        requestLogEvent.run(
          verifiedRequest('TASK_ATTEMPT_FINISHED', 'task:0', { occurredAt }),
        ),
      ).resolves.toEqual({ status: 'accepted' })

      const logs = await admin
        .firestore()
        .collection('tests/study-1/logs')
        .where('eventType', '==', 'TASK_ATTEMPT_FINISHED')
        .get()
      const event = logs.docs[0].data()
      expect(event.timeQuality).toBe('client-unverified')
      expect(event.occurredAt).toBeDefined()
      expect(event.receivedAt).toBeDefined()
      expect(
        Math.abs(event.occurredAt.toMillis() - event.receivedAt.toMillis()),
      ).toBeLessThan(5000)
    },
  )

  it('rejects forged or premature verified transitions without partial state', async () => {
    await useUserStudy()

    for (const request of [
      verifiedRequest('TASK_ATTEMPT_FINISHED', 'task:0'),
      verifiedRequest('TASK_ATTEMPT_FINISHED', 'task:9'),
      verifiedRequest('STUDY_SUBMITTED'),
    ]) {
      await expect(requestLogEvent.run(request)).rejects.toMatchObject({
        code: 'failed-precondition',
        details: { reasonCode: 'UNVERIFIED_TRANSITION' },
      })
    }

    for (const name of ['studySessions', 'logs', 'loggingMeta']) {
      const snapshot = await admin
        .firestore()
        .collection(`tests/study-1/${name}`)
        .get()
      expect(snapshot.empty).toBe(true)
    }
  })

  it('verifies submission for a taskless method without a consent gate', async () => {
    await admin
      .firestore()
      .doc('answers/answer-1')
      .set({
        type: 'HEURISTIC',
        studyId: 'study-1',
        heuristicAnswers: { participant: { submitted: true } },
      })

    await expect(
      requestLogEvent.run(verifiedRequest('STUDY_SUBMITTED')),
    ).resolves.toEqual({ status: 'accepted' })

    const [sessions, logs] = await Promise.all([
      admin.firestore().collection('tests/study-1/studySessions').get(),
      admin.firestore().collection('tests/study-1/logs').get(),
    ])
    expect(sessions.docs[0].data().submittedAt).toBeDefined()
    expect(logs.docs[0].data()).toMatchObject({
      eventId: 'STUDY_SUBMITTED',
      eventType: 'STUDY_SUBMITTED',
      details: {},
    })
  })

  it('records deterministic submission after the client observation budget is exhausted', async () => {
    await useUserStudy({ submitted: true })
    await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
    const sessions = await admin
      .firestore()
      .collection('tests/study-1/studySessions')
      .get()
    await sessions.docs[0].ref.update({ clientEventCount: 1000 })

    await expect(
      requestLogEvent.run(verifiedRequest('STUDY_SUBMITTED')),
    ).resolves.toEqual({ status: 'accepted' })
    const updatedSession = await sessions.docs[0].ref.get()
    expect(updatedSession.data().clientEventCount).toBe(1000)
  })

  it('accepts delayed pre-submission observations within the closed-session bounds', async () => {
    await useUserStudy({ submitted: true })
    await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
    await requestLogEvent.run(verifiedRequest('STUDY_SUBMITTED'))
    const sessions = await admin
      .firestore()
      .collection('tests/study-1/studySessions')
      .get()
    const submittedAt = sessions.docs[0].data().submittedAt.toDate()

    await expect(
      logEvents.run(
        participantRequest({
          ...viewBatch('delayed-batch', 'delayed-event'),
          events: [
            {
              ...viewBatch().events[0],
              eventId: 'delayed-event',
              occurredAt: submittedAt.toISOString(),
            },
          ],
        }),
      ),
    ).resolves.toEqual({ status: 'accepted', batchId: 'delayed-batch' })
  })

  it('rejects observations outside occurrence or receipt cutoff bounds by Event ID', async () => {
    await useUserStudy({ submitted: true })
    await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
    await requestLogEvent.run(verifiedRequest('STUDY_SUBMITTED'))
    const sessions = await admin
      .firestore()
      .collection('tests/study-1/studySessions')
      .get()
    const submittedAt = sessions.docs[0].data().submittedAt.toDate()
    await expect(
      logEvents.run(
        participantRequest({
          ...viewBatch('late-batch', 'late-event'),
          events: [
            {
              ...viewBatch().events[0],
              eventId: 'late-event',
              occurredAt: new Date(
                submittedAt.getTime() + 5 * 60 * 1000 + 1,
              ).toISOString(),
            },
          ],
        }),
      ),
    ).rejects.toMatchObject({
      code: 'invalid-argument',
      details: {
        scope: 'events',
        invalidEvents: [
          { eventId: 'late-event', reasonCode: 'SESSION_CLOSED' },
        ],
      },
    })

    await sessions.docs[0].ref.update({
      submittedAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 - 1),
      ),
    })
    await expect(
      logEvents.run(
        participantRequest(viewBatch('expired-batch', 'expired-event')),
      ),
    ).rejects.toMatchObject({
      details: {
        scope: 'events',
        invalidEvents: [
          { eventId: 'expired-event', reasonCode: 'SESSION_CLOSED' },
        ],
      },
    })
  })
})

describe('unmoderated task and recording metadata', () => {
  const studyRef = () => admin.firestore().doc('tests/study-1')
  const logs = async () =>
    (await studyRef().collection('logs').get()).docs.map((doc) => doc.data())
  const configure = async (task = {}) => {
    await useUserStudy({
      tasks: [{ attempted: true, completed: true, taskTime: 5 }],
    })
    await studyRef().update({
      testStructure: {
        userTasks: [
          {
            taskType: 'sus',
            hasAudioRecord: true,
            hasCamRecord: true,
            hasScreenRecord: true,
            ...task,
          },
        ],
        preTest: [{}],
        postTest: [{}],
      },
    })
  }
  const recording = (details = {}) => ({
    ...viewBatch(),
    events: [
      {
        ...viewBatch().events[0],
        eventType: 'MEDIA_RECORDING_OUTCOME',
        details: {
          taskRef: 'task:0',
          mediaType: 'audio',
          outcome: 'completed',
          stage: 'upload',
          ...details,
        },
      },
    ],
  })
  const taskStartedBatch = (batchId, eventId, details) => ({
    ...viewBatch(batchId, eventId),
    events: [
      {
        ...viewBatch().events[0],
        eventId,
        eventType: 'TASK_STARTED',
        details,
      },
    ],
  })
  const structuredActivity = (eventId, details) => ({
    ...viewBatch(`activity-${eventId}`, eventId),
    events: [
      {
        ...viewBatch().events[0],
        eventId,
        eventType: 'STRUCTURED_RESPONSE_ACTIVITY',
        details,
      },
    ],
  })
  it('accepts an in-range task start with trusted task type and idempotent replay', async () => {
    await configure({ taskType: 'nasa-tlx' })
    await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
    const batch = taskStartedBatch('start-batch', 'start-event', {
      taskRef: 'task:0',
    })

    await expect(
      logEvents.run(participantRequest(batch)),
    ).resolves.toEqual({ status: 'accepted', batchId: 'start-batch' })
    await expect(
      logEvents.run(participantRequest(batch)),
    ).resolves.toEqual({ status: 'duplicate', batchId: 'start-batch' })

    const started = (await logs()).find(
      (event) => event.eventType === 'TASK_STARTED',
    )
    expect(started).toMatchObject({
      eventType: 'TASK_STARTED',
      source: 'study-client',
      timeQuality: 'client-unverified',
      details: { taskRef: 'task:0', taskType: 'nasa-tlx' },
    })
    expect(started.details).toEqual({ taskRef: 'task:0', taskType: 'nasa-tlx' })
    expect((await logs()).filter((event) => event.eventType === 'TASK_STARTED'))
      .toHaveLength(1)
  })

  it('rejects malformed, extra, out-of-range, and non-unmoderated task starts', async () => {
    await configure()
    await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
    const invalidStarts = [
      ['start-out-of-range', 'task:1'],
      ['start-malformed', 'task:01'],
    ]

    for (const [eventId, taskRef] of invalidStarts) {
      await expect(
        logEvents.run(
          participantRequest(
            taskStartedBatch(`batch-${eventId}`, eventId, { taskRef }),
          ),
        ),
      ).rejects.toMatchObject({
        details: {
          invalidEvents: [{ eventId, reasonCode: 'INVALID_EVENT_DETAILS' }],
        },
      })
    }

    const extraDetailsEventId = 'start-extra'
    await expect(
      logEvents.run(
        participantRequest(
          taskStartedBatch(`batch-${extraDetailsEventId}`, extraDetailsEventId, {
            taskRef: 'task:0',
            taskType: 'forged',
          }),
        ),
      ),
    ).rejects.toMatchObject({
      details: {
        invalidEvents: [
          {
            eventId: extraDetailsEventId,
            reasonCode: 'INVALID_EVENT_DETAILS',
          },
        ],
      },
    })

    await studyRef().update({ subType: 'USER_MODERATED' })
    const wrongStudyEventId = 'start-moderated'
    await expect(
      logEvents.run(
        participantRequest(
          taskStartedBatch(`batch-${wrongStudyEventId}`, wrongStudyEventId, {
            taskRef: 'task:0',
          }),
        ),
      ),
    ).rejects.toMatchObject({
      details: {
        invalidEvents: [
          {
            eventId: wrongStudyEventId,
            reasonCode: 'INVALID_EVENT_DETAILS',
          },
        ],
      },
    })
  })

  it('accepts configured structured activity and enriches only task context', async () => {
    await configure({ taskType: 'tam-3' })
    await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
    const details = {
      scopeRef: 'task:0',
      items: [{ itemRef: 'tam-3:perceivedEnjoyment:2', changes: 2 }],
    }
    await expect(
      logEvents.run(
        participantRequest(structuredActivity('activity-valid', details)),
      ),
    ).resolves.toEqual({ status: 'accepted', batchId: 'activity-activity-valid' })
    const event = (await logs()).find(
      (item) => item.eventType === 'STRUCTURED_RESPONSE_ACTIVITY',
    )
    expect(event).toMatchObject({
      message: 'Structured response activity recorded',
      details: { scopeRef: 'task:0', taskType: 'tam-3' },
    })
    expect(event.details).not.toHaveProperty('value')
  })

  it.each([
    [
      'wrong-instrument',
      {
        scopeRef: 'task:0',
        items: [{ itemRef: 'sus:question:0', changes: 1 }],
      },
    ],
    [
      'out-of-range',
      {
        scopeRef: 'task:0',
        items: [{ itemRef: 'tam-3:perceivedEnjoyment:3', changes: 1 }],
      },
    ],
    [
      'zero-count',
      {
        scopeRef: 'task:0',
        items: [{ itemRef: 'tam-3:perceivedEnjoyment:2', changes: 0 }],
      },
    ],
    [
      'fractional-count',
      {
        scopeRef: 'task:0',
        items: [{ itemRef: 'tam-3:perceivedEnjoyment:2', changes: 1.5 }],
      },
    ],
    [
      'duplicate-item',
      {
        scopeRef: 'task:0',
        items: [
          { itemRef: 'tam-3:perceivedEnjoyment:2', changes: 1 },
          { itemRef: 'tam-3:perceivedEnjoyment:2', changes: 1 },
        ],
      },
    ],
    [
      'extra-value',
      {
        scopeRef: 'task:0',
        items: [{ itemRef: 'tam-3:perceivedEnjoyment:2', changes: 1, value: 5 }],
      },
    ],
    [
      'non-canonical-scope',
      {
        scopeRef: 'task:01',
        items: [{ itemRef: 'tam-3:perceivedEnjoyment:2', changes: 1 }],
      },
    ],
  ])(
    'rejects illegal structured activity details: %s',
    async (eventId, details) => {
      await configure({ taskType: 'tam-3' })
      await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
      await expect(
        logEvents.run(
          participantRequest(structuredActivity(eventId, details)),
        ),
      ).rejects.toMatchObject({
        code: 'invalid-argument',
        details: {
          invalidEvents: [
            { eventId, reasonCode: 'INVALID_EVENT_DETAILS' },
          ],
        },
      })
    },
  )

  it('accepts configured PreTest selections but rejects text-question activity', async () => {
    await configure({ taskType: 'sus' })
    await studyRef().update({
      testStructure: {
        userTasks: [{ taskType: 'sus' }],
        preTest: [{ selectionField: true, selectionFields: ['yes'] }],
        postTest: [{ textField: true }],
      },
    })
    await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))

    await expect(
      logEvents.run(
        participantRequest(
          structuredActivity('pre-selection', {
            scopeRef: 'preTest',
            items: [{ itemRef: 'preTest:question:0', changes: 1 }],
          }),
        ),
      ),
    ).resolves.toEqual({ status: 'accepted', batchId: 'activity-pre-selection' })
    await expect(
      logEvents.run(
        participantRequest(
          structuredActivity('post-text', {
            scopeRef: 'postTest',
            items: [{ itemRef: 'postTest:question:0', changes: 1 }],
          }),
        ),
      ),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
    expect(await logs()).toHaveLength(1)
  })
  it.each([
    'no-answer',
    'post-test',
    'text-area',
    'post-form',
    'nasa-tlx',
    'sus',
    'tam-1',
    'tam-2',
    'tam-3',
    'sart',
  ])(
    'derives %s from configured tasks for all applicable events',
    async (taskType) => {
      await configure({ taskType, hasCamRecord: false })
      await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
      await requestLogEvent.run(
        verifiedRequest('TASK_ATTEMPT_FINISHED', 'task:0'),
      )
      await logEvents.run(participantRequest(recording()))
      const edit = answerEdited()
      edit.details.fieldRef = 'task:0:comment'
      await logEvents.run(
        participantRequest({ ...viewBatch('edit-batch'), events: [edit] }),
      )
      const events = (await logs()).filter(
        (event) => event.eventType !== 'CONSENT_ACCEPTED',
      )
      expect(events).toHaveLength(3)
      for (const event of events) expect(event.details.taskType).toBe(taskType)
      expect(
        events.find((event) => event.eventType === 'TASK_ATTEMPT_FINISHED')
          .details.recordingTypes,
      ).toEqual(['audio', 'screen'])
    },
  )
  it.each([null, 'private unrecognized task title'])(
    'omits missing or unrecognized types without dropping the event (%s)',
    async (taskType) => {
      await configure({ taskType })
      await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
      await requestLogEvent.run(
        verifiedRequest('TASK_ATTEMPT_FINISHED', 'task:0'),
      )
      await logEvents.run(participantRequest(recording()))
      for (const event of await logs())
        expect(event.details).not.toHaveProperty('taskType')
    },
  )
  it('keeps legacy tasks without a type and does not relabel stored events after configuration changes', async () => {
    await configure()
    await studyRef().update({
      testStructure: { userTasks: [{ hasAudioRecord: true }] },
    })
    const batch = recording()
    await logEvents.run(participantRequest(batch))
    expect((await logs())[0].details).not.toHaveProperty('taskType')
    await studyRef().update({
      testStructure: {
        userTasks: [{ hasAudioRecord: true, taskType: 'tam-3' }],
      },
    })
    await logEvents.run(participantRequest(batch))
    expect(await logs()).toHaveLength(1)
    expect((await logs())[0].details).not.toHaveProperty('taskType')
  })

  it('does not invent task context for pre/post fields or whole-study events', async () => {
    await configure()
    const edits = ['preTest:0:answer', 'postTest:0:answer'].map(
      (fieldRef, index) => {
        const event = answerEdited(`edit-${index}`)
        event.details.fieldRef = fieldRef
        return event
      },
    )
    await logEvents.run(
      participantRequest({
        ...viewBatch(),
        events: [...viewBatch().events, ...edits],
      }),
    )
    await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
    for (const event of await logs())
      expect(event.details).not.toHaveProperty('taskType')
  })
  it('keeps task completion occurrence before later post-test activity when verification is later', async () => {
    await configure()
    await requestLogEvent.run(verifiedRequest('CONSENT_ACCEPTED'))
    const finishObservedAt = new Date(Date.now() - 60_000).toISOString()
    const postTestObservedAt = new Date(
      Date.parse(finishObservedAt) + 30_000,
    ).toISOString()
    const postTestEdit = answerEdited('post-test-edit', {
      occurredAt: postTestObservedAt,
      details: {
        ...answerEdited().details,
        fieldRef: 'postTest:0:answer',
      },
    })
    await logEvents.run(
      participantRequest({
        ...viewBatch('post-test-batch', 'post-test-edit'),
        events: [postTestEdit],
      }),
    )
    await requestLogEvent.run(
      verifiedRequest('TASK_ATTEMPT_FINISHED', 'task:0', {
        occurredAt: finishObservedAt,
      }),
    )

    const stored = await logs()
    const taskFinished = stored.find(
      (event) => event.eventType === 'TASK_ATTEMPT_FINISHED',
    )
    const postTest = stored.find((event) => event.eventId === 'post-test-edit')
    expect(taskFinished.occurredAt.toMillis()).toBe(
      Date.parse(finishObservedAt),
    )
    expect(taskFinished.occurredAt.toMillis()).toBeLessThan(
      postTest.occurredAt.toMillis(),
    )
    expect(taskFinished.receivedAt.toMillis()).toBeGreaterThanOrEqual(
      postTest.receivedAt.toMillis(),
    )
  })

  it.each(['audio', 'webcam', 'screen'])(
    'accepts controlled %s outcomes and derives severity/source/message',
    async (mediaType) => {
      await configure()
      const outcomes = [
        { outcome: 'completed', stage: 'upload', level: 'info' },
        {
          outcome: 'permission_denied',
          stage: 'permission',
          reason: 'permissionDenied',
          level: 'warning',
        },
        ...(mediaType === 'screen'
          ? [
              {
                outcome: 'cancelled',
                stage: 'permission',
                reason: 'cancelled',
                level: 'warning',
              },
            ]
          : []),
        {
          outcome: 'failed',
          stage: 'permission',
          reason: 'deviceUnavailable',
          level: 'error',
        },
        {
          outcome: 'failed',
          stage: 'capture',
          reason: 'captureError',
          level: 'error',
        },
        {
          outcome: 'failed',
          stage: 'capture',
          reason: 'emptyRecording',
          level: 'error',
        },
        {
          outcome: 'failed',
          stage: 'upload',
          reason: 'uploadError',
          level: 'error',
        },
        ...(mediaType === 'screen'
          ? ['unsupported', 'wrongSurface', 'error'].map((reason) => ({
              outcome: 'failed',
              stage: 'permission',
              reason,
              level: 'error',
            }))
          : []),
      ]
      const events = outcomes.map(({ level, ...details }, index) => ({
        ...recording({ ...details, mediaType }).events[0],
        eventId: `recording-${index}`,
      }))
      const batch = { ...viewBatch(), events }
      await logEvents.run(participantRequest(batch))
      await logEvents.run(participantRequest(batch))
      const stored = await logs()
      expect(stored).toHaveLength(outcomes.length)
      for (let index = 0; index < outcomes.length; index++) {
        expect(
          stored.find((event) => event.eventId === `recording-${index}`),
        ).toMatchObject({
          layer: 'technical',
          level: outcomes[index].level,
          source: 'study-client',
          details: { mediaType, taskType: 'sus' },
        })
      }
      const sessions = await studyRef().collection('studySessions').get()
      expect(sessions.docs[0].data().clientEventCount).toBe(outcomes.length)
    },
  )
  it.each(['audio', 'webcam'])(
    'rejects participant cancellation for %s acquisition',
    async (mediaType) => {
      await configure()
      await expect(
        logEvents.run(
          participantRequest(
            recording({
              mediaType,
              outcome: 'cancelled',
              stage: 'permission',
              reason: 'cancelled',
            }),
          ),
        ),
      ).rejects.toMatchObject({ code: 'invalid-argument' })
      expect(await logs()).toHaveLength(0)
    },
  )

  it.each([
    { taskType: 'sus' },
    { url: 'private-url' },
    { transcript: 'private text' },
    { error: 'private exception' },
    { taskRef: 'task:99' },
    { taskRef: 'task:-1' },
    { taskRef: ['task:0'] },
    { mediaType: ['audio'] },
    { mediaType: 'video' },
    { outcome: ['completed'] },
    { stage: ['upload'] },
    { outcome: 'completed', stage: 'capture' },
    {
      outcome: 'permission_denied',
      stage: 'upload',
      reason: 'permissionDenied',
    },
    { reason: 'uploadError' },
    { outcome: 'failed', stage: 'capture', reason: 'uploadError' },
    { outcome: 'failed', stage: 'permission', reason: 'wrongSurface' },
  ])('rejects malformed/forged metadata atomically: %j', async (details) => {
    await configure()
    const batch = recording(details)
    batch.events.push({ ...viewBatch().events[0], eventId: 'otherwise-valid' })
    await expect(
      logEvents.run(participantRequest(batch)),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
    expect(await logs()).toHaveLength(0)
    expect((await studyRef().collection('studySessions').get()).empty).toBe(
      true,
    )
  })
  it.each([
    ['audio', 'hasAudioRecord'],
    ['webcam', 'hasCamRecord'],
    ['screen', 'hasScreenRecord'],
  ])('rejects disabled %s recording', async (mediaType, flag) => {
    await configure({ [flag]: false })
    await expect(
      logEvents.run(participantRequest(recording({ mediaType }))),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
    expect(await logs()).toHaveLength(0)
  })
  it('rejects forged task type on an answer edit', async () => {
    await configure()
    const edit = answerEdited()
    edit.details = {
      ...edit.details,
      fieldRef: 'task:0:comment',
      taskType: 'sus',
    }
    await expect(
      logEvents.run(participantRequest({ ...viewBatch(), events: [edit] })),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })
  it('creates no recording event or session before consent or without authentication', async () => {
    await configure()
    await admin
      .firestore()
      .doc('answers/answer-1')
      .update({ 'taskAnswers.participant.consentCompleted': false })
    await expect(
      logEvents.run(participantRequest(recording())),
    ).rejects.toMatchObject({ code: 'failed-precondition' })
    await expect(
      logEvents.run(participantRequest(recording(), null)),
    ).rejects.toMatchObject({ code: 'unauthenticated' })
    expect(await logs()).toHaveLength(0)
    expect((await studyRef().collection('studySessions').get()).empty).toBe(
      true,
    )
  })
  it('does not connect recording observations to moderated studies', async () => {
    await configure()
    await studyRef().update({ subType: 'USER_MODERATED' })
    await expect(
      logEvents.run(participantRequest(recording())),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })
})
