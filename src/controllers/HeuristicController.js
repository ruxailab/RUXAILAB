/* 
import {HeuristicController} from '././HeuristicController'

let HeuristicController = new HeuristicController()
*/

// imports

import api from "@/api/index";
import database from "../api/modules/database";

import Heuristic from "../models/Heuristic";
import HeuristicAnswer from "../models/HeuristicAnswer";
import HeuristicQuestion from "../models/HeuristicQuestion";
import HeuristicQuestionAnswer from "../models/HeuristicQuestionAnswer";
import HeuristicQuestionDescription from "../models/HeuristicQuestionDescription";
import HeuristicTest from "../models/HeuristicTest";

export default class HeuristicController {
  //
  async createNewHeuristic(data) {
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
    console.log(id);
    console.log(api + "/" + id);
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
    const answer = await database.getAllObject(api);
    return new Map(answer.map((obj) => [obj.id, new Heuristic(obj)]));
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
