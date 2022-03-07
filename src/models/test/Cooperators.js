module.exports = class Cooperators {
    constructor({userDocId, userName, userEmail, accessLevel, invited, accepted, progress, answerStatus, updateDate} = {}){
        this.userDocId = userDocId
        this.userName = userName
        this.userEmail = userEmail
        this.accessLevel = accessLevel
        this.invited = invited
        this.accepted = accepted 
        this.progress = progress
        this.answerStatus = answerStatus 
        this.updateDate = updateDate
    }
}