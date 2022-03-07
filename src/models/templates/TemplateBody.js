module.exports = class TemplateBody {
    constructor({testDescription, testTitle, testType, testStructure} = {}){
        this.testDescription = testDescription
        this.testTitle = testTitle
        this.testType = testType
        this.testStructure = testStructure
    }
}