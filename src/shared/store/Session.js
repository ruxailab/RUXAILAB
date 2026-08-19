/**
 * Session Store Module
 * @module Session
 */

import SessionController from '@/shared/controllers/SessionController'
import EmailController from '@/shared/controllers/EmailController'
import Notification from '@/shared/models/Notification'
import { formatDateTime } from '../utils/dateUtils'
import i18n from '@/app/plugins/i18n'

const t = i18n.global.t

export default {
  state: {
    module: 'session',

    sessions: [],

    loading: false,

    session: null,
  },

  getters: {
    sessions: (state) => state.sessions,

    sessionsLoading: (state) => state.loading,

    session: (state) => state.session,
  },

  mutations: {
    SET_SESSIONS(state, sessions) {
      state.sessions = sessions
    },

    SET_SESSION(state, session) {
      state.session = session
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
          members: [
            ...(session.staff || []).map((member) => ({
              ...member,
              membershipType: 'cooperator',
            })),
            ...(session.participants || []).map((member) => ({
              ...member,
              membershipType: 'participant',
            })),
          ],
          event: 'invite',
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

        const previousScheduledAt = normalizeDate(previousSession?.scheduledAt)
        const newScheduledAt = normalizeDate(payload.session?.scheduledAt)

        const scheduleChanged =
          previousScheduledAt?.getTime() !== newScheduledAt?.getTime()

        const descriptionChanged =
          (previousSession?.message || '') !== (payload.session?.message || '')

        const sessionDetailsChanged = scheduleChanged || descriptionChanged

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
          ...(payload.session.staff || []).map((member) => ({
            ...member,
            membershipType: 'cooperator',
          })),
          ...(payload.session.participants || []).map((member) => ({
            ...member,
            membershipType: 'participant',
          })),
        ]

        const addedMembers = newMembers.filter(
          (member) => !oldMembers.some((old) => old.email === member.email),
        )

        if (sessionDetailsChanged) {
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
            members: newMembers,
            event: 'update',
          })
        } else if (addedMembers.length) {
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
            event: 'invite',
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
    },

    /**
     * Sends a message to session members.
     */
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

    /**
     * Sends session invitation/update notifications and emails.
     */
    async notifySessionMembers(
      { getters, dispatch },
      { session, members, studyId, studyTitle, scheduledAt, event = 'invite' },
    ) {
      const user = getters.user
      const author = `${user.username || ''} ${user.email}`.trim()
      const sessionLink = `${window.location.origin}/testview/${studyId}/${session.id}`

      const emailController = new EmailController()

      const uniqueMembers = members.filter(
        (member, index, array) =>
          array.findIndex((item) => item.email === member.email) === index,
      )

      await Promise.all(
        uniqueMembers.map(async (member) => {
          const { title, description } = getSessionTexts(
            event,
            member.membershipType,
            session.title,
          )

          const promises = []

          if (member.userDocId) {
            promises.push(
              dispatch('addNotification', {
                userId: member.userDocId,
                notification: new Notification({
                  title,
                  description,
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
                subject: title,
                attachments: [],
                template: 'session-invite',
                data: {
                  title,
                  description,
                  message: session.message,
                  participantName: member.name || member.email,
                  studyTitle,
                  sessionTitle: session.title,
                  sessionMessage: session.message,
                  scheduledAt,
                  sessionLink,
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

    async getSession({ commit }, { studyId, sessionId }) {
      commit('setLoading', true)

      try {
        const session = await new SessionController().getSession(
          studyId,
          sessionId,
        )

        commit('SET_SESSION', session)

        return session
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

const getSessionTexts = (event, membershipType, sessionTitle) => {
  const isParticipant = membershipType === 'participant'

  const texts = {
    invite: {
      title: isParticipant
        ? t('Sessions.notify.participantInviteTitle')
        : t('Sessions.notify.cooperatorInviteTitle'),

      description: isParticipant
        ? t('Sessions.notify.participantInviteMessage')
        : t('Sessions.notify.cooperatorInviteMessage'),
    },

    update: {
      title: t('Sessions.notify.updateTitle'),
      description: t('Sessions.notify.updateMessage'),
    },
  }

  const selectedTexts = texts[event] || texts.invite

  return {
    title: `${selectedTexts.title} · ${sessionTitle}`,
    description: selectedTexts.description,
  }
}

function normalizeDate(value) {
  if (!value) {
    return null
  }

  if (typeof value.toDate === 'function') {
    return value.toDate()
  }

  if (typeof value.toMillis === 'function') {
    return new Date(value.toMillis())
  }

  if (value instanceof Date) {
    return value
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
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
