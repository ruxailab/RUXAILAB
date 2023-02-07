// imports

// import firebase from "firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
// import { doc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase/index";

import Heuristic from "@/models/Heuristic";
import HeuristicAnswer from "@/models/HeuristicAnswer";
import HeuristicQuestion from "@/models/HeuristicQuestion";
import HeuristicQuestionAnswer from "@/models/HeuristicQuestionAnswer";
import HeuristicQuestionDescription from "@/models/HeuristicQuestionDescription";

import Controller from "@/controllers/BaseController";

export default class HeuristicController extends Controller {
    constructor() {
        super();
    }

    async createCsvHeuris(data) {
        await updateDoc(doc(db, "test", data.testId), {
            testStructure: arrayUnion({
                id: data.id,
                title: data.title,
                questions: data.questions,
                total: data.total,
            }),
        });
    }

    createNewHeuristic(document, data) {
        return super.create("test", document, data).then((res) => {
            return res;
        });
    }

    deleteHeuristic(document) {
        return super.delete("test", document).then((res) => {
            return res;
        });
    }

    updateHeuristic(document, payload) {
        return super.delete("test", document, payload).then((res) => {
            return res;
        });
    }

    //------------------GET OBJECTS - ID------------------

    //GetObject of Heuristic
    getObjectHeuristic(parameter, condition) {
        return super
            .read("test", parameter, condition)
            .then((response) => {
                let res = response.map(Heuristic.toHeuristic);
                console.log("HeuristicController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("HeuristicController error: ", err);
            });
    }

    //GetObject of HeuristicAnswer
    getObjectHeuristicAnswer(parameter, condition) {
        return super
            .read("test", parameter, condition)
            .then((response) => {
                let res = response.map(HeuristicAnswer.toHeuristicAnswer);
                console.log("HeuristicAnswerController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("HeuristicAnswerController error: ", err);
            });
    }

    //GetObject of HeuristicQuestion
    getObjectHeuristicQuestion(parameter, condition) {
        return super
            .read("test", parameter, condition)
            .then((response) => {
                let res = response.map(HeuristicQuestion.toHeuristicQuestion);
                console.log("HeuristicQuestionController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("HeuristicQuestionController error: ", err);
            });
    }

    //GetObject of HeuristicQuestionAnswer
    getObjectHeuristicQuestionAnswer(parameter, condition) {
        return super
            .read("test", parameter, condition)
            .then((response) => {
                let res = response.map(
                    HeuristicQuestionAnswer.toHeuristicQuestionAnswer
                );
                console.log("HeuristicQuestionAnswerController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("HeuristicQuestionAnswerController error: ", err);
            });
    }

    //GetObject of HeuristicQuestionDescription
    getObjectHeuristicQuestionDescription(parameter, condition) {
        return super
            .read("test", parameter, condition)
            .then((response) => {
                let res = response.map(
                    HeuristicQuestionDescription.toHeuristicQuestionDescription
                );
                console.log(
                    "HeuristicQuestionDescriptionController res: ",
                    res
                );
                return res;
            })
            .catch((err) => {
                console.log(
                    "HeuristicQuestionDescriptionController error: ",
                    err
                );
            });
    }

    // ----------------GET ALL OBJECTS----------------

    //GetAllObject of Heuristic
    getAllObjectHeuristic() {
        return super
            .readAll("test")
            .then((response) => {
                let res = response.map(Heuristic.toHeuristic);
                console.log("HeuristicController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("HeuristicController error: ", err);
            });
    }

    //GetAllObject of HeuristicAnswer
    getAllObjectHeuristicAnswer() {
        return super
            .readAll("test")
            .then((response) => {
                let res = response.map(HeuristicAnswer.toHeuristicAnswer);
                console.log("HeuristicAnswerController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("HeuristicAnswerController error: ", err);
            });
    }

    //GetAllObject of HeuristicQuestion
    getAllObjectHeuristicQuestion() {
        return super
            .readAll("test")
            .then((response) => {
                let res = response.map(HeuristicQuestion.toHeuristicQuestion);
                console.log("HeuristicQuestionController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("HeuristicQuestionController error: ", err);
            });
    }

    //GetAllObject of HeuristicQuestionAnswer
    getAllObjectHeuristicQuestionAnswer() {
        return super
            .readAll("test")
            .then((response) => {
                let res = response.map(
                    HeuristicQuestionAnswer.toHeuristicQuestionAnswer
                );
                console.log("HeuristicQuestionAnswerController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("HeuristicQuestionAnswerController error: ", err);
            });
    }

    //GetAllObject of HeuristicQuestionDescription
    getAllObjectHeuristicQuestionDescription() {
        return super
            .readAll("test")
            .then((response) => {
                let res = response.map(
                    HeuristicQuestionDescription.toHeuristicQuestionDescription
                );
                console.log(
                    "HeuristicQuestionDescriptionController res: ",
                    res
                );
                return res;
            })
            .catch((err) => {
                console.log(
                    "HeuristicQuestionDescriptionController error: ",
                    err
                );
            });
    }
}
