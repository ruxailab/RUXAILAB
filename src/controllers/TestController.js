//controller is an action class, like add, edit, clean etc etc.

// imports

/* 
import {TestController} from '././TestController'

let testController = new TestController()
*/

import api from "@/api/index";

// import Test from "../models/Test";
// import TestAdmin from "../models/TestAdmin";
// import TestStructure from "../models/TestStructure";
// import TestStructureOptions from "../models/TestStructureOptions";
// import TestTempleteDoc from "../models/TestTemplateDoc";

export class TestController {
  async TestAdmin(Object) {
    return super.create(api, Object);
  }
  // attributes/properties
  // methods
  // constructor
  constructor() {}

  async;
}

/* "_" before attibutes and mehtods turn them into PRIVATE*/
