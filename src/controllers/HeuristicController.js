// imports

import Heuristic from "@/models/Heuristic";
import HeuristicAnswer from "@/models/HeuristicAnswer";
import HeuristicQuestion from "@/models/HeuristicQuestion";
import HeuristicQuestionAnswer from "@/models/HeuristicQuestionAnswer";
import HeuristicQuestionDescription from "@/models/HeuristicQuestionDescription";

// functions

function toHeuristic(){
  return new Heuristic()
}
function toHeuristicAnswer(){
  return new HeuristicAnswer()
}
function toHeuristicQuestion(){
  return new HeuristicQuestion()
}
function toHeuristicQuestionAnswer(){
  return new HeuristicQuestionAnswer()
}
function toHeuristicQuestionDescription(){
  return new HeuristicQuestionDescription()
}

import Controller from '@/controllers/BaseController'

export default class HeuristicController extends Controller{
  constructor() {
    super()
  }

  async createNewHeuristic(path, document, data){
    return super.create(path, document, data).then((res)=> {
      return res
    })
  }

  async deleteHeuristic(path, document){
    return super.delete(path, document).then((res)=> {
      return res
    })
  }

  async updateHeuristic(path, document, payload){
    return super.delete(path, document, payload).then((res)=> {
      return res
    })
  }

  //------------------GET OBJECTS - ID------------------

  //GetObject of Heuristic
  async getObjectHeuristic(path, parameter, condition){
    return super.read(path, parameter, condition, toHeuristic)  
  }

  //GetObject of HeuristicAnswer
  async getObjectHeuristicAnswer(path, parameter, condition){
    return super.read(path, parameter, condition, toHeuristicAnswer)  
  }

  //GetObject of HeuristicQuestion
  async getObjectHeuristicQuestion(path, parameter, condition){
    return super.read(path, parameter, condition, toHeuristicQuestion)  
  }

  //GetObject of HeuristicQuestionAnswer
  async getObjectHeuristicQuestionAnswer(path, parameter, condition){
    return super.read(path, parameter, condition, toHeuristicQuestionAnswer)  
  }

  //GetObject of HeuristicQuestionDescription
  async getObjectHeuristicQuestionDescription(path, parameter, condition){
    return super.read(path, parameter, condition, toHeuristicQuestionDescription)  
  }


  // ----------------GET ALL OBJECTS----------------

  //GetObject of Heuristic
  async getAllObjectHeuristic(path){
    return super.readAll(path, toHeuristic).then((res)=> {
      return res
    })
  }

  //GetObject of HeuristicAnswer
  async getAllObjectHeuristicAnswer(path){
    return super.readAll(path, toHeuristicAnswer).then((res)=> {
      return res
    })
  }

  //GetObject of HeuristicQuestion
  async getAllObjectHeuristicQuestion(path){
    return super.readAll(path, toHeuristicQuestion).then((res)=> {
      return res
    })
  }

  //GetObject of HeuristicQuestionAnswer
  async getAllObjectHeuristicQuestionAnswer(path){
    return super.readAll(path, toHeuristicQuestionAnswer).then((res)=> {
      return res
    })
  }

  //GetObject of HeuristicQuestionDescription
  async getAllObjectHeuristicQuestionDescription(path){
    return super.readAll(path, toHeuristicQuestionDescription).then((res)=> {
      return res
    })
  }


}
