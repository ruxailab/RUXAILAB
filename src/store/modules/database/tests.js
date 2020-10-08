/**
 * Tests Store Module
 * @module tests
 */

export default {
  state: {
    test: null,
    tests: null,
    myTests: null,
    snackMessage: null,
    snackColor: null,
    managerIDs: null
  },
  getters: {
    tests(state) {
      return state.tests;
    },
    test(state) {
      return state.test;
    },
    tasks(state) {
      return state.test.tasks;
    },
    heuristics(state) {
      return state.test.heuristics;
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
    }
  },
  mutations: {
    setTest(state, payload) {
      state.test = payload;
    },
    setTests(state, payload) {
      state.tests = payload;
    },
    setMyTests(state, payload) {
      state.myTests = payload;
    },
    setError(state, payload) {
      state.snackMessage = payload;
      state.snackColor = "red"
    },
    setSuccess(state, payload) {
      state.snackMessage = payload;
      state.snackColor = "success"
    },
    resetSnack(state) {
      state.snackMessage = null;
      state.snackColor = null;
    },
    setManagerIDS(state, payload) {
      state.managerIDs = payload;
    }
  },
  actions: {
    /**
     * This action creates a new test, using the generic function "createObject" to creates the object, 
     * passing the test data
     * 
     * @action createTest  
     * @param {object} payload -test creation data 
     * @param {string} payload.collection - local in database 
     * @param {object} payload.data - test data
     * @param {object} payload.data.admin - test's administrator data
     * @param {string} payload.data.admin.id - administrator identification
     * @param {string} payload.data.admin.email - administrator email
     * @param {Date} payload.data.date - test created date 
     * @param {string} payload.data.title - test title 
     * @param {string} payload.data.description - test description
     * @param {string} payload.data.type - test type
     * @param {object} [payload.data.answersSheet] - standard object to answer the test
     * @param {number} payload.data.answersSheet.total
     * @param {number} payload.data.answersSheet.progress
     * @param {object[]} payload.data.answersSheet.heuristics
     * @param {object[]} [payload.data.heuristics] - structure test when its type is heuristic
     * @param {object[]} [payload.data.options] -  alternatives to respond when your type is heuristic
     * @param {object} [payload.data.postTest] - object with google form for pretest
     * @param {?string} [payload.data.postTest.form] -  google form link
     * @param {object} [payload.data.preTest] - object with google form for post-test
     * @param {?string} [payload.data.preTest.form] - google form link 
     * @param {?string} [payload.data.preTest.consent] - google form link
     * @param {object[]} [payload.data.tasks] - structure test when its type is user
     * @returns {string} docRef - the test's identification 
     */
    createTest({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "test" });

      let docRef = dispatch("createObject", payload)
        .then((doc) => {
          return doc.id;
        })
        .catch((err) => commit("setError", "Error in createTest." + err));
      return docRef;
    },
    /**
     * This action gets all test in database, using the generic function "getAllObjects" 
     * 
     * @deprecated
     * @action getTests=setTests
     * @param {object} payload - empty object
     * @returns {void}
     */
    async getTests({ commit, dispatch }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "test" });
      var tests = await dispatch("getAllObjects", payload)
        .catch((err) => commit("setError", "Error in getTests." + err));
      commit("setTests", tests);
    },
    /**
     * This action deletes a test, the generic function "deleteObject",
     *  passing the test data 
     * 
     * @action deleteTest 
     * @param {object} payload - test's data 
     * @param {string} [payload.collection = test] -  local in database 
     * @param {string} payload.answers  - answers collection reference identification
     * @param {string} payload.cooperators -cooperators collection reference identification
     * @param {string} payload.reports - reports collection reference identification
     * @param {string} [payload.template] - template collection reference identification
     * @param {object} payload.admin - test's administrator data
     * @param {string} payload.admin.id - administrator identification
     * @param {string} payload.admin.email - administrator email
     * @param {Date} payload.date - test created date 
     * @param {string} payload.title - test title 
     * @param {string} payload.description - test description
     * @param {string} payload.type - test type
     * @param {object} [payload.answersSheet] - standard object to answer the test
     * @param {number} payload.answersSheet.total
     * @param {number} payload.answersSheet.progress
     * @param {object[]} payload.answersSheet.heuristics
     * @param {object[]} [payload.heuristics] - structure test when its type is heuristic
     * @param {object[]} [payload.options] -  alternatives to respond when your type is heuristic
     * @param {object} [payload.postTest] - object with google form for pretest
     * @param {?string} [payload.postTest.form] -  google form link
     * @param {object} [payload.preTest] - object with google form for post-test
     * @param {?string} [payload.preTest.form] - google form link 
     * @param {?string} [payload.preTest.consent] - google form link
     * @param {object[]} [payload.tasks] - structure test when its type is user
     * @returns {void}
     */
    async deleteTest({ dispatch, commit }, payload) {
      commit("setLoading", true);
      await dispatch("getCooperators", { id: payload.cooperators })
        .catch((err) => commit("setError", "Error in deleteTest." + err));

      let coops = this.state.cooperators.cooperators;

      //delete test from user
      payload = Object.assign(payload, { collection: "test" }); //Delete test from Tests' Collection
      dispatch("deleteObject", payload)
        .then(() => {
          dispatch("deleteReport", { id: payload.reports })
            .catch((err) => commit("setError", "Error in deleteTest." + err));

          dispatch("deleteAnswers", { id: payload.answers })
            .catch((err) => commit("setError", "Error in deleteTest." + err));

          coops.cooperators.forEach(coop => {
            if (coop.accessLevel.value <= 1)
              dispatch("removeMyCoops", {
                docId: coop.id,
                element: {
                  id: payload.id,
                  title: payload.title,
                  type: payload.type,
                },
              })
                .catch((err) => commit("setError", "Error in deleteTest." + err));
            else
              dispatch("removeMyAnswers", {
                docId: coop.id,
                element: {
                  id: payload.id,
                  title: payload.title,
                  type: payload.type,
                },
              })
                .catch((err) => commit("setError", "Error in deleteTest." + err));
          })

          dispatch("deleteCooperators", { id: payload.cooperators })
            .catch((err) => commit("setError", "Error in deleteTest." + err));
        })
        .catch((err) => commit("setError", "Error in deleteTest." + err));
    },
    /**
     *This action gets a test by id, using the generic function "getObject" 
     *
     * @action getTest=setTest 
     * @param {object} payload - test's data 
     * @param {string} [payload.collection = test] -  local in database 
     * @param {string} payload.id - test's identification code
     * @returns {void}
     */
    async getTest({ commit, dispatch }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "test" });

      var test = await dispatch("getObject", payload)
        .catch((err) => commit("setError", "Error in getTest." + err));

      commit("setTest", test);
    },
    /**
     * This action updates the test, 
     * using a the generic function "updateObject" sending the update data
     * 
     * @action updateTest
     * @param {object} payload - data to update
     * @param {string} [payload.collection = test] -  local in database  
     * @param {string} payload.docId - test identification
     * @param {object} payload.data - updated test data 
     * @param {string} payload.data.answers  - answers collection reference identification
     * @param {object} payload.data.admin - test's administrator data
     * @param {string} payload.data.admin.id - administrator identification
     * @param {string} payload.data.admin.email - administrator email
     * @param {Date} payload.data.date - test created date 
     * @param {string} payload.data.title - test title 
     * @param {string} payload.data.description - test description
     * @param {string} payload.data.type - test type
     * @param {object} [payload.data.answersSheet] - standard object to answer the test
     * @param {number} payload.data.answersSheet.total
     * @param {number} payload.data.answersSheet.progress
     * @param {object[]} payload.data.answersSheet.heuristics
     * @param {object[]} [payload.data.heuristics] - structure test when its type is heuristic
     * @param {object[]} [payload.data.options] -  alternatives to respond when your type is heuristic
     * @param {object} [payload.data.postTest] - object with google form for pretest
     * @param {?string} [payload.data.postTest.form] -  google form link
     * @param {object} [payload.data.preTest] - object with google form for post-test
     * @param {?string} [payload.data.preTest.form] - google form link 
     * @param {?string} [payload.data.preTest.consent] - google form link
     * @param {object[]} [payload.data.tasks] - structure test when its type is user
     * @returns {void}
     */
    updateTest({ dispatch, commit }, payload) {
     
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "test" });

      dispatch("updateObject", payload)
        .catch((err) => commit("setError", "Error in updateTest." + err));
    },
    /**
     * This test adds response to the test
     * @deprecated
     */
    pushTestAnswer({ dispatch, commit }, payload) {
      console.log("pushTestAnswer",payload)
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "test" });

      dispatch("pushObject", payload)
        .catch((err) => commit("setError", "Error in pushTestAnswer." + err));
    },
    /**
     * This action adds a new cooperator
     * @deprecated
     */
    async pushCoop({ dispatch, commit }, payload) {
      console.log("pushCoop",payload)
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "test", param: "coop" });

      dispatch("pushObject", payload)
        .catch((err) => commit("setError", "Error in pushCoop." + err));
    },
    /**
     * this action defines the  reference of the reports collection, using the generic function "setParamInObject" 
     * 
     * @action setReportID
     * @param {object} payload - data 
     * @param {string} payload.data -  reports collection reference identification
     * @param {string} payload.docId - test identification
     * @param {string} [payload.param = reports ] - field to update
     * @returns {void}
     */
    setReportID({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "test",
        param: "reports"
      });

      dispatch("setParamInObject", payload)
        .catch((err) => commit("setError", "Error in setReportID." + err));
    },
    /**
     * this action defines the  reference of the answers collection, using the generic function "setParamInObject"
     * 
     * @action setAnswerID
     * @param {object} payload - data 
     * @param {string} payload.data -  answers collection reference identification
     * @param {string} payload.docId - test identification
     * @param {string} [payload.param = answers ] - field to update
     * @returns {void}
     */
    setAnswerID({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "test", param: "answers" });

      dispatch("setParamInObject", payload)
        .catch((err) => commit("setError", "Error in setAnswerID." + err));
    },
    /**
     * this action defines the  reference of the cooperators collection, using the generic function "setParamInObject"
     * 
     * @action {setCooperatorsID}
     * @param {object} payload - data 
     * @param {string} payload.data - cooperators collection reference identification
     * @param {string} payload.docId - test identification
     * @param {string} [payload.param = cooperators ] - field to update
     * @returns {void}
     */
    setCooperatorsID({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "test", param: "cooperators" });

      dispatch("setParamInObject", payload)
        .catch((err) => commit("setError", "Error in setCooperatorsID." + err));
    },
    /**
     * Identified when the test is updated, using the generic function "setParamInObject"
     * 
     * @action setUpToDate
     * @param {object} payload - data 
     * @param {string} payload.docId - test identification
     * @param {boolean} payload.data - identified when the test is updated
     * @returns {void}
     */
    setUpToDate({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "test", param: "template.upToDate" });

      dispatch("setParamInObject", payload)
        .catch((err) => commit("setError", "Error in setUpToDate." + err));
    }
  },
};
