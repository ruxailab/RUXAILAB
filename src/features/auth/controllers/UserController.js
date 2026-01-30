import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import User from '@/features/auth/models/UserModel'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
import { documentId } from 'firebase/firestore'
const COLLECTION = 'users'

export default class UserController extends Controller {
  constructor() {
    super()
  }
  async create(payload) {
    const user = new User({
      email: payload.email,
      username: payload.displayName || payload.username || '',
      profileImage: payload.profileImage || '',
      country: payload.country || '',
      accessLevel: 1,
      myTests: {},
      myAnswers: {},
      notifications: [],
      storageUsageMB: 0,
    }).toFirestore()
    return super.set(COLLECTION, payload.id, user)
  }

  async update(docId, payload) {
    return super.update(COLLECTION, docId, payload)
  }

  async readAll() {
    const docs = await super.readAll(COLLECTION)
    return docs.map((doc) => new User(doc))
  }

  async getById(docId) {
    const res = await super.readOne(COLLECTION, docId)
    return new User(Object.assign({ id: res.id }, res.data()))
  }

  async getUserWithStudies(docId) {
    const res = await super.readOne(COLLECTION, docId)
    const user = new User({ id: res.id, ...res.data() })

    const myTestsIds = Object.keys(user.myTests || {})
    const myAnswersIds = Object.keys(user.myAnswers || {})

    const [testsDocs, answersDocs] = await Promise.all([
      this._fetchStudiesByIds(myTestsIds),
      this._fetchStudiesByIds(myAnswersIds),
    ])

    const myTests = {}
    testsDocs.forEach((doc) => {
      myTests[doc.id] = {
        ...(user.myTests?.[doc.id] || {}),
        ...doc,
      }
    })

    const myAnswers = {}
    answersDocs.forEach((doc) => {
      myAnswers[doc.id] = {
        ...(user.myAnswers?.[doc.id] || {}),
        ...doc,
      }
    })

    user.myTests = myTests
    user.myAnswers = myAnswers

    return user
  }

  async _fetchStudiesByIds(ids) {
    if (!ids || ids.length === 0) return []

    try {
      // If there are few (<= 10), use "in" query (faster and more direct)
      if (ids.length <= 10) {
        const q = {
          field: documentId(),
          condition: 'in',
          value: ids,
        }
        const res = await super.query('tests', q)
        return res.docs.map((doc) => {
          return Object.assign({ id: doc.id }, doc.data())
        })
      }

      // If there are many (>10), parallelize individual gets
      const promises = ids.map((id) => super.readOne('tests', id))
      const results = await Promise.all(promises)
      return results
        .filter((r) => r.exists())
        .map((r) => {
          return Object.assign({ id: r.id }, r.data())
        })
    } catch (error) {
      throw error
    }
  }

  async updateProfile(docId, payload) {
    const userData = {
      username: payload.username,
      contactNo: payload.contactNo,
      country: payload.country,
    }
    return super.update(COLLECTION, docId, userData)
  }

  async deleteUser(docId) {
    return super.delete(COLLECTION, docId)
  }

