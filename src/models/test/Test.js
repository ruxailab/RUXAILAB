module.exports = class Test {
    constructor({testAdmin, testDescription, testTitle, testType, testStructure, answersDocId, cooperators, creationDate, updateDate, templateDoc} = {}){
        this.testAdmin = testAdmin
        this.testDescriptio = testDescription
        this.testTitle = testTitle
        this.testType = testType
        this.testStructure = testStructure
        this.answersDocId = answersDocId
        this.cooperators = cooperators
        this.creationDate = creationDate
        this.updateDate = updateDate
        this.templateDoc = templateDoc
    }
}