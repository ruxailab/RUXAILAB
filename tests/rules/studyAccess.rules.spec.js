import fs from 'fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import {
  deleteObject,
  getBytes,
  ref,
  uploadBytes,
} from 'firebase/storage'

const projectId = 'ruxailab-rbac-test'
let testEnv

const study = (overrides = {}) => ({
  testType: 'USER',
  testAdmin: { userDocId: 'owner' },
  isPublic: false,
  answersDocId: 'answers-1',
  studyRoleMap: {
    admin: 0,
    manager: 4,
    user: 5,
    observator: 3,
  },
  testTitle: 'Original title',
  testDescription: 'Original description',
  testStructure: {},
  testOptions: [],
  cooperators: [],
  ...overrides,
})

const context = (uid) => testEnv.authenticatedContext(uid)

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
    storage: { rules: fs.readFileSync('storage.rules', 'utf8') },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await testEnv.clearStorage()
  await testEnv.withSecurityRulesDisabled(async (adminContext) => {
    const db = adminContext.firestore()
    await Promise.all([
      setDoc(doc(db, 'users/owner'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/admin'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/manager'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/user'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/observator'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/stranger'), { accessLevel: 1 }),
      setDoc(doc(db, 'tests/study-1'), study()),
      setDoc(doc(db, 'answers/answers-1'), {
        studyId: 'study-1',
        createdBy: 'owner',
        type: 'USER',
        taskAnswers: {},
      }),
    ])
  })
})

describe('Firestore study RBAC', () => {
  it('denies a stranger and allows accepted study members to read a private study', async () => {
    await assertFails(
      getDoc(doc(context('stranger').firestore(), 'tests/study-1')),
    )
    await assertSucceeds(
      getDoc(doc(context('observator').firestore(), 'tests/study-1')),
    )
  })

  it('allows authenticated participation reads for public studies only', async () => {
    await testEnv.withSecurityRulesDisabled((adminContext) =>
      updateDoc(doc(adminContext.firestore(), 'tests/study-1'), {
        isPublic: true,
      }),
    )

    await assertSucceeds(
      getDoc(doc(context('stranger').firestore(), 'tests/study-1')),
    )
    await assertFails(
      getDoc(doc(testEnv.unauthenticatedContext().firestore(), 'tests/study-1')),
    )
  })

  it('allows Manager study-content edits but rejects Settings and membership edits', async () => {
    const managerStudy = doc(context('manager').firestore(), 'tests/study-1')

    await assertSucceeds(updateDoc(managerStudy, { testTitle: 'New title' }))
    await assertFails(updateDoc(managerStudy, { isPublic: true }))
    await assertFails(updateDoc(managerStudy, { studyRoleMap: { manager: 0 } }))
  })

  it('allows only Admin capability holders to delete the study', async () => {
    await assertFails(
      updateDoc(doc(context('manager').firestore(), 'tests/study-1'), {
        status: 'deleted',
      }),
    )
    await assertSucceeds(
      updateDoc(doc(context('admin').firestore(), 'tests/study-1'), {
        status: 'deleted',
      }),
    )
  })

  it('prevents ordinary users from changing their platform access level', async () => {
    await assertFails(
      updateDoc(doc(context('stranger').firestore(), 'users/stranger'), {
        accessLevel: 0,
      }),
    )
  })

  it('allows answer viewers to read all answers but participants to update only their own answer', async () => {
    await assertSucceeds(
      getDoc(doc(context('observator').firestore(), 'answers/answers-1')),
    )
    await assertFails(getDoc(doc(context('user').firestore(), 'answers/answers-1')))

    await assertSucceeds(
      updateDoc(doc(context('user').firestore(), 'answers/answers-1'), {
        'taskAnswers.user': { progress: 50 },
      }),
    )
    await assertFails(
      updateDoc(doc(context('user').firestore(), 'answers/answers-1'), {
        'taskAnswers.observator': { progress: 50 },
      }),
    )

    await assertSucceeds(
      updateDoc(doc(context('user').firestore(), 'answers/answers-1'), {
        'taskAnswers.user': { progress: 100 },
      }),
    )
    await assertFails(
      updateDoc(doc(context('user').firestore(), 'answers/answers-1'), {
        'taskAnswers.user': { progress: 25 },
      }),
    )
  })
})

describe('Storage study RBAC', () => {
  it('allows Admin storage operations and rejects Manager operations', async () => {
    const adminFile = ref(
      context('admin').storage(),
      'tests/study-1/admin/file.txt',
    )
    const managerFile = ref(
      context('manager').storage(),
      'tests/study-1/manager/file.txt',
    )

    await assertSucceeds(uploadBytes(adminFile, new Uint8Array([1, 2, 3])))
    await assertSucceeds(getBytes(adminFile))
    await assertFails(uploadBytes(managerFile, new Uint8Array([1])))
    await assertFails(getBytes(managerFile))
    await assertSucceeds(deleteObject(adminFile))
  })
})
