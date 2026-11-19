import {
  FINAL_REVIEW_OUTCOME,
  FINAL_REVIEW_STATUS,
} from '../models/FinalReviewMeeting.js'

const MAX_TITLE_LENGTH = 160
const MAX_MINUTES_LENGTH = 30000
const MAX_PARTICIPANTS = 30
const MAX_AGENDA_ITEMS = 30
const MAX_AGENDA_ITEM_LENGTH = 500
const MAX_RATIONALE_LENGTH = 10000
const MAX_CONCERNS = 50
const MAX_CONCERN_LENGTH = 2000
const MAX_ACTION_ITEMS = 50
const MAX_ACTION_ITEM_LENGTH = 1000
const AI_AGENT_PREFIX = 'ai-agent:'

const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0

const uniqueStrings = (values) =>
  Array.isArray(values) &&
  values.every(
    (value) =>
      isNonEmptyString(value) &&
      value === value.trim() &&
      !value.includes('/') &&
      !['.', '..'].includes(value) &&
      value.length <= 128,
  ) &&
  new Set(values).size === values.length

const fail = (message) => ({ valid: false, error: message })
const pass = (value) => ({ valid: true, value })


/** Validate the client-controlled fields accepted when creating a meeting. */
export const validateCreateFinalReviewMeeting = (input) => {
  if (!isRecord(input)) return fail('Meeting data must be an object')

  if (
    !isNonEmptyString(input.studyId) ||
    input.studyId !== input.studyId.trim() ||
    input.studyId.includes('/') ||
    ['.', '..'].includes(input.studyId) ||
    input.studyId.length > 128
  ) {
    return fail('studyId must be a valid document ID')
  }

  if (input.facilitatorId != null) {
    if (
      !isNonEmptyString(input.facilitatorId) ||
      input.facilitatorId !== input.facilitatorId.trim() ||
      input.facilitatorId.length > 128 ||
      input.facilitatorId.includes('/') ||
      ['.', '..'].includes(input.facilitatorId)
    ) {
      return fail('facilitatorId must be a valid user ID')
    }
  }

  if (!isNonEmptyString(input.title)) return fail('title is required')

  if (input.title.trim().length > MAX_TITLE_LENGTH) {
    return fail(`title must be ${MAX_TITLE_LENGTH} characters or fewer`)
  }

  if (
    input.scheduledAt != null &&
    (!Number.isSafeInteger(input.scheduledAt) ||
      input.scheduledAt <= Date.now())
  ) {
    return fail('scheduledAt must be a future Unix timestamp in milliseconds')
  }

  if (input.timeZone != null) {
    if (typeof input.timeZone !== 'string' || input.timeZone.length > 100) {
      return fail('timeZone must be a string of at most 100 characters')
    }

    const normalizedTimeZone = input.timeZone.trim()

    if (normalizedTimeZone) {
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: normalizedTimeZone })
      } catch {
        return fail('timeZone must be a valid IANA time zone')
      }
    }
  }

    if (input.meetingLink != null && input.meetingLink !== '') {
    if (typeof input.meetingLink !== 'string' || input.meetingLink.length > 2048) {
      return fail('meetingLink must be a string of at most 2048 characters')
    }

    try {
      const url = new URL(input.meetingLink)

      if (
        url.protocol !== 'https:' ||
        url.username !== '' ||
        url.password !== ''
      ) {
        return fail('meetingLink must be an HTTPS URL without embedded credentials')
      }
    } catch {
      return fail('meetingLink must be a valid HTTPS URL')
    }
  }

  if (
    !Array.isArray(input.participantIds) ||
    input.participantIds.length < 2 ||
    input.participantIds.length > MAX_PARTICIPANTS ||
    !uniqueStrings(input.participantIds)
  ) {
    return fail(`participantIds must contain 2-${MAX_PARTICIPANTS} unique user IDs`)
  }

  if (input.participantIds.some((id) => id.startsWith(AI_AGENT_PREFIX))) {
    return fail('AI agents cannot be final review meeting participants')
  }

  if (
    input.agenda != null &&
    (!Array.isArray(input.agenda) || input.agenda.length > MAX_AGENDA_ITEMS)
  ) {
    return fail(`agenda must contain at most ${MAX_AGENDA_ITEMS} items`)
  }

  const agenda = input.agenda ?? []

  if (
    agenda.some(
      (item) =>
        !isRecord(item) ||
        !isNonEmptyString(item.title) ||
        item.title.trim().length > MAX_AGENDA_ITEM_LENGTH,
    )
  ) {
    return fail(`each agenda item needs a title of at most ${MAX_AGENDA_ITEM_LENGTH} characters`)
  }

  const normalizedAgenda = agenda.map((item, index) => ({
    id: item.id ?? `agenda-${index + 1}`,
    title: item.title.trim(),
    order: Number.isInteger(item.order) ? item.order : index,
  }))

  const agendaOrders = normalizedAgenda.map((item) => item.order)

  if (
    agendaOrders.some((order) => !Number.isSafeInteger(order) || order < 0) ||
    new Set(agendaOrders).size !== agendaOrders.length
  ) {
    return fail('agenda order values must be unique non-negative safe integers')
  }

  if (
    normalizedAgenda.some(
      (item) =>
        !isNonEmptyString(item.id) ||
        item.id !== item.id.trim() ||
        item.id.length > 128 ||
        item.id.includes('/') ||
        ['.', '..'].includes(item.id),
    )
  ) {
    return fail('agenda contains an invalid item identifier')
  }

  if (
    new Set(normalizedAgenda.map((item) => item.id)).size !==
    normalizedAgenda.length
  ) {
    return fail('agenda item identifiers must be unique')
  }

  return pass({
    studyId: input.studyId,
    facilitatorId: input.facilitatorId ?? null,
    title: input.title.trim(),
    scheduledAt: input.scheduledAt ?? null,
    timeZone: input.timeZone?.trim() || null,
    meetingLink: input.meetingLink?.trim() || null,
    participantIds: [...input.participantIds],
    agenda: normalizedAgenda,
  })
}



