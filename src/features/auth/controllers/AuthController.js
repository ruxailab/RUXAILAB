import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	GoogleAuthProvider,
	signInWithPopup,
	sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from '@/app/plugins/firebase'

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
	async signIn(email, password) {
		return signInWithEmailAndPassword(auth, email, password)
	}

	/**
	 * Signs in a user with Google
	 * @returns {Promise} - Firebase auth user credential
	 */
	async signInWithGoogle() {
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
		return sendPasswordResetEmail(auth, email)
	}

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
				}
			)
		})
	}
}
