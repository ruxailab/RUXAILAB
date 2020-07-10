import api from "@/api/index";

export default {
  actions: {
    async createObject(_, payload) {
      try {
        var docRef = await api.database.createObject(payload);
        return docRef;
      } catch (err) {
        console.error("Error", err);
      }
    },
    async getAllObjects(_, payload) {
      try {
        var snapshot;
        snapshot = await api.database.getAllObjects(payload);
        var objects = [];
        snapshot.forEach((doc) => {
          objects.push(Object.assign({ id: doc.id }, doc.data()));
        });
        return objects;
      } catch (err) {
        console.error("Error getting document: ", err);
      }
    },
    async deleteObject(_, payload) {
      try {
        await api.database.deleteObject(payload);
      } catch (err) {
        console.error("Error removing document: ", err);
      }
    },
    async getObject(_, payload) {
      try {
        var doc = await api.database.getObject(payload);
        const object = Object.assign({ id: doc.id }, doc.data());
        return object;
      } catch (err) {
        console.error("Error getting document: ", err);
      }
    },
    async updateObject(_, payload) {
      try {
        var docRef = await api.database.updateObject(payload);
        return docRef;
      } catch (err) {
        console.error("Error", err);
      }
    },
    async pushObject(_, payload) {
      try {
        var docRef = await api.database.pushArray(payload);
        return docRef;
      } catch (err) {
        console.error("Error", err);
      }
    },
    async removeObject(_, payload) {
      try {
        var docRef = await api.database.removeArray(payload);
        return docRef;
      } catch (err) {
        console.error("Error", err);
      }
    },
    async updateArrayObject(_, payload) {
      try {
        var docRef = await api.database.updateArray(payload);
        return docRef;
      } catch (err) {
        console.error("Error", err);
      }
    },
    async updateArrayElement(_, payload) {
      try {
        let docRef = await api.database.updateArrayElement(payload);
        return docRef;
      } catch (err) {
        console.error("Error", err);
      }
    },
    async callFunction(_, payload) {
      try {
        await api.functions.call(payload);
      } catch (err) {
        console.error("Error calling the function:  ", err);
      }
    },
    async setParamInObject(_, payload) {
      try {
        await api.database.setParam(payload);
      } catch (err) {
        console.error("Error", err);
      }
    },
  },
};
