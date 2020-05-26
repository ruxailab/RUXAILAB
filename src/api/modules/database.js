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
  arrayOperations: (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    var docRef = collectionRef.doc(payload.docId);
    console.log("Payload", payload);

    
    var el = {};
    console.log(docRef);
    Object.defineProperty(el, payload.param, {
      value: firebase.firestore.FieldValue.arrayUnion(payload.element),
    });
    console.log(el);
   
    if(payload.param === "answers"){
      return docRef.update({
        answers: firebase.firestore.FieldValue.arrayUnion(payload.element)
      });
    }
    if(payload.param === "myTests"){
      return docRef.update({
        myTests: firebase.firestore.FieldValue.arrayUnion(payload.element)
      });
    }
 
  },
};
