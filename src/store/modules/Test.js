/**
 * Test Store Module
 * @module Test
 */

// import TestController
import { collection, doc, getDoc, deleteDoc, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import TestController from '@/controllers/TestController'
// import Test from '../../models/Test'

const testController = new TestController()

export default {
  state: {
    Test: null,
    tests: null,
    testStructure: null,
    answersId: null,
    module: 'test',
    tasks: [],
    currentImageUrl: '',
    welcomeMessage: '',
    landingPage: '',
    participantCamera: '',
    consent: '',
    preTest: [],
    postTest: [],
    scoresPercentage: [],
    finalMessage: '',
    remoteStream: null,
    localStream: null,
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
    heuristicsTest(state) {
      return state.Test.HeuristicsTest
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
    participantCamera(state) {
      return state.participantCamera
    },
    finalMessage(state) {
      return state.finalMessage
    },
    remoteStream(state) {
      return state.remoteStream
    },
    localStream(state) {
      return state.localStream
    },
  },
  mutations: {
    SET_TEST(state, payload) {
      state.Test = payload
    },
    SET_TESTS(state, payload) {
      state.tests = payload
    },
    ADD_TASKS(state, payload) {
      //state.tasks.push(payload)
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
    SET_PARTICIPANT_CAMERA(state, payload) {
      state.participantCamera = payload
    },
    SET_FINAL_MESSAGE(state, payload) {
      state.finalMessage = payload
    },
    SET_REMOTE_STREAM(state, stream) {
      state.remoteStream = stream
    },
    SET_LOCAL_STREAM(state, stream) {
      state.localStream = stream
    },
    updateCurrentImageUrl(state, url) {
      state.currentImageUrl = url // Update currentImageUrl with the new URL
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
      state.participantCamera = ''
      state.finalMessage = ''
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
        console.log('Error in getTest')
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
        console.log('Error in getAllTests')
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
        console.log('Error in getSharedWithMeTests: ', e)
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
        console.log('Error in getPublicTests')
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

    async addItemsTasks({ commit }, payload) {
      try {
        commit('setLoading', true)
        commit('ADD_TASKS', payload)
      } catch {
        commit('setError', true)
      } finally {
        commit('setLoading', false)
      }
    },
    setTasks({ commit }, payload) {
      try {
        commit('SET_TASKS', payload)
      } catch {
        commit('setError', true)
      }
    },
    setCurrentImageUrl({ commit }, payload) {
      commit('SET_CURRENT_IMAGE_URL', payload)
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
    setConsent({ commit }, payload) {
      try {
        commit('SET_CONSENT', payload)
      } catch {
        commit('setError', true)
      }
    },
    setScoresPercentage({ commit }, payload) {
      try {
        commit('SET_SCORES_PERCENTAGE', payload)
      } catch {
        commit('setError', true)
      }
    },
    async setWelcomeMessage({ commit }, payload) {
      try {
        commit('SET_WELCOME', payload)
      } catch {
        commit('setError', true)
      }
    },
    async setLandingPage({ commit }, payload) {
      try {
        commit('SET_LANDING', payload)
      } catch {
        commit('setError', true)
      }
    },
    async setParticipantCamera({ commit }, payload) {
      try {
        commit('SET_PARTICIPANT_CAMERA', payload)
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
    setRemoteStream({ commit }, stream) {
      commit('SET_REMOTE_STREAM', stream)
    },
    setLocalStream({ commit }, stream) {
      commit('SET_LOCAL_STREAM', stream)
    },
    cleanTest({ commit }) {
      try {
        commit('CLEAN_TEST')
        console.log('clean test')
      } catch {
        commit('setError', true)
      }
    },
    async hangUp({ commit }, roomId) {
      try {
        const roomRef = doc(db, 'rooms', roomId)

        const roomSnapshot = await getDoc(roomRef)
        if (roomSnapshot.exists()) {
          console.log('Room document exists. Deleting...')

          const calleeCandidatesSnapshot = await getDocs(
            collection(roomRef, 'calleeCandidates'),
          )
          calleeCandidatesSnapshot.forEach(async (candidate) => {
            await deleteDoc(candidate.ref)
            console.log('Deleted callee candidate:', candidate.id)
          })

          const callerCandidatesSnapshot = await getDocs(
            collection(roomRef, 'callerCandidates'),
          )
          callerCandidatesSnapshot.forEach(async (candidate) => {
            await deleteDoc(candidate.ref)
            console.log('Deleted caller candidate:', candidate.id)
          })

          await deleteDoc(roomRef)
          console.log('Deleted room document:', roomId)
        } else {
          console.log('Room document does not exist.')
        }
      } catch (error) {
        console.error('Error deleting room and candidates:', error)
      }
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
  },
}
