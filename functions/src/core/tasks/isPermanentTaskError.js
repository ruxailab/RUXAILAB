import { AppError } from '../errors.js'

const PERMANENT_CODES = new Set([
  'invalid-argument',
  'not-found',
  'permission-denied',
  'failed-precondition',
  'unauthenticated',
  'already-exists',
])

/**
 * Errors that will not succeed on a Cloud Tasks retry.
 *
 * @param {unknown} err
 * @returns {boolean}
 */
export function isPermanentTaskError(err) {
  return err instanceof AppError && PERMANENT_CODES.has(err.code)
}
