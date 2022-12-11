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
  getAllObjects: async (payload) => {
    const db = await firebase.firestore();
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
  removeArray: async (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    var docRef = collectionRef.doc(payload.docId);
    let doc = await docRef.get();
    doc = Object.assign({ id: payload.docId }, doc.data());

    let itemDelete = doc[payload.param].find(
      (item) => item.id == payload.element.id
    );

    doc[payload.param].splice(doc[payload.param].indexOf(itemDelete), 1);

    return docRef.update({
      [payload.param]: doc[payload.param],
    });
  },
  updateArray: async (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    var docRef = collectionRef.doc(payload.docId);
    let user = await docRef.get();
    user = Object.assign({ uid: payload.docId }, user.data());

    let element = user[payload.param].find(
      (element) => element.id == payload.element.id
    );
    let index = user[payload.param].indexOf(element);

    user[payload.param][index] = payload.element;

    return docRef.update({
      [payload.param]: user[payload.param],
    });
  },
  updateArrayElement: async (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    var docRef = collectionRef.doc(payload.docId);
    let element = await docRef.get();
    element = Object.assign({ id: payload.docId }, element.data());
    var obj = element[payload.field].find(
      (el) => el[payload.identifier] === payload.elementId
    );
    obj[payload.param] = payload.element;
    return docRef.update({
      [payload.field]: element[payload.field],
    });
  },
  updateArrayObject: async (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    var docRef = collectionRef.doc(payload.docId);
    let element = await docRef.get();
    element = Object.assign({ id: payload.docId }, element.data());
    let index;
    element[payload.field].forEach((el) => {
      if (el[payload.identifier] === payload.elementId) {
        index = element[payload.field].indexOf(el);
        el = payload.element;
      }
    });

    element[payload.field][index] = payload.element;

    return docRef.update({
      [payload.field]: element[payload.field],
    });
  },
  observer: (payload, commit) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    var docRef = collectionRef.doc(payload.docId);

    docRef.onSnapshot(async () => {
      let user = await docRef.get();
      user = Object.assign({ uid: payload.docId }, user.data());
      commit("setUser", user);

      if (user.myTests !== undefined) commit("setLoading", false);
      else commit("setLoading", true);
    });
  },
  setParam: (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);
    return collectionRef.doc(payload.docId).update({
      [payload.param]: payload.data,
    });
  },
  paginateArray: (payload) => {
    const db = firebase.firestore();
    var collectionRef = db.collection(payload.collection);

    if (!("last" in payload)) {
      // is first

      const first = collectionRef.orderBy("id");

      //TODO: add conditions
      // if ("conditions" in payload) {
      //   const queryRef = first.where(payload.conditions[0], payload.conditions[1], payload.conditions[2])
      //   return queryRef.get();
      // }

      return first.limit(payload.itemsPerPage).get();
    } else {
      //has a last object

      const next = collectionRef.orderBy("id").startAfter(payload.last);

      return next.limit(payload.itemsPerPage).get();
    }
  },
};
