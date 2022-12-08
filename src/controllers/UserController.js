// imports

// import api from "@/api/index";
// import database from "@/api/modules/database";

import User from "@/models/User";
import UserAnswer from "@/models/UserAnswer";
import UserTask from "@/models/UserTask";
import UserTemplate from "@/models/UserTemplate";
import UserTest from "@/models/UserTest";

import Controller from '@/controllers/BaseController'

export default class UserController extends Controller{

  constructor() {
    super()
  }

  async createNewUser(path, document, data){
    return super.create(path, document, data).then((res)=> {
      return res
    })
  }

  async deleteUser(path, document){
    return super.delete(path, document).then((res)=> {
      return res
    })
  }

  async updateUser(path, document, payload){
    return super.delete(path, document, payload).then((res)=> {
      return res
    })
  }


  //------------------GET OBJECTS------------------

  //GetObject of User
  async getObjectUser(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new User(res);
    })
  }

  //GetObject of UserAnswer
  async getObjectUserAnswer(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new UserAnswer(res);
    })
  }

  //GetObject of UserTask
  async getObjectUserTask(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new UserTask(res);
    })
  }

  //GetObject of UserTemplate
  async getObjectUserTemplate(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new UserTemplate(res);
    })
  }

  //GetObject of UserTest
  async getObjectUserTest(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new UserTest(res);
    })
  }


  //----------------GET ALL OBJECTS----------------

  //GetAll data from "User"
  async getAllUser(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new Map(res.map((obj) => [obj.id, new User(obj)]));
  })}

  //GetAll data from "UserAnswer"
  async getAllUserAnswer(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new Map(res.map((obj) => [obj.id, new UserAnswer(obj)]));
  })}

  //GetAll data from "UserTask"
  async getAllUserTask(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new Map(res.map((obj) => [obj.id, new UserTask(obj)]));
  })}

  //GetAll data from "UserTemplate"
  async getAllUserTemplate(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new Map(res.map((obj) => [obj.id, new UserTemplate(obj)]));
  })}

  //GetAll data from "UserTest"
  async getAllUserTest(path, parameter, id) {
    return super.read(path, parameter, id).then((res)=> {
      return new Map(res.map((obj) => [obj.id, new UserTest(obj)]));
  })}



}



  //
//   async createNewUser(data) {
//     return database.createObject(api, data);
//   }
//   //
//   async deleteUser(data) {
//     return database.deleteObject(api, data);
//   }
//   //
//   async updateUser(data) {
//     return database.updateObject(api, data);
//   }

//   //------------------GET OBJECTS------------------
//   //GetObject of User
//   async getObjectUser(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new User(answer);
//   }

//   //GetObject of UserAnswer
//   async getObjectUserAnswer(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new UserAnswer(answer);
//   }

//   //GetObject of UserTask
//   async getObjectUserTask(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new UserTask(answer);
//   }

//   //GetObject of UserTemplate
//   async getObjectUserTemplate(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new UserTemplate(answer);
//   }

//   //GetObject of UserTest
//   async getObjectUserTest(id) {
//     const answer = await database.getObject(api + "/" + id);
//     return new UserTest(answer);
//   }

//   //----------------GET ALL OBJECTS----------------
//   //GetAll data from "User"
//   async getAllUser() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new User(obj)]));
//   }
//   //GetAll data from "UserAnswer"
//   async getAllUserAnswer() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new UserAnswer(obj)]));
//   }
//   //GetAll data from "UserTask"
//   async getAllUserTask() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new UserTask(obj)]));
//   }
//   //GetAll data from "UserTemplate"
//   async getAllUserTemplate() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new UserTemplate(obj)]));
//   }
//   //GetAll data from "UserTest"
//   async getAllUserTest() {
//     const answer = await database.getAllObject(api);
//     return new Map(answer.map((obj) => [obj.id, new UserTest(obj)]));
//   }
// }

//How do i use an api push?
