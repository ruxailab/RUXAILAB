import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import UserController from '../../features/auth/controllers/UserController'
import {
  instantiateStudyAnswerByType,
  STUDY_TYPES,
} from '@/shared/constants/methodDefinitions'
import UserStudyEvaluatorAnswer from '@/ux/UserTest/models/UserStudyEvaluatorAnswer'
const COLLECTION = 'answers'

const userController = new UserController()

import { increment } from 'firebase/firestore'

/**
 * Controller for managing study answers in Firestore.
 * Handles CRUD operations for answers, user answer references, and task answers.
 * @extends Controller
 */
export default class AnswerController extends Controller {
  /**
   * Fetches an answer document by ID and instantiates the correct answer type.
   * @param {Object} payload - Query payload
   * @param {string} payload.id - The answer document ID
   * @returns {Promise<StudyAnswer>} The instantiated answer (e.g. UserStudyEvaluatorAnswer, HeuristicAnswer)
   * @throws {Error} If the document does not exist or read fails
   */
  async getAnswerById(payload) {
    const res = await super.readOne(COLLECTION, payload)
    const answer = instantiateStudyAnswerByType(res.data().type, {
      id: res.id,
      ...res.data(),
    })
    return answer
  }

  /**
   * Creates a new answer document in the answers collection.
   * @param {Object} payload - Answer model instance with toFirestore() method
   * @returns {Promise<Object>} The created document reference (with id)
   * @throws {Error} If creation fails
   */
  async createAnswer(payload) {
    return super.create(COLLECTION, payload.toFirestore())
  }

  /**
   * Updates a user's answer reference for a specific test (e.g. progress, metadata).
   * @param {Object} payload - Update payload
   * @param {string} payload.cooperatorId - The user document ID
   * @param {string} payload.testDocId - The test document ID (key in myAnswers)
   * @param {Object} payload.data - The data to merge into the user's answer entry
   * @returns {Promise<void>} Resolves when the user document is updated
   * @throws {Error} If user not found or update fails
   */
  async updateUserAnswer(payload) {
    const userToUpdate = await userController.getById(payload.cooperatorId)

    userToUpdate.myAnswers[`${payload.testDocId}`] = Object.assign(
      userToUpdate.myAnswers[`${payload.testDocId}`],
      payload.data,
    )
    return userController.update(userToUpdate.id, userToUpdate.toFirestore())
  }

  /**
   * Removes a user's answer: deletes the answer document and removes the reference from the user.
   * @param {Object} payload - Removal payload
   * @param {string} payload.cooperatorId - The user document ID
   * @param {string} payload.testDocId - The test document ID (key in myAnswers)
   * @returns {Promise<void>} Resolves when both the answer doc is deleted and user is updated
   * @throws {Error} If user not found, answer doc missing, or delete/update fails
   */
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

  /**
   * Saves or updates a test answer (task or heuristic) in the answers document.
   * @param {Object} payload - Answer payload with toFirestore() and userDocId (optional for anonymous)
   * @param {string} answersDocId - The answers document ID
   * @param {string} testType - One of STUDY_TYPES.HEURISTIC or STUDY_TYPES.USER
   * @returns {Promise<void>} Resolves when the answers document is updated
   * @throws {Error} If update fails
   */
  async saveTestAnswer(payload, answersDocId, testType) {
    payload.lastUpdate = Date.now()

    const fieldToUpdate = {}

    if (testType === STUDY_TYPES.HEURISTIC) {
      fieldToUpdate[`heuristicAnswers.${payload.userDocId}`] =
        payload.toFirestore()
    } else if (testType === STUDY_TYPES.USER) {
      if (!payload.userDocId) {
        const taskAnswer = (await this.getAnswerById(answersDocId)).taskAnswers // get taskAnswers

        const taskAnswerCount = Object.keys(taskAnswer || {}).length // get number of taskAnswers

        fieldToUpdate[`taskAnswers.Ev${taskAnswerCount + 1}`] =
          payload.toFirestore() // add new taskAnswer with EV prefix for anonymous answers
      } else {
        fieldToUpdate[`taskAnswers.${payload.userDocId}`] =
          payload.toFirestore()
      }
    }
    console.log('fieldToUpdate ->', fieldToUpdate)

    await super.update(COLLECTION, answersDocId, fieldToUpdate)
  }

  /**
   * Updates an existing task answer (e.g. evaluator answer) for a user in the answers document.
   * @param {Object} payload - Task answer data (userDocId, etc.) used to build UserStudyEvaluatorAnswer
   * @param {string} answersDocId - The answers document ID
   * @returns {Promise<void>} Resolves when the answers document is updated
   * @throws {Error} If update fails
   */
  async updateTaskAnswer(payload, answersDocId) {
    const fieldPath = `taskAnswers.${payload.userDocId}`
    const data = new UserStudyEvaluatorAnswer({
      ...payload,
      lastUpdate: Date.now(),
    })
    console.log('data:', data)
    await super.update(COLLECTION, answersDocId, {
      [fieldPath]: data.toFirestore(),
    })
  }

  /**
   * Updates transcription metadata for a specific task (e.g. latest doc ID and count).
   * @param {Object} params - Update parameters
   * @param {string} params.answersDocId - The answers document ID
   * @param {string} params.userDocId - The user document ID (key in taskAnswers)
   * @param {string} params.taskId - The task ID within the user's tasks
   * @param {string} params.latestId - Latest transcription document ID
   * @param {number} [params.inc=1] - Increment for transcriptionsCount (Firestore increment)
   * @returns {Promise<void>} Resolves when the answers document is updated
   * @throws {Error} If update fails
   */
  async updateTaskTranscriptionMeta({
    answersDocId,
    userDocId,
    taskId,
    latestId,
    inc = 1,
  }) {
    const base = `taskAnswers.${userDocId}.tasks.${taskId}`

    const update = {
      [`${base}.latestTranscriptionDocId`]: latestId,
      [`${base}.transcriptionsCount`]: increment(inc),
    }
    return super.update(COLLECTION, answersDocId, update)
  }
}
