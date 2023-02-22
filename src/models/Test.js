/**
 * Create a Test.
 * @param {Object} testAdmin - The TestAdmin value.
 * @param {string} testDescription - The testDescription value.
 * @param {string} testTitle - The testTitle value.
 * @param {string} testType - The testType value.
 * @param {Object} testStructure - The TestStructure value.  ---->
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
        testOptions,
        answersDocId,
        cooperators,
        creationDate,
        updateDate,
        templateDoc,
        numberColaborators,
        isPublic,
    } = {}) {
        this.id = id ?? null;
        this.testAdmin = testAdmin ?? null;
        this.testDescription = testDescription ?? null;
        this.testTitle = testTitle ?? null;
        this.testType = testType ?? null;
        this.testStructure = testStructure ?? [];
        this.testOptions = testOptions ?? [];
        this.answersDocId = answersDocId ?? null;
        this.cooperators = cooperators ?? null;
        this.creationDate = creationDate ?? null;
        this.updateDate = updateDate ?? null;
        this.templateDoc = templateDoc ?? null;
        this.numberColaborators = numberColaborators ?? 0;
        this.isPublic = isPublic ?? false
    }
    static toTest(data) {
        return new Test(data);
    }
    toFirestore() {
        return {
            testTitle: this.testTitle,
            testDescription: this.testDescription,
            testAdmin: this.testAdmin.toFirestore(),
            testType: this.testType,
            testStructure: this.testStructure,
            testOptions: this.testOptions,
            answersDocId: this.answersDocId,
            cooperators: this.cooperators,
            creationDate: this.creationDate,
            updateDate: this.updateDate,
            templateDoc: this.templateDoc,
            numberColaborators: this.numberColaborators,
            isPublic: this.isPublic
        };
    }
}
