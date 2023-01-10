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

  createNewTest(document, data){
    return super.create("test", document, data).then((res)=> {
      return res
    })
  }

  deleteTest(document){
    return super.delete("test", document).then((res)=> {
      return res
    })
  }

  updateTest(document, payload){
    return super.delete("test", document, payload).then((res)=> {
      return res
    })
  }

  //------------------GET OBJECTS - ID------------------

  //GetObject of Test
  getObjectTest(parameter, condition){
    return super.read("test", parameter, condition).then((response) => {
      let res = response.map(Test.toTest)
      console.log("TestController res: ", res)
      return res
    }).catch((err) => { 
      console.log("TestController error: ", err)
    })  
  }

  //GetObject of TestAdmin
  getObjectTestAdmin(parameter, condition){
    return super.read("test", parameter, condition).then((response) => {
      let res = response.map(TestAdmin.toTestAdmin)
      console.log("TestAdminController res: ", res)
      return res
    }).catch((err) => { 
      console.log("TestAdminController error: ", err)
    })  
  }

  //GetObject of TestStructure
  getObjectTestStructure(parameter, condition){
    return super.read("test", parameter, condition).then((response) => {
      let res = response.map(TestStructure.toTestStructure)
      console.log("TestStructureController res: ", res)
      return res
    }).catch((err) => { 
      console.log("TestStructureController error: ", err)
    })  
  }

  //GetObject of TestStructureOptions
  getObjectTestStructureOptions(parameter, condition){
    return super.read("test", parameter, condition).then((response) => {
      let res = response.map(TestStructureOptions.toTestStructureOptions)
      console.log("TestStructureOptionsController res: ", res)
      return res
    }).catch((err) => { 
      console.log("TestStructureOptionsController error: ", err)
    })  
  }

  //GetObject of TestTemplateDoc
  getObjectTestTemplateDoc(parameter, condition){
    return super.read("test", parameter, condition).then((response) => {
      let res = response.map(TestTemplateDoc.toTestTemplateDoc)
      console.log("TestTemplateDocController res: ", res)
      return res
    }).catch((err) => { 
      console.log("TestTemplateDocController error: ", err)
    })  
  }

  // ----------------GET ALL OBJECTS----------------

  //GetObject of Test
  getAllObjectTest(){
    return super.readAll("test").then((response) => {
      let res = response.map(Test.toTest)
      console.log("TestController res: ", res)
      return res
    }).catch((err) => { 
      console.log("TestController error: ", err)
    })  
  }

   //GetObject of TestAdmin
   getAllObjectTestAdmin(){
    return super.readAll("test").then((response) => {
      let res = response.map(TestAdmin.toTestAdmin)
      console.log("TestAdminController res: ", res)
      return res
    }).catch((err) => { 
      console.log("TestAdminController error: ", err)
    })  
  }

   //GetObject of TestStructure
   getAllObjectTestStructure(){
    return super.readAll("test").then((response) => {
      let res = response.map(TestStructure.toTestStructure)
      console.log("TestStructureController res: ", res)
      return res
    }).catch((err) => { 
      console.log("TestStructureController error: ", err)
    })  
  }

   //GetObject of TestStructureOptions
   getAllObjectTestStructureOptions(){
    return super.readAll("test").then((response) => {
      let res = response.map(TestStructureOptions.toTestStructureOptions)
      console.log("TestStructureOptionsController res: ", res)
      return res
    }).catch((err) => { 
      console.log("TestStructureOptionsController error: ", err)
    })  
  }

   //GetObject of TestTemplateDoc
   getAllObjectTestTemplateDoc(){
    return super.readAll("test").then((response) => {
      let res = response.map(TestTemplateDoc.toTestTemplateDoc)
      console.log("TestTemplateDocController res: ", res)
      return res
    }).catch((err) => { 
      console.log("TestTemplateDocController error: ", err)
    })  
  }

}
  

// "_" before attibutes and mehtods turn them into PRIVATE