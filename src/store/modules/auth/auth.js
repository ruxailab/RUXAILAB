import api from "@/api";
import { auth } from "../../../firebase";
import Controller from "../../../controllers/BaseController";
import { signInWithEmailAndPassword } from "firebase/auth";


/**
 * Auth store module
 * @module auth
 */

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
     * This action register a user on the platform, 
     * using the API and creates the observer for the user's metadata in the database
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
     *This action connects a user to the platform, using the API 
     and creates the observer for the user's metadata in the database
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
        await signInWithEmailAndPassword(auth, payload.email, payload.password)
          await new Controller().read("users", "email", auth.currentUser.email).then((response) => {
            commit("setUser", response[0])
          })
      }catch (err) {
        console.error("Error signing in: " + err);
        commit("setError", err);
      } finally {
        //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
        commit("setLoading", false);
      }
    },

   /**
     * This action disconnects the user from the platform
     * 
     *  @action signin=[setUser=null]
     *  @returns {void}
     */
    async logout({ commit }) {
      try {
        await api.auth.signOut();
        commit("setUser", null);
      } catch (err) {
        console.error("Error logging out.", err);
      } finally {
        //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
        commit("setLoading", false);
      }
    },

    /**
     * This action automatically reconnects the user to the platform when 
     * reloading or entering the page, using the API and creates the observer for the user's metadata
     *
     *  @action signin=setUser
     *  @returns {void}
     */
    async autoSignIn({ commit }) {
      try {
        var user = auth.currentUser
        if (user) {
          await new Controller().read("users", "email", auth.currentUser.email).then((response) => {
            commit("setUser", response[0]);
          })
        }
      } catch (err) {
        console.error("Error auto signing in ", err);
      } finally {
        //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
        commit("setLoading", false);
      }
    },

    /**
     * This action updates the user's metadata
     *  
     * @action setUser=setUser
     * @param {object} user - user's data
     * @param {number} user.accessLevel - user acess permition 
     * @param {string} user.collection -  local in database 
     * @param {string} user.email - user's email
     * @param {string} user.id -user's indentification
     * @param {object[]} user.myAnswers - test list that user is repling
     * @param {object[]} user.myCoops- test list that user is cooperator
     * @param {object[]} user.myTests - user's test list 
     * @param {object[]} user.notifications - notificatinons recived 
     * @returns {void}
     */
    setUser({ commit }, user) {
      commit("setUser", user);
    },
    /**
     * This action excludes user authentication by calling a firebase function
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
      // await api.auth.deleteUserAuth(user);
      dispatch("callFunction", Object.assign({}, {
        function: 'deleteAuth',
        data: user
      }))
    }
  },
};
