// imports
import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/app/plugins/firebase'
import AnswerController from '../shared/controllers/AnswerController'
import UserController from '../features/auth/controllers/UserController'
import { instantiateStudyByType } from '@/shared/constants/methodDefinitions'
import StudyAnswer from '@/shared/models/StudyAnswer'
import { getAuth } from 'firebase/auth'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'
import Participant from '../shared/models/Participant'

const COLLECTION = 'tests'
const answerController = new AnswerController()
const userController = new UserController()

export default class StudyController extends Controller {
  constructor() {
    super()
  }

  async createStudy(payload) {
    const createdBy = getAuth().currentUser?.uid ?? null
    // Create answers doc for test
    const answerDoc = await answerController.createAnswer(
      new StudyAnswer({ type: payload.testType, createdBy }),
    )
    payload.answersDocId = answerDoc.id

    const studyDoc = await super.create(COLLECTION, payload.toFirestore())
    try {
      await answerController.linkAnswerToStudy(answerDoc.id, studyDoc.id)
    } catch (error) {
      await Promise.allSettled([
        super.delete(COLLECTION, studyDoc.id),
        answerController.delete('answers', answerDoc.id),
      ])
      throw error
    }
    return studyDoc
  }
  async duplicateStudy(payload) {
    try {
      const createdBy = getAuth().currentUser?.uid ?? null
      const answerDoc = await answerController.createAnswer(
        new StudyAnswer({ type: payload.test.testType, createdBy }),
      )

      // Use the correct study type from the payload (already instantiated correctly in SettingsView)
      const duplicatedStudy = payload.test
      duplicatedStudy.answersDocId = answerDoc.id

      const studyDoc = await super.create(
        COLLECTION,
        duplicatedStudy.toFirestore(),
      )
      try {
        await answerController.linkAnswerToStudy(answerDoc.id, studyDoc.id)
      } catch (error) {
        await Promise.allSettled([
          super.delete(COLLECTION, studyDoc.id),
          answerController.delete('answers', answerDoc.id),
        ])
        throw error
      }
      return studyDoc
    } catch (error) {
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
        }
        await Promise.all(promises)
      }
      // Remove only the deleted test from the admin's myTests/myAnswers via a
      // fresh read, instead of overwriting the whole user doc with a stale copy.
      await userController.removeTestFromUser(
        payload.testAdmin.userDocId,
        payload.id,
      )
      await super.delete(COLLECTION, payload.id)
    } catch (error) {
      throw error
    }
  }

  async updateStudy(payload) {
    try {
      const { id, ...partialStudy } = payload
      const study =
        typeof payload.toFirestore === 'function'
          ? payload.toFirestore()
          : partialStudy

      const response =
        await FirebaseFunctionsController.callHttpsCallableFunction(
          'updateStudyWithAudit',
          { studyId: id, study },
        )
      return response.data
    } catch (e) {
      throw e
    }
  }

  async acceptStudyCollaboration(payload) {
    const response =
      await FirebaseFunctionsController.callHttpsCallableFunction(
        'manageStudyMembership',
        {
          studyId: payload.studyId ?? payload.test?.id,
          action: 'accept',
          membershipType: payload.membershipType,
          targetUserId: payload?.cooperator.id,
          targetEmail: payload?.cooperator.email,
          role: payload.role,
        },
      )
    return response.data
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
      const res = response.map((data) => {
        return instantiateStudyByType(data.testType, data)
      })
      return res
    } catch (err) {
      throw err
    }
  }

  async getStudyParticipants({ studyId }) {
    const response = await super.readAll(`tests/${studyId}/participants`)
    return response.map((data) => Participant.toParticipant(data))
  }

  async getAcceptedParticipant({ studyId, userId }) {
    if (!studyId || !userId) {
      return null
    }

    const response = await super.query(`tests/${studyId}/participants`, {
      field: 'userDocId',
      value: userId,
      condition: '==',
    })

    const participant = response.docs[0]

    if (!participant || participant.data()?.accepted !== true) {
      return null
    }

    return Participant.toParticipant({
      id: participant.id,
      ...participant.data(),
    })
  }

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
