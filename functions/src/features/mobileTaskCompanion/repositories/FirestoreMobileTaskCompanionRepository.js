import { FirestoreSubcollectionRepository } from '../../../core/repositories/FirestoreSubcollectionRepository.js'
import {
  COMPANION_STATUS,
  PUBLIC_COMPANION_STATE,
  MobileTaskCompanion,
} from '../models/MobileTaskCompanion.js'

/**
 * Persistence for tests/{studyId}/mobileTaskCompanions/{participantUid}.
 *
 * The document id is the participant uid, so a study has at most one companion
 * per participant and create can be idempotent without a composite index.
 * The phone listens at mobileTaskViews/{token}; this document stays private
 * to the owning participant.
 *
 * @extends {FirestoreSubcollectionRepository<MobileTaskCompanion>}
 */
export class FirestoreMobileTaskCompanionRepository extends FirestoreSubcollectionRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   * @param {{ delete: Function }} FieldValue
   * @param {{ applyInTransaction: Function }} [viewRepository]
   */
  constructor(db, FieldValue, viewRepository = null) {
    super(
      'tests',
      'mobileTaskCompanions',
      db,
      (data, id, studyId) =>
        MobileTaskCompanion.fromFirestore(data, id, studyId),
      (item) => item.toFirestore(),
    )
    this.FieldValue = FieldValue
    this.viewRepository = viewRepository
  }

  /**
   * @param {string} studyId
   * @param {string} participantUid
   * @returns {Promise<MobileTaskCompanion|null>}
   */
  findByParticipant(studyId, participantUid) {
    return this.get(studyId, participantUid)
  }

  /**
   * Returns the live paired companion, or replaces an ended one with a new token.
   * A paired companion for the same answer keeps its token and its public view.
   *
   * @param {object} params
   * @param {string} params.studyId
   * @param {string} params.participantUid
   * @param {string} params.answerId
   * @param {() => MobileTaskCompanion} params.buildFresh
   * @returns {Promise<MobileTaskCompanion>}
   */
  async openPairedSession({ studyId, participantUid, answerId, buildFresh }) {
    const ref = this.doc(studyId, participantUid)
    return this.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref)
      if (snap.exists) {
        const companion = this.fromFirestore(snap.data(), snap.id, studyId)
        if (
          companion.status === COMPANION_STATUS.PAIRED &&
          companion.answerId === answerId &&
          companion.token
        ) {
          return companion
        }
        if (companion.token) {
          this.applyView(tx, {
            studyId,
            token: companion.token,
            delete: true,
          })
        }
      }

      const fresh = buildFresh()
      tx.set(ref, this.toFirestore(fresh))
      this.applyView(tx, {
        studyId,
        token: fresh.token,
        payload: { state: PUBLIC_COMPANION_STATE.WAITING },
      })
      return fresh
    })
  }

  /**
   * Reads the companion and the answer, then applies the service decision.
   * Answer writes must already be dotted field paths.
   *
   * @param {object} params
   * @param {string} params.studyId
   * @param {string} params.companionId
   * @param {string} params.answerId
   * @param {(loaded: { companion: object|null, answer: object|null }) => {
   *   result: object,
   *   companionUpdate?: object,
   *   answerUpdate?: object,
   *   clearToken?: boolean,
   *   view?: { studyId?: string, token?: string, payload?: object, delete?: boolean },
   * }} params.decide
   */
  async commitSessionChange({ studyId, companionId, answerId, decide }) {
    const companionRef = this.doc(studyId, companionId)
    const answerRef = this.db.collection('answers').doc(answerId)

    return this.db.runTransaction(async (tx) => {
      const companionSnap = await tx.get(companionRef)
      const answerSnap = await tx.get(answerRef)
      const decision = decide({
        companion: companionSnap.exists
          ? this.fromFirestore(
              companionSnap.data(),
              companionSnap.id,
              studyId,
            )
          : null,
        answer: answerSnap.exists
          ? { id: answerSnap.id, ...answerSnap.data() }
          : null,
      })

      const companionUpdate = { ...(decision.companionUpdate || {}) }
      if (decision.clearToken) {
        companionUpdate.token = this.FieldValue.delete()
      }
      if (Object.keys(companionUpdate).length > 0) {
        tx.update(companionRef, companionUpdate)
      }
      if (decision.answerUpdate && Object.keys(decision.answerUpdate).length) {
        tx.update(answerRef, decision.answerUpdate)
      }
      this.applyView(tx, decision.view)
      return decision.result
    })
  }

  /**
   * @param {FirebaseFirestore.Transaction} tx
   * @param {object|null|undefined} view
   */
  applyView(tx, view) {
    this.viewRepository?.applyInTransaction(tx, view)
  }
}
