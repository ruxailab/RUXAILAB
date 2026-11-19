import { fail } from '../../../core/errors.js'
import {
  ROLE,
  normalizeStudyType,
  resolveStudyRole,
} from '../../../shared/auth/studyAccess.js'
import FinalReviewMeeting, {
  FINAL_REVIEW_STATUS,
} from '../models/FinalReviewMeeting.js'
import {
  canTransitionFinalReviewStatus,
  validateCreateFinalReviewMeeting,
  validateFinalReviewDecision,
  validateFinalReviewMinutes,
} from '../validators/finalReviewMeetingValidator.js'
import { resolveHeuristicAnswerConfiguration } from '../../../shared/models/heuristicAnswerConfiguration.js'

const MAX_SOURCE_EVALUATION_BYTES = 900 * 1024
const MAX_TOTAL_SOURCE_EVALUATION_BYTES = 8 * 1024 * 1024
const AI_AGENT_PREFIX = 'ai-agent:'
const asString = (value) => String(value ?? '')

const assertPathIds = (studyId, meetingId) => {
  for (const [name, value] of [['studyId', studyId], ['meetingId', meetingId]]) {
    if (
      typeof value !== 'string' ||
      !value.trim() ||
      value !== value.trim() ||
      value.includes('/') ||
      ['.', '..'].includes(value) ||
      value.length > 128
    ) {
      fail('invalid-argument', `${name} must be a valid document ID`)
    }
  }
}

const assertHeuristicStudy = (study) => {
  if (!study) fail('not-found', 'Study not found')
  if (normalizeStudyType(study.testType) !== 'HEURISTIC') {
    fail('failed-precondition', 'Final reviews are only available for heuristic studies')
  }
}

export const assertCanManage = (study, uid, isSuperAdmin = false) => {
  const role = resolveStudyRole(study, uid, isSuperAdmin)
  if (
    role !== ROLE.ADMIN &&
    !(role === ROLE.MANAGER && study.studyRoleMap?.[uid] === ROLE.MANAGER)
  ) {
    fail('permission-denied', 'Managing final review meetings is not permitted')
  }
  return role
}

export const assertMeetingManager = (study, meeting, uid, isSuperAdmin = false) => {
  const role = resolveStudyRole(study, uid, isSuperAdmin)
  if (role === ROLE.ADMIN) return role
  if (
    role === ROLE.MANAGER &&
    study.studyRoleMap?.[uid] === ROLE.MANAGER &&
    meeting.facilitatorId === uid
  ) return role
  fail('permission-denied', 'Only the meeting facilitator or a study administrator can manage this meeting')
}

const getAnswerKey = (answers, evaluatorId) => {
  if (answers?.[evaluatorId]) return evaluatorId
  const entry = Object.entries(answers || {}).find(
    ([, answer]) => answer?.userDocId === evaluatorId,
  )
  return entry?.[0] ?? null
}


const copyDefinedFields = (source, fields) => {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    fail('failed-precondition', 'An evaluation contains an invalid heuristic record')
  }

  return Object.fromEntries(
    fields
      .filter((field) => source[field] !== undefined)
      .map((field) => [field, source[field]]),
  )
}

const createEvaluationSnapshot = (answer) => {
  const heuristics = answer.heuristicQuestions ?? []

  if (!Array.isArray(heuristics)) {
    fail('failed-precondition', 'An evaluation contains invalid heuristic data')
  }

  return {
    heuristicQuestions: heuristics.map((heuristic) => {
      const questions = heuristic?.heuristicQuestions ?? []

      if (!Array.isArray(questions)) {
        fail('failed-precondition', 'A heuristic contains invalid question data')
      }

      return {
        ...copyDefinedFields(heuristic, ['heuristicId']),
        heuristicQuestions: questions.map((question) =>
          copyDefinedFields(question, [
            'heuristicId',
            'heuristicAnswer',
            'heuristicComment',
            'heuristicRecommendation',
            'answerImageUrl',
            'comments',
            'images',
          ]),
        ),
      }
    }),
  }
}

