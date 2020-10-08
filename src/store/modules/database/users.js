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
    users(state) {
      return state.users;
    }
  },
  mutations: {
    setUsers(state, payload) {
      state.users = payload;
    },
  },
  actions: {
    async getUsers({ commit, dispatch }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "users" });

      var users = await dispatch("getAllObjects", payload)
        .catch((err) => commit("setError", "Error in getUsers." + err));

      commit("setUsers", users);
    },
    async updateLevel({ commit, dispatch }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { function: "setUserRole" });

      await dispatch("callFunction", payload)
        .catch((err) => commit("setError", "Error in updateLevel." + err));

      dispatch("getUsers", {});
    },
    pushMyTest({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "users" });

      dispatch("pushObject", payload)
        .catch((err) => commit("setError", "Error in pushMyTest." + err));
    },
    updateMyTest({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myTests",
      });

      dispatch("updateArrayObject", payload)
        .catch((err) => commit("setError", "Error in updateMyTest." + err));
    },
    removeMyTest({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "users" });

      dispatch("removeObject", payload)
        .catch((err) => commit("setError", "Error in removeMyTest." + err));
    },
    pushNotification({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "users" });

      dispatch("pushObject", payload)
        .then(() => {
          commit("setSuccess", "Invitations sent succesfully");
        })
        .catch((err) => commit("setError", "Error in pushNotification." + err));
    },
    removeNotification({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "notifications",
      });

      dispatch("removeObject", payload)
        .catch((err) => commit("setError", "Error in removeNotification." + err));
    },
    pushMyCoops({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myCoops",
      });

      dispatch("pushObject", payload)
        .catch((err) => commit("setError", "Error in pushMyCoops." + err));
    },
    updateMyCoops({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myCoops",
      });

      dispatch("updateArrayObject", payload)
        .catch((err) => commit("setError", "Error in updateMyCoops." + err));
    },
    removeMyCoops({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myCoops",
      });

      dispatch("removeObject", payload)
        .catch((err) => commit("setError", "Error in removeMyCoops." + err));
    },
    updateAccessLevel({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        field: "myCoops",
        identifier: "cooperators",
      });

      dispatch("updateArrayElement", payload)
        .catch((err) => commit("setError", "Error in updateAccessLevel." + err));
    },
    pushMyAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myAnswers",
      });

      dispatch("pushObject", payload)
        .catch((err) => commit("setError", "Error in pushMyAnswers." + err));
    },
    updateMyAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myAnswers",
      });

      dispatch("updateArrayObject", payload)
        .catch((err) => commit("setError", "Error in updateMyAnswers." + err));
    },
    removeMyAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myAnswers",
      });

      dispatch("removeObject", payload)
        .catch((err) => commit("setError", "Error in removeMyAnswers." + err));
    },
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

    }

  },
};
