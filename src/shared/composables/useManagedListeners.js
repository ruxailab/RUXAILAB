/**
 * Composable and factory for managed event listeners with optional cleanup callbacks.
 * Ensures the same handler reference is used for add/remove so removeEventListener works.
 * Use from Composition API via useManagedListeners(), or from Options API via createManagedListeners().
 */

/**
 * Creates a managed listeners controller. Use this from Options API (e.g. in data() or created()).
 * @returns {{ addListeners: (entries: Array<{target: EventTarget, event: string, handler: Function}>) => void, removeListeners: () => void, addCleanup: (fn: () => void) => void }}
 */
export function createManagedListeners() {
  const entries = []
  const cleanups = []

  return {
    addListeners(newEntries) {
      if (!Array.isArray(newEntries)) return
      for (const { target, event, handler } of newEntries) {
        if (target && event && typeof handler === 'function') {
          target.addEventListener(event, handler)
          entries.push({ target, event, handler })
        }
      }
    },
    removeListeners() {
      for (const { target, event, handler } of entries) {
        try {
          target.removeEventListener(event, handler)
        } catch {
          // target may already be detached
        }
      }
      entries.length = 0
      for (const fn of cleanups) {
        try {
          fn()
        } catch (e) {
          // eslint-disable-next-line no-console -- intentional for cleanup error reporting
          console.warn('[useManagedListeners] cleanup error:', e)
        }
      }
      cleanups.length = 0
    },
    addCleanup(fn) {
      if (typeof fn === 'function') cleanups.push(fn)
    },
  }
}

/**
 * Composable for managed event listeners. Use from Composition API (setup).
 * @returns {{ addListeners: Function, removeListeners: Function, addCleanup: Function }}
 */
export function useManagedListeners() {
  return createManagedListeners()
}
