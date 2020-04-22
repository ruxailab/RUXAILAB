import firebase from 'firebase'

export default {
  createObject: async (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    return collectionRef.add(payload.data)
  },
  deleteObject: async (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    return collectionRef.doc(payload.id).delete()
  },
  // updateObject: (payload) => {
  //
  // },
  // getObject: (payload) => {
  //
  // },
  // queryObjects: (payload) => {
  //
  // },
  getAllObjects: async (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    return collectionRef.get()
  },
  // arrayOperations: (payload) => {
  //
  // },
}
