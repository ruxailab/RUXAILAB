/**
 * Browser-session helpers backing the "Remember me" option.
 *
 * Firebase Auth ships two web persistences that survive a reload:
 * `browserLocalPersistence` (localStorage — shared by every tab, and kept when
 * the browser restarts) and `browserSessionPersistence` (sessionStorage —
 * private to the tab that signed in). Neither one matches what an unchecked
 * "Remember me" is expected to do: stay signed in across the tabs of the same
 * browser, then sign out once that browser is closed.
 *
 * These helpers rebuild that behaviour on the primitive the convention is built
 * on — a cookie with no expiry date. A session-scoped sign-in keeps its auth
 * state in localStorage so every tab shares it, and drops a session cookie
 * alongside it. Browsers delete that cookie when they shut down, so its absence
 * on the next start is what tells us the browser session ended and the sign-in
 * has to be dropped.
 */

const SESSION_COOKIE = 'ruxailab_browser_session'
const PROBE_COOKIE = 'ruxailab_browser_session_probe'
const SESSION_SCOPED_KEY = 'ruxailab.auth.session-scoped'
const PROBE_KEY = 'ruxailab.auth.session-probe'

const cookieAttributes = () => {
  const attributes = ['path=/', 'SameSite=Lax']

  if (window.location?.protocol === 'https:') attributes.push('Secure')

  return attributes.join('; ')
}

const hasCookie = (name) =>
  document.cookie.split('; ').some((cookie) => cookie.startsWith(`${name}=`))

const setCookie = (name) => {
  document.cookie = `${name}=1; ${cookieAttributes()}`
}

const deleteCookie = (name) => {
  document.cookie = `${name}=; ${cookieAttributes()}; max-age=0`
}

/**
 * Whether the browser still holds the session cookie written at sign-in.
 * @returns {boolean}
 */
export const isBrowserSessionAlive = () => {
  try {
    return hasCookie(SESSION_COOKIE)
  } catch {
    return false
  }
}

/**
 * Whether the stored sign-in was made without "Remember me" and therefore
 * lasts only as long as the browser session.
 * @returns {boolean}
 */
export const isSessionScoped = () => {
  try {
    return localStorage.getItem(SESSION_SCOPED_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Whether this browser lets us tell a second tab apart from a restarted
 * browser, which takes both a cookie the browser drops on exit and storage to
 * remember that the sign-in depends on it.
 * @returns {boolean}
 */
export const canTrackBrowserSession = () => {
  try {
    setCookie(PROBE_COOKIE)

    if (!hasCookie(PROBE_COOKIE)) return false

    deleteCookie(PROBE_COOKIE)
  } catch {
    return false
  }

  try {
    localStorage.setItem(PROBE_KEY, 'true')
    localStorage.removeItem(PROBE_KEY)
  } catch {
    return false
  }

  return true
}

/**
 * Clears both markers, leaving the sign-in unscoped.
 * @returns {void}
 */
export const endBrowserSession = () => {
  try {
    deleteCookie(SESSION_COOKIE)
  } catch {
    // Cookies are unavailable, so there is nothing to clear.
  }

  try {
    localStorage.removeItem(SESSION_SCOPED_KEY)
  } catch {
    // Storage is unavailable, so there is nothing to clear.
  }
}

/**
 * Marks the sign-in as lasting only for the current browser session.
 *
 * Both markers are needed to expire the sign-in later, so the session only
 * counts as started once the cookie is actually accepted by the browser.
 * @returns {boolean} - Whether the browser session could be tracked
 */
export const startBrowserSession = () => {
  try {
    setCookie(SESSION_COOKIE)
  } catch {
    return false
  }

  if (!isBrowserSessionAlive()) return false

  try {
    localStorage.setItem(SESSION_SCOPED_KEY, 'true')
  } catch {
    endBrowserSession()
    return false
  }

  return true
}
