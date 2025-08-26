import TestController from "@/controllers/TestController"

const testController = new TestController()

export default {
  state: {
    test: null,
  },
  mutations: {
    SET_TEST(state, payload) {
      state.test = payload
    },
  },
  getters: {
    test(state) {
      return state.test
    },
  },
  actions: {
    async getTest({ commit }, payload) {
      commit('setLoading', true)

      try {
        const res = await testController.getTest(payload)
        commit('SET_TEST', res)
        return res
      } catch (e) {
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },
  },
}
