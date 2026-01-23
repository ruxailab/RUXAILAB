/**
 * Create a Notification.
 * @param {string} title - The title value (fallback for old notifications).
 * @param {string} titleKey - The i18n key for the title.
 * @param {object} titleParams - The i18n params for the title.
 * @param {string} description - The description value (fallback for old notifications).
 * @param {string} descriptionKey - The i18n key for the description.
 * @param {object} descriptionParams - The i18n params for the description.
 */

export default class Notification {
  constructor({
    title,
    titleKey,
    titleParams,
    description,
    descriptionKey,
    descriptionParams,
    redirectsTo,
    author,
    read,
    testId,
    accessLevel,
    readAt,
    type,
  } = {}) {
    this.title = title;
    this.titleKey = titleKey ?? null;
    this.titleParams = titleParams ?? null;
    this.description = description;
    this.descriptionKey = descriptionKey ?? null;
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
    return new Notification(data);
  }

  toFirestore() {
    return {
      title: this.title,
      titleKey: this.titleKey,
      titleParams: this.titleParams,
      description: this.description,
      descriptionKey: this.descriptionKey,
      descriptionParams: this.descriptionParams,
      redirectsTo: this.redirectsTo,
      createdDate: this.createdDate,
      author: this.author,
      read: this.read,
      testId: this.testId,
      accessLevel: this.accessLevel,
      readAt: this.readAt,
      type: this.type,
    };
  }
}