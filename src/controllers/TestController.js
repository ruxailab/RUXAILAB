// imports

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

  //------------------GET OBJECTS - ID------------------

  //GetObject of Test
  async getObjectTest(parameter, condition){
    return super.read('test', parameter, condition, Test.toTest).then((res)=> {
      return res
    })  
  }

  //GetObject of TestAdmin
  async getObjectTestAdmin(parameter, condition){
    return super.read('test', parameter, condition, TestAdmin.toTestAdmin).then((res)=> {
      return res
    })  
  }

  //GetObject of TestStructure
  async getObjectTestStructure(parameter, condition){
    return super.read('test', parameter, condition, TestStructure.toTestStructure).then((res)=> {
      return res
    })  
  }

  //GetObject of TestStructureOptions
  async getObjectTestStructureOptions(parameter, condition){
    return super.read('test', parameter, condition, TestStructureOptions.toTestStructureOptions).then((res)=> {
      return res
    })  
  }

  //GetObject of TestTemplateDoc
  async getObjectTestTemplateDoc(parameter, condition){
    return super.read('test', parameter, condition, TestTemplateDoc.toTestTemplateDoc).then((res)=> {
      return res
    })  
  }


  // ----------------GET ALL OBJECTS----------------

  //GetObject of Test
  async getAllObjectTest(){
    return super.readAll('test', Test.toTest).then((res)=> {
      return res
    })
  }

  //GetObject of TestAdmin
  async getAllObjectTestAdmin(){
    return super.readAll('test', TestAdmin.toTestAdmin).then((res)=> {
      return res
    })
  }

  //GetObject of TestStructure
  async getAllObjectTestStructure(){
    return super.readAll('test', TestStructure.toTestStructure).then((res)=> {
      return res
    })
  }

  //GetObject of TestStructureOptions
  async getAllObjectTestStructureOptions(){
    return super.readAll('test', TestStructureOptions.toTestStructureOptions).then((res)=> {
      return res
    })
  }

  //GetObject of TestTemplateDoc
  async getAllObjectTestTemplateDoc(){
    return super.readAll('test', TestTemplateDoc.toTestTemplateDoc).then((res)=> {
      return res
    })
  }

}
  

// "_" before attibutes and mehtods turn them into PRIVATE