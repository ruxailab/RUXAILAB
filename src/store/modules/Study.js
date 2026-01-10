/**
 * Test Store Module
 * @module Test
 */

import StudyController from '@/controllers/StudyController'
import UserController from '@/features/auth/controllers/UserController'
import { getAuth } from 'firebase/auth'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'

const studyController = new StudyController()

export default {
  state: {
    Test: null,
    tests: [],
    publicTests: [],
    testStructure: null,
    answersId: null,
    module: 'test',
    studyCategory: null,
    studyMethod: null,
    studyType: null,
  },
  getters: {
    tests(state) {
      return state.tests
    },
    publicTests(state) {
      return state.publicTests
    },
    test(state) {
      return state.Test
    },
    testStructure(state) {
      return state.testStructure
    },
    coops(state) {
      return state.Test.coop
    },
  },
  mutations: {
    SET_TEST(state, payload) {
      state.Test = payload
      if (
        payload?.testStructure &&
        payload.testType === STUDY_TYPES.HEURISTIC
      ) {
        state.heuristics = Object.entries(payload.testStructure)
          .filter(([key]) => !isNaN(key))
          .map(([_, value]) => ({ ...value }))
        state.testWeights = payload.testWeights || {}
      }
    },
    SET_TESTS(state, payload) {
      state.tests = payload
    },
    SET_PUBLIC_TESTS(state, payload) {
      state.publicTests = payload
    },
    SET_TEST_STRUCTURE(state, payload) {
      state.testStructure = { ...payload }
    },
    SET_CARDSORTING_OPTIONS_TEST_STRUCTURE(state, payload) {
      state.testStructure.cardSorting = state.testStructure.cardSorting || {}
      state.testStructure.cardSorting.options = payload
    },
    SET_CARDSORTING_CATEGORIES_TEST_STRUCTURE(state, payload) {
      state.testStructure.cardSorting = state.testStructure.cardSorting || {}
      state.testStructure.cardSorting.categories = payload
    },
    SET_CARDSORTING_CARD_TEST_STRUCTURE(state, payload) {
      state.testStructure.cardSorting = state.testStructure.cardSorting || {}
      state.testStructure.cardSorting.cards = payload
    },
    SET_STUDY_CATEGORY(state, payload) {
      state.studyCategory = payload
    },
    SET_STUDY_METHOD(state, payload) {
      state.studyMethod = payload
    },
    SET_STUDY_TYPE(state, payload) {
      state.studyType = payload
    },
    RESET_STUDY_DETAILS(state) {
      ;(state.studyCategory = null),
        (state.studyMethod = null),
        (state.studyType = null)
    },
    SET_CALIBRATION_CONFIG(state, payload) {
      if (state.Test) {
        state.Test.calibrationConfig = payload
      }
    },
    CLEAN_TEST(state) {
      state.Test = null
      state.testStructure = null
      state.answersId = null
      state.module = 'test'
    },
  },
  actions: {
    async createStudy({ commit }, payload) {
      commit('setLoading', true)
      try {
        const res = await studyController.createStudy(payload)
        payload.id = res.id
        commit('SET_TEST', payload)
        return res.id
      } catch (err) {
        commit('setError', {
          errorCode: 'studyError',
          message: err,
        })
        return null
      } finally {
        commit('setLoading', false)
      }
    },

    async duplicateStudy({ commit }, payload) {
      commit('setLoading', true)
      try {
        await studyController.duplicateStudy(payload)
      } catch (err) {
        commit('setError', {
          errorCode: 'studyError',
          message: err,
        })
        return null
      } finally {
        commit('setLoading', false)
      }
    },

    async deleteStudy({ commit }, payload) {
      commit('setLoading', true)
      try {
        const res = await studyController.deleteStudy(payload)
        commit('SET_TESTS', res)
      } catch (err) {
        commit('setError', {
          errorCode: 'studyError',
          message: err,
        })
      } finally {
        commit('setLoading', false)
      }
    },

    async updateStudy({ commit }, payload) {
      commit('setLoading', true)
      try {
        await studyController.updateStudy(payload)
        commit('SET_TEST', payload)
      } catch (err) {
        commit('setError', {
          errorCode: 'studyError',
          message: err,
        })
      } finally {
        commit('setLoading', false)
      }
    },

    async acceptStudyCollaboration({ commit }, payload) {
      commit('setLoading', true)
      try {
        await studyController.acceptStudyCollaboration(payload)
      } catch (err) {
        commit('setError', {
          errorCode: 'studyError',
          message: err,
        })
      } finally {
        commit('setLoading', false)
      }
    },

    async getStudy({ commit }, payload) {
      commit('setLoading', true)
      try {
        const res = await studyController.getStudy(payload)
        commit('SET_TEST', res)
      } catch (err) {
        commit('setError', {
          errorCode: 'studyError',
          message: err,
        })
      } finally {
        commit('setLoading', false)
      }
    },

    async getAllStudies({ commit }) {
      commit('setLoading', true)
      try {
        const res = await studyController.getAllStudies()
        commit('SET_TESTS', res)
      } catch (err) {
        commit('setError', {
          errorCode: 'studyError',
          message: err,
        })
      } finally {
        commit('setLoading', false)
      }
    },

    async getPublicStudies({ commit }) {
      commit('setLoading', true)
      try {
        const res = await studyController.getPublicStudies()
        commit('SET_PUBLIC_TESTS', res)
      } catch (err) {
        commit('setError', {
          errorCode: 'studyError',
          message: err,
        })
      } finally {
        commit('setLoading', false)
      }
    },

    async getTestsAdminByUser({ commit }) {
      commit('setLoading', true)
      try {
        const auth = getAuth()
        const user = auth.currentUser

        if (user) {
          const userController = new UserController()
          const userDoc = await userController.getUserWithStudies(user.uid)

          if (userDoc) {
            const tests = [
              ...Object.values(userDoc.myTests || {}),
              ...Object.values(userDoc.myAnswers || {}),
            ]
            commit('SET_TESTS', tests)
          }
        }
      } catch (err) {
        commit('setError', {
          errorCode: 'studyError',
          message: err,
        })
      } finally {
        commit('setLoading', false)
      }
    },
  },
}
