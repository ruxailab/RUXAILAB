/**
 * Test Store Module
 * @module Test
 */

// import TestController
import TestController from '@/controllers/TestController'
import Test from '../../models/Test'

const testController = new TestController()

export default {
  state: {
    Test: null,
    tests: null,
    testStructure: null,
    answersId: null,
    module: 'test',
  },
  getters: {
    tests(state) {
      return state.tests
    },
    test(state) {
      return state.Test
    },
    tasks(state) {
      return state.Test.Tasks
    },
    heuristicsTest(state) {
      return state.Test.HeuristicsTest
    },
    coops(state) {
      return state.Test.coop
    },
  },
  mutations: {
    SET_TEST(state, payload) {
      state.Test = payload
    },
    SET_TESTS(state, payload) {
      state.tests = payload
    },
  },
  actions: {
    /**
     * This action creates a new Test, using the generic action "createObject"
     * to creates the object, passing the Test data.
     *
     * @param {Test} payload the test creation data
     */

    async createNewTest({ commit }, payload) {
      commit('setLoading', true)

      try {
        const res = await testController.createTest(payload)

        commit('SET_TEST', res.id)

        return res.id
      } catch (err) {
        console.log('erro', err)

        commit('setError', true)

        return null
      } finally {
        commit('setLoading', false)
      }
    },

    /**
     * This action deletes a Test,using the generic action "deleteObject",
     * passing the Test data.
     *
     * @param {Partial<Test>} payload the test data
     */

    async deleteTest({ commit }, payload) {
      // Connect to controllers
      try {
        const res = await testController.deleteTest(payload)
        commit('SET_TESTS', res)
      } catch {
        console.log('Error in deleteTest')
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },

    /**
     * This action updates the Test, using a the generic action "updateObject"
     * sending the update data.
     *
     * @param {Partial<Test>} payload
     */

    async updateTest({ commit }, payload) {
      commit('setLoading', true)
      try {
        await testController.updateTest(payload)
      } catch (e) {
        console.error('Error in updateTest', e)
        // commit("setError", true);
      } finally {
        commit('setLoading', false)
      }
    },

    async acceptTestCollaboration({ commit }, payload) {
      commit('setLoading', true)
      try {
        await testController.acceptTestCollaboration(payload)
      } catch (e) {
        console.error('Error accept test collaboration', e)
      } finally {
        commit('setLoading', false)
      }
    },

    /**
     *This action gets a Test by id, using the generic action "getObject"
     *
     * @action getTest=SET_TEST
     * @param {object} payload - Test's data
     * @param {string} [payload.collection = Test] -  local in database
     * @param {string} payload.id - Test's identification code
     * @returns {void}
     */
    async getTest({ commit }, payload) {
      commit('setLoading', true)

      // Connect to controllers
      try {
        const res = await testController.getTest(payload)
        commit('SET_TEST', res)
      } catch {
        console.log('Error in getObjectTest')
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },

    async getAllTests({ commit }) {
      // Connect to controllers
      try {
        commit('setLoading', true)
        const res = await testController.getAllTests()
        commit('SET_TESTS', res)
      } catch {
        console.log('Error in getAllTest')
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },

    async getSharedWithMeTests({ commit, rootState }) {
      try {
        commit('setLoading', true)
        const res = rootState.Auth.user.myAnswers
        const tests = []

        const testsEntries = Object.entries(res)
        testsEntries.forEach((a) => {
          tests.push(a[1])
        })
        commit('SET_TESTS', tests)
      } catch (e) {
        console.log('Error in get public tests', e)
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },

    async getPublicTests({ commit }) {
      try {
        commit('setLoading', true)
        const res = await testController.getPublicTests()
        commit('SET_TESTS', res)
      } catch {
        console.log('Error in get public tests')
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },

    async getTestsAdminByUser({ commit, rootState }) {
      try {
        commit('setLoading', true)
        const tests = []

        const testsEntries = Object.entries(rootState.Auth.user.myTests)
        testsEntries.forEach((a) => {
          tests.push(a[1])
        })
        commit('SET_TESTS', tests)
      } catch (e) {
        console.error('Error in get tests by admin', e)
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },
  },
  coops(state) {
    return state.test.coop
  },
  snackColor(state) {
    return state.snackColor
  },
  snackMessage(state) {
    return state.snackMessage
  },
  managerIDs(state) {
    return state.managerIDs
  },
}
