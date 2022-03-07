export default {

    // verify all the getters and mutations if they exist

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
          // create test
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

          // send email invitation for colaborators

          //getTests
          async getTests({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "test" });
            var tests = await dispatch("getAllObjects", payload)
              .catch((err) => commit("setError", "Error in getTests." + err));
            commit("setTests", tests);
          },

          // get test by id
          async getTests({ commit, dispatch }, payload) {
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "test" });
            var tests = await dispatch("getAllObjects", payload)
              .catch((err) => commit("setError", "Error in getTests." + err));
            commit("setTests", test);
          },

          // delete test
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

          //update test
          updateTest({ dispatch, commit }, payload) {
     
            commit("setLoading", true);
            payload = Object.assign(payload, { collection: "test" });
      
            dispatch("updateObject", payload)
              .catch((err) => commit("setError", "Error in updateTest." + err));
          },
      }
}