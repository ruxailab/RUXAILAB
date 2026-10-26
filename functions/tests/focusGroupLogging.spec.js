import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import { admin } from '../src/core/firebase/f.firebase.js'
import { logEvents, requestLogEvent } from '../src/https/logEvents.js'

// Needs the Firestore (8081) and Realtime Database (9000) emulators:
// FIRESTORE_EMULATOR_HOST=127.0.0.1:8081 FIREBASE_DATABASE_EMULATOR_HOST=127.0.0.1:9000
const projectId = 'demo-ruxailab-focus-group-logging'
const savedLogActorHashSalt = process.env.LOG_ACTOR_HASH_SALT
const FREE_TEXT = ['Pricing page topic', 'Ada Lovelace', 'ada@example.com']
let ownedAdminApp
jest.setTimeout(30000)

const studyRef = () => admin.firestore().doc('tests/fg-study')
const scheduledRef = (sessionId = 'scheduled-1') =>
  studyRef().collection('sessions').doc(sessionId)
const liveRoomRef = (sessionId = 'scheduled-1') =>
  admin.database().ref(`focusGroupSessions/fg-study-${sessionId}`)
const logs = async () =>
  (await studyRef().collection('logs').get()).docs.map((item) => item.data())
const studySessions = async () =>
  (await studyRef().collection('studySessions').get()).docs.map((item) =>
    item.data(),
  )

const sessionRequest = (eventType, uid = 'owner', overrides = {}) => ({
  auth: uid ? { uid, token: {} } : null,
  data: {
    studyId: 'fg-study',
    eventType,
    sessionRef: 'scheduled-1',
    ...overrides,
  },
})

const startLiveRoom = (facilitatorId = 'owner', sessionId = 'scheduled-1') =>
  liveRoomRef(sessionId).set({
    status: 'live',
    facilitatorId,
    sessionId: 'session-1792318331000',
    currentTopicIndex: 0,
    participants: { attendee: { name: FREE_TEXT[1] } },
  })

beforeAll(() => {
  if (!admin.apps.length) {
    ownedAdminApp = admin.initializeApp({
      projectId,
      databaseURL: `http://127.0.0.1:9000?ns=${projectId}`,
    })
  }
})

afterAll(async () => {
  if (ownedAdminApp) await ownedAdminApp.delete()
  if (savedLogActorHashSalt === undefined) {
    delete process.env.LOG_ACTOR_HASH_SALT
  } else {
    process.env.LOG_ACTOR_HASH_SALT = savedLogActorHashSalt
  }
})

beforeEach(async () => {
  process.env.LOG_ACTOR_HASH_SALT = 'logging-test-secret'
  const db = admin.firestore()
  for (const name of [
    'logs',
    'studySessions',
    'loggingMeta',
    'logBatches',
    'sessions',
  ]) {
    const snapshot = await studyRef().collection(name).get()
    await Promise.all(snapshot.docs.map((item) => item.ref.delete()))
  }
  await admin.database().ref('focusGroupSessions').remove()
  await db.doc('tests/fg-study').set({
    testType: 'FOCUS_GROUP',
    answersDocId: 'fg-answers',
    isPublic: true,
    testAdmin: { userDocId: 'owner' },
    studyRoleMap: { cofacilitator: 1, attendee: 1, observer: 3, manager: 4 },
    testStructure: { topics: [{ title: FREE_TEXT[0] }] },
  })
  await scheduledRef().set({
    staff: [
      { userDocId: 'cofacilitator', role: 'FACILITATOR' },
      { userDocId: 'observer', role: 'OBSERVER' },
    ],
    staffIds: ['cofacilitator', 'observer'],
    participants: [{ userDocId: 'attendee', email: FREE_TEXT[2] }],
    participantIds: ['attendee'],
  })
})