export const getSubmittedHumanEvaluations = ({ study, answerDocument, participantIds }) => {
  const answers = answerDocument?.heuristicAnswers || {}
  let totalSnapshotBytes = 0
  return participantIds.map((evaluatorId) => {
    if (evaluatorId.startsWith(AI_AGENT_PREFIX)) {
      fail('invalid-argument', 'AI agents cannot participate as human experts')
    }
    if (evaluatorId.includes('/') || evaluatorId.length > 128) {
      fail('invalid-argument', 'A participant ID is invalid')
    }
    if (resolveStudyRole(study, evaluatorId) !== ROLE.EVALUATOR) {
      fail('failed-precondition', 'Every participant must be an accepted study evaluator')
    }

    const answerKey = getAnswerKey(answers, evaluatorId)
    const answer = answerKey ? answers[answerKey] : null
    if (
      !answer ||
      answer.userDocId !== evaluatorId ||
      answer.submitted !== true ||
      answer.hidden === true
    ) {
      fail(
        'failed-precondition',
        'Every participant must have a visible, submitted human evaluation',
      )
    }

    const snapshot = {
      evaluatorId,
      sourceAnswerKey: answerKey,
      sourceLastUpdate: answer.lastUpdate ?? null,
      evaluation: createEvaluationSnapshot(answer),
    }
    const snapshotBytes = Buffer.byteLength(JSON.stringify(snapshot), 'utf8')
    if (snapshotBytes > MAX_SOURCE_EVALUATION_BYTES) {
      fail('failed-precondition', 'An evaluator submission is too large to snapshot for a final review')
    }
    totalSnapshotBytes += snapshotBytes
    if (totalSnapshotBytes > MAX_TOTAL_SOURCE_EVALUATION_BYTES) {
      fail('failed-precondition', 'The selected evaluator submissions are too large to snapshot in one final review')
    }
    return snapshot
  })
}

const findHeuristic = (study, heuristicId) =>
  (Array.isArray(study.testStructure) ? study.testStructure : []).find(
    (heuristic) => asString(heuristic?.id) === asString(heuristicId),
  )
export const assertDecisionTarget = (study, decision) => {
  const heuristic = findHeuristic(study, decision.heuristicId)
  if (!heuristic) {
    fail('invalid-argument', 'heuristicId does not exist in this study')
  }

  if (decision.questionId == null) return

  const { answerMode } = resolveHeuristicAnswerConfiguration(study)
  const isDetailed = answerMode === 'customOptions'

  const questions = Array.isArray(heuristic.questions)
    ? heuristic.questions
    : []

  const isQuestion = questions.some(
    (question) => asString(question?.id) === decision.questionId,
  )

  if (isDetailed ? !isQuestion : asString(heuristic.id) !== decision.questionId) {
    fail('invalid-argument', 'questionId does not belong to the selected heuristic')
  }
}

export const collectExpertPositions = (snapshots, heuristicId, questionId) => {
  return snapshots.map((snapshot) => {
    const evaluatorHeuristics = Array.isArray(snapshot.evaluation?.heuristicQuestions)
      ? snapshot.evaluation.heuristicQuestions
      : []
    const heuristic = evaluatorHeuristics.find(
      (item) => asString(item?.heuristicId) === asString(heuristicId),
    )
    const questions = Array.isArray(heuristic?.heuristicQuestions)
      ? heuristic.heuristicQuestions
      : []
    const matchingQuestions =
      questionId == null
        ? questions
        : questions.filter(
            (item) => asString(item?.heuristicId) === asString(questionId),
          )
    const comments = matchingQuestions.flatMap((item) =>
      Array.isArray(item.comments) && item.comments.length
        ? item.comments
        : item.heuristicComment
          ? [{ id: 'legacy', text: item.heuristicComment }]
          : [],
    )
    const images = matchingQuestions.flatMap((item) =>
      Array.isArray(item.images) && item.images.length
        ? item.images
        : item.answerImageUrl
          ? [{ id: 'legacy', url: item.answerImageUrl }]
          : [],
    )

    return {
      evaluatorId: snapshot.evaluatorId,
      assessment:
        questionId == null
          ? matchingQuestions.map((item) => ({
              questionId: item.heuristicId,
              value: item.heuristicAnswer ?? null,
            }))
          : matchingQuestions[0]?.heuristicAnswer ?? null,
      comments,
      recommendations: matchingQuestions
        .map((item) => item.heuristicRecommendation)
        .filter((value) => typeof value === 'string' && value.trim()),
      images,
      missing: matchingQuestions.length === 0,
    }
  })
}

const decisionDocumentId = (heuristicId, questionId) =>
  Buffer.from(
    JSON.stringify([heuristicId, questionId ?? null]),
  ).toString('base64url')

