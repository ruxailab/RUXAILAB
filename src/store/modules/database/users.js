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
      console.log(payload);
      payload = Object.assign(payload, { collection: "users" });
      dispatch("pushObject", payload)
        .then(() => {
          console.log("Push Successful");
        })
        .catch((err) => {
          console.error("Error to push myTest ", err);
        });
    },
    async removeMyTest({ dispatch }, payload) {
      console.log(payload);
      payload = Object.assign(payload, { collection: "users" });
      dispatch("removeObject", payload)
        .then(() => {
          console.log("Remove Successful");
        })
        .catch((err) => {
          console.error("Error to remove myTest ", err);
        });
    },
  },
};
