/**
 * Thin Realtime Database CRUD used by feature repositories.
 * The collection path is fixed; each child id is supplied per call.
 *
 * @template T
 */
export class RtdbCollectionRepository {
  /**
   * @param {string} collectionPath root path, e.g. `mobileTaskPresence`
   * @param {{ ref: (path: string) => {
   *   get: () => Promise<{ exists: () => boolean, val: () => unknown }>,
   *   set: (value: unknown) => Promise<unknown>,
   *   update: (value: object) => Promise<unknown>,
   *   remove: () => Promise<unknown>,
   * } }|null} [rtdb]
   * @param {(data: object, id: string) => T} [fromRtdb]
   * @param {(item: T) => object} [toRtdb]
   */
  constructor(collectionPath, rtdb = null, fromRtdb, toRtdb) {
    this.collectionPath = collectionPath
    this.rtdb = rtdb
    this.fromRtdb = fromRtdb || identityFromRtdb
    this.toRtdb = toRtdb || identityToRtdb
  }

  /**
   * @param {string} id
   * @returns {{
   *   get: () => Promise<{ exists: () => boolean, val: () => unknown }>,
   *   set: (value: unknown) => Promise<unknown>,
   *   update: (value: object) => Promise<unknown>,
   *   remove: () => Promise<unknown>,
   * }|null}
   */
  ref(id) {
    if (!this.rtdb || !childIdIsSafe(id)) return null
    return this.rtdb.ref(`${this.collectionPath}/${id}`)
  }

  /**
   * @param {string} id
   * @returns {Promise<T | null>}
   */
  async get(id) {
    const node = this.ref(id)
    if (!node) return null
    const snap = await node.get()
    if (!snap.exists()) return null
    return this.fromRtdb(snap.val() || {}, id)
  }

  /**
   * @param {string} id
   * @param {T} item
   * @returns {Promise<void>}
   */
  async set(id, item) {
    const node = this.ref(id)
    if (!node) return
    await node.set(this.toRtdb(item))
  }

  /**
   * @param {string} id
   * @param {object} data
   * @returns {Promise<void>}
   */
  async update(id, data) {
    const node = this.ref(id)
    if (!node) return
    await node.update(data)
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    const node = this.ref(id)
    if (!node) return
    await node.remove()
  }
}

/**
 * @param {unknown} id
 * @returns {boolean}
 */
function childIdIsSafe(id) {
  return typeof id === 'string' && id.length > 0 && !id.includes('/')
}

/**
 * @param {object} data
 * @param {string} id
 * @returns {{ id: string } & object}
 */
function identityFromRtdb(data, id) {
  return { id, ...(data && typeof data === 'object' ? data : {}) }
}

/**
 * @template T
 * @param {T} item
 * @returns {object}
 */
function identityToRtdb(item) {
  if (item == null || typeof item !== 'object') return item
  const { id: _id, ...rest } = item
  return rest
}
