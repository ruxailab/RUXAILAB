/**
 * Test Store Module
 * @module Test
 */

import StudyController from '@/controllers/StudyController'
import UserController from '@/features/auth/controllers/UserController'
import { getAuth } from 'firebase/auth'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
import { auth, db } from '../../app/plugins/firebase/index'

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

    /**
     * Validate invitation token for non-registered users
     */
    async validateInvitation({ commit }, { token, email }) {
      commit('setLoading', true)
      try {
        const decodedEmail = decodeURIComponent(email)
        
        const { collection, getDocs, query, where } = await import('firebase/firestore')
        const testsRef = collection(db, 'tests')
        const allTestsQuery = await getDocs(testsRef)
        let foundTest = null
        let foundCooperator = null
        
        // Search all the tests
        for (const docSnap of allTestsQuery.docs) {
          const test = {
            id: docSnap.id,
            ...docSnap.data(),
          }
          if (test.cooperators && Array.isArray(test.cooperators)) {
            const cooperator = test.cooperators.find(
              (coop) => coop.invitationToken === token && coop.email === decodedEmail
            )
            if (cooperator) {
              foundTest = test
              foundCooperator = cooperator
              break
            }
          }
        }
        
        if (!foundCooperator) {
          throw new Error('Invitation not found or has expired')
        }

        // Check invitation is expired or not
        if (
          foundCooperator.invitationExpires &&
          new Date(foundCooperator.invitationExpires) < new Date()
        ) {
          throw new Error('Invitation has expired')
        }

        // Check already accepted or not
        if (foundCooperator.accepted) {
          throw new Error('Invitation already accepted')
        }

        // Check if user exists in Firestore only
        const usersRef = collection(db, 'users')
        const userQuery = query(usersRef, where('email', '==', decodedEmail))
        const userSnapshot = await getDocs(userQuery)
        const userExistsInFirestore = !userSnapshot.empty

        return {
          valid: true,
          testId: foundTest.id,
          testTitle: foundTest.testTitle,
          testDescription: foundTest.testDescription,
          adminName: foundTest.testAdmin?.name || foundTest.testAdmin?.email || 'Study Administrator',
          adminEmail: foundTest.testAdmin?.email,
          email: decodedEmail,
          accessLevel: foundCooperator.accessLevel,
          invitationExpires: foundCooperator.invitationExpires,
          invitationMessage: foundCooperator.inviteMessage,
          userExistsInFirestore: userExistsInFirestore,
        }
      } catch (error) {
        return {
          valid: false,
          error: error.message,
        }
      } finally {
        commit('setLoading', false)
      }
    },

    /**
     * Accept invitation and create account for non-registered users
     */
    async acceptInvitation({ commit, dispatch }, { token, email, name, password }) {
      commit('setLoading', true)
      try {
        const decodedEmail = decodeURIComponent(email)
        
        const validationResult = await dispatch('validateInvitation', { 
          token, 
          email: decodedEmail 
        })
        
        if (!validationResult.valid) {
          throw new Error(validationResult.error || 'Invalid invitation')
        }
        
        if (validationResult.userExistsInFirestore) {
          throw new Error('An account with this email already exists. Please sign in instead.')
        }
        
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
        const { auth } = await import('../../app/plugins/firebase/index')
        
        let userCredential
        try {
          userCredential = await createUserWithEmailAndPassword(auth, decodedEmail, password)
        } catch (authError) {
          if (authError.code === 'auth/email-already-in-use') {
            throw new Error('An account with this email already exists. Please sign in instead.')
          }
          throw new Error(`Authentication failed: ${authError.message}`)
        }
        
        if (name && userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: name
          })
        }
        
        // Create user document in Firestore
        const userData = {
          email: decodedEmail,
          name: name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          accessLevel: 1,
          myTests: {},
          myAnswers: {},
          notifications: [],
          storageUsageMB: 0,
        }
        
        const { doc, setDoc, getDoc, updateDoc } = await import('firebase/firestore')
        
        await setDoc(doc(db, 'users', userCredential.user.uid), userData)
        
        // Update cooperator record in the test document
        const testRef = doc(db, 'tests', validationResult.testId)
        const testDoc = await getDoc(testRef)
        const testData = testDoc.data()
        
        if (!testData) {
          throw new Error('Test not found')
        }
        
        // Find and update the specific cooperator
        let found = false
        const updatedCooperators = testData.cooperators.map(coop => {
          if (coop.invitationToken === token && coop.email === decodedEmail) {
            found = true
            return {
              ...coop,
              userDocId: userCredential.user.uid,
              accepted: true,
              isUnregistered: false,
              invitationToken: null,
              invitationExpires: null,
              acceptedAt: new Date().toISOString(),
              updateDate: new Date().toISOString(),
            }
          }
          return coop
        })
        
        if (!found) {
          throw new Error('Could not find matching invitation record')
        }
        
        // Update the test document with modified cooperators
        await updateDoc(testRef, {
          cooperators: updatedCooperators,
          updateDate: new Date().toISOString()
        })
        
        // Auto login the user
        await dispatch('signin', {
          email: decodedEmail,
          password: password
        })
        
        return {
          success: true,
          userId: userCredential.user.uid,
          testId: validationResult.testId,
          testTitle: validationResult.testTitle,
          accessLevel: validationResult.accessLevel,
        }
        
      } catch (error) {
        throw error
      } finally {
        commit('setLoading', false)
      }
    },

    /**
     * Accept invitation with existing Google account
     */
    async acceptInvitationWithGoogle({ commit, dispatch }, { token, email, userId, name }) {
      commit('setLoading', true)
      try {
        const decodedEmail = decodeURIComponent(email)
        
        // Validate invitation first
        const validationResult = await dispatch('validateInvitation', { 
          token, 
          email: decodedEmail 
        })
        
        if (!validationResult.valid) {
          throw new Error(validationResult.error || 'Invalid invitation')
        }
        
        // Check if user document exists in Firestore
        const { doc, getDoc, updateDoc, setDoc } = await import('firebase/firestore')
        
        const userRef = doc(db, 'users', userId)
        const userDoc = await getDoc(userRef)
        
        if (!userDoc.exists()) {
          // Create user document if it doesn't exist
          const userData = {
            email: decodedEmail,
            name: name || decodedEmail.split('@')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            accessLevel: 1,
            myTests: {},
            myAnswers: {},
            notifications: [],
            storageUsageMB: 0,
          }
          await setDoc(userRef, userData)
        }
        
        // Update cooperator record in the test document
        const testRef = doc(db, 'tests', validationResult.testId)
        const testDoc = await getDoc(testRef)
        const testData = testDoc.data()
        
        if (!testData) {
          throw new Error('Test not found')
        }
        
        // Find and update the specific cooperator
        let found = false
        const updatedCooperators = testData.cooperators.map(coop => {
          if (coop.invitationToken === token && coop.email === decodedEmail) {
            found = true
            return {
              ...coop,
              userDocId: userId,
              accepted: true,
              isUnregistered: false,
              invitationToken: null,
              invitationExpires: null,
              acceptedAt: new Date().toISOString(),
              updateDate: new Date().toISOString(),
            }
          }
          return coop
        })
        
        if (!found) {
          throw new Error('Invitation not found')
        }
        
        // Update the test document with modified cooperators
        await updateDoc(testRef, {
          cooperators: updatedCooperators,
          updateDate: new Date().toISOString()
        })
        
        return {
          success: true,
          userId: userId,
          testId: validationResult.testId,
          testTitle: validationResult.testTitle,
          accessLevel: validationResult.accessLevel,
        }
        
      } catch (error) {
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
  },
}