/** Coordinates final-review use cases through the Firestore repository. */
export class FinalReviewMeetingService {
  constructor({ repository }) {
    this.repository = repository
  }

async create({ uid, input, actorEmail = '' }) {
  const validation = validateCreateFinalReviewMeeting(input)
  if (!validation.valid) fail('invalid-argument', validation.error)

  const data = validation.value

  return this.repository.runTransaction(async (transaction) => {
    const [studySnap, userSnap] = await Promise.all([
      transaction.getStudy(data.studyId),
      transaction.getUser(uid),
    ])

    if (!studySnap.exists) fail('not-found', 'Study not found')

    const study = { id: studySnap.id, ...studySnap.data() }
    const effectiveSuperAdmin =
      userSnap.data()?.accessLevel === ROLE.ADMIN

    assertHeuristicStudy(study)
    assertCanManage(study, uid, effectiveSuperAdmin)

    // Use the creator as facilitator when no facilitator is specified.
    const facilitatorId = data.facilitatorId || uid

    // Independently authorize a facilitator other than the creator.
    if (facilitatorId !== uid) {
      const facilitatorUserSnap = await transaction.getUser(facilitatorId)

      if (!facilitatorUserSnap.exists) {
        fail(
          'permission-denied',
          'Selected facilitator is not authorized for this study',
        )
      }

      const facilitatorIsSuperAdmin =
        facilitatorUserSnap.data()?.accessLevel === ROLE.ADMIN

      assertCanManage(study, facilitatorId, facilitatorIsSuperAdmin)
    }

    if (!study.answersDocId) {
      fail(
        'failed-precondition',
        'The study has no linked evaluator answers document',
      )
    }

    const answerSnap = await transaction.getAnswers(study.answersDocId)

    if (!answerSnap.exists) {
      fail('not-found', 'Study evaluator answers were not found')
    }

    const answerDocument = answerSnap.data()

    if (answerDocument.studyId && answerDocument.studyId !== data.studyId) {
      fail(
        'failed-precondition',
        'The evaluator answers document belongs to another study',
      )
    }

    if (normalizeStudyType(answerDocument.type) !== 'HEURISTIC') {
      fail(
        'failed-precondition',
        'The linked answers document is not a heuristic evaluation',
      )
    }

    const sourceEvaluations = getSubmittedHumanEvaluations({
      study,
      answerDocument,
      participantIds: data.participantIds,
    })

    const status = data.scheduledAt
      ? FINAL_REVIEW_STATUS.SCHEDULED
      : FINAL_REVIEW_STATUS.DRAFT

    const now = transaction.serverTimestamp()

    const meeting = new FinalReviewMeeting({
      ...data,
      status,
      facilitatorId,
      sourceSnapshot: {
        capturedAt: now,
        evaluatorIds: sourceEvaluations.map(
          (snapshot) => snapshot.evaluatorId,
        ),
      },
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
    })

    const meetingId = transaction.createMeeting(
      data.studyId,
      meeting.toFirestore(),
    )

    sourceEvaluations.forEach((snapshot) => {
      const { evaluatorId, ...snapshotData } = snapshot

      transaction.createSourceEvaluation(
        data.studyId,
        meetingId,
        evaluatorId,
        {
          ...snapshotData,
          evaluatorId,
          capturedAt: now,
        },
      )
    })

    transaction.writeAuditEvent(data.studyId, {
      action: 'heuristic.finalReviewCreated',
      actorId: uid,
      actorEmail,
      target: meetingId,
      targetLabel: data.title,
      targetType: 'finalReviewMeeting',
      details: {
        meetingId,
        participantCount: data.participantIds.length,
        sourceEvaluationCount: sourceEvaluations.length,
      },
    })

    return { meetingId, status }
  })
}

  async start({ uid, studyId, meetingId, actorEmail = '' }) {
    assertPathIds(studyId, meetingId)
    return this.repository.runTransaction(async (transaction) => {
      const [studySnap, meetingSnap, userSnap] = await Promise.all([
        transaction.getStudy(studyId), transaction.getMeeting(studyId, meetingId), transaction.getUser(uid),
      ])
      if (!studySnap.exists || !meetingSnap.exists) fail('not-found', 'Final review meeting not found')
      const study = { id: studySnap.id, ...studySnap.data() }
      const meeting = meetingSnap.data()
      const effectiveSuperAdmin = userSnap.data()?.accessLevel === ROLE.ADMIN
      assertHeuristicStudy(study)
      assertMeetingManager(study, meeting, uid, effectiveSuperAdmin)
      if (!canTransitionFinalReviewStatus(meeting.status, FINAL_REVIEW_STATUS.IN_PROGRESS)) {
        fail('failed-precondition', 'This meeting cannot be started from its current status')
      }

      transaction.updateMeeting(studyId, meetingId, {
        status: FINAL_REVIEW_STATUS.IN_PROGRESS,
        startedBy: uid,
        startedAt: transaction.serverTimestamp(),
        updatedAt: transaction.serverTimestamp(),
      })
      transaction.writeAuditEvent(studyId, {
        action: 'heuristic.finalReviewStarted',
        actorId: uid,
        actorEmail,
        target: meetingId,
        targetLabel: meeting.title || meetingId,
        targetType: 'finalReviewMeeting',
        details: { meetingId },
      })
      return { meetingId, status: FINAL_REVIEW_STATUS.IN_PROGRESS }
    })
  }

