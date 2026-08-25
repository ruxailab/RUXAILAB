import fs from 'fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { get, ref, set } from 'firebase/database'

const projectId = 'demo-ruxailab-rbac'
const studyId = 'study-1'
let testEnv

const context = (uid) => (uid ? testEnv.authenticatedContext(uid) : testEnv.unauthenticatedContext())

const seedPresence = async (entries) => {
  await testEnv.withSecurityRulesDisabled(async (adminContext) => {
    const db = adminContext.database()
    await Promise.all(
      Object.entries(entries).map(([uid, accessLevel]) =>
        set(ref(db, `focusGroupSessions/${studyId}/participants/${uid}`), {
          name: uid,
          role: '',
          accessLevel,
          connected: true,
          joinedAt: 0,
        }),
      ),
    )
  })
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    database: { rules: fs.readFileSync('database.rules.json', 'utf8') },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearDatabase()
  // Facilitator (0), participant (1), observer (3) — mirrors the ACCESS_LEVEL
  // scale the session view resolves from Firestore before ever writing to RTDB.
  await seedPresence({ facilitator: 0, participant: 1, observer: 3 })
})

describe('Focus Group session RTDB rules', () => {
  it('denies a signed-out client anywhere in the session tree', async () => {
    await assertFails(
      get(ref(context(null).database(), `focusGroupSessions/${studyId}/status`)),
    )
    await assertFails(
      set(ref(context(null).database(), `focusGroupSessions/${studyId}/status`), 'live'),
    )
  })

  it('lets the facilitator and observer read and post backroom messages, but denies the participant', async () => {
    const backroom = (uid) =>
      ref(context(uid).database(), `focusGroupSessions/${studyId}/messages/backroom/msg-1`)

    await assertSucceeds(
      set(backroom('facilitator'), { userId: 'facilitator', text: 'hi', timestamp: 0 }),
    )
    await assertSucceeds(get(backroom('facilitator')))
    await assertSucceeds(get(backroom('observer')))
    await assertSucceeds(
      set(backroom('observer'), { userId: 'observer', text: 'hi back', timestamp: 0 }),
    )

    await assertFails(get(backroom('participant')))
    await assertFails(
      set(backroom('participant'), { userId: 'participant', text: 'sneaking in', timestamp: 0 }),
    )
  })

  it('lets any session member read and post to a regular (non-backroom) topic', async () => {
    const topic = (uid) =>
      ref(context(uid).database(), `focusGroupSessions/${studyId}/messages/topic-1/msg-1`)

    await assertSucceeds(
      set(topic('participant'), { userId: 'participant', text: 'hi', timestamp: 0 }),
    )
    await assertSucceeds(get(topic('observer')))
  })

  it('lets a user write only their own presence node', async () => {
    const own = ref(
      context('participant').database(),
      `focusGroupSessions/${studyId}/participants/participant`,
    )
    await assertSucceeds(set(own, { name: 'me', connected: true }))

    const someoneElse = ref(
      context('participant').database(),
      `focusGroupSessions/${studyId}/participants/observer`,
    )
    await assertFails(set(someoneElse, { name: 'impersonated', accessLevel: 0 }))
  })

  it("keeps an observer's notes private to themselves", async () => {
    const ownNotes = ref(
      context('observer').database(),
      `focusGroupSessions/${studyId}/notes/observer`,
    )
    await assertSucceeds(set(ownNotes, ['note one']))

    const someoneElsesNotes = ref(
      context('facilitator').database(),
      `focusGroupSessions/${studyId}/notes/observer`,
    )
    await assertFails(get(someoneElsesNotes))
  })

  it('lets a participant write their own recording, and only the facilitator or the owner can read it back', async () => {
    const ownRecording = ref(
      context('participant').database(),
      `focusGroupSessions/${studyId}/recordings/participant/topic-1`,
    )
    await assertSucceeds(set(ownRecording, { url: 'x', kind: 'video', recordedAt: 0 }))
    await assertSucceeds(get(ownRecording))

    const facilitatorRead = ref(
      context('facilitator').database(),
      `focusGroupSessions/${studyId}/recordings/participant/topic-1`,
    )
    await assertSucceeds(get(facilitatorRead))

    const observerRead = ref(
      context('observer').database(),
      `focusGroupSessions/${studyId}/recordings/participant/topic-1`,
    )
    await assertFails(get(observerRead))
  })
})
