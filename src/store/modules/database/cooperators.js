import template from "@/assets/template.js"

/**
 * Cooperators store module
 * @module cooperators
*/

export default {
  state: {
    cooperators: null,
  },
  getters: {
    cooperators(state) {
      return state.cooperators
    }
  },
  mutations: {
    setCooperators(state, payload) {
      state.cooperators = payload;
    }
  },
  actions: {
    createCooperators({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "cooperators" });

      let docId = dispatch("createObject", payload)
        .then((doc) => {
          return doc.id;
        })
        .catch((err) => commit("setError", "Error in createCooperators." + err));

      return docId;
    },
    async getCooperators({ dispatch, commit }, payload) {
      commit("setLoading", true)
      payload = Object.assign(payload, { collection: "cooperators" });

      let coop = await dispatch("getObject", payload)
        .catch((err) => commit("setError", "Error in getCooperators." + err));

      commit("setCooperators", coop);
    },
    pushCooperator({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "cooperators",
        param: "cooperators",
      });

      dispatch("pushObject", payload)
        .catch((err) => commit("setError", "Error in pushCooperator." + err));
    },
    updateCooperator({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "cooperators",
        field: "cooperators",
      });

      if (!payload.identifier)
        Object.assign(payload, { identifier: "id", });

      dispatch("updateArrayElement", payload)
        .catch((err) => commit("setError", "Error in updateCooperator." + err));
    },
    updateCooperatorObject({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "cooperators",
        field: "cooperators",
      });

      if (!payload.identifier)
        Object.assign(payload, { identifier: "id", });

      dispatch("updateArrayElementObject", payload)
        .catch((err) => commit("setError", "Error in updateCooperatorObject." + err));
    },
    removeCooperator({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "cooperators",
        param: "cooperators",
      });

      dispatch("removeObject", payload)
        .catch((err) => commit("setError", "Error in removeCooperator." + err));
    },
    deleteCooperators({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "cooperators" });

      dispatch("deleteObject", payload)
        .catch((err) => commit("setError", "Error in deleteCooperators." + err));
    },
    updateTestCooperators({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "cooperators" });

      dispatch("updateObject", payload)
        .catch((err) => commit("setError", "Error in updateTestCooperators." + err));
    },
    sendEmailInvitation({ dispatch, commit }, payload) {
      commit("setLoading", true);
      let link = `${payload.domain}/${payload.path}/${payload.testId}/${payload.token}`;
      Object.assign(payload, { link: link });

      dispatch("callFunction", Object.assign({}, {
        function: 'sendEmail', data: Object.assign(payload, { template: template.getTemplate(payload) }
        )
      }))
        .catch((err) => commit("setError", "Error in sendEmailInvitation." + err));
    }
  },
};
