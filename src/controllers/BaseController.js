import { db } from "@/firebase";
import {
    doc,
    updateDoc,
    getDoc,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    collection,
} from "firebase/firestore";

export default class Controller {
    constructor() {}

    // path - collection
    // data - document to insert (object)
    async create(col, payload) {
        return addDoc(collection(db, col), payload);
    }

    async readOne(col, docId) {
        const ref = doc(db, `${col}/${docId}`);
        return getDoc(ref);
    }

    //model to define in Controller
    async read(path, parameter, condition) {
        /*
        console.log(
            "path: ",
            path,
            "parameter: ",
            parameter,
            "condition: " + condition
        );
        console.log(condition);
        */
        const q = query(
            collection(db, path),
            where(parameter, "==", condition)
        );
        const querySnapshot = await getDocs(q);
        const res = [];
        querySnapshot.forEach((doc) => {
            res.push(doc.data());
        });
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
        return getDoc(docRef);
    }

    async readAll(path) {
        const q = query(collection(db, path));
        const querySnapshot = await getDocs(q);
        const res = [];
        querySnapshot.forEach((doc) => {
            res.push(Object.assign(doc.data(), { id: doc.id }));
        });
        return res;
    }

    async update(col, payload) {
        const ref = doc(db, `${col}/${payload.id}`)
        return await updateDoc(ref, payload)
    }
    

    async delete(path, document) {
        await deleteDoc(doc(db, path, document));
    }
}
