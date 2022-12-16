/* 
import {HeuristicController} from '././HeuristicController'

let HeuristicController = new HeuristicController()
*/

// imports

import api from "@/api/index";
import database from "../api/modules/database";
// import firebase from "firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
// import { doc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase/index";

import Heuristic from "../models/Heuristic";
import HeuristicAnswer from "../models/HeuristicAnswer";
import HeuristicQuestion from "../models/HeuristicQuestion";
import HeuristicQuestionAnswer from "../models/HeuristicQuestionAnswer";
import HeuristicQuestionDescription from "../models/HeuristicQuestionDescription";
import HeuristicTest from "../models/HeuristicTest";

export default class HeuristicController {
  async createCsvHeuris(data) {
    await updateDoc(doc(db, "test", data.testId), {
      heuristics: arrayUnion({
        id: data.id,
        title: data.title,
        questions: {
          id: data.qid,
          descriptions: data.qd,
          text: data.qtext,
          title: data.qtitle,
        },
        total: data.total,
      }),
    });
  }

  // async setCsvQuestions(data) {
  //   await setDoc(doc(db, "test", data.testId), {
  //     heuristics: {
  //       questions: arrayUnion({
  //         id: data.qid,
  //         descriptions: data.qd,
  //         text: data.qtext,
  //         title: data.qtitle,
  //       }),
  //     },
  //   });
  // }

  //
  async createNewHeuristic(data) {
    console.log(api.database.createObject);
    const hTest = new HeuristicTest(data);
    console.log(hTest);
    return database.createObject(api, hTest);
  }
  //
  async deleteHeuristic(data) {
    return database.deleteObject(api, data);
  }
  //
  async updateHeuristic(data) {
    return database.updateObject(api, data);
  }

  //------------------GET OBJECTS------------------
  //GetObject of Heuristic
  async getObjectHeuristic(id) {
    const answer = await api.database.getObject({
      id: id,
      collection: "answers",
    });

    return new Heuristic(answer);
  }

  //GetObject of HeuristicAnswer
  async getObjectHeuristicAnswer(id) {
    const answer = await database.getObject(api + "/" + id);
    return new HeuristicAnswer(answer);
  }

  //GetObject of HeuristicQuestion
  async getObjectHeuristicQuestion(id) {
    const answer = await database.getObject(api + "/" + id);
    return new HeuristicQuestion(answer);
  }

  //GetObject of HeuristicQuestionAnswer
  async getObjectHeuristicQuestionAnswer(id) {
    const answer = await database.getObject(api + "/" + id);
    return new HeuristicQuestionAnswer(answer);
  }

  //GetObject of HeuristicQuestionDescription
  async getObjectHeuristicQuestionDescription(id) {
    const answer = await database.getObject(api + "/" + id);
    return new HeuristicQuestionDescription(answer);
  }

  //----------------GET ALL OBJECTS----------------
  //GetAll data from "Heuristic"
  async getAllHeuristicTest() {
    const answer = await database.getAllObjects({
      collection: "answers",
    });
    const list = [];
    answer.forEach((doc) => {
      list.push(Object.assign({ id: doc.id }, doc.data()));
    });
    return list;
  }
  //GetAll data from "HeuristicAnswer"
  async getAllHeuristicAnswer() {
    const answer = await database.getAllObject(api);
    return new Map(answer.map((obj) => [obj.id, new HeuristicAnswer(obj)]));
  }
  //GetAll data from "HeuristicQuestion"
  async getAllHeuristicQuestion() {
    const answer = await database.getAllObject(api);
    return new Map(answer.map((obj) => [obj.id, new HeuristicQuestion(obj)]));
  }
  //GetAll data from "HeuristicQuestionAnswer"
  async getAllHeuristicQuestionAnswer() {
    const answer = await database.getAllObject(api);
    return new Map(
      answer.map((obj) => [obj.id, new HeuristicQuestionAnswer(obj)])
    );
  }
  //GetAll data from "HeuristicQuestionDescription"
  async getAllHeuristicQuestionDescription() {
    const answer = await database.getAllObject(api);
    return new Map(
      answer.map((obj) => [obj.id, new HeuristicQuestionDescription(obj)])
    );
  }
}
