/**
 * Test Store Module
 * @module Test
 */

import { collection, doc, getDoc, deleteDoc, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import TestController from '@/controllers/TestController'
import UserController from '@/controllers/UserController'
import { getAuth } from 'firebase/auth'

const testController = new TestController()

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
    participantCamera: '',
    consent: '',
    preTest: [],
    postTest: [],
    scoresPercentage: [],
    finalMessage: '',
    remoteCameraStream: null,
    localCameraStream: null,
    peerConnection: null,
    isDisconnected: false,
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
    remoteCameraStream(state) {
      return state.remoteCameraStream
    },
    localCameraStream(state) {
      return state.localCameraStream
    },
    peerConnection(state) {
      return state.peerConnection
    },
    isDisconnected(state) {
      return state.isDisconnected
    },
  },
  mutations: {
    SET_TEST(state, payload) {
      state.Test = payload
    },
    SET_TESTS(state, payload) {
      state.tests = payload
    },
    SET_TEST_STRUCTURE(state, payload) {
      state.testStructure = { ...state.testStructure, ...payload }
    },
    SET_CATEGORIES_TEST_STRUCTURE(state, payload) {
      state.testStructure.cardSorting = state.testStructure.cardSorting || {}
      state.testStructure.cardSorting.categories = payload
    },
    SET_CARD_TEST_STRUCTURE(state, payload) {
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
    SET_PARTICIPANT_CAMERA(state, payload) {
      state.participantCamera = payload
    },
    SET_FINAL_MESSAGE(state, payload) {
      state.finalMessage = payload
    },
    SET_REMOTE_STREAM(state, stream) {
      state.remoteCameraStream = stream
    },
    SET_LOCAL_STREAM(state, stream) {
      console.log('[SET_LOCAL_STREAM] - stream recebido:', stream)
      state.localCameraStream = stream
    },
    SET_PEER_CONNECTION(state, connection) {
      // Adiciona mutação para peerConnection
      state.peerConnection = connection
    },
    SET_DISCONNECTED(state, status) {
      state.isDisconnected = status
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
      state.participantCamera = ''
      state.finalMessage = ''
      state.peerConnection = null // Reseta peerConnection
    },
    removeHeuristic(state, payload) {
      state.Test.testStructure.splice(payload, 1)
    },
    setupHeuristicQuestionDescription(state, payload) {
      if (
        state.Test.testStructure[payload.heuristic].questions[payload.question]
          .descriptions == null
      )
        state.Test.testStructure[payload.heuristic].questions[
          payload.question
        ].descriptions = []

      if (payload.editIndex != null) {
        state.Test.testStructure[payload.heuristic].questions[
          payload.question
        ].descriptions[payload.editIndex] = Object.assign(
          {},
          payload.description,
        )
      } else {
        state.Test.testStructure[payload.heuristic].questions[
          payload.question
        ].descriptions.push(payload.description)
      }
    },
  },
  actions: {
    async createNewTest({ commit }, payload) {
      commit('setLoading', true)

      try {
        const res = await testController.createTest(payload)
        commit('SET_TEST', res.id)
        return res.id
      } catch (err) {
        commit('setError', true)
        return null
      } finally {
        commit('setLoading', false)
      }
    },

    async duplicateTest({ commit }, payload) {
      commit('setLoading', true)

      try {
        await testController.duplicateTest(payload)
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

    async deleteTest({ commit }, payload) {
      try {
        const res = await testController.deleteTest(payload)
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

    async updateTest({ commit }, payload) {
      commit('setLoading', true)
      try {
        await testController.updateTest(payload)
      } catch (e) {
        console.error('Error in updateTest', e)
        commit('setError', true)
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

    async getAllTests({ commit }) {
      try {
        commit('setLoading', true)
        const res = await testController.getAllTests()
        commit('SET_TESTS', res)
      } catch (e) {
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

    async addItemsTasks({ commit }, payload) {
      try {
        commit('setLoading', true)
        commit('ADD_TASKS', payload)
      } catch (e) {
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
    async setLandingPage({ commit }, payload) {
      try {
        commit('SET_LANDING', payload)
      } catch (e) {
        commit('setError', true)
      }
    },
    async setParticipantCamera({ commit }, payload) {
      try {
        commit('SET_PARTICIPANT_CAMERA', payload)
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
    setremoteCameraStream({ commit }, stream) {
      commit('SET_REMOTE_STREAM', stream)
    },
    setlocalCameraStream({ commit }, stream) {
      commit('SET_LOCAL_STREAM', stream)
    },
    cleanTest({ commit }) {
      try {
        commit('CLEAN_TEST')
      } catch (e) {
        commit('setError', true)
      }
    },
    async hangUp({ commit }, roomId) {
      try {
        const roomRef = doc(db, 'rooms', roomId)

        const roomSnapshot = await getDoc(roomRef)
        if (roomSnapshot.exists()) {
          const calleeCandidatesSnapshot = await getDocs(
            collection(roomRef, 'calleeCandidates'),
          )
          calleeCandidatesSnapshot.forEach(async (candidate) => {
            await deleteDoc(candidate.ref)
          })

          const callerCandidatesSnapshot = await getDocs(
            collection(roomRef, 'callerCandidates'),
          )
          callerCandidatesSnapshot.forEach(async (candidate) => {
            await deleteDoc(candidate.ref)
          })

          await deleteDoc(roomRef)
        }
      } catch (error) {
        console.error('Error deleting room and candidates:', error)
      }
    },
    async createPeerConnection({ commit }, configuration) {
      // Adiciona ação para criar peerConnection
      try {
        const peerConnection = new RTCPeerConnection(configuration)
        commit('SET_PEER_CONNECTION', peerConnection)
        return peerConnection
      } catch (error) {
        console.error('Error creating peer connection:', error)
      }
    },
    async closePeerConnection({ commit, state }) {
      console.log('[closePeerConnection] - state:', state);

      try {
        if (state.localCameraStream) {
          state.localCameraStream.getTracks().forEach(track => track.stop())
          commit('SET_LOCAL_STREAM', null)
        }

        if (state.remoteCameraStream) {
          state.remoteCameraStream.getTracks().forEach(track => track.stop())
          commit('SET_REMOTE_STREAM', null)
        }

        if (state.peerConnection) {
          state.peerConnection.close()
          commit('SET_PEER_CONNECTION', null)
        }

        // commit('SET_DISCONNECTED', true)
      } catch (error) {
        console.error('Error closing connection:', error)
      }
    },
    async changeTrack({ commit, state }, stream) {
      const newTrack = stream.getVideoTracks()[0]

      if (state.peerConnection) {
        const senders = state.peerConnection.getSenders()
        const videoSender = senders.find(
          (sender) => sender.track.kind === 'video',
        )

        if (videoSender) {
          await videoSender.replaceTrack(newTrack)
          const newStream = new MediaStream([
            ...state.localCameraStream.getAudioTracks(),
            newTrack,
          ])
          commit('SET_LOCAL_STREAM', newStream)
        } else {
          console.error('videoSender is not set')
        }
      }
    },
  },
}
