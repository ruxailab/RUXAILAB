/**
 * Tests Store Module
 * @module Tests
 */

 export default {
    state: {
      Test: null,
      Tests: null,
      MyTests: null,
      SnackMessage: null,
      SnackColor: null,
      ManagerIDs: null,
    },
    getters: {
      Tests(state) {
        return state.Tests;
      },
      Test(state) {
        return state.Test;
      },
      Tasks(state) {
        return state.Test.Tasks;
      },
      HeuristicsTest(state) {
        return state.Test.HeuristicsTest;
      },
      Coops(state) {
        return state.Test.coop;
      },
      SnackColor(state) {
        return state.SnackColor;
      },
      SnackMessage(state) {
        return state.SnackMessage;
      },
      ManagerIDs(state) {
        return state.ManagerIDs;
      },
    },
    mutations: {
      setTest(state, payload) {
        state.Test = payload;
      },
      setTests(state, payload) {
        state.Tests = payload;
      },
      setMyTests(state, payload) {
        state.MyTests = payload;
      },
      setError(state, payload) {
        state.SnackMessage = payload;
        state.SnackColor = "red";
      },
      setSuccess(state, payload) {
        state.SnackMessage = payload;
        state.SnackColor = "success";
      },
      resetSnack(state) {
        state.SnackMessage = null;
        state.SnackColor = null;
      },
      setManagerIDs(state, payload) {
        state.ManagerIDs = payload;
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
       createNewTest({ dispatch, commit }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "Test" });
  
        let docRef = dispatch("createObject", payload)
          .then((doc) => {
            return doc.id;
          })
          .catch((err) => commit("setError", "Error in createNewTest." + err));
        return docRef;
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
      async deleteTest({ dispatch, commit }, payload) {
        commit("setLoading", true);
        await dispatch("getCooperators", {
          id: payload.cooperators,
        }).catch((err) => commit("setError", "Error in deleteTest." + err));
  
        let Coops = this.state.cooperators.cooperators;
  
        //delete Test from user
        payload = Object.assign(payload, { collection: "Test" }); //Delete Test from Tests' Collection
        dispatch("deleteObject", payload)
          .then(() => {
            dispatch("deleteReport", { id: payload.reports }).catch((err) =>
              commit("setError", "Error in deleteTest." + err)
            );
  
            dispatch("deleteAnswers", { id: payload.answers }).catch((err) =>
              commit("setError", "Error in deleteTest." + err)
            );
  
            Coops.cooperators.forEach((coop) => {
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
      updateTest({ dispatch, commit }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "Test" });
  
        dispatch("updateObject", payload).catch((err) =>
          commit("setError", "Error in updateTest." + err)
        );
      },

      /**
       *This action gets a Test by id, using the generic action "getObject"
       *
       * @action getTest=setTest
       * @param {object} payload - Test's data
       * @param {string} [payload.collection = Test] -  local in database
       * @param {string} payload.id - Test's identification code
       * @returns {void}
       */
      async getObjectTest({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "Test" });
  
        var Test = await dispatch("getObject", payload).catch((err) =>
          commit("setError", "Error in getObjectTest." + err)
        );
  
        commit("setTest", Test);
      },

      async getObjectTestAdmin({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "Test" });
  
        var Test = await dispatch("getObject", payload).catch((err) =>
          commit("setError", "Error in getObjectTestAdmin." + err)
        );
  
        commit("setTest", Test);
      },

      async getObjectTestStructure({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "Test" });
  
        var Test = await dispatch("getObject", payload).catch((err) =>
          commit("setError", "Error in getObjectTestStructure." + err)
        );
  
        commit("setTest", Test);
      },

      async getObjectTestStructureOptions({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "Test" });
  
        var Test = await dispatch("getObject", payload).catch((err) =>
          commit("setError", "Error in getObjectTestStructureOptions." + err)
        );
  
        commit("setTest", Test);
      },

      async getObjectTestTemplateDoc({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "Test" });
  
        var Test = await dispatch("getObject", payload).catch((err) =>
          commit("setError", "Error in getObjectTestTemplateDoc." + err)
        );
  
        commit("setTest", Test);
      },

       /**
       * This action gets all Test in database, using the generic action "getAllObjects"
       *
       * @deprecated
       * @action getTests=setTests
       * @param {object} payload - empty object
       * @returns {void}
       */
        async getAllTest({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "Test" });
            var Tests = await dispatch("getAllObjects", payload).catch((err) =>
              commit("setError", "Error in getAllTest." + err)
            );
            commit("setTests", Tests);
        },

        async getAllTestAdmin({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "Test" });
            var Tests = await dispatch("getAllObjects", payload).catch((err) =>
              commit("setError", "Error in getAllTestAdmin." + err)
            );
            commit("setTests", Tests);
        },

        async getAllTestStructure({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "Test" });
            var Tests = await dispatch("getAllObjects", payload).catch((err) =>
              commit("setError", "Error in getAllTestStructure." + err)
            );
            commit("setTests", Tests);
        },

        async getAllTestStructureOptions({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "Test" });
            var Tests = await dispatch("getAllObjects", payload).catch((err) =>
              commit("setError", "Error in getAllTestStructureOptions." + err)
            );
            commit("setTests", Tests);
        },

        async getAllTestTemplateDoc({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "Test" });
            var Tests = await dispatch("getAllObjects", payload).catch((err) =>
              commit("setError", "Error in getAllTestTemplateDoc." + err)
            );
            commit("setTests", Tests);
        },


    },
  };
  