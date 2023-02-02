// /**
//  * Heuristic Store Module
//  * @module Heuristic
//  */

// //import HeuristicController
// import HeuristicController from '@/controllers/HeuristicController.js'

// const HeuristicCont = new HeuristicController()


// export default {
//     state: {
//         Heuristics: null,
//         module: 'Heuristics'
//     },
//     getters: {
//         Heuristics(state) {
//             return state.Heuristics
//         }
//     },
//     mutations: {
//         SET_HEURISTICS(state, payload) {
//             state.Heuristics = payload
//         }
//     },
//     actions: {
//         /**
//          * This action creates a new Heuristic, using the generic action "createObject",
//          *  passing the Heuristic data
//          * 
//          * @action createNewHeuristic
//          * @param {object} payload - data to create a Heuristic 
//          * @param {object} payload.data - Heuristic data
//          * @param {object} payload.data.header -data for the identification of the model and its author
//          * @param {string} payload.data.header.id - author identification
//          * @param {string} payload.data.header.author - author email
//          * @param {string} payload.data.header.version - Heuristic version
//          * @param {Date} payload.data.header.date - last update date
//          * @param {string} payload.data.header.title - Heuristic title 
//          * @param {string} payload.data.header.description - Heuristic description 
//          * @param {object} payload.data.body - data to creating new tests
//          * @param {string} payload.data.body.type - test type
//          * @param {object[]} [payload.data.body.heuristics] - structure test when its type is heuristic
//          * @param {object[]} [payload.data.body.options] -  alternatives to respond when your type is heuristic
//          * @param {object} [payload.data.body.answersSheet] -  standard object to answer the test
//          * @param {object[]} [payload.data.body.tasks] - structure test when its type is user
//          * @param {object} [payload.data.body.preTest] - object with google form for pretest
//          * @param {object} [payload.data.body.preTest] - object with google form for post-test
//          * @returns {string} docRef - Heuristic identification
//          */

//         async createNewHeuristic({ dispatch, commit }, payload) {
//             commit("setLoading", true);

//             payload = Object.assign(payload, { collection: 'Heuristics' });

//             let docRef = dispatch('createObject', payload)
//                 .then((doc) => {
//                     return doc.id;
//                 })
//                 .catch((err) => commit("setError", "Error in createHeuristic." + err));

            

//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.createNewHeuristic()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in createNewHeuristic')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }

//             return docRef;

//         },


//         /**
//          * This action updates Heuristic, using the generic action "updateObject",
//          * passing the Heuristic data
//          * 
//          * @action updateHeuristic
//          * @param {object} payload - updated Heuristic data 
//          * @param {object} payload.data -Heuristic data 
//          * @param {object} payload.data.header -data for the identification of the model and its author
//          * @param {string} payload.data.header.id - author identification
//          * @param {string} payload.data.header.author - author email
//          * @param {string} payload.data.header.version - Heuristic version
//          * @param {Date} payload.data.header.date - last update date
//          * @param {string} payload.data.header.title - Heuristic title 
//          * @param {string} payload.data.header.description - Heuristic description 
//          * @param {object} payload.data.body - data to creating new tests
//          * @param {string} payload.data.body.type - test type
//          * @param {object[]} [payload.data.body.heuristics] - structure test when its type is heuristic
//          * @param {object[]} [payload.data.body.options] -  alternatives to respond when your type is heuristic
//          * @param {object} [payload.data.body.answersSheet] -  standard object to answer the test
//          * @param {object[]} [payload.data.body.tasks] - structure test when its type is user
//          * @param {object} [payload.data.body.preTest] - object with google form for pretest
//          * @param {object} [payload.data.body.preTest] - object with google form for post-test
//          * @returns {void}
//          */

//         async updateHeuristic({ dispatch, commit }, payload) {
//             commit("setLoading", true);
//             payload = Object.assign(payload, { collection: "HEURISTICS" });

//             dispatch("updateObject", payload)
//                 .catch((err) => commit("setError", "Error in updateHeuristic." + err));
        
            
//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.updateHeuristic()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in updateHeuristic')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }
        
//         },



//         /**
//          * This action deletes Heuristic, using the generic action "deleteObject",
//          *  passing the Heuristic data
//          * 
//          * @action deleteHeuristic
//          * @param {object} payload - Heuristic data 
//          * @param {string} payload.id - Heuristic identification
//          * @returns {void}
//          */

//         async deleteHeuristic({ dispatch, commit }, payload) {
//             commit("setLoading", true);
//             payload = Object.assign(payload, { collection: "HEURISTICS" });

//             dispatch("deleteObject", payload)
//                 .catch((err) => commit("setError", "Error in deleteHeuristic." + err));
        
        
//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.deleteHeuristic()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in deleteHeuristic')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }

//         },



//         /**
//          * This action returns a Heuristic, using the generic action "getObject", 
//          * passing the Heuristic data
//          * 
//          * @action getObjectHeuristic=SET_HEURISTICS
//          * @param {object} payload - Heuristic data 
//          * @param {string} payload.id - Heuristic identification
//          * @returns {void}
//          */

