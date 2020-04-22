import api from '@/api/index'

export default {
  actions: {
    createObject(_, payload) {
      try {
        var docRef = api.database.createObject(payload)
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
    }
  }
}
