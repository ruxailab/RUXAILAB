//controller is an action class, like add, edit, clean etc etc.

// imports

/* 
import {TestController} from '././TestController'

let testController = new TestController()
*/

import api from "@/api/index";
import database from "../api/modules/database";

import Test from "../models/Test";
import TestAdmin from "../models/TestAdmin";
import TestStructure from "../models/TestStructure";
import TestStructureOptions from "../models/TestStructureOptions";
import TestTempleteDoc from "../models/TestTemplateDoc";

export default class TestController {
  //
  async createNewTest(data) {
    return database.createObject(api, data);
  }
  //
  async deleteTest(data) {
    return database.deleteObject(api, data);
  }
  //
  async updateTest(data) {
    return database.updateObject(api, data);
  }
  //Get data from "Test"
  async getTest() {
    const answer = await database.getObject(api);
    return new Map(answer.map((obj) => [obj.id, new Test(obj)]));
  }
  //Get data from "TestAdmin"
  async getTestAdmin() {
    const answer = await database.getObject(api);
    return new Map(answer.map((obj) => [obj.id, new TestAdmin(obj)]));
  }
  //Get data from "TestStructure"
  async getTestStructure() {
    const answer = await database.getObject(api);
    return new Map(answer.map((obj) => [obj.id, new TestStructure(obj)]));
  }
  //Get data from "TestStructureOptions"
  async getTestStructureOptions() {
    const answer = await database.getObject(api);
    return new Map(
      answer.map((obj) => [obj.id, new TestStructureOptions(obj)])
    );
  }
  //Get data from "TestTempleteDoc"
  async getTestTempleteDoc() {
    const answer = await database.getObject(api);
    return new Map(answer.map((obj) => [obj.id, new TestTempleteDoc(obj)]));
  }

  constructor() {}
}

/* "_" before attibutes and mehtods turn them into PRIVATE*/
