import { TASK_OUTCOME } from '../models/MobileTaskCompanion.js'

export const mobileTaskCompanionOwnerValidator = {
  studyId: { type: 'string', required: true },
  answerId: { type: 'string', required: true },
}

export const activateMobileTaskValidator = {
  studyId: { type: 'string', required: true },
  answerId: { type: 'string', required: true },
  taskIndex: { type: 'number', required: true },
  taskId: { type: ['string', 'number'], required: true },
}

/**
 * Phone calls send `studyId`, `participantUid` and `token`, and no auth.
 * Desktop calls omit `token` and send `studyId` plus `answerId` as the owner.
 */
export const submitMobileTaskOutcomeValidator = {
  token: { type: 'string', required: false },
  studyId: { type: 'string', required: false },
  participantUid: { type: 'string', required: false },
  answerId: { type: 'string', required: false },
  taskIndex: { type: 'number', required: true },
  taskId: { type: ['string', 'number'], required: true },
  attemptId: { type: 'string', required: true },
  outcome: {
    type: 'string',
    required: true,
    enum: [TASK_OUTCOME.COMPLETED, TASK_OUTCOME.NOT_COMPLETED],
  },
}
