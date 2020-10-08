import api from "@/api/index";

/**
 * Database store module
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
    async deleteObject({ commit }, payload) {
      try {
        await api.database.deleteObject(payload);
      } catch (err) {
        commit("setError", "Error in deleteObject" + err);
      } finally {
        commit("setLoading", false);
      }
    },
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
    async callFunction({ commit }, payload) {
      try {
        await api.functions.call(payload);
      } catch (err) {
        commit("setError", "Error in callFunction" + err);
      } finally {
        commit("setLoading", false);
      }
    },
    async setParamInObject({ commit }, payload) {
      try {
        await api.database.setParam(payload);
      } catch (err) {
        commit("setError", "Error in setParamInObject" + err);
      } finally {
        commit("setLoading", false);
      }
    },
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
