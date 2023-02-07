// imports

import Test from "@/models/Test";

import Controller from "@/controllers/BaseController";
import AnswerController from "./AnswerController";
import Answer from "@/models/Answer";
import UserAnswer from "@/models/UserAnswer";
import UserController from "./UserController";

const COLLECTION = "tests";
const answerController = new AnswerController()
const userController = new UserController()

export default class TestController extends Controller {
    constructor() {
        super();
    }

    async createTest(document, data) {
        return await super.create(document, data).then((res) => {
            return res;
        });
    }

    async deleteTest(payload) {
        return await super.delete(COLLECTION, payload.id)
    }

    async updateTest(payload) {
        return await super.update(COLLECTION, payload.id, payload.toFirestore());
    }

    async acceptTestCollaboration(payload) {
        // Create answer document
        const answer = new Answer({ type: payload.test.testType })
        const res = await answerController.createAnswer(answer)
        const docId = res.id
        const userAnswer = new UserAnswer({
            answerDocId: docId,
            accessLevel: payload.cooperator.accessLevel,
            progress: 0,
            testAuthorName: '',
            testDocId: payload.test.id,
            testType: payload.test.testType,
            testTitle: payload.test.testTitle,
            total: 0,
            updateDate: Date.now()
        })

        // Update answers inside collaborator
        const userToUpdate = payload.cooperator
        userToUpdate.myAnswers.push(userAnswer.toFirestore())
        await userController.update(userToUpdate.id, userToUpdate.toFirestore())

        const testToUpdate = payload.test
        const index = testToUpdate.cooperators.findIndex((c) => c.userDocId === userToUpdate.id)
        testToUpdate.cooperators[index].accepted = true

        // Update invitation on test to accepted
        return await super.update(COLLECTION, testToUpdate.id, testToUpdate.toFirestore())
    }

    //------------------GET OBJECTS - ID------------------

    //GetObject of Test
    async getTest(parameter) {
        const res = await super.readOne(COLLECTION, parameter.id);
        if (!res.exists()) return null;
        console.log("TestController res: ", res.data());
        //console.log(Test.toTest(res));
        return Test.toTest(Object.assign({ id: res.id }, res.data()));
    }

    //GetObject of Test
    async getAllObjectTest() {
        return await super
            .readAll("tests")
            .then((response) => {
                let res = response.map(Test.toTest);
                console.log("TestController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TestController error: ", err);
            });
    }
}
