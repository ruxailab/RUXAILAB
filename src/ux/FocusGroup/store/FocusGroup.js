import FocusGroupController from '@/ux/FocusGroup/controllers/FocusGroupController'
import i18n from '@/app/plugins/i18n'

const focusGroupController = new FocusGroupController()

export default {
  state: {
    currentFocusGroup: null,
  },

  getters: {
    currentFocusGroup: (state) => state.currentFocusGroup,
  },

  mutations: {
    SET_FOCUS_GROUP(state, payload) {
      state.currentFocusGroup = payload
    },
  },

  actions: {
    async getFocusGroup({ commit }, id) {
      const study = await focusGroupController.getById(id)
      commit('SET_FOCUS_GROUP', study)
      return study
    },

    async endFocusGroupSession(_, { answersDocId, session }) {
      if (!answersDocId || !session?.sessionId) return
      await focusGroupController.saveSessionAnswer(answersDocId, session)
    },

    /**
     * Persist the Test screen in one go: the discussion guide and the session
     * configuration are edited together, so they are saved together.
     */
    async saveFocusGroupSettings(
      { commit },
      { studyId, discussionGuide, config },
    ) {
      commit('setLoading', true)
      try {
        await focusGroupController.updateDiscussionGuide(
          studyId,
          discussionGuide,
        )
        await focusGroupController.updateConfig(studyId, config)
        commit('SET_TOAST', {
          message: i18n.global.t('focusGroup.edit.saved'),
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
  },
}
