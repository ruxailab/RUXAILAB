// imports

import Study from '@/shared/models/Study'
import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import AnswerController from '../shared/controllers/AnswerController'
import UserAnswer from '@/features/auth/models/UserAnswer'
import UserController from '../features/auth/controllers/UserController'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'
import StudyAnswer from '@/shared/models/StudyAnswer'

const COLLECTION = 'tests'
const answerController = new AnswerController()
const userController = new UserController()

export default class StudyController extends Controller {
  constructor() {
    super()
  }

  async createStudy(payload) {
    // Create answers doc for test
    const answerDoc = await answerController.createAnswer(
      new StudyAnswer({ type: payload.testType }),
    )
    payload.answersDocId = answerDoc.id

    return await super.create(COLLECTION, payload.toFirestore())
  }
  async duplicateStudy(payload) {
    // Duplicate answers doc for another test
    const answerDoc = await answerController.createAnswer(payload.answer)
    payload.test.answersDocId = answerDoc.id

    return await super.create(COLLECTION, payload.test.toFirestore())
  }

  async deleteStudy(payload) {
    try {
      const testToDelete = await super.readOne(COLLECTION, payload.id)
      if (!testToDelete.exists()) {
        return null
      }

      const collaborators = await testToDelete.data()
      const cooperators = collaborators.cooperators
      if (cooperators) {
        const promises = []

        for (const cooperator of cooperators) {
          // Add the call to remove notifications for the test being deleted
          promises.push(
            userController.removeTestFromUser(cooperator.userDocId, payload.id),
          )
          promises.push(
            userController.removeNotificationsForTest(payload.id, cooperators),
          )
        }
        await Promise.all(promises)
      }
      await super.update('users', payload.testAdmin.userDocId, payload.auxUser)
      await super.delete(COLLECTION, payload.id)
    } catch (error) {
      throw error
    }
  }

  async updateStudy(payload) {
    try {
      return await super.update(COLLECTION, payload.id, payload.toFirestore())
    } catch (e) {
      throw e
    }
  }

  //ToDo: It seems an action from User Testing
  async acceptStudyCollaboration(payload) {
    const userAnswer = new UserAnswer({
      answerDocId: payload.test.answersDocId,
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

    // Update answers inside collaborator
    const userToUpdate = payload.cooperator
    userToUpdate.myAnswers[`${userAnswer.testDocId}`] = userAnswer.toFirestore()
    await userController.update(userToUpdate.id, userToUpdate.toFirestore())

    const testToUpdate = payload.test
    const index = testToUpdate.cooperators.findIndex(
      (c) => c.email === userToUpdate.email,
    )
    testToUpdate.cooperators[index].accepted = true
    testToUpdate.cooperators[index].userDocId = userToUpdate.id
    testToUpdate.numberColaborators = testToUpdate.numberColaborators + 1

    // Update invitation on test to accepted
    return await super.update(
      COLLECTION,
      testToUpdate.id,
      testToUpdate.toFirestore(),
    )
  }

  async getStudy(parameter) {
    const res = await super.readOne(COLLECTION, parameter.id)
    if (!res.exists()) return null

    const rawData = Object.assign({ id: res.id }, res.data())
    return instantiateStudyByType(rawData.testType, rawData)
  }

  async getPublicStudies() {
    const q = {
      field: 'isPublic',
      value: true,
      condition: '==',
    }
    const res = await super.query(COLLECTION, q)
    return res.docs.map((t) => {
      const rawData = Object.assign({ id: t.id }, t.data())
      return instantiateStudyByType(rawData.testType, rawData)
    })
  }

  async getAllStudies() {
    try {
      const response = await super.readAll('tests')
      const res = response.map((t) => {
        const rawData = Object.assign({ id: t.id }, t.data())
        return instantiateStudyByType(rawData.testType, rawData)
      })
      return res
    } catch (err) {
      throw err
    }
  }
}
