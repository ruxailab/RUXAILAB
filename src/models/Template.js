     /**
     * Create a Template.
     * @param {Object} body - The TemplateBody value.
     * @param {Object} header - The TemplateHeader value.
     */

export default class Template{
    constructor({
        id,
        creationDate,
        description,
        title, 
        type,
        version, 
        authorEmail,
        authorDocId,
        isPublic,
        answersSheet,
        testStructure,
        testOptions,
        testId,
        } = {}
    ) {
        this.id = id;
        this.creationDate = creationDate;
        this.description = description;
        this.title = title;
        this.type = type;
        this.version = version;
        this.authorEmail = authorEmail;
        this.authorDocId = authorDocId;
        this.isPublic = isPublic;
        this.answersSheet = answersSheet;
        this.testStructure= testStructure;
        this.testOptions = testOptions;
        this.testId = testId
    }
    static toTemplate(data) {
        return new Template(data)
    }
    toFirestore() {
        return {
           creationDate: this.creationDate,
           description:  this.description,
            title:  this.title,
           type: this.type,
           version: this.version,
           authorEmail: this.authorEmail,
           authorDocId:   this.authorDocId,
           isPublic: this.isPublic,
           answersSheet: this.answersSheet,
           testStructure: this.testStructure,
           testOptions:  this.testOptions,
           testId:  this.testId,
        };
    }
}