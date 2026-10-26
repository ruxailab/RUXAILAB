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
import { updateStudyWithAudit } from '../src/https/studyUpdate.js'

const projectId = 'demo-ruxailab-study-update-persistence'
let ownedAdminApp
jest.setTimeout(30000)

const db = () => admin.firestore()

const update = (studyPatch) =>
  updateStudyWithAudit.run({
    auth: {
      uid: 'admin',
      token: { email: 'admin@example.test' },
    },
    data: {
      studyId: 'study-1',
      study: {},
      studyPatch,
    },
  })

beforeAll(async () => {
  if (!admin.apps.length) ownedAdminApp = admin.initializeApp({ projectId })
})

afterAll(async () => {
  if (ownedAdminApp) await ownedAdminApp.delete()
})

beforeEach(async () => {
  await db().recursiveDelete(db().collection('tests'))
  await db().recursiveDelete(db().collection('users'))
  await db().doc('tests/study-1').set({
    testType: 'USER',
    testTitle: 'Concurrent edit study',
    testAdmin: { userDocId: 'owner' },
    testStructure: {
      userTasks: [{ taskName: 'Original task' }],
      postTest: [],
    },
    cooperators: [],
    studyRoleMap: { owner: 0, admin: 0 },
  })
  await db()
    .doc('users/admin')
    .set({ email: 'admin@example.test', accessLevel: 1 })
})

describe('concurrent study updates', () => {
  it('keeps a task update when a stale editor saves post-test questions', async () => {
    await update([
      {
        path: ['testStructure', 'userTasks'],
        value: [{ taskName: 'Task created by first admin' }],
      },
    ])

    await update([
      {
        path: ['testStructure', 'postTest'],
        value: [{ title: 'Question added by second admin' }],
      },
    ])

    const study = (await db().doc('tests/study-1').get()).data()
    expect(study.testStructure).toEqual({
      userTasks: [{ taskName: 'Task created by first admin' }],
      postTest: [{ title: 'Question added by second admin' }],
    })
  })

  it('keeps heuristics when a stale editor saves answer options', async () => {
    await db().doc('tests/study-1').update({
      testType: 'HEURISTIC',
      testStructure: [{ id: 1, title: 'Visibility' }],
      testOptions: [{ text: 'Poor', value: 1 }],
    })

    await update([
      {
        path: ['testOptions'],
        value: [
          { text: 'Poor', value: 1 },
          { text: 'Good', value: 2 },
        ],
      },
    ])

    await update([
      {
        path: ['testStructure'],
        value: [
          { id: 1, title: 'Visibility' },
          { id: 2, title: 'Feedback' },
        ],
      },
    ])

    const study = (await db().doc('tests/study-1').get()).data()
    expect(study.testStructure).toEqual([
      { id: 1, title: 'Visibility' },
      { id: 2, title: 'Feedback' },
    ])
    expect(study.testOptions).toEqual([
      { text: 'Poor', value: 1 },
      { text: 'Good', value: 2 },
    ])
  })
})
