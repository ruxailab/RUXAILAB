// imports

import Template from "@/models/Template";
import TemplateAuthor from "@/models/TemplateAuthor";
import TemplateBody from "@/models/TemplateBody";
import TemplateHeader from "@/models/TemplateHeader";

import Controller from "@/controllers/BaseController";

export default class TemplateController extends Controller {
    constructor() {
        super();
    }

    createNewTemplate(document, data) {
        return super.create("templates", document, data).then((res) => {
            return res;
        });
    }

    deleteTemplate(document) {
        return super.delete("templates", document).then((res) => {
            return res;
        });
    }

    updateTemplate(document, payload) {
        return super.delete("templates", document, payload).then((res) => {
            return res;
        });
    }

    //------------------GET OBJECTS - ID------------------

    //GetObject of Template
    getObjectTemplate(parameter, condition) {
        return super
            .read("templates", parameter, condition)
            .then((response) => {
                let res = response.map(Template.toTemplate);
                console.log("TemplateController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TemplateController error: ", err);
            });
    }

    //GetObject of TemplateAuthor
    getObjectTemplateAuthor(parameter, condition) {
        return super
            .read("templates", parameter, condition)
            .then((response) => {
                let res = response.map(TemplateAuthor.toTemplateAuthor);
                console.log("TemplateAuthorController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TemplateAuthorController error: ", err);
            });
    }

    //GetObject of TemplateBody
    getObjectTemplateBody(parameter, condition) {
        return super
            .read("templates", parameter, condition)
            .then((response) => {
                let res = response.map(TemplateBody.toTemplateBody);
                console.log("TemplateBodyController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TemplateBodyController error: ", err);
            });
    }

    //GetObject of TemplateHeader
    getObjectTemplateHeader(parameter, condition) {
        return super
            .read("templates", parameter, condition)
            .then((response) => {
                let res = response.map(TemplateHeader.toTemplateHeader);
                console.log("TemplateHeaderController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TemplateHeaderController error: ", err);
            });
    }

    //----------------GET ALL OBJECTS----------------

    //GetObject of Template
    getAllTemplates() {
        console.log("Tales");
        return super
            .readAll("templates")
            .then((response) => {
                let res = response.map(Template.toTemplate);
                console.log("TemplateController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TemplateController error: ", err);
            });
    }

    //GetObject of TemplateAuthor
    getAllObjectTemplateAuthor() {
        return super
            .readAll("templates")
            .then((response) => {
                let res = response.map(TemplateAuthor.toTemplateAuthor);
                console.log("TemplateAuthorController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TemplateAuthorController error: ", err);
            });
    }

    //GetObject of TemplateBody
    getAllObjectTemplateBody() {
        return super
            .readAll("templates")
            .then((response) => {
                let res = response.map(TemplateBody.toTemplateBody);
                console.log("TemplateBodyController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TemplateBodyController error: ", err);
            });
    }

    //GetObject of TemplateHeader
    getAllObjectTemplateHeader() {
        return super
            .readAll("templates")
            .then((response) => {
                let res = response.map(TemplateHeader.toTemplateHeader);
                console.log("TemplateHeaderController res: ", res);
                return res;
            })
            .catch((err) => {
                console.log("TemplateHeaderController error: ", err);
            });
    }
}
