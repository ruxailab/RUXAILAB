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
    testStructure: null,
    answersId: null,
    module: 'test',
    tasks: [],
    currentImageUrl: '',
    welcomeMessage: '',
    landingPage: '',
    consent: '',
    preTest: [],
    postTest: [],
    scoresPercentage: [],
    finalMessage: '',
    studyCategory: null,
    studyMethod: null,
    studyType: null,
  },
  getters: {
    tests(state) {
      return state.tests
    },
    test(state) {
      return state.Test
    },
    tasks(state) {
      return state.tasks
    },
    testStructure(state) {
      return state.testStructure
    },
    coops(state) {
      return state.Test.coop
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
    SET_TEST(state, payload) {
      state.Test = payload;
      if (payload?.testStructure && payload.testType === STUDY_TYPES.HEURISTIC) {
        state.heuristics = Object.entries(payload.testStructure)
          .filter(([key]) => !isNaN(key))
          .map(([_, value]) => ({ ...value }));
        state.testWeights = payload.testWeights || {};
      }
    },
    SET_TESTS(state, payload) {
      state.tests = payload
    },
    SET_TEST_STRUCTURE(state, payload) {
      state.testStructure = { ...payload };
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
    ADD_TASKS(state, payload) {
      state.tasks = [...state.tasks, payload]
    },
    SET_TASKS(state, payload) {
      state.tasks = payload
    },
    SET_CURRENT_IMAGE_URL(state, payload) {
      state.currentImageUrl = payload
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
    SET_SCORES_PERCENTAGE(state, payload) {
      state.scoresPercentage = payload
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
      state.studyCategory = null,
        state.studyMethod = null,
        state.studyType = null
    },
    updateCurrentImageUrl(state, url) {
      state.currentImageUrl = url
    },
    CLEAN_TEST(state) {
      state.Test = null
      state.testStructure = null
      state.answersId = null
      state.module = 'test'
      state.tasks = []
      state.currentImageUrl = ''
      state.consent = ''
      state.preTest = []
      state.postTest = []
      state.welcomeMessage = ''
      state.landingPage = ''
      state.finalMessage = ''
    },
  },
  actions: {
    async createStudy({ commit }, payload) {
      commit('setLoading', true)

      try {
        const res = await studyController.createStudy(payload)
        commit('SET_TEST', res.id)
        return res.id
      } catch (err) {
        commit('setError', true)
        return null
      } finally {
        commit('setLoading', false)
      }
    },

    async duplicateStudy({ commit }, payload) {
      commit('setLoading', true)

      try {
        await studyController.duplicateStudy(payload)
        commit('ADD_TASKS', payload.test)
      } catch (err) {
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

    async deleteStudy({ commit }, payload) {
      try {
        const res = await studyController.deleteStudy(payload)
        commit('SET_TESTS', res)
      } catch (e) {
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

    async updateStudy({ commit }, payload) {
      commit('setLoading', true)
      try {
        await studyController.updateStudy(payload)
        commit('SET_TEST', payload);
      } catch (e) {
        console.error('Error in', e)
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },

    async acceptStudyCollaboration({ commit }, payload) {
      commit('setLoading', true)
      try {
        await studyController.acceptStudyCollaboration(payload)
      } catch (e) {
        console.error('Error accept test collaboration', e)
        commit('setError', true)
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
    async getStudy({ commit }, payload) {
      commit('setLoading', true)

      try {
        const res = await studyController.getStudy(payload)
        commit('SET_TEST', res)
        return res
      } catch (e) {
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },

    async getAllStudies({ commit }) {
      try {
        commit('setLoading', true)
        const res = await studyController.getAllStudies()
        commit('SET_TESTS', res)
      } catch (e) {
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },
    //ToDo: Analyze if it is still needed, or maybe convert into a getter.
    async getSharedWithMeStudies({ commit, rootState }) {
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
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },

    async getPublicStudies({ commit }) {
      try {
        commit('setLoading', true)
        const res = await studyController.getPublicStudies()
        commit('SET_TESTS', res)
      } catch (e) {
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },

    async getTestsAdminByUser({ commit, rootState }) {
      try {
        commit('setLoading', true);

        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userController = new UserController()
          const userDoc = await userController.getById(user.uid)

          if (userDoc && userDoc.myTests) {
            const tests = Object.values(userDoc.myTests)
            commit('SET_TESTS', tests)
          } else {
            console.error('User document or myTests field not found in Firestore')
          }
        } else {
          console.error('No user is currently signed in')
        }
      } catch (e) {
        console.error('Error in get tests by admin', e)
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },

    setTasks({ commit }, payload) {
      try {
        commit('SET_TASKS', payload)
      } catch (e) {
        commit('setError', true)
      }
    },
    setCurrentImageUrl({ commit }, payload) {
      commit('SET_CURRENT_IMAGE_URL', payload)
    },
    setPostTest({ commit }, payload) {
      try {
        commit('SET_POST_TEST', payload)
      } catch (e) {
        commit('setError', true)
      }
    },
    setPreTest({ commit }, payload) {
      try {
        commit('SET_PRE_TEST', payload)
      } catch (e) {
        commit('setError', true)
      }
    },
    setConsent({ commit }, payload) {
      try {
        commit('SET_CONSENT', payload)
      } catch (e) {
        commit('setError', true)
      }
    },
    setScoresPercentage({ commit }, payload) {
      try {
        commit('SET_SCORES_PERCENTAGE', payload)
      } catch (e) {
        commit('setError', true)
      }
    },
    async setWelcomeMessage({ commit }, payload) {
      try {
        commit('SET_WELCOME', payload)
      } catch (e) {
        commit('setError', true)
      }
    },
    async setFinalMessage({ commit }, payload) {
      try {
        commit('SET_FINAL_MESSAGE', payload)
      } catch (e) {
        commit('setError', true)
      }
    },
    cleanTest({ commit }) {
      try {
        commit('CLEAN_TEST')
      } catch (e) {
        commit('setError', true)
      }
    },
  }
}
