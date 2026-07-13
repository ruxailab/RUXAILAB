/**
 * Represents a single participant's answer for a Card Sorting study.
 *
 * The `sorting` field maps each category title to the list of card titles the
 * participant placed inside it. The special `__unassigned` key holds cards that
 * were never allocated to any category.
 */
export default class CardSortingEvaluatorAnswer {
  constructor({
    userDocId,
    fullName,
    consent,
    consentCompleted,
    preTestAnswer,
    preTestCompleted,
    sorting,
    postTestAnswer,
    postTestCompleted,
    submitted,
    progress,
    total,
    lastUpdate,
    invited,
    hidden,
    audioRecordURL,
    screenRecordURL,
    webcamRecordURL,
    screenSize,
    audioSize,
    webcamSize,
  } = {}) {
    this.userDocId = userDocId ?? null
    this.fullName = fullName ?? ''
    this.consent = consent ?? ''
    this.consentCompleted = consentCompleted ?? false
    this.preTestAnswer = preTestAnswer ?? []
    this.preTestCompleted = preTestCompleted ?? false
    this.sorting = sorting ?? {}
    this.postTestAnswer = postTestAnswer ?? []
    this.postTestCompleted = postTestCompleted ?? false
    this.submitted = submitted ?? false
    this.progress = progress ?? 0
    this.total = total ?? 0
    this.lastUpdate = lastUpdate ?? null
    this.invited = invited ?? false
    this.hidden = hidden ?? false
    this.audioRecordURL = audioRecordURL ?? null
    this.screenRecordURL = screenRecordURL ?? null
    this.webcamRecordURL = webcamRecordURL ?? null
    this.screenSize = screenSize ?? null
    this.audioSize = audioSize ?? null
    this.webcamSize = webcamSize ?? null
  }

  static toModel(data) {
    return new CardSortingEvaluatorAnswer({ ...data })
  }

  toFirestore() {
    return {
      userDocId: this.userDocId,
      fullName: this.fullName,
      consent: this.consent,
      consentCompleted: this.consentCompleted,
      preTestAnswer: this.preTestAnswer,
      preTestCompleted: this.preTestCompleted,
      sorting: this.sorting,
      postTestAnswer: this.postTestAnswer,
      postTestCompleted: this.postTestCompleted,
      submitted: this.submitted,
      progress: this.progress,
      total: this.total,
      lastUpdate: this.lastUpdate,
      invited: this.invited,
      hidden: this.hidden,
      audioRecordURL: this.audioRecordURL,
      screenRecordURL: this.screenRecordURL,
      webcamRecordURL: this.webcamRecordURL,
      screenSize: this.screenSize,
      audioSize: this.audioSize,
      webcamSize: this.webcamSize,
    }
  }
}
