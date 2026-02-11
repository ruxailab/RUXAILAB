export default {
  state: {
    tasks: [],
    postTest: [],
    preTest: [],
  },
  getters: {
    tasks(state) {
      return state.tasks
    },
    postTest(state) {
      return state.postTest
    },
    preTest(state) {
      return state.preTest
    },
  },
  mutations: {
    SET_TASKS(state, payload) {
      state.tasks = payload
    },
    SET_POST_TEST(state, payload) {
      state.postTest = payload
    },
    SET_PRE_TEST(state, payload) {
      state.preTest = payload
    },
  },
  actions: {
    setTasks({ commit }, payload) {
      try {
        commit('SET_TASKS', payload)
      } catch {
        commit('setError', true)
      }
    },
    setPostTest({ commit }, payload) {
      try {
        commit('SET_POST_TEST', payload)
      } catch {
        commit('setError', true)
      }
    },
    setPreTest({ commit }, payload) {
      try {
        commit('SET_PRE_TEST', payload)
      } catch {
        commit('setError', true)
      }
    },
  },
}
