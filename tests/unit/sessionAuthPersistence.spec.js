jest.mock('@/features/auth/controllers/AuthController')
jest.mock('@/features/auth/controllers/UserController')

const mockOnIdTokenChanged = jest.fn()
jest.mock('firebase/auth', () => ({
  onIdTokenChanged: (...args) => mockOnIdTokenChanged(...args),
  onAuthStateChanged: (...args) => mockOnIdTokenChanged(...args),
}))

jest.mock('@/app/plugins/firebase', () => ({
  auth: { currentUser: null },
}))

jest.mock('@/app/plugins/i18n', () => ({
  global: {
    t: (key) => key,
  },
}))

jest.mock('@/router/modules/public.js', () => [])
jest.mock('@/router/modules/admin.js', () => [])
jest.mock('@/router/modules/superAdmin.js', () => [])
jest.mock('@/ux/CardSorting/router.js', () => [])
jest.mock('@/ux/Heuristic/router.js', () => [])
jest.mock('@/ux/accessibility/router.js', () => [])
jest.mock('@/ux/UserTest/router.js', () => [])
jest.mock('@/ux/FocusGroup/router.js', () => [])

import AuthModule from '@/features/auth/store/Auth'
import AuthController from '@/features/auth/controllers/AuthController'
import UserController from '@/features/auth/controllers/UserController'
import {
  initAuthListener,
  waitForInitialAuth,
  _resetForTesting,
} from '@/features/auth/services/authStateManager'
import { beforeEachGuard } from '@/app/router'

