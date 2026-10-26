import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import User from '@/features/auth/models/UserModel'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
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

  async findByEmail(email) {
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalizedEmail) {
      return null
    }

    const res = await super.query(COLLECTION, {
      field: 'email',
      condition: '==',
      value: normalizedEmail,
    })

    if (res.empty) {
      return null
    }

    const doc = res.docs[0]
    return new User(Object.assign({ id: doc.id }, doc.data()))
  }

  async getUserWithStudies(docId) {
    const res = await super.readOne(COLLECTION, docId)
    const user = new User({ id: res.id, ...res.data() })

    const myTestsIds = Object.keys(user.myTests || {})
    const myAnswersIds = Object.keys(user.myAnswers || {})

    const [testsDocs, answersDocs] = await Promise.all([
      this._fetchAccessibleStudiesByIds(myTestsIds),
      this._fetchAccessibleStudiesByIds(myAnswersIds),
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
   * A user's study lists can point to studies they can no longer read: a
   * deleted study left in myTests, or answer-history entries whose access is
   * scoped to a scheduled session (the session list loads those through the
   * session-member callable instead). Skip each such study on its own; one
   * denied study must not break the whole dashboard.
   */
  async _fetchAccessibleStudiesByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return []

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const doc = await super.readOne('tests', id)
          return doc.exists()
            ? Object.assign({ id: doc.id }, doc.data())
            : null
        } catch (error) {
          if (error?.code === 'permission-denied') return null
          throw error
        }
      }),
    )

    return results.filter(Boolean)
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

  async removeTestFromUser(userId, testIdToRemove) {
    try {
      const userDoc = await super.readOne('users', userId)

      if (!userDoc.exists()) {
        return
      }
      const userData = userDoc.data()

      if (userData.myTests?.[testIdToRemove]) {
        delete userData.myTests[testIdToRemove]
      }
      if (userData.myAnswers?.[testIdToRemove]) {
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
}
