/**
 * Session Store Module
 * @module Session
 */

import i18n from '@/app/plugins/i18n'
import SessionController from '@/shared/controllers/SessionController'
import EmailController from '@/shared/controllers/EmailController'
import Notification from '@/shared/models/Notification'

const t = i18n.global.t

export default {
  state: {
    module: 'session',

    sessions: [],

    loading: false,
  },

  getters: {
    sessions: (state) => state.sessions,

    sessionsLoading: (state) => state.loading,
  },

  mutations: {
    SET_SESSIONS(state, sessions) {
      state.sessions = sessions
    },

    REMOVE_SESSION(state, sessionId) {
      state.sessions = state.sessions.filter(
        (session) => session.id !== sessionId,
      )
    },

    SET_LOADING(state, loading) {
      state.loading = loading
    },
  },

  actions: {
    /**
     * Create a new session
     *
     * @param {Object} payload
     * @param {string} payload.studyId
     * @param {Object} payload.session
     */
    async createSession({ commit }, payload) {
      try {
        commit('SET_LOADING', true)

        const result = await new SessionController().createSession(payload)

        if (!result.success) {
          throw result.error
        }

        return result.session
      } catch (error) {
        console.error('createSession error:', error)

        throw new Error(error.message || t('Sessions.error.createFailed'))
      } finally {
        commit('SET_LOADING', false)
      }
    },

    /**
     * Load sessions from study
     *
     * @param {string} studyId
     */
    async fetchSessions({ commit }, studyId) {
      try {
        commit('SET_LOADING', true)

        const result = await new SessionController().getSessions({
          studyId,
        })

        if (!result.success) {
          throw result.error
        }

        commit('SET_SESSIONS', result.sessions)

        return result.sessions
      } catch (error) {
        console.error('fetchSessions error:', error)

        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    /**
     * Update session
     */
    async updateSession({ commit }, payload) {
      try {
        commit('SET_LOADING', true)

        const result = await new SessionController().updateSession(payload)

        if (!result.success) {
          throw result.error
        }

        return result
      } catch (error) {
        console.error('updateSession error:', error)

        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    /**
     * Delete session
     */
    async deleteSession({ commit }, payload) {
      try {
        const result = await new SessionController().deleteSession(payload)

        if (!result.success) {
          throw result.error
        }

        commit('REMOVE_SESSION', payload.sessionId)
      } catch (error) {
        console.error('deleteSession error:', error)

        throw error
      }
    },

    /**
     * Sends a message to session members.
     */
    async sendMessageSessionMembers(
      { state, getters, dispatch, commit },
      payload,
    ) {
      try {
        commit('SET_LOADING', true)

        const session = state.sessions.find(
          (item) => item.id === payload.sessionId,
        )

        if (!session) {
          throw new Error('Session not found')
        }

        let members = []

        switch (payload.recipientType) {
          case 'STAFF':
            members = session.staff || []
            break

          case 'PARTICIPANTS':
            members = session.participants || []
            break

          case 'ALL':
            members = [
              ...(session.staff || []),
              ...(session.participants || []),
            ]
            break

          case 'SPECIFIC':
            members = payload.members || []
            break

          default:
            members = []
        }

        // Remove duplicate recipients by email
        members = members.filter(
          (member, index, array) =>
            array.findIndex((item) => item.email === member.email) === index,
        )

        const user = getters.user
        const author = user?.email || ''

        const emailController = new EmailController()

        await Promise.all(
          members.map(async (member) => {
            const promises = []

            if (member.userDocId) {
              promises.push(
                dispatch('addNotification', {
                  userId: member.userDocId,
                  notification: new Notification({
                    title: session.title || 'Session message',
                    description: payload.message,
                    author,
                    redirectsTo: null,
                    testId: payload.studyId,
                    type: 'Message',
                    read: false,
                  }),
                }),
              )
            }

            if (member.email) {
              promises.push(
                emailController.send({
                  to: member.email,
                  subject: session.title || 'Session message',
                  attachments: [],
                  template: 'message',
                  data: {
                    message: payload.message,
                    sessionTitle: session.title,
                    sessionId: session.id,
                    studyId: payload.studyId,
                  },
                }),
              )
            }

            await Promise.all(promises)
          }),
        )

        return true
      } catch (error) {
        console.error('sendMessageSessionMembers error:', error)

        throw new Error(error.message || t('Sessions.error.sendMessageFailed'))
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },
}
