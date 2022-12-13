// imports

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


  //------------------GET OBJECTS - ID------------------

  //GetObject of User
  async getObjectUser(parameter, condition){
    return super.read('users', parameter, condition, User.toUser).then((res)=> {
      return res
    })  
  }

  //GetObject of UserAnswer
  async getObjectUserAnswer(parameter, condition){
    return super.read('users', parameter, condition, UserAnswer.toUserAnswer).then((res)=> {
      return res
    })  
  }

  //GetObject of UserTask
  async getObjectUserTask(parameter, condition){
    return super.read('users', parameter, condition, UserTask.toUserTask).then((res)=> {
      return res
    })  
  }

  //GetObject of UserTemplate
  async getObjectUserTemplate(parameter, condition){
    return super.read('users', parameter, condition, UserTemplate.toUserTemplate).then((res)=> {
      return res
    })  
  }

  //GetObject of UserTest
  async getObjectUserTest(parameter, condition){
    return super.read('users', parameter, condition, UserTest.toUserTest).then((res)=> {
      return res
    })  
  }


  //----------------GET ALL OBJECTS----------------

  //GetObject of User
  async getAllObjectUser(){
    return super.readAll('users', User.toUser).then((res)=> {
      return res
    })
  }

  //GetObject of UserAnswer
  async getAllObjectUserAnswer(){
    return super.readAll('users', UserAnswer.toUserAnswer).then((res)=> {
      return res
    })
  }

  //GetObject of UserTask
  async getAllObjectUserTask(){
    return super.readAll('users', UserTask.toUserTask).then((res)=> {
      return res
    })
  }

  //GetObject of UserTemplate
  async getAllObjectUserTemplate(){
    return super.readAll('users', UserTemplate.toUserTemplate).then((res)=> {
      return res
    })
  }

  //GetObject of UserTest
  async getAllObjectUserTest(){
    return super.readAll('users', UserTest.toUserTest).then((res)=> {
      return res
    })
  }

}