/**
 * Create a UserTask.
 * @param {Number} taskId - The taskId value.
 * @param {string} taskAnswer - The taskAnswer value.
 * @param {string} taskObservations - The taskObservations value.
 * @param {Number} taskTime - The taskTime value.
 * @param {string} audioRecordURL - The audioRecordURL value.
 * @param {string} screenRecordURL - The screenRecordURL value.
 * @param {string} webcamRecordURL - The webcamRecordURL value.
 */

export default class UserTask {
  constructor({
    taskId,
    taskAnswer,
    taskObservations,
    taskTime,
    audioRecordURL,
    screenRecordURL,
    webcamRecordURL,
  } = {}) {
    this.taskId = taskId ?? null
    this.taskAnswer = taskAnswer ?? ''
    this.taskObservations = taskObservations ?? ''
    this.taskTime = taskTime ?? null
    this.audioRecordURL = audioRecordURL ?? null
    this.screenRecordURL = screenRecordURL ?? null
    this.webcamRecordURL = webcamRecordURL ?? null
  }
  static toUserTask(data) {
    return new UserTask(data)
  }
}
