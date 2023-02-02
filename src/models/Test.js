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

export default class Test {
    constructor({
        id,
        testAdmin,
        testDescription,
        testTitle,
        testType,
        testStructure,
        answersDocId,
        cooperators,
        creationDate,
        updateDate,
        templateDoc,
    } = {}) {
        this.id = id ?? null;
        this.testAdmin = testAdmin ?? null;
        this.testDescription = testDescription ?? null;
        this.testTitle = testTitle ?? null;
        this.testType = testType ?? null;
        this.testStructure = testStructure ?? null;
        this.answersDocId = answersDocId ?? null;
        this.cooperators = cooperators ?? null;
        this.creationDate = creationDate ?? null;
        this.updateDate = updateDate ?? null;
        this.templateDoc = templateDoc ?? null;
    }
    static toTest(data) {
        console.log(data);
        return new Test(data);
    }
    toFirestore() {
        return {
            testTitle: this.testTitle,
            testDescription: this.testDescription,
            testAdmin: this.testAdmin,
            testType: this.testType,
            testStructure: this.testStructure,
            answersDocId: this.answersDocId,
            cooperators: this.cooperators,
            creationDate: this.creationDate,
            updateDate: this.updateDate,
            templateDoc: this.templateDoc,
        };
    }
}
