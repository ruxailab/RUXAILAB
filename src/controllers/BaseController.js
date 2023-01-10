import { db } from "@/firebase";
import {
    doc,
    setDoc,
    updateDoc,
    getDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    collection,
} from "firebase/firestore";

export default class Controller {
<<<<<<< HEAD
  constructor() {}

  // path - collection
  // data - document to insert (object)

  async create(path, document, data) {
    await setDoc(doc(db, path, document), data);
  } 

  //model to define in Controller

  async read(path, parameter, condition) {
    const q = query(collection(db, path), where(parameter, "==", condition));
    const querySnapshot = await getDocs(q);
    const res = [];
    querySnapshot.forEach((doc) => {
      res.push(doc.data())
    });
    //console.log("CONTROLLER RESPONSE ====>>>>", res)
    return res
  }

  async readAll(path) {
    const q = query(collection(db, path));
    const querySnapshot = await getDocs(q);
    const res = [];
    querySnapshot.forEach((doc) => {
      res.push(doc.data())
    });
    //console.log("CONTROLLER RESPONSE ====>>>>", res)
    return res
  }
 

  async update(path, document, payload) {
    const uploadFile = doc(db, path, document);
    await updateDoc(uploadFile, payload);
  }

  async delete(path, document) {
    await deleteDoc(doc(db, path, document));
  }
}
=======
    constructor() {}

    // path - collection
    // data - document to insert (object)

    async create(path, document, data) {
        await setDoc(doc(db, path, document), data);
    }

    //model to define in Controller

    async read(path, parameter, condition) {
        const q = query(
            collection(db, path),
            where(parameter, "==", condition)
        );
        const querySnapshot = await getDocs(q);
        const res = [];
        querySnapshot.forEach((doc) => {
            res.push(doc.data());
        });
        console.log("CONTROLLER RESPONSE ====>>>>", res);
        return res;
    }

    /**
     * Gets a document data by its id and collection.
     *
     * @param {string[]} path the document path to be accessed.
     * @throws a Firebase exception.
     */
    async getById(path) {
        // return getDoc(doc(db, ...path));
        const docRef = doc(db, path[0], path[1]);
        console.log(docRef);
        return getDoc(docRef);
    }

    async readAll(path) {
        const q = query(collection(db, path));
        const querySnapshot = await getDocs(q);
        const res = [];
        querySnapshot.forEach((doc) => {
            res.push(doc.data());
        });
        console.log("CONTROLLER RESPONSE ====>>>>", res);
        return res;
    }

    async update(path, document, payload) {
        const uploadFile = doc(db, path, document);
        await updateDoc(uploadFile, payload);
    }

    async delete(path, document) {
        await deleteDoc(doc(db, path, document));
    }
}
>>>>>>> c1de5b2bfdc6cb2f39692e90853fdabedcc4061a
