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
            if (!state.heuristics[payload.heuristic].questions[payload.question].descriptions) {
                state.heuristics[payload.heuristic].questions[payload.question].descriptions = [];
            }
            if (payload.editIndex != null) {
                state.heuristics[payload.heuristic].questions[payload.question].descriptions[payload.editIndex] = {
                    ...payload.description,
                };
            } else {
                state.heuristics[payload.heuristic].questions[payload.question].descriptions.push(payload.description);
            }
        },
        SET_SCORES_PERCENTAGE(state, payload) {
            state.scoresPercentage = payload
        },
        SET_CURRENT_IMAGE_URL(state, payload) {
            state.currentImageUrl = payload
        },
        SET_CURRENT_IMAGE_URL(state, url) {
            state.currentImageUrl = url
        },
    },
    actions: {
        async setHeuristics({ commit }, payload) {
            try {
                console.log('set')
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