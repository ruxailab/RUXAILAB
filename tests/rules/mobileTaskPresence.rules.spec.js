import fs from 'fs'
import fetch from 'node-fetch'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { get, ref, set, remove } from 'firebase/database'

const projectId = 'demo-ruxailab-mobile-task-presence'
const token = 'ab'.repeat(32)
const presencePath = `mobileTaskPresence/${token}`
let testEnv

const guest = () => testEnv.unauthenticatedContext().database()

beforeAll(async () => {
  global.fetch = fetch
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
})

describe('mobile task presence', () => {
  it('lets a signed-out client write and read presence for a valid token', async () => {
    await assertSucceeds(set(ref(guest(), presencePath), { connected: true }))
    const snap = await assertSucceeds(get(ref(guest(), presencePath)))
    expect(snap.val()).toEqual({ connected: true })
    await assertSucceeds(remove(ref(guest(), presencePath)))
  })

  it('rejects a malformed token and extra fields', async () => {
    await assertFails(
      set(ref(guest(), 'mobileTaskPresence/short'), { connected: true }),
    )
    await assertFails(
      set(ref(guest(), presencePath), { connected: true, extra: 1 }),
    )
  })

  it('does not let a client list every token', async () => {
    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      await set(ref(adminContext.database(), presencePath), { connected: true })
    })
    await assertFails(get(ref(guest(), 'mobileTaskPresence')))
  })
})
