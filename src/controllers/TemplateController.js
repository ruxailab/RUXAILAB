// imports

import api from "@/api/index";
import database from "@/api/modules/database";

import Template from "@/models/Template";
import TemplateAuthor from "@/models/TemplateAuthor";
import TemplateBody from "@/models/TemplateBody";
import TemplateHeader from "@/models/TemplateHeader";

export default class TemplateController {
  async createNewTemplate(data) {
    return database.createObject(api, data);
  }
  //
  async deleteTemplate(data) {
    return database.deleteObject(api, data);
  }
  //
  async updateTemplate(data) {
    return database.updateObject(api, data);
  }

  //------------------GET OBJECTS------------------
  //GetObject of Template
  async getObjectTemplate(id) {
    const answer = await database.getObject(api + "/" + id);
    return new Template(answer);
  }

  //GetObject of TemplateAuthor
  async getObjectTemplateAuthor(id) {
    const answer = await database.getObject(api + "/" + id);
    return new TemplateAuthor(answer);
  }

  //GetObject of TemplateBody
  async getObjectTemplateBody(id) {
    const answer = await database.getObject(api + "/" + id);
    return new TemplateBody(answer);
  }

  //GetObject of TemplateHeader
  async getObjectTemplateHeader(id) {
    const answer = await database.getObject(api + "/" + id);
    return new TemplateHeader(answer);
  }

  //----------------GET ALL OBJECTS----------------
  //GetAll data from "Template"
  async getAllTemplate() {
    const answer = await database.getAllObject(api);
    return new Map(answer.map((obj) => [obj.id, new Template(obj)]));
  }
  //GetAll data from "TemplateAuthor"
  async getAllTemplateAuthor() {
    const answer = await database.getAllObject(api);
    return new Map(answer.map((obj) => [obj.id, new TemplateAuthor(obj)]));
  }
  //GetAll data from "TemplateBody"
  async getAllTemplateBody() {
    const answer = await database.getAllObject(api);
    return new Map(answer.map((obj) => [obj.id, new TemplateBody(obj)]));
  }
  //GetAll data from "TemplateHeader"
  async getAllTemplateHeader() {
    const answer = await database.getAllObject(api);
    return new Map(answer.map((obj) => [obj.id, new TemplateHeader(obj)]));
  }
}
