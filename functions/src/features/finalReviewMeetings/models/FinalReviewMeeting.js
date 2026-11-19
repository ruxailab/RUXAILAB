/**
 * Domain constants and serialization helpers for heuristic final review meetings.
 *
 * A final review is a separate record from the study and its evaluator answers:
 * it records the experts' collective review without changing their submissions.
 */
export const FINAL_REVIEW_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINALIZED: 'FINALIZED',
  CANCELLED: 'CANCELLED',
})

export const FINAL_REVIEW_OUTCOME = Object.freeze({
  CONSENSUS: 'CONSENSUS',
  DISAGREEMENT: 'DISAGREEMENT',
  DEFERRED: 'DEFERRED',
})

export const FINAL_REVIEW_SCHEMA_VERSION = 1

const asArray = (value) => (Array.isArray(value) ? value : [])

/**
 * Create a meeting domain object from persisted or newly supplied data.
 * scheduledAt uses Unix milliseconds. Lifecycle timestamps are managed
 * by Firestore and may be Timestamp values when read from persistence.
 */
export default class FinalReviewMeeting {
  constructor(params = {}) {
    this.id = params.id ?? null
    this.studyId = params.studyId ?? null
    this.schemaVersion =
      params.schemaVersion ?? FINAL_REVIEW_SCHEMA_VERSION
    this.title = params.title ?? ''
    this.status = params.status ?? FINAL_REVIEW_STATUS.DRAFT
    this.scheduledAt = params.scheduledAt ?? null
    this.timeZone = params.timeZone ?? null
    this.meetingLink = params.meetingLink ?? null
    this.facilitatorId = params.facilitatorId ?? null
    this.participantIds = [...new Set(asArray(params.participantIds))]
    this.agenda = asArray(params.agenda).map((item) => ({ ...item }))
    this.minutes = params.minutes ?? ''
    this.sourceSnapshot = params.sourceSnapshot ?? null
    this.createdBy = params.createdBy ?? null
    this.createdAt = params.createdAt ?? null
    this.updatedAt = params.updatedAt ?? null
    this.startedBy = params.startedBy ?? null
    this.startedAt = params.startedAt ?? null
    this.finalizedBy = params.finalizedBy ?? null
    this.finalizedAt = params.finalizedAt ?? null
    this.cancellationReason = params.cancellationReason ?? ''
    this.cancelledBy = params.cancelledBy ?? null
    this.cancelledAt = params.cancelledAt ?? null
  }

  toFirestore() {
    return {
      schemaVersion: this.schemaVersion,
      studyId: this.studyId,
      title: this.title,
      status: this.status,
      scheduledAt: this.scheduledAt,
      timeZone: this.timeZone,
      meetingLink: this.meetingLink,
      facilitatorId: this.facilitatorId,
      participantIds: [...this.participantIds],
      agenda: this.agenda.map((item) => ({ ...item })),
      minutes: this.minutes,
      sourceSnapshot: this.sourceSnapshot,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      startedBy: this.startedBy,
      startedAt: this.startedAt,
      finalizedBy: this.finalizedBy,
      finalizedAt: this.finalizedAt,
      cancellationReason: this.cancellationReason,
      cancelledBy: this.cancelledBy,
      cancelledAt: this.cancelledAt,
    }
  }
}