//         async getObjectHeuristic({ commit, dispatch }, payload) {
//             commit("setLoading", true);
//             payload = Object.assign(payload, { collection: 'Heuristics' });

//             let Heuristic = await dispatch("getObject", payload)
//                 .catch((err) => commit("setError", "Error in getHeuristic." + err));

//             commit('SET_HEURISTICS', Heuristic);

//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.getObjectHeuristic()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in getObjectHeuristic')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }
//         },

//         async getObjectHeuristicAnswer({ commit, dispatch }, payload) {
//             commit("setLoading", true);
//             payload = Object.assign(payload, { collection: 'Heuristics' });

//             let Heuristic = await dispatch("getObject", payload)
//                 .catch((err) => commit("setError", "Error in getHeuristic." + err));

//             commit('SET_HEURISTICS', Heuristic);

//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.getObjectHeuristicAnswer()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in getObjectHeuristicAnswer')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }
//         },

//         async getObjectHeuristicQuestion({ commit, dispatch }, payload) {
//             commit("setLoading", true);
//             payload = Object.assign(payload, { collection: 'Heuristics' });

//             let Heuristic = await dispatch("getObject", payload)
//                 .catch((err) => commit("setError", "Error in getHeuristic." + err));

//             commit('SET_HEURISTICS', Heuristic);

//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.getObjectHeuristicQuestion()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in getObjectHeuristicQuestion')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }
//         },


//         async getObjectHeuristicQuestionAnswer({ commit, dispatch }, payload) {
//             commit("setLoading", true);
//             payload = Object.assign(payload, { collection: 'Heuristics' });

//             let Heuristic = await dispatch("getObject", payload)
//                 .catch((err) => commit("setError", "Error in getHeuristic." + err));

//             commit('SET_HEURISTICS', Heuristic);

//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.getObjectHeuristicQuestionAnswer()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in getObjectHeuristicQuestionAnswer')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }
//         },

//         async getObjectHeuristicQuestionDescription({ commit, dispatch }, payload) {
//             commit("setLoading", true);
//             payload = Object.assign(payload, { collection: 'Heuristics' });

//             let Heuristic = await dispatch("getObject", payload)
//                 .catch((err) => commit("setError", "Error in getHeuristic." + err));

//             commit('SET_HEURISTICS', Heuristic);

//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.getObjectHeuristicQuestionDescription()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in getObjectHeuristicQuestionDescription')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }
//         },


//         /**
//          * This action returns all Heuristics, using the generic action "getAllObjects"
//          * 
//          * @action getAllHeuristic=SET_HEURISTICS
//          * @returns {void}
//          */

//         async getAllHeuristic({ commit, dispatch }) {
//             commit("setLoading", true);
//             let payload = Object.assign({}, { collection: 'Heuristics' });

//             let Heuristics = await dispatch("getAllObjects", payload)
//                 .catch((err) => commit("setError", "Error in getHeuristics." + err));

//             commit('SET_HEURISTICS', Heuristics)

//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.getAllHeuristic()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in getAllHeuristic')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }
//         },

//         async getAllHeuristicAnswer({ commit, dispatch }) {
//             commit("setLoading", true);
//             let payload = Object.assign({}, { collection: 'Heuristics' });

//             let Heuristics = await dispatch("getAllObjects", payload)
//                 .catch((err) => commit("setError", "Error in getHeuristics." + err));

//             commit('SET_HEURISTICS', Heuristics)

//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.getAllHeuristicAnswer()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in getAllHeuristicAnswer')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }
//         },

//         async getAllHeuristicQuestion({ commit, dispatch }) {
//             commit("setLoading", true);
//             let payload = Object.assign({}, { collection: 'Heuristics' });

//             let Heuristics = await dispatch("getAllObjects", payload)
//                 .catch((err) => commit("setError", "Error in getHeuristics." + err));

//             commit('SET_HEURISTICS', Heuristics)

//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.getAllHeuristicQuestion()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in getAllHeuristicQuestion')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }
//         },

//         async getAllHeuristicQuestionAnswer({ commit, dispatch }) {
//             commit("setLoading", true);
//             let payload = Object.assign({}, { collection: 'Heuristics' });

//             let Heuristics = await dispatch("getAllObjects", payload)
//                 .catch((err) => commit("setError", "Error in getHeuristics." + err));

//             commit('SET_HEURISTICS', Heuristics)

//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.getAllHeuristicQuestionAnswer()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in getAllHeuristicQuestionAnswer')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }
//         },

//         async getAllHeuristicQuestionDescription({ commit, dispatch }) {
//             commit("setLoading", true);
//             let payload = Object.assign({}, { collection: 'Heuristics' });

//             let Heuristics = await dispatch("getAllObjects", payload)
//                 .catch((err) => commit("setError", "Error in getHeuristics." + err));

//             commit('SET_HEURISTICS', Heuristics)

//             //Connect to controllers
//             try{
//                 const res = await HeuristicCont.getAllHeuristicQuestionDescription()
//                 commit('SET_HEURISTICS', res)

//             } catch{
//                 console.log('Error in getAllHeuristicQuestionDescription')
//                 commit('setError', true)

//             } finally{
//                 commit('setLoading', false)
//             }
//         },
//     }
// }