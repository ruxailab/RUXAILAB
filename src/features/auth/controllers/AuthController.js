import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
} from 'firebase/auth'
import { auth } from '@/app/plugins/firebase'
import axios from 'axios'
import EmailController from '@/shared/controllers/EmailController'

/**
 * Controller for authentication operations
 */
export default class AuthController {
  /**
   * Signs up a new user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Firebase auth user credential
   */
  async signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  /**
   * Signs in a user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Firebase auth user credential
   */
  async signIn(email, password, rememberMe) {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence,
    )
    return signInWithEmailAndPassword(auth, email, password)
  }

  /**
   * Signs in a user with Google
   * @returns {Promise} - Firebase auth user credential
   */
  async signInWithGoogle(rememberMe) {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence,
    )
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  /**
   * Gets the current user
   * @returns {Object} - Current Firebase user
   */
  async getCurrentUser() {
    return auth.currentUser
  }

  /**
   * Signs out the current user
   * @returns {Promise} - Firebase auth signOut promise
   */
  async signOut() {
    return signOut(auth)
  }

  /**
   * Auto sign in with Firebase observer
   * @returns {Promise} - Current user or null
   */
  async autoSignIn() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe()
          resolve(user)
        },
        (error) => {
          unsubscribe()
          reject(error)
        },
      )
    })
  }
  // Reset Password
  async resetPassword(email) {
    // return sendPasswordResetEmail(auth, email)
    const emailController = new EmailController()
    await emailController.send({
      to: email,
      subject: 'Password Reset',
      template: 'passwordReset',
    })
  }

  /**
   * Delete user account - consolidated method
   * @param {Object} payload - Deletion payload
   * @param {Object} payload.user - Firebase auth user
   * @param {string} payload.password - User password for reauthentication (optional)
   * @returns {Promise}
   */
  async deleteAuth(payload) {
    const { user, password } = payload

    if (!user) throw new Error('No user provided')

    const hasGoogle = user.providerData.some(
      (p) => p.providerId === 'google.com',
    )

    // Reauthenticate based on provider
    if (hasGoogle) {
      await reauthenticateWithPopup(user, new GoogleAuthProvider())
    } else {
      if (!password) throw new Error('Password required')
      const cred = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, cred)
    }

    // Delete user from Firebase Auth
    await user.delete()

    // Call backend to clean up (non-blocking - don't fail if this errors)
    // User is already deleted from Firebase, so this is best-effort cleanup
    try {
      await this.deleteUserData(user.uid)
    } catch {
      // Don't throw - user deletion succeeded
    }
  }

  async deleteUserData(userId) {
    try {
      await axios.post(
        process.env.VUE_APP_CLOUD_FUNCTIONS_URL + '/deleteAuth',
        { data: { userId } },
      )
    } catch (err) {
      throw err
    }
  }
}
