export default {
  state: {
    answers: null,
  },
  getters: {
    answers(state){
      return state.answers
    }
  },
  mutations: {
    setAnswers(state, payload) {
      state.answers = payload;
    }
  },
  actions: {
    createAnswers({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "answers" });

      let docId = dispatch("createObject", payload)
        .then((doc) => {
          return doc.id;
        })
        .catch((err) => {
          console.error("Error ", err);
        });

      return docId;
    },
    pushAnswers({ dispatch }, payload) {
      payload = Object.assign(payload, {
        collection: "answers",
        param: "answers",
      });

      dispatch("pushObject", payload).catch((err) => {
        console.error("Error pushing log ", err);
      });
    },
    async getAnswers({ dispatch, commit }, payload) {
      commit("setLoading",true);
      payload = Object.assign(payload, { collection: "answers" });
      let ans = await dispatch("getObject", payload);
      commit("setAnswers", ans);
      commit("setLoading",false);
    },
    deleteAnswers({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "answers" });

      dispatch("deleteObject", payload).catch((err) => {
        console.error("Error ", err);
      });
    },
    updateTestAnswer({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "answers" });
      dispatch("updateObject", payload).catch(() => {
        console.error("Error to update");
      });
    },
  },
};
