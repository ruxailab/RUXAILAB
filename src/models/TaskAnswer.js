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
     * @param {number} progress - The progress value.
     * @param {number} total - The total value.
     * @param {boolean} submitted - The submitted value.
     * @param {string} userDocId - The userDocId value.
     */

export default class TaskAnswer{
    constructor({
        taskId, taskAnswer, taskObservations, taskTime, post_testSheetURL, pre_testSheetURL,audioRecordURL, screenRecordURL, webcamRecordURL, progress, total, submitted, userDocId
    } = {}
    ) {
        this.taskId = taskId
        this.taskAnswer = taskAnswer
        this.taskObservations = taskObservations
        this.taskTime = taskTime
        this.post_testSheetURL = post_testSheetURL
        this.pre_testSheetURL = pre_testSheetURL
        this.audioRecordURL = audioRecordURL
        this.screenRecordURL = screenRecordURL
        this.webcamRecordURL = webcamRecordURL
        this.progress = progress
        this.total = total
        this.submitted = submitted
        this.userDocId = userDocId
    }
    static toTaskAnswer(data) {
        return new TaskAnswer(data)
    }
}
