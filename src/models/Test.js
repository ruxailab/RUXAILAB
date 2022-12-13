     /**
     * Create a Test.
     * @param {Object} testAdmin - The TestAdmin value.
     * @param {string} testDescription - The testDescription value.
     * @param {string} testTitle - The testTitle value.
     * @param {string} testType - The testType value.
     * @param {Object} testStructure - The TestStructure value.
     * @param {string} answersDocId - The answersDocId value.
     * @param {Object[]} cooperators - An array of Cooperators value.
     * @param {string} creationDate - The creationDate value.
     * @param {string} updateDate - The updateDate value.
     * @param {Object} templateDoc - The TestTemplateDoc value.
     */

export default class Test{
    constructor(testAdmin, testDescription, testTitle, testType, testStructure, answersDocId, cooperators, creationDate, updateDate, templateDoc){
        this.testAdmin = testAdmin;
        this.testDescription = testDescription;
        this.testTitle = testTitle;
        this.testType = testType;
        this.testStructure = testStructure;
        this.answersDocId = answersDocId;
        this.cooperators = cooperators;
        this.creationDate = creationDate;
        this.updateDate = updateDate;
        this.templateDoc = templateDoc;
    }
    static toTest(){
        return new Test()
    }
}