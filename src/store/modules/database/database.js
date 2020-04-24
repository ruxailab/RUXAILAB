import api from '@/api/index'

export default {
  actions: {
    async createObject(_, payload) {
      try {
        var docRef = await api.database.createObject(payload)
        console.log("Document sucessfully created with ID: ", docRef)
        return docRef
      } catch (err) {
        console.error("Error", err)
      }
    },
    async getAllObjects(_, payload) {
      try {
        var snapshot
        snapshot = await api.database.getAllObjects(payload)
        var objects = []
        snapshot.forEach(doc => {
          objects.push(Object.assign({ id: doc.id }, doc.data()))
        })
        console.log('Objects', objects)
        return objects
      } catch (err) {
        console.error("Error getting document: ", err)
      }
    },
    async deleteObject(_,payload){
      try {
        console.log(payload)
        await api.database.deleteObject(payload)
        console.log("Document successfully deleted!")
      } catch (err) {
        console.error("Error removing document: ", err)
      }
    },
    async getObject(_,payload){
      try {
        var doc = await api.database.getObject(payload)
        const object = Object.assign({id:doc.id}, doc.data()) 
        console.log('Object',object)
        return object
      } catch (err) {
        console.error("Error getting document: ", err)
      }
    }
  }
}
