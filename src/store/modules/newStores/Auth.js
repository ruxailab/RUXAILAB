import api from "@/api";

/**
 * Auth Store Module
 * @module auth
 */

 export default {
  state: {
    User: null,
  },
  getters: {
    User(state) {
      return state.User;
    },
  },
  mutations: {
    setUser(state, payload) {
      state.User = payload;
    }
  },
  actions: {
    /**
     * This action register a User on the platform, 
     * using the API and creates the observer for the User's metadata in the database
     * 
     * @action signup 
     * @param {object} payload - Data to create a new User 
     * @param {string} payload.email - the User email
     * @param {string} payload.password - the User password 
     * @returns {void}
     */
    async authSingUp({ commit }, payload) {
      commit("setLoading", true);
      try {
        let User = await api.auth.authSingUp(payload);
        User = await api.database.getObject({
          collection: "Users",
          id: User.uid,
        });
        User = Object.assign({ uid: User.id }, User.data());
        api.database.observer({ docId: User.uid, collection: "Users" }, commit);
      } catch (err) {
        console.error("Error when creating User :(", err);
        commit("setError", err);
      } finally {
        //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
        commit("setLoading", false);
      }
    },
    /**
     *This action connects a User to the platform, using the API 
     and creates the observer for the User's metadata in the database
     * 
     * @action signin=setUser
     * @param {object} payload - Data to create a new User 
     * @param {string} payload.email - the User email
     * @param {string} payload.password - the User password 
     * @returns {void}
    */
    async authSingIn({ commit }, payload) {
      commit("setLoading", true);
      try {
        var User = await api.auth.authSingIn(payload);
        User = await api.database.getObject({
          collection: "Users",
          id: User.uid,
        });
        User = Object.assign({ uid: User.id }, User.data());

        api.database.observer({ docId: User.uid, collection: "Users" }, commit);
        commit("setUser", User);
      } catch (err) {
        console.error("Error signing in: " + err);
        commit("setError", err);
      } finally {
        //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
        commit("setLoading", false);
      }
    },
    /**
     * This action disconnects the User from the platform
     * 
     *  @action signin=[setUser=null]
     *  @returns {void}
     */
    async authSingOut({ commit }) {
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
     * This action automatically reconnects the User to the platform when 
     * reloading or entering the page, using the API and creates the observer for the User's metadata
     *
     *  @action signin=setUser
     *  @returns {void}
     */
    async authGetCurrentUser({ commit }) {
      try {
        var User = await api.auth.getCurrentUser();
        if (User) {
          User = await api.database.getObject({
            collection: "Users",
            id: User.uid,
          });
          User = Object.assign({ uid: User.id }, User.data());
          api.database.observer(
            { docId: User.uid, collection: "Users" },
            commit
          );
          commit("setUser", User);
        }
      } catch (err) {
        console.error("Error auto signing in ", err);
      } finally {
        //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
        commit("setLoading", false);
      }
    },
    /**
     * This action updates the User's metadata
     *  
     * @action setUser=setUser
     * @param {object} User - User's data
     * @param {number} User.accessLevel - User acess permition 
     * @param {string} User.collection -  local in database 
     * @param {string} User.email - User's email
     * @param {string} User.id -User's indentification
     * @param {object[]} User.myAnswers - test list that User is repling
     * @param {object[]} User.myCoops- test list that User is cooperator
     * @param {object[]} User.myTests - User's test list 
     * @param {object[]} User.notifications - notificatinons recived 
     * @returns {void}
     */
    setUser({ commit }, User) {
      commit("setUser", User);
    },
    /**
     * This action excludes User authentication by calling a firebase function
     * 
     * @action deleteAuth
     * @param {object} User - User's data
     * @param {number} User.accessLevel - User acess permition 
     * @param {string} User.collection -  local in database 
     * @param {string} User.email - User's email
     * @param {string} User.id -User's indentification
     * @param {object[]} User.myAnswers - test list that User is repling
     * @param {object[]} User.myCoops- test list that User is cooperator
     * @param {object[]} User.myTests - User's test list 
     * @param {object[]} User.notifications - notificatinons recived 
     */
    async deleteAuth({ dispatch }, User) {
      // await api.auth.deleteUserAuth(User);
      dispatch("callFunction", Object.assign({}, {
        function: 'deleteAuth',
        data: User
      }))
    }
  }
}
