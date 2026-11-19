import {
  admin,
  functions,
  mapHttpsError,
  requireAuth,
  validateRequest,
} from '../../../core/firebase/index.js'
import { FinalReviewMeetingService } from '../service/FinalReviewMeetingService.js'
import { FirestoreFinalReviewMeetingRepository } from '../repositories/FirestoreFinalReviewMeetingRepository.js'

const service = () => {
  const db = admin.firestore()
  const repository = new FirestoreFinalReviewMeetingRepository({
    db,
    FieldValue: admin.firestore.FieldValue,
  })
  return new FinalReviewMeetingService({ repository })
}

const actorEmail = (request) => request?.auth?.token?.email || ''

export const createFinalReviewMeeting = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Final review meeting creation failed'),
    requireAuth,
    validateRequest({
      studyId: { type: 'string' },
      title: { type: 'string' },
      participantIds: { type: 'object' },
      facilitatorId: { type: 'string', required: false },
    }),
  ],
  handler: async (request) => {
    const uid = request.auth.uid
    return service().create({
      uid,
      input: request.data || {},
      actorEmail: actorEmail(request),
    })
  },
})

export const startFinalReviewMeeting = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Final review meeting start failed'),
    requireAuth,
    validateRequest({ studyId: { type: 'string' }, meetingId: { type: 'string' } }),
  ],
  handler: async (request) => {
    const uid = request.auth.uid
    return service().start({
      uid,
      studyId: request.data?.studyId,
      meetingId: request.data?.meetingId,
      actorEmail: actorEmail(request),
    })
  },
})

export const saveFinalReviewDecision = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Final review decision save failed'),
    requireAuth,
    validateRequest({
      studyId: { type: 'string' },
      meetingId: { type: 'string' },
      decision: { type: 'object' },
    }),
  ],
  handler: async (request) => {
    const uid = request.auth.uid
    return service().saveDecision({
      uid,
      studyId: request.data?.studyId,
      meetingId: request.data?.meetingId,
      input: request.data?.decision,
      actorEmail: actorEmail(request),
    })
  },
})

export const finalizeFinalReviewMeeting = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Final review meeting finalization failed'),
    requireAuth,
    validateRequest({
      studyId: { type: 'string' },
      meetingId: { type: 'string' },
      minutes: { type: 'string' },
    }),
  ],
  handler: async (request) => {
    const uid = request.auth.uid
    return service().finalize({
      uid,
      studyId: request.data?.studyId,
      meetingId: request.data?.meetingId,
      minutes: request.data?.minutes,
      actorEmail: actorEmail(request),
    })
  },
})

export const cancelFinalReviewMeeting = functions.onCall({
  middlewares: [
    mapHttpsError(functions, 'Final review meeting cancellation failed'),
    requireAuth,
    validateRequest({
      studyId: { type: 'string' },
      meetingId: { type: 'string' },
      reason: { type: 'string', required: false },
    }),
  ],
  handler: async (request) => {
    const uid = request.auth.uid
    return service().cancel({
      uid,
      studyId: request.data?.studyId,
      meetingId: request.data?.meetingId,
      reason: request.data?.reason ?? '',
      actorEmail: actorEmail(request),
    })
  },
})
