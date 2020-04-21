import firebase from 'firebase'

export default {
  createObject: (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    return collectionRef.add(payload.data)
  },
  // deleteObject: (payload) => {
  //
  // },
  // updateObject: (payload) => {
  //
  // },
  // getObject: (payload) => {
  //
  // },
  // queryObjects: (payload) => {
  //
  // },
  // getAllObjects: (payload) => {
  //
  // },
  // arrayOperations: (payload) => {
  //
  // },
}
