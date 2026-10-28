import { RtdbCollectionRepository } from '../../../core/repositories/RtdbCollectionRepository.js'
import { COMPANION_TOKEN_PATTERN } from '../models/MobileTaskCompanion.js'

/**
 * Live phone channel at mobileTaskLive/{token}.
 * The desktop writes task changes here directly. The phone writes `connected`
 * on the same node. Cloud Functions mirror the public view afterwards and
 * must not replace a newer task the desktop already published, or drop
 * presence the phone already set.
 *
 * mobileTaskOwners/{token} stores the participant uid. Only that account can
 * write the task fields. The Admin SDK bypasses those rules.
 */
export class RtdbMobileTaskLiveRepository {
  /**
   * @param {{ ref: Function }|null} [rtdb]
   */
  constructor(rtdb = null) {
    this.rtdb = rtdb
    this.owners = new RtdbCollectionRepository('mobileTaskOwners', rtdb)
  }

  /**
   * @param {string} token
   * @param {string} uid
   * @returns {Promise<void>}
   */
  async claim(token, uid) {
    if (!this.ref(token) || typeof uid !== 'string' || uid.length === 0) return
    await this.owners.set(token, uid)
  }

  /**
   * @param {string} token
   * @returns {Promise<void>}
   */
  async remove(token) {
    const node = this.ref(token)
    if (!node) return
    await node.remove()
    await this.owners.delete(token)
  }

  /**
   * @param {{ token?: string, payload?: object, delete?: boolean, live?: { reason?: string, attemptId?: string|null } }|null|undefined} view
   * @returns {Promise<void>}
   */
  async apply(view) {
    const node = this.ref(view?.token)
    if (!node) return
    if (view.delete) {
      await this.remove(view.token)
      return
    }
    if (!view.payload) return

    const next = { ...view.payload, updatedAt: Date.now() }
    await node.transaction((current) => {
      if (!shouldWriteMobileTaskLive(current, view)) return undefined
      if (current?.connected === true) {
        return { ...next, connected: true }
      }
      return next
    })
  }

  /**
   * @param {string|null|undefined} token
   * @returns {object|null}
   */
  ref(token) {
    if (!this.rtdb || typeof token !== 'string' || !COMPANION_TOKEN_PATTERN.test(token)) {
      return null
    }
    return this.rtdb.ref(`mobileTaskLive/${token}`)
  }
}

/**
 * Server mirror policy. The desktop is the fast writer for navigation.
 * A late activate or outcome must not put an older task back on the phone.
 *
 * @param {object|null|undefined} current
 * @param {{ payload?: { state?: string }, live?: { reason?: string, attemptId?: string|null } }} view
 * @returns {boolean}
 */
export function shouldWriteMobileTaskLive(current, view) {
  const reason = view?.live?.reason
  const attemptId = view?.live?.attemptId || null
  if (!reason) return true
  if (reason === 'create') {
    return !current?.state || current.state === 'waiting'
  }
  if (reason === 'activate') {
    if (!current?.state || current.state === 'waiting' || current.state === 'accepted') {
      return true
    }
    return Boolean(attemptId) && current.attemptId === attemptId
  }
  if (reason === 'outcome') {
    if (!current?.state) return true
    if (current.state === 'completed') return false
    if (
      current.state === 'active' &&
      current.attemptId &&
      attemptId &&
      current.attemptId !== attemptId
    ) {
      return false
    }
    return true
  }
  if (reason === 'complete') {
    return Boolean(current?.state) && view?.payload?.state === 'completed'
  }
  return true
}
