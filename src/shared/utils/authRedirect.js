/**
 * Helpers for sending a visitor to sign in and bringing them back afterwards.
 *
 * A study link is usually the first RUXAILAB page a participant ever opens, so
 * losing it at the sign-in screen costs them the invitation they were sent.
 * The path they asked for travels as a `redirect` query parameter and is
 * replayed once they are signed in.
 */

export const SIGN_IN_PATH = '/signin'
export const REDIRECT_QUERY_KEY = 'redirect'
export const DEFAULT_SIGNED_IN_PATH = '/admin'

/**
 * Whether a path can be safely replayed after sign-in.
 *
 * Only same-origin paths qualify: anything the browser could read as another
 * host would turn the sign-in screen into an open redirect.
 * @param {string} path - Candidate path
 * @returns {boolean}
 */
export const isSafeInternalPath = (path) => {
  if (typeof path !== 'string' || path.length === 0) return false
  if (!path.startsWith('/')) return false

  // "//host" and "/\host" are read as protocol-relative URLs by browsers.
  if (path.startsWith('//') || path.startsWith('/\\')) return false
  if (path.includes('\\')) return false

  return true
}

/**
 * Sign-in path that remembers where the visitor was heading.
 * @param {string} [redirectTo] - Path to return to after signing in
 * @returns {string}
 */
export const buildSignInPath = (redirectTo = '') => {
  if (!isSafeInternalPath(redirectTo)) return SIGN_IN_PATH

  // Coming back to the sign-in screen would only loop.
  if (redirectTo.split('?')[0] === SIGN_IN_PATH) return SIGN_IN_PATH

  return `${SIGN_IN_PATH}?${REDIRECT_QUERY_KEY}=${encodeURIComponent(redirectTo)}`
}

/**
 * Whether a destination is the sign-in screen.
 *
 * Being asked to sign in is not an access denial, and the two are reported to
 * the participant differently.
 * @param {string} path - Destination path
 * @returns {boolean}
 */
export const isSignInPath = (path) =>
  typeof path === 'string' && path.split('?')[0] === SIGN_IN_PATH

/**
 * Where to send a freshly signed-in user.
 * @param {Object} [query] - Route query holding the remembered path
 * @param {string} [fallback] - Used when nothing safe was remembered
 * @returns {string}
 */
export const resolvePostSignInPath = (
  query = {},
  fallback = DEFAULT_SIGNED_IN_PATH,
) => {
  const requested = query?.[REDIRECT_QUERY_KEY]
  const path = Array.isArray(requested) ? requested[0] : requested

  if (!isSafeInternalPath(path)) return fallback
  if (isSignInPath(path)) return fallback

  return path
}
