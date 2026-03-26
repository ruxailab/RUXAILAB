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
  constructor(currentUserId) {
    super()
    this.currentUserId = currentUserId
  }

  async create(payload) {
    const user = new User({
      email: payload.email,
      username: payload.displayName || payload.username || '',
      profileImage: payload.profileImage || '',
      country: payload.country || '',
      accessLevel: 1,
      ownerId: payload.id,
      myTests: {},
      myAnswers: {},
      notifications: [],
      storageUsageMB: 0,
    }).toFirestore()

    return super.set(COLLECTION, payload.id, user)
  }

  async update(docId, payload, currentUserId) {
    if (docId !== currentUserId) {
      throw new Error('Unauthorized update')
    }
    return super.update(COLLECTION, docId, payload)
  }

  async readAll() {
    throw new Error('Not allowed: Cannot fetch all users')
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
      if (ids.length <= 10) {
        const queries = [
          {
            field: documentId(),
            condition: 'in',
            value: ids,
          },
          {
            field: 'ownerId',
            condition: '==',
            value: this.currentUserId,
          },
        ]

        const res = await super.query('tests', queries)

        return res.docs.map((doc) => {
          return Object.assign({ id: doc.id }, doc.data())
        })
      }

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
    return this.update(docId, userData, docId)
  }

  async deleteUser(docId, currentUserId) {
    if (docId !== currentUserId) {
      throw new Error('Unauthorized delete')
    }
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

    return this.update(
      payload.userId,
      userToUpdate.toFirestore(),
      payload.userId
    )
  }

  async markNotificationAsRead(payload) {
    const userToUpdate = new User(payload.user)

    const notificationIndex = userToUpdate.notifications.findIndex(
      (n) => n.createdDate === payload.notification.createdDate,
    )

    if (notificationIndex !== -1) {
      userToUpdate.notifications[notificationIndex].read = true
      userToUpdate.notifications[notificationIndex].readAt = Date.now()

      await this.update(
        userToUpdate.id,
        userToUpdate.toFirestore(),
        userToUpdate.id
      )

      return userToUpdate
    } else {
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

    await this.update(
      userToUpdate.id,
      userToUpdate.toFirestore(),
      userToUpdate.id
    )

    return userToUpdate
  }

  async removeNotificationsForTest(testId, cooperators) {
    try {
      for (let cooperator = 0; cooperator < cooperators.length; cooperator++) {
        const userDocID = cooperators[cooperator].userDocId

        const userDoc = await super.readOne('users', userDocID)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          const userId = userDoc.id

          if (userData.notifications && userData.notifications.length > 0) {
            userData.notifications = userData.notifications.filter(
              (notification) => notification.testId !== testId,
            )

            await this.update(
              userId,
              { notifications: userData.notifications },
              userId
            )
          }
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

      await this.update(userId, userData, userId)
    } catch (error) {
      throw error
    }
  }

  async updateLevel(uid, accessLevel) {
    try {
      return this.update(uid, { accessLevel }, uid)
    } catch (error) {
      throw error
    }
  }
}