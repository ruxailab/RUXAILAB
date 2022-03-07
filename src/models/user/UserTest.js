module.exports = class UserTest {
    constructor({testDocId, testTitle, testType, creationDate,updateDate, numberColaborators, existReport,isComplete, testProgress, creationDate, updateDate, templateDoc} = {}){
        this.testDocId = testDocId
        this.testTitle = testTitle
        this.testType = testType
        this.creationDate = creationDate
        this.updateDate = updateDate
        this.numberColaborators = numberColaborators 
        this.existReport = existReport
        this.isComplete = isComplete
        this.testProgress = testProgress
        this.templateDoc = templateDoc
    }
}