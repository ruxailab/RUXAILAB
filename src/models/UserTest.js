     /**
     * Create a UserTest.
     * @param {string} testDocId - The testDocId value.
     * @param {string} testTitle - The testTitle value.
     * @param {string} testType - The testType value.
     * @param {string} creationDate - The creationDate value.
     * @param {string} updateDate - The updateDate value.
     * @param {number} numberColaborators - The numberColaborators value.
     * @param {boolean} existReport - The existReport value.
     * @param {boolean} isComplete - The isComplete value.
     * @param {number} testProgress - The testProgress value.
     */

export default class UserTest{
    constructor({
        testDocId, testTitle, testType, creationDate, updateDate, numberColaborators, existReport, isComplete, testProgress
    } = {}
    ) {
        this.testDocId = testDocId;
        this.testTitle = testTitle;
        this.testType = testType;
        this.creationDate = creationDate;
        this.updateDate = updateDate;
        this.numberColaborators = numberColaborators;
        this.existReport = existReport;
        this.isComplete = isComplete;
        this.testProgress = testProgress;
    }
    static toUserTest(data) {
        return new UserTest(data)
    }
}