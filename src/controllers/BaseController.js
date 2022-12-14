import { db } from "@/firebase";
import { doc, setDoc, updateDoc, query, where, getDocs, deleteDoc, collection} from "firebase/firestore";

export default class Controller {
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
    console.log("CONTROLLER RESPONSE ====>>>>", res)
    return res
  }

  async readAll(path) {
    const q = query(collection(db, path));
    const querySnapshot = await getDocs(q);
    const res = [];
    querySnapshot.forEach((doc) => {
      res.push(doc.data())
    });
    console.log("CONTROLLER RESPONSE ====>>>>", res)
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