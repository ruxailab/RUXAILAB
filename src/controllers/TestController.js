// imports

import Test from '@/models/Test'

import Controller from '@/controllers/BaseController'
import AnswerController from './AnswerController'
import Answer from '@/models/Answer'
import UserAnswer from '@/models/UserAnswer'
import UserController from './UserController'

const COLLECTION = 'tests'
const answerController = new AnswerController()
const userController = new UserController()

export default class TestController extends Controller {
  constructor() {
    super()
  }

  async createTest(payload) {
    // Create answers doc for test
    const answerDoc = await answerController.createAnswer(
      new Answer({ type: payload.testType }),
    )
    payload.answersDocId = answerDoc.id

    return await super.create(COLLECTION, payload.toFirestore())
  }

  async deleteTest(payload) {
    return await super.delete(COLLECTION, payload.id)
  }


  async updateTest(payload) {
    console.log('teste')
    return await super.update(COLLECTION, payload.id, payload.toFirestore())
  }


  async acceptTestCollaboration(payload) {
    const userAnswer = new UserAnswer({
      answerDocId: payload.test.answersDocId,
      accessLevel: payload.cooperator.accessLevel,
      progress: 0,
      testAuthorEmail: payload.test.testAdmin.email,
      testDocId: payload.test.id,
      testType: payload.test.testType,
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

  async getTest(parameter) {
    const res = await super.readOne(COLLECTION, parameter.id)
    if (!res.exists()) return null
    return Test.toTest(Object.assign({ id: res.id }, res.data()))
  }

  async getPublicTests() {
    const q = {
      field: 'isPublic',
      value: true,
      condition: '==',
    }
    const res = await super.query(COLLECTION, q)
    return res.docs.map((t) =>
      Test.toTest(Object.assign({ id: t.id }, t.data())),
    )
  }

  async getAllTests() {
    return await super
      .readAll('tests')
      .then((response) => {
        let res = response.map(Test.toTest)
        return res
      })
      .catch((err) => {
        console.log('TestController error: ', err)
      })
  }
}
