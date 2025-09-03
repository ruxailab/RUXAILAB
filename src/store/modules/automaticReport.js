import { fetchReportByTestId } from '@/controllers/AccessibilityReportController';

const state = () => ({
    report: null,
    isLoading: false,
    error: null
});

const mutations = {
    SET_REPORT(state, report) {
        state.report = report;
    },
    SET_LOADING(state, isLoading) {
        state.isLoading = isLoading;
    },
    SET_ERROR(state, error) {
        state.error = error;
    }
};

const actions = {
    async fetchReport({ commit }, testId) {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        try {
            const report = await fetchReportByTestId(testId);
            if (!report) throw new Error('No report found for this test');
            commit('SET_REPORT', report);
        } catch (error) {
            commit('SET_ERROR', error.message || 'Failed to load the accessibility report');
            commit('SET_REPORT', null);
        } finally {
            commit('SET_LOADING', false);
        }
    }
};

const getters = {
    report: state => state.report,
    isLoading: state => state.isLoading,
    error: state => state.error
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
