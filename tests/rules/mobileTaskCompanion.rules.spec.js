import fs from 'fs'
import fetch from 'node-fetch'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

// The companion is not a study session. The owning participant, including an
// anonymous account, may read it. Nobody may write it from the client.
// An accepted task outcome cannot be overwritten; observations still can.

const projectId = 'demo-ruxailab-mobile-task'
let testEnv

const anonymous = (uid) =>
  testEnv
    .authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } })
    .firestore()
const account = (uid) =>
  testEnv
    .authenticatedContext(uid, { firebase: { sign_in_provider: 'password' } })
    .firestore()

const acceptedTask = {
  attempted: true,
  completed: true,
  startedAt: 1000,
  endedAt: 5000,
  participationMode: 'mobile-task-instructions',
  taskTime: 4000,
  taskObservations: '',
  audioRecordURL: 'https://cdn/a.webm',
}

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
      setDoc(doc(db, 'answers/answers-1'), {
        studyId: 'study-1',
        createdBy: 'owner',
        type: 'USER',
        taskAnswers: {
          'anon-joined': {
            submitted: false,
            progress: 10,
            tasks: {
              0: acceptedTask,
              1: {
                attempted: false,
                completed: null,
                taskObservations: '',
              },
            },
          },
        },
      }),
      setDoc(doc(db, 'tests/study-1/mobileTaskCompanions/anon-joined'), {
        token: 'ab'.repeat(32),
        participantUid: 'anon-joined',
        answerId: 'answers-1',
        status: 'paired',
        activeTask: {
          taskIndex: 0,
          taskId: 'task-a',
          attemptId: 'attempt-1',
          startedAt: 1000,
          taskNumber: 1,
          title: 'Find the price',
          description: 'Look',
        },
      }),
      setDoc(doc(db, `tests/study-1/mobileTaskViews/${'ab'.repeat(32)}`), {
        state: 'waiting',
      }),
    ])
  })
})

describe('mobile task companions', () => {
  const companionPath = 'tests/study-1/mobileTaskCompanions/anon-joined'

  it('lets the owning anonymous participant read the companion', async () => {
    const snap = await assertSucceeds(getDoc(doc(anonymous('anon-joined'), companionPath)))
    expect(snap.data().token).toBe('ab'.repeat(32))
    expect(snap.data().participantUid).toBe('anon-joined')
  })

  it('hides the companion from another user and from signed-out clients', async () => {
    await assertFails(getDoc(doc(account('someone'), companionPath)))
    await assertFails(getDoc(doc(anonymous('anon-other'), companionPath)))
    await assertFails(
      getDoc(doc(testEnv.unauthenticatedContext().firestore(), companionPath)),
    )
  })

  it('rejects every client write, including the owner', async () => {
    const owner = anonymous('anon-joined')
    await assertFails(
      setDoc(doc(owner, companionPath), {
        token: 'forged',
        participantUid: 'anon-joined',
      }),
    )
    await assertFails(
      updateDoc(doc(owner, companionPath), { status: 'ended' }),
    )
    await assertFails(deleteDoc(doc(owner, companionPath)))
    await assertFails(
      setDoc(doc(account('someone'), 'tests/study-1/mobileTaskCompanions/someone'), {
        token: 'forged',
        participantUid: 'someone',
      }),
    )
  })
})

describe('mobile task views', () => {
  const viewPath = `tests/study-1/mobileTaskViews/${'ab'.repeat(32)}`

  it('lets a signed-out client read one view by token', async () => {
    const snap = await assertSucceeds(
      getDoc(doc(testEnv.unauthenticatedContext().firestore(), viewPath)),
    )
    expect(snap.data().state).toBe('waiting')
  })

  it('rejects listing views and every client write', async () => {
    const guest = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDocs(collection(guest, 'tests/study-1/mobileTaskViews')))
    await assertFails(setDoc(doc(guest, viewPath), { state: 'active' }))
    await assertFails(updateDoc(doc(guest, viewPath), { state: 'active' }))
    await assertFails(deleteDoc(doc(guest, viewPath)))
  })
})

describe('accepted task outcomes', () => {
  it('still lets the participant save progress, notes, and a later task', async () => {
    const db = anonymous('anon-joined')
    await assertSucceeds(
      updateDoc(doc(db, 'answers/answers-1'), {
        'taskAnswers.anon-joined.progress': 50,
      }),
    )
    await assertSucceeds(
      updateDoc(doc(db, 'answers/answers-1'), {
        'taskAnswers.anon-joined.tasks.0.taskObservations': 'a note',
        'taskAnswers.anon-joined.tasks.0.taskTime': 9999,
      }),
    )
    await assertSucceeds(
      updateDoc(doc(db, 'answers/answers-1'), {
        'taskAnswers.anon-joined.tasks.1.attempted': true,
        'taskAnswers.anon-joined.tasks.1.completed': false,
      }),
    )
  })

  it('rejects a later change to the accepted outcome fields', async () => {
    const db = anonymous('anon-joined')
    const changes = [
      ['completed', false],
      ['attempted', false],
      ['startedAt', 1],
      ['endedAt', 1],
      ['participationMode', 'desktop'],
    ]

    for (const [field, value] of changes) {
      await assertFails(
        updateDoc(doc(db, 'answers/answers-1'), {
          [`taskAnswers.anon-joined.tasks.0.${field}`]: value,
        }),
      )
    }

    await assertFails(
      updateDoc(doc(db, 'answers/answers-1'), {
        'taskAnswers.anon-joined': {
          submitted: false,
          progress: 80,
          tasks: {
            0: { ...acceptedTask, completed: false },
          },
        },
      }),
    )
  })
})

