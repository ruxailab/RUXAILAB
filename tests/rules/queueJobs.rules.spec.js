import fs from 'fs'
import fetch from 'node-fetch'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'

const projectId = 'demo-ruxailab-queue-jobs'
let testEnv

const context = (uid) => testEnv.authenticatedContext(uid)

const job = (overrides = {}) => ({
  jobId: 'job-1',
  type: 'facial',
  uid: 'admin',
  answersDocId: 'answers-1',
  userDocId: 'participant-42',
  taskId: '3',
  studyId: 'study-1',
  sentimentDocId: null,
  status: 'queued',
  progress: 0,
  error: null,
  cloudTaskId: 'job-1',
  ...overrides,
})

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
      setDoc(doc(db, 'users/owner'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/admin'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/manager'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/observator'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/participant'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/stranger'), { accessLevel: 1 }),
      setDoc(doc(db, 'tests/study-1'), {
        testType: 'USER',
        testAdmin: { userDocId: 'owner' },
        isPublic: false,
        studyRoleMap: {
          admin: 0,
          manager: 4,
          observator: 3,
          participant: 5,
        },
      }),
      setDoc(doc(db, 'jobs/job-1'), job()),
      setDoc(
        doc(db, 'jobs/job-2'),
        job({
          jobId: 'job-2',
          cloudTaskId: 'job-2',
          uid: 'other-admin',
          studyId: 'other-study',
        }),
      ),
      setDoc(
        doc(db, 'jobs/job-3'),
        job({
          jobId: 'job-3',
          cloudTaskId: 'job-3',
          uid: 'stranger',
          studyId: null,
        }),
      ),
    ])
  })
})

const jobsForStudy = (uid, studyId) =>
  getDocs(
    query(
      collection(context(uid).firestore(), 'jobs'),
      where('studyId', '==', studyId),
    ),
  )

describe('jobs/{jobId} read scoping', () => {
  it('stops an unrelated account from reading a job', async () => {
    await assertFails(
      getDoc(doc(context('stranger').firestore(), 'jobs/job-1')),
    )
  })

  it('stops anyone from listing the whole collection', async () => {
    await assertFails(
      getDocs(collection(context('stranger').firestore(), 'jobs')),
    )
    await assertFails(getDocs(collection(context('admin').firestore(), 'jobs')))
  })

  it('stops a study participant from reading the study queue', async () => {
    await assertFails(
      getDoc(doc(context('participant').firestore(), 'jobs/job-1')),
    )
    await assertFails(jobsForStudy('participant', 'study-1'))
  })

  it('lets study staff read and list their own study queue', async () => {
    for (const uid of ['owner', 'admin', 'manager', 'observator']) {
      await assertSucceeds(getDoc(doc(context(uid).firestore(), 'jobs/job-1')))
      const snap = await assertSucceeds(jobsForStudy(uid, 'study-1'))
      expect(snap.size).toBe(1)
    }
  })

  it('does not extend study staff access to another study queue', async () => {
    await assertFails(getDoc(doc(context('admin').firestore(), 'jobs/job-2')))
  })

  it('lets the account that queued a job watch it, including studyId null', async () => {
    await assertSucceeds(
      getDoc(doc(context('stranger').firestore(), 'jobs/job-3')),
    )
  })

  it('keeps job documents read-only for clients', async () => {
    await assertFails(
      updateDoc(doc(context('admin').firestore(), 'jobs/job-1'), {
        status: 'cancelled',
      }),
    )
    await assertFails(
      updateDoc(doc(context('owner').firestore(), 'jobs/job-1'), {
        status: 'done',
      }),
    )
  })
})
