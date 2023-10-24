/**
 * Create a TaskAnswer.
 * @param {string} taskId - The taskId value.
 * @param {string} taskAnswer - The taskAnswer value.
 * @param {string} taskObservations - The taskObservations value.
 * @param {string} taskTime - The taskTime value.
 * @param {string} postTestUrl - The post_testSheetURL value.
 * @param {string} preTestUrl- The pre_testSheetURL value.
 * @param {string} audioRecordURL - The audioRecordURL value.
 * @param {string} screenRecordURL - The screenRecordURL value.
 * @param {string} webcamRecordURL - The webcamRecordURL value.
 * @param {number} total - The total value.
 * @param {boolean} submitted - The submitted value.
 * @param {string} userDocId - The userDocId value.
 */

export default class TaskAnswer {
  constructor({
    preTestUrl,
    consentUrl,
    postTestUrl,
    tasks,
    progress,
    total,
    submitted,
    userDocId,
    lastUpdate,
  } = {}) {
    this.preTestUrl = preTestUrl ?? ''
    this.consentUrl = consentUrl ?? ''
    this.postTestUrl = postTestUrl ?? ''
    this.tasks = tasks ?? {}
    this.progress = progress ?? null
    this.total = total ?? 0
    this.submitted = submitted ?? null
    this.userDocId = userDocId ?? ''
    this.lastUpdate = lastUpdate ?? null
  }
  static toTaskAnswer(data) {
    return new TaskAnswer(data)
  }
  toFirestore() {
    return {
      preTestUrl: this.preTestUrl,
      consentUrl: this.consentUrl,
      postTestUrl: this.postTestUrl,
      tasks: this.tasks,
      progress: this.progress,
      total: this.total,
      submitted: this.submitted,
      userDocId: this.userDocId,
      lastUpdate: this.lastUpdate,
    }
  }
}
