import api from "@/api";

export default {
  state: {
    user: null,
  },
  getters: {
    user(state) {
      return state.user;
    },
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    }
  },
  actions: {
    /**
     * This action sign up a user in platform
     * 
     * @action signup 
     * @param {object} payload - Data to create a new user 
     * @param {string} payload.email - the user email
     * @param {string} payload.password - the user password 
     * @returns {void}
     */
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
    /**
     * This action sign in the user the platform
     * 
     * @action signin=setUser
     * @param {object} payload - Data to create a new user 
     * @param {string} payload.email - the user email
     * @param {string} payload.password - the user password 
     * @returns {void}
    */
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
    /**
     * This action log out user of platform
     * 
     *  @action signin=[setUser=null]
     *  @returns {void}
     */
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
    /**
     * This action reconnect user automatically to platform when 
     * reload or come in the page
     *
     *  @action signin=setUser
     *  @returns {void}
     */
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
    /**
     * This action delete the user's authentication
     * 
     * @action deleteAuth
     * @param {object} user - user's data
     * @param {number} user.accessLevel - user acess permition 
     * @param {string} user.collection -  local in database 
     * @param {string} user.email - user's email
     * @param {string} user.id -user's indentification
     * @param {object[]} user.myAnswers - test list that user is repling
     * @param {object[]} user.myCoops- test list that user is cooperator
     * @param {object[]} user.myTests - user's test list 
     * @param {object[]} user.notifications - notificatinons recived 
     */
    async deleteAuth({ dispatch }, user) {
      console.log(user)
      // await api.auth.deleteUserAuth(user);
      dispatch("callFunction", Object.assign({}, {
        function: 'deleteAuth',
        data: user
      }))
    }
  },
};
