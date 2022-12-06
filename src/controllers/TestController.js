// imports

//import api from "@/api/index";
//import database from "@/api/modules/database";

import Test from "@/models/Test";
import TestAdmin from "@/models/TestAdmin";
import TestStructure from "@/models/TestStructure";
import TestStructureOptions from "@/models/TestStructureOptions";
import TestTemplateDoc from "@/models/TestTemplateDoc";

import Controller from '@/controllers/BaseController'

export default class TestController extends Controller{
  constructor() {
    super()
  }

  async createNewTest(path, document, data){
    return super.create(path, document, data).then((res)=> {
      return res
    })
  }

  async deleteTest(path, document){
    return super.delete(path, document).then((res)=> {
      return res
    })
  }

  async updateTest(path, document, payload){
    return super.delete(path, document, payload).then((res)=> {
      return res
    })
  }

  //------------------GET OBJECTS  - ID------------------

  //GetObject of Test
  async getObjectTest(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new Test(res);
    })
  }

  //GetObject of TestAdmin
  async getObjectTestAdmin(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new TestAdmin(res);
    })
  }

  //GetObject of TestStructure
  async getObjectTestStructure(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new TestStructure(res);
    })
  }

  //GetObject of TestStructureOptions
  async getObjectTestStructureOptions(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new TestStructureOptions(res);
    })
  }

  //GetObject of TestTemplateDoc
  async getObjectTestTemplateDoc(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new TestTemplateDoc(res);
    })
  }


  //----------------GET ALL OBJECTS----------------

  //GetAll data from "Test"
  async getAllTest(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new Map(res.map((obj) => [obj.id, new Test(obj)]));
    })
    
  }


}


//   async createNewTest(data) {
//     return database.createObject(api, data);
//   }

//   async deleteTest(data) {
//     return database.deleteObject(api, data);
//   }
  
//   async updateTest(data) {
//     return database.updateObject(api, data);
//   }

//   //------------------GET OBJECTS------------------
//   //GetObject of Test
//   async getObjectTest(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new Test(answer);
//   }

//   //GetObject of TestAdmin
//   async getObjectTestAdmin(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new TestAdmin(answer);
//   }

//   //GetObject of TestStructure
//   async getObjectTestStructure(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new TestStructure(answer);
//   }

//   //GetObject of TestStructureOptions
//   async getObjectTestStructureOptions(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new TestStructureOptions(answer);
//   }

//   //GetObject of TestTemplateDoc
//   async getObjectTestTemplateDoc(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new TestTemplateDoc(answer);
//   }

//   //----------------GET ALL OBJECTS----------------
//   //GetAll data from "Test"
//   async getAllTest() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new Test(obj)]));
//   }
//   //GetAll data from "TestAdmin"
//   async getAllTestAdmin() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new TestAdmin(obj)]));
//   }
//   //GetAll data from "TestStructure"
//   async getAllTestStructure() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new TestStructure(obj)]));
//   }
//   //GetAll data from "TestStructureOptions"
//   async getAllTestStructureOptions() {
//     const answer = await database.getAllObject(api);
//     return new Map(
//       answer.map((obj) => [obj.id, new TestStructureOptions(obj)])
//     );
//   }
//   //GetAll data from "TestTemplateDoc"
//   async getAllTestTemplateDoc() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new TestTemplateDoc(obj)]));
//   }
//}

// "_" before attibutes and mehtods turn them into PRIVATE