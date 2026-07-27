/**
 * Session Store Module
 * @module Session
 */

import i18n from '@/app/plugins/i18n'
import SessionController from '@/shared/controllers/SessionController'

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

    ADD_SESSION(state, session) {
      state.sessions.push(session)
    },

    UPDATE_SESSION(state, session) {
      const index = state.sessions.findIndex((item) => item.id === session.id)

      if (index !== -1) {
        state.sessions.splice(index, 1, session)
      }
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

        commit('ADD_SESSION', result.session)

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
        const result = await new SessionController().updateSession(payload)

        if (!result.success) {
          throw result.error
        }

        commit('UPDATE_SESSION', {
          id: payload.sessionId,
          ...payload.data,
        })

        return result
      } catch (error) {
        console.error('updateSession error:', error)

        throw error
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
  },
}
