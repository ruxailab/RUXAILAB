// imports
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

    const newStudyRef = await super.create(COLLECTION, payload.toFirestore())
    
    await userController.addStudyToUser(payload.testAdmin.userDocId, newStudyRef.id)

    return newStudyRef
  }
  async duplicateStudy(payload) {
    try {
      const answerDoc = await answerController.createAnswer(
        new StudyAnswer({ type: payload.test.testType }),
      )

      const duplicatedStudy = payload.test
      duplicatedStudy.answersDocId = answerDoc.id

      return await super.create(COLLECTION, duplicatedStudy.toFirestore())
    } catch (error) {
      console.error("Error duplicating study:", error)
      throw error
    }
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
      const currentDocRef = await super.readOne(COLLECTION, payload.id)
      
      if (currentDocRef.exists()) {
        const currentData = currentDocRef.data()
        
        const getDateMillis = (dateVal) => {
          if (!dateVal) return 0;
          if (typeof dateVal === 'number') return dateVal;
          if (typeof dateVal.toMillis === 'function') return dateVal.toMillis();
          if (dateVal.seconds) return dateVal.seconds * 1000;
          return 0;
        };

        const dbDate = getDateMillis(currentData.updateDate);
        const clientDate = getDateMillis(payload.updateDate);

        console.log(`[VersionLock] Checking Study ${payload.id}`);
        console.log(`[VersionLock] DB Date: ${dbDate} (Type: ${typeof currentData.updateDate})`);
        console.log(`[VersionLock] Client Date: ${clientDate} (Type: ${typeof payload.updateDate})`);

        if (dbDate > clientDate) {
          console.error('[VersionLock] Concurrent Modification Detected!');
          throw new Error('ConcurrentModification')
        }
      } else {
        console.warn('[VersionLock] Document does not exist in DB');
      }

      payload.updateDate = Date.now()
      const updateData = typeof payload.toFirestore === 'function' ? payload.toFirestore() : payload;
      return await super.update(COLLECTION, payload.id, updateData)
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
