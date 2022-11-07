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
      managerIDs: null,
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
      },
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
        state.snackColor = "red";
      },
      setSuccess(state, payload) {
        state.snackMessage = payload;
        state.snackColor = "success";
      },
      resetSnack(state) {
        state.snackMessage = null;
        state.snackColor = null;
      },
      setManagerIDS(state, payload) {
        state.managerIDs = payload;
      },
    },
    actions: {
      /**
       * This action creates a new test, using the generic action "createObject" to creates the object,
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
       * @param {number} payload.data.answersSheet.total - total questions answered
       * @param {number} payload.data.answersSheet.progress - complete test percentage
       * @param {object[]} payload.data.answersSheet.heuristics - answers
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
       createNewTest({ dispatch, commit }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "test" });
  
        let docRef = dispatch("createObject", payload)
          .then((doc) => {
            return doc.id;
          })
          .catch((err) => commit("setError", "Error in createNewTest." + err));
        return docRef;
      },
     
      /**
       * This action deletes a test,using the generic action "deleteObject",
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
        await dispatch("getCooperators", {
          id: payload.cooperators,
        }).catch((err) => commit("setError", "Error in deleteTest." + err));
  
        let coops = this.state.cooperators.cooperators;
  
        //delete test from user
        payload = Object.assign(payload, { collection: "test" }); //Delete test from Tests' Collection
        dispatch("deleteObject", payload)
          .then(() => {
            dispatch("deleteReport", { id: payload.reports }).catch((err) =>
              commit("setError", "Error in deleteTest." + err)
            );
  
            dispatch("deleteAnswers", { id: payload.answers }).catch((err) =>
              commit("setError", "Error in deleteTest." + err)
            );
  
            coops.cooperators.forEach((coop) => {
              if (coop.accessLevel.value <= 1)
                dispatch("removeMyCoops", {
                  docId: coop.id,
                  element: {
                    id: payload.id,
                    title: payload.title,
                    type: payload.type,
                  },
                }).catch((err) =>
                  commit("setError", "Error in deleteTest." + err)
                );
              else
                dispatch("removeMyAnswers", {
                  docId: coop.id,
                  element: {
                    id: payload.id,
                    title: payload.title,
                    type: payload.type,
                  },
                }).catch((err) =>
                  commit("setError", "Error in deleteTest." + err)
                );
            });
  
            dispatch("deleteCooperators", {
              id: payload.cooperators,
            }).catch((err) => commit("setError", "Error in deleteTest." + err));
          })
          .catch((err) => commit("setError", "Error in deleteTest." + err));
      },

        /**
       * This action updates the test,
       * using a the generic action "updateObject" sending the update data
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
  
        dispatch("updateObject", payload).catch((err) =>
          commit("setError", "Error in updateTest." + err)
        );
      },

      /**
       *This action gets a test by id, using the generic action "getObject"
       *
       * @action getTest=setTest
       * @param {object} payload - test's data
       * @param {string} [payload.collection = test] -  local in database
       * @param {string} payload.id - test's identification code
       * @returns {void}
       */
      async getObjectTest({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "test" });
  
        var test = await dispatch("getObject", payload).catch((err) =>
          commit("setError", "Error in getObjectTest." + err)
        );
  
        commit("setTest", test);
      },

      async getObjectTestAdmin({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "test" });
  
        var test = await dispatch("getObject", payload).catch((err) =>
          commit("setError", "Error in getObjectTestAdmin." + err)
        );
  
        commit("setTest", test);
      },

      async getObjectTestStructure({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "test" });
  
        var test = await dispatch("getObject", payload).catch((err) =>
          commit("setError", "Error in getObjectTestStructure." + err)
        );
  
        commit("setTest", test);
      },

      async getObjectTestStructureOptions({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "test" });
  
        var test = await dispatch("getObject", payload).catch((err) =>
          commit("setError", "Error in getObjectTestStructureOptions." + err)
        );
  
        commit("setTest", test);
      },

      async getObjectTestTemplateDoc({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "test" });
  
        var test = await dispatch("getObject", payload).catch((err) =>
          commit("setError", "Error in getObjectTestTemplateDoc." + err)
        );
  
        commit("setTest", test);
      },

       /**
       * This action gets all test in database, using the generic action "getAllObjects"
       *
       * @deprecated
       * @action getTests=setTests
       * @param {object} payload - empty object
       * @returns {void}
       */
        async getAllTest({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "test" });
            var tests = await dispatch("getAllObjects", payload).catch((err) =>
              commit("setError", "Error in getAllTest." + err)
            );
            commit("setTests", tests);
        },

        async getAllTestAdmin({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "test" });
            var tests = await dispatch("getAllObjects", payload).catch((err) =>
              commit("setError", "Error in getAllTestAdmin." + err)
            );
            commit("setTests", tests);
        },

        async getAllTestStructure({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "test" });
            var tests = await dispatch("getAllObjects", payload).catch((err) =>
              commit("setError", "Error in getAllTestStructure." + err)
            );
            commit("setTests", tests);
        },

        async getAllTestStructureOptions({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "test" });
            var tests = await dispatch("getAllObjects", payload).catch((err) =>
              commit("setError", "Error in getAllTestStructureOptions." + err)
            );
            commit("setTests", tests);
        },

        async getAllTestTemplateDoc({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "test" });
            var tests = await dispatch("getAllObjects", payload).catch((err) =>
              commit("setError", "Error in getAllTestTemplateDoc." + err)
            );
            commit("setTests", tests);
        },


    },
  };
  