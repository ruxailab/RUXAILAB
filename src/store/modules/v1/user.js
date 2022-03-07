export default {
    state: {
        users: null,
        user: null,
    },
    getters: {
        /**
         * @name Getters
         * @type {object} 
         * @getter {object[]} admins=users Returns a user array with users whose access level is 1
         */
        admins(state) {
            return state.users.filter((item) => {
                return item.accessLevel == 1;
            });
        },
        users(state) {
            return state.users;
        },
        mutations: {
            setUsers(state, payload) {
                state.users = payload;
            },
        },
        actions: {
            // get users
            async getUsers({ commit, dispatch }, payload) {
                commit("setLoading", true);
                payload = Object.assign(payload, { collection: "users" });

                var users = await dispatch("getAllObjects", payload)
                    .catch((err) => commit("setError", "Error in getUsers." + err));

                commit("setUsers", users);
            },

            // create user
            createUser({ dispatch, commit }, payload) {
                commit("setLoading", true);
                payload = Object.assign(payload, { collection: "users" });

                let docId = dispatch("createObject", payload)
                    .then((doc) => {
                        return doc.id;
                    })
                    .catch((err) => commit("setError", "Error in createUser." + err));

                return docId;
            },

            // update user
            updateTestAnswer({ dispatch, commit }, payload) {
                commit("setLoading", true);
                payload = Object.assign(payload, { collection: "users" });

                dispatch("updateObject", payload)
                    .catch((err) => commit("setError", "Error in updateUsers." + err));
            },

            // delete user
            deleteUser({ dispatch, commit }, payload) {
                commit("setLoading", true);

                //Delete from  Users' colletion
                payload = Object.assign(payload, { collection: 'users' })
                dispatch('deleteObject', payload)
                    .catch((err) => commit("setError", "Error in deleteUser." + err));


                //Remove User Relations
                if (payload.myTests.length) {
                    payload.myTests.forEach(test => {
                        dispatch("deleteTest", test)
                            .catch((err) => commit("setError", "Error in deleteUser." + err));
                    });
                }


                if (payload.myCoops.length) {
                    payload.myCoops.forEach(test => {
                        dispatch('removeCooperator', {
                            docId: test.cooperators,
                            element: {
                                id: payload.id
                            }
                        })
                            .catch((err) => commit("setError", "Error in deleteUser." + err));
                    })
                }


                if (payload.myAnswers.length) {
                    payload.myAnswers.forEach(test => {
                        if (!test.answersSheet.submitted) {
                            var log = {
                                date: new Date().toLocaleString("en-US"),
                                progress: '-',
                                status: "User Deleted"
                            };

                            dispatch("updateLog", {
                                docId: test.reports,
                                elementId: payload.id,
                                element: log
                            })
                                .catch((err) => commit("setError", "Error in deleteUser." + err));
                        }
                    })
                }
            },


            // update level
            async updateLevel({ commit, dispatch }, payload) {
                commit("setLoading", true);
                payload = Object.assign(payload, { function: "setUserRole" });

                await dispatch("callFunction", payload)
                    .catch((err) => commit("setError", "Error in updateLevel." + err));

                dispatch("getUsers", {});
            },

            // push notification
            pushNotification({ dispatch, commit }, payload) {
                commit("setLoading", true);
                payload = Object.assign(payload, { collection: "users" });

                dispatch("pushObject", payload)
                    .then(() => {
                        commit("setSuccess", "Invitations sent succesfully");
                    })
                    .catch((err) => commit("setError", "Error in pushNotification." + err));
            },

            // remove notification
            removeNotification({ dispatch, commit }, payload) {
                commit("setLoading", true);
                payload = Object.assign(payload, {
                    collection: "users",
                    param: "notifications",
                });

                dispatch("removeObject", payload)
                    .catch((err) => commit("setError", "Error in removeNotification." + err));
            },
        }
    },
}
