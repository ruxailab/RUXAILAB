/**
 * Test Store Module
 * @module Test
 */

//import TestController
import TestController from "@/controllers/TestController.js";
import HeuristicTest from "@/models/HeuristicTest.model.js";
import UserTest from "@/models/UserTest";

//merda do tales
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
// import { doc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase/index";

const TestCont = new TestController();

export default {
    state: {
        Test: null,
        Tests: null,
        testStructure: null,
        answersId: null,
        module: "test",
    },
    getters: {
        tests(state) {
            return state.Tests;
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
            state.Tests = payload;
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
            console.log(payload);
            let ob = {
                testTitle: payload.data.title,
                testDescription: payload.data.description,
            };
            console.log(" puta ESSE É O PAYLOAD " + payload);
            console.log(payload.data.type);
            let objectTest = null;
            if (payload.data.type === "HEURISTICS") {
                console.log(" puta ESSE É O PAYLOAD " + payload);
                console.log(payload.data.type);
                objectTest = new HeuristicTest(ob);
                console.log(objectTest);
                //payload = Object.assign(payload, { collection: "Tests" });
            } else {
                console.log(" puta ESSE É O PAYLOAD " + payload);
                console.log(payload.data.type);
                console.log("User Test");
                objectTest = new UserTest(ob);
                console.log(objectTest);
            }
            try {
                await TestCont.createTest(
                    payload.collection,
                    objectTest.toFirestore()
                ).then((res) => {
                    console.log(res.id);
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
                console.log("deleting");
                const res = await TestCont.deleteTest(payload);
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
                console.log(payload);
                await TestCont.updateTest(payload);
            } catch (e) {
                console.error("Error in updateTest", e);
                // commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async updateObject(data) {
            await updateDoc(doc(db, "test", data.id), {
                heuristics: arrayUnion({
                    id: data.id,
                    title: data.testTitle,
                    questions: data.questions,
                    total: data.total,
                }),
            });
        },
        updateTestAnswer({ dispatch, commit }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "answers" });

            dispatch("updateObject", payload).catch((err) =>
                commit("setError", "Error in updateTestAnswer." + err)
            );
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

            payload = Object.assign(payload, { collection: "Tests" });
            //Connect to controllers
            try {
                const res = await TestCont.getTest(payload);
                console.log(res);
                commit("SET_TEST", res);
            } catch {
                console.log("Error in getObjectTest");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getAnswers({ dispatch, commit }, payload) {
            console.log("getAnswers");
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "answers" });

            let ans = await dispatch("getObject", payload).catch((err) =>
                commit("setError", "Error in getAnswers." + err)
            );
            console.log("puta getAnswers");
            commit("setAnswers", ans);
        },

        async getObjectTestAdmin({ commit, dispatch }, payload) {
            commit("setLoading", true);

            payload = Object.assign(payload, { collection: "Tests" });

            var Test = await dispatch("getObject", payload).catch((err) =>
                commit("setError", "Error in getObjectTestAdmin." + err)
            );

            commit("SET_TESTS", Test);

            //Connect to controllers
            try {
                const res = await TestCont.getObjectTestAdmin();
                commit("SET_TESTS", res);
            } catch {
                console.log("Error in getObjectTestAdmin");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getObjectTestStructure({ commit, dispatch }, payload) {
            commit("setLoading", true);

            payload = Object.assign(payload, { collection: "Tests" });

            var Test = await dispatch("getObject", payload).catch((err) =>
                commit("setError", "Error in getObjectTestStructure." + err)
            );

            commit("SET_TESTS", Test);

            //Connect to controllers
            try {
                const res = await TestCont.getObjectTestStructure();
                commit("SET_TESTS", res);
            } catch {
                console.log("Error in getObjectTestStructure");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getObjectTestStructureOptions({ commit, dispatch }, payload) {
            commit("setLoading", true);

            payload = Object.assign(payload, { collection: "Tests" });

            var Test = await dispatch("getObject", payload).catch((err) =>
                commit(
                    "setError",
                    "Error in getObjectTestStructureOptions." + err
                )
            );

            commit("SET_TESTS", Test);

            //Connect to controllers
            try {
                const res = await TestCont.getObjectTestStructureOptions();
                commit("SET_TESTS", res);
            } catch {
                console.log("Error in getObjectTestStructureOptions");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getObjectTestTemplateDoc({ commit, dispatch }, payload) {
            commit("setLoading", true);

            payload = Object.assign(payload, { collection: "Tests" });

            var Test = await dispatch("getObject", payload).catch((err) =>
                commit("setError", "Error in getObjectTestTemplateDoc." + err)
            );

            commit("SET_TESTS", Test);

            //Connect to controllers
            try {
                const res = await TestCont.getObjectTestTemplateDoc();
                commit("SET_TESTS", res);
            } catch {
                console.log("Error in getObjectTestTemplateDoc");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getAllTest({ commit }) {
            console.log("gettingtests");
            commit("setLoading", true);

            //Connect to controllers
            try {
                const res = await TestCont.getAllObjectTest();
                commit("SET_TESTS", res);
            } catch {
                console.log("Error in getAllTest");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getAllTestAdmin({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "Tests" });
            var Test = await dispatch("getAllObjects", payload).catch((err) =>
                commit("setError", "Error in getAllTestAdmin." + err)
            );
            commit("SET_TESTS", Test);

            //Connect to controllers
            try {
                const res = await TestCont.getAllTestAdmin();
                commit("SET_TESTS", res);
            } catch {
                console.log("Error in getAllTestAdmin");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getAllTestStructure({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "Tests" });
            var Test = await dispatch("getAllObjects", payload).catch((err) =>
                commit("setError", "Error in getAllTestStructure." + err)
            );
            commit("SET_TESTS", Test);

            //Connect to controllers
            try {
                const res = await TestCont.getAllTestStructure();
                commit("SET_TESTS", res);
            } catch {
                console.log("Error in getAllTestStructure");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getAllTestStructureOptions({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "Tests" });
            var Test = await dispatch("getAllObjects", payload).catch((err) =>
                commit("setError", "Error in getAllTestStructureOptions." + err)
            );
            commit("SET_TESTS", Test);

            //Connect to controllers
            try {
                const res = await TestCont.getAllTestStructureOptions();
                commit("SET_TESTS", res);
            } catch {
                console.log("Error in getAllTestStructureOptions");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },

        async getAllTestTemplateDoc({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "Tests" });
            var Test = await dispatch("getAllObjects", payload).catch((err) =>
                commit("setError", "Error in getAllTestTemplateDoc." + err)
            );
            commit("SET_TESTS", Test);

            //Connect to controllers
            try {
                const res = await TestCont.getAllTestTemplateDoc();
                commit("SET_TESTS", res);
            } catch {
                console.log("Error in getAllTestTemplateDoc");
                commit("setError", true);
            } finally {
                commit("setLoading", false);
            }
        },
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
