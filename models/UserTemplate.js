module.exports = class UserTemplate {
    constructor({templateDocId, templateTitle, templateType, templateVersion, creationDate, updateDate, templateDescription, isPublic} = {}){
        this.templateDocId = templateDocId
        this.templateTitle = templateTitle
        this.templateType = templateType
        this.templateVersion = templateVersion
        this.creationDate = creationDate
        this.updateDate = updateDate
        this.templateDescription = templateDescription
        this.isPublic = isPublic
    }
}