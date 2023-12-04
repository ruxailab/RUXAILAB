import UserTask from './UserTask'

export default class TaskAnswer {
  constructor({
    preTestAnswer,
    consentUrl,
    postTestUrl,
    preTestCompleted,
    consentCompleted,
    postTestCompleted,
    tasks,
    progress,
    total,
    submitted,
    userDocId,
    lastUpdate,
  } = {}) {
    this.preTestAnswer = preTestAnswer ?? []
    this.consentUrl = consentUrl ?? ''
    this.postTestUrl = postTestUrl ?? ''
    this.preTestCompleted = preTestCompleted ?? false
    this.consentCompleted = consentCompleted ?? false
    this.postTestCompleted = postTestCompleted ?? false
    this.tasks = tasks ?? {}
    this.progress = progress ?? null
    this.total = total ?? 0
    this.submitted = submitted ?? null
    this.userDocId = userDocId ?? ''
    this.lastUpdate = lastUpdate ?? null
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
      consentUrl: this.consentUrl,
      postTestUrl: this.postTestUrl,
      preTestCompleted: this.preTestCompleted,
      consentCompleted: this.consentCompleted,
      postTestCompleted: this.postTestCompleted,
      tasks: Object.fromEntries(
        Object.entries(this.tasks).map(([key, value]) => [
          key,
          value.toFirestore(),
        ]),
      ),
      progress: this.progress,
      total: this.total,
      submitted: this.submitted,
      userDocId: this.userDocId,
      lastUpdate: this.lastUpdate,
    }
  }
}
