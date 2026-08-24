import {
  identityFromFirestore,
  identityToFirestore,
} from './firestoreMappers.js'

/**
 * Thin Firestore single-document CRUD used by feature repositories.
 * Targets a fixed document path (including nested paths).
 *
 * @template T
 */
export class FirestoreDocumentRepository {
  /**
   * @param {string} documentPath Absolute document path, e.g. `answers/{id}/analytics/transcription`
   * @param {FirebaseFirestore.Firestore} db
   * @param {(data: object, id: string) => T} [fromFirestore]
   * @param {(item: T) => object} [toFirestore]
   */
  constructor(documentPath, db, fromFirestore, toFirestore) {
    this.db = db
    this.documentPath = documentPath
    this.docRef = db.doc(documentPath)
    this.fromFirestore = fromFirestore || identityFromFirestore
    this.toFirestore = toFirestore || identityToFirestore
  }

  /**
   * @returns {Promise<T | null>}
   */
  async get() {
    const snap = await this.docRef.get()
    if (!snap.exists) return null
    return this.fromFirestore(snap.data(), snap.id)
  }

  /**
   * Create or overwrite via merge set (same as update).
   *
   * @param {T} item
   * @returns {Promise<void>}
   */
  async create(item) {
    await this.update(item)
  }

  /**
   * Persist the entity with merge (mapped through toFirestore).
   *
   * @param {T} item
   * @returns {Promise<void>}
   */
  async update(item) {
    await this.docRef.set(this.toFirestore(item), { merge: true })
  }

  /**
   * Persist the entity (mapped through toFirestore).
   *
   * @param {T} item
   * @param {FirebaseFirestore.SetOptions} [options]
   * @returns {Promise<void>}
   */
  async set(item, options = { merge: true }) {
    await this.docRef.set(this.toFirestore(item), options)
  }

  /**
   * @returns {Promise<void>}
   */
  async delete() {
    await this.docRef.delete()
  }
}
