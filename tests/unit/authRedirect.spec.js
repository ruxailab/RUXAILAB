import {
  buildSignInPath,
  isSafeInternalPath,
  isSignInPath,
  resolvePostSignInPath,
} from '@/shared/utils/authRedirect'

describe('auth redirect', () => {
  describe('isSafeInternalPath', () => {
    it('accepts a same-origin path', () => {
      expect(isSafeInternalPath('/testview/study-1')).toBe(true)
      expect(isSafeInternalPath('/testview/study-1?inviteToken=abc')).toBe(true)
    })

    it('rejects anything that could leave the site', () => {
      // Every one of these is read as another host by some browser.
      expect(isSafeInternalPath('https://evil.example.com')).toBe(false)
      expect(isSafeInternalPath('//evil.example.com')).toBe(false)
      expect(isSafeInternalPath('/\\evil.example.com')).toBe(false)
      expect(isSafeInternalPath('/testview\\@evil.example.com')).toBe(false)
    })

    it('rejects values that are not a path at all', () => {
      expect(isSafeInternalPath('testview/study-1')).toBe(false)
      expect(isSafeInternalPath('')).toBe(false)
      expect(isSafeInternalPath(undefined)).toBe(false)
      expect(isSafeInternalPath(null)).toBe(false)
      expect(isSafeInternalPath(42)).toBe(false)
    })
  })

  describe('buildSignInPath', () => {
    it('remembers where the visitor was heading', () => {
      expect(buildSignInPath('/testview/study-1')).toBe(
        '/signin?redirect=%2Ftestview%2Fstudy-1',
      )
    })

    it('keeps the query of the remembered path', () => {
      expect(buildSignInPath('/testview/study-1?inviteToken=abc')).toBe(
        '/signin?redirect=%2Ftestview%2Fstudy-1%3FinviteToken%3Dabc',
      )
    })

    it('remembers nothing when the path could leave the site', () => {
      expect(buildSignInPath('https://evil.example.com')).toBe('/signin')
      expect(buildSignInPath('//evil.example.com')).toBe('/signin')
      expect(buildSignInPath('')).toBe('/signin')
    })

    it('does not send the sign-in screen back to itself', () => {
      expect(buildSignInPath('/signin')).toBe('/signin')
      expect(buildSignInPath('/signin?redirect=%2Fadmin')).toBe('/signin')
    })
  })

  describe('isSignInPath', () => {
    it('recognises the sign-in screen with or without a query', () => {
      expect(isSignInPath('/signin')).toBe(true)
      expect(isSignInPath('/signin?redirect=%2Ftestview%2Fstudy-1')).toBe(true)
    })

    it('does not mistake other pages for it', () => {
      expect(isSignInPath('/signup')).toBe(false)
      expect(isSignInPath('/admin')).toBe(false)
      expect(isSignInPath(null)).toBe(false)
    })
  })

  describe('resolvePostSignInPath', () => {
    it('replays the remembered path', () => {
      expect(resolvePostSignInPath({ redirect: '/testview/study-1' })).toBe(
        '/testview/study-1',
      )
    })

    it('falls back when nothing was remembered', () => {
      expect(resolvePostSignInPath({})).toBe('/admin')
      expect(resolvePostSignInPath()).toBe('/admin')
    })

    it('falls back rather than following a path off the site', () => {
      expect(
        resolvePostSignInPath({ redirect: 'https://evil.example.com' }),
      ).toBe('/admin')
      expect(resolvePostSignInPath({ redirect: '//evil.example.com' })).toBe(
        '/admin',
      )
    })

    it('falls back rather than looping on the sign-in screen', () => {
      expect(resolvePostSignInPath({ redirect: '/signin' })).toBe('/admin')
    })

    it('uses the first value when the query repeats the parameter', () => {
      expect(
        resolvePostSignInPath({ redirect: ['/testview/study-1', '/admin'] }),
      ).toBe('/testview/study-1')
    })

    it('honours a caller supplied fallback', () => {
      expect(resolvePostSignInPath({}, '/dashboard')).toBe('/dashboard')
    })
  })
})
