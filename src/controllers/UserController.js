// imports

import User from "@/models/User";
import UserAnswer from "@/models/UserAnswer";
import UserTask from "@/models/UserTask";
import UserTemplate from "@/models/UserTemplate";
import UserTest from "@/models/UserTest";

import Controller from "@/controllers/BaseController";

export default class UserController extends Controller {
    constructor() {
        super();
    }

    createNewUser(document, data) {
        return super.create("users", document, data).then((res) => {
            return res;
        });

        
    }

    deleteUser(document) {
        return super.delete("users", document).then((res) => {
            return res;
        });
    }

    updateUser(document, payload) {
        return super.delete("users", document, payload).then((res) => {
            return res;
        });
    }

    //------------------GET OBJECTS - ID------------------

    //GetObject of User
    getObjectUser(parameter, condition) {
        console.log("break point");
        return super
            .getById(["users", condition])
            .then((response) => {
                console.log(response.data());
                //let res = response.data.map(User.toUser);
                console.log("UserController res: ", response.data());
                return response.data();
            })
            .catch((err) => {
                console.log("UserController error: ", err);
            });
    }

    //GetObject of UserAnswer
    getObjectUserAnswer(parameter, condition) {
        return super
            .read("users", parameter, condition)
            .then((response) => {
                let res = response.map(UserAnswer.toUserAnswer);
                console.log("UserAnswerController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("UserAnswerController error: ", err);
            });
    }

    //GetObject of UserTask
    getObjectUserTask(parameter, condition) {
        return super
            .read("users", parameter, condition)
            .then((response) => {
                let res = response.map(UserTask.toUserTask);
                console.log("UserTaskController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("UserTaskController error: ", err);
            });
    }

    //GetObject of UserTemplate
    getObjectUserTemplate(parameter, condition) {
        return super
            .read("users", parameter, condition)
            .then((response) => {
                let res = response.map(UserTemplate.toUserTemplate);
                console.log("UserTemplateController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("UserTemplateController error: ", err);
            });
    }

    //GetObject of UserTest
    getObjectUserTest(parameter, condition) {
        return super
            .read("users", parameter, condition)
            .then((response) => {
                let res = response.map(UserTest.toUserTest);
                console.log("UserTestController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("UserTestController error: ", err);
            });
    }

    // //----------------GET ALL OBJECTS----------------

    //GetObject of User
    getAllObjectUser() {
        return super
            .readAll("users")
            .then((response) => {
                let res = response.map(User.toUser);
                console.log("UserController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("UserController error: ", err);
            });
    }

    //GetObject of UserAnswer
    getAllObjectUserAnswer() {
        return super
            .readAll("users")
            .then((response) => {
                let res = response.map(UserAnswer.toUserAnswer);
                console.log("UserAnswerController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("UserAnswerController error: ", err);
            });
    }

    //GetObject of UserTask
    getAllObjectUserTask() {
        return super
            .readAll("users")
            .then((response) => {
                let res = response.map(UserTask.toUserTask);
                console.log("UserTaskController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("UserTaskController error: ", err);
            });
    }

    //GetObject of UserTemplate
    getAllObjectUserTemplate() {
        return super
            .readAll("users")
            .then((response) => {
                let res = response.map(UserTemplate.toUserTemplate);
                console.log("UserTemplateController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("UserTemplateController error: ", err);
            });
    }

    //GetObject of UserTest
    getAllObjectUserTest() {
        return super
            .readAll("users")
            .then((response) => {
                let res = response.map(UserTest.toUserTest);
                console.log("UserTestController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("UserTestController error: ", err);
            });
    }
}
