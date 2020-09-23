import template from "@/assets/template.js"
export default {
  state: {
    cooperators: null,
  },
  getters: {
    getCooperatorByToken: (state) => (token) => {
      return state.cooperators.cooperators.filter(cooperator => cooperator.token == token)
    }
  },
  mutations: {
    setCooperators(state, payload) {
      state.cooperators = payload;
    },
    setLoading(state,payload){
      state.loading = payload
    }
  },
  actions: {
    createCooperators({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "cooperators" });

      let docId = dispatch("createObject", payload)
        .then((doc) => {
          return doc.id;
        })
        .catch((err) => {
          console.error("Error ", err);
        });

      return docId;
    },
    async getCooperators({ dispatch, commit }, payload) {
      payload = Object.assign(payload, { collection: "cooperators" });
      commit("setLoading",true)
      let coop = await dispatch("getObject", payload);
      commit("setCooperators", coop);
      commit("setLoading",false)
    },
    pushCooperator({ dispatch }, payload) {
      payload = Object.assign(payload, {
        collection: "cooperators",
        param: "cooperators",
      });

      dispatch("pushObject", payload).catch((err) => {
        console.error("Error pushing", err);
      });
    },
    updateCooperator({ dispatch }, payload) {
      payload = Object.assign(payload, {
        collection: "cooperators",
        field: "cooperators",
      });
      if (!payload.identifier)
        Object.assign(payload, { identifier: "id", })
      dispatch("updateArrayElement", payload).catch((err) => {
        console.error("Error updating element", err);
      });
    },
    updateCooperatorObject({ dispatch }, payload) {
      payload = Object.assign(payload, {
        collection: "cooperators",
        field: "cooperators",
      });
      if (!payload.identifier)
        Object.assign(payload, { identifier: "id", })
      dispatch("updateArrayElementObject", payload).catch((err) => {
        console.error("Error updating element", err);
      });
    },
    removeCooperator({ dispatch }, payload) {
      payload = Object.assign(payload, {
        collection: "cooperators",
        param: "cooperators",
      });
      dispatch("removeObject", payload).catch((err) => {
        console.error("Error ", err);
      });
    },
    deleteCooperators({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "cooperators" });

      dispatch("deleteObject", payload).catch((err) => {
        console.error("Error ", err);
      });
    },
    updateTestCooperators({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "cooperators" });
      dispatch("updateObject", payload).catch(() => {
        console.error("Error to update");
      });
    },
    sendEmailInvitation({ dispatch }, payload) {
      let link = `${payload.domain}/${payload.path}/${payload.testId}/${payload.token}`
      Object.assign(payload, { link: link })
      dispatch("callFunction", Object.assign({}, {
        function: 'sendEmail', data: Object.assign(payload, { template: template.getTemplate(payload) }
        )
      }));
    }
  },
};
