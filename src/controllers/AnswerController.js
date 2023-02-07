// import Answer from "@/models/Answer"

import Controller from "@/controllers/BaseController";
import UserController from "./UserController";
const COLLECTION = "answers";

const userController = new UserController()

export default class AnswerController extends Controller {
    constructor() {
        super();
    }

    async createAnswer(payload) {
        return await super.create(COLLECTION, payload.toFirestore());
    }

    async updateUserAnswer(payload) {
        const userToUpdate = await userController.getById(payload.cooperatorId)
        const index = userToUpdate.myAnswers.findIndex((a) => a.testDocId === payload.testDocId)
        userToUpdate.myAnswers[index] = Object.assign(userToUpdate.myAnswers[index], payload.data)
        return userController.update(userToUpdate.id, userToUpdate.toFirestore())
    }
}
