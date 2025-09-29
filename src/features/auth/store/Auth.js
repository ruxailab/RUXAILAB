/**
 * Auth Store Module
 * @module Auth
 */

import AuthController from '@/features/auth/controllers/AuthController.js'
import UserController from '@/features/auth/controllers/UserController'
import i18n from '@/app/plugins/i18n'
import { useToast } from 'vue-toastification'

const authController = new AuthController()
const userController = new UserController()

const toast = useToast()

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
      try {
        const { user } = await authController.signUp(payload.email, payload.password)
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
        await authController.signIn(payload.email, payload.password, payload.rememberMe)
      } catch (err) {
        toast.error(i18n.global.t('errors.incorrectCredential'))
      }
    },

    /**
 * Handle Google Authentication
 * @action signInWithGoogle
 * @returns {void}
 */
    async signInWithGoogle({ commit }, payload) {
      try {
        const { user } = await authController.signInWithGoogle(payload.rememberMe)

        // Check if user already exists in database
        let dbUser = null
        try {
          dbUser = await userController.getById(user.uid)
        } catch (error) {
          // User doesn't exist in DB, will be created below
          console.log('User not found in database, creating new profile')
        }

        // Create user if they don't exist yet
        if (!dbUser || !dbUser.email) {
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

        const dbUser = await userController.getById(user.uid)
        commit('SET_USER', dbUser)
        commit('SET_TOAST', {
          message: i18n.global.t('auth.loginSuccess'),
          type: 'success',
        })
      } catch (e) {
        console.error(e)
        commit('SET_TOAST', {
          message: i18n.global.t('errors.globalError'),
          type: 'error',
        })
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
        let errorMsg = i18n.global.t('errors.globalError');
        if (err.code === 'auth/invalid-email') {
          errorMsg = i18n.global.t('errors.invalidEmail');
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
    }
  },
}
