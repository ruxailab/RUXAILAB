/**
 * Auth Store Module
 * @module Auth
 */

import AuthController from '@/features/auth/controllers/AuthController.js'
import UserController from '@/features/auth/controllers/UserController'
import i18n from '@/app/plugins/i18n'
import { showError } from '@/shared/utils/toast'

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
      const coopsInfo = test.cooperators?.find(
        (coops) => coops.userDocId === user.id,
      )
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
      try {
        const { user } = await authController.signUp(
          payload.email,
          payload.password,
        )
        await userController.create({ id: user.uid, email: user.email })
        commit('SET_TOAST', {
          message: i18n.global.t('auth.signupSuccess'),
          type: 'success',
        })
      } catch (err) {
        commit('SET_TOAST', {
          message: i18n.global.t('errors.globalError'),
          type: 'error',
        })
        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async signin({ commit }, payload) {
      commit('setLoading', true)

      try {
        // Parallel execution: sign in and prepare for user fetch
        const { user } = await authController.signIn(
          payload.email,
          payload.password,
          payload.rememberMe,
        )

        // Fetch only essential user data (not full profile with studies)
        const dbUser = await userController.getById(user.uid)

        commit('SET_USER', dbUser)

        commit('SET_TOAST', {
          message: i18n.global.t('auth.loginSuccess'),
          type: 'success',
        })
      } catch (err) {
        showError('errors.incorrectCredential')
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
    async signInWithGoogle({ commit }, payload) {
      try {
        const { user } = await authController.signInWithGoogle(
          payload.rememberMe,
        )

        // Check if user exists and create if needed - optimized
        let dbUser = null
        try {
          dbUser = await userController.getById(user.uid)
        } catch (error) {
          // User doesn't exist, create minimal profile
          await userController.create({
            id: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            profileImage: user.photoURL || '',
            createdAt: new Date().toISOString(),
            authProvider: 'google',
          })
          // Fetch the newly created user
          dbUser = await userController.getById(user.uid)
        }

        commit('SET_USER', dbUser)
        commit('SET_TOAST', {
          message: i18n.global.t('auth.loginSuccess'),
          type: 'success',
        })
      } catch (err) {
        commit('SET_TOAST', {
          message: i18n.global.t('errors.globalError'),
          type: 'error',
        })
        throw err
      }
    },

    /**
     * Lazy load user studies (tests and answers)
     * Call this when you actually need the full user data with studies
     * @action loadUserStudies
     * @returns {void}
     */
    async loadUserStudies({ commit, state }) {
      if (!state.user) return

      try {
        const userWithStudies = await userController.getUserWithStudies(state.user.id)
        commit('SET_USER', userWithStudies)
      } catch (error) {
        console.error('Error loading user studies:', error)
      }
    },

    async logout({ commit }) {
      try {
        await authController.signOut()
        commit('SET_USER', null)
        commit('SET_TOAST', {
          message: i18n.global.t('auth.logoutSuccess'),
          type: 'success',
        })
      } catch (err) {
        console.error(err)
        commit('SET_TOAST', {
          message: i18n.global.t('errors.globalError'),
          type: 'error',
        })
      } finally {
        commit('setLoading', false)
      }
    },

    async autoSignIn({ commit }) {
      try {
        const user = await authController.autoSignIn()
        if (!user) return

        // Only fetch basic user data, not full studies
        const dbUser = await userController.getById(user.uid)
        commit('SET_USER', dbUser)
      } catch (e) {
        console.error(e)
        // Don't show error toast for auto sign-in failures
        console.log('Auto sign-in failed, user needs to log in manually')
      }
    },

    async resetPassword({ commit }, payload) {
      commit('setLoading', true)
      try {
        await authController.resetPassword(payload.email)
        commit('SET_TOAST', {
          message: i18n.global.t('auth.resetPasswordSuccess'),
          type: 'success',
        })
      } catch (err) {
        let errorMsg = i18n.global.t('errors.globalError')
        if (err.code === 'auth/invalid-email') {
          errorMsg = i18n.global.t('errors.invalidEmail')
        }
        commit('SET_TOAST', {
          message: errorMsg,
          type: 'error',
        })
      } finally {
        commit('setLoading', false)
      }
    },

    async deleteAuth({ commit }, payload) {
      commit('setLoading', true)
      try {
        await authController.deleteAuth(payload)
        commit('SET_USER', null)
        commit('SET_TOAST', {
          message: i18n.global.t('auth.deleteSuccess'),
          type: 'success',
        })
      } catch (err) {
        console.error('Error deleting user:', err)
        commit('SET_TOAST', {
          message: i18n.global.t('errors.globalError'),
          type: 'error',
        })
      } finally {
        commit('setLoading', false)
      }
    },
  },
}
