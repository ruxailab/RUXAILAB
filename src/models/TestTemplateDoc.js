     /**
     * Create a TestTemplateDoc.
     * @param {string} templateDocId - The templateDocId value.
     * @param {string} templateName - The templateName value.
     * @param {boolean} fromTemplate - The fromTemplate value.
     */

export default class TestTemplateDoc{
    constructor({
        templateDocId, templateName, fromTemplate
    } = {}
    ) {
        this.templateDocId = templateDocId;
        this.templateName = templateName;
        this.fromTemplate = fromTemplate;
    }
    static toTestTemplateDoc(data) {
        return new TestTemplateDoc(data)
    }
}

