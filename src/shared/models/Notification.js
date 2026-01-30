/**
 * Create a Notification.
 * @param {string} title - The title value.
 * @param {string} titleTemplate - The i18n key for the title template.
 * @param {object} titleParams - The i18n params for the title.
 * @param {string} description - The description value.
 * @param {string} descriptionTemplate - The i18n key for the description template.
 * @param {object} descriptionParams - The i18n params for the description.
 */

export default class Notification {
  constructor({
    title,
    titleTemplate,
    titleParams,
    description,
    descriptionTemplate,
    descriptionParams,
    redirectsTo,
    author,
    read,
    testId,
    accessLevel,
    readAt,
    type,
  } = {}) {
    this.title = title ?? null;
    this.titleTemplate = titleTemplate ?? null;
    this.titleParams = titleParams ?? null;
    this.description = description ?? null;
    this.descriptionTemplate = descriptionTemplate ?? null;
    this.descriptionParams = descriptionParams ?? null;
    this.redirectsTo = redirectsTo;
    this.createdDate = Date.now();
    this.author = author;
    this.read = read;
    this.testId = testId;
    this.accessLevel = accessLevel ?? null;
    this.readAt = readAt ?? null;
    this.type = type ?? null;
  }

  static toNotification(data) {
    return new Notification(data)
  }

  toFirestore() {
    return {
      title: this.title,
      titleTemplate: this.titleTemplate,
      titleParams: this.titleParams,
      description: this.description,
      descriptionTemplate: this.descriptionTemplate,
      descriptionParams: this.descriptionParams,
      redirectsTo: this.redirectsTo,
      createdDate: this.createdDate,
      author: this.author,
      read: this.read,
      testId: this.testId,
      accessLevel: this.accessLevel,
      readAt: this.readAt,
      type: this.type,
    }
  }
}