/** Validate a decision without accepting server-owned identity/timestamp fields. */
export const validateFinalReviewDecision = (input) => {
  if (!isRecord(input)) return fail('Decision data must be an object')

  if (
    !isNonEmptyString(input.heuristicId) ||
    input.heuristicId !== input.heuristicId.trim() ||
    input.heuristicId.length > 128 ||
    input.heuristicId.includes('/')
  ) {
    return fail('heuristicId must be a valid study identifier')
  }

  if (input.questionId != null) {
    const validString =
      typeof input.questionId === 'string' &&
      input.questionId.trim().length > 0 &&
      input.questionId === input.questionId.trim() &&
      input.questionId.length <= 128 &&
      !input.questionId.includes('/')

    const validNumber =
      typeof input.questionId === 'number' && Number.isFinite(input.questionId)

    if (!validString && !validNumber) {
      return fail('questionId must be a valid string or number')
    }
  }

  if (!Object.values(FINAL_REVIEW_OUTCOME).includes(input.outcome)) {
    return fail('outcome is not supported')
  }

  if (
    !isNonEmptyString(input.rationale) ||
    input.rationale.length > MAX_RATIONALE_LENGTH
  ) {
    return fail(`rationale must be a non-empty string of at most ${MAX_RATIONALE_LENGTH} characters`)
  }

  if (
    input.unresolvedConcerns != null &&
    (!Array.isArray(input.unresolvedConcerns) ||
      input.unresolvedConcerns.length > MAX_CONCERNS ||
      input.unresolvedConcerns.some(
        (item) => !isNonEmptyString(item) || item.length > MAX_CONCERN_LENGTH,
      ))
  ) {
    return fail(`unresolvedConcerns must contain at most ${MAX_CONCERNS} strings of at most ${MAX_CONCERN_LENGTH} characters each`)
  }

  if (
    input.actionItems != null &&
    (!Array.isArray(input.actionItems) ||
      input.actionItems.length > MAX_ACTION_ITEMS ||
      input.actionItems.some(
        (item) =>
          !isRecord(item) ||
          !isNonEmptyString(item.description) ||
          item.description.length > MAX_ACTION_ITEM_LENGTH ||
          (item.assigneeId != null && !isNonEmptyString(item.assigneeId)) ||
          (item.dueAt != null &&
            (!Number.isSafeInteger(item.dueAt) || item.dueAt <= 0)),
      ))
  ) {
    return fail('actionItems contains an invalid item')
  }

  if (input.finalAssessment != null && !isRecord(input.finalAssessment)) {
    return fail('finalAssessment must be an object')
  }

  if (
    input.finalAssessment?.summary !== undefined &&
    (!isNonEmptyString(input.finalAssessment.summary) ||
      input.finalAssessment.summary.length > MAX_RATIONALE_LENGTH)
  ) {
    return fail('finalAssessment.summary must be a non-empty string within the allowed length')
  }

  if (
    input.outcome === FINAL_REVIEW_OUTCOME.CONSENSUS &&
    (!isRecord(input.finalAssessment) ||
      !isNonEmptyString(input.finalAssessment.summary) ||
      input.finalAssessment.summary.length > MAX_RATIONALE_LENGTH)
  ) {
    return fail('A consensus decision requires a non-empty finalAssessment summary')
  }

  if (
    input.finalAssessment != null &&
    Buffer.byteLength(JSON.stringify(input.finalAssessment), 'utf8') > 64 * 1024
  ) {
    return fail('finalAssessment must be 64 KB or smaller')
  }

  if (
    input.outcome === FINAL_REVIEW_OUTCOME.DEFERRED &&
    !(input.unresolvedConcerns?.length || input.actionItems?.length)
  ) {
    return fail('A deferred decision must record an unresolved concern or follow-up action')
  }

  if (Object.hasOwn(input, 'expertPositions')) {
    return fail('expertPositions are derived from immutable source evaluations')
  }

  return pass({
    heuristicId: String(input.heuristicId),
    questionId: input.questionId == null ? null : String(input.questionId),
    outcome: input.outcome,
    rationale: input.rationale.trim(),
    finalAssessment:
      input.finalAssessment == null
        ? null
        : input.finalAssessment.summary === undefined
          ? {}
          : { summary: input.finalAssessment.summary.trim() },
    unresolvedConcerns: (input.unresolvedConcerns ?? []).map((item) => item.trim()),
    actionItems: (input.actionItems ?? []).map((item) => ({
      description: item.description.trim(),
      ...(item.assigneeId != null
        ? { assigneeId: item.assigneeId.trim() }
        : {}),
      ...(item.dueAt != null ? { dueAt: item.dueAt } : {}),
    })),
  })
}



