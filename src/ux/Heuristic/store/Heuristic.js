// /**
//  * Heuristic Store Module
//  * @module Heuristic
//  */

export default {
    state: {
        heuristicStructure: [],
        heuristics: [],
        testWeights: {},
        scoresPercentage: [],
        currentImageUrl: '',
    },
    getters: {
        heuristics(state, getters, rootState) {
            return state.heuristics
        },
        testWeights(state) {
            return state.testWeights
        },
    },
    mutations: {
        SET_HEURISTICS(state, payload) {
            state.heuristics = [...payload];
        },
        SET_TEST_WEIGHTS(state, payload) {
            state.testWeights = { ...payload };
        },
        REMOVE_HEURISTIC(state, index) {
            state.heuristics.splice(index, 1);
            // Adjust testWeights when a heuristic is removed
            const newWeights = {};
            const heuristicLength = state.heuristics.length;
            for (let i = 0; i < heuristicLength - 1; i++) {
                newWeights[i] = new Array(heuristicLength - (i + 1)).fill(null);
            }
            state.testWeights = newWeights;
        },
        SETUP_HEURISTIC_QUESTION_DESCRIPTION(state, payload) {
            const { heuristic, question, description, editIndex } = payload;
            if (!state.heuristics || !state.heuristics[heuristic]) {
                console.warn("Heuristic index not found in heuristics:", heuristic);
                return;
            }
            if (!state.heuristics[heuristic].questions || !state.heuristics[heuristic].questions[question]) {
                console.warn("Question index not found in heuristics:", question);
                return;
            }
            let targetQuestion = state.heuristics[heuristic].questions[question];
            if (!targetQuestion.descriptions) {
                targetQuestion.descriptions = [];
            }
            if (editIndex != null) {
                targetQuestion.descriptions[editIndex] = { ...description };
            } else {
                targetQuestion.descriptions.push(description);
            }
        },
        SET_SCORES_PERCENTAGE(state, payload) {
            state.scoresPercentage = payload
        },
        SET_CURRENT_IMAGE_URL(state, payload) {
            state.currentImageUrl = payload
        }
    },
    actions: {
        async setHeuristics({ commit }, payload) {
            try {
                commit('SET_HEURISTICS', payload);
            } catch (e) {
                commit('setError', true);
            }
        },
        async setTestWeights({ commit }, payload) {
            try {
                commit('SET_TEST_WEIGHTS', payload);
            } catch (e) {
                commit('setError', true);
            }
        },
        setScoresPercentage({ commit }, payload) {
            try {
                commit('SET_SCORES_PERCENTAGE', payload)
            } catch (e) {
                commit('setError', true)
            }
        },
        setCurrentImageUrl({ commit }, payload) {
            commit('SET_CURRENT_IMAGE_URL', payload)
        },
    }
}