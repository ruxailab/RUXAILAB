/**
 * Create a UserAnswer.
 * @param {string} answersDocId - The answersDocId value.
 * @param {number} accessLevel - The accessLevel value.
 * @param {number} progress - The progress value.
 * @param {number} total - The total value.
 * @param {string} testType - The testType value.
 * @param {string} testTitle - The testTitle value.
 * @param {string} testDocId - The testDocId value.
 * @param {string} updateDate - The updateDate value.
 * @param {string} testAuthorEmail - The testAuthorEmail value.
 */

export default class UserAnswer {
  constructor({
    answersDocId,
    accessLevel,
    progress,
    total,
    testType,
    subType,
    testTitle,
    testDocId,
    updateDate,
    testAuthorEmail,
  }) {
    this.answersDocId = answersDocId
    this.accessLevel = accessLevel
    this.progress = progress
    this.total = total
    this.testType = testType
    this.subType = subType
    this.testTitle = testTitle
    this.testDocId = testDocId
    this.updateDate = updateDate
    this.testAuthorEmail = testAuthorEmail
  }
  static toUserAnswer(data) {
    return new UserAnswer(data)
  }

  toFirestore() {
    return {
      answersDocId: this.answersDocId,
      accessLevel: this.accessLevel,
      progress: this.progress,
      total: this.total,
      testType: this.testType,
      subType: this.subType,
      testTitle: this.testTitle,
      testDocId: this.testDocId,
      updateDate: this.updateDate,
      testAuthorEmail: this.testAuthorEmail,
    }
  }
}
