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
} from 'firebase/auth'
import { auth } from '@/app/plugins/firebase'
import axios from 'axios'
import EmailController from '@/shared/controllers/EmailController'
import {
  canTrackBrowserSession,
  endBrowserSession,
  isBrowserSessionAlive,
  isSessionScoped,
  startBrowserSession,
} from '@/shared/utils/authSessionPersistence'

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
   * Stores the auth state where the lifetime the user asked for can be honoured.
   *
   * "Remember me" keeps the sign-in until it is revoked. Without it the sign-in
   * is still shared across the tabs of the browser, and a session cookie is
   * what ends it once the browser closes. Browsers that refuse that cookie
   * leave us unable to tell a second tab apart from a restarted browser, so
   * there we keep the tab-scoped persistence rather than signing the user in
   * for longer than they asked for.
   * @param {boolean} rememberMe - Whether to keep the user signed in
   * @returns {Promise<boolean>} - Whether the sign-in is scoped to the session
   */
  async applyPersistence(rememberMe) {
    const sessionScoped = !rememberMe && canTrackBrowserSession()

    await setPersistence(
      auth,
      rememberMe || sessionScoped
        ? browserLocalPersistence
        : browserSessionPersistence,
    )

    return sessionScoped
  }

  /**
   * Records how long a completed sign-in should last.
   *
   * Only a successful sign-in may move these markers, so that a failed attempt
   * cannot shorten or extend the session the user already has.
   * @param {boolean} sessionScoped - Whether the sign-in ends with the browser
   * @returns {Promise}
   */
  async scopeSignIn(sessionScoped) {
    if (!sessionScoped) return endBrowserSession()

    // Cookies answered the probe before sign-in, so this only fails if access
    // was withdrawn in between. Leaving the sign-in with nothing to expire it
    // would outlast what the user asked for, so drop back to the tab.
    if (!startBrowserSession()) {
      await setPersistence(auth, browserSessionPersistence)
    }
  }

  /**
   * Signs in a user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Whether to keep the user signed in
   * @returns {Promise} - Firebase auth user credential
   */
  async signIn(email, password, rememberMe) {
    const sessionScoped = await this.applyPersistence(rememberMe)
    const credential = await signInWithEmailAndPassword(auth, email, password)

    await this.scopeSignIn(sessionScoped)

    return credential
  }

  /**
   * Signs in a user with Google
   * @param {boolean} rememberMe - Whether to keep the user signed in
   * @returns {Promise} - Firebase auth user credential
   */
  async signInWithGoogle(rememberMe) {
    const sessionScoped = await this.applyPersistence(rememberMe)
    const provider = new GoogleAuthProvider()
    const credential = await signInWithPopup(auth, provider)

    await this.scopeSignIn(sessionScoped)

    return credential
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
    endBrowserSession()
    return signOut(auth)
  }

  /**
   * Drops a sign-in made without "Remember me" once its browser session is over.
   *
   * The stored auth state outlives the browser, so the session cookie written
   * at sign-in is what marks the session as still running. Once the browser
   * deletes it, the sign-in has to go with it.
   * @param {Object|null} user - User reported by the Firebase observer
   * @returns {Promise<Object|null>} - The user, or null once signed out
   */
  async enforceBrowserSession(user) {
    if (!user || !isSessionScoped() || isBrowserSessionAlive()) return user

    await signOut(auth)
    endBrowserSession()

    return null
  }

  /**
   * Auto sign in with Firebase observer
   * @returns {Promise} - Current user or null
   */
  async autoSignIn() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          unsubscribe()
          try {
            resolve(await this.enforceBrowserSession(user))
          } catch (error) {
            reject(error)
          }
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
   * Deletes the authenticated user account and cleans up backend data.
   * @precondition Caller must reauthenticate the user before invoking
   * this method. This is handled by useDeleteAccount.js composable.
   * @param {Object} payload - Deletion payload
   * @param {Object} payload.user - Firebase auth user (already reauthenticated)
   * @returns {Promise}
   */
  async deleteAuth(payload) {
    const { user } = payload

    if (!user) throw new Error('No user provided')

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

  async sendVerificationEmail(email, userName) {
    try {
      const emailController = new EmailController()
      await emailController.send({
        to: email,
        subject: 'Verify Your Email Address',
        template: 'emailVerification',
        data: {
          userName: userName || email,
        },
      })
    } catch (err) {
      throw err
    }
  }
}
