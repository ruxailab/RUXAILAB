// imports

import Template from "@/models/Template";
import TemplateAuthor from "@/models/TemplateAuthor";
import TemplateBody from "@/models/TemplateBody";
import TemplateHeader from "@/models/TemplateHeader";

// functions

function toTemplate(){
  return new Template()
}
function toTemplateAuthor(){
  return new TemplateAuthor()
}
function toTemplateBody(){
  return new TemplateBody()
}
function toTemplateHeader(){
  return new TemplateHeader()
}


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

  //------------------GET OBJECTS - ID------------------

  //GetObject of Template
  async getObjectTemplate(path, parameter, condition){
    return super.read(path, parameter, condition, toTemplate)  
  }

  //GetObject of TemplateAuthor
  async getObjectTemplateAuthor(path, parameter, condition){
    return super.read(path, parameter, condition, toTemplateAuthor)  
  }

  //GetObject of TemplateBody
  async getObjectTemplateBody(path, parameter, condition){
    return super.read(path, parameter, condition, toTemplateBody)  
  }

  //GetObject of TemplateHeade
  async getObjectTemplateHeader(path, parameter, condition){
    return super.read(path, parameter, condition, toTemplateHeader)  
  }


  //----------------GET ALL OBJECTS----------------

  //GetObject of Template
  async getAllObjectTemplate(path){
    return super.readAll(path, toTemplate).then((res)=> {
      return res
    })
  }

  //GetObject of TemplateAuthor
  async getAllObjectTemplateAuthor(path){
    return super.readAll(path, toTemplateAuthor).then((res)=> {
      return res
    })
  }

  //GetObject of TemplateBody
  async getAllObjectTemplateBody(path){
    return super.readAll(path, toTemplateBody).then((res)=> {
      return res
    })
  }

  //GetObject of TemplateHeader
  async getAllObjectTemplateHeader(path){
    return super.readAll(path, toTemplateHeader).then((res)=> {
      return res
    })
  }

}
