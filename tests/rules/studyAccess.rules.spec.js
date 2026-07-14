import fs from 'fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import {
  deleteObject,
  getBytes,
  ref,
  uploadBytes,
} from 'firebase/storage'

const projectId = 'demo-ruxailab-rbac'
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

  it('denies unsupported Observator access on heuristic studies', async () => {
    await testEnv.withSecurityRulesDisabled((adminContext) =>
      updateDoc(doc(adminContext.firestore(), 'tests/study-1'), {
        testType: 'HEURISTIC',
      }),
    )

    await assertFails(
      getDoc(doc(context('observator').firestore(), 'tests/study-1')),
    )
  })

  it('routes all RBAC study updates through trusted callable operations', async () => {
    const managerStudy = doc(context('manager').firestore(), 'tests/study-1')

    await assertFails(updateDoc(managerStudy, { testTitle: 'New title' }))
    await assertFails(updateDoc(managerStudy, { isPublic: true }))
    await assertFails(updateDoc(managerStudy, { studyRoleMap: { manager: 0 } }))
    await assertFails(
      updateDoc(doc(context('admin').firestore(), 'tests/study-1'), {
        testTitle: 'Admin bypass',
      }),
    )
  })

  it('allows only the Study Owner to read audit events and denies client writes', async () => {
    await testEnv.withSecurityRulesDisabled((adminContext) =>
      setDoc(
        doc(adminContext.firestore(), 'tests/study-1/auditTrail/event-1'),
        { action: 'study.edited', actorId: 'manager' },
      ),
    )

    await assertSucceeds(
      getDoc(
        doc(context('owner').firestore(), 'tests/study-1/auditTrail/event-1'),
      ),
    )
    await assertFails(
      getDoc(
        doc(context('admin').firestore(), 'tests/study-1/auditTrail/event-1'),
      ),
    )
    await assertFails(
      setDoc(
        doc(context('owner').firestore(), 'tests/study-1/auditTrail/forged'),
        { action: 'forged' },
      ),
    )
  })

  it('allows only Admin capability holders to delete the study', async () => {
    await assertFails(
      deleteDoc(doc(context('manager').firestore(), 'tests/study-1')),
    )
    await assertSucceeds(
      deleteDoc(doc(context('admin').firestore(), 'tests/study-1')),
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
    await assertSucceeds(
      updateDoc(doc(context('user').firestore(), 'answers/answers-1'), {
        'taskAnswers.user': { progress: 25 },
      }),
    )
    await assertSucceeds(
      updateDoc(doc(context('user').firestore(), 'answers/answers-1'), {
        'taskAnswers.user': { progress: 100, submitted: true },
      }),
    )
    await assertFails(
      updateDoc(doc(context('user').firestore(), 'answers/answers-1'), {
        'taskAnswers.user': { progress: 100, submitted: true },
      }),
    )
  })

  it('allows an Observator to answer only a moderated user study', async () => {
    await testEnv.withSecurityRulesDisabled((adminContext) =>
      updateDoc(doc(adminContext.firestore(), 'tests/study-1'), {
        subType: 'USER_MODERATED',
      }),
    )

    await assertSucceeds(
      updateDoc(doc(context('observator').firestore(), 'answers/answers-1'), {
        'taskAnswers.observator': { progress: 50, submitted: false },
      }),
    )

    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const db = adminContext.firestore()
      await Promise.all([
        updateDoc(doc(db, 'tests/study-1'), {
          subType: 'USER_UNMODERATED',
        }),
        updateDoc(doc(db, 'answers/answers-1'), { taskAnswers: {} }),
      ])
    })

    await assertFails(
      updateDoc(doc(context('observator').firestore(), 'answers/answers-1'), {
        'taskAnswers.observator': { progress: 50, submitted: false },
      }),
    )
  })

  it('allows only the creator to clean up an unlinked answer container', async () => {
    await testEnv.withSecurityRulesDisabled((adminContext) =>
      setDoc(doc(adminContext.firestore(), 'answers/unlinked-answer'), {
        studyId: null,
        createdBy: 'owner',
        type: 'USER',
        taskAnswers: {},
      }),
    )

    await assertFails(
      deleteDoc(doc(context('stranger').firestore(), 'answers/unlinked-answer')),
    )
    await assertSucceeds(
      deleteDoc(doc(context('owner').firestore(), 'answers/unlinked-answer')),
    )
  })

  it('allows the owner creation flow to create, attach, and read an answer container', async () => {
    const ownerDb = context('owner').firestore()
    const answerRef = doc(ownerDb, 'answers/new-answers')
    const studyRef = doc(ownerDb, 'tests/new-study')

    await assertSucceeds(
      setDoc(answerRef, {
        studyId: null,
        createdBy: 'owner',
        type: 'USER',
        taskAnswers: {},
      }),
    )
    await assertSucceeds(
      setDoc(
        studyRef,
        study({
          answersDocId: 'new-answers',
          studyRoleMap: {},
        }),
      ),
    )
    await assertSucceeds(updateDoc(answerRef, { studyId: 'new-study' }))
    await assertSucceeds(getDoc(answerRef))
  })

  it('allows a heuristic evaluator to answer while a Guest remains read-only', async () => {
    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const db = adminContext.firestore()
      await Promise.all([
        updateDoc(doc(db, 'tests/study-1'), {
          testType: 'HEURISTIC',
          studyRoleMap: { evaluator: 1, guest: 2 },
        }),
        setDoc(doc(db, 'users/evaluator'), { accessLevel: 1 }),
        setDoc(doc(db, 'users/guest'), { accessLevel: 1 }),
        updateDoc(doc(db, 'answers/answers-1'), {
          type: 'HEURISTIC',
          heuristicAnswers: {},
        }),
      ])
    })

    await assertSucceeds(
      updateDoc(doc(context('evaluator').firestore(), 'answers/answers-1'), {
        'heuristicAnswers.evaluator': { progress: 50, submitted: false },
      }),
    )
    await assertSucceeds(
      updateDoc(doc(context('evaluator').firestore(), 'answers/answers-1'), {
        'heuristicAnswers.evaluator': { progress: 100, submitted: false },
      }),
    )
    await assertSucceeds(
      updateDoc(doc(context('evaluator').firestore(), 'answers/answers-1'), {
        'heuristicAnswers.evaluator': { progress: 100, submitted: false },
      }),
    )
    await assertSucceeds(
      updateDoc(doc(context('evaluator').firestore(), 'answers/answers-1'), {
        'heuristicAnswers.evaluator': { progress: 100, submitted: true },
      }),
    )
    await assertSucceeds(
      getDoc(doc(context('guest').firestore(), 'answers/answers-1')),
    )
    await assertFails(
      updateDoc(doc(context('guest').firestore(), 'answers/answers-1'), {
        'heuristicAnswers.guest': { progress: 50 },
      }),
    )
    await assertFails(
      updateDoc(doc(context('evaluator').firestore(), 'answers/answers-1'), {
        'heuristicAnswers.evaluator': { progress: 100, submitted: true },
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
      'tests/study-1/owner/file.txt',
    )

    await assertSucceeds(uploadBytes(adminFile, new Uint8Array([1, 2, 3])))
    await assertSucceeds(getBytes(adminFile))
    await assertFails(uploadBytes(managerFile, new Uint8Array([1])))
    await assertFails(getBytes(managerFile))
    await assertFails(deleteObject(adminFile))
  })

  it('allows a participant to upload only under their own answer path', async () => {
    const ownFile = ref(
      context('user').storage(),
      'tests/study-1/user/recording.webm',
    )
    const otherFile = ref(
      context('user').storage(),
      'tests/study-1/observator/recording.webm',
    )
    await assertSucceeds(uploadBytes(ownFile, new Uint8Array([1])))
    await assertSucceeds(getBytes(ownFile))
    await assertFails(uploadBytes(otherFile, new Uint8Array([1])))
    await assertFails(getBytes(otherFile))
  })

  it('allows an Observator to store media only for a moderated user study', async () => {
    await testEnv.withSecurityRulesDisabled((adminContext) =>
      updateDoc(doc(adminContext.firestore(), 'tests/study-1'), {
        subType: 'USER_MODERATED',
      }),
    )

    const moderatedFile = ref(
      context('observator').storage(),
      'tests/study-1/observator/recording.webm',
    )
    await assertSucceeds(uploadBytes(moderatedFile, new Uint8Array([1])))

    await testEnv.withSecurityRulesDisabled((adminContext) =>
      updateDoc(doc(adminContext.firestore(), 'tests/study-1'), {
        subType: 'USER_UNMODERATED',
      }),
    )

    const unmoderatedFile = ref(
      context('observator').storage(),
      'tests/study-1/observator/second-recording.webm',
    )
    await assertFails(uploadBytes(unmoderatedFile, new Uint8Array([1])))
  })

  it('does not require a users document for public participant storage access', async () => {
    await testEnv.withSecurityRulesDisabled((adminContext) =>
      updateDoc(doc(adminContext.firestore(), 'tests/study-1'), {
        isPublic: true,
      }),
    )

    const participantFile = ref(
      context('new-participant').storage(),
      'tests/study-1/new-participant/recording.webm',
    )

    await assertSucceeds(uploadBytes(participantFile, new Uint8Array([1])))
    await assertSucceeds(getBytes(participantFile))
  })

  it('allows authenticated users to read the heuristic CSV template', async () => {
    await testEnv.withSecurityRulesDisabled((adminContext) =>
      uploadBytes(
        ref(adminContext.storage(), 'template-csv/heuristic-template.csv'),
        new Uint8Array([1]),
      ),
    )

    await assertSucceeds(
      getBytes(
        ref(
          context('manager').storage(),
          'template-csv/heuristic-template.csv',
        ),
      ),
    )
    await assertFails(
      getBytes(
        ref(
          testEnv.unauthenticatedContext().storage(),
          'template-csv/heuristic-template.csv',
        ),
      ),
    )
  })

  it('allows a Manager to write heuristic editing assets without opening Storage', async () => {
    await testEnv.withSecurityRulesDisabled((adminContext) =>
      updateDoc(doc(adminContext.firestore(), 'tests/study-1'), {
        testType: 'HEURISTIC',
      }),
    )
    const asset = ref(
      context('manager').storage(),
      'tests/study-1/heuristic_1/question/image.png',
    )

    await assertSucceeds(uploadBytes(asset, new Uint8Array([1])))

    const unsupportedUserRecording = ref(
      context('user').storage(),
      'tests/study-1/user/recording.webm',
    )
    await assertFails(uploadBytes(unsupportedUserRecording, new Uint8Array([1])))
  })
})
