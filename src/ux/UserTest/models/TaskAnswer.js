import { NasaTlxAnswer } from "@/ux/UserTest/models/NasaTlxAnswer"
import SartAnswer from "@/ux/UserTest/models/SartAnswer"

export default class TaskAnswer {
  constructor({
    taskId,
    taskAnswer,
    taskObservations,
    taskTime,
    completed,
    attempted,
    audioRecordURL,
    moderatorAudioURL,
    screenRecordURL,
    webcamRecordURL,
    irisTrackingData,
    postAnswer,
    susAnswers,
    nasaTlxAnswers,
    sartAnswers,
    facialSentimentResults,
  } = {}) {
    this.taskId = taskId ?? null
    this.taskAnswer = taskAnswer ?? ''
    this.taskObservations = taskObservations ?? ''
    this.taskTime = taskTime ?? null
    this.completed = completed ?? null
    this.attempted = attempted ?? false
    this.audioRecordURL = audioRecordURL ?? null
    this.moderatorAudioURL = moderatorAudioURL ?? null
    this.screenRecordURL = screenRecordURL ?? null
    this.webcamRecordURL = webcamRecordURL ?? null
    this.postAnswer = postAnswer ?? null
    this.irisTrackingData = irisTrackingData ?? []
    this.susAnswers = susAnswers ?? []
    this.nasaTlxAnswers = nasaTlxAnswers ?? null
    
    if (sartAnswers) {
      this.sartAnswers = sartAnswers instanceof SartAnswer 
        ? sartAnswers 
        : new SartAnswer(sartAnswers)
    } else {
      this.sartAnswers = new SartAnswer()
    }
    this.facialSentimentResults = facialSentimentResults ?? null
  }

  static toModel(data) {
    return new TaskAnswer(data)
  }

  toFirestore() {
    return {
      taskId: this.taskId,
      taskAnswer: this.taskAnswer,
      taskObservations: this.taskObservations,
      taskTime: this.taskTime,
      completed: this.completed,
      attempted: this.attempted,
      audioRecordURL: this.audioRecordURL,
      moderatorAudioURL: this.moderatorAudioURL,
      screenRecordURL: this.screenRecordURL,
      webcamRecordURL: this.webcamRecordURL,
      postAnswer: this.postAnswer,
      irisTrackingData: this.irisTrackingData,
      susAnswers: this.susAnswers,
      sartAnswers: this.sartAnswers instanceof SartAnswer ? this.sartAnswers.toFirestore() : this.sartAnswers,
      nasaTlxAnswers:
        this.nasaTlxAnswers != null
          ? (this.nasaTlxAnswers instanceof NasaTlxAnswer
              ? this.nasaTlxAnswers
              : new NasaTlxAnswer(this.nasaTlxAnswers)
            ).toFirestore()
          : null,
      facialSentimentResults: this.facialSentimentResults,
    }
  }
}
