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
  browserSessionPersistence,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider
} from 'firebase/auth'
import { auth } from '@/app/plugins/firebase'
import axios from 'axios';
import EmailController from '@/shared/controllers/EmailController';
import UserController from '@/features/auth/controllers/UserController';

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
   * @throws {Error} - Throws error with specific message based on Firebase error code
   */
  async signIn(email, password, rememberMe) {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        throw new Error('Account does not exist');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-login-credentials') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email format');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled');
      } else {
        throw error;
      }
    }
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

  /**
   * Delete user account - handles reauthentication and deletion
   * @param {Object} user - Firebase auth user
   * @param {string} password - User password for reauthentication (optional, for email users)
   * @returns {Promise}
   * @throws {Error} - If deletion fails
   */
  async deleteUserAccount(user, password) {
    // Check if user has non-Google provider (email/password)
    const hasNonGoogleProvider = user.providerData.some(
      provider => provider.providerId !== 'google.com'
    );

    // Handle reauthentication based on provider type
    if (hasNonGoogleProvider) {
      // Email/password user - reauthenticate with password
      if (!password || password.trim() === '') {
        throw new Error('Password is required to delete your account');
      }
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    } else {
      // Google-only user - reauthenticate with Google popup
      const provider = new GoogleAuthProvider();
      try {
        await reauthenticateWithPopup(user, provider);
      } catch (err) {
        // If Google popup fails, provide user-friendly error
        if (err.code === 'auth/popup-closed-by-user') {
          throw new Error('Google authentication cancelled. Please try again.');
        }
        throw err;
      }
    }

    // Delete from Firebase Auth (critical step)
    await user.delete();

    // Delete from Firestore (non-critical, fail silently)
    try {
      const userController = new UserController();
      await userController.deleteUser(user.uid);
    } catch (firestoreError) {
      // Log but don't throw - account is already deleted from Firebase Auth
      console.warn('Warning: Could not delete Firestore data:', firestoreError);
    }

    // Clean up backend (non-critical)
    try {
      await this.deleteAuth(user.uid);
    } catch (err) {
      // Log but don't throw - account is already deleted
      console.warn('Warning: Could not delete backend data:', err);
    }
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
