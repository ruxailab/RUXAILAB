// imports

import Template from "@/models/Template";

import Controller from '@/controllers/BaseController';  
const COLLECTION = "templatese";

export default class TemplateController extends Controller{
  constructor() {
    super()
  }

  async createTemplate(data){
    console.log('asa')
    console.log(data)
  await super.create(COLLECTION, data).then((res)=> {
      return res
    })
  }

  deleteTemplate(document){
    return super.delete(COLLECTION, document).then((res)=> {
      return res
    })
  }

  updateTemplate(document, payload){
    return super.delete('templates', document, payload).then((res)=> {
      return res
    })
  }

  //------------------GET OBJECTS - ID------------------

  //GetObject of Template
  getObjectTemplate(parameter, condition){
    return super.read("templates", parameter, condition).then((response) => {
      let res = response.map(Template.toTemplate)
      console.log("TemplateController res: ", res)
      return res
    }).catch((err) => { 
      console.log("TemplateController error: ", err)
    })  
  }



  //----------------GET ALL OBJECTS----------------

  //GetObject of Template
  getAllObjectTemplate(){
    return super.readAll("templates").then((response) => {
      let res = response.map(Template.toTemplate)
      console.log("TemplateController res: ", res)
      return res
    }).catch((err) => { 
      console.log("TemplateController error: ", err)
    })  
  }

  

}
