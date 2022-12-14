     /**
     * Create a Template.
     * @param {Object} body - The TemplateBody value.
     * @param {Object} header - The TemplateHeader value.
     */

export default class Template{
    constructor({
        body, header
    } = {}
    ) {
        this.body = body;
        this.header = header;
    }
    static toTemplate(data) {
        return new Template(data)
    }
}