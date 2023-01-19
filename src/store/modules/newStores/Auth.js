import { auth} from "@/firebase";
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
            console.log(state.user)
        },

        // SET_USERS(state, payload) {
        //     state.user = payload;
        //     console.log(state.user)
        // },
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

        async signup(context, payload){
            const response = await createUserWithEmailAndPassword(auth, payload.email, payload.password)
            if (response) {
                context.commit('SET_USER', response.user)
            } else {
                throw new Error('Signup failed')
            }
        },

        async signin(context, payload){
            const response = await signInWithEmailAndPassword(auth, payload.email, payload.password)
            if (response) {
                context.commit('SET_USER', response.user)
            } else {
                throw new Error('Login failed')
            }
        },

        async logout(context){
            await signOut(auth)

            context.commit('SET_USER', null)
        },

        async autoSignIn(context) {
            try {
                var user = auth.currentUser;
                if (user) {
                    await new UserController()
                        .read("users", "email", user.email)
                        .then((response) => {
                            context.commit("SET_USER", response[0]);
                        });
                }
            } catch (err) {
                console.error("Error auto signing in ", err);
            }
        },

    }
   
}

        // async authSingUp({ commit }, payload) {
        //     commit("setLoading", true);
        //     try {
        //         let User = await auth.createUserWithEmailAndPassword(payload);
        //         User = await UserCont.getObjectUser({
        //             collection: "users",
        //             id: User.uid,
        //         });
        //         User = Object.assign({ uid: User.id }, User.data());
        //         db.observer({ docId: User.uid, collection: "users" }, commit);
        //     } catch (err) {
        //         console.error("Error when creating User :(", err);
        //         commit("setError", err);
        //     } finally {
        //         //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
        //         commit("setLoading", false);
        //     }

            //Connect to controllers
            // try {
            //     const res = await AuthCont.authSingUp();
            //     commit("SET_USERS", res);
            // } catch {
            //     console.log("Error in authSingUp");
            //     commit("setError", true);
            // } finally {
            //     commit("setLoading", false);
            // }
    //     },

    //     /**
    //  *This action connects a User to the platform, using the API 
    //  and creates the observer for the User's metadata in the db
    //  * 
    //  * @action signin=SET_USERS
    //  * @param {object} payload - Data to create a new User 
    //  * @param {string} payload.email - the User email
    //  * @param {string} payload.password - the User password 
    //  * @returns {void}
    // */

    //     async authSingIn({ commit }, payload) {
    //         commit("setLoading", true);
    //         try {
    //             console.log("asas");
    //             let User = await AuthCont.authSingIn(
    //                 payload.email,
    //                 payload.password
    //             );
    //             console.log("huh");
    //             //var User = await auth.authSingIn(payload);

    //             let AuxUser = (User = await UserCont.getObjectUser(
    //                 "uuid",
    //                 User.uid
    //             ));
    //             console.log("teste");
    //             // AuxUser = Object.assign({ uid: User.uid }, User.data());

    //             // db.observer(
    //             //     { docId: AuxUser.uid, collection: "Users" },
    //             //     commit
    //             // );
    //             commit("SET_USERS", AuxUser);
    //         } catch (err) {
    //             console.error("Error signing in: " + err);
    //             commit("setError", err);
    //         } finally {
    //             //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
    //             // commit("setLoading", false);
    //         }
    //     },

    //     /**
    //      * This action disconnects the User from the platform
    //      *
    //      *  @action signin=[SET_USERS=null]
    //      *  @returns {void}
    //      */
    //     async authSingOut({ commit }) {
    //         try {
    //             await auth.singOut();
    //             commit("SET_USERS", null);
    //         } catch (err) {
    //             console.error("Error logging out.", err);
    //         } finally {
    //             //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
    //             commit("setLoading", false);
    //         }

    //         //Connect to controllers
    //         try {
    //             const res = await AuthCont.authSingOut();
    //             commit("SET_USERS", res);
    //         } catch {
    //             console.log("Error in authSingOut");
    //             commit("setError", true);
    //         } finally {
    //             commit("setLoading", false);
    //         }
    //     },

    //     /**
    //      * This action automatically reconnects the User to the platform when
    //      * reloading or entering the page, using the API and creates the observer for the User's metadata
    //      *
    //      *  @action signin=SET_USERS
    //      *  @returns {void}
    //      */
    //     async authGetCurrentUser({ commit }) {
    //         try {
    //             var User = await auth.getCurrentUser();
    //             if (User) {
    //                 User = await db.getObject({
    //                     collection: "users",
    //                     id: User.uid,
    //                 });
    //                 User = Object.assign({ uid: User.id }, User.data());
    //                 db.observer(
    //                     { docId: User.uid, collection: "users" },
    //                     commit
    //                 );
    //                 commit("SET_USERS", User);
    //             }
    //         } catch (err) {
    //             console.error("Error auto signing in ", err);
    //         } finally {
    //             //Statements that are executed after the try statement completes. These statements execute regardless of whether an exception was thrown or caught.
    //             commit("setLoading", false);
    //         }

    //         //Connect to controllers
    //         try {
    //             const res = await AuthCont.authGetCurrentUser();
    //             commit("SET_USERS", res);
    //         } catch {
    //             console.log("Error in authGetCurrentUser");
    //             commit("setError", true);
    //         } finally {
    //             commit("setLoading", false);
    //         }
    //     },

    //     /**
    //      * This action excludes User authentication by calling a firebase function
    //      *
    //      * @action deleteAuth
    //      * @param {object} User - User's data
    //      * @param {number} User.accessLevel - User acess permition
    //      * @param {string} User.collection -  local in db
    //      * @param {string} User.email - User's email
    //      * @param {string} User.id -User's indentification
    //      * @param {object[]} User.myAnswers - test list that User is repling
    //      * @param {object[]} User.myCoops- test list that User is cooperator
    //      * @param {object[]} User.myTests - User's test list
    //      * @param {object[]} User.notifications - notificatinons recived
    //      */
    //     async deleteAuth({ dispatch }, User) {
    //         // await auth.deleteUserAuth(User);
    //         dispatch(
    //             "callFunction",
    //             Object.assign(
    //                 {},
    //                 {
    //                     function: "deleteAuth",
    //                     data: User,
    //                 }
    //             )
    //         );
    //     },
//     },
// };
