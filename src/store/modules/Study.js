/**
 * Test Store Module
 * @module Test
 */

import StudyController from '@/controllers/StudyController'
import UserController from '@/features/auth/controllers/UserController'
import { getAuth } from 'firebase/auth'
import { STUDY_TYPES } from '@/shared/constants/methodDefinitions'
// Import the initialized Firebase instance
import { auth, db } from '../../app/plugins/firebase/index'

const studyController = new StudyController()

export default {
  state: {
    Test: null,
    tests: [],
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
    }
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
      } catch (err) {
        commit('setError', true)
        return null
      } finally {
        commit('setLoading', false)
      }
    },

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

    async updateStudy({ commit }, payload) {
  commit('setLoading', true);
  try {
    // Convert cooperators from Proxy to plain objects if they exist
    if (payload.cooperators && Array.isArray(payload.cooperators)) {
      console.log('📋 Test cooperators before save:', payload.cooperators);
      
      // Convert each cooperator from Proxy to plain object
      const plainCooperators = payload.cooperators.map(cooperator => {
        // Check if it's a Proxy
        if (cooperator && typeof cooperator === 'object' && 
            cooperator.__v_isProxy === true) {
          // Convert Proxy to plain object
          return JSON.parse(JSON.stringify(cooperator));
        }
        return cooperator;
      });
      
      payload.cooperators = plainCooperators;
    }
    
    await studyController.updateStudy(payload);
    commit('SET_TEST', payload);
  } catch (e) {
    console.error('Error in updateStudy:', e);
    commit('setError', true);
  } finally {
    commit('setLoading', false);
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

    async getStudy({ commit }, payload) {
      commit('setLoading', true)
      try {
        const res = await studyController.getStudy(payload)
        commit('SET_TEST', res)
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
          const userDoc = await userController.getUserWithStudies(user.uid)

          if (userDoc) {
            const tests = [
              ...Object.values(userDoc.myTests || {}),
              ...Object.values(userDoc.myAnswers || {}),
            ];

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
    /**
     * validate the invitation token
     */
    async validateInvitation({ commit }, { token, email }) {
      commit("setLoading", true);
      try {
        console.log("🔍 Validating invitation:", { token, email });

        const decodedEmail = decodeURIComponent(email);

        // Check if db is properly initialized
        if (!db) {
          console.error("Firestore db is not initialized");
          throw new Error("Database connection error");
        }

        // Use the modular Firestore API
        const { collection, getDocs } = await import('firebase/firestore');
        
        const testsRef = collection(db, "tests");
        
        console.log("🔍 Searching for tests with email:", decodedEmail);
        
        const allTestsQuery = await getDocs(testsRef);
        console.log("📊 Total tests in database:", allTestsQuery.size);
        
        let foundTest = null;
        let foundCooperator = null;
        
        // Manual search through all tests
        for (const docSnap of allTestsQuery.docs) {
          const test = {
            id: docSnap.id,
            ...docSnap.data(),
          };
          
          console.log(`📋 Test ${test.id}:`, test.testTitle);
          console.log("Cooperators in test:", test.cooperators);
          
          if (test.cooperators && Array.isArray(test.cooperators)) {
            const cooperator = test.cooperators.find(
              (coop) => {
                console.log("Checking cooperator:", {
                  coopEmail: coop.email,
                  decodedEmail: decodedEmail,
                  // CHECK BOTH invitationToken AND token FIELDS
                  invitationTokenMatch: coop.invitationToken === token,
                  tokenMatch: coop.token === token,
                  emailMatch: coop.email === decodedEmail,
                  invitationToken: coop.invitationToken,
                  token: coop.token,
                  searchToken: token
                });
                // FIX: Check both fields for the token
                return (coop.invitationToken === token || coop.token === token) 
                       && coop.email === decodedEmail;
              }
            );
            
            if (cooperator) {
              console.log("✅ Found matching cooperator!", cooperator);
              foundTest = test;
              foundCooperator = cooperator;
              break;
            }
          }
        }
        
        if (!foundCooperator) {
          console.error("❌ No matching cooperator found");
          throw new Error("Invitation not found");
        }

        // Check if invitation is expired
        if (
          foundCooperator.invitationExpires &&
          new Date(foundCooperator.invitationExpires) < new Date()
        ) {
          throw new Error("Invitation has expired");
        }

        // Check if already accepted
        if (foundCooperator.accepted) {
          throw new Error("Invitation already accepted");
        }

        // Check if user already exists
        const usersRef = collection(db, "users");
        const { query, where } = await import('firebase/firestore');
        const userQuery = query(usersRef, where("email", "==", decodedEmail));
        const userSnapshot = await getDocs(userQuery);
        const userExists = !userSnapshot.empty;

        return {
          valid: true,
          testId: foundTest.id,
          testTitle: foundTest.testTitle,
          testDescription: foundTest.testDescription,
          adminName: foundTest.testAdmin?.name || foundTest.testAdmin?.email || "Study Administrator",
          adminEmail: foundTest.testAdmin?.email,
          email: decodedEmail,
          accessLevel: foundCooperator.accessLevel,
          invitationExpires: foundCooperator.invitationExpires,
          invitationMessage: foundCooperator.inviteMessage,
          userExists: userExists,
          cooperatorData: foundCooperator,
        };
      } catch (error) {
        console.error("❌ Error validating invitation:", error);
        
        // Return more specific error for debugging
        return {
          valid: false,
          error: error.message,
          details: error.toString(),
        };
      } finally {
        commit("setLoading", false);
      }
    },
    /**
     * Accept invitation and create account
     */
    async acceptInvitation({ commit, dispatch }, { token, email, name, password }) {
      commit('setLoading', true);
      try {
        console.log('Accepting invitation:', { token, email, name });
        
        const decodedEmail = decodeURIComponent(email);
        
        //validate the invitation
        const validationResult = await dispatch('validateInvitation', { 
          token, 
          email: decodedEmail 
        });
        
        if (!validationResult.valid) {
          throw new Error('Invalid invitation');
        }
        
        // user exists or not
        if (validationResult.userExists) {
          throw new Error('User already exists. Please sign in instead.');
        }
        
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        
        // Create Firebase Auth user
        let userCredential;
        try {
          userCredential = await createUserWithEmailAndPassword(auth, decodedEmail, password);
        } catch (authError) {
          if (authError.code === 'auth/email-already-in-use') {
            throw new Error('Email already in use. Please sign in instead.');
          }
          throw authError;
        }
        
        // Update user profile with name
        if (name && userCredential.user) {
          const { updateProfile } = await import('firebase/auth');
          await updateProfile(userCredential.user, {
            displayName: name
          });
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
        };
        
        const { doc, setDoc, getDoc, updateDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        
        // Update cooperator record in the test document
        const testRef = doc(db, 'tests', validationResult.testId);
        const testDoc = await getDoc(testRef);
        const testData = testDoc.data();
        
        if (!testData) {
          throw new Error('Test not found');
        }
        
        // Find and update the specific cooperator
        const updatedCooperators = testData.cooperators.map(coop => {
          if (coop.invitationToken === token && coop.email === decodedEmail) {
            return {
              ...coop,
              userDocId: userCredential.user.uid,
              accepted: true,
              isUnregistered: false,
              invitationToken: null,
              invitationExpires: null,
              acceptedAt: new Date().toISOString(),
              updateDate: new Date().toISOString(),
            };
          }
          return coop;
        });
        
        // Update the test document with modified cooperators
        await updateDoc(testRef, {
          cooperators: updatedCooperators,
          updateDate: new Date().toISOString()
        });
        
        // Auto-login the user by calling the signin action
        await dispatch('signin', {
          email: decodedEmail,
          password: password
        });
        
        return {
          success: true,
          userId: userCredential.user.uid,
          testId: validationResult.testId,
          testTitle: validationResult.testTitle,
          accessLevel: validationResult.accessLevel,
        };
        
      } catch (error) {
        console.error('Error accepting invitation:', error);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    /**
     * Resend invitation email
     */
    async resendInvitation({ commit, dispatch }, { testId, email }) {
      commit('setLoading', true);
      try {
        const { doc, getDoc, updateDoc } = await import('firebase/firestore');
        const testRef = doc(db, 'tests', testId);
        const testDoc = await getDoc(testRef);
        
        if (!testDoc.exists()) {
          throw new Error('Test not found');
        }
        
        const testData = testDoc.data();
        const cooperator = testData.cooperators.find(coop => coop.email === email);
        
        if (!cooperator) {
          throw new Error('Cooperator not found');
        }
        
        if (cooperator.accepted) {
          throw new Error('User has already accepted the invitation');
        }
        
        // Generate new token
        const newToken = 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const invitationExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;
        
        // Update cooperator with new token
        const updatedCooperators = testData.cooperators.map(coop => {
          if (coop.email === email) {
            return {
              ...coop,
              invitationToken: newToken,
              invitationExpires: invitationExpires,
              invitationSentAt: Date.now(),
              isUnregistered: true
            };
          }
          return coop;
        });
        
        await updateDoc(testRef, {
          cooperators: updatedCooperators,
          updateDate: new Date().toISOString()
        });
        
        return { success: true, message: 'Invitation resent successfully' };
        
      } catch (error) {
        console.error('Error resending invitation:', error);
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
  }
}