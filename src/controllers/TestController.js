// imports

import Test from "@/models/Test";
import TestAdmin from "@/models/TestAdmin";
import TestStructure from "@/models/TestStructure";
import TestStructureOptions from "@/models/TestStructureOptions";
import TestTemplateDoc from "@/models/TestTemplateDoc";

// functions

function toTest(){
  return new Test()
}
function toTestAdmin(){
  return new TestAdmin()
}
function toTestStructure(){
  return new TestStructure()
}
function toTestStructureOptions(){
  return new TestStructureOptions()
}
function toTestTemplateDoc(){
  return new TestTemplateDoc()
}


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
  async getObjectTest(path, parameter, condition){
    return super.read(path, parameter, condition, toTest)  //consulta onde (parameter)id == (condition)"legal"
  }

  //GetObject of TestAdmin
  async getObjectTestAdmin(path, parameter, condition){
    return super.read(path, parameter, condition, toTestAdmin)  //consulta onde (parameter)id == (condition)"legal"
  }

  //GetObject of TestStructure
  async getObjectTestStructure(path, parameter, condition){
    return super.read(path, parameter, condition, toTestStructure)  //consulta onde (parameter)id == (condition)"legal"
  }

  //GetObject of TestStructureOptions
  async getObjectTestStructureOptions(path, parameter, condition){
    return super.read(path, parameter, condition, toTestStructureOptions)  //consulta onde (parameter)id == (condition)"legal"
  }

  //GetObject of TestTemplateDoc
  async getObjectTestTemplateDoc(path, parameter, condition){
    return super.read(path, parameter, condition, toTestTemplateDoc)  //consulta onde (parameter)id == (condition)"legal"
  }


  // //----------------GET ALL OBJECTS----------------

  //GetObject of Test
  async getAllObjectTest(path){
    return super.readAll(path, toTest).then((res)=> {
      return res
    })
  }

  //GetObject of TestAdmin
  async getAllObjectTestAdmin(path){
    return super.readAll(path, toTestAdmin).then((res)=> {
      return res
    })
  }

  //GetObject of TestStructure
  async getAllObjectTestStructure(path){
    return super.readAll(path, toTestStructure).then((res)=> {
      return res
    })
  }

  //GetObject of TestStructureOptions
  async getAllObjectTestStructureOptions(path){
    return super.readAll(path, toTestStructureOptions).then((res)=> {
      return res
    })
  }

  //GetObject of TestTemplateDoc
  async getAllObjectTestTemplateDoc(path){
    return super.readAll(path, toTestTemplateDoc).then((res)=> {
      return res
    })
  }

}
  

// "_" before attibutes and mehtods turn them into PRIVATE