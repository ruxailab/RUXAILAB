// /**
//  * UserStudy Store Module
//  * @module UserStudy
//  */

export default {
  namespaced: true,
  state: {
    tasks: [],
    landingPage: '',
    welcomeMessage: '',
    consent: '',
    preTest: [],
    postTest: [],
    finalMessage: '',
  },
  getters: {
    tasks(state) {
      return state.tasks
    },
    preTest(state) {
      return state.preTest
    },
    postTest(state) {
      return state.postTest
    },
    consent(state) {
      return state.consent
    },
    welcomeMessage(state) {
      return state.welcomeMessage
    },
    landingPage(state) {
      return state.landingPage
    },
    finalMessage(state) {
      return state.finalMessage
    },
  },
  mutations: {
    SET_TASKS(state, payload) {
      state.tasks = payload
    },
    SET_WELCOME(state, payload) {
      state.welcomeMessage = payload
    },
    SET_LANDING(state, payload) {
      state.landingPage = payload
    },
    SET_FINAL_MESSAGE(state, payload) {
      state.finalMessage = payload
    },
    SET_POST_TEST(state, payload) {
      state.postTest = payload
    },
    SET_PRE_TEST(state, payload) {
      state.preTest = payload
    },
    SET_CONSENT(state, payload) {
      state.consent = payload
    },
  },
  actions: {
    async setWelcomeMessage({ commit }, payload) {
      try {
        commit('SET_WELCOME', payload)
      } catch {
        commit('setError', true)
      }
    },
    async setFinalMessage({ commit }, payload) {
      try {
        commit('SET_FINAL_MESSAGE', payload)
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
    setConsent({ commit }, payload) {
      try {
        commit('SET_CONSENT', payload)
      } catch {
        commit('setError', true)
      }
    },
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
    setLandingPage({ commit }, payload) {
      try {
        commit('SET_LANDING', payload)
      } catch {
        commit('setError', true)
      }
    },
  },
}