  async saveDecision({ uid, studyId, meetingId, input, actorEmail = '' }) {
    assertPathIds(studyId, meetingId)
    const validation = validateFinalReviewDecision(input)
    if (!validation.valid) fail('invalid-argument', validation.error)
    const decision = validation.value
    return this.repository.runTransaction(async (transaction) => {
      const [studySnap, meetingSnap, userSnap, sourceSnap, decisionSnap] = await Promise.all([
        transaction.getStudy(studyId), transaction.getMeeting(studyId, meetingId), transaction.getUser(uid),
        transaction.getSourceEvaluations(studyId, meetingId),
        transaction.getDecision(
          studyId,
          meetingId,
          decisionDocumentId(decision.heuristicId, decision.questionId),
        ),
      ])
      if (!studySnap.exists || !meetingSnap.exists) fail('not-found', 'Final review meeting not found')
      const study = { id: studySnap.id, ...studySnap.data() }
      const meeting = meetingSnap.data()
      const effectiveSuperAdmin = userSnap.data()?.accessLevel === ROLE.ADMIN
      assertHeuristicStudy(study)
      assertMeetingManager(study, meeting, uid, effectiveSuperAdmin)
      if (meeting.status !== FINAL_REVIEW_STATUS.IN_PROGRESS) {
        fail('failed-precondition', 'Decisions can only be recorded while the meeting is in progress')
      }
      assertDecisionTarget(study, decision)

      const snapshots = sourceSnap.docs.map((sourceDoc) => ({
        ...sourceDoc.data(),
        evaluatorId: sourceDoc.id,
      }))
      const participantIds = Array.isArray(meeting.participantIds)
        ? meeting.participantIds
        : []
      const participantIdSet = new Set(participantIds)
      const snapshotMatchesParticipants =
        snapshots.length === participantIds.length &&
        snapshots.every((snapshot) => participantIdSet.has(snapshot.evaluatorId))
      if (!snapshotMatchesParticipants) {
        fail('failed-precondition', 'The source evaluation snapshot is incomplete for this meeting')
      }
      const expertPositions = collectExpertPositions(
        snapshots,
        decision.heuristicId,
        decision.questionId,
      )
      if (Buffer.byteLength(JSON.stringify(expertPositions), 'utf8') > 900 * 1024) {
        fail('failed-precondition', 'The expert comparison is too large to store as one decision')
      }
      for (const item of decision.actionItems) {
        if (
          item.assigneeId &&
          item.assigneeId !== meeting.facilitatorId &&
          !participantIds.includes(item.assigneeId)
        ) {
          fail('invalid-argument', 'Action item assignees must be meeting participants or the facilitator')
        }
      }

      const now = transaction.serverTimestamp()
      const previousDecision = decisionSnap.exists ? decisionSnap.data() : null
      const decisionId = decisionDocumentId(decision.heuristicId, decision.questionId)
      const revision = previousDecision ? (previousDecision.revision || 1) + 1 : 1

      const decisionDocument = {
        ...decision,
        expertPositions,
        revision,
        createdBy: previousDecision ? previousDecision.createdBy : uid,
        createdAt: previousDecision ? previousDecision.createdAt : now,
        updatedBy: uid,
        updatedAt: now,
      }

      if (Buffer.byteLength(JSON.stringify(decisionDocument), 'utf8') > 900 * 1024) {
        fail('failed-precondition', 'The complete decision is too large to store')
      }

      if (previousDecision) {
        transaction.createDecisionHistory(studyId, meetingId, {
          decisionId,
          previousRevision: previousDecision.revision || 1,
          decision: previousDecision,
          replacedBy: uid,
          replacedAt: now,
        })
      }

      transaction.setDecision(studyId, meetingId, decisionId, decisionDocument)
      transaction.updateMeeting(studyId, meetingId, { updatedAt: now })
      transaction.writeAuditEvent(studyId, {
        action: decisionSnap.exists
          ? 'heuristic.finalReviewDecisionUpdated'
          : 'heuristic.finalReviewDecisionCreated',
        actorId: uid,
        actorEmail,
        target: decisionId,
        targetLabel: meeting.title || meetingId,
        targetType: 'finalReviewDecision',
        details: {
          meetingId,
          heuristicId: decision.heuristicId,
          questionId: decision.questionId,
          outcome: decision.outcome,
          expertPositionCount: expertPositions.length,
          revision,
        },
      })
      return { meetingId, decisionId, status: 'saved' }
    })
  }

