export default {
  state: {
    test: null,
    tests: null,
    myTests: null,
    loading: false,
    snackMessage: null,
    snackColor: null,
    managerIDs: null
  },
  mutations: {
    setTest(state, payload) {
      state.test = payload;
    },
    setTests(state, payload) {
      state.tests = payload;
    },
    setLoading(state, payload) {
      state.loading = payload;
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
    coops(state){
      return state.test.coop;
    },
    loading(state) {
      return state.loading;
    },
    snackColor(state) {
      return state.snackColor;
    },
    snackMessage(state) {
      return state.snackMessage;
    }
  },
  actions: {
    createTest({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "test" });
      let docRef = dispatch("createObject", payload)
        .then((doc) => {
          return doc.id;
        })
        .catch(() => {
          console.error("Error to create test!");
        });
      return docRef;
    },
    async getTests({ commit, dispatch }, payload) {
      payload = Object.assign(payload, { collection: "test" });
      commit("setLoading", true);
      var tests = await dispatch("getAllObjects", payload);
      commit("setTests", tests);
      commit("setLoading", false);
    },
    async deleteTest({ dispatch }, payload) {
      // await dispatch("getTest", { id: payload.id });
      await dispatch("getCooperators", { id: payload.cooperators });

      let coops = this.state.cooperators.cooperators;
      
      //delete test from user
      payload = Object.assign(payload, { collection: "test" }); //Delete test from Tests' Collection
      dispatch("deleteObject", payload)
      .then(() => {
        dispatch("deleteReport", { id: payload.reports });
        dispatch("deleteAnswers", { id: payload.answers });
      
      coops.cooperators.forEach(coop => {
        if(coop.accessLevel.value <= 1) dispatch("removeMyCoops", {
          docId: coop.id,
          element: {
            id: payload.id,
            title: payload.title,
            type: payload.type,
          },
        });
        else dispatch("removeMyAnswers", {
          docId: coop.id,
          element: {
            id: payload.id,
            title: payload.title,
            type: payload.type,
          },
        });
      })

        dispatch("deleteCooperators", { id: payload.cooperators });
      })

      //delete user from test
    },
    async getTest({ commit, dispatch }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "test" });
      var test = await dispatch("getObject", payload);
      commit("setTest", test);
      commit("setLoading", false);
    },
    updateTest({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "test" });
      dispatch("updateObject", payload)
        .catch(() => {
          console.error("Error to update");
        });
    },
    pushTestAnswer({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "test" });
      dispatch("pushObject", payload)
        .catch((err) => {
          console.error("Error to push answer " + err);
        });
    },
    async pushCoop({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "test", param: "coop" });
      dispatch("pushObject", payload)
        .catch((err) => {
          console.error("Error to push coops ", err);
        });
    },
    setReportID({dispatch},payload){
      payload = Object.assign(payload,{collection:"test",
      param:"reports"})
      dispatch("setParamInObject",payload).
      catch((err) => {
        console.error("Error set report id ",err)
      })
    },
    setAnswerID( { dispatch }, payload) {
      payload = Object.assign(payload, {collection: "test", param: "answers"});

      dispatch("setParamInObject", payload)
      .catch((err) => {
        console.error("Error ", err);
      })
    },
    setCooperatorsID( { dispatch }, payload) {
      payload = Object.assign(payload, {collection: "test", param: "cooperators"});

      dispatch("setParamInObject", payload)
      .catch((err) => {
        console.error("Error ", err);
      })
    },
    setUpToDate({dispatch}, payload) {
      payload = Object.assign(payload, {collection: "test", param: "template.upToDate"});

      dispatch("setParamInObject", payload)
      .catch((err) => {
        console.error("Error ", err);
      })
    }
  },
};
