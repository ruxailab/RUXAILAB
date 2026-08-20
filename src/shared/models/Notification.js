/**
 * Create a Notification.
 */

export default class Notification {
  constructor({
    title,
    description,
    redirectsTo,
    author,
    read,
    testId,
    accessLevel,
    readAt,
    type,
    inviteToken,
  } = {}) {
    this.title = title ?? null
    this.description = description ?? null
    this.redirectsTo = redirectsTo ?? null
    this.createdDate = Date.now()
    this.author = author ?? null
    this.read = read ?? false
    this.testId = testId
    this.accessLevel = accessLevel ?? null
    this.readAt = readAt ?? null
    this.type = type ?? null
    this.inviteToken = inviteToken ?? null
  }

  static toNotification(data) {
    return new Notification(data)
  }

  toFirestore() {
    return {
      title: this.title,
      description: this.description,
      redirectsTo: this.redirectsTo,
      createdDate: this.createdDate,
      author: this.author,
      read: this.read,
      testId: this.testId,
      accessLevel: this.accessLevel,
      readAt: this.readAt,
      type: this.type,
      inviteToken: this.inviteToken,
    }
  }
}
