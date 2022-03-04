module.exports = class User {
    constructor({ accessLevel, email, string, notification, myAnswers, myTemplates, myTests} = {}){
        this.accessLevel = accessLevel
        this.email = email
        this.string = string
        this.notification = notification
        this.myAnswers = myAnswers
        this.myTemplates = myTemplates
        this.myTests = myTests
    }
}