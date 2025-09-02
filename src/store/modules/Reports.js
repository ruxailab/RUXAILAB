/**
 * Reports store module
 * @module Reports
 */

export default {
  state: {
    reports: null,
  },
  getters: {
    reports(state) {
      return state.reports
    },
  },
  mutations: {
    setReports(state, payload) {
      state.reports = payload
    },
  },
  actions: {
    /**
     * This action obtains the complete report document,
     * using the generic action "getObject", passing the report data
     *
     * @action getReports=setReports
     * @param {object} payload - data to get a report
     * @param {string} payload.id - report identification
     * @returns {void}
     */
    async getReports({ dispatch, commit }, payload) {
      commit('setLoading', true)
      payload = Object.assign(payload, { collection: 'reports' })

      const reps = await dispatch('getObject', payload).catch((err) =>
        commit('setError', { errorCode: 'reportError', message: err }),
      )
      commit('setReports', reps)
    },
    /**
     * This action updates a report, using the generic action "updateObject",
     * passing the updated report data
     *
     * @action updateTestReport
     * @param {object} payload - data to update a report
     * @param {string} payload.docId - report identification
     * @param {object} payload.data - reports data
     * @param {object} payload.data.test - header with test data to which the report belongs
     * @param {string} payload.data.test.id - the test identification
     * @param {string} payload.data.test.title - the test title
     * @param {string} payload.data.test.type - the test type
     * @param {string} payload.data.test.answers - the answers' document  identification in collection
     * @param {object[]} payload.data.reports - logs issued by test evaluators
     * @param {string} payload.data.reports[].uid - evaluator identification
     * @param {string} payload.data.reports[].email - evaluator email
     * @param {object} payload.data.reports[].log - evaluator's process data in the test
     * @param {Date} payload.data.reports[].log.date - last update date
     * @param {number} payload.data.reports[].log.progress - percentage of test progress
     * @param {string} payload.data.reports[].log.status - test status
     */
    updateTestReport({ dispatch, commit }, payload) {
      commit('setLoading', true)
      payload = Object.assign(payload, { collection: 'reports' })

      dispatch('updateObject', payload).catch((err) =>
        commit('setError', {
          errorCode: 'reportError',
          message: err,
        }),
      )
    },
    /**
     *
     * this action removes an evaluator log in the report,
     * using the generic action "removeObject", passing the report data
     *
     * @action removeReport
     * @param {object} payload - data to remove a report log
     * @param {string} payload.docId - report identification
     * @param {object} payload.element -  evaluator data
     * @param {string} payload.element.id - evaluator identification
     * @param {string} payload.param - field where to find the evaluator log
     * @returns {void}
     */
    removeReport({ dispatch, commit }, payload) {
      commit('setLoading', true)
      payload = Object.assign(payload, { collection: 'reports' })

      dispatch('removeObject', payload).catch((err) =>
        commit('setError', { errorCode: 'reportError', message: err }),
      )
    },
  },
}
