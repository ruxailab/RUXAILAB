import {
  canTrackBrowserSession,
  endBrowserSession,
  isBrowserSessionAlive,
  isSessionScoped,
  startBrowserSession,
} from '@/shared/utils/authSessionPersistence'

describe('authSessionPersistence', () => {
  beforeEach(() => {
    endBrowserSession()
    localStorage.clear()
  })

  it('reports no browser session before one is started', () => {
    expect(isBrowserSessionAlive()).toBe(false)
    expect(isSessionScoped()).toBe(false)
  })

  it('marks the sign-in as session scoped and cookies the browser session', () => {
    expect(startBrowserSession()).toBe(true)

    expect(document.cookie).toContain('ruxailab_browser_session=1')
    expect(isBrowserSessionAlive()).toBe(true)
    expect(isSessionScoped()).toBe(true)
  })

  it('keeps the session scoped for a second tab of the same browser', () => {
    startBrowserSession()

    // A new tab reads the same cookie jar and the same localStorage, so the
    // sign-in stays valid instead of being asked for again.
    expect(isSessionScoped()).toBe(true)
    expect(isBrowserSessionAlive()).toBe(true)
  })

  it('treats a dropped cookie as the end of the browser session', () => {
    startBrowserSession()

    // Closing the browser is what deletes a cookie with no expiry date.
    document.cookie = 'ruxailab_browser_session=; path=/; max-age=0'

    expect(isBrowserSessionAlive()).toBe(false)
    expect(isSessionScoped()).toBe(true)
  })

  it('clears both markers when the session ends', () => {
    startBrowserSession()

    endBrowserSession()

    expect(isBrowserSessionAlive()).toBe(false)
    expect(isSessionScoped()).toBe(false)
  })

  it('reports failure and leaves no marker when cookies are blocked', () => {
    const cookie = jest
      .spyOn(document, 'cookie', 'set')
      .mockImplementation(() => {})

    expect(startBrowserSession()).toBe(false)
    expect(isSessionScoped()).toBe(false)

    cookie.mockRestore()
  })

  it('reports failure and drops the cookie when storage is blocked', () => {
    const setItem = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('storage disabled')
      })

    expect(startBrowserSession()).toBe(false)

    setItem.mockRestore()

    expect(isBrowserSessionAlive()).toBe(false)
    expect(isSessionScoped()).toBe(false)
  })

  it('can track the browser session when cookies and storage work', () => {
    expect(canTrackBrowserSession()).toBe(true)

    // Probing must not leave anything behind or mark the sign-in itself.
    expect(document.cookie).not.toContain('probe')
    expect(isSessionScoped()).toBe(false)
  })

  it('keeps an existing session marker while probing', () => {
    startBrowserSession()

    expect(canTrackBrowserSession()).toBe(true)
    expect(isSessionScoped()).toBe(true)
    expect(isBrowserSessionAlive()).toBe(true)
  })

  it('cannot track the browser session when cookies are blocked', () => {
    const cookie = jest
      .spyOn(document, 'cookie', 'set')
      .mockImplementation(() => {})

    expect(canTrackBrowserSession()).toBe(false)

    cookie.mockRestore()
  })

  it('cannot track the browser session when storage is blocked', () => {
    const setItem = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('storage disabled')
      })

    expect(canTrackBrowserSession()).toBe(false)

    setItem.mockRestore()
  })

  it('reports no session scope when storage cannot be read', () => {
    const getItem = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('storage disabled')
      })

    expect(isSessionScoped()).toBe(false)

    getItem.mockRestore()
  })
})
