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
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'

const projectId = 'demo-ruxailab-rbac'
const studyId = 'study-1'
const meetingPath = `tests/${studyId}/finalReviewMeetings/meeting-1`
let testEnv

const context = (uid) =>
  uid
    ? testEnv.authenticatedContext(uid)
    : testEnv.unauthenticatedContext()

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
      setDoc(doc(db, 'users/manager'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/evaluator'), { accessLevel: 1 }),
      setDoc(doc(db, 'users/other'), { accessLevel: 1 }),
      setDoc(doc(db, 'tests/study-1'), {
        testType: 'HEURISTIC',
        testAdmin: { userDocId: 'owner' },
        studyRoleMap: { owner: 0, manager: 4, evaluator: 1, other: 2 },
      }),
      setDoc(doc(adminContext.firestore(), meetingPath), {
        title: 'Final expert review',
        facilitatorId: 'manager',
        participantIds: ['evaluator'],
        status: 'IN_PROGRESS',
      }),
      setDoc(
        doc(adminContext.firestore(), `${meetingPath}/sourceEvaluations/evaluator`),
        { evaluatorId: 'evaluator', evaluation: { submitted: true } },
      ),
      setDoc(
        doc(adminContext.firestore(), `${meetingPath}/decisions/decision-1`),
        { outcome: 'CONSENSUS', rationale: 'Agreed' },
      ),
    ])
  })
})

describe('Firestore final review meeting rules', () => {
  it('allows only selected human participants and study managers to read the meeting', async () => {
    await assertFails(getDoc(doc(context(null).firestore(), meetingPath)))
    await assertSucceeds(getDoc(doc(context('owner').firestore(), meetingPath)))
    await assertSucceeds(getDoc(doc(context('manager').firestore(), meetingPath)))
    await assertSucceeds(getDoc(doc(context('evaluator').firestore(), meetingPath)))
    await assertFails(getDoc(doc(context('other').firestore(), meetingPath)))
  })

  it('allows a selected participant to read source evaluations and decisions', async () => {
    await assertSucceeds(
      getDoc(
        doc(
          context('evaluator').firestore(),
          `${meetingPath}/sourceEvaluations/evaluator`,
        ),
      ),
    )
    await assertSucceeds(
      getDoc(
        doc(context('evaluator').firestore(), `${meetingPath}/decisions/decision-1`),
      ),
    )
    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      await setDoc(
        doc(adminContext.firestore(), `${meetingPath}/decisionHistory/history-1`),
        { decisionId: 'decision-1', previousRevision: 1 },
      )
    })
    await assertSucceeds(
      getDoc(
        doc(context('evaluator').firestore(), `${meetingPath}/decisionHistory/history-1`),
      ),
    )
    await assertFails(
      getDoc(
        doc(context('other').firestore(), `${meetingPath}/sourceEvaluations/evaluator`),
      ),
    )
  })

  it('supports a participant-scoped meeting list query', async () => {
    const db = context('evaluator').firestore()
    const meetings = await assertSucceeds(
      getDocs(
        query(
          collection(db, `tests/${studyId}/finalReviewMeetings`),
          where('participantIds', 'array-contains', 'evaluator'),
        ),
      ),
    )
    expect(meetings.docs.map((meeting) => meeting.id)).toEqual(['meeting-1'])
  })

  it('denies direct client writes for all roles, including the study owner', async () => {
    const evaluatorDb = context('evaluator').firestore()
    const managerDb = context('manager').firestore()
    const ownerDb = context('owner').firestore()

    await assertFails(
      setDoc(doc(evaluatorDb, `${meetingPath}/decisions/forged`), {
        outcome: 'CONSENSUS',
      }),
    )
    await assertFails(
      setDoc(doc(evaluatorDb, `${meetingPath}/sourceEvaluations/forged`), {
        evaluatorId: 'forged',
      }),
    )
    await assertFails(
      setDoc(doc(evaluatorDb, `${meetingPath}/decisionHistory/forged`), {
        decisionId: 'decision-1',
      }),
    )
    await assertFails(
      updateDoc(doc(managerDb, meetingPath), { status: 'FINALIZED' }),
    )
    await assertFails(deleteDoc(doc(ownerDb, meetingPath)))
  })
})
