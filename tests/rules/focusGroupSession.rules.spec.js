import fs from 'fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { get, ref, set, update } from 'firebase/database'

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

// The whole session is read through ONE listener at focusGroupSessions/$studyId
// (useFocusGroupSession.js), so `.read` can only be granted at that node, not
// selectively revoked deeper in the tree — RTDB read grants cascade down and
// cannot be overridden by a stricter rule on a descendant. That means reads
// under this parent are sign-in-gated only; the notes/recordings subtrees'
// privacy is enforced on the WRITE side (who can post/own data) the same way.
// The backroom is the one exception: it lives at its own top-level path
// (focusGroupBackroom/$studyId, subscribed separately — see
// useFocusGroupSession.js) specifically so its READ can be genuinely denied
// to a participant, not just hidden by the UI.
describe('Focus Group session RTDB rules', () => {
  it('denies a signed-out client anywhere in the session tree', async () => {
    await assertFails(
      get(ref(context(null).database(), `focusGroupSessions/${studyId}/status`)),
    )
    await assertFails(
      set(ref(context(null).database(), `focusGroupSessions/${studyId}/status`), 'live'),
    )
  })

  it('lets a signed-in session member read the whole session tree', async () => {
    await assertSucceeds(
      get(ref(context('participant').database(), `focusGroupSessions/${studyId}`)),
    )
  })

  it('lets the facilitator start a session via a single multi-field update', async () => {
    await assertSucceeds(
      update(ref(context('facilitator').database(), `focusGroupSessions/${studyId}`), {
        status: 'live',
        currentTopicIndex: 0,
        facilitatorId: 'facilitator',
        sessionId: 'session-1',
        startedAt: 0,
        endedAt: null,
        lastUpdate: 0,
      }),
    )
  })

  it('lets the facilitator and observer read and write the backroom, and denies the participant both ways', async () => {
    const backroom = (uid) =>
      ref(context(uid).database(), `focusGroupBackroom/${studyId}/msg-1`)

    await assertSucceeds(
      set(backroom('facilitator'), { userId: 'facilitator', text: 'hi', timestamp: 0 }),
    )
    await assertSucceeds(get(backroom('facilitator')))
    await assertSucceeds(get(backroom('observer')))
    await assertSucceeds(
      set(backroom('observer'), { userId: 'observer', text: 'hi back', timestamp: 0 }),
    )

    await assertFails(
      set(backroom('participant'), { userId: 'participant', text: 'sneaking in', timestamp: 0 }),
    )
    // The bug this path structure fixes: a participant reading it directly
    // (bypassing the UI, which merely hides the tab) must be denied too.
    await assertFails(get(backroom('participant')))
  })

  it('lets any session member post to a regular (non-backroom) topic', async () => {
    const topic = (uid) =>
      ref(context(uid).database(), `focusGroupSessions/${studyId}/messages/topic-1/msg-1`)

    await assertSucceeds(
      set(topic('participant'), { userId: 'participant', text: 'hi', timestamp: 0 }),
    )
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

  it("lets an observer write only their own notes", async () => {
    const ownNotes = ref(
      context('observer').database(),
      `focusGroupSessions/${studyId}/notes/observer`,
    )
    await assertSucceeds(set(ownNotes, ['note one']))

    const someoneElsesNotes = ref(
      context('facilitator').database(),
      `focusGroupSessions/${studyId}/notes/observer`,
    )
    await assertFails(set(someoneElsesNotes, ['forged']))
  })

  it('lets a participant write only their own recording', async () => {
    const ownRecording = ref(
      context('participant').database(),
      `focusGroupSessions/${studyId}/recordings/participant/topic-1`,
    )
    await assertSucceeds(set(ownRecording, { url: 'x', kind: 'video', recordedAt: 0 }))

    const forgedRecording = ref(
      context('observer').database(),
      `focusGroupSessions/${studyId}/recordings/participant/topic-2`,
    )
    await assertFails(set(forgedRecording, { url: 'x', kind: 'video', recordedAt: 0 }))
  })
})
