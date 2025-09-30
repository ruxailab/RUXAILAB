import {
    fetchReportByTestId,
    saveAccessibilityAssessment,
    fetchAssessmentByTestId,
    fetchAssessmentById
} from '@/ux/accessibility/controllers/AccessibilityReportController';

const state = () => ({
    report: null,
    assessmentId: null
});

const mutations = {
    SET_REPORT(state, report) {
        state.report = report;
    },
    SET_ASSESSMENT_ID(state, assessmentId) {
        state.assessmentId = assessmentId;
    },
    CLEAR_REPORT(state) {
        state.report = null;
        state.assessmentId = null;
    }
};

const actions = {
    /**
     * Saves accessibility test results and updates the study with assessment ID
     * @param {Object} context - Vuex context
     * @param {Object} payload - { testData, testId }
     */
    async saveAssessment({ commit, dispatch }, { testData, testId }) {
        commit('setLoading', true, { root: true });
        try {
            // Save assessment to autoassessment collection
            const assessmentId = await saveAccessibilityAssessment(testData, testId);
            commit('SET_ASSESSMENT_ID', assessmentId);

            // Update the study with the assessment ID
            await dispatch('updateStudy', {
                id: testId,
                assessmentId: assessmentId
            }, { root: true });

            // Set the report data for immediate use
            const reportData = {
                id: assessmentId,
                testId: testId,
                ReportId: testId,
                ReportUrl: testData.url,
                ReportDateTime: testData.testDateTime,
                ReportIssues: testData.issues || [],
                issueCount: testData.issueCount || 0,
                documentTitle: testData.documentTitle || '',
                success: testData.success,
                message: testData.message
            };
            commit('SET_REPORT', reportData);

            return assessmentId;
        } catch (error) {
            commit('setError', {
                errorCode: 'ASSESSMENT_SAVE_ERROR',
                message: error.message || 'Failed to save accessibility assessment'
            }, { root: true });
            throw error;
        } finally {
            commit('setLoading', false, { root: true });
        }
    },

    /**
     * Fetches accessibility report by test ID
     * First tries the new autoassessment collection, then falls back to old report collection
     * @param {Object} context - Vuex context
     * @param {string} testId - The test ID
     */
    async fetchReport({ commit }, testId) {
        commit('setLoading', true, { root: true });
        try {
            // First try to fetch from new autoassessment collection
            let report = await fetchAssessmentByTestId(testId);

            // If not found, try the old report collection for backward compatibility
            if (!report) {
                report = await fetchReportByTestId(testId);
            }

            if (!report) {
                throw new Error('No report found for this test');
            }

            commit('SET_REPORT', report);
            if (report.id) {
                commit('SET_ASSESSMENT_ID', report.id);
            }
        } catch (error) {
            commit('setError', {
                errorCode: 'REPORT_FETCH_ERROR',
                message: error.message || 'Failed to load the accessibility report'
            }, { root: true });
            commit('SET_REPORT', null);
        } finally {
            commit('setLoading', false, { root: true });
        }
    },

    /**
     * Fetches accessibility report by assessment document ID
     * @param {Object} context - Vuex context
     * @param {string} assessmentId - The assessment document ID
     */
    async fetchReportById({ commit }, assessmentId) {
        commit('setLoading', true, { root: true });
        try {
            const report = await fetchAssessmentById(assessmentId);

            if (!report) {
                throw new Error('No assessment found with this ID');
            }

            commit('SET_REPORT', report);
            commit('SET_ASSESSMENT_ID', assessmentId);
        } catch (error) {
            commit('setError', {
                errorCode: 'REPORT_FETCH_ERROR',
                message: error.message || 'Failed to load the accessibility report'
            }, { root: true });
            commit('SET_REPORT', null);
        } finally {
            commit('setLoading', false, { root: true });
        }
    },

    /**
     * Clears the current report data
     * @param {Object} context - Vuex context
     */
    clearReport({ commit }) {
        commit('CLEAR_REPORT');
    }
};

const getters = {
    report: state => state.report,
    assessmentId: state => state.assessmentId,
    hasReport: state => !!state.report,
    issuesSummary: state => {
        if (!state.report || !state.report.ReportIssues) {
            return { errors: 0, warnings: 0, notices: 0, total: 0 };
        }

        const issues = state.report.ReportIssues;
        return {
            errors: issues.filter(issue => issue.type === 'error').length,
            warnings: issues.filter(issue => issue.type === 'warning').length,
            notices: issues.filter(issue => issue.type === 'notice').length,
            total: issues.length
        };
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
