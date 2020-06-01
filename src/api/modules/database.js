import firebase from "firebase";

export default {
  createObject: async (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    return collectionRef.add(payload.data);
  },
  deleteObject: async (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    return collectionRef.doc(payload.id).delete();
  },
  updateObject: (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    return collectionRef.doc(payload.docId).set(payload.data);
  },
  getObject: (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    return collectionRef.doc(payload.id).get();
  },
  // queryObjects: (payload) => {
  //
  // },
  getAllObjects: async (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    return collectionRef.get();
  },
  pushArray: (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    var docRef = collectionRef.doc(payload.docId);

    return docRef.update({
      [payload.param]: firebase.firestore.FieldValue.arrayUnion(
        payload.element
      ),
    });
  },
  removeArray: (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    var docRef = collectionRef.doc(payload.docId);

    return docRef.update({
      [payload.param]: firebase.firestore.FieldValue.arrayRemove(
        payload.element
      ),
    });
  },
  updateArray:async (payload) => {
    const db = firebase.firestore()
    var collectionRef = db.collection(payload.collection);
    var docRef = collectionRef.doc(payload.docId);
    let user = await docRef.get()
    user = Object.assign({uid:payload.docId}, user.data()) 
    
    let element = user[payload.param].find(element => element.id == payload.element.id)
    let index = user[payload.param].indexOf(element)
    console.log("El index",user[payload.param][index])
    
    user[payload.param][index] = payload.element
    console.log("El index update",user[payload.param][index])

    return docRef.update({
      [payload.param]: user[payload.param]
    });

 },
  observer: (payload,commit) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    var docRef = collectionRef.doc(payload.docId);

    docRef.onSnapshot({ includeMetadataChanges: true },async (docSnapshot) => {
      console.log(`Received doc snapshot: ${docSnapshot}`);
      let user = await docRef.get()
      user = Object.assign({uid:payload.docId}, user.data()) 
      console.log("User",user );
      commit("setUser", user);
    });
  },
};
