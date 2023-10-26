import UserTask from "./UserTask"

export default class TaskAnswer {
  constructor({
    preTestUrl,
    consentUrl,
    postTestUrl,
    tasks,
    progress,
    total,
    submitted,
    userDocId,
    lastUpdate,
  } = {}) {
    this.preTestUrl = preTestUrl ?? ''
    this.consentUrl = consentUrl ?? ''
    this.postTestUrl = postTestUrl ?? ''
    this.tasks = tasks ?? {}
    this.progress = progress ?? null
    this.total = total ?? 0
    this.submitted = submitted ?? null
    this.userDocId = userDocId ?? ''
    this.lastUpdate = lastUpdate ?? null
  }
  static toTaskAnswer(data) {
    return new TaskAnswer({...data, tasks: Object.fromEntries(Object.entries(data.tasks).map(([key, value]) => [key, UserTask.toUserTask(value)])),})
  }
  toFirestore() {
    return {
      preTestUrl: this.preTestUrl,
      consentUrl: this.consentUrl,
      postTestUrl: this.postTestUrl,
      tasks: Object.fromEntries(Object.entries(this.tasks).map(([key, value]) => [key, value.toFirestore()])),
      progress: this.progress,
      total: this.total,
      submitted: this.submitted,
      userDocId: this.userDocId,
      lastUpdate: this.lastUpdate,
    }
  }
}
