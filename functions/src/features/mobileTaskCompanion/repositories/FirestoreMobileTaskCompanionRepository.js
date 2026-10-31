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
 * The phone listens at mobileTaskLive/{token} in the Realtime Database and
 * writes `connected` on that same node. This document stays private to the
 * owning participant.
 *
 * @extends {FirestoreSubcollectionRepository<MobileTaskCompanion>}
 */
export class FirestoreMobileTaskCompanionRepository extends FirestoreSubcollectionRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   * @param {{ delete: Function }} FieldValue
   * @param {{ claim: Function, remove: Function, apply: Function }} [liveRepository]
   */
  constructor(db, FieldValue, liveRepository = null) {
    super(
      'tests',
      'mobileTaskCompanions',
      db,
      (data, id, studyId) =>
        MobileTaskCompanion.fromFirestore(data, id, studyId),
      (item) => item.toFirestore(),
    )
    this.FieldValue = FieldValue
    this.liveRepository = liveRepository
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
   * A paired companion for the same answer keeps its token and its live node.
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
    let side = null
    const companion = await this.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref)
      if (snap.exists) {
        const existing = this.fromFirestore(snap.data(), snap.id, studyId)
        if (
          existing.status === COMPANION_STATUS.PAIRED &&
          existing.answerId === answerId &&
          existing.token
        ) {
          side = { kind: 'reuse', token: existing.token, uid: participantUid }
          return existing
        }
        side = {
          kind: 'fresh',
          releaseToken: existing.token || null,
          token: null,
          uid: participantUid,
        }
      } else {
        side = { kind: 'fresh', releaseToken: null, token: null, uid: participantUid }
      }

      const fresh = buildFresh()
      if (side.kind === 'fresh') side.token = fresh.token
      tx.set(ref, this.toFirestore(fresh))
      return fresh
    })
    await this.syncOpen(side)
    return companion
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

    let view = null
    const result = await this.db.runTransaction(async (tx) => {
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
      view = decision.view || null
      return decision.result
    })
    if (view) await this.liveRepository?.apply(view)
    return result
  }

  /**
   * Publishes a new pairing token to RTDB after the Firestore transaction.
   * Reusing a paired token must not reset the task the phone is showing.
   *
   * @param {{ kind: string, releaseToken?: string|null, token?: string|null, uid?: string }|null} side
   * @returns {Promise<void>}
   */
  async syncOpen(side) {
    if (!this.liveRepository || !side?.token || !side.uid) return
    if (side.kind === 'reuse') {
      await this.liveRepository.claim(side.token, side.uid)
      await this.liveRepository.apply({
        token: side.token,
        payload: { state: PUBLIC_COMPANION_STATE.WAITING },
        live: { reason: 'create' },
      })
      return
    }
    if (side.releaseToken) await this.liveRepository.remove(side.releaseToken)
    await this.liveRepository.claim(side.token, side.uid)
    await this.liveRepository.apply({
      token: side.token,
      payload: { state: PUBLIC_COMPANION_STATE.WAITING },
      live: { reason: 'create' },
    })
  }
}
