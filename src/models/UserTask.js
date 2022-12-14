     /**
     * Create a UserTask.
     * @param {string} taskName - The taskName value.
     * @param {string} taskType - The taskType value.
     * @param {string} taskDescription - The taskDescription value.
     * @param {string} taskTip - The taskTip value.
     * @param {boolean} hasTimer - The hasTimer value.
     * @param {boolean} hasPost - The hasPost value.
     * @param {boolean} hasEye - The hasEye value.
     * @param {boolean} hasAudioRecord - The hasAudioRecord value.
     * @param {boolean} hasScreenRecord - The hasScreenRecord value.
     * @param {boolean} hasCamRecord - The hasCamRecord value.
     */

export default class UserTask{
    constructor({
        taskName, taskType, taskDescription, taskTip, hasTimer, hasPost, hasEye, hasAudioRecord, hasScreenRecord, hasCamRecord
    } = {}
    ) {
        this.taskName = taskName;
        this.taskType = taskType;
        this.taskDescription = taskDescription;
        this.taskTip = taskTip;
        this.hasTimer = hasTimer;
        this.hasPost = hasPost;
        this.hasEye = hasEye;
        this.hasAudioRecord = hasAudioRecord;
        this.hasScreenRecord = hasScreenRecord;
        this.hasCamRecord = hasCamRecord;
    }
    static toUserTask(data) {
        return new UserTask(data)
    }
}