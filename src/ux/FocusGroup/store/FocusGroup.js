import FocusGroupController from '@/ux/FocusGroup/controllers/FocusGroupController'
import { deleteStudyStorageFile } from '@/shared/services/studyStorageService'
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

    /**
     * Persist the stimulus library immediately (not batched behind Save) so an
     * uploaded file is never left orphaned in Storage without a saved reference.
     */
    async updateStimuli({ commit, dispatch }, { studyId, stimuli }) {
      try {
        await focusGroupController.updateStimuli(studyId, stimuli)
        await dispatch('getStudy', { id: studyId })
      } catch (err) {
        commit('SET_TOAST', {
          message: i18n.global.t('errors.globalError'),
          type: 'error',
        })
        throw err
      }
    },

    /**
     * Remove a stimulus from the library. Link-only stimuli have no Storage
     * file to clean up; uploaded stimuli are deleted via the Cloud Function
     * proxy, matching the rest of the app's storage-delete flow.
     */
    async deleteStimulus({ commit, dispatch }, { studyId, stimulus, stimuli }) {
      try {
        if (stimulus.storagePath) {
          await deleteStudyStorageFile(studyId, stimulus.storagePath)
        }
        await focusGroupController.updateStimuli(studyId, stimuli)
        await dispatch('getStudy', { id: studyId })
      } catch (err) {
        commit('SET_TOAST', {
          message: i18n.global.t('errors.globalError'),
          type: 'error',
        })
        throw err
      }
    },
  },
}
