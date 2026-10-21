/**
 * Auth Store Module
 * @module Auth
 */

import AuthController from '@/features/auth/controllers/AuthController.js'
import UserController from '@/features/auth/controllers/UserController'
import User from '@/features/auth/models/UserModel'
import i18n from '@/app/plugins/i18n'
import { showError } from '@/shared/utils/toast'
import { cleanupStudyLoggingForOwner } from '@/shared/services/studyLoggingClient'
import { requestStudyLoggingLogout } from '@/shared/services/studyLoggingRuntime'

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
      if (user.isFallback) return null

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

    async signin({ commit, dispatch }, payload) {
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

        dispatch('subscribeToNotifications', user.uid)
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
    async signInWithGoogle({ commit, dispatch }, payload) {
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
        dispatch('subscribeToNotifications', user.uid)
      } catch (err) {
        const silentErrors = [
          'auth/popup-closed-by-user',
          'auth/cancelled-popup-request',
        ]
        if (!silentErrors.includes(err.code)) {
          commit('SET_TOAST', {
            message: i18n.global.t('errors.globalError'),
            type: 'error',
          })
        }
        throw err
      } finally {
        commit('setLoading', false)
      }
    },

    async logout({ commit, state, dispatch }, { silent = false } = {}) {
      try {
        const ownerUid = state.user?.id
        requestStudyLoggingLogout(ownerUid)
        if (dispatch) {
          await dispatch('unsubscribeFromNotifications')
        }
        await authController.signOut()
        await cleanupStudyLoggingForOwner(ownerUid)
        if (!state.user || state.user.id === ownerUid) {
          commit('SET_USER', null)
        }

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

    async autoSignIn({ commit, state, dispatch }, { signal } = {}) {
      try {
        const user = await authController.autoSignIn()
        if (signal?.aborted || !user) return

        // Anonymous participants (links without login) have no profile in
        // Firestore. Return the Firebase user so the router guard can
        // distinguish "anonymous but authenticated" from "not authenticated".
        if (user.isAnonymous) {
          return user
        }

        // Check if email is verified
        if (!user.emailVerified) {
          // User is logged in but email not verified
          // Don't set them as fully authenticated, but allow access to verify-email page
          return user
        }

        // Fetch the Firestore profile, retrying once on transient failure.
        // A permission-denied error is permanent and must not be retried.
        let dbUser = null
        try {
          dbUser = await userController.getById(user.uid)
        } catch (error) {
          if (signal?.aborted) return null
          if (error?.code === 'permission-denied') {
            commit('SET_USER', null)
            commit('SET_TOAST', {
              message: i18n.global.t('errors.globalError'),
              type: 'error',
            })
            await authController.signOut()
            return null
          }

          // One retry: transient network issues (Wi-Fi reconnect after laptop
          // sleep, mobile connectivity blip) resolve within a few seconds.
          try {
            await new Promise((r) => setTimeout(r, 1500))
            if (signal?.aborted) return null
            dbUser = await userController.getById(user.uid)
          } catch {
            if (signal?.aborted) return null
            // Still failing — do NOT clear the store.
            // Preserve the existing profile state if already loaded for this user.
            // Otherwise, keep the session recognizable but unverified and
            // unauthorized until the Firestore profile can be loaded.
            if (state?.user?.id !== user.uid) {
              const fallbackUser = new User({
                id: user.uid,
                email: user.email,
                username: user.displayName || '',
                accessLevel: 1,
              })
              fallbackUser.isFallback = true
              commit('SET_USER', fallbackUser)
            }
            return user
          }
        }

        if (signal?.aborted) return null
        commit('SET_USER', dbUser)
        dispatch('subscribeToNotifications', user.uid)
        return user
      } catch (e) {
        if (signal?.aborted) return null
        // Only toast if autoSignIn itself fails (e.g., persistent listener
        // unexpected failure). Don't return e: callers must not treat an
        // Error object as a truthy user.
        commit('SET_TOAST', {
          message: i18n.global.t('errors.globalError'),
          type: 'error',
        })
        throw e
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
      const { user } = payload
      commit('setLoading', true)
      try {
        // Server-side function deletes Firestore data + Firebase Auth user.
        // If this throws, do not proceed — state is unchanged.
        await authController.deleteUserData(user.uid)
        // State (SET_USER null) is handled by the logout action called after this.
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

    async findUserByEmail(_, { email }) {
      return userController.findByEmail(email)
    },
  },
}
