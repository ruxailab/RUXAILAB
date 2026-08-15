import {
  afterAll,
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
import { admin } from '../src/f.firebase.js'
import { logEvents, requestLogEvent } from '../src/https/logEvents.js'

const projectId = 'demo-ruxailab-logging'
let testEnv
jest.setTimeout(30000)

const participantRequest = (data, uid = 'participant') => ({
  auth: uid ? { uid } : null,
  data,
})

const verifiedRequest = (eventType, taskRef) =>
  participantRequest({
    studyId: 'study-1',
    eventType,
    ...(taskRef ? { taskRef } : {}),
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

beforeAll(async () => {
  if (!admin.apps.length) admin.initializeApp({ projectId })
  testEnv = await initializeTestEnvironment({ projectId })
})

afterAll(async () => {
  await testEnv.cleanup()
  await admin.app().delete()
})

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
  it('initializes a Study Session and exposes its first view observation to an authorized researcher', async () => {
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

    const researcherDb = testEnv.authenticatedContext('researcher').firestore()
    const page = await assertSucceeds(
      getDocs(
        query(
          collection(researcherDb, 'tests/study-1/logs'),
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
      sessions.docs.map((item) => item.data().participantLabel).sort(),
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

  it('allows only logs.view reads and forbids every direct logging write', async () => {
    await admin.firestore().doc('tests/study-1').update({ isPublic: true })
    await logEvents.run(participantRequest(viewBatch(), 'public-participant'))
    const participantDb = testEnv
      .authenticatedContext('public-participant')
      .firestore()
    const researcherDb = testEnv.authenticatedContext('researcher').firestore()

    await assertFails(getDocs(collection(participantDb, 'tests/study-1/logs')))
    await assertSucceeds(
      getDocs(collection(researcherDb, 'tests/study-1/studySessions')),
    )
    await assertFails(
      getDoc(doc(researcherDb, 'tests/study-1/logBatches/hidden')),
    )
    await assertFails(
      getDoc(doc(researcherDb, 'tests/study-1/loggingMeta/state')),
    )
    await assertFails(
      setDoc(doc(researcherDb, 'tests/study-1/logs/forged'), {
        eventType: 'STUDY_VIEW_OPENED',
      }),
    )
    await assertFails(
      setDoc(doc(researcherDb, 'tests/study-1/studySessions/forged'), {
        participantLabel: 'P-999',
      }),
    )
  })
})

describe('client-observed batch delivery', () => {
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

    expect(results.map((result) => result.status).sort()).toEqual([
      'accepted',
      'duplicate',
    ])
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
  })

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
