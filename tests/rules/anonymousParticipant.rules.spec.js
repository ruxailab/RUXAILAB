import fs from 'fs'
import fetch from 'node-fetch'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

// Anonymous accounts exist only so participants can answer a study from an
// invitation link that does not require login. They may read the study they
// joined and save their own answer, and nothing else.

const projectId = 'demo-ruxailab-anonymous'
let testEnv

const anonymous = (uid) =>
  testEnv
    .authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } })
    .firestore()
const account = (uid) =>
  testEnv
    .authenticatedContext(uid, { firebase: { sign_in_provider: 'password' } })
    .firestore()

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
      setDoc(doc(db, 'tests/study-1'), {
        testType: 'USER',
        testAdmin: { userDocId: 'owner' },
        isPublic: false,
        answersDocId: 'answers-1',
        studyRoleMap: { 'anon-joined': 5 },
      }),
      setDoc(doc(db, 'tests/public-study'), {
        testType: 'USER',
        testAdmin: { userDocId: 'owner' },
        isPublic: true,
        studyRoleMap: {},
      }),
      setDoc(doc(db, 'answers/public-answers'), {
        studyId: 'public-study',
        createdBy: 'owner',
        type: 'USER',
        taskAnswers: { finished: { submitted: true } },
      }),
      setDoc(doc(db, 'answers/answers-1'), {
        studyId: 'study-1',
        createdBy: 'owner',
        type: 'USER',
        taskAnswers: {},
      }),
      setDoc(doc(db, 'invites/invite-1'), {
        studyId: 'study-1',
        token: 'secret-token',
        isPublic: true,
        accessLevel: 5,
      }),
    ])
  })
})

describe('anonymous participants', () => {
  it('read and answer only the study they joined', async () => {
    await assertSucceeds(getDoc(doc(anonymous('anon-joined'), 'tests/study-1')))
    await assertSucceeds(
      updateDoc(doc(anonymous('anon-joined'), 'answers/answers-1'), {
        'taskAnswers.anon-joined': { progress: 50 },
      }),
    )
    await assertFails(
      updateDoc(doc(anonymous('anon-joined'), 'answers/answers-1'), {
        'taskAnswers.someone-else': { progress: 50 },
      }),
    )
  })

  it('cannot read studies they did not join, even public ones', async () => {
    await assertFails(getDoc(doc(anonymous('anon-other'), 'tests/study-1')))
    await assertFails(getDoc(doc(anonymous('anon-other'), 'tests/public-study')))
    await assertSucceeds(getDoc(doc(account('someone'), 'tests/public-study')))
  })

  it('cannot create profiles, studies or other account data', async () => {
    await assertFails(
      setDoc(doc(anonymous('anon-joined'), 'users/anon-joined'), {
        accessLevel: 1,
      }),
    )
    await assertFails(
      setDoc(doc(anonymous('anon-joined'), 'tests/new-study'), {
        testAdmin: { userDocId: 'anon-joined' },
        studyRoleMap: {},
      }),
    )
    await assertFails(
      addDoc(collection(anonymous('anon-joined'), 'templates'), { name: 'x' }),
    )
  })
})

describe('invitations and memberships', () => {
  it('are never read or written directly from the browser', async () => {
    for (const db of [
      account('someone'),
      anonymous('anon-joined'),
      testEnv.unauthenticatedContext().firestore(),
    ]) {
      await assertFails(getDocs(collection(db, 'invites')))
      await assertFails(getDoc(doc(db, 'invites/invite-1')))
      await assertFails(
        addDoc(collection(db, 'invites'), {
          studyId: 'study-1',
          token: 'forged',
          isPublic: true,
          accessLevel: 0,
        }),
      )
    }
  })

  it('cannot create participant records from the browser', async () => {
    await assertFails(
      setDoc(doc(account('someone'), 'tests/study-1/participants/p-1'), {
        userDocId: 'someone',
        accessLevel: 0,
        status: 'pending',
      }),
    )
  })
})

describe('public studies', () => {
  it('let any real account save only its own answer', async () => {
    await assertSucceeds(
      updateDoc(doc(account('visitor'), 'answers/public-answers'), {
        'taskAnswers.visitor': { progress: 10 },
      }),
    )
    await assertFails(
      updateDoc(doc(account('visitor'), 'answers/public-answers'), {
        'taskAnswers.someone-else': { progress: 10 },
      }),
    )
  })

  it('do not reopen a submitted answer', async () => {
    await assertFails(
      updateDoc(doc(account('finished'), 'answers/public-answers'), {
        'taskAnswers.finished': { submitted: false },
      }),
    )
  })

  it('still need an invitation for anonymous accounts', async () => {
    await assertFails(
      updateDoc(doc(anonymous('anon-other'), 'answers/public-answers'), {
        'taskAnswers.anon-other': { progress: 10 },
      }),
    )
  })
})
