import { fetchReportByTestId } from '@/ux/accessibility/controllers/AccessibilityReportController';

const state = () => ({
    report: null
});

const mutations = {
    SET_REPORT(state, report) {
        state.report = report;
    }
};

const actions = {
    async fetchReport({ commit }, testId) {
        commit('setLoading', true, { root: true });
        try {
            const report = await fetchReportByTestId(testId);
            if (!report) throw new Error('No report found for this test');
            commit('SET_REPORT', report);
        } catch (error) {
            commit('setError', {
                errorCode: 'REPORT_FETCH_ERROR',
                message: error.message || 'Failed to load the accessibility report'
            }, { root: true });
            commit('SET_REPORT', null);
        } finally {
            commit('setLoading', false, { root: true });
        }
    }
};

const getters = {
    report: state => state.report
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
