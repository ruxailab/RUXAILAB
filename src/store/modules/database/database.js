import api from "@/api/index";

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
        commit("setError", "Error in createObject" + err);
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
        commit("setError", "Error in getAllObjects" + err);
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
        commit("setError", "Error in deleteObject" + err);
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
     * @param {object} payload -  object identificatio
     * @returns object - object data found
     */
    async getObject({ commit }, payload) {
      try {
        var doc = await api.database.getObject(payload);
        const object = Object.assign({ id: doc.id }, doc.data());
        return object;
      } catch (err) {
        commit("setError", "Error in getObject" + err);
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
        commit("setError", "Error in updateObject" + err);
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
        commit("setError", "Error in pushObject" + err);
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
        commit("setError", "Error in removeObject" + err);
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
        commit("setError", "Error in updateArrayObject" + err);
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
        commit("setError", "Error in updateArrayElement" + err);
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
     * @param {object} payload -  funciton parameters 
     * @returns {void}
     */
    async callFunction({ commit }, payload) {
      try {
        await api.functions.call(payload);
      } catch (err) {
        commit("setError", "Error in callFunction" + err);
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
        commit("setError", "Error in setParamInObject" + err);
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
        commit("setError", "Error in removeUser" + err);
      } finally {
        commit("setLoading", false);
      }
    }
  },
};
