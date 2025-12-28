import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import UserController from '../../features/auth/controllers/UserController'
import { instantiateStudyAnswerByType, STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer'
const COLLECTION = 'answers'

const userController = new UserController()


import { increment } from 'firebase/firestore'

export default class AnswerController extends Controller {
  async getAnswerById(payload) {
    const res = await super.readOne(COLLECTION, payload)
    const answer = instantiateStudyAnswerByType(res.data().type, { id: res.id, ...res.data() })
    return answer
  }

  async createAnswer(payload) {
    return super.create(COLLECTION, payload.toFirestore())
  }

  async updateUserAnswer(payload) {
    const userToUpdate = await userController.getById(payload.cooperatorId)

    userToUpdate.myAnswers[`${payload.testDocId}`] = Object.assign(
      userToUpdate.myAnswers[`${payload.testDocId}`],
      payload.data,
    )
    return userController.update(userToUpdate.id, userToUpdate.toFirestore())
  }

  async removeUserAnswer(payload) {
    const userToUpdate = await userController.getById(payload.cooperatorId)

    // Delete answers document
    const answerDocumentId =
      userToUpdate.myAnswers[`${payload.testDocId}`].testDocId
    await super.delete(COLLECTION, answerDocumentId)

    // Remove it from user
    delete userToUpdate.myAnswers[`${payload.testDocId}`]
    return userController.update(userToUpdate.id, userToUpdate.toFirestore())
  }

  async saveTestAnswer(payload, answersDocId, testType) {
    payload.lastUpdate = Date.now()


    const fieldToUpdate = {}

    if (testType === STUDY_TYPES.HEURISTIC) {
      fieldToUpdate[
        `heuristicAnswers.${payload.userDocId}`
      ] = payload.toFirestore()

    } else if (testType === STUDY_TYPES.USER) {
      if (!payload.userDocId) {

        const taskAnswer = (await this.getAnswerById(answersDocId)).taskAnswers; // get taskAnswers

        const taskAnswerCount = Object.keys(taskAnswer || {}).length; // get number of taskAnswers 

        fieldToUpdate[`taskAnswers.Ev${taskAnswerCount + 1}`] = payload.toFirestore(); // add new taskAnswer with EV prefix for anonymous answers

      } else {
        fieldToUpdate[`taskAnswers.${payload.userDocId}`] = payload.toFirestore()
      }
    }
    console.log("fieldToUpdate ->", fieldToUpdate);

    await super.update(COLLECTION, answersDocId, fieldToUpdate)
  }

  async updateTaskAnswer(payload, answersDocId) {
    const fieldPath = `taskAnswers.${payload.userDocId}`;
    const data = new UserStudyEvaluatorAnswer({
      ...payload,
      lastUpdate: Date.now(),
    });
    console.log("data:", data)
    await super.update(COLLECTION, answersDocId, {
      [fieldPath]: data.toFirestore(),
    });
  }

  async updateTaskTranscriptionMeta({ answersDocId, userDocId, taskId, latestId, inc = 1 }) {
    const base = `taskAnswers.${userDocId}.tasks.${taskId}`

    const update = {
      [`${base}.latestTranscriptionDocId`]: latestId,
      [`${base}.transcriptionsCount`]: increment(inc)
    }
    return super.update(COLLECTION, answersDocId, update)
  }
}
