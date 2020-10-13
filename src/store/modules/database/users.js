/**
 * Users store module
 * @module users
 */

export default {
  state: {
    users: null,
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
    }
  },
  mutations: {
    setUsers(state, payload) {
      state.users = payload;
    },
  },
  actions: {
    /**
     *  This action gets all users from users collection ,
     *  using the generic action {@link getAllObjects}
     * 
     * @action getUsers=setUsers
     * @param {object} payload - empty object
     * @returns {void}
     */
    async getUsers({ commit, dispatch }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "users" });

      var users = await dispatch("getAllObjects", payload)
        .catch((err) => commit("setError", "Error in getUsers." + err));

      commit("setUsers", users);
    },
    /**
     * This action updates the user Level , 
     * using the generic action {@link callFunction }, 
     * passing the user data 
     * 
     * @action updateLevel
     * @param {object} payload - updated data  
     * @param {object} payload.data - updated user data 
     * @param {string} payload.data.uid - user identification
     * @param {object} payload.data.customClaims - object a new parameter
     * @param {number} payload.data.customClaims.accessLevel - updated  user access Level
     * @returns {void}
     */
    async updateLevel({ commit, dispatch }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { function: "setUserRole" });

      await dispatch("callFunction", payload)
        .catch((err) => commit("setError", "Error in updateLevel." + err));

      dispatch("getUsers", {});
    },
    /**
     * This action adds a new test into user test array, 
     * using the generic action {@link pushObject },  
     * passing the user data 
     * 
     * @action pushMyTest
     * @param {object} payload - data 
     * @param {string} payload.docId - user identification
     * @param {object} payload.element - new test data 
     * @param {string} payload.element.id - test identification
     * @param {string} payload.element.title - test title
     * @param {string} payload.element.type - test type
     * @param {string} payload.element.reports - reports document identification
     * @param {string} payload.element.answers - answers document identification
     * @param {string} payload.element.cooperators - cooperators documents identification
     * @param {number} payload.element.accessLevel - user access level on this test
     * @param {string} [payload.element.template] -template document identification
     * @param {string} payload.element.date - test creation date
     * @param {string} payload.param - user array to be add the new object
     * @returns{void}
     */
    pushMyTest({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "users" });

      dispatch("pushObject", payload)
        .catch((err) => commit("setError", "Error in pushMyTest." + err));
    },
    /**
     * This action updates a test in to the user's test array, 
     * using the generic action {@link updateArrayObject}, 
     * passing the user data
     * 
     * @action updateMyTest
     * @param {object} payload - updated data 
     * @param {string} payload.docId - user identification
     * @param {object} payload.element - new test data 
     * @param {string} payload.element.id - test identification
     * @param {string} payload.element.title - test title
     * @param {string} payload.element.type - test type
     * @param {string} payload.element.reports - reports document identification
     * @param {string} payload.element.answers - answers document identification
     * @param {string} payload.element.cooperators - cooperators documents identification
     * @param {number} payload.element.accessLevel - user access level on this test
     * @param {string} payload.element.date - test creation date
     * @param {string} payload.param - user array to be update the object
     * @param {string} [payload.element.template] -template document identification
     * @returns{void}
     */
    updateMyTest({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myTests",
      });

      dispatch("updateArrayObject", payload)
        .catch((err) => commit("setError", "Error in updateMyTest." + err));
    },
    /**
     * This action removes a test in to the user's test array, 
     * using the generic action {@link removeObject}, 
     * passing the user data 
     * 
     * @action removeMyTest
     * @param {object} payload - data
     * @param {string} payload.docId - user identification 
     * @param {object} payload.element - test data to be delete
     * @param {string} payload.element.id - test identification
     * @param {string} payload.element.title - test title
     * @param {string} payload.element.type - test.type
     * @param {string} payload.param - user array to be delete the object
     * @returns {void} 
     */
    removeMyTest({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "users" });

      dispatch("removeObject", payload)
        .catch((err) => commit("setError", "Error in removeMyTest." + err));
    },
    /**
     * This action adds a notification in to the user's notification array, 
     * using the generic action {@link pushObject}, 
     * passing the user data
     * 
     * @action pushNotification 
     * @param {object} payload - data 
     * @param {string} payload.docId - identification of the user who will receive the invitation
     * @param {object} payload.element - invitation data
     * @param {string} payload.element.id - invitation identification
     * @param {object} payload.element.to - recivier data
     * @param {string} payload.element.to.id - user identification
     * @param {string} payload.element.to.email - user email 
     * @param {number} payload.element.to.accessLevel - user access level
     * @param {object} payload.element.from -sender data
     * @param {string} payload.element.from.id -user identification
     * @param {string} payload.element.from.email - user email 
     * @param {object} payload.element.test - test data
     * @param {string} payload.element.test.id - test identification
     * @param {string} payload.element.test.title - test title
     * @param {string} payload.element.test.type - test type
     * @param {string} payload.element.test.reports - reports document identification
     * @param {string} payload.element.test.answers - answers document identification
     * @param {string} payload.element.test.cooperators - cooperators documents identification
     * @param {string} payload.param - user array to be add the new object
     * @returns {void} 
     */
    pushNotification({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, { collection: "users" });

      dispatch("pushObject", payload)
        .then(() => {
          commit("setSuccess", "Invitations sent succesfully");
        })
        .catch((err) => commit("setError", "Error in pushNotification." + err));
    },
    /**
     * This action removes a notification to the user's notification array, 
     * using the generic action {@link removeObject}, 
     * passing the user data
     * 
     * @action removeNotification
     * @param {object} payload - data
     * @param {string} payload.docId - user identification
     * @param {object} payload.element - notification data
     * @param {string} payload.element.id - notification identification 
     * @returns {void}
     */
    removeNotification({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "notifications",
      });

      dispatch("removeObject", payload)
        .catch((err) => commit("setError", "Error in removeNotification." + err));
    },
    /**
     * This action adds a test into user cooperatorion array, 
     * using the generic action {@link pushObject },  
     * passing the user data 
     * 
     * @action pushMyCoops 
     * @param {object} payload - data
     * @param {string} payload.docId - user identification
     * @param {object} payload.element - new test data 
     * @param {string} payload.element.id - test identification
     * @param {string} payload.element.title - test title
     * @param {string} payload.element.type - test type
     * @param {string} payload.element.reports - reports document identification
     * @param {string} payload.element.answers - answers document identification
     * @param {string} payload.element.cooperators - cooperators documents identification
     * @param {number} payload.element.accessLevel - user access level on this test
     * @param {string} [payload.element.template] -template document identification
     * @returns {void}
     */
    pushMyCoops({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myCoops",
      });

      dispatch("pushObject", payload)
        .catch((err) => commit("setError", "Error in pushMyCoops." + err));
    },
    /**
     * This action updates a test into the user's cooperatorion array, 
     * using the generic action {@link updateArrayObject}, 
     * passing the user data
     * 
     * @action updateMyCoops
     * @param {object} payload - updates data
     * @param {string} payload.docId - user identification
     * @param {object} payload.element - new test data 
     * @param {string} payload.element.id - test identification
     * @param {string} payload.element.title - test title
     * @param {string} payload.element.type - test type
     * @param {string} payload.element.reports - reports document identification
     * @param {string} payload.element.answers - answers document identification
     * @param {string} payload.element.cooperators - cooperators documents identification
     * @param {number} payload.element.accessLevel - user access level on this test
     * @param {string} [payload.element.template] -template document identification
     * @returns {void}
     */
    updateMyCoops({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myCoops",
      });

      dispatch("updateArrayObject", payload)
        .catch((err) => commit("setError", "Error in updateMyCoops." + err));
    },
    /**
     * This action removes a test in to the user's cooperatorion array, 
     * using the generic action {@link removeObject}, 
     * passing the user data 
     * 
     * @action removeMyCoops
     * @param {object} payload - data
     * @param {string} payload.docId - user identification 
     * @param {object} payload.element - test data to be delete
     * @param {string} payload.element.id - test identification
     * @param {string} payload.element.title - test title
     * @param {string} payload.element.type - test.type
     * @param {string} payload.param - user array to be delete the object
     * @returns {void} 
     */
    removeMyCoops({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myCoops",
      });

      dispatch("removeObject", payload)
        .catch((err) => commit("setError", "Error in removeMyCoops." + err));
    },
    /**
     * This action updates the access level of a test in the user's cooperation array, 
     * using the generic action {@link updateArrayElement}, 
     * assigning the user data
     * 
     * @action updateAccessLevel
     * @param {object} payload - data
     * @param {string} payload.docId - user identification
     * @param {string} payload.elementId- test identification
     * @param {number} payload.element - update access level
     * @param {string} payload.param - parameter to be update 
     * @returns {void}
     */
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
    /**
     * This action adds a new answer sheets into user tests answer array, 
     * using the generic action {@link pushObject }, 
     * passing the user data 
     * 
     * @action pushMyAnswers
     * @param {object} payload - data
     * @param {string} payload.docId - user identification
     * @param {object} payload.element - data to be add
     * @param {string} payload.element.id - test identification
     * @param {string} payload.element.title - test title
     * @param {string} payload.element.type - test type
     * @param {string} payload.element.reports - reports document identification
     * @param {string} payload.element.answers - answers document identification
     * @param {string} payload.element.cooperators - cooperators documents identification
     * @param {object} [payload.element.answersSheet] - standard object to answer the test
     * @param {number} payload.element.answersSheet.total - total questions answered
     * @param {number} payload.element.answersSheet.progress - complete test percentage
     * @param {object[]} payload.element.answersSheet.heuristics - answers
     * @param {boolean} payload.element.answersSheet.submited - flag to inform sending response
     * @param {number} payload.element.accessLevel - user access level on this test
     * @returns {void}
     */
    pushMyAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myAnswers",
      });

      dispatch("pushObject", payload)
        .catch((err) => commit("setError", "Error in pushMyAnswers." + err));
    },
    /**
     * This action update the answer sheet  into user tests answer array,
     * using the generic action {@link updateArrayObject},
     * passing the user data
     * 
     * @action updateMyAnswers
     * @param {object} payload - updated data
     * @param {string} payload.docId - user identification
     * @param {object} payload.element - data to be add
     * @param {string} payload.element.id - test identification
     * @param {string} payload.element.title - test title
     * @param {string} payload.element.type - test type
     * @param {string} payload.element.reports - reports document identification
     * @param {string} payload.element.answers - answers document identification
     * @param {string} payload.element.cooperators - cooperators documents identification
     * @param {object} [payload.element.answersSheet] - standard object to answer the test
     * @param {number} payload.element.answersSheet.total - total questions answered
     * @param {number} payload.element.answersSheet.progress - complete test percentage
     * @param {object[]} payload.element.answersSheet.heuristics - answers
     * @param {boolean} payload.element.answersSheet.submited - flag to inform sending response
     * @param {number} payload.element.accessLevel - user access level on this test
     * @returns {void}
     */
    updateMyAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myAnswers",
      });

      dispatch("updateArrayObject", payload)
        .catch((err) => commit("setError", "Error in updateMyAnswers." + err));
    },
    /**
     * This action removes the answer sheet  into user tests answer array, 
     * using the generic action {@link removeObject}, 
     * passing the user data
     * 
     * @action removeMyAnswers
     * @param {object} payload - data
     * @param {string} payload.docId - user identification
     * @param {object} payload.element - answer data
     * @param {string} payload.element.id - answer identification 
     * @returns {void}
     */
    removeMyAnswers({ dispatch, commit }, payload) {
      commit("setLoading", true);
      payload = Object.assign(payload, {
        collection: "users",
        param: "myAnswers",
      });

      dispatch("removeObject", payload)
        .catch((err) => commit("setError", "Error in removeMyAnswers." + err));
    },
    /**
     * This action deletes the user and its relationships with other tests and users
     * 
     * @action deleteUser
     * @param {object} payload - user data  
     * @param {number} payload.accessLevel - user acess permition 
     * @param {string} payload.collection -  local in database 
     * @param {string} payload.email - user's email
     * @param {string} payload.id -user's indentification
     * @param {object[]} payload.myAnswers - test list that user is repling
     * @param {object[]} payload.myCoops- test list that user is cooperator
     * @param {object[]} payload.myTests - user's test list 
     * @param {object[]} payload.notifications - notificatinons recived 
     * @returns {void}
     */
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
          if (!test.answersSheet.submited) {
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
