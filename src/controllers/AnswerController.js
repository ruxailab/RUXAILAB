// import Answer from "@/models/Answer"

import Controller from "@/controllers/BaseController";
import UserController from "./UserController";
import Answer from "@/models/Answer";
const COLLECTION = "answers";

const userController = new UserController()

export default class AnswerController extends Controller {
    constructor() {
        super();
    }
    async getAnswerById(payload) {
        const res = await super.readOne(COLLECTION, payload)
        return new Answer({ id: res.id, ...res.data() })
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

    async removeUserAnswer(payload) {
        const userToUpdate = await userController.getById(payload.cooperatorId)
        const index = userToUpdate.myAnswers.findIndex((a) => a.testDocId === payload.testDocId)

        // Delete answers document
        const answerDocumentId = userToUpdate.myAnswers[index].answerDocId
        await super.delete(COLLECTION, answerDocumentId)

        // Remove it from user
        userToUpdate.myAnswers.splice(index, 1)
        return userController.update(userToUpdate.id, userToUpdate.toFirestore())
    }

    async saveTestAnswer(payload, answerDocId) {
        console.log('é pra salvar isso aqui', answerDocId)

        const fieldToUpdate = {
            [`heuristicAnswers.${payload.userDocId}`]: payload.toFirestore()
        }
        console.log('field', fieldToUpdate)
        await super.update(COLLECTION, answerDocId, fieldToUpdate)
    }
}
