/**
 * User store module
 * @module User
 */

//import UserController
import UserController from '@/controllers/UserController.js'

const UserCont = new UserController()



 export default {
    state: {
      Users: null,
      module: 'Users'
    },
    getters: {
      /**
       * @name Getters
       * @type {object} 
       * @getter {object[]} Admins=Users Returns a user array with Users whose access level is 1
       */
      Admins(state) { 
        return state.Users.filter((item) => {
          return item.accessLevel == 1;
        });
      },
      Users(state) {
        return state.Users;
      }
    },
    mutations: {
      SET_USERS(state, payload) {
        state.Users = payload;
      },
    },
    actions: {

        /**
       * This action adds a new test into user test array, 
       * using the generic action {@link pushObject},  
       * passing the user data 
       * 
       * @action createNewUser
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
       * @returns {void}
       */
 
        async createNewUser({ dispatch, commit }, payload){
          commit('setLoading', true)
          
          payload = Object.assign(payload, { collection: "Users" })
          dispatch("pushObject", payload)
            .catch((err) => commit("setError", "Error in createNewUser." + err));
          

          //Connect to controllers
          try{
            const res = await UserCont.createNewUser()
            commit('SET_USERS', res)

          } catch{
              console.log('Error in createNewUser')
              commit('setError', true)

          } finally{
              commit('setLoading', false)
          }
        },



      /**
       * This action deletes the user and its relationships with other tests and Users
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

        async deleteUser({ dispatch, commit }, payload){
          commit('setLoading', true)
          try{
            
            //Delete from  Users' colletion
            payload = Object.assign(payload, { collection: 'Users' })
            dispatch('deleteObject', payload)

            //Remove User Relations

            //Tests
            if (payload.myTests.length) {
              payload.myTests.forEach(test => {
                dispatch("deleteTest", test)
              });
            }


            //Cooperators
            if (payload.myCoops.length) {
              payload.myCoops.forEach(test => {
                dispatch('removeCooperator',{
                  docId: test.cooperators,
                  element: {
                    id: payload.id
                  }
                })
              })
            }


            //Answers
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
                }
              })
            }
          }
          catch{
            console.log('Error in deleteUser')
            commit('setError', true)
          }


          //Connect to controllers
          try{
            const res = await UserCont.deleteUser()
            commit('SET_USERS', res)

          } catch{
              console.log('Error in deleteUser')
              commit('setError', true)

          } finally{
              commit('setLoading', false)
          }
        },

      /**
       *This action gets a user by id, using the generic action "getObject"
       *
       * @action getUser=setUser
       * @param {object} payload - user's data
       * @param {string} [payload.collection = user] -  local in database
       * @param {string} payload.id - user's identification code
       * @returns {void}
       */

       async getObjectUser({ commit, dispatch }, payload){

        commit("setLoading", true);
      
        payload = Object.assign(payload, { collection: "Users" });
        var test = await dispatch("getObject", payload).catch((err) =>
        commit("setError", "Error in getObjectUser." + err)
        );
  
        commit("SET_USERS", test);


        //Connect to controllers 
        try{
          const res = await UserCont.getObjectUser()
          commit('SET_USERS', res)
        } catch{
              console.log('Error in getObjectUser')
              commit('setError', true)

        } finally{
              commit('setLoading', false)
        }
      },//getObjectUser


      async getObjectUserAnswer({ commit, dispatch }, payload){

        commit("setLoading", true);
      
        payload = Object.assign(payload, { collection: "Users" });
        var test = await dispatch("getObject", payload).catch((err) =>
        commit("setError", "Error in getObjectUserAnswer." + err)
        );
  
        commit("SET_USERS", test);


        //Connect to controllers 
        try{
          const res = await UserCont.getObjectUserAnswer()
          commit('SET_USERS', res)
        } catch{
              console.log('Error in getObjectUserAnswer')
              commit('setError', true)

        } finally{
              commit('setLoading', false)
        }
      },//getObjectUserAnswer
      

      async getObjectUserTask({ commit, dispatch }, payload){

        commit("setLoading", true);
      
        payload = Object.assign(payload, { collection: "Users" });
        var test = await dispatch("getObject", payload).catch((err) =>
        commit("setError", "Error in getObjectUserTask." + err)
        );
  
        commit("SET_USERS", test);


        //Connect to controllers 
        try{
          const res = await UserCont.getObjectUserTask()
          commit('SET_USERS', res)
        } catch{
              console.log('Error in getObjectUserTask')
              commit('setError', true)

        } finally{
              commit('setLoading', false)
        }
      },//getObjectUserTask
      

      async getObjectUserTemplate({ commit, dispatch }, payload){

        commit("setLoading", true);
      
        payload = Object.assign(payload, { collection: "Users" });
        var test = await dispatch("getObject", payload).catch((err) =>
        commit("setError", "Error in getObjectUserTemplate." + err)
        );
  
        commit("SET_USERS", test);


        //Connect to controllers 
        try{
          const res = await UserCont.getObjectUserTemplate()
          commit('SET_USERS', res)
        } catch{
              console.log('Error in getObjectUserTemplate')
              commit('setError', true)

        } finally{
              commit('setLoading', false)
        }
      },//getObjectUserTemplate


      async getObjectUserTest({ commit, dispatch }, payload){

        commit("setLoading", true);
      
        payload = Object.assign(payload, { collection: "Users" });
        var test = await dispatch("getObject", payload).catch((err) =>
        commit("setError", "Error in getObjectUserTest." + err)
        );
  
        commit("SET_USERS", test);


        //Connect to controllers 
        try{
          const res = await UserCont.getObjectUserTest()
          commit('SET_USERS', res)
        } catch{
              console.log('Error in getObjectUserTest')
              commit('setError', true)

        } finally{
              commit('setLoading', false)
        }
      },//getObjectUserTest

  

      /**
       *  This action gets all Users from Users collection ,
       *  using the generic action {@link getAllObjects}
       * 
       * @action getUsers=SET_USERS
       * @param {object} payload - empty object
       * @returns {void}
       */

      async getAllUser ({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "Users" });
  
        var Users = await dispatch("getAllObjects", payload)
          .catch((err) => commit("setError", "Error in getAllUser." + err));

        commit("SET_USERS", Users);

        //Connect to controllers 
        try{
          const res = await UserCont.getObjectUser()
          commit('SET_USERS', res)
        } catch{
              console.log('Error in getObjectUser')
              commit('setError', true)

        } finally{
              commit('setLoading', false)
        }
  
      },

      async getAllUserAnswer({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "Users" });
  
        var Users = await dispatch("getAllObjects", payload)
          .catch((err) => commit("setError", "Error in getAllUserAnswer." + err));
  
        commit("SET_USERS", Users);

        //Connect to controllers 
        try{
          const res = await UserCont.getObjectUser()
          commit('SET_USERS', res)
        } catch{
              console.log('Error in getObjectUser')
              commit('setError', true)

        } finally{
              commit('setLoading', false)
        }
      },

      async getAllUserTask({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "Users" });
  
        var Users = await dispatch("getAllObjects", payload)
          .catch((err) => commit("setError", "Error in getAllUserTask." + err));
  
        commit("SET_USERS", Users);

        //Connect to controllers 
        try{
          const res = await UserCont.getObjectUser()
          commit('SET_USERS', res)
        } catch{
              console.log('Error in getObjectUser')
              commit('setError', true)

        } finally{
              commit('setLoading', false)
        }
      },

      async getAllUserTemplate({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "Users" });
  
        var Users = await dispatch("getAllObjects", payload)
          .catch((err) => commit("setError", "Error in getAllUserTemplate." + err));
  
        commit("SET_USERS", Users);

        //Connect to controllers 
        try{
          const res = await UserCont.getObjectUser()
          commit('SET_USERS', res)
        } catch{
              console.log('Error in getObjectUser')
              commit('setError', true)

        } finally{
              commit('setLoading', false)
        }
      },

      async getAllUserTest({ commit, dispatch }, payload) {
        commit("setLoading", true);
        payload = Object.assign(payload, { collection: "Users" });
  
        var Users = await dispatch("getAllObjects", payload)
          .catch((err) => commit("setError", "Error in getAllUserTest." + err));
  
        commit("SET_USERS", Users);

        //Connect to controllers 
        try{
          const res = await UserCont.getObjectUser()
          commit('SET_USERS', res)
        } catch{
              console.log('Error in getObjectUser')
              commit('setError', true)

        } finally{
              commit('setLoading', false)
        }
      },

    }
};
