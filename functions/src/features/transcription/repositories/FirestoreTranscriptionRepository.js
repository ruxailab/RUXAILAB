import { FirestoreCollectionRepository } from '../../../core/repositories/FirestoreCollectionRepository.js'
import { toMillis } from '../../../core/utils/index.js'
import { Transcription } from '../models/Transcription.js'

/**
 * Persistence for moderated-task transcription documents.
 *
 * @extends {FirestoreCollectionRepository<Transcription>}
 */
export class FirestoreTranscriptionRepository extends FirestoreCollectionRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   */
  constructor(db) {
    super(
      'transcriptions',
      db,
      (data, id) => Transcription.fromFirestore(data, id),
      (item) => item.toFirestore(),
    )
  }

  /**
   * List transcriptions for a specific answer/user/task, newest first.
   *
   * @param {string} answersDocId
   * @param {string} userDocId
   * @param {string|number} taskId
   * @returns {Promise<Transcription[]>}
   */
  async listByAnswerUserTask(answersDocId, userDocId, taskId) {
    const snap = await this.collectionRef
      .where('answersDocId', '==', answersDocId)
      .where('userDocId', '==', userDocId)
      .where('taskId', '==', String(taskId))
      .get()

    const items = snap.docs.map((doc) => this.fromFirestore(doc.data(), doc.id))
    items.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
    return items
  }
}
