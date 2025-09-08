// Vuex store for Automatic Accessibility Tests
// import AutomaticAccessibilityTest from '@/models/AutomaticAccessibilityTest';
import AutomaticAccessibilityController from '@/ux/accessibility/controllers/AutomaticAccessibilityController';

export default {
    namespaced: true,
    state: () => ({
        tests: []
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
        }
    },
    actions: {
        async fetchTests({ commit, rootState }) {
            commit('setLoading', true, { root: true });
            try {
                // Get userId from rootState.Auth.user
                const userId = rootState.Auth?.user?.id;
                if (!userId) throw new Error('User not authenticated');
                const tests = await AutomaticAccessibilityController.getUserTests(userId);
                commit('SET_TESTS', tests);
            } catch (e) {
                commit('setError', { errorCode: 'AUTO_TEST_FETCH_ERROR', message: e.message }, { root: true });
            } finally {
                commit('setLoading', false, { root: true });
            }
        },
        async addTest({ commit }, testData) {
            try {
                const createdTest = await AutomaticAccessibilityController.createTest(testData);
                commit('ADD_TEST', createdTest);
                return createdTest;
            } catch (e) {
                commit('setError', { errorCode: 'AUTO_TEST_CREATE_ERROR', message: e.message }, { root: true });
                throw e;
            }
        },
        async updateTest({ commit }, { testId, updates }) {
            try {
                await AutomaticAccessibilityController.updateTest(testId, updates);
                commit('UPDATE_TEST', { ...updates, id: testId });
            } catch (e) {
                commit('setError', { errorCode: 'AUTO_TEST_UPDATE_ERROR', message: e.message }, { root: true });
                throw e;
            }
        },
        async removeTest({ commit }, id) {
            try {
                await AutomaticAccessibilityController.deleteTest(id);
                commit('REMOVE_TEST', id);
            } catch (e) {
                commit('setError', { errorCode: 'AUTO_TEST_DELETE_ERROR', message: e.message }, { root: true });
                throw e;
            }
        }
    },
    getters: {
        allTests: state => state.tests,
        getTestById: state => id => state.tests.find(t => t.id === id)
    }
};
