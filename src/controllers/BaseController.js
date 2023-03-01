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
    constructor() { }

    // path - collection
    // data - document to insert (object)
    async create(col, payload) {
        return addDoc(collection(db, col), payload);
    }

    async readOne(col, docId) {
        const ref = doc(db, `${col}/${docId}`);
        return getDoc(ref);
    }

    async query(col, params) {
        const q = query(collection(db, col), where(params.field, params.condition, params.value))
        return getDocs(q);
    }

    /**
     * Gets a document data by its id and collection.
     *
     * @param {string[]} path the document path to be accessed.
     * @throws a Firebase exception.
     */
    async getById(path) {
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

    async update(col, docId, payload) {
        const ref = doc(db, `${col}/${docId}`);
        return updateDoc(ref, payload);
    }

    async delete(col, docId) {
        return deleteDoc(doc(db, col, docId));
    }
}
