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

const mockUser = {
  id: 'mock-admin',
  email: 'admin@ruxailab.com',
  username: 'Mock Admin',
  accessLevel: 0,
  emailVerified: true,
  notifications: [],
  myAnswers: {},
  myTests: {},
  storageUsageMB: 0,
}

export default {
  state: {
    user: mockUser,
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
        const normalizedEmail = payload.email?.trim().toLowerCase()
        const { user } = await authController.signUp(
          normalizedEmail,
          payload.password,
        )
        await userController.create({
          id: user.uid,
          email: user.email || normalizedEmail,
        })

        // Send verification email
        try {
          await authController.sendVerificationEmail(user.email, user.email)
        } catch {}

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
        const normalizedEmail = payload.email?.trim().toLowerCase()
        const { user } = await authController.signIn(
          normalizedEmail,
          payload.password,
          payload.rememberMe,
        )

        // Check if email is verified
        if (!user.emailVerified) {
          commit('SET_TOAST', {
            message: i18n.global.t('auth.emailNotVerified'),
            type: 'warning',
          })
          throw new Error('EMAIL_NOT_VERIFIED')
        }

        const dbUser = await userController.getById(user.uid)

        commit('SET_USER', dbUser)

        commit('SET_TOAST', {
          message: i18n.global.t('auth.loginSuccess'),
          type: 'success',
        })
      } catch (err) {
        if (err.message === 'EMAIL_NOT_VERIFIED') {
          throw err
        }
        showError('errors.incorrectCredential')
        return err
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

        // Check if user already exists in database
        let dbUser = null
        try {
          dbUser = await userController.getById(user.uid)
        } catch {
          // User doesn't exist in DB, will be created below
        }

        // Create user if they don't exist yet
        if (!dbUser || !dbUser.email) {
          await userController.create({
            id: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            profileImage: user.photoURL || '',
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
        if (err.message === 'EMAIL_NOT_VERIFIED') {
          throw err
        }
        commit('SET_TOAST', {
          message: i18n.global.t('errors.globalError'),
          type: 'error',
        })
        throw err
      }
    },

    async logout({ commit }, { silent = false } = {}) {
      try {
        await authController.signOut()
        commit('SET_USER', null)

        if (!silent) {
          commit('SET_TOAST', {
            message: i18n.global.t('auth.logoutSuccess'),
            type: 'success',
          })
        }
      } catch (err) {
        if (!silent) {
          commit('SET_TOAST', {
            message: i18n.global.t('errors.globalError'),
            type: 'error',
          })
        }
        return err
      } finally {
        commit('setLoading', false)
      }
    },

    async autoSignIn({ commit }) {
      // Use mock user to skip login in development
      commit('SET_USER', mockUser)
      return mockUser
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
        // Store handles state management
        await authController.signOut()
        commit('SET_USER', null)
      } catch (err) {
        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async sendVerificationEmail({ commit }, { email, userName }) {
      try {
        await authController.sendVerificationEmail(email, userName)
        commit('SET_TOAST', {
          message: i18n.global.t('auth.verificationEmailSent'),
          type: 'success',
        })
      } catch (err) {
        commit('SET_TOAST', {
          message: i18n.global.t('auth.errorSendingVerification'),
          type: 'error',
        })
        throw err
      }
    },
  },
}
