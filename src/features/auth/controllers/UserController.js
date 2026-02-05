import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import User from '@/features/auth/models/UserModel'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
import { documentId } from 'firebase/firestore'
const COLLECTION = 'users'

/**
 * Controller for user profile and data management
 * @class UserController
 * @extends Controller
 */
export default class UserController extends Controller {
  constructor() {
    super()
  }

  /**
   * Creates a new user document in Firestore (after auth sign-up).
   * @param {Object} payload - User data from auth
   * @param {string} payload.id - Firebase Auth UID
   * @param {string} [payload.email] - User email
   * @param {string} [payload.displayName] - Display name (fallback: username)
   * @param {string} [payload.profileImage] - Profile image URL
   * @param {string} [payload.country] - Country
   * @returns {Promise<void>} Resolves when the user document is set
   * @throws {Error} If set fails
   */
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

  /**
   * Updates a user document by ID.
   * @param {string} docId - User document ID
   * @param {Object} payload - Partial or full user data (e.g. from toFirestore())
   * @returns {Promise<void>} Resolves when the document is updated
   * @throws {Error} If update fails
   */
  async update(docId, payload) {
    return super.update(COLLECTION, docId, payload)
  }

  /**
   * Reads all user documents and maps them to User model instances.
   * @returns {Promise<User[]>} Array of User instances
   * @throws {Error} If read fails
   */
  async readAll() {
    const docs = await super.readAll(COLLECTION)
    return docs.map((doc) => new User(doc))
  }

  /**
   * Fetches a single user by document ID.
   * @param {string} docId - User document ID
   * @returns {Promise<User>} User instance
   * @throws {Error} If document does not exist or read fails
   */
  async getById(docId) {
    const res = await super.readOne(COLLECTION, docId)
    return new User(Object.assign({ id: res.id }, res.data()))
  }

  /**
   * Fetches a user and populates myTests and myAnswers with full study/answer documents.
   * @param {string} docId - User document ID
   * @returns {Promise<User>} User instance with myTests and myAnswers populated
   * @throws {Error} If read or fetch fails
   */
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

  /**
   * Fetches test documents by IDs (uses 'in' query for ≤10, else parallel get).
   * @private
   * @param {string[]} ids - Test document IDs
   * @returns {Promise<Object[]>} Array of test documents { id, ...data }
   * @throws {Error} If query fails
   */
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

  /**
   * Updates user profile fields (username, contactNo, country).
   * @param {string} docId - User document ID
   * @param {Object} payload - Profile fields
   * @param {string} [payload.username] - Username
   * @param {string} [payload.contactNo] - Contact number
   * @param {string} [payload.country] - Country
   * @returns {Promise<void>} Resolves when the document is updated
   * @throws {Error} If update fails
   */
  async updateProfile(docId, payload) {
    const userData = {
      username: payload.username,
      contactNo: payload.contactNo,
      country: payload.country,
    }
    return super.update(COLLECTION, docId, userData)
  }

  /**
   * Deletes a user document from Firestore.
   * @param {string} docId - User document ID
   * @returns {Promise<void>} Resolves when the document is deleted
   * @throws {Error} If delete fails
   */
  async deleteUser(docId) {
    return super.delete(COLLECTION, docId)
  }

  /**
   * Changes the current user's password (reauthenticates then updates).
   * @param {Object} user - Firebase Auth user object
   * @param {string} currentPassword - Current password for reauthentication
   * @param {string} newPassword - New password to set
   * @returns {Promise<void>} Resolves when password is updated
   * @throws {Error} If reauthentication or update fails
   */
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

  /**
   * Reauthenticates the user with email and password (e.g. before sensitive operations).
   * @param {Object} user - Firebase Auth user object
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<void>} Resolves when reauthentication succeeds
   * @throws {Error} If reauthentication fails
   */
  async reauthenticateUser(user, email, password) {
    const credential = EmailAuthProvider.credential(email, password)
    await reauthenticateWithCredential(user, credential)
  }

  /**
   * Appends a notification to a user's notifications array.
   * @param {Object} payload - Notification payload
   * @param {string} payload.userId - User document ID
   * @param {Object} payload.notification - Notification object with toFirestore()
   * @returns {Promise<void>} Resolves when the user document is updated
   * @throws {Error} If user not found or update fails
   */
  async addNotification(payload) {
    const userToUpdate = await this.getById(payload.userId)
    userToUpdate.notifications.push(payload.notification.toFirestore())
    return this.update(payload.userId, userToUpdate.toFirestore())
  }

  /**
   * Marks a single notification as read by createdDate.
   * @param {Object} payload - Payload
   * @param {Object} payload.user - User instance
   * @param {Object} payload.notification - Notification object (must have createdDate)
   * @returns {Promise<User>} Updated user instance
   * @throws {Error} If notification not found
   */
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

  /**
   * Marks all notifications for a user as read.
   * @param {Object} user - User instance with notifications array
   * @returns {Promise<User>} Updated user instance (in memory)
   * @throws {Error} If update fails
   */
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

  /**
   * Removes all notifications for a given test from all cooperators.
   * @param {string} testId - Test document ID
   * @param {Object[]} cooperators - Array of cooperator objects (e.g. with userDocId)
   * @returns {Promise<void>} Resolves when all user documents are updated
   * @throws {Error} If any update fails
   */
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

  /**
   * Removes a test from a user's myTests and myAnswers (e.g. on test delete or leave).
   * @param {string} userId - User document ID
   * @param {string} testIdToRemove - Test document ID to remove
   * @returns {Promise<void>} Resolves when the user document is updated
   * @throws {Error} If read or update fails
   */
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

  /**
   * Updates a user's access level (e.g. for admin/super admin).
   * @param {string} uid - User document ID
   * @param {number} accessLevel - New access level
   * @returns {Promise<void>} Resolves when the document is updated
   * @throws {Error} If update fails
   */
  async updateLevel(uid, accessLevel) {
    try {
      return super.update(COLLECTION, uid, { accessLevel })
    } catch (error) {
      throw error
    }
  }
}
