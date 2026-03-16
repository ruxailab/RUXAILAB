// imports
import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'
import AnswerController from '../shared/controllers/AnswerController'
import UserAnswer from '@/features/auth/models/UserAnswer'
import UserController from '../features/auth/controllers/UserController'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'
import StudyAnswer from '@/shared/models/StudyAnswer'
import { isFirebaseDisabled } from '@/config/runtimeFlags'

const COLLECTION = 'tests'
const answerController = new AnswerController()
const userController = new UserController()

// In-memory state for local development when Firebase is disabled
let MOCK_STUDIES = []

export default class StudyController extends Controller {
  constructor() {
    super()
  }

  async createStudy(payload) {
    if (isFirebaseDisabled) {
      const newStudy = Object.assign({ id: 'mock-study-' + Date.now(), answersDocId: 'mock-answers-id' }, payload.toFirestore ? payload.toFirestore() : payload)
      MOCK_STUDIES.push(newStudy)
      return { id: newStudy.id }
    }
    
    try {
      const answerDoc = await answerController.createAnswer(
        new StudyAnswer({ type: payload.testType }),
      )
      payload.answersDocId = answerDoc.id

      return await super.create(COLLECTION, payload.toFirestore())
    } catch (error) {
      throw error
    }
  }

  async duplicateStudy(payload) {
    if (isFirebaseDisabled) {
      const original = MOCK_STUDIES.find(s => s.id === payload.test.id)
      const duplicated = Object.assign({}, original, { id: 'mock-study-dup-' + Date.now(), answersDocId: 'mock-answers-dup-id' })
      MOCK_STUDIES.push(duplicated)
      return { id: duplicated.id }
    }

    try {
      const answerDoc = await answerController.createAnswer(
        new StudyAnswer({ type: payload.test.testType }),
      )

      const duplicatedStudy = payload.test
      duplicatedStudy.answersDocId = answerDoc.id

      return await super.create(COLLECTION, duplicatedStudy.toFirestore())
    } catch (error) {
      throw error
    }
  }

  async deleteStudy(payload) {
    if (isFirebaseDisabled) {
      MOCK_STUDIES = MOCK_STUDIES.filter(s => s.id !== payload.id)
      return MOCK_STUDIES
    }

    try {
      const tests = await super.delete(COLLECTION, payload.id)
      return tests
    } catch (error) {
      throw error
    }
  }

  async updateStudy(payload) {
    if (isFirebaseDisabled) {
      const index = MOCK_STUDIES.findIndex(s => s.id === payload.id)
      if (index !== -1) {
        MOCK_STUDIES[index] = Object.assign({}, MOCK_STUDIES[index], payload.toFirestore ? payload.toFirestore() : payload)
      }
      return MOCK_STUDIES[index]
    }

    try {
      return await super.update(COLLECTION, payload.id, payload.toFirestore())
    } catch (error) {
      throw error
    }
  }

  async acceptStudyCollaboration(payload) {
    const userAnswer = new UserAnswer({
      answersDocId: payload.test.answersDocId,
      accessLevel: payload.cooperator.accessLevel,
      progress: 0,
      testAuthorEmail: payload.test.testAdmin.email,
      testDocId: payload.test.id,
      testType: payload.test.testType,
      subType: payload.test.subType,
      testTitle: payload.test.testTitle,
      total: 0,
      updateDate: Date.now(),
    })

    const userToUpdate = payload.cooperator
    userToUpdate.myAnswers[`${userAnswer.testDocId}`] = userAnswer.toFirestore()
    await userController.update(userToUpdate.id, userToUpdate.toFirestore())

    const testToUpdate = payload.test
    const index = testToUpdate.cooperators.findIndex(
      (c) => c.email === userToUpdate.email,
    )
    testToUpdate.cooperators[index].accepted = true
    testToUpdate.cooperators[index].userDocId = userToUpdate.id

    if (isFirebaseDisabled) {
      const sIndex = MOCK_STUDIES.findIndex(s => s.id === testToUpdate.id)
      if (sIndex !== -1) MOCK_STUDIES[sIndex] = testToUpdate.toFirestore()
      return testToUpdate
    }

    return await super.update(
      COLLECTION,
      testToUpdate.id,
      testToUpdate.toFirestore(),
    )
  }

  async getStudy(parameter) {
    if (isFirebaseDisabled) {
      const rawData = MOCK_STUDIES.find(s => s.id === parameter.id)
      if (!rawData) return null
      return instantiateStudyByType(rawData.testType, rawData)
    }

    try {
      const res = await super.readOne(COLLECTION, parameter.id)
      if (res.exists()) {
        const rawData = Object.assign({ id: res.id }, res.data())
        return instantiateStudyByType(rawData.testType, rawData)
      }
    } catch (error) {
      throw error
    }
  }

  async getPublicStudies() {
    if (isFirebaseDisabled) {
      return MOCK_STUDIES.filter(s => s.isPublic).map(rawData => instantiateStudyByType(rawData.testType, rawData))
    }

    try {
      const q = {
        field: 'isPublic',
        condition: '==',
        value: true,
      }
      const res = await super.query(COLLECTION, q)
      return res.docs.map((doc) => {
        const rawData = Object.assign({ id: doc.id }, doc.data())
        return instantiateStudyByType(rawData.testType, rawData)
      })
    } catch (error) {
      throw error
    }
  }

  async getAllStudies() {
    if (isFirebaseDisabled) {
      return MOCK_STUDIES.map(rawData => instantiateStudyByType(rawData.testType, rawData))
    }

    try {
      const res = await super.readAll(COLLECTION)
      return res.map((doc) => {
        const rawData = Object.assign({ id: doc.id }, doc.data())
        return instantiateStudyByType(rawData.testType, rawData)
      })
    } catch (error) {
      throw error
    }
  }

  subscribeToStudy(studyId, callback) {
    if (isFirebaseDisabled) {
      const rawData = MOCK_STUDIES.find(s => s.id === studyId)
      if (rawData) callback(instantiateStudyByType(rawData.testType, rawData))
      return () => {}
    }

    return onSnapshot(doc(db, COLLECTION, studyId), (doc) => {
      const rawData = Object.assign({ id: doc.id }, doc.data())
      callback(instantiateStudyByType(rawData.testType, rawData))
    })
  }
}
