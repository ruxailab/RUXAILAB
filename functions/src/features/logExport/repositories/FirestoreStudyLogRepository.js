import { admin } from '../../../core/firebase/index.js'
import { fail } from '../../../core/errors.js'

const EQUALITY_FILTERS = ['participantLabel', 'eventType', 'level', 'source']
// Firestore reports a missing composite index as FAILED_PRECONDITION (9).
const FAILED_PRECONDITION = 9

/**
 * Read access to `tests/{studyId}/logs`, using the same filters, order and
 * indexes as the browser Log Explorer (`src/shared/services/studyLogQuery.js`).
 */
export class FirestoreStudyLogRepository {
  /**
   * @param {FirebaseFirestore.Firestore} db
   */
  constructor(db) {
    this.db = db
  }

  filteredQuery(studyId, filters) {
    let query = this.db.collection('tests').doc(studyId).collection('logs')
    for (const field of EQUALITY_FILTERS) {
      if (filters[field]) query = query.where(field, '==', filters[field])
    }
    if (filters.occurredFrom) {
      query = query.where('occurredAt', '>=', filters.occurredFrom)
    }
    if (filters.occurredBefore) {
      query = query.where('occurredAt', '<', filters.occurredBefore)
    }
    return query
  }

  async run(promise) {
    try {
      return await promise
    } catch (error) {
      if (error?.code === FAILED_PRECONDITION) {
        fail(
          'failed-precondition',
          'This filter combination needs a Firestore index that is not deployed',
        )
      }
      throw error
    }
  }

  /**
   * @param {object} params
   * @param {string} params.studyId
   * @param {object} params.filters Parsed export filters.
   * @returns {Promise<number>}
   */
  async count({ studyId, filters }) {
    const snapshot = await this.run(
      this.filteredQuery(studyId, filters).count().get(),
    )
    return snapshot.data().count
  }

  /**
   * Newest occurrence first, with the document ID as a stable tie-breaker.
   *
   * @param {object} params
   * @param {string} params.studyId
   * @param {object} params.filters Parsed export filters.
   * @param {number} params.pageSize
   * @param {{ seconds: number, nanoseconds: number, id: string }|null} [params.after]
   * @returns {Promise<{
   *   events: object[],
   *   next: { seconds: number, nanoseconds: number, id: string }|null,
   * }>}
   */
  async getPage({ studyId, filters, pageSize, after = null }) {
    let query = this.filteredQuery(studyId, filters)
      .orderBy('occurredAt', 'desc')
      .orderBy(admin.firestore.FieldPath.documentId(), 'desc')
    if (after) {
      query = query.startAfter(
        new admin.firestore.Timestamp(after.seconds, after.nanoseconds),
        after.id,
      )
    }
    const snapshot = await this.run(query.limit(pageSize + 1).get())
    const documents = snapshot.docs.slice(0, pageSize)
    const last = documents.at(-1)
    const lastOccurredAt = last?.get('occurredAt')
    return {
      events: documents.map((document) => document.data()),
      next:
        snapshot.docs.length > pageSize && lastOccurredAt
          ? {
              seconds: lastOccurredAt.seconds,
              nanoseconds: lastOccurredAt.nanoseconds,
              id: last.id,
            }
          : null,
    }
  }
}
