import AIAssistedResultController from '../controllers/AIAssistedResultController';

/**
 * Vuex store module for AI-assisted accessibility test results
 */
const state = {
    currentResult: null,
    loading: false,
    error: null,
    toolStatus: {
        chroma_check: false,
        anchor_sense: false,
        img_tip: false
    }
};

const getters = {
    /**
     * Get current result
     */
    currentResult: (state) => state.currentResult,

    /**
     * Check if loading
     */
    isLoading: (state) => state.loading,

    /**
     * Get error
     */
    error: (state) => state.error,

    /**
     * Get tool completion status
     */
    toolStatus: (state) => state.toolStatus,

    /**
     * Get completion percentage
     */
    completionPercentage: (state) => {
        if (!state.currentResult) return 0;
        return state.currentResult.getCompletionPercentage();
    },

    /**
     * Check if fully analyzed
     */
    isFullyAnalyzed: (state) => {
        if (!state.currentResult) return false;
        return state.currentResult.isFullyAnalyzed();
    },

    /**
     * Get total issues count
     */
    totalIssues: (state) => {
        if (!state.currentResult) return 0;
        return state.currentResult.totalIssues;
    },

    /**
     * Get ChromaCheck results
     */
    chromaCheckResults: (state) => {
        return state.currentResult?.chroma_check || null;
    },

    /**
     * Get AnchorSense results
     */
    anchorSenseResults: (state) => {
        return state.currentResult?.anchor_sense || null;
    },

    /**
     * Get ImgTagTip results
     */
    imgTipResults: (state) => {
        return state.currentResult?.img_tip || null;
    },

    /**
     * Get analysis summary
     */
    analysisSummary: (state) => {
        if (!state.currentResult) return null;
        return state.currentResult.getSummary();
    }
};

const mutations = {
    /**
     * Set current result
     */
    SET_CURRENT_RESULT(state, result) {
        state.currentResult = result;

        // Update tool status
        if (result) {
            state.toolStatus = {
                chroma_check: result.isToolCompleted('chroma_check'),
                anchor_sense: result.isToolCompleted('anchor_sense'),
                img_tip: result.isToolCompleted('img_tip')
            };
        }
    },

    /**
     * Set loading state
     */
    SET_LOADING(state, loading) {
        state.loading = loading;
    },

    /**
     * Set error
     */
    SET_ERROR(state, error) {
        state.error = error;
    },

    /**
     * Clear error
     */
    CLEAR_ERROR(state) {
        state.error = null;
    },

    /**
     * Clear current result
     */
    CLEAR_CURRENT_RESULT(state) {
        state.currentResult = null;
        state.toolStatus = {
            chroma_check: false,
            anchor_sense: false,
            img_tip: false
        };
    },

    /**
     * Update tool status
     */
    UPDATE_TOOL_STATUS(state, { tool, completed }) {
        state.toolStatus[tool] = completed;
    }
};

const actions = {
    /**
     * Load result by test ID
     */
    async loadResult({ commit }, testId) {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');

        try {
            const result = await AIAssistedResultController.getOrCreateResult(testId);
            commit('SET_CURRENT_RESULT', result);
            return result;
        } catch (error) {
            console.error('Error loading result:', error);
            commit('SET_ERROR', error.message);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },

    /**
     * Initialize result with input source
     */
    async initializeResult({ commit }, { testId, inputData }) {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');

        try {
            const result = await AIAssistedResultController.initializeResult(testId, inputData);
            commit('SET_CURRENT_RESULT', result);
            return result;
        } catch (error) {
            console.error('Error initializing result:', error);
            commit('SET_ERROR', error.message);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },

    /**
     * Save ChromaCheck results
     */
    async saveChromaCheckResult({ commit, state }, { testId, chromaData }) {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');

        try {
            const result = await AIAssistedResultController.saveChromaCheckResult(testId, chromaData);
            commit('SET_CURRENT_RESULT', result);
            commit('UPDATE_TOOL_STATUS', { tool: 'chroma_check', completed: true });
            return result;
        } catch (error) {
            console.error('Error saving ChromaCheck result:', error);
            commit('SET_ERROR', error.message);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },

    /**
     * Save AnchorSense results
     */
    async saveAnchorSenseResult({ commit }, { testId, anchorData }) {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');

        try {
            const result = await AIAssistedResultController.saveAnchorSenseResult(testId, anchorData);
            commit('SET_CURRENT_RESULT', result);
            commit('UPDATE_TOOL_STATUS', { tool: 'anchor_sense', completed: true });
            return result;
        } catch (error) {
            console.error('Error saving AnchorSense result:', error);
            commit('SET_ERROR', error.message);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },

    /**
     * Save ImgTagTip results
     */
    async saveImgTipResult({ commit }, { testId, imgTipData }) {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');

        try {
            const result = await AIAssistedResultController.saveImgTipResult(testId, imgTipData);
            commit('SET_CURRENT_RESULT', result);
            commit('UPDATE_TOOL_STATUS', { tool: 'img_tip', completed: true });
            return result;
        } catch (error) {
            console.error('Error saving ImgTagTip result:', error);
            commit('SET_ERROR', error.message);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },

    /**
     * Update input source
     */
    async updateInputSource({ commit }, { testId, inputData }) {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');

        try {
            const result = await AIAssistedResultController.updateInputSource(testId, inputData);
            commit('SET_CURRENT_RESULT', result);
            return result;
        } catch (error) {
            console.error('Error updating input source:', error);
            commit('SET_ERROR', error.message);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },

    /**
     * Delete result
     */
    async deleteResult({ commit }, testId) {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');

        try {
            await AIAssistedResultController.deleteResult(testId);
            commit('CLEAR_CURRENT_RESULT');
        } catch (error) {
            console.error('Error deleting result:', error);
            commit('SET_ERROR', error.message);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },

    /**
     * Get analysis summary
     */
    async getAnalysisSummary({ commit }, testId) {
        commit('SET_LOADING', true);
        commit('CLEAR_ERROR');

        try {
            const summary = await AIAssistedResultController.getAnalysisSummary(testId);
            return summary;
        } catch (error) {
            console.error('Error getting analysis summary:', error);
            commit('SET_ERROR', error.message);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },

    /**
     * Clear current result
     */
    clearCurrentResult({ commit }) {
        commit('CLEAR_CURRENT_RESULT');
    },

    /**
     * Clear error
     */
    clearError({ commit }) {
        commit('CLEAR_ERROR');
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
