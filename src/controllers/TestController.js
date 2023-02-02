// imports

import Test from "@/models/Test";
import TestAdmin from "@/models/TestAdmin";
import TestStructure from "@/models/TestStructure";
import TestStructureOptions from "@/models/TestStructureOptions";
import TestTemplateDoc from "@/models/TestTemplateDoc";

import Controller from "@/controllers/BaseController";
const COLLECTION = "tests";
export default class TestController extends Controller {
    constructor() {
        super();
    }

    async createTest(document, data) {
        return await super.create(document, data).then((res) => {
            return res;
        });
    }

    deleteTest(document) {
        return super.delete("test", document).then((res) => {
            return res;
        });
    }

    updateTest(payload) {
        console.log("puta updateTest");
        return super.update("tests", payload).then((res) => {
            return res;
        });
    }

    // async updateObject({ commit }, payload) {
    //     //----> firebase update example
    //     // DatabaseReference hopperRef = usersRef.child("gracehop");
    //     // Map<String, Object> hopperUpdates = new HashMap<>();
    //     // hopperUpdates.put("nickname", "Amazing Grace");
    //     // hopperRef.updateChildrenAsync(hopperUpdates);
    //     //---->old code
    //     // try {
    //     //     var docRef = await api.database.updateObject(payload);
    //     //     return docRef;
    //     // } catch (err) {
    //     //     console.error("Error in updateObject:", err);
    //     //     commit("setError", "Error updating object in database");
    //     // } finally {
    //     //     commit("setLoading", false);
    //     // }
    // }

    //------------------GET OBJECTS - ID------------------

    //GetObject of Test
    async getTest(parameter) {
        const res = await super.readOne(COLLECTION, parameter.id);
        if (!res.exists()) return null;
        console.log("TestController res: ", res.data());
        //console.log(Test.toTest(res));
        return Test.toTest(Object.assign({ id: res.id }, res.data()));
    }

    //GetObject of TestAdmin
    getObjectTestAdmin(parameter, condition) {
        return super
            .read("test", parameter, condition)
            .then((response) => {
                let res = response.map(TestAdmin.toTestAdmin);
                console.log("TestAdminController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TestAdminController error: ", err);
            });
    }

    //GetObject of TestStructure
    getObjectTestStructure(parameter, condition) {
        return super
            .read("test", parameter, condition)
            .then((response) => {
                let res = response.map(TestStructure.toTestStructure);
                console.log("TestStructureController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TestStructureController error: ", err);
            });
    }

    //GetObject of TestStructureOptions
    getObjectTestStructureOptions(parameter, condition) {
        return super
            .read("test", parameter, condition)
            .then((response) => {
                let res = response.map(
                    TestStructureOptions.toTestStructureOptions
                );
                console.log("TestStructureOptionsController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TestStructureOptionsController error: ", err);
            });
    }

    //GetObject of TestTemplateDoc
    getObjectTestTemplateDoc(parameter, condition) {
        return super
            .read("test", parameter, condition)
            .then((response) => {
                let res = response.map(TestTemplateDoc.toTestTemplateDoc);
                console.log("TestTemplateDocController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TestTemplateDocController error: ", err);
            });
    }

    // ----------------GET ALL OBJECTS----------------

    //GetObject of Test
    async getAllObjectTest() {
        return await super
            .readAll("tests")
            .then((response) => {
                let res = response.map(Test.toTest);
                console.log("TestController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TestController error: ", err);
            });
    }

    //GetObject of TestAdmin
    getAllObjectTestAdmin() {
        return super
            .readAll("test")
            .then((response) => {
                let res = response.map(TestAdmin.toTestAdmin);
                console.log("TestAdminController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TestAdminController error: ", err);
            });
    }

    //GetObject of TestStructure
    getAllObjectTestStructure() {
        return super
            .readAll("test")
            .then((response) => {
                let res = response.map(TestStructure.toTestStructure);
                console.log("TestStructureController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TestStructureController error: ", err);
            });
    }

    //GetObject of TestStructureOptions
    getAllObjectTestStructureOptions() {
        return super
            .readAll("test")
            .then((response) => {
                let res = response.map(
                    TestStructureOptions.toTestStructureOptions
                );
                console.log("TestStructureOptionsController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TestStructureOptionsController error: ", err);
            });
    }

    //GetObject of TestTemplateDoc
    getAllObjectTestTemplateDoc() {
        return super
            .readAll("test")
            .then((response) => {
                let res = response.map(TestTemplateDoc.toTestTemplateDoc);
                console.log("TestTemplateDocController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TestTemplateDocController error: ", err);
            });
    }
}

// "_" before attibutes and mehtods turn them into PRIVATE
