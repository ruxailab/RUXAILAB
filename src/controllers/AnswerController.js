// import Answer from "@/models/Answer"

import Controller from "@/controllers/BaseController";
const COLLECTION = "answers";

export default class AnswerController extends Controller {
    constructor() {
        super();
    }

    async createAnswer(payload) {
        return await super.create(COLLECTION, payload.toFirestore());
    }
}
