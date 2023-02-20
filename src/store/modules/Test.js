/**
 * Test Store Module
 * @module Test
 */

//import TestController
import TestController from "@/controllers/TestController.js";
import HeuristicTest from "@/models/HeuristicTest.model.js";
import UserTest from "@/models/UserTest";

const testController = new TestController();

export default {
    state: {
        Test: null,
        tests: null,
        testStructure: null,
        answersId: null,
        module: "test",
    },
    getters: {
        tests(state) {
            return state.tests;
        },
        test(state) {
            return state.Test;
        },
        tasks(state) {
            return state.Test.Tasks;
        },
        heuristicsTest(state) {
            return state.Test.HeuristicsTest;
        },
        coops(state) {
            return state.Test.coop;
        },
    },
    mutations: {
        SET_TEST(state, payload) {
            state.Test = payload;
        },
        SET_TESTS(state, payload) {
            state.tests = payload;
        },
    },
    actions: {
        /**
         * This action creates a new Test, using the generic action "createObject" to creates the object,
         * passing the Test data
         *
         * @action createTest
         * @param {object} payload -Test creation data
         * @param {string} payload.collection - local in database
         * @param {object} payload.data - Test data
         * @param {object} payload.data.admin - Test's administrator data
         * @param {string} payload.data.admin.id - administrator identification
         * @param {string} payload.data.admin.email - administrator email
         * @param {Date} payload.data.date - Test created date
         * @param {string} payload.data.title - Test title
         * @param {string} payload.data.description - Test description
         * @param {string} payload.data.type - Test type
         * @param {object} [payload.data.answersSheet] - standard object to answer the Test
         * @param {number} payload.data.answersSheet.total - total questions answered
         * @param {number} payload.data.answersSheet.progress - complete Test percentage
         * @param {object[]} payload.data.answersSheet.HeuristicsTest - answers
         * @param {object[]} [payload.data.HeuristicsTest] - structure Test when its type is heuristic
         * @param {object[]} [payload.data.options] -  alternatives to respond when your type is heuristic
         * @param {object} [payload.data.postTest] - object with google form for preTest
         * @param {?string} [payload.data.postTest.form] -  google form link
         * @param {object} [payload.data.preTest] - object with google form for post-Test
         * @param {?string} [payload.data.preTest.form] - google form link
         * @param {?string} [payload.data.preTest.consent] - google form link
         * @param {object[]} [payload.data.Tasks] - structure Test when its type is user
         * @returns {string} docRef - the Test's identification
         */

        async createNewTest({ commit }, payload) {
            commit("setLoading", true);
            let ob = payload.data
            let objectTest = null;
            if (payload.data.testType === "HEURISTICS") {
                objectTest = new HeuristicTest(ob);
            } else {
                objectTest = new UserTest(ob);
            }
            try {
                await testController.createTest(
                    payload.collection,
                    objectTest
                ).then((res) => {
                    commit("SET_TEST", res.id);
                    return res.id;
                });
            } catch (err) {
                console.log("erro");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        /**
         * This action deletes a Test,using the generic action "deleteObject",
         *  passing the Test data
         *
         * @action deleteTest
         * @param {object} payload - Test's data
         * @param {string} [payload.collection = Test] -  local in database
         * @param {string} payload.answers  - answers collection reference identification
         * @param {string} payload.cooperators -cooperators collection reference identification
         * @param {string} payload.reports - reports collection reference identification
         * @param {string} [payload.template] - template collection reference identification
         * @param {object} payload.admin - Test's administrator data
         * @param {string} payload.admin.id - administrator identification
         * @param {string} payload.admin.email - administrator email
         * @param {Date} payload.date - Test created date
         * @param {string} payload.title - Test title
         * @param {string} payload.description - Test description
         * @param {string} payload.type - Test type
         * @param {object} [payload.answersSheet] - standard object to answer the Test
         * @param {number} payload.answersSheet.total
         * @param {number} payload.answersSheet.progress
         * @param {object[]} payload.answersSheet.HeuristicsTest
         * @param {object[]} [payload.HeuristicsTest] - structure Test when its type is heuristic
         * @param {object[]} [payload.options] -  alternatives to respond when your type is heuristic
         * @param {object} [payload.postTest] - object with google form for preTest
         * @param {?string} [payload.postTest.form] -  google form link
         * @param {object} [payload.preTest] - object with google form for post-Test
         * @param {?string} [payload.preTest.form] - google form link
         * @param {?string} [payload.preTest.consent] - google form link
         * @param {object[]} [payload.Tasks] - structure Test when its type is user
         * @returns {void}
         */

        async deleteTest({ commit }, payload) {
            //Connect to controllers
            try {
                const res = await testController.deleteTest(payload);
                commit("SET_TESTS", res);
            } catch {
                console.log("Error in deleteTest");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        /**
         * This action updates the Test,
         * using a the generic action "updateObject" sending the update data
         *
         * @action updateTest
         * @param {object} payload - data to update
         * @param {string} [payload.collection = Test] -  local in database
         * @param {string} payload.docId - Test identification
         * @param {object} payload.data - updated Test data
         * @param {string} payload.data.answers  - answers collection reference identification
         * @param {object} payload.data.admin - Test's administrator data
         * @param {string} payload.data.admin.id - administrator identification
         * @param {string} payload.data.admin.email - administrator email
         * @param {Date} payload.data.date - Test created date
         * @param {string} payload.data.title - Test title
         * @param {string} payload.data.description - Test description
         * @param {string} payload.data.type - Test type
         * @param {object} [payload.data.answersSheet] - standard object to answer the Test
         * @param {number} payload.data.answersSheet.total
         * @param {number} payload.data.answersSheet.progress
         * @param {object[]} payload.data.answersSheet.HeuristicsTest
         * @param {object[]} [payload.data.HeuristicsTest] - structure Test when its type is heuristic
         * @param {object[]} [payload.data.options] -  alternatives to respond when your type is heuristic
         * @param {object} [payload.data.postTest] - object with google form for preTest
         * @param {?string} [payload.data.postTest.form] -  google form link
         * @param {object} [payload.data.preTest] - object with google form for post-Test
         * @param {?string} [payload.data.preTest.form] - google form link
         * @param {?string} [payload.data.preTest.consent] - google form link
         * @param {object[]} [payload.data.Tasks] - structure Test when its type is user
         * @returns {void}
         */

        async updateTest({ commit }, payload) {
            commit("setLoading", true);
            try {
                await testController.updateTest(payload);
            } catch (e) {
                console.error("Error in updateTest", e);
                // commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async acceptTestCollaboration({ commit }, payload) {
            commit("setLoading", true);
            try {
                await testController.acceptTestCollaboration(payload)
            } catch (e) {
                console.error("Error accept test collaboration", e);
            } finally {
                commit("setLoading", false);
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
            commit("setLoading", true);

            //Connect to controllers
            try {
                const res = await testController.getTest(payload);
                commit("SET_TEST", res);
            } catch {
                console.log("Error in getObjectTest");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getAllTests({ commit }) {
            //Connect to controllers
            try {
                commit("setLoading", true);
                const res = await testController.getAllTests();
                commit("SET_TESTS", res);
            } catch {
                console.log("Error in getAllTest");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getSharedWithMeTests({ commit, rootState }) {
            try {
                commit("setLoading", true);
                const res = rootState.Auth.user.myAnswers
                commit("SET_TESTS", res);
            } catch (e) {
                console.log("Error in get public tests", e);
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getPublicTests({ commit }) {
            try {
                commit("setLoading", true);
                const res = await testController.getPublicTests()
                commit("SET_TESTS", res);
            } catch {
                console.log("Error in get public tests");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getTestsAdminByUser({ commit, rootState }) {
            try {
                commit("setLoading", true);
                commit("SET_TESTS", rootState.Auth.user.myTests);
            } catch (e) {
                console.error("Error in get tests by admin", e);
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        }
    },
    coops(state) {
        return state.test.coop;
    },
    snackColor(state) {
        return state.snackColor;
    },
    snackMessage(state) {
        return state.snackMessage;
    },
    managerIDs(state) {
        return state.managerIDs;
    },
};
