import api from '@/api/index'

export default {
    actions: {
      createObject(_,payload){
        try{
          var docRef = api.database.createObject(payload)
          console.log("Document sucessfully created with ID: ",docRef)
          return docRef
        } catch (err) {
          console.error("Error", err)
        }
      }
    }
}
