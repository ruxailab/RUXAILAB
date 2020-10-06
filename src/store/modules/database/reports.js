export default {
  state: {
    reports: null,
  },
  getters: {
    reports(state) {
      return state.reports
    },
  },
  mutations: {
    setReports(state, payload) {
      state.reports = payload;
    }
  },
  actions: {
    createReport({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "reports" });

      let docRef = dispatch("createObject", payload)
        .then((doc) => {
          return doc.id;
        })
        .catch((err) => commit("setError", "Error in createReport." + err));

      return docRef;
    },
    deleteReport({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "reports" });

      dispatch("deleteObject", payload)
        .catch((err) => commit("setError", "Error in deleteReport." + err));
    },
    async getReports({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "reports" });

      let reps = await dispatch("getObject", payload)
        .catch((err) => commit("setError", "Error in getReports." + err));

      commit("setReports", reps);
    },
    pushLog({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "reports",
        param: "reports",
      });

      dispatch("pushObject", payload)
        .catch((err) => commit("setError", "Error in pushLog." + err));
    },
    updateLog({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "reports",
        field: "reports",
        param: "log",
        identifier: "uid",
      });

      dispatch("updateArrayElement", payload)
        .catch((err) => commit("setError", "Error in updateLog." + err));
    },
    updateTestReport({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "reports" });

      dispatch("updateObject", payload)
        .catch((err) => commit("setError", "Error in updateTestReport." + err));
    },
    removeReport({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "reports" });

      dispatch("removeObject", payload)
        .catch((err) => commit("setError", "Error in removeReport." + err));
    }
  },
};
