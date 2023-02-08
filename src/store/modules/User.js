/**
 * User store module
 * @module user
 */

//import UserController
import UserController from "@/controllers/UserController.js";

const UserCont = new UserController();

export default {
    state: {
        users: null,
        module: "user",
    },
    getters: {
        /**
         * @name Getters
         * @type {object}
         * @getter {object[]} Admins=Users Returns a user array with Users whose access level is 1
         */
        admins(state) {
            return state.users.filter((item) => {
                return item.accessLevel == 1;
            });
        },
        users(state) {
            return state.Users;
        },
    },
    mutations: {
        SET_USERS(state, payload) {
            state.users = payload;
        },
    },
    actions: {
        async getAllUsers({ commit }) {
            try {
                const res = await UserCont.readAll()
                commit('SET_USERS', res)
            } catch (e) {
                console.error(e)
            }
        }
    }
}