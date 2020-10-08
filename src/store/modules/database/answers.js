/**
 * Answers store module
 * @module answers
 */

export default {
  state: {
    answers: null,
  },
  getters: {
    answers(state) {
      return state.answers
    }
  },
  mutations: {
    setAnswers(state, payload) {
      state.answers = payload;
    }
  },
  actions: {
    createAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "answers" });

      let docId = dispatch("createObject", payload)
        .then((doc) => {
          return doc.id;
        })
        .catch((err) => commit("setError", "Error in createAnswers." + err));

      return docId;
    },
    pushAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "answers",
        param: "answers",
      });

      dispatch("pushObject", payload)
        .catch((err) => commit("setError", "Error in pushAnswers." + err));
    },
    async getAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "answers" });

      let ans = await dispatch("getObject", payload)
        .catch((err) => commit("setError", "Error in getAnswers." + err));

      commit("setAnswers", ans);
    },
    deleteAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "answers" });

      dispatch("deleteObject", payload)
        .catch((err) => commit("setError", "Error in deleteAnswers." + err));
    },
    updateTestAnswer({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "answers" });

      dispatch("updateObject", payload)
        .catch((err) => commit("setError", "Error in updateTestAnswer." + err));
    },
  },
};
