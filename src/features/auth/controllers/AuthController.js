import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth'
import { auth } from '@/app/plugins/firebase'
import axios from 'axios';
import EmailController from '@/shared/controllers/EmailController';

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
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
    return signInWithEmailAndPassword(auth, email, password)
  }

  /**
   * Signs in a user with Google
   * @returns {Promise} - Firebase auth user credential
   */
  async signInWithGoogle(rememberMe) {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
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

  async deleteAuth(userId) {
    try {
      await axios.post(process.env.VUE_APP_CLOUD_FUNCTIONS_URL + '/deleteAuth', { data: { userId } })
    } catch (err) {
      console.error('Error deleting user:', err)
      throw err
    }
  }
}
