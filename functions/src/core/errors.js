/**
 * Application/domain error with a Firebase Callable-compatible code.
 * Mapped to functions.https.HttpsError in the interface layer via toHttpsError.
 */
export class AppError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}

/**
 * @param {string} code Firebase HttpsError-compatible code
 * @param {string} message
 * @returns {never}
 */
export const fail = (code, message) => {
  throw new AppError(code, message)
}

/**
 * Maps unknown errors to Firebase Callable HttpsError.
 *
 * @param {unknown} err
 * @param {typeof import('firebase-functions/v2')} functions
 * @param {string} [fallbackMessage]
 * @returns {import('firebase-functions/v2').https.HttpsError}
 */
export function toHttpsError(
  err,
  functions,
  fallbackMessage = 'Internal error',
) {
  if (err instanceof functions.https.HttpsError) return err
  if (err instanceof AppError) {
    return new functions.https.HttpsError(err.code, err.message)
  }
  return new functions.https.HttpsError(
    'internal',
    err?.message || fallbackMessage,
  )
}
