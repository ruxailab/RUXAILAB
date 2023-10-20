/**
 * Create a TaskAnswer.
 * @param {string} taskId - The taskId value.
 * @param {string} taskAnswer - The taskAnswer value.
 * @param {string} taskObservations - The taskObservations value.
 * @param {string} taskTime - The taskTime value.
 * @param {string} post_testSheetURL - The post_testSheetURL value.
 * @param {string} pre_testSheetURL - The pre_testSheetURL value.
 * @param {string} audioRecordURL - The audioRecordURL value.
 * @param {string} screenRecordURL - The screenRecordURL value.
 * @param {string} webcamRecordURL - The webcamRecordURL value.
 * @param {number} total - The total value.
 * @param {boolean} submitted - The submitted value.
 * @param {string} userDocId - The userDocId value.
 */

export default class TaskAnswer {
  constructor({
    taskId,
    taskAnswer,
    taskObservations,
    taskTime,
    audioRecordURL,
    screenRecordURL,
    webcamRecordURL,
    submitted,
  } = {}) {
    this.taskId = taskId ?? null
    this.taskAnswer = taskAnswer ?? null
    this.taskObservations = taskObservations ?? null
    this.taskTime = taskTime ?? null
    this.audioRecordURL = audioRecordURL ?? null
    this.screenRecordURL = screenRecordURL ?? null
    this.webcamRecordURL = webcamRecordURL ?? null
  }
  static toTaskAnswer(data) {
    return new TaskAnswer(data)
  }
  toFirestore() {
    return {
      toFirestore() {
        return {
          taskId: this.taskId,
          taskAnswer: this.taskAnswer,
          taskObservations: this.taskObservations,
          taskTime: this.taskTime,
          audioRecordURL: this.audioRecordURL,
          screenRecordURL: this.screenRecordURL,
          webcamRecordURL: this.webcamRecordURL,
          submitted: this.submitted,
          userDocId: this.userDocId,
        }
      },
    }
  }
}
