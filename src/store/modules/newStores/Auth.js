import { auth } from "@/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth'


/**
 * Auth Store Module
 * @module Auth
 */

//import AuthController
// import AuthController from "@/controllers/AuthController.js";
import UserController from "@/controllers/UserController";

// const AuthCont = new AuthController();
//const UserCont = new UserController();

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
        SET_USER(state, payload) {
            state.user = payload;
        },
    },
    actions: {
        /**
         * This action register a User on the platform,
         * using the API and creates the observer for the User's metadata in the db
         *
         * @action signup
         * @param {object} payload - Data to create a new User
         * @param {string} payload.email - the User email
         * @param {string} payload.password - the User password
         * @returns {void}
         */

        async signup({ commit }, payload) {
            commit("setLoading", true);
            try {
                const response = await createUserWithEmailAndPassword(auth, payload.email, payload.password)
                if (response) {
                    const dbUser = await new UserController().getById(response.user.uid)
                    commit('SET_USER', dbUser)
                } else {
                    throw new Error('Signup failed')
                }
            } catch (err) {
                console.error("Error when creating user", err);
                commit("setError", err);
            } finally {
                commit("setLoading", false);
            }
        },

        async signin({ commit }, payload) {
            commit("setLoading", true);
            try {
                const response = await signInWithEmailAndPassword(auth, payload.email, payload.password)
                if (response) {
                    const dbUser = await new UserController().getById(response.user.uid)
                    commit('SET_USER', dbUser)
                } else {
                    throw new Error('Login failed')
                }
            } catch (err) {
                console.error("Error signing in: " + err);
                commit("setError", err);
            } finally {
                commit("setLoading", false);
            }
        },

        async logout({ commit }) {
            try {
                await signOut(auth)
                commit('SET_USER', null)
            } catch (err) {
                console.error("Error logging out.", err);
            } finally {
                //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
                commit("setLoading", false);
            }
        },

        async autoSignIn({ commit }) {
            var user = auth.currentUser;
            if (user) {
                try {
                    const dbUser = await new UserController().getById(user.uid)
                    commit('SET_USER', dbUser)
                } catch (e) {
                    console.error(e)
                }

            }
        },

    }
}
