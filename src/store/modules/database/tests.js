export default {
  state: {
    test: null,
    tests: null,
    myTests: null,
    loading: false,
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
    answers(state) {
      return state.test.answers;
    },
    coops(state){
      return state.test.coop;
    },
    loading(state) {
      return state.loading;
    },
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
    deleteTest({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "test" });
      return dispatch("deleteObject", payload);
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
    }
  },
};
