import fs from 'fs'
import fetch from 'node-fetch'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { get, ref, remove, set } from 'firebase/database'

const projectId = 'demo-ruxailab-mobile-task-live'
const token = 'ab'.repeat(32)
const attemptId = 'cd'.repeat(16)
const livePath = `mobileTaskLive/${token}`
const ownerPath = `mobileTaskOwners/${token}`
let testEnv

const guest = () => testEnv.unauthenticatedContext().database()
const owner = () => testEnv.authenticatedContext('user-1').database()
const stranger = () => testEnv.authenticatedContext('user-2').database()

const activeTask = {
  state: 'active',
  updatedAt: 10,
  taskNumber: 1,
  title: 'Find the price',
  description: '<p>Look at the header</p>',
  taskIndex: 0,
  taskId: 'task-a',
  attemptId,
}

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
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await set(ref(context.database(), ownerPath), 'user-1')
  })
})

describe('mobile task live channel', () => {
  it('lets the owner publish a task and a signed-out phone read it', async () => {
    await assertSucceeds(set(ref(owner(), livePath), activeTask))
    const snap = await assertSucceeds(get(ref(guest(), livePath)))
    expect(snap.val()).toEqual(activeTask)
    await assertSucceeds(
      set(ref(owner(), livePath), { state: 'completed', updatedAt: 20 }),
    )
    await assertSucceeds(remove(ref(owner(), livePath)))
  })

  it('rejects a phone write, a stranger, and a malformed payload', async () => {
    await assertFails(set(ref(guest(), livePath), activeTask))
    await assertFails(set(ref(stranger(), livePath), activeTask))
    await assertFails(
      set(ref(owner(), livePath), { ...activeTask, taskLink: 'https://secret' }),
    )
    await assertFails(
      set(ref(owner(), livePath), { state: 'active', updatedAt: 10 }),
    )
    await assertFails(
      set(ref(owner(), 'mobileTaskLive/short'), {
        state: 'waiting',
        updatedAt: 10,
      }),
    )
  })

  it('does not let a client claim a token or list every session', async () => {
    await assertFails(set(ref(owner(), ownerPath), 'user-1'))
    await assertFails(get(ref(guest(), 'mobileTaskLive')))
    await assertFails(get(ref(owner(), 'mobileTaskOwners')))
  })

  it('lets a signed-out phone write connected without replacing the task', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await set(ref(context.database(), livePath), {
        state: 'waiting',
        updatedAt: 10,
      })
    })
    await assertSucceeds(set(ref(guest(), `${livePath}/connected`), true))
    const snap = await assertSucceeds(get(ref(guest(), livePath)))
    expect(snap.val()).toEqual({
      state: 'waiting',
      updatedAt: 10,
      connected: true,
    })
    await assertSucceeds(remove(ref(guest(), `${livePath}/connected`)))
    const after = await assertSucceeds(get(ref(guest(), livePath)))
    expect(after.val()).toEqual({ state: 'waiting', updatedAt: 10 })
  })

  it('lets a signed-out phone mark presence before the task node exists', async () => {
    await assertSucceeds(set(ref(guest(), `${livePath}/connected`), true))
    const snap = await assertSucceeds(get(ref(guest(), livePath)))
    expect(snap.val()).toEqual({ connected: true })
  })

  it('rejects a phone write of the task payload and a malformed token', async () => {
    await assertFails(
      set(ref(guest(), `${livePath}/state`), 'active'),
    )
    await assertFails(
      set(ref(guest(), 'mobileTaskLive/short/connected'), true),
    )
  })
})
