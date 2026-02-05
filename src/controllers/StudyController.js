// imports
import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'
import AnswerController from '../shared/controllers/AnswerController'
import UserAnswer from '@/features/auth/models/UserAnswer'
import UserController from '../features/auth/controllers/UserController'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'
import StudyAnswer from '@/shared/models/StudyAnswer'

const COLLECTION = 'tests'
const answerController = new AnswerController()
const userController = new UserController()

/**
 * Controller for managing study operations
 * @class StudyController
 * @extends Controller
 */
export default class StudyController extends Controller {
  constructor() {
    super()
  }

  /**
   * Creates a new study: creates an answers document, then the test document.
   * @param {Object} payload - Study instance with toFirestore() and testType
   * @returns {Promise<Object>} The created test document reference (with id)
   * @throws {Error} If creation fails
   * @example
   * const studyController = new StudyController()
   * const ref = await studyController.createStudy(studyPayload)
   * console.log('Created study id:', ref.id)
   */
  async createStudy(payload) {
    // Create answers doc for test
    const answerDoc = await answerController.createAnswer(
      new StudyAnswer({ type: payload.testType }),
    )
    payload.answersDocId = answerDoc.id

    return await super.create(COLLECTION, payload.toFirestore())
  }

  /**
   * Duplicates a study: creates a new answers document and a new test document from the source.
   * @param {Object} payload - Payload with test (study to duplicate)
   * @returns {Promise<Object>} The created test document reference (with id)
   * @throws {Error} If duplication fails
   */
  async duplicateStudy(payload) {
    try {
      const answerDoc = await answerController.createAnswer(
        new StudyAnswer({ type: payload.test.testType }),
      )

      // Use the correct study type from the payload (already instantiated correctly in SettingsView)
      const duplicatedStudy = payload.test
      duplicatedStudy.answersDocId = answerDoc.id

      return await super.create(COLLECTION, duplicatedStudy.toFirestore())
    } catch (error) {
      throw error
    }
  }

  /**
   * Deletes a study: removes user references, notifications, and the test document.
   * @param {Object} payload - Deletion payload (id, testAdmin, auxUser, cooperators)
   * @returns {Promise<null|void>} null if test does not exist; otherwise resolves when done
   * @throws {Error} If delete or updates fail
   */
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

  /**
   * Updates a study document with the given payload.
   * @param {Object} payload - Study instance with id and toFirestore()
   * @returns {Promise<void>} Resolves when the document is updated
   * @throws {Error} If update fails
   */
  async updateStudy(payload) {
    try {
      return await super.update(COLLECTION, payload.id, payload.toFirestore())
    } catch (e) {
      throw e
    }
  }

  /**
   * Accepts a study collaboration: adds the cooperator's answer reference and marks invitation accepted.
   * @param {Object} payload - Payload with test, cooperator (user to accept)
   * @returns {Promise<void>} Resolves when the test and user documents are updated
   * @throws {Error} If update fails
   */
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

    // Update invitation on test to accepted
    return await super.update(
      COLLECTION,
      testToUpdate.id,
      testToUpdate.toFirestore(),
    )
  }

  /**
   * Fetches a single study by ID and instantiates the correct study type.
   * @param {Object} parameter - Query parameter
   * @param {string} parameter.id - Test document ID
   * @returns {Promise<Study|null>} Instantiated study or null if not found
   * @throws {Error} If read fails
   */
  async getStudy(parameter) {
    const res = await super.readOne(COLLECTION, parameter.id)
    if (!res.exists()) return null

    const rawData = Object.assign({ id: res.id }, res.data())
    return instantiateStudyByType(rawData.testType, rawData)
  }

  /**
   * Fetches all public studies (isPublic === true) and instantiates by type.
   * @returns {Promise<Study[]>} Array of study instances
   * @throws {Error} If query fails
   */
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

  /**
   * Fetches all test documents and instantiates them by type.
   * @returns {Promise<Study[]>} Array of study instances
   * @throws {Error} If read fails
   */
  async getAllStudies() {
    try {
      const response = await super.readAll('tests')
      const res = response.map((data) => {
        return instantiateStudyByType(data.testType, data)
      })
      return res
    } catch (err) {
      throw err
    }
  }

  /**
   * Subscribes to real-time updates for a study document.
   * @param {string} studyId - Test document ID
   * @param {Function} callback - Called with the instantiated study on each update
   * @returns {Function} Unsubscribe function (from onSnapshot)
   */
  subscribeToStudy(studyId, callback) {
    const docRef = doc(db, COLLECTION, studyId)
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const rawData = Object.assign({ id: doc.id }, doc.data())
        const study = instantiateStudyByType(rawData.testType, rawData)
        callback(study)
      }
    })
  }
}
