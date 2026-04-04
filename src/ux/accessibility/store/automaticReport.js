import { fetchReportByTestId } from '@/ux/accessibility/controllers/AccessibilityReportController'

/**
 * Converts a raw issue (axe-core or pa11y format) to the canonical UI shape:
 * { type: 'error'|'warning'|'notice', code: string, ...rest }
 */
function normalizeIssue(raw) {
  if (!raw) return raw
  // Already in pa11y canonical format
  if (raw.type && !raw.impact) return raw

  // axe-core impact → canonical type
  const impactToType = {
    critical: 'error',
    serious: 'warning',
    moderate: 'warning',
    minor: 'notice',
  }

  return {
    ...raw,
    type: impactToType[raw.impact] ?? 'notice',
    code: raw.rule ?? raw.wcag ?? '',
  }
}

const state = () => ({
  report: null,
})

const mutations = {
  SET_REPORT(state, report) {
    state.report = report
  },
}

const actions = {
  async fetchReport({ commit }, testId) {
    commit('setLoading', true, { root: true })
    try {
      const report = await fetchReportByTestId(testId)
      if (!report) throw new Error('No report found for this test')

      if (Array.isArray(report.ReportIssues)) {
        report.ReportIssues = report.ReportIssues.map(normalizeIssue)
      }

      commit('SET_REPORT', report)
    } catch (error) {
      commit(
        'setError',
        {
          errorCode: 'REPORT_FETCH_ERROR',
          message: error.message || 'Failed to load the accessibility report',
        },
        { root: true },
      )
      commit('SET_REPORT', null)
    } finally {
      commit('setLoading', false, { root: true })
    }
  },
}

const getters = {
  report: (state) => state.report,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
