    /**
     * Create a UserAnswer.
     * @param {string} answerDocId - The answerDocId value.
     * @param {number} accessLevel - The accessLevel value.
     * @param {number} progress - The progress value.
     * @param {number} total - The total value.
     * @param {string} testType - The testType value.
     * @param {string} testTitle - The testTitle value.
     * @param {string} testDocId - The testDocId value.
     * @param {string} updateDate - The updateDate value.
     * @param {string} testAuthorName - The testAuthorName value.
    */

export default class UserAnswer{
    constructor(answerDocId, accessLevel, progress, total, testType, testTitle, testDocId, updateDate, testAuthorName){
        this.answerDocId = answerDocId;
        this.accessLevel = accessLevel;
        this.progress = progress;
        this.total = total;
        this.testType = testType;
        this.testTitle = testTitle;
        this.testDocId = testDocId;
        this.updateDate = updateDate;
        this.testAuthorName = testAuthorName;
    }
    static toUserAnswer(){
        return new UserAnswer()
    }
}