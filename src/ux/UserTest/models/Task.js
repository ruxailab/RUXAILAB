export default class Task {
  constructor({
    taskName = null,
    taskDescription = null,
    taskTip = null,
    taskLink = null,
    postQuestion = null,
    postForm = null,
    taskType = null,
    hasAudioRecord = false,
    hasScreenRecord = false,
    hasCamRecord = false,
    hasEye = false,
    estimatedTime = null,
  } = {}) {
    this.taskName = taskName;
    this.taskDescription = taskDescription;
    this.taskTip = taskTip;
    this.taskLink = taskLink;
    this.postQuestion = postQuestion;
    this.postForm = postForm;
    this.taskType = taskType;
    this.hasAudioRecord = hasAudioRecord;
    this.hasScreenRecord = hasScreenRecord;
    this.hasCamRecord = hasCamRecord;
    this.hasEye = hasEye;
    this.estimatedTime = estimatedTime;
  }

  static fromJson(json) {
    return new Task({
      taskName: json.taskName,
      taskDescription: json.taskDescription,
      taskTip: json.taskTip,
      taskLink: json.taskLink,
      postQuestion: json.postQuestion,
      postForm: json.postForm,
      taskType: json.taskType,
      hasAudioRecord: json.hasAudioRecord,
      hasScreenRecord: json.hasScreenRecord,
      hasCamRecord: json.hasCamRecord,
      hasEye: json.hasEye,
      estimatedTime: json.estimatedTime,
    });
  }

  toFirestore() {
    const json = {}
    if (this.taskName !== null) json.taskName = this.taskName;
    if (this.taskDescription !== null) json.taskDescription = this.taskDescription;
    if (this.taskTip !== null) json.taskTip = this.taskTip;
    if (this.taskLink !== null) json.taskLink = this.taskLink;
    if (this.postQuestion !== null) json.postQuestion = this.postQuestion;
    if (this.postForm !== null) json.postForm = this.postForm;
    if (this.taskType !== null) json.taskType = this.taskType;
    if (this.hasAudioRecord !== null) json.hasAudioRecord = this.hasAudioRecord;
    if (this.hasScreenRecord !== null) json.hasScreenRecord = this.hasScreenRecord;
    if (this.hasCamRecord !== null) json.hasCamRecord = this.hasCamRecord;
    if (this.hasEye !== null) json.hasEye = this.hasEye;
    if (this.estimatedTime !== null) json.estimatedTime = this.estimatedTime;
    return json;
  }
}
