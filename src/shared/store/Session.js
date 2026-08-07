/**
 * Session Store Module
 * @module Session
 */

import SessionController from '@/shared/controllers/SessionController'
import EmailController from '@/shared/controllers/EmailController'
import Notification from '@/shared/models/Notification'
import { formatDateTime } from '../utils/dateUtils'
import i18n from '@/app/plugins/i18n'

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

    setLoading(state, loading) {
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
    async createSession({ commit, dispatch }, payload) {
      commit('setLoading', true)

      try {
        const result = await new SessionController().createSession({
          ...payload,
          session: enrichSession(payload.session),
        })

        if (!result.success) {
          throw result.error
        }

        const session = result.session

        await dispatch('notifySessionMembers', {
          session,
          studyId: payload.studyId,
          studyTitle: payload.study.testTitle,
          scheduledAt: formatDateTime(
            session.scheduledAt,
            i18n.global.locale.value,
          ),
          members: [...(session.staff || []), ...(session.participants || [])],
        })

        return session
      } catch (error) {
        commit('setError', {
          errorCode: 'sessionCreationError',
          message: error,
        })

        throw error
      } finally {
        commit('setLoading', false)
      }
    },

    /**
     * Load sessions from study
     *
     * @param {string} studyId
     */
    async fetchSessions({ commit }, studyId) {
      commit('setLoading', true)

      try {
        const result = await new SessionController().getSessions({
          studyId,
        })

        if (!result.success) {
          throw result.error
        }

        commit('SET_SESSIONS', result.sessions)

        return result.sessions
      } catch (error) {
        commit('setError', {
          errorCode: 'sessionFetchError',
          message: error,
        })

        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    /**
     * Update session
     */
    async updateSession({ state, commit, dispatch }, payload) {
      commit('setLoading', true)

      try {
        const previousSession = state.sessions.find(
          (item) => item.id === payload.sessionId,
        )

        const result = await new SessionController().updateSession({
          ...payload,
          session: enrichSession(payload.session),
        })
        if (!result.success) {
          throw result.error
        }

        const oldMembers = [
          ...(previousSession?.staff || []),
          ...(previousSession?.participants || []),
        ]

        const newMembers = [
          ...(payload.session.staff || []),
          ...(payload.session.participants || []),
        ]

        const addedMembers = newMembers.filter(
          (member) => !oldMembers.some((old) => old.email === member.email),
        )

        if (addedMembers.length) {
          await dispatch('notifySessionMembers', {
            session: {
              id: payload.sessionId,
              title: payload.session.title,
              message: payload.session.message,
            },
            studyId: payload.studyId,
            studyTitle: payload.study.testTitle,
            scheduledAt: formatDateTime(
              payload.session.scheduledAt,
              i18n.global.locale.value,
            ),
            members: addedMembers,
          })
        }

        return result
      } catch (error) {
        commit('setError', {
          errorCode: 'sessionUpdateError',
          message: error,
        })

        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    /**
     * Delete session
     */
    async deleteSession({ commit }, payload) {
      commit('setLoading', true)

      try {
        const result = await new SessionController().deleteSession(payload)

        if (!result.success) {
          throw result.error
        }

        commit('REMOVE_SESSION', payload.sessionId)
      } catch (error) {
        commit('setError', {
          errorCode: 'sessionDeletionError',
          message: error,
        })

        throw error
      } finally {
        commit('setLoading', false)
      }
    } /**
     * Sends a message to session members.
     */,
    async sendMessageSessionMembers(
      { state, getters, dispatch, commit },
      payload,
    ) {
      commit('setLoading', true)

      try {
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
        commit('setError', {
          errorCode: 'sessionMessageError',
          message: error,
        })

        throw error
      } finally {
        commit('setLoading', false)
      }
    },

    async notifySessionMembers(
      { getters, dispatch },
      { session, members, studyId, studyTitle, scheduledAt },
    ) {
      const user = getters.user
      const author = `${user.username || ''} ${user.email}`
      const sessionLink = `${window.location.origin}/testview/${studyId}/${session.id}`

      const emailController = new EmailController()

      const uniqueMembers = members.filter(
        (member, index, array) =>
          array.findIndex((item) => item.email === member.email) === index,
      )

      await Promise.all(
        uniqueMembers.map(async (member) => {
          const promises = []

          if (member.userDocId) {
            promises.push(
              dispatch('addNotification', {
                userId: member.userDocId,
                notification: new Notification({
                  title: session.title,
                  description: session.message,
                  author,
                  redirectsTo: sessionLink,
                  testId: studyId,
                  type: 'Session',
                  read: false,
                }),
              }),
            )
          }

          if (member.email) {
            promises.push(
              emailController.send({
                to: member.email,
                subject: session.title,
                attachments: [],
                template: 'session-invite',
                data: {
                  participantName: member.email,
                  studyTitle,
                  sessionTitle: session.title,
                  sessionMessage: session.message,
                  scheduledAt,
                  sessionLink: sessionLink,
                  invitedBy: author,
                },
              }),
            )
          }

          await Promise.all(promises)
        }),
      )
    },
    /**
     * Load sessions where the current user was invited.
     */
    async fetchUserSessions({ getters, commit }) {
      commit('setLoading', true)

      try {
        const user = getters.user

        const result = await new SessionController().getInvitedSessions({
          email: user.email,
          userId: user.id,
        })

        if (!result.success) {
          throw result.error
        }

        commit('SET_SESSIONS', result.sessions)

        return result.sessions
      } catch (error) {
        commit('setError', {
          errorCode: 'sessionFetchError',
          message: error,
        })

        throw error
      } finally {
        commit('setLoading', false)
      }
    },
  },
}

function enrichSession(session) {
  return {
    ...session,

    staffIds: [
      ...new Set(
        (session.staff || []).map((staff) => staff.userDocId).filter(Boolean),
      ),
    ],

    participantEmails: [
      ...new Set(
        (session.participants || [])
          .map((participant) => participant.email?.trim().toLowerCase())
          .filter(Boolean),
      ),
    ],
  }
}
