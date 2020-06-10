export default {
  state: {
    users: null,
  },
  getters: {
    admins(state) {
      return state.users.filter((item) => {
        return item.accessLevel == 1;
      });
    },
  },
  mutations: {
    setUsers(state, payload) {
      state.users = payload;
    },
  },
  actions: {
    async getUsers({ commit, dispatch }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "users" }); //adiciona collection ao objeto passado
      var users = await dispatch("getAllObjects", payload); //chama action que retorna tudo que tem na collection do objeto passado
      commit("setUsers", users); //guarda o array na users da store
      commit("setLoading", false);
    },
    async updateLevel({ commit, dispatch }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { function: "setUserRole" });
      await dispatch("callFunction", payload);
      dispatch("getUsers", {});
    },
    async pushMyTest({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "users" });
      dispatch("pushObject", payload)
        .catch((err) => {
          console.error("Error to push myTest ", err);
        });
    },
    async updateMyTest({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "users", param: "myTests" })
      dispatch("updateArrayObject", payload)
        .catch((err) => {
          console.error("Error to update myTests ", err);
        });
    },
    async removeMyTest({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "users" });
      dispatch("removeObject", payload)
        .catch((err) => {
          console.error("Error to remove myTest ", err);
        });
    },
    async pushNotification({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "users" });
      dispatch("pushObject", payload)
        .catch((err) => {
          console.error("Error to push notifications ", err);
        });
    },
    async removeNotification({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "users", param: "notifications" })
      dispatch("removeObject", payload)
        .catch((err) => {
          console.error('Error ', err);
        })
    },
    async pushMyCoops({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "users", param: "myCoops" })
      dispatch("pushObject", payload)
        .catch((err) => {
          console.error("Error to push myCoops ", err);
        });
    },
    async updateMyCoops({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "users", param: "myCoops" })
      dispatch("updateArrayObject", payload)
        .catch((err) => {
          console.error("Error to update myCoops ", err);
        });
    },
    async removeMyCoops({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "users", param: "myCoops" })

      dispatch("removeObject", payload)
        .catch((err) => {
          console.error('Error to remove myCoop ', err);
        })
    },
    pushMyAnswers({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: 'users', param: 'myAnswers' });

      dispatch('pushObject', payload)
        .catch((err) => {
          console.error('Error pushing answers: ', err);
        })
    },
    async updateMyAnswers({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "users", param: "myAnswers" })
      dispatch("updateArrayObject", payload)
        .catch((err) => {
          console.error("Error to update myAnswers ", err);
        });
    },
    removeMyAnswers({ dispatch }, payload) {
      payload = Object.assign(payload, { collection: "users", param: "myAnswers" });

      dispatch("removeObject", payload)
        .catch((err) => {
          console.error('Error ', err);
        })
    }
  }
};