describe('Session and Study Authentication Persistence (#2446)', () => {
  let commit
  let dispatch

  beforeEach(() => {
    jest.clearAllMocks()
    _resetForTesting()
    commit = jest.fn()
    dispatch = jest.fn()
  })

  describe('autoSignIn error resilience', () => {
    it('does not null the user when profile fetch encounters a transient network error', async () => {
      const mockFirebaseUser = {
        uid: 'user-123',
        emailVerified: true,
        isAnonymous: false,
      }
      AuthController.prototype.autoSignIn.mockResolvedValue(mockFirebaseUser)

      const mockDbUser = { id: 'user-123', email: 'test@example.com' }
      UserController.prototype.getById
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockDbUser)

      const result = await AuthModule.actions.autoSignIn({ commit, dispatch })

      expect(UserController.prototype.getById).toHaveBeenCalledTimes(2)
      expect(commit).toHaveBeenCalledWith('SET_USER', mockDbUser)
      expect(commit).not.toHaveBeenCalledWith('SET_USER', null)
      expect(result).toEqual(mockFirebaseUser)
    })

    it('does not retry when profile fetch returns permission-denied', async () => {
      const mockFirebaseUser = {
        uid: 'user-123',
        emailVerified: true,
        isAnonymous: false,
      }
      AuthController.prototype.autoSignIn.mockResolvedValue(mockFirebaseUser)

      const permError = new Error('Permission denied')
      permError.code = 'permission-denied'
      UserController.prototype.getById.mockRejectedValue(permError)

      const result = await AuthModule.actions.autoSignIn({ commit, dispatch })

      // Permanent error must NOT be retried
      expect(UserController.prototype.getById).toHaveBeenCalledTimes(1)
      expect(commit).not.toHaveBeenCalledWith('SET_USER', null)
      expect(result).toEqual(mockFirebaseUser)
    })

    it('leaves session valid and returns user if profile cannot be loaded after retry', async () => {
      const mockFirebaseUser = {
        uid: 'user-123',
        emailVerified: true,
        isAnonymous: false,
      }
      AuthController.prototype.autoSignIn.mockResolvedValue(mockFirebaseUser)

      UserController.prototype.getById.mockRejectedValue(
        new Error('Firestore down'),
      )

      const result = await AuthModule.actions.autoSignIn({ commit, dispatch })

      expect(UserController.prototype.getById).toHaveBeenCalledTimes(2)
      // Must NOT commit null user: the Firebase session is still valid
      expect(commit).not.toHaveBeenCalledWith('SET_USER', null)
      // Must commit a fallback user so router guards recognize authenticated session
      expect(commit).toHaveBeenCalledWith(
        'SET_USER',
        expect.objectContaining({
          id: 'user-123',
          accessLevel: 1,
          isFallback: true,
        }),
      )
      expect(result).toEqual(mockFirebaseUser)
    })

    it('preserves existing profile when profile reload fails after retry', async () => {
      const mockFirebaseUser = {
        uid: 'user-123',
        emailVerified: true,
        isAnonymous: false,
      }
      AuthController.prototype.autoSignIn.mockResolvedValue(mockFirebaseUser)

      UserController.prototype.getById.mockRejectedValue(
        new Error('Firestore down'),
      )

      const existingProfile = {
        id: 'user-123',
        accessLevel: 0,
        username: 'SuperAdmin',
      }
      const state = { user: existingProfile }

      const result = await AuthModule.actions.autoSignIn({
        commit,
        state,
        dispatch,
      })

      expect(UserController.prototype.getById).toHaveBeenCalledTimes(2)
      // Existing profile must NOT be overwritten by fallback
      expect(commit).not.toHaveBeenCalledWith('SET_USER', expect.anything())
      expect(result).toEqual(mockFirebaseUser)
    })

    it('returns the user immediately without profile lookup if anonymous', async () => {
      const mockAnonUser = {
        uid: 'anon-456',
        isAnonymous: true,
      }
      AuthController.prototype.autoSignIn.mockResolvedValue(mockAnonUser)

      const result = await AuthModule.actions.autoSignIn({ commit, dispatch })

      expect(UserController.prototype.getById).not.toHaveBeenCalled()
      expect(result).toEqual(mockAnonUser)
    })
  })

  describe('Centralised auth listener behaviour', () => {
    it('notifies onStateChange callback when Firebase user transitions', async () => {
      let authCallback = null
      mockOnIdTokenChanged.mockImplementation((_, cb) => {
        authCallback = cb
        return jest.fn()
      })

      const onStateChange = jest.fn()
      initAuthListener(onStateChange)

      // Initial resolution
      authCallback({ uid: 'user-init' })
      expect(onStateChange).not.toHaveBeenCalled()

      // Subsequent transition (e.g. token expired, sign-out in other tab)
      authCallback(null)
      expect(onStateChange).toHaveBeenCalledWith(null)
    })

    it('waitForInitialAuth resolves with cached user once initial auth is ready', async () => {
      mockOnIdTokenChanged.mockImplementation((_, cb) => {
        setTimeout(() => cb({ uid: 'cached-user' }), 0)
        return jest.fn()
      })

      const first = await waitForInitialAuth()
      expect(first).toEqual({ uid: 'cached-user' })

      // Second call must return resolved user without re-subscribing
      const second = await waitForInitialAuth()
      expect(second).toEqual({ uid: 'cached-user' })
    })
  })

  describe('Router guard timeout and auth readiness', () => {
    let mockNext

    beforeEach(() => {
      mockNext = jest.fn()
    })

    it('allows navigation when autoSignIn resolves authenticated user', async () => {
      const mockStore = {
        state: {
          Auth: { user: null },
        },
        dispatch: jest.fn().mockImplementation(async (action) => {
          if (action === 'autoSignIn') {
            const user = { uid: 'user-ready', accessLevel: 1 }
            mockStore.state.Auth.user = user
            return user
          }
        }),
      }

      const to = { path: '/admin', meta: { authorize: [1] } }
      const from = { path: '/' }

      await beforeEachGuard(to, from, mockNext, mockStore, 500)

      expect(mockStore.dispatch).toHaveBeenCalledWith('autoSignIn')
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('times out safely and redirects unauthenticated user when autoSignIn hangs', async () => {
      const mockStore = {
        state: {
          Auth: { user: null },
        },
        dispatch: jest.fn().mockImplementation(() => new Promise(() => {})), // never resolves
      }

      const to = { path: '/admin', meta: { authorize: [1] } }
      const from = { path: '/' }

      await beforeEachGuard(to, from, mockNext, mockStore, 50)

      expect(mockStore.dispatch).toHaveBeenCalledWith('autoSignIn')
      expect(mockNext).toHaveBeenCalledWith('/signin')
    })

    it('redirects unverified user to /verify-email', async () => {
      const mockStore = {
        state: {
          Auth: { user: null },
        },
        dispatch: jest.fn().mockImplementation(async (action) => {
          if (action === 'autoSignIn') {
            return {
              uid: 'unverified-user',
              isAnonymous: false,
              emailVerified: false,
            }
          }
        }),
      }

      const to = { path: '/admin', meta: { authorize: [1] } }
      const from = { path: '/' }

      await beforeEachGuard(to, from, mockNext, mockStore, 500)

      expect(mockNext).toHaveBeenCalledWith('/verify-email')
    })
  })
})
