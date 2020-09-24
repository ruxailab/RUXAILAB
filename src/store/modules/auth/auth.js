import api from "@/api";

export default {
  state: {
    user: null,
  },
  getters: {
    user(state) {
      return state.user;
    },
    setLoading(state) {
      return state.Loading
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
        let user = await api.auth.signUp(payload);
        user = await api.database.getObject({
          collection: "users",
          id: user.uid,
        });
        user = Object.assign({ uid: user.id }, user.data());
        api.database.observer({ docId: user.uid, collection: "users" }, commit);
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
      } finally {
        //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
        commit("setLoading", false);
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
      } finally {
        //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
        commit("setLoading", false);
      }
    },
    setUser({ commit }, user) {
      commit("setUser", user);
    },
    async deleteAuth({ dispatch }, user) {
      // await api.auth.deleteUserAuth(user);
      dispatch("callFunction", Object.assign({}, {
        function: 'deleteAuth',
        data: user
      }))
    }
  },
};
