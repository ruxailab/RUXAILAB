module.exports = class TemplateHeader{
    constructor({templateAuthor, creationDate, updateDate, templateDescription, isTemplatePublic, templateTitle, templateVersion, templateType} = {}){
        this.templateAuthor = templateAuthor
        this.creationDate = creationDate
        this.updateDate = updateDate
        this.templateDescription = templateDescription
        this.isTemplatePublic = isTemplatePublic
        this.templateTitle = templateTitle
        this.templateVersion = templateVersion
        this.templateType = templateType
    }
}