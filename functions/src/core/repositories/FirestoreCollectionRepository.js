import {
  identityFromFirestore,
  identityToFirestore,
} from './firestoreMappers.js'

/**
 * Thin Firestore collection CRUD used by shared and feature repositories.
 * Optionally maps documents to/from domain models via fromFirestore / toFirestore.
 *
 * @template T
 */
export class FirestoreCollectionRepository {
  /**
   * @param {string} collectionName
   * @param {FirebaseFirestore.Firestore} db
   * @param {(data: object, id: string) => T} [fromFirestore]
   * @param {(item: T) => object} [toFirestore]
   */
  constructor(collectionName, db, fromFirestore, toFirestore) {
    this.db = db
    this.collectionRef = db.collection(collectionName)
    this.fromFirestore = fromFirestore || identityFromFirestore
    this.toFirestore = toFirestore || identityToFirestore
  }

  /**
   * @param {string} id
   * @returns {FirebaseFirestore.DocumentReference}
   */
  doc(id) {
    return this.collectionRef.doc(id)
  }

  /**
   * @param {string} id
   * @returns {Promise<T | null>}
   */
  async get(id) {
    const snap = await this.doc(id).get()
    if (!snap.exists) return null
    return this.fromFirestore(snap.data(), snap.id)
  }

  /**
   * @param {T} item
   * @returns {Promise<string>} created document id
   */
  async create(item) {
    const ref = await this.collectionRef.add(this.toFirestore(item))
    return ref.id
  }

  /**
   * @param {string} id
   * @param {T} item
   * @param {FirebaseFirestore.SetOptions} [options]
   * @returns {Promise<void>}
   */
  async set(id, item, options = { merge: true }) {
    await this.doc(id).set(this.toFirestore(item), options)
  }

  /**
   * Partial field update (plain Firestore payload; not mapped through the model).
   *
   * @param {string} id
   * @param {object} data
   * @returns {Promise<void>}
   */
  async update(id, data) {
    await this.doc(id).update(data)
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    await this.doc(id).delete()
  }

  /**
   * Delete many documents via Firestore writeBatch (max 500 ops per commit).
   *
   * @param {string[]} ids
   * @returns {Promise<number>} number of ids submitted for delete
   */
  async deleteMany(ids) {
    const uniqueIds = [...new Set((ids || []).filter(Boolean).map(String))]
    const CHUNK = 450
    for (let i = 0; i < uniqueIds.length; i += CHUNK) {
      const chunk = uniqueIds.slice(i, i + CHUNK)
      const batch = this.db.batch()
      for (const id of chunk) {
        batch.delete(this.doc(id))
      }
      await batch.commit()
    }
    return uniqueIds.length
  }
}
