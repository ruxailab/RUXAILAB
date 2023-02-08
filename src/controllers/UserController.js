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

    async addNotification(payload) {
        // Add Notification to User
        const userToUpdate = await this.getById(payload.userId)
        userToUpdate.notifications.push(payload.notification.toFirestore())
        return this.update(payload.userId, userToUpdate.toFirestore())
    }

    async markNotificationAsRead(payload) {
        const userToUpdate = new User(payload.user)
        const index = userToUpdate.notifications.findIndex((n) => n.title === payload.notification.title)
        userToUpdate.notifications[index].read = true
        return this.update(userToUpdate.id, userToUpdate.toFirestore())
    }

}
