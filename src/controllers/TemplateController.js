// imports

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

  //------------------GET OBJECTS - ID------------------

  //GetObject of Template
  async getObjectTemplate(parameter, condition){
    return super.read('templates', parameter, condition, Template.toTemplate).then((res)=> {
      return res
    })  
  }

  //GetObject of TemplateAuthor
  async getObjectTemplateAuthor(parameter, condition){
    return super.read('templates', parameter, condition, TemplateAuthor.toTemplateAuthor).then((res)=> {
      return res
    })  
  }

  //GetObject of TemplateBody
  async getObjectTemplateBody(parameter, condition){
    return super.read('templates', parameter, condition, TemplateBody.toTemplateBody).then((res)=> {
      return res
    })  
  }

  //GetObject of TemplateHeader
  async getObjectTemplateHeader(parameter, condition){
    return super.read('templates', parameter, condition, TemplateHeader.toTemplateHeader).then((res)=> {
      return res
    })  
  }


  //----------------GET ALL OBJECTS----------------

  //GetObject of Template
  async getAllObjectTemplate(){
    return super.readAll('templates', Template.toTemplate).then((res)=> {
      return res
    })
  }

  //GetObject of TemplateAuthor
  async getAllObjectTemplateAuthor(){
    return super.readAll('templates', TemplateAuthor.toTemplateAuthor).then((res)=> {
      return res
    })
  }

  //GetObject of TemplateBody
  async getAllObjectTemplateBody(){
    return super.readAll('templates', TemplateBody.toTemplateBody).then((res)=> {
      return res
    })
  }

  //GetObject of TemplateHeader
  async getAllObjectTemplateHeader(){
    return super.readAll('templates', TemplateHeader.toTemplateHeader).then((res)=> {
      return res
    })
  }

}
