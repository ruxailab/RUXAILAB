module.exports = class UserAnswer {
    constructor({answerDocId, accessLevel, progress, total, testType} = {}){
        this.answerDocId = answerDocId
        this.accessLevel = accessLevel
        this.progress = progress
        this.total = total
        this.testType = testType

    }
}