  async finalize({ uid, studyId, meetingId, minutes, actorEmail = '' }) {
    assertPathIds(studyId, meetingId)
    const minutesValidation = validateFinalReviewMinutes(minutes)
    if (!minutesValidation.valid || !minutes.trim()) {
      fail('invalid-argument', minutesValidation.error || 'Meeting minutes are required before finalization')
    }
    return this.repository.runTransaction(async (transaction) => {
      const [studySnap, meetingSnap, userSnap, decisionsSnap] = await Promise.all([
        transaction.getStudy(studyId), transaction.getMeeting(studyId, meetingId), transaction.getUser(uid),
        transaction.getDecisions(studyId, meetingId),
      ])
      if (!studySnap.exists || !meetingSnap.exists) fail('not-found', 'Final review meeting not found')
      const study = { id: studySnap.id, ...studySnap.data() }
      const meeting = meetingSnap.data()
      const effectiveSuperAdmin = userSnap.data()?.accessLevel === ROLE.ADMIN
      assertHeuristicStudy(study)
      assertMeetingManager(study, meeting, uid, effectiveSuperAdmin)
      if (!canTransitionFinalReviewStatus(meeting.status, FINAL_REVIEW_STATUS.FINALIZED)) {
        fail('failed-precondition', 'This meeting cannot be finalized from its current status')
      }
      if (decisionsSnap.empty) {
        fail('failed-precondition', 'At least one expert decision is required before finalization')
      }

      const now = transaction.serverTimestamp()
      transaction.updateMeeting(studyId, meetingId, {
        status: FINAL_REVIEW_STATUS.FINALIZED,
        minutes: minutes.trim(),
        finalizedBy: uid,
        finalizedAt: now,
        updatedAt: now,
      })
      transaction.writeAuditEvent(studyId, {
        action: 'heuristic.finalReviewFinalized',
        actorId: uid,
        actorEmail,
        target: meetingId,
        targetLabel: meeting.title || meetingId,
        targetType: 'finalReviewMeeting',
        details: {
          meetingId,
          decisionCount: decisionsSnap.size,
          participantCount: meeting.participantIds?.length || 0,
        },
      })
      return { meetingId, status: FINAL_REVIEW_STATUS.FINALIZED }
    })
  }

  async cancel({ uid, studyId, meetingId, reason = '', actorEmail = '' }) {
    assertPathIds(studyId, meetingId)
    if (typeof reason !== 'string' || reason.length > 2000) {
      fail('invalid-argument', 'Cancellation reason must be a string of at most 2000 characters')
    }
    return this.repository.runTransaction(async (transaction) => {
      const [studySnap, meetingSnap, userSnap] = await Promise.all([
        transaction.getStudy(studyId), transaction.getMeeting(studyId, meetingId), transaction.getUser(uid),
      ])
      if (!studySnap.exists || !meetingSnap.exists) fail('not-found', 'Final review meeting not found')
      const study = { id: studySnap.id, ...studySnap.data() }
      const meeting = meetingSnap.data()
      const effectiveSuperAdmin = userSnap.data()?.accessLevel === ROLE.ADMIN
      assertHeuristicStudy(study)
      assertMeetingManager(study, meeting, uid, effectiveSuperAdmin)
      if (!canTransitionFinalReviewStatus(meeting.status, FINAL_REVIEW_STATUS.CANCELLED)) {
        fail('failed-precondition', 'This meeting cannot be cancelled from its current status')
      }

      const now = transaction.serverTimestamp()
      transaction.updateMeeting(studyId, meetingId, {
        status: FINAL_REVIEW_STATUS.CANCELLED,
        cancellationReason: reason.trim(),
        cancelledBy: uid,
        cancelledAt: now,
        updatedAt: now,
      })
      transaction.writeAuditEvent(studyId, {
        action: 'heuristic.finalReviewCancelled',
        actorId: uid,
        actorEmail,
        target: meetingId,
        targetLabel: meeting.title || meetingId,
        targetType: 'finalReviewMeeting',
        details: {
          meetingId,
          reasonProvided: Boolean(reason.trim()),
        },
      })
      return { meetingId, status: FINAL_REVIEW_STATUS.CANCELLED }
    })
  }
}
