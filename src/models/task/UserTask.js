module.exports = class UserTask {
    constructor({taskName, taskType, taskDescription, taskTip, hasTimer, hasPost, hasEye, hasAudioRecord, hasScreenRecord, hasCamRecord} = {}){
        this.taskName = taskName
        this.taskType = taskType
        this.taskDescription = taskDescription
        this.taskTip = taskTip
        this.hasTimer = hasTimer
        this.hasPost = hasPost
        this.hasEye = hasEye
        this.hasAudioRecord = hasAudioRecord
        this.hasScreenRecord = hasScreenRecord
        this.hasCamRecord = hasCamRecord 
    }
}