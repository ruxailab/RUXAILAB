import ManualAccessibilityController from '@/controllers/ManualAccessibilityController';
import ManualAccessibilityTest from '@/models/ManualAccessibilityTest';

const state = {
  currentTest: null,
  userTests: [],
  loading: false,
  error: null
};

const getters = {
  getCurrentTest: state => state.currentTest,
  getUserTests: state => state.userTests,
  isLoading: state => state.loading,
  getError: state => state.error
};

const actions = {
  /**
   * Creates a new manual accessibility test
   * @param {Object} context - Vuex context
   * @param {ManualAccessibilityTest} test - The test to create
   */
  async createTest({ commit }, test) {
    commit('setLoading', true);
    try {
      const createdTest = await ManualAccessibilityController.createTest(test);
      commit('addUserTest', createdTest);
      commit('setCurrentTest', createdTest);
      return createdTest;
    } catch (error) {
      commit('setError', error.message);
      throw error;
    } finally {
      commit('setLoading', false);
    }
  },

  /**
   * Fetches a test by ID
   * @param {Object} context - Vuex context
   * @param {string} testId - The ID of the test to fetch
   */
  async fetchTest({ commit }, testId) {
    commit('setLoading', true);
    try {
      const test = await ManualAccessibilityController.getTest(testId);
      commit('setCurrentTest', test);
      return test;
    } catch (error) {
      commit('setError', error.message);
      throw error;
    } finally {
      commit('setLoading', false);
    }
  },

  /**
   * Updates a test
   * @param {Object} context - Vuex context
   * @param {Object} payload - The update payload
   * @param {string} payload.testId - The ID of the test to update
   * @param {Object} payload.updates - The updates to apply
   */
  async updateTest({ commit }, { testId, updates }) {
    commit('setLoading', true);
    try {
      await ManualAccessibilityController.updateTest(testId, updates);
      commit('updateTest', { testId, updates });
    } catch (error) {
      commit('setError', error.message);
      throw error;
    } finally {
      commit('setLoading', false);
    }
  },

  /**
   * Deletes a test
   * @param {Object} context - Vuex context
   * @param {string} testId - The ID of the test to delete
   */
  async deleteTest({ commit }, testId) {
    commit('setLoading', true);
    try {
      await ManualAccessibilityController.deleteTest(testId);
      commit('removeTest', testId);
    } catch (error) {
      commit('setError', error.message);
      throw error;
    } finally {
      commit('setLoading', false);
    }
  },

  /**
   * Fetches all tests for the current user
   * @param {Object} context - Vuex context
   * @param {string} userId - The ID of the current user
   */
  async fetchUserTests({ commit }, userId) {
    commit('setLoading', true);
    try {
      const tests = await ManualAccessibilityController.getUserTests(userId);
      commit('setUserTests', tests);
      return tests;
    } catch (error) {
      commit('setError', error.message);
      throw error;
    } finally {
      commit('setLoading', false);
    }
  },

  /**
   * Clears the current test from the store
   * @param {Object} context - Vuex context
   */
  clearCurrentTest({ commit }) {
    commit('setCurrentTest', null);
  },

  /**
   * Clears any error from the store
   * @param {Object} context - Vuex context
   */
  clearError({ commit }) {
    commit('setError', null);
  }
};

const mutations = {
  setLoading(state, isLoading) {
    state.loading = isLoading;
  },

  setError(state, error) {
    state.error = error;
  },

  setCurrentTest(state, test) {
    state.currentTest = test ? new ManualAccessibilityTest(test) : null;
  },

  setUserTests(state, tests) {
    state.userTests = tests.map(test => new ManualAccessibilityTest(test));
  },

  addUserTest(state, test) {
    state.userTests.unshift(new ManualAccessibilityTest(test));
  },

  updateTest(state, { testId, updates }) {
    const index = state.userTests.findIndex(t => t.id === testId);
    if (index !== -1) {
      state.userTests[index] = new ManualAccessibilityTest({
        ...state.userTests[index],
        ...updates
      });
    }
    
    if (state.currentTest && state.currentTest.id === testId) {
      state.currentTest = new ManualAccessibilityTest({
        ...state.currentTest,
        ...updates
      });
    }
  },

  removeTest(state, testId) {
    state.userTests = state.userTests.filter(test => test.id !== testId);
    if (state.currentTest && state.currentTest.id === testId) {
      state.currentTest = null;
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
