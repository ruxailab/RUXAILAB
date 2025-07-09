// Vuex store for Automatic Accessibility Tests
// import AutomaticAccessibilityTest from '@/models/AutomaticAccessibilityTest';
import AutomaticAccessibilityController from '@/controllers/AutomaticAccessibilityController';

export default {
    namespaced: true,
    state: () => ({
        tests: [],
        loading: false,
        error: null
    }),
    mutations: {
        SET_TESTS(state, tests) {
            state.tests = tests;
        },
        ADD_TEST(state, test) {
            state.tests.push(test);
        },
        UPDATE_TEST(state, updatedTest) {
            const idx = state.tests.findIndex(t => t.id === updatedTest.id);
            if (idx !== -1) state.tests.splice(idx, 1, updatedTest);
        },
        REMOVE_TEST(state, id) {
            state.tests = state.tests.filter(t => t.id !== id);
        },
        SET_LOADING(state, loading) {
            state.loading = loading;
        },
        SET_ERROR(state, error) {
            state.error = error;
        }
    },
    actions: {
        async fetchTests({ commit, rootState }) {
            commit('SET_LOADING', true);
            try {
                // Get userId from rootState.Auth.user
                const userId = rootState.Auth?.user?.id;
                if (!userId) throw new Error('User not authenticated');
                const tests = await AutomaticAccessibilityController.getUserTests(userId);
                commit('SET_TESTS', tests);
            } catch (e) {
                commit('SET_ERROR', e);
            } finally {
                commit('SET_LOADING', false);
            }
        },
        async addTest({ commit }, testData) {
            try {
                const createdTest = await AutomaticAccessibilityController.createTest(testData);
                commit('ADD_TEST', createdTest);
                return createdTest;
            } catch (e) {
                commit('SET_ERROR', e);
                throw e;
            }
        },
        async updateTest({ commit }, { testId, updates }) {
            try {
                await AutomaticAccessibilityController.updateTest(testId, updates);
                commit('UPDATE_TEST', { ...updates, id: testId });
            } catch (e) {
                commit('SET_ERROR', e);
                throw e;
            }
        },
        async removeTest({ commit }, id) {
            try {
                await AutomaticAccessibilityController.deleteTest(id);
                commit('REMOVE_TEST', id);
            } catch (e) {
                commit('SET_ERROR', e);
                throw e;
            }
        }
    },
    getters: {
        allTests: state => state.tests,
        getTestById: state => id => state.tests.find(t => t.id === id),
        isLoading: state => state.loading,
        error: state => state.error
    }
};
