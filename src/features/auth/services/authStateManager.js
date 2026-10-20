/**
 * Centralised Firebase Auth state manager.
 *
 * A single `onIdTokenChanged` listener is kept alive for the lifetime of the
 * application so that:
 *
 * 1. The very first auth state emitted by Firebase (which includes rehydrating
 *    a persisted session from IndexedDB) is captured reliably.
 * 2. Subsequent changes (token refresh transitions, explicit sign-outs in other
 *    tabs, session expiry) are detected immediately and forwarded to the Vuex
 *    store through a registered callback.
 *
 * No second auth state listener should be registered anywhere in `src`.
 */
import { onIdTokenChanged } from 'firebase/auth'
import { auth } from '@/app/plugins/firebase'

/** @type {import('firebase/auth').User | null | undefined} */
let _currentFirebaseUser

/** @type {((user: import('firebase/auth').User | null) => void) | null} */
let _onStateChange = null

let _initialAuthPromise = null

/**
 * Initializes and registers the single persistent onIdTokenChanged listener.
 * Safe to call multiple times; only one listener is ever registered.
 *
 * @param {((user: import('firebase/auth').User | null) => void) | null} [onStateChange]
 *   Callback invoked on every subsequent auth-state change after initial resolution.
 * @returns {Promise<import('firebase/auth').User | null>}
 */
export function initAuthListener(onStateChange = null) {
  if (onStateChange) {
    _onStateChange = onStateChange
  }

  if (!_initialAuthPromise) {
    _initialAuthPromise = new Promise((resolve) => {
      onIdTokenChanged(
        auth,
        (user) => {
          const isFirstResolution = _currentFirebaseUser === undefined
          _currentFirebaseUser = user
          resolve(user)

          if (!isFirstResolution && _onStateChange) {
            _onStateChange(user)
          }
        },
        () => {
          _currentFirebaseUser = null
          resolve(null)
        },
      )
    })
  }

  return _initialAuthPromise
}

/**
 * Await the resolution of the initial Firebase auth state.
 *
 * @returns {Promise<import('firebase/auth').User | null>}
 */
export function waitForInitialAuth() {
  if (_currentFirebaseUser !== undefined) {
    return Promise.resolve(_currentFirebaseUser)
  }
  return initAuthListener()
}

/**
 * Synchronous access to the last-known Firebase Auth user. Returns
 * `undefined` if the listener hasn't fired yet.
 *
 * @returns {import('firebase/auth').User | null | undefined}
 */
export function getFirebaseUser() {
  return _currentFirebaseUser
}

/**
 * Reset internal state for isolated unit testing.
 */
export function _resetForTesting() {
  _currentFirebaseUser = undefined
  _onStateChange = null
  _initialAuthPromise = null
}
