import { FirestoreCollectionRepository } from '../../core/repositories/FirestoreCollectionRepository.js'
import { Sentiment } from '../models/Sentiment.js'

/**
 * Persistence for per-user/per-task sentiment documents.
 *
 * @extends {FirestoreCollectionRepository<Sentiment>}
 */
export class FirestoreSentimentRepository extends FirestoreCollectionRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   */
  constructor(db) {
    super(
      'sentiment',
      db,
      (data, id) => Sentiment.fromFirestore(data, id),
      (item) => item.toFirestore(),
    )
  }

  /**
   * @param {string} answersDocId
   * @returns {Promise<Sentiment[]>}
   */
  async listByAnswersDocId(answersDocId) {
    const snap = await this.collectionRef
      .where('answersDocId', '==', answersDocId)
      .get()

    return snap.docs.map((docSnap) => this.fromFirestore(docSnap.data(), docSnap.id))
  }

  /**
   * List all sentiment documents for a specific answer document and user.
   *
   * @param {string} answersDocId
   * @param {string} userDocId
   * @returns {Promise<Sentiment[]>}
   */
  async listByAnswerUser(answersDocId, userDocId) {
    const snap = await this.collectionRef
      .where('answersDocId', '==', answersDocId)
      .where('userDocId', '==', userDocId)
      .get()

    return snap.docs.map((docSnap) =>
      this.fromFirestore(docSnap.data(), docSnap.id),
    )
  }

  /**
   * Writes one signal onto the shared sentiment document.
   * Parallel facial and text jobs read the same task before either pointer
   * exists, so the id is deterministic and the write is transactional.
   *
   * @param {object} params
   * @param {{ doc: (id: string) => FirebaseFirestore.DocumentReference }} params.answerRepository
   * @param {string} params.answersDocId
   * @param {string} params.userDocId
   * @param {string|number} params.taskId
   * @param {'facial'|'text'} params.side
   * @param {object} params.payload
   * @param {unknown} params.updatedAt
   * @returns {Promise<Sentiment>}
   */
  async upsertSide({
    answerRepository,
    answersDocId,
    userDocId,
    taskId,
    side,
    payload,
    updatedAt,
  }) {
    const normalizedTaskId = String(taskId)
    const canonicalId = Sentiment.documentId(
      answersDocId,
      userDocId,
      normalizedTaskId,
    )
    const pointerField = `taskAnswers.${userDocId}.tasks.${normalizedTaskId}.sentimentDocId`

    return this.db.runTransaction(async (transaction) => {
      const answerRef = answerRepository.doc(answersDocId)
      const answerSnap = await transaction.get(answerRef)
      const answerData = answerSnap.exists ? answerSnap.data() || {} : {}
      const pointedId =
        answerData?.taskAnswers?.[userDocId]?.tasks?.[normalizedTaskId]
          ?.sentimentDocId || null
      const sentimentId = pointedId || canonicalId

      const sentimentRef = this.doc(sentimentId)
      const sentimentSnap = await transaction.get(sentimentRef)
      const current = sentimentSnap.exists
        ? this.fromFirestore(sentimentSnap.data(), sentimentSnap.id)
        : Sentiment.create({
            id: sentimentId,
            answersDocId,
            userDocId,
            taskId: normalizedTaskId,
            facial: null,
            text: null,
            createdAt: updatedAt,
            updatedAt,
          })

      const next =
        side === 'text'
          ? current.withText(payload, updatedAt)
          : current.withFacial(payload, updatedAt)

      transaction.set(sentimentRef, this.toFirestore(next))
      if (pointedId !== sentimentId) {
        transaction.update(answerRef, { [pointerField]: sentimentId })
      }

      return next.withId(sentimentId)
    })
  }
}
