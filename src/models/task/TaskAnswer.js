module.exports = class TaskAnswer {
    constructor({
        taskId, 
        taskAnswer, 
        taskObservations, 
        taskTime, 
        post_testSheetURL,
        pre_testSheetURL,
        audioRecordURL,
        screenRecordURL, 
        webcamRecordURL,
        progress,
        total,
        submitted,
        userDocId
    } = {}){
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
}