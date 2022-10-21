     /**
     * Create a TemplateHeader.
     * @param {Object} templateAuthor - The TemplateAuthor value.
     * @param {string} creationDate - The creationDate value.
     * @param {string} updateDate - The updateDate value.
     * @param {string} templateDescription - The templateDescription value.
     * @param {boolean} isTemplatePublic - The isTemplatePublic value.
     * @param {string} templateTitle - The templateTitle value.
     * @param {string} templateVersion - The templateVersion value.
     * @param {string} templateType - The templateType value.
     */

export default class TemplateHeader{
    constructor(templateAuthor, creationDate, updateDate, templateDescription, isTemplatePublic, templateTitle, templateVersion, templateType){
        this.templateAuthor = templateAuthor;
        this.creationDate = creationDate;
        this.updateDate = updateDate;
        this.templateDescription = templateDescription;
        this.isTemplatePublic = isTemplatePublic;
        this.templateTitle = templateTitle;
        this.templateVersion = templateVersion;
        this.templateType = templateType;
    }
}