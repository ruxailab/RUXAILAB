import {
  identityFromFirestore,
  identityToFirestore,
} from './firestoreMappers.js'

/**
 * Thin Firestore nested-collection CRUD used by feature repositories.
 * The parent document id is supplied per call; the subcollection name is fixed.
 *
 * @template T
 */
export class FirestoreSubcollectionRepository {
  /**
   * @param {string} parentCollection
   * @param {string} subcollectionName
   * @param {FirebaseFirestore.Firestore} db
   * @param {(data: object, id: string, parentId: string) => T} [fromFirestore]
   * @param {(item: T) => object} [toFirestore]
   */
  constructor(
    parentCollection,
    subcollectionName,
    db,
    fromFirestore,
    toFirestore,
  ) {
    this.db = db
    this.parentCollection = parentCollection
    this.subcollectionName = subcollectionName
    this.fromFirestore = fromFirestore || identityFromFirestore
    this.toFirestore = toFirestore || identityToFirestore
  }

  /**
   * @param {string} parentId
   * @returns {FirebaseFirestore.CollectionReference}
   */
  collection(parentId) {
    return this.db
      .collection(this.parentCollection)
      .doc(parentId)
      .collection(this.subcollectionName)
  }

  /**
   * @param {string} parentId
   * @param {string} id
   * @returns {FirebaseFirestore.DocumentReference}
   */
  doc(parentId, id) {
    return this.collection(parentId).doc(id)
  }

  /**
   * @param {string} parentId
   * @param {string} id
   * @returns {Promise<T | null>}
   */
  async get(parentId, id) {
    const snap = await this.doc(parentId, id).get()
    if (!snap.exists) return null
    return this.fromFirestore(snap.data(), snap.id, parentId)
  }

  /**
   * @param {string} parentId
   * @param {T} item
   * @returns {Promise<string>} created document id
   */
  async create(parentId, item) {
    const ref = await this.collection(parentId).add(this.toFirestore(item))
    return ref.id
  }

  /**
   * @param {string} parentId
   * @param {string} id
   * @param {T} item
   * @param {FirebaseFirestore.SetOptions} [options]
   * @returns {Promise<void>}
   */
  async set(parentId, id, item, options = { merge: true }) {
    await this.doc(parentId, id).set(this.toFirestore(item), options)
  }

  /**
   * Partial field update (plain Firestore payload; not mapped through the model).
   *
   * @param {string} parentId
   * @param {string} id
   * @param {object} data
   * @returns {Promise<void>}
   */
  async update(parentId, id, data) {
    await this.doc(parentId, id).update(data)
  }

  /**
   * @param {string} parentId
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(parentId, id) {
    await this.doc(parentId, id).delete()
  }
}
