// imports

// import api from "@/api/index";
// import database from "@/api/modules/database";

import Template from "@/models/Template";
import TemplateAuthor from "@/models/TemplateAuthor";
import TemplateBody from "@/models/TemplateBody";
import TemplateHeader from "@/models/TemplateHeader";

import Controller from '@/controllers/BaseController';  

export default class TemplateController extends Controller{
  constructor() {
    super()
  }

  async createNewTemplate(path, document, data){
    return super.create(path, document, data).then((res)=> {
      return res
    })
  }

  async deleteTemplate(path, document){
    return super.delete(path, document).then((res)=> {
      return res
    })
  }

  async updateTemplate(path, document, payload){
    return super.delete(path, document, payload).then((res)=> {
      return res
    })
  }

  //------------------GET OBJECTS  - ID------------------

  //GetObject of Template
  async getObjectTemplate(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new Template(res);
    })
  }

  //GetObject of TemplateAuthor
  async getObjectTemplateAuthor(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new TemplateAuthor(res);
    })
  }

  //GetObject of TemplateBody
  async getObjectTemplateBody(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new TemplateBody(res);
    })
  }

  //GetObject of TemplateHeader
  async getObjectTemplateHeader(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new TemplateHeader(res);
    })
  }



  //----------------GET ALL OBJECTS----------------

  //GetAll data from "Template"
  async getAllTemplate(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new Map(res.map((obj) => [obj.id, new Template(obj)]));
  })}

  //GetAll data from "TemplateAuthor"
  async getAllTemplateAuthor(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new Map(res.map((obj) => [obj.id, new TemplateAuthor(obj)]));
  })}

  //GetAll data from "TemplateBody"
  async getAllTemplateBody(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new Map(res.map((obj) => [obj.id, new TemplateBody(obj)]));
  })}

  //GetAll data from "TemplateHeader"
  async getAllTemplateHeader(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new Map(res.map((obj) => [obj.id, new TemplateHeader(obj)]));
  })}


}


//   async createNewTemplate(data) {
//     return database.createObject(api, data);
//   }
//   //
//   async deleteTemplate(data) {
//     return database.deleteObject(api, data);
//   }
//   //
//   async updateTemplate(data) {
//     return database.updateObject(api, data);
//   }

//   //------------------GET OBJECTS------------------
//   //GetObject of Template
//   async getObjectTemplate(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new Template(answer);
//   }

//   //GetObject of TemplateAuthor
//   async getObjectTemplateAuthor(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new TemplateAuthor(answer);
//   }

//   //GetObject of TemplateBody
//   async getObjectTemplateBody(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new TemplateBody(answer);
//   }

//   //GetObject of TemplateHeader
//   async getObjectTemplateHeader(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new TemplateHeader(answer);
//   }

//   //----------------GET ALL OBJECTS----------------
//   //GetAll data from "Template"
//   async getAllTemplate() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new Template(obj)]));
//   }
//   //GetAll data from "TemplateAuthor"
//   async getAllTemplateAuthor() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new TemplateAuthor(obj)]));
//   }
//   //GetAll data from "TemplateBody"
//   async getAllTemplateBody() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new TemplateBody(obj)]));
//   }
//   //GetAll data from "TemplateHeader"
//   async getAllTemplateHeader() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new TemplateHeader(obj)]));
//   }
// }