/**
 * Allowed lifecycle transitions. Finalized/cancelled meetings are terminal;
 * later changes must be represented by a new review record.
 */
export const canTransitionFinalReviewStatus = (current, next) => {
  const transitions = {
    [FINAL_REVIEW_STATUS.DRAFT]: [
      FINAL_REVIEW_STATUS.SCHEDULED,
      FINAL_REVIEW_STATUS.IN_PROGRESS,
      FINAL_REVIEW_STATUS.CANCELLED,
    ],
    [FINAL_REVIEW_STATUS.SCHEDULED]: [
      FINAL_REVIEW_STATUS.IN_PROGRESS,
      FINAL_REVIEW_STATUS.CANCELLED,
    ],
    [FINAL_REVIEW_STATUS.IN_PROGRESS]: [
      FINAL_REVIEW_STATUS.FINALIZED,
      FINAL_REVIEW_STATUS.CANCELLED,
    ],
    [FINAL_REVIEW_STATUS.FINALIZED]: [],
    [FINAL_REVIEW_STATUS.CANCELLED]: [],
  }
  return transitions[current]?.includes(next) ?? false
}

export const validateFinalReviewMinutes = (minutes) =>
  typeof minutes === 'string' && minutes.length <= MAX_MINUTES_LENGTH
    ? pass(minutes)
    : fail(`minutes must be a string of at most ${MAX_MINUTES_LENGTH} characters`)
