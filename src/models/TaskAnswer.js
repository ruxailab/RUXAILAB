import UserTask from './UserTask'

export default class TaskAnswer {
  constructor({
    preTestAnswer,
    consent,
    postTestAnswer,
    preTestCompleted,
    consentCompleted,
    fullName,
    postTestCompleted,
    tasks,
    progress,
    cameraUrlModerator,
    cameraUrlEvaluator,
    audioUrlModerator,
    audioUrlEvaluator,
    total,
    submitted,
    userDocId,
    lastUpdate,
    invited,
  } = {}) {
    this.preTestAnswer = preTestAnswer ?? []
    this.consent = consent ?? ''
    this.postTestAnswer = postTestAnswer ?? []
    this.preTestCompleted = preTestCompleted ?? false
    this.consentCompleted = consentCompleted ?? false
    this.fullName = fullName ?? ''
    this.postTestCompleted = postTestCompleted ?? false
    this.tasks = tasks ?? {}
    this.progress = progress ?? null
    this.cameraUrlModerator = cameraUrlModerator ?? ''
    this.audioUrlModerator = audioUrlModerator ?? ''
    this.cameraUrlEvaluator = cameraUrlEvaluator ?? ''
    this.audioUrlEvaluator = audioUrlEvaluator ?? ''
    this.total = total ?? 0
    this.submitted = submitted ?? false
    this.userDocId = userDocId ?? null
    this.lastUpdate = lastUpdate ?? null
    this.invited = invited ?? false
  }
  static toTaskAnswer(data) {
    return new TaskAnswer({
      ...data,
      tasks: Object.fromEntries(
        Object.entries(data.tasks).map(([key, value]) => [
          key,
          UserTask.toUserTask(value),
        ]),
      ),
    })
  }
  toFirestore() {
    return {
      preTestAnswer: this.preTestAnswer,
      consent: this.consent,
      postTestAnswer: this.postTestAnswer,
      preTestCompleted: this.preTestCompleted,
      consentCompleted: this.consentCompleted,
      fullName: this.fullName,
      postTestCompleted: this.postTestCompleted,
      tasks: Object.fromEntries(
        Object.entries(this.tasks).map(([key, value]) => [
          key,
          value.toFirestore(),
        ]),
      ),
      progress: this.progress,
      cameraUrlEvaluator: this.cameraUrlEvaluator,
      cameraUrlModerator: this.cameraUrlModerator,
      audioUrlEvaluator: this.audioUrlEvaluator,
      audioUrlModerator: this.audioUrlModerator,
      total: this.total,
      submitted: this.submitted,
      userDocId: this.userDocId,
      lastUpdate: this.lastUpdate,
      invited: this.invited,
    }
  }
}