  async changePassword(user, currentPassword, newPassword) {
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      )
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
    } catch (error) {
      throw new Error('Failed to change password: ' + error.message)
    }
  }

  async reauthenticateUser(user, email, password) {
    const credential = EmailAuthProvider.credential(email, password)
    await reauthenticateWithCredential(user, credential)
  }

  async addNotification(payload) {
    const userToUpdate = await this.getById(payload.userId)
    userToUpdate.notifications.push(payload.notification.toFirestore())
    return this.update(payload.userId, userToUpdate.toFirestore())
  }

  async markNotificationAsRead(payload) {
    const userToUpdate = new User(payload.user)

    // Find the notification in the notifications array
    const notificationIndex = userToUpdate.notifications.findIndex(
      (n) => n.createdDate === payload.notification.createdDate,
    )

    if (notificationIndex !== -1) {
      // Mark notification as read
      userToUpdate.notifications[notificationIndex].read = true
      userToUpdate.notifications[notificationIndex].readAt = Date.now()

      // Save updated user data to Firestore
      await this.update(userToUpdate.id, userToUpdate.toFirestore())
      return userToUpdate
    } else {
      // Notification was not found in the array
      throw new Error('Notification not found.')
    }
  }

  async markAllNotificationsAsRead(user) {
    const userToUpdate = new User(user)

    let hasUnread = false
    userToUpdate.notifications.forEach((n) => {
      if (!n.read) {
        n.read = true
        n.readAt = Date.now()
        hasUnread = true
      }
    })

    if (!hasUnread) return userToUpdate

    await this.update(userToUpdate.id, userToUpdate.toFirestore())
    // Return the updated user object (in memory) so the store can commit it immediately
    return userToUpdate
  }

  async removeNotificationsForTest(testId, cooperators) {
    try {
      for (let cooperator = 0; cooperator < cooperators.length; cooperator++) {
        const userDocID = cooperators[cooperator].userDocId

        // Lê o documento do usuário diretamente
        const userDoc = await super.readOne('users', userDocID)

        // Verifica se o documento do usuário existe
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const userId = userDoc.id

          // Verificar se o usuário tem notificações
          if (userData.notifications && userData.notifications.length > 0) {
            // Filtrar notificações que têm o testId correspondente
            userData.notifications = userData.notifications.filter(
              (notification) => notification.testId !== testId,
            )
            // Atualizar o documento do usuário com as notificações filtradas
            await super.update('users', userId, {
              notifications: userData.notifications,
            })
          }
        } else {
        }
      }
    } catch (error) {
      throw error
    }
  }

  async removeTestFromUser(userId, testIdToRemove) {
    try {
      const userDoc = await super.readOne('users', userId)

      if (!userDoc.exists()) {
        return
      }
      const userData = userDoc.data()

      if (userData.myTests[testIdToRemove]) {
        delete userData.myTests[testIdToRemove]
      }
      if (userData.myAnswers[testIdToRemove]) {
        delete userData.myAnswers[testIdToRemove]
      }

      await super.update('users', userId, userData)
    } catch (error) {
      throw error
    }
  }
  async updateLevel(uid, accessLevel) {
    try {
      return super.update(COLLECTION, uid, { accessLevel })
    } catch (error) {
      throw error
    }
  }

  /**
   * Updates the storageUsageMB field for a specific user based on their current studies.
   * @param {string} userId - The ID of the user to update.
   */
  async updateStorageUsage(userId) {
    try {
      const AnswerController = (
        await import('@/shared/controllers/AnswerController')
      ).default
      const answerController = new AnswerController()

      // 1. Fetch user with their studies (but 'myTests' only has test meta, not deep answers)
      const userWithStudies = await this.getUserWithStudies(userId)

      // 2. We must fetch the actual 'answers' document for each test in 'myTests'
      // because the media URLs are stored in the 'answers' collection, not the 'tests' collection.
      const myTests = userWithStudies.myTests || {}
      const testIds = Object.keys(myTests)

      await Promise.all(
        testIds.map(async (testId) => {
          const test = myTests[testId]
          if (test.answersDocId) {
            try {
              // Fetch the answer document
              // check if we have a direct way or need to use getAnswerById
              const answerDoc = await answerController.getAnswerById(
                test.answersDocId,
              )

              // Attach answers to the test object so calculator can see them
              if (answerDoc && answerDoc.taskAnswers) {
                // The answerController returns the model, which puts 'taskAnswers' into 'tasks' property usually or similar structure
                // Let's check getAnswerById implementation: it calls instantiateStudyAnswerByType
                // If it's a UserStudyEvaluatorAnswer, it maps 'tasks'
                // We'll assign it to 'answers' property which the calculator expects
                test.answers = Object.values(answerDoc.taskAnswers || {})
              }
            } catch (err) {
              console.warn(`Could not fetch answers for test ${testId}`, err)
            }
          }
        }),
      )

      // 3. Calculate storage usage using the helper
      const { calculateUserStorageUsage } =
        await import('@/shared/utils/storageUtils')
      const totalStorageMB = calculateUserStorageUsage(userWithStudies)

      // 4. Update the user document
      await super.update(COLLECTION, userId, {
        storageUsageMB: totalStorageMB,
      })

      return totalStorageMB
    } catch (error) {
      console.error('Error updating storage usage:', error)
      throw new Error('Failed to update storage usage: ' + error.message)
    }
  }
}
