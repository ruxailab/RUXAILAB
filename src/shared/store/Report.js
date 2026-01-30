/**
 * Reports store module
 * @module Reports
 */

import ReportController from '../controllers/ReportController'

const reportController = new ReportController()

export default {
  namespaced: true,

  actions: {
    /**
     * Removes an evaluator log from the report.
     *
     * @action removeReport
     * @param {object} context - Vuex context.
     * @param {object} payload - Data needed to remove a report log.
     * @param {object} payload.report - Report object.
     * @param {object} payload.test - Test object (needed for mapping).
     * @returns {Promise<void>}
     */
    async removeReport({ commit }, payload) {
      commit('setLoading', true)

      try {
        const result = await reportController.removeReport(payload)

        if (!result.success) {
          commit('setError', {
            errorCode: 'reportError',
            message: result.error,
          })
        }
      } catch (err) {
        commit('setError', { errorCode: 'reportError', message: err })
      } finally {
        commit('setLoading', false)
      }
    },
  },
}
