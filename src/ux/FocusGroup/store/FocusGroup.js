import FocusGroupController from '@/ux/FocusGroup/controllers/FocusGroupController'
import { deleteStudyStorageFile } from '@/shared/services/studyStorageService'
import AnswerController from '@/shared/controllers/AnswerController'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'
import i18n from '@/app/plugins/i18n'

const focusGroupController = new FocusGroupController()
const answerController = new AnswerController()

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
     * Post-session review: read back every finished session's discussion,
     * notes, and (if recorded) video, plus the facilitator's theme board —
     * one read since both live on the same answers document.
     */
    async getFocusGroupSessionAnswers(_, answersDocId) {
      if (!answersDocId) return { sessions: {}, themes: [] }
      const answer = await answerController.getAnswerById(answersDocId)
      return { sessions: answer.sessions ?? {}, themes: answer.themes ?? [] }
    },

    /**
     * Persist the facilitator's manual theme board immediately (drag-and-drop
     * is a live edit, not batched behind a Save button).
     */
    async saveFocusGroupThemes(_, { answersDocId, themes }) {
      if (!answersDocId) return
      await focusGroupController.saveThemes(answersDocId, themes)
    },

    /**
     * Tier 1 ($0, always-available) NLP analysis for one finished session:
     * per-topic keywords/summary/consensus plus separate NLP theme
     * suggestions. Suggestions are not applied to the manual theme board
     * unless a facilitator explicitly adopts one. Runs server-side (facilitator-only,
     * enforced by the Cloud Function itself) and returns the full result so
     * the view can render immediately without a second read.
     */
    async runFocusGroupAnalysis({ commit }, { studyId, answersDocId, sessionId }) {
      if (!studyId || !answersDocId || !sessionId) return null
      try {
        const response = await FirebaseFunctionsController.callHttpsCallableFunction(
          'runFocusGroupAnalysis',
          { studyId, answersDocId, sessionId },
        )
        return response.data
      } catch (err) {
        commit('SET_TOAST', {
          message: i18n.global.t('errors.globalError'),
          type: 'error',
        })
        throw err
      }
    },

    async synthesizeFocusGroupAnalysis(
      { commit },
      { studyId, answersDocId, sessionId },
    ) {
      if (!studyId || !answersDocId || !sessionId) return null
      try {
        const response = await FirebaseFunctionsController.callHttpsCallableFunction(
          'synthesizeFocusGroupAnalysis',
          { studyId, answersDocId, sessionId },
        )
        return response.data
      } catch (err) {
        commit('SET_TOAST', {
          message: i18n.global.t('errors.globalError'),
          type: 'error',
        })
        throw err
      }
    },

    /** Persist only the generated synthesis text/metadata, never credentials. */
    async saveFocusGroupDeepAnalysis(_, { answersDocId, sessionId, deepAnalysis }) {
      if (!answersDocId || !sessionId) return
      await focusGroupController.saveDeepAnalysis(answersDocId, sessionId, deepAnalysis)
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
