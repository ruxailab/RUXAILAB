import crypto from 'crypto'
import {
  FirestoreAnswerRepository,
  FirestoreStudyRepository,
} from '../../../shared/repositories/index.js'
import { FirestoreMobileTaskCompanionRepository } from '../repositories/FirestoreMobileTaskCompanionRepository.js'
import { FirestoreMobileTaskViewRepository } from '../repositories/FirestoreMobileTaskViewRepository.js'
import { RtdbMobileTaskPresenceRepository } from '../repositories/RtdbMobileTaskPresenceRepository.js'
import { MobileTaskCompanionService } from './MobileTaskCompanionService.js'

/**
 * Wires the use case. Callables pass Firestore (and RTDB) in; this file does
 * not know about onCall or request.auth.
 *
 * @param {FirebaseFirestore.Firestore} db
 * @param {{ delete: Function }} FieldValue
 * @param {{ ref: Function }|null} [rtdb]
 * @returns {MobileTaskCompanionService}
 */
export function buildMobileTaskCompanionService(db, FieldValue, rtdb = null) {
  const viewRepository = new FirestoreMobileTaskViewRepository(db)
  return new MobileTaskCompanionService({
    companionRepository: new FirestoreMobileTaskCompanionRepository(
      db,
      FieldValue,
      viewRepository,
    ),
    studyRepository: new FirestoreStudyRepository(db),
    answerRepository: new FirestoreAnswerRepository(db),
    presenceRepository: new RtdbMobileTaskPresenceRepository(rtdb),
    now: () => Date.now(),
    createToken: () => crypto.randomBytes(32).toString('hex'),
    createAttemptId: () => crypto.randomBytes(16).toString('hex'),
  })
}

/**
 * @param {{ firestore: Function, database?: Function }} admin
 * @returns {MobileTaskCompanionService}
 */
export function buildMobileTaskCompanionServiceFromAdmin(admin) {
  return buildMobileTaskCompanionService(
    admin.firestore(),
    admin.firestore.FieldValue,
    rtdbFromAdmin(admin),
  )
}

/**
 * @param {{ database?: Function }} admin
 * @returns {{ ref: Function }|null}
 */
function rtdbFromAdmin(admin) {
  try {
    return typeof admin.database === 'function' ? admin.database() : null
  } catch {
    return null
  }
}
