// imports

import Controller from "@/controllers/BaseController";
import User from "@/models/UserModel";
const COLLECTION = 'users'

export default class UserController extends Controller {
    constructor() {
        super();
    }

    // createNewUser(document, data) {
    //     return super.create("users", document, data).then((res) => {
    //         return res;
    //     });


    // }

    // deleteUser(document) {
    //     return super.delete("users", document).then((res) => {
    //         return res;
    //     });
    // }

    async update(docId, payload) {
        return super.update(COLLECTION, docId, payload)
    }

    async readAll() {
        const docs = await super.readAll(COLLECTION)
        return docs.map((doc) => new User(doc))
    }

    async getById(docId) {
        const res = await super.readOne(COLLECTION, docId)
        return new User(Object.assign({ id: res.id }, res.data()))
    }

}
