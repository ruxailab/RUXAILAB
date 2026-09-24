import fs from 'fs'
import fetch from 'node-fetch'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

const projectId = 'demo-ruxailab-rbac'
let testEnv

const context = (uid, email) =>
  testEnv.authenticatedContext(uid, email ? { email } : {})

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
  await testEnv.withSecurityRulesDisabled(async (adminContext) => {
    const db = adminContext.firestore()
    await Promise.all([
      setDoc(doc(db, 'users/owner'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/participant'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/outsider'), { accessLevel: 1 }),
      setDoc(doc(db, 'tests/study-1'), {
        testAdmin: { userDocId: 'owner' },
        studyRoleMap: {},
      }),
      setDoc(doc(db, 'tests/study-1/sessions/session-1'), {
        title: 'Live focus group',
        staffIds: ['facilitator'],
        participantIds: ['participant'],
        staffEmails: ['observer@example.com'],
        participantEmails: ['participant@example.com'],
      }),
    ])
  })
})

describe('Firestore scheduled-session access', () => {
  it('denies public and unrelated reads while allowing a listed participant', async () => {
    const path = 'tests/study-1/sessions/session-1'
    await assertFails(
      getDoc(doc(testEnv.unauthenticatedContext().firestore(), path)),
    )
    await assertFails(getDoc(doc(context('outsider').firestore(), path)))
    await assertSucceeds(getDoc(doc(context('participant').firestore(), path)))
    await assertSucceeds(
      getDoc(
        doc(context('observer', 'observer@example.com').firestore(), path),
      ),
    )
  })

  it('allows only a study admin to create, update, or delete a session', async () => {
    const session = doc(
      context('participant').firestore(),
      'tests/study-1/sessions/session-1',
    )
    await assertFails(updateDoc(session, { title: 'Tampered' }))
    await assertFails(deleteDoc(session))

    const ownerSession = doc(
      context('owner').firestore(),
      'tests/study-1/sessions/session-2',
    )
    await assertSucceeds(setDoc(ownerSession, { title: 'Created by owner' }))
    await assertSucceeds(updateDoc(ownerSession, { title: 'Updated by owner' }))
    await assertSucceeds(deleteDoc(ownerSession))
  })
})
