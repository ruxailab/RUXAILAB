import fs from 'fs'
import fetch from 'node-fetch'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import StudyController from '@/controllers/StudyController'

const projectId = 'demo-ruxailab-study-creation'
let testEnv
let mockDb

jest.mock('@/app/plugins/firebase', () => ({
  get db() {
    return mockDb
  },
}))
jest.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: { uid: 'owner' } }),
}))
jest.mock('@/features/auth/controllers/UserController', () => class {})
jest.mock('@/shared/models/Participant', () => class {})
jest.mock('@/shared/constants/methodDefinitions', () => ({
  instantiateStudyByType: jest.fn(),
}))
jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {},
}))

beforeAll(async () => {
  global.fetch = fetch
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') },
  })
  mockDb = testEnv.authenticatedContext('owner').firestore()
}, 30000)

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await testEnv.withSecurityRulesDisabled((adminContext) =>
    setDoc(doc(adminContext.firestore(), 'users/owner'), { accessLevel: 1 }),
  )
})

const expectNoCreatedDocuments = async () => {
  await testEnv.withSecurityRulesDisabled(async (adminContext) => {
    const db = adminContext.firestore()
    const [studies, answers] = await Promise.all([
      getDocs(collection(db, 'tests')),
      getDocs(collection(db, 'answers')),
    ])
    expect(studies.empty).toBe(true)
    expect(answers.empty).toBe(true)
  })
}

describe.each(['createStudy', 'duplicateStudy'])(
  '%s with Firestore rules',
  (method) => {
    let controller
    let study
    let payload

    beforeEach(() => {
      controller = new StudyController()
      study = {
        testType: 'USER',
        testAdmin: { userDocId: 'owner' },
        toFirestore() {
          return {
            testType: this.testType,
            testAdmin: this.testAdmin,
            studyRoleMap: { owner: 0 },
            answersDocId: this.answersDocId,
          }
        },
      }
      payload = method === 'createStudy' ? study : { test: study }
    })

    it('creates both documents with their links under the unchanged rules', async () => {
      const studyRef = await controller[method](payload)
      const savedStudy = await getDoc(studyRef)
      const savedAnswer = await getDoc(
        doc(mockDb, 'answers', study.answersDocId),
      )

      expect(savedStudy.exists()).toBe(true)
      expect(savedStudy.data().answersDocId).toBe(savedAnswer.id)
      expect(savedAnswer.data().studyId).toBe(studyRef.id)
      expect(savedAnswer.data().createdBy).toBe('owner')
    })

    it('leaves neither document when the rules deny the study write', async () => {
      study.testAdmin.userDocId = 'another-owner'

      await expect(controller[method](payload)).rejects.toMatchObject({
        code: 'permission-denied',
      })
      await expectNoCreatedDocuments()
    })

    it('leaves neither document when study serialization throws', async () => {
      const error = new Error('Serialization failed')
      study.toFirestore = () => {
        throw error
      }

      await expect(controller[method](payload)).rejects.toBe(error)
      await expectNoCreatedDocuments()
    })
  },
)
