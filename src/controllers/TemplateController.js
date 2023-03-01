import Controller from "@/controllers/BaseController";
const COLLECTION = "templatese";

export default class TemplateController extends Controller {
    constructor() {
        super();
    }

    async createTemplate(data) {
        return await super.create(COLLECTION, data);
    }
}
