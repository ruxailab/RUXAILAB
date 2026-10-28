import { NasaTlxAnswer } from '@/ux/UserTest/models/NasaTlxAnswer'
import { TamAnswer } from '@/ux/UserTest/models/TamAnswer'
import SartAnswer from '@/ux/UserTest/models/SartAnswer'

export default class TaskAnswer {
  constructor({
    taskId,
    taskAnswer,
    taskObservations,
    taskTime,
    completed,
    attempted,
    tipPressCount,
    audioRecordURL,
    moderatorAudioURL,
    screenRecordURL,
    webcamRecordURL,
    irisTrackingData,
    postAnswer,
    susAnswers,
    nasaTlxAnswers,
    tamAnswers,
    sartAnswers,
    sentimentDocId,
    screenSize,
    audioSize,
    webcamSize,
    markers,
    segments,
    startedAt,
    endedAt,
    participationMode,
  } = {}) {
    this.taskId = taskId ?? null
    this.taskAnswer = taskAnswer ?? ''
    this.taskObservations = taskObservations ?? ''
    this.taskTime = taskTime ?? null
    this.completed = completed ?? null
    this.attempted = attempted ?? false
    this.tipPressCount = Number.isFinite(tipPressCount) ? tipPressCount : 0
    this.audioRecordURL = audioRecordURL ?? null
    this.moderatorAudioURL = moderatorAudioURL ?? null
    this.screenRecordURL = screenRecordURL ?? null
    this.webcamRecordURL = webcamRecordURL ?? null
    this.postAnswer = postAnswer ?? null
    this.irisTrackingData = irisTrackingData ?? []
    this.susAnswers = susAnswers ?? []
    this.nasaTlxAnswers = nasaTlxAnswers ?? null
    this.tamAnswers = tamAnswers ?? null

    if (sartAnswers) {
      this.sartAnswers =
        sartAnswers instanceof SartAnswer
          ? sartAnswers
          : new SartAnswer(sartAnswers)
    } else {
      this.sartAnswers = new SartAnswer()
    }
    this.sentimentDocId = sentimentDocId ?? null
    this.screenSize = screenSize ?? null
    this.audioSize = audioSize ?? null
    this.webcamSize = webcamSize ?? null
    this.markers = markers ?? []
    this.segments = segments ?? []
    // Server epoch milliseconds. Absent on desktop-only attempts.
    this.startedAt = startedAt ?? null
    this.endedAt = endedAt ?? null
    // "mobile-task-instructions" when the server accepted the outcome.
    this.participationMode = participationMode ?? null
  }

  static toModel(data) {
    return new TaskAnswer(data)
  }

  toFirestore() {
    let nasaTlxData = null
    if (this.nasaTlxAnswers) {
      nasaTlxData =
        this.nasaTlxAnswers instanceof NasaTlxAnswer
          ? this.nasaTlxAnswers.toFirestore()
          : new NasaTlxAnswer(this.nasaTlxAnswers).toFirestore()
    }

    let tamData = null
    if (this.tamAnswers) {
      tamData =
        this.tamAnswers instanceof TamAnswer
          ? this.tamAnswers.toFirestore()
          : new TamAnswer(this.tamAnswers).toFirestore()
    }

    const payload = {
      taskId: this.taskId,
      taskAnswer: this.taskAnswer,
      taskObservations: this.taskObservations,
      taskTime: this.taskTime,
      completed: this.completed,
      attempted: this.attempted,
      tipPressCount: this.tipPressCount,
      audioRecordURL: this.audioRecordURL,
      moderatorAudioURL: this.moderatorAudioURL,
      screenRecordURL: this.screenRecordURL,
      webcamRecordURL: this.webcamRecordURL,
      postAnswer: this.postAnswer,
      irisTrackingData: this.irisTrackingData,
      susAnswers: this.susAnswers,
      nasaTlxAnswers: nasaTlxData,
      tamAnswers: tamData,
      sartAnswers:
        this.sartAnswers instanceof SartAnswer
          ? this.sartAnswers.toFirestore()
          : this.sartAnswers,
      sentimentDocId: this.sentimentDocId,
      screenSize: this.screenSize,
      audioSize: this.audioSize,
      webcamSize: this.webcamSize,
      markers: this.markers,
      segments: this.segments,
    }

    // Omit when unset so a desktop-only save does not write nulls, and does
    // not add the fields when mobile task instructions are off.
    if (this.startedAt != null) payload.startedAt = this.startedAt
    if (this.endedAt != null) payload.endedAt = this.endedAt
    if (this.participationMode != null) {
      payload.participationMode = this.participationMode
    }
    return payload
  }
}
