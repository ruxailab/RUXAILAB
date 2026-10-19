import fs from 'fs'
import fetch from 'node-fetch'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { getStudyLogOverview } from '../../src/shared/services/studyLogOverview'

const projectId = 'demo-ruxailab-log-overview'
let testEnv

const event = (id, overrides = {}) => ({
  eventId: id,
  sessionId: 'private-session-id',
  participantLabel: 'P-001',
  eventType: 'STUDY_VIEW_OPENED',
  layer: 'methodological',
  level: 'info',
  source: 'study-client',
  message: 'Study view opened',
  occurredAt: Timestamp.fromDate(new Date('2026-08-14T12:00:00.000Z')),
  receivedAt: Timestamp.fromDate(new Date('2026-08-14T12:00:01.000Z')),
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
      port: Number(
        process.env.FIRESTORE_EMULATOR_HOST?.split(':').pop() || 8081,
      ),
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
      studyRoleMap: { 'mapped-admin': 0, manager: 4, evaluator: 1 },
    })
    await Promise.all([
      setDoc(doc(db, 'tests/study-1/studySessions/session-1'), {
        participantLabel: 'P-001',
        submittedAt: Timestamp.fromDate(new Date('2026-08-14T12:05:00.000Z')),
      }),
      setDoc(doc(db, 'tests/study-1/studySessions/session-2'), {
        participantLabel: 'P-002',
      }),
      setDoc(doc(db, 'tests/study-1/logs/a'), event('a')),
      setDoc(
        doc(db, 'tests/study-1/logs/b'),
        event('b', {
          eventType: 'STUDY_SUBMITTED',
          source: 'logging-service',
          occurredAt: Timestamp.fromDate(new Date('2026-08-14T12:05:00.000Z')),
        }),
      ),
      setDoc(
        doc(db, 'tests/study-1/logs/c'),
        event('c', {
          participantLabel: 'P-002',
          eventType: 'QUESTION_RESPONSE_UPDATED',
          level: 'warning',
          occurredAt: Timestamp.fromDate(new Date('2026-08-14T12:10:00.000Z')),
        }),
      ),
    ])
  })
})

describe('Log overview query boundary', () => {
  it.each(['owner', 'mapped-admin'])(
    'gives %s the counts and latest events',
    async (uid) => {
      const overview = await getStudyLogOverview({
        db: testEnv.authenticatedContext(uid).firestore(),
        studyId: 'study-1',
      })

      expect(overview).toMatchObject({
        sessions: 2,
        submittedSessions: 1,
        events: 3,
        warnings: 1,
        errors: 0,
      })
      expect(overview.latestEvents.map(({ rowKey }) => rowKey)).toEqual([
        'c',
        'b',
        'a',
      ])
      expect(overview.latestEvents[0]).not.toHaveProperty('sessionId')
    },
  )

  it.each(['manager', 'evaluator', 'stranger'])(
    'denies %s, who cannot view logs',
    async (uid) => {
      await expect(
        getStudyLogOverview({
          db: testEnv.authenticatedContext(uid).firestore(),
          studyId: 'study-1',
        }),
      ).rejects.toMatchObject({ code: 'permission-denied' })
    },
  )
})
