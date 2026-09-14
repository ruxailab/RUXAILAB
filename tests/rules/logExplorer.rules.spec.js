import fs from 'fs'
import fetch from 'node-fetch'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import {
  getParticipantLabels,
  getStudyLogCount,
  getStudyLogPage,
  localDateRange,
} from '../../src/shared/services/studyLogQuery'

const projectId = 'demo-ruxailab-log-explorer'
let testEnv

const event = (overrides = {}) => ({
  eventId: 'event-1',
  batchId: 'batch-1',
  sessionId: 'private-session-id',
  participantLabel: 'P-001',
  actorRole: 'evaluator',
  eventType: 'STUDY_VIEW_OPENED',
  layer: 'methodological',
  level: 'info',
  source: 'study-client',
  message: 'Study view opened',
  occurredAt: Timestamp.fromDate(new Date('2026-08-14T12:00:00.000Z')),
  receivedAt: Timestamp.fromDate(new Date('2026-08-14T12:00:01.000Z')),
  timeQuality: 'client-unverified',
  details: {},
  ...overrides,
})

beforeAll(async () => {
  global.fetch = fetch
  delete process.env.FIREBASE_EMULATOR_HUB
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: '127.0.0.1',
      port: 8081,
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  })
})

afterAll(async () => testEnv.cleanup())

beforeEach(async () => {
  await testEnv.clearFirestore()
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, 'tests/study-1'), {
      testType: 'HEURISTIC',
      testAdmin: { userDocId: 'owner' },
      studyRoleMap: { researcher: 2 },
    })
    await Promise.all([
      setDoc(doc(db, 'tests/study-1/studySessions/session-1'), {
        participantLabel: 'P-001',
        clientEventCount: 2,
      }),
      setDoc(doc(db, 'tests/study-1/studySessions/session-2'), {
        participantLabel: 'P-002',
        clientEventCount: 1,
      }),
      setDoc(doc(db, 'tests/study-1/logs/log-a'), event()),
      setDoc(
        doc(db, 'tests/study-1/logs/log-b'),
        event({ eventId: 'event-2', message: 'Second tied event' }),
      ),
      setDoc(
        doc(db, 'tests/study-1/logs/log-c'),
        event({
          eventId: 'event-3',
          participantLabel: 'P-002',
          eventType: 'TASK_ATTEMPT_FINISHED',
          level: 'warning',
          source: 'logging-service',
          message: 'Task attempt finished',
          occurredAt: Timestamp.fromDate(new Date('2026-08-13T12:00:00.000Z')),
          details: { taskRef: 'task:0', outcome: 'not_completed' },
        }),
      ),
    ])
  })
})

describe('Log Explorer query boundary', () => {
  it('orders complete history stably and advances with a document cursor', async () => {
    const db = testEnv.authenticatedContext('owner').firestore()

    const first = await getStudyLogPage({ db, studyId: 'study-1', pageSize: 2 })
    expect(first.events.map(({ message }) => message)).toEqual([
      'Second tied event',
      'Study view opened',
    ])
    expect(first.events[0]).not.toHaveProperty('sessionId')
    expect(first.events[0]).not.toHaveProperty('eventId')
    expect(first.events[0]).not.toHaveProperty('batchId')
    expect(first.events[0]).toHaveProperty('rowKey', 'log-b')

    const second = await getStudyLogPage({
      db,
      studyId: 'study-1',
      pageSize: 2,
      after: first.lastCursor,
    })
    expect(
      second.events.map(({ participantLabel }) => participantLabel),
    ).toEqual(['P-002'])
    expect(second.hasNextPage).toBe(false)
  })

  it('applies approved filters and local calendar bounds before pagination', async () => {
    const db = testEnv.authenticatedContext('owner').firestore()
    const range = localDateRange('2026-08-13', '2026-08-13')
    const page = await getStudyLogPage({
      db,
      studyId: 'study-1',
      filters: {
        participantLabel: 'P-002',
        eventType: 'TASK_ATTEMPT_FINISHED',
        level: 'warning',
        source: 'logging-service',
        ...range,
      },
    })

    expect(page.events).toHaveLength(1)
    expect(page.events[0]).toMatchObject({
      participantLabel: 'P-002',
      eventType: 'TASK_ATTEMPT_FINISHED',
      level: 'warning',
      source: 'logging-service',
    })
  })

  it('does not expose the same query to non-Admin study roles', async () => {
    const participantDb = testEnv.authenticatedContext('participant').firestore()
    const researcherDb = testEnv.authenticatedContext('researcher').firestore()

    await expect(
      getStudyLogPage({ db: participantDb, studyId: 'study-1' }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(
      getStudyLogPage({ db: researcherDb, studyId: 'study-1' }),
    ).rejects.toMatchObject({ code: 'permission-denied' })
  })

  it('counts applied filters and bounds participant-label suggestions', async () => {
    const db = testEnv.authenticatedContext('owner').firestore()

    await expect(
      getStudyLogCount({
        db,
        studyId: 'study-1',
        filters: { participantLabel: 'P-001' },
      }),
    ).resolves.toBe(2)
    await expect(
      getParticipantLabels({ db, studyId: 'study-1', prefix: 'p-00' }),
    ).resolves.toEqual(['P-001', 'P-002'])
  })
})
