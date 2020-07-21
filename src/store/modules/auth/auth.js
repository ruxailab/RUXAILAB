import api from "@/api";

export default {
  state: {
    user: null,
  },
  getters: {
    user(state) {
      return state.user;
    }
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    }
  },
  actions: {
    async signup({ commit }, payload) {
      commit("setLoading", true);
      try {
        await api.auth.signUp(payload);
        commit("setUser", payload);
      } catch (err) {
        console.error("Error when creating user :(", err);
        commit("setError", err);
      } finally {
        //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
        commit("setLoading", false);
      }
    },
    async signin({ commit }, payload) {
      commit("setLoading", true);
      try {
        var user = await api.auth.signIn(payload);
        user = await api.database.getObject({
          collection: "users",
          id: user.uid,
        });
        user = Object.assign({ uid: user.id }, user.data());

        api.database.observer({ docId: user.uid, collection: "users" }, commit);
        commit("setUser", user);
      } catch (err) {
        console.error("Error signing in: " + err);
        commit("setError", err);
      } finally {
        //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
        commit("setLoading", false);
      }
    },
    async logout({ commit }) {
      try {
        await api.auth.singOut();
        commit("setUser", null);
      } catch (err) {
        console.error("Error logging out.", err);
      }
    },
    async autoSignIn({ commit }) {
      try {
        var user = await api.auth.getCurrentUser();
        if (user) {
          user = await api.database.getObject({
            collection: "users",
            id: user.uid,
          });
          user = Object.assign({ uid: user.id }, user.data());
          api.database.observer(
            { docId: user.uid, collection: "users" },
            commit
          );
          commit("setUser", user);
        }
      } catch (err) {
        console.error("Error auto signing in ", err);
      }
    },
    setUser({ commit }, user) {
      commit("setUser", user);
    },
  },
};
