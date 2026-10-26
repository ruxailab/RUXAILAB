import fs from 'fs'
import fetch from 'node-fetch'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteField, doc, setDoc, updateDoc } from 'firebase/firestore'

const projectId = 'demo-ruxailab-user-profile'
let testEnv

const context = (uid) => testEnv.authenticatedContext(uid)

beforeAll(async () => {
  global.fetch = fetch
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await Promise.all([
      setDoc(doc(db, 'users/owner'), {
        accessLevel: 1,
        email: 'owner@example.com',
        username: 'owner',
        contactNo: '+1 555 0100',
        country: 'BR',
        profileImage: 'https://example.com/owner.png',
        storageUsageMB: 12,
        myTests: { 'study-1': { role: 0 } },
        myAnswers: { 'study-1': { answerId: 'answers-1' } },
      }),
      setDoc(doc(db, 'users/stranger'), {
        accessLevel: 1,
        email: 'stranger@example.com',
      }),
      setDoc(doc(db, 'users/superadmin'), {
        accessLevel: 0,
        email: 'super@example.com',
      }),
    ])
  })
})

describe('users/{userId} profile ownership', () => {
  it('lets a user edit their own profile', async () => {
    await assertSucceeds(
      updateDoc(doc(context('owner').firestore(), 'users/owner'), {
        username: 'renamed',
        contactNo: '+1 555 0199',
        country: 'PT',
        profileImage: 'https://example.com/new.png',
      }),
    )
  })

  it('stops a signed-in user from editing another profile', async () => {
    const strangerDb = context('stranger').firestore()

    await assertFails(
      updateDoc(doc(strangerDb, 'users/owner'), {
        username: 'pwned',
        email: 'attacker-controlled@example.com',
      }),
    )
    await assertFails(
      updateDoc(doc(strangerDb, 'users/owner'), {
        profileImage: 'https://example.com/attacker.png',
      }),
    )
  })

  it('stops a signed-in user from rewriting another storage counter', async () => {
    await assertFails(
      updateDoc(doc(context('stranger').firestore(), 'users/owner'), {
        storageUsageMB: 999999,
      }),
    )
  })

  it('stops profile fields riding along with a membership change', async () => {
    await assertFails(
      updateDoc(doc(context('stranger').firestore(), 'users/owner'), {
        'myAnswers.study-1': deleteField(),
        email: 'attacker-controlled@example.com',
      }),
    )
  })

  it('keeps study membership pointers writable for study staff', async () => {
    const strangerDb = context('stranger').firestore()

    await assertSucceeds(
      updateDoc(doc(strangerDb, 'users/owner'), {
        'myAnswers.study-1': deleteField(),
      }),
    )
    await assertSucceeds(
      updateDoc(doc(strangerDb, 'users/owner'), {
        'myTests.study-1': deleteField(),
      }),
    )
  })

  it('keeps the platform access level immutable for ordinary users', async () => {
    await assertFails(
      updateDoc(doc(context('owner').firestore(), 'users/owner'), {
        accessLevel: 0,
      }),
    )
    await assertFails(
      updateDoc(doc(context('stranger').firestore(), 'users/owner'), {
        accessLevel: 0,
      }),
    )
  })

  it('still lets a super admin manage any profile', async () => {
    await assertSucceeds(
      updateDoc(doc(context('superadmin').firestore(), 'users/owner'), {
        accessLevel: 0,
        username: 'promoted',
      }),
    )
  })
})
