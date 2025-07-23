/**
 * Auth Store Module
 * @module Auth
 */

import AuthController from '@/controllers/AuthController.js'
import UserController from '@/controllers/UserController'
import i18n from '@/i18n'

const authController = new AuthController()
const userController = new UserController()

export default {
  state: {
    user: null,
  },

  getters: {
    user(state) {
      return state.user
    },

    getUserAccessLevel: (state) => (test) => {
      const { user } = state

      // Check if the user is defined
      if (!user) return 1

      // If the user is a superadmin
      if (user.accessLevel === 0) return 0

      // Check if the user is a test owner
      const isTestOwner = test.testAdmin?.userDocId === user.id
      if (isTestOwner) return 0

      // Check if the user is a cooperator and get their access level
      const coopsInfo = test.cooperators?.find((coops) => coops.userDocId === user.id)
      if (coopsInfo) return coopsInfo.accessLevel

      // Check if the test is public
      return test.isPublic ? 1 : 2
    },
  },

  mutations: {
    SET_USER(state, payload) {
      state.user = payload
    },
  },

  actions: {
    /**
     * This action register a User on the platform,
     * using the API and creates the observer for the User's metadata in the db
     * @action signup
     * @param {object} payload - Data to create a new User
     * @param {string} payload.email - the User email
     * @param {string} payload.password - the User password
     * @returns {void}
     */
    async signup({ commit }, payload) {
      commit('setLoading', true)
      try {
        const { user } = await authController.signUp(payload.email, payload.password)
        await userController.create({
          id: user.uid,
          email: user.email,
        })
        const dbUser = await userController.getById(user.uid)
        commit('SET_USER', dbUser)
      } catch (err) {
        commit('setError', { errorCode: 'FIREBASE', message: err.code })
        throw err // Rethrow the error so the caller knows signup failed
      } finally {
        commit('setLoading', false)
      }
    },

    async signin({ commit }, payload) {
      commit('setLoading', true)
      try {
        const { user } = await authController.signIn(payload.email, payload.password)
        if (user) {
          const dbUser = await userController.getById(user.uid)
          commit('SET_USER', dbUser)
        }
      } catch (err) {
        if (err.code === 'auth/invalid-email') {
          commit('setError', {
            errorCode: 'auth',
            message: i18n.global.t('errors.userNotExist'),
          })
        } else if (err.code === 'auth/wrong-password') {
          commit('setError', {
            errorCode: 'auth',
            message: i18n.global.t('errors.incorrectPassword'),
          })
        } else {
          commit('setError', {
            errorCode: 'auth',
            message: i18n.global.t('errors.incorrectCredential'),
          })
        }
        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    /**
 * Handle Google Authentication
 * @action signInWithGoogle
 * @returns {void}
 */
    async signInWithGoogle({ commit }) {
      commit('setLoading', true)
      try {
        const { user } = await authController.signInWithGoogle()

        // Check if user already exists in database
        let dbUser = null
        try {
          dbUser = await userController.getById(user.uid)
        } catch (error) {
          // User doesn't exist in DB, will be created below
          console.log('User not found in database, creating new profile')
        }

        // Create user if they don't exist yet
        if (!dbUser) {
          await userController.create({
            id: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            createdAt: new Date().toISOString(),
            authProvider: 'google',
          })
          dbUser = await userController.getById(user.uid)
        }

        commit('SET_USER', dbUser)
      } catch (err) {
        commit('setError', {
          errorCode: 'FIREBASE',
          message: err.code || 'Error during Google sign in'
        })
        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async logout({ commit }) {
      try {
        await authController.signOut()
        commit('SET_USER', null)
      } catch (err) {
        console.error(err)
        commit('setError', { errorCode: 'FIREBASE', message: err.code || 'Error during logout' })
      } finally {
        commit('setLoading', false)
      }
    },

    async autoSignIn({ commit }) {
      try {
        const user = await authController.autoSignIn()
        if (!user) return

        const dbUser = await userController.getById(user.uid)
        commit('SET_USER', dbUser)
      } catch (e) {
        console.error(e)
        commit('setError', { errorCode: 'FIREBASE', message: e.code || 'Error during auto sign in' })
      }
    },

    async resetPassword({ commit }, payload) {
      commit('setLoading', true)
      try {
        await authController.resetPassword(payload.email)
        //console.log("If this email is registered, you'll receive a reset link")
      } catch (err) {
        if (err.code === 'auth/invalid-email') {
          console.error('Error: Invalid email format')
        } else {
          console.error('Error sending password reset email:', err.message)
        }
      } finally {
        commit('setLoading', false)
      }
    },
  },
}
