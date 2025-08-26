import { NasaTlxAnswer } from "./NasaTlxAnswer"

export default class UserTask {
  constructor({
    taskId,
    taskAnswer,
    taskObservations,
    taskTime,
    completed,
    audioRecordURL,
    screenRecordURL,
    webcamRecordURL,
    irisTrackingData,
    postAnswer,
    susAnswers,
    nasaTlxAnswers
  } = {}) {
    this.taskId = taskId ?? null
    this.taskAnswer = taskAnswer ?? ''
    this.taskObservations = taskObservations ?? ''
    this.taskTime = taskTime ?? null
    this.completed = completed ?? null
    this.audioRecordURL = audioRecordURL ?? null
    this.screenRecordURL = screenRecordURL ?? null
    this.webcamRecordURL = webcamRecordURL ?? null
    this.postAnswer = postAnswer ?? null
    this.irisTrackingData = irisTrackingData ?? []
    this.susAnswers = susAnswers ?? []
    this.nasaTlxAnswers = nasaTlxAnswers ?? new NasaTlxAnswer()
  }

  static toUserTask(data) {
    return new UserTask(data)
  }

  toFirestore() {
    return {
      taskId: this.taskId,
      taskAnswer: this.taskAnswer,
      taskObservations: this.taskObservations,
      taskTime: this.taskTime,
      completed: this.completed,
      audioRecordURL: this.audioRecordURL,
      screenRecordURL: this.screenRecordURL,
      webcamRecordURL: this.webcamRecordURL,
      postAnswer: this.postAnswer,
      irisTrackingData: this.irisTrackingData,
      susAnswers: this.susAnswers,
      nasaTlxAnswers: (this.nasaTlxAnswers instanceof NasaTlxAnswer ? this.nasaTlxAnswers : new NasaTlxAnswer(this.nasaTlxAnswers)).toFirestore()
    }
  }
}
