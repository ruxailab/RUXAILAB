import TaskAnswer from './TaskAnswer'

export default class UserStudyEvaluatorAnswer {
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
    total,
    submitted,
    userDocId,
    lastUpdate,
    invited,
    hidden
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
    this.total = total ?? 0
    this.submitted = submitted ?? false
    this.userDocId = userDocId ?? null
    this.lastUpdate = lastUpdate ?? null
    this.invited = invited ?? false
    this.hidden = hidden ?? false
  }
  static toModel(data) {
    return new UserStudyEvaluatorAnswer({
      ...data,
      tasks: Object.fromEntries(
        Object.entries(data.tasks).map(([key, value]) => [
          key,
          TaskAnswer.toModel(value),
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
          (value instanceof TaskAnswer ? value : new TaskAnswer(value)).toFirestore(),
        ]),
      ),
      progress: this.progress,
      total: this.total,
      submitted: this.submitted,
      userDocId: this.userDocId,
      lastUpdate: this.lastUpdate,
      invited: this.invited,
      hidden: this.hidden,
    }
  }
}
