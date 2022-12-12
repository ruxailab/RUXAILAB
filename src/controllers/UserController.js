// imports

import User from "@/models/User";
import UserAnswer from "@/models/UserAnswer";
import UserTask from "@/models/UserTask";
import UserTemplate from "@/models/UserTemplate";
import UserTest from "@/models/UserTest";

// functions

function toUser(){
  return new User()
}
function toUserAnswer(){
  return new UserAnswer()
}
function toUserTask(){
  return new UserTask()
}
function toUserTemplate(){
  return new UserTemplate()
}
function toUserTest(){
  return new UserTest()
}


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


  //------------------GET OBJECTS - ID------------------

  //GetObject of User
  async getObjectUser(path, parameter, condition){
    return super.read(path, parameter, condition, toUser)  
  }

  //GetObject of UserAnswer
  async getObjectUserAnswer(path, parameter, condition){
    return super.read(path, parameter, condition, toUserAnswer)  
  }

  //GetObject of UserTask
  async getObjectUserTask(path, parameter, condition){
    return super.read(path, parameter, condition, toUserTask)  
  }

  //GetObject of UserTemplate
  async getObjectUserTemplate(path, parameter, condition){
    return super.read(path, parameter, condition, toUserTemplate)  
  }

  //GetObject of UserTest
  async getObjectUserTest(path, parameter, condition){
    return super.read(path, parameter, condition, toUserTest)  
  }


  //----------------GET ALL OBJECTS----------------

//GetObject of User
  async getAllObjectUser(path){
    return super.readAll(path, toUser).then((res)=> {
      return res
    })
  }

  //GetObject of UserAnswer
  async getAllObjectUserAnswer(path){
    return super.readAll(path, toUserAnswer).then((res)=> {
      return res
    })
  }

  //GetObject of UserTask
  async getAllObjectUserTask(path){
    return super.readAll(path, toUserTask).then((res)=> {
      return res
    })
  }

  //GetObject of UserTemplate
  async getAllObjectUserTemplate(path){
    return super.readAll(path, toUserTemplate).then((res)=> {
      return res
    })
  }

  //GetObject of UserTest
  async getAllObjectUserTest(path){
    return super.readAll(path, toUserTest).then((res)=> {
      return res
    })
  }

}