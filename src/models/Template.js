/**
 * Create a Template.
 * @param {Object} body - The TemplateBody value.
 * @param {Object} header - The TemplateHeader value.
 */

export default class Template {
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
    } = {}) {
        this.id = id;
        this.creationDate = creationDate;
        this.description = description;
        this.title = title;
        this.type = type;
        this.version = version;
        this.authorEmail = authorEmail;
        this.authorDocId = authorDocId;
        this.isPublic = isPublic;

        this.test = [
            (this.testId = testId),
            (this.testStructure = testStructure),
            (this.testOptions = testOptions),
            (this.type = type),
            (this.answersSheet = answersSheet),
        ];
    }
    static toTemplate(data) {
        return new Template(data);
    }
    toFirestore() {
        return {
            creationDate: this.creationDate,
            description: this.description,
            title: this.title,
            version: this.version,
            authorEmail: this.authorEmail,
            authorDocId: this.authorDocId,
            isPublic: this.isPublic,
            test: {
                testId: this.testId,
                testStructure: this.testStructure,
                testOptions: this.testOptions,
                type: this.type,
                answersSheet: this.answersSheet,
            },
        };
    }
}
