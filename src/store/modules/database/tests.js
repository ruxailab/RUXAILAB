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
    loading(state) {
      return state.loading;
    },
  },
  actions: {
    createTest({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "test" });
      let docRef = dispatch("createObject", payload)
        .then((doc) => {
          console.log("Test created!");
          return doc.id;
          //commit('setAlert',{error: false, msg:'Test created!'})
        })
        .catch(() => {
          console.error("Error to create test!");
          //commit('setAlert',{error: true, msg:'Error to create test!'})
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
        .then(() => {
          console.log("Test updated successfully ");
        })
        .catch(() => {
          console.error("Error to update");
        });
    },
    pushTestAnswer({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "test" });
      dispatch("pushObject", payload)
        .then(() => {
          console.log("Push successfully");
        })
        .catch((err) => {
          console.error("Error to push answer " + err);
        });
    },
    async pushCoop({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "test", param: "coop" });
      dispatch("pushObject", payload)
        .then(() => {
          console.log("Push coops successful");
        })
        .catch((err) => {
          console.error("Error to push coops ", err);
        });
    },
  },
};
