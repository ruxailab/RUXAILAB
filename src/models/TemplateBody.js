     /**
     * Create a TemplateBody.
     * @param {string} testDescription - The testDescription value.
     * @param {string} testTitle - The testTitle value.
     * @param {string} testType - The testType value.
     * @param {Object} testStructure - The TestStructure value.
     */

export default class TemplateBody{
    constructor(testDescription, testTitle, testType, testStructure){
        this.testDescription = testDescription;
        this.testTitle = testTitle;
        this.testType = testType;
        this.testStructure = testStructure;
    }
}