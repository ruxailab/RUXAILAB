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
  sendEmailVerification
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    if (userCredential?.user) {
      sendEmailVerification(userCredential.user).catch(() => {
        // Verification email failed, but account creation succeeded
      })
    }

    return userCredential
  }

  /**
   * Signs in a user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Firebase auth user credential
   */
  async signIn(email, password, rememberMe) {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    // Check if email is verified
    if (userCredential.user && !userCredential.user.emailVerified) {
      const error = new Error('Email not verified')
      error.code = 'auth/email-not-verified'
      throw error
    }
    
    return userCredential
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
   * Refreshes current user data (including emailVerified status)
   * @returns {Promise<void>}
   */
  async reloadCurrentUser() {
    const currentUser = auth.currentUser
    if (currentUser) {
      await currentUser.reload()
    }
  }

  /**
   * Sends verification email to user
   * @param {Object} user - Firebase auth user
   * @returns {Promise<void>}
   */
  async sendVerificationEmail(user) {
    if (user) {
      await sendEmailVerification(user)
    }
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
