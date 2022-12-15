import api from "@/api/index";
import Controller from "../../../controllers/BaseController";

/**
 * Database store module, API calls
 * @module database
 */

export default {
  state: {
    loading: false
  },
  getters: {
    loading(state) {
      return state.loading
    }
  },
  mutations: {
    setLoading(state, payload) {
      state.loading = payload;
    }
  },
  actions: {
    /**
     * This generic action creates a new object, calling the API's function  {@link createObject},
     * passing the  object data
     * 
     * @action createObject
     * @param {object} payload -  object data
     * @returns {object} docRef - created object
     */
    async createObject({ commit }, payload) {
      try {
        var docRef = await api.database.createObject(payload);
        return docRef;
      } catch (err) {
        console.error("Error in createObject:", err)
        commit("setError", "Error creating object in database");
        
      } finally {
        commit("setLoading", false);
      }
    },
    /**
     * This generic action gets all object in collection,
     * calling the API function {@link getAllObjects},
     * passing the object's data
     * 
     * @action getAllObjects
     * @param {object} payload - collection identification
     * @returns {object[]} snapshot - all objects in collection
     */
    async getAllObjects({ commit }, payload) {
      try {
        var snapshot;
        snapshot = await api.database.getAllObjects(payload);
        var objects = [];
        snapshot.forEach((doc) => {
          objects.push(Object.assign({ id: doc.id }, doc.data()));
        });
        return objects;
      } catch (err) {
        console.error("Error in getAllObjects:", err)
        commit("setError", "Error getting all objects in database");
      } finally {
        commit("setLoading", false);
      }
    },
    /**
     * This generic action deletes a object,
     * calling the API function {@link deleteObject },
     * passing the object's data
     * 
     * @action deleteObject
     * @param {object} payload - object identification 
     * @returns {void}
     */
    async deleteObject({ commit }, payload) {
      try {
        await api.database.deleteObject(payload);
      } catch (err) {
        console.error("Error in deleteObject:", err)
        commit("setError", "Error deleting object in database");
      } finally {
        commit("setLoading", false);
      }
    },
    /**
     * This generic action gets a single object from collection, 
     * calling the API function {@link getObject}, 
     * passing the object's data
     * 
     * @action getObject
     * @param {object} payload -  object identification
     * @returns object - object data found
     */
    async getObject({commit}, payload) {
      try{
        return await new Controller().read("test", "id", payload);
      } catch (err) {
          console.error('Error in getObject:', err),
            commit("setError", "Error getting object from database");
        } finally {
            commit("setLoading", false);
        }
    },
    /**
     * This generic action updates a single object from the collection,
     * calling the API function {@link updateObject}, passing the object's data
     * 
     * @action updateObject
     * @param {object} payload - updated object data 
     * @return {object} docRef - updated object
     */
    async updateObject({ commit }, payload) {
      try {
        var docRef = await api.database.updateObject(payload);
        return docRef;
      } catch (err) {
        console.error("Error in updateObject:", err)
        commit("setError", "Error updating object in database");
      } finally {
        commit("setLoading", false);
      }
    },
    /**
     * This generic action adds a new element to the collection's object array, 
     * calling the API function {@link pushArray}, passing the object's data
     * 
     * @action pushObject
     * @param {object} payload - data to identify the object and the new element
     * @returns {object} docRef - updated object with new element
     */
    async pushObject({ commit }, payload) {
      try {
        var docRef = await api.database.pushArray(payload);
        return docRef;
      } catch (err) {
        console.error("Error pushObject:", err)
        commit("setError", "Error pushing object to database");
      } finally {
        commit("setLoading", false);
      }
    },
    /**
     * This generic action removes a element  the collection's object array, 
     * calling the API function {@link removeArray}, passing the object's data
     * 
     * @action removeObject
     * @param {object} payload - data to identify the object and the element
     * @returns {object} docRef - updated object without the element
     */
    async removeObject({ commit }, payload) {
      try {
        var docRef = await api.database.removeArray(payload);
        return docRef;
      } catch (err) {
        console.error("Error in removeObject:", err)
        commit("setError", "Error removing object from database");
      } finally {
        commit("setLoading", false);
      }
    },
    /**
     * This generic action updates all elements the collection's object array,  
     * calling the API function {@link updateArray}, passing the object's data
     * 
     * @action updateArrayObject
     * @param {object} payload - data to identify the object and the element updated
     * @returns {object} docRef -updated object with updated  element
     */
    async updateArrayObject({ commit }, payload) {
      try {
        var docRef = await api.database.updateArray(payload);
        return docRef;
      } catch (err) {
        console.error("Error in updateArrayObject:", err)
        commit("setError", "Error updating array object in database");
      } finally {
        commit("setLoading", false);
      }
    },
    /**
     * This generic action updates a element 's field  the collection's object array,  
     * calling the API function {@link updateArrayElement}, passing the object's data
     * 
     * @action updateArrayElement
     * @param {object} payload - data to identify the object, the element and field updated 
     * @returns {object} docRef -updated object with updated  element
     */
    async updateArrayElement({ commit }, payload) {
      try {
        let docRef = await api.database.updateArrayElement(payload);
        return docRef;
      } catch (err) {
        console.error("Error in updateArrayElement:", err)
        commit("setError", "Error updating array element in database");
      } finally {
        commit("setLoading", false);
      }
    },
    /**
     * This generic action updates a element the collection's object array,  
     * calling the API function {@link updateArrayObject}, passing the object's data
     * 
     * @action updateArrayElementObject
     * @param {object} payload - data to identify the object and the element updated
     * @returns {object} docRef -updated object with updated  element
     */
    async updateArrayElementObject({ commit }, payload) {
      try {
        let docRef = await api.database.updateArrayObject(payload);
        return docRef;
      } catch (err) {
        console.error("Error in updateArrayElementObject:", err)
        commit("setError", "Error updating object in database");
        commit("setError", "Error in updateArrayElementObject" + err);
      } finally {
        commit("setLoading", false);
      }
    },
    /**
     * This generic action call a firebase function, 
     * calling the API function {@link call}, passing the object's data
     * 
     * @action callFunction
     * @param {object} payload -  function parameters 
     * @returns {void}
     */
    async callFunction({ commit }, payload) {
      try {
        await api.functions.call(payload);
      } catch (err) {
        console.error("Error in callFunction:", err)
        commit("setError", "Error calling function");
      } finally {
        commit("setLoading", false);
      }
    },
    /**
     * This generic action adds a new field in a object , 
     * calling the API function {@link setParam}, passing the object's data
     * 
     * @action setParamInObject
     * @param {object} payload - new field data
     * @returns {void}
     */
    async setParamInObject({ commit }, payload) {
      try {
        await api.database.setParam(payload);
      } catch (err) {
        console.error("Error in setParamInObject:", err)
        commit("setError", "Error setting object parameter in database");
      } finally {
        commit("setLoading", false);
      }
    },
    /**
     * This generic action removes user authantication , calling the API function {@link deleteUserByID},
     * passing the object's data
     * 
     * @action removeUser
     * @param {object} user - user identification
     * @returns {void}
     */
    removeUser({ commit }, user) {
      try {
        api.auth.deleteUserByID(user);
      } catch (err) {
        console.error("Error in removeUser:", err)
        commit("setError", "Error removing user from database");
      } finally {
        commit("setLoading", false);
      }
    },

    async getPaginationArray ({commit}, payload) {
      try{
        var objects = [];
        await new Controller().read("users", "id", payload).then((response) => {
          response.forEach((doc) => {
            objects.push(doc.data());
          });
        });
      }catch (err){
        console.error("Error in getPaginationArray: ", err)
        commit("setError", "Error in getting paginated array in database");
      }finally{
        commit("setLoading", false)
      }
    },
  }, 
};