describe('focus group session logging', () => {
  it('records a verified start and end as one facilitator session', async () => {
    await startLiveRoom()
    await expect(
      requestLogEvent.run(sessionRequest('SESSION_STARTED')),
    ).resolves.toEqual({ status: 'accepted' })
    await expect(
      requestLogEvent.run(sessionRequest('SESSION_STARTED')),
    ).resolves.toEqual({ status: 'duplicate' })

    await expect(
      requestLogEvent.run(sessionRequest('SESSION_ENDED')),
    ).rejects.toMatchObject({
      code: 'failed-precondition',
      details: { reasonCode: 'UNVERIFIED_TRANSITION' },
    })
    await scheduledRef().update({ lifecycleStatus: 'ended' })
    await expect(
      requestLogEvent.run(sessionRequest('SESSION_ENDED')),
    ).resolves.toEqual({ status: 'accepted' })

    const events = (await logs()).sort((left, right) =>
      left.eventType.localeCompare(right.eventType),
    )
    expect(events).toEqual([
      expect.objectContaining({
        eventType: 'SESSION_ENDED',
        participantLabel: 'F-001',
        actorRole: 'admin',
        source: 'logging-service',
        message: 'Focus group session ended',
        details: {},
      }),
      expect.objectContaining({
        eventType: 'SESSION_STARTED',
        participantLabel: 'F-001',
        actorRole: 'admin',
        message: 'Focus group session started',
        details: {},
      }),
    ])
    expect(events[0].sessionId).toBe(events[1].sessionId)
    const [session] = await studySessions()
    expect(session.participantLabel).toBe('F-001')
    expect(session.startedAt).toBeDefined()
    expect(session.endedAt).toBeDefined()
  })

  it('labels each scheduled session separately, whoever runs it', async () => {
    await scheduledRef('scheduled-2').set({
      staff: [{ userDocId: 'cofacilitator', role: 'FACILITATOR' }],
    })
    await startLiveRoom('owner')
    await startLiveRoom('cofacilitator', 'scheduled-2')

    await requestLogEvent.run(sessionRequest('SESSION_STARTED'))
    await requestLogEvent.run(
      sessionRequest('SESSION_STARTED', 'cofacilitator', {
        sessionRef: 'scheduled-2',
      }),
    )

    expect(
      (await logs())
        .map((event) => `${event.participantLabel}:${event.actorRole}`)
        .sort(),
    ).toEqual(['F-001:admin', 'F-002:facilitator'])
  })

  it('lets only admins and the session facilitator log', async () => {
    await scheduledRef().update({ lifecycleStatus: 'ended' })
    for (const uid of ['attendee', 'observer', 'manager', 'stranger']) {
      await expect(
        requestLogEvent.run(sessionRequest('SESSION_ENDED', uid)),
      ).rejects.toMatchObject({
        code: 'permission-denied',
        details: { reasonCode: 'NOT_ELIGIBLE' },
      })
    }
    await expect(
      requestLogEvent.run(sessionRequest('SESSION_ENDED', null)),
    ).rejects.toMatchObject({ code: 'unauthenticated' })
    expect(await logs()).toHaveLength(0)
    expect(await studySessions()).toHaveLength(0)

    await expect(
      requestLogEvent.run(sessionRequest('SESSION_ENDED', 'cofacilitator')),
    ).resolves.toEqual({ status: 'accepted' })
  })

  it('rejects a start the live room does not show for this facilitator', async () => {
    await expect(
      requestLogEvent.run(sessionRequest('SESSION_STARTED')),
    ).rejects.toMatchObject({
      details: { reasonCode: 'UNVERIFIED_TRANSITION' },
    })

    await startLiveRoom('cofacilitator')
    await expect(
      requestLogEvent.run(sessionRequest('SESSION_STARTED')),
    ).rejects.toMatchObject({
      details: { reasonCode: 'UNVERIFIED_TRANSITION' },
    })

    await liveRoomRef().update({ status: 'idle', facilitatorId: 'owner' })
    await expect(
      requestLogEvent.run(sessionRequest('SESSION_STARTED')),
    ).rejects.toMatchObject({
      details: { reasonCode: 'UNVERIFIED_TRANSITION' },
    })
    expect(await logs()).toHaveLength(0)
    expect(await studySessions()).toHaveLength(0)
  })

  it('needs a scheduled session and a focus group study', async () => {
    await startLiveRoom()
    await expect(
      requestLogEvent.run(
        sessionRequest('SESSION_STARTED', 'owner', { sessionRef: 'missing' }),
      ),
    ).rejects.toMatchObject({ details: { reasonCode: 'NOT_ELIGIBLE' } })

    await studyRef().update({ testType: 'USER' })
    await expect(
      requestLogEvent.run(sessionRequest('SESSION_STARTED')),
    ).rejects.toMatchObject({ details: { reasonCode: 'NOT_ELIGIBLE' } })
    expect(await logs()).toHaveLength(0)
  })

  it('keeps participant activity and other verified events out of focus groups', async () => {
    for (const uid of ['owner', 'attendee']) {
      await expect(
        logEvents.run({
          auth: { uid },
          data: {
            studyId: 'fg-study',
            batchId: 'batch-1',
            events: [
              {
                eventId: 'event-1',
                eventType: 'STUDY_VIEW_OPENED',
                occurredAt: '2026-10-18T10:00:00.000Z',
                details: {},
              },
            ],
          },
        }),
      ).rejects.toMatchObject({ details: { reasonCode: 'NOT_ELIGIBLE' } })
      await expect(
        requestLogEvent.run({
          auth: { uid },
          data: { studyId: 'fg-study', eventType: 'STUDY_SUBMITTED' },
        }),
      ).rejects.toMatchObject({ details: { reasonCode: 'NOT_ELIGIBLE' } })
    }
    expect(await studySessions()).toHaveLength(0)
  })

  it('rejects extra request fields and stores no session or topic text', async () => {
    await startLiveRoom()
    await expect(
      requestLogEvent.run(
        sessionRequest('SESSION_STARTED', 'owner', { topic: FREE_TEXT[0] }),
      ),
    ).rejects.toMatchObject({
      code: 'invalid-argument',
      details: { reasonCode: 'MALFORMED_REQUEST' },
    })

    await requestLogEvent.run(sessionRequest('SESSION_STARTED'))
    await scheduledRef().update({ lifecycleStatus: 'ended' })
    await requestLogEvent.run(sessionRequest('SESSION_ENDED'))

    const stored = JSON.stringify([...(await logs()), ...(await studySessions())])
    for (const text of [...FREE_TEXT, '"owner"', 'scheduled-1']) {
      expect(stored).not.toContain(text)
    }
  })
})
