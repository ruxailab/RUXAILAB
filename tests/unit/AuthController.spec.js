import AuthController from '@/features/auth/controllers/AuthController'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { mockUserCredentials } from './helpers/testUtils'

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  setPersistence: jest.fn(),
  browserLocalPersistence: 'local',
  browserSessionPersistence: 'session',
  GoogleAuthProvider: jest.fn(),
  reauthenticateWithPopup: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn(),
  },
  sendPasswordResetEmail: jest.fn(),
}))

jest.mock('@/app/plugins/firebase', () => ({
  auth: { currentUser: { uid: 'test-uid', email: 'test@example.com' } },
}))

jest.mock('@/shared/controllers/EmailController', () => {
  return jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({ success: true }),
  }))
})

jest.mock('axios', () => ({
  post: jest.fn(),
}))

const SESSION_COOKIE = 'ruxailab_browser_session'

const endBrowserSession = () => {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`
  localStorage.clear()
}

describe('AuthController', () => {
  let authController

  beforeEach(() => {
    jest.clearAllMocks()
    endBrowserSession()
    authController = new AuthController()
  })

  afterEach(() => {
    endBrowserSession()
  })

  describe('signUp', () => {
    it('should call createUserWithEmailAndPassword with correct parameters', async () => {
      const mockCredential = { user: { uid: 'new-user-id' } }
      createUserWithEmailAndPassword.mockResolvedValue(mockCredential)

      const result = await authController.signUp(
        'test@example.com',
        'password123',
      )

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123',
      )

      expect(result).toEqual(mockCredential)
    })

    it('should throw error when createUserWithEmailAndPassword fails', async () => {
      const mockError = new Error('Email already in use')
      createUserWithEmailAndPassword.mockRejectedValue(mockError)

      await expect(
        authController.signUp('test@example.com', 'password123'),
      ).rejects.toThrow(mockError)
    })
  })

  describe('signIn', () => {
    it('should set local persistence when rememberMe is true', async () => {
      const mockCredential = { user: { uid: 'user-id' } }

      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockResolvedValue(mockCredential)

      await authController.signIn('test@example.com', 'password123', true)

      expect(setPersistence).toHaveBeenCalledWith(expect.anything(), 'local')

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123',
      )
    })

    it('should not scope the sign-in to a browser session when rememberMe is true', async () => {
      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockResolvedValue({ user: {} })

      await authController.signIn('test@example.com', 'password123', true)

      expect(document.cookie).not.toContain(SESSION_COOKIE)
    })

    it('should share the sign-in across tabs when rememberMe is false', async () => {
      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockResolvedValue({ user: {} })

      await authController.signIn('test@example.com', 'password123', false)

      // Local persistence is what every tab of the browser can read; the
      // session cookie is what expires it once the browser is closed.
      expect(setPersistence).toHaveBeenCalledWith(expect.anything(), 'local')
      expect(document.cookie).toContain(`${SESSION_COOKIE}=1`)
    })

    it('should fall back to session persistence when cookies are blocked', async () => {
      const cookie = jest
        .spyOn(document, 'cookie', 'set')
        .mockImplementation(() => {})

      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockResolvedValue({ user: {} })

      await authController.signIn('test@example.com', 'password123', false)

      expect(setPersistence).toHaveBeenCalledWith(expect.anything(), 'session')

      cookie.mockRestore()
    })

    it('should fall back to session persistence when the marker cannot be stored', async () => {
      // Cookies answer the probe, but writing the marker afterwards fails, so
      // the sign-in would have nothing left to expire it.
      const realSetItem = Storage.prototype.setItem
      const setItem = jest
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(function (key, value) {
          if (key === 'ruxailab.auth.session-scoped') {
            throw new Error('storage disabled')
          }
          return realSetItem.call(this, key, value)
        })

      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockResolvedValue({ user: {} })

      await authController.signIn('test@example.com', 'password123', false)

      expect(setPersistence).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        'local',
      )
      expect(setPersistence).toHaveBeenLastCalledWith(
        expect.anything(),
        'session',
      )

      setItem.mockRestore()
    })

    it('should throw error when signIn fails', async () => {
      const mockError = new Error('Invalid credentials')

      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockRejectedValue(mockError)

      await expect(
        authController.signIn('test@example.com', 'wrong', false),
      ).rejects.toThrow(mockError)
    })

    it('should not scope an existing sign-in when the attempt fails', async () => {
      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockResolvedValue({ user: {} })

      await authController.signIn('test@example.com', 'password123', true)

      signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid'))

      await expect(
        authController.signIn('test@example.com', 'wrong', false),
      ).rejects.toThrow('Invalid')

      // The remembered sign-in must not start expiring with the browser just
      // because somebody mistyped a password on the sign-in page.
      expect(document.cookie).not.toContain(SESSION_COOKIE)
    })
  })

  describe('signInWithGoogle', () => {
    it('should set persistence and call signInWithPopup', async () => {
      const mockCredential = { user: { uid: 'google-user-id' } }

      setPersistence.mockResolvedValue()
      signInWithPopup.mockResolvedValue(mockCredential)

      const result = await authController.signInWithGoogle(true)

      expect(setPersistence).toHaveBeenCalledWith(expect.anything(), 'local')

      expect(signInWithPopup).toHaveBeenCalled()
      expect(result).toEqual(mockCredential)
    })

    it('should share the sign-in across tabs when rememberMe is false', async () => {
      setPersistence.mockResolvedValue()
      signInWithPopup.mockResolvedValue({ user: {} })

      await authController.signInWithGoogle(false)

      expect(setPersistence).toHaveBeenCalledWith(expect.anything(), 'local')
      expect(document.cookie).toContain(`${SESSION_COOKIE}=1`)
    })

    it('should throw error when Google sign-in fails', async () => {
      const mockError = new Error('Popup closed')

      setPersistence.mockResolvedValue()
      signInWithPopup.mockRejectedValue(mockError)

      await expect(authController.signInWithGoogle(true)).rejects.toThrow(
        'Popup closed',
      )
    })
  })

  describe('signOut', () => {
    it('should call firebase signOut', async () => {
      signOut.mockResolvedValue()

      await authController.signOut()

      expect(signOut).toHaveBeenCalled()
    })

    it('should throw error when signOut fails', async () => {
      const mockError = new Error('Sign out failed')

      signOut.mockRejectedValue(mockError)

      await expect(authController.signOut()).rejects.toThrow(mockError)
    })

    it('should clear the browser session markers', async () => {
      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockResolvedValue({ user: {} })
      signOut.mockResolvedValue()

      await authController.signIn('test@example.com', 'password123', false)
      await authController.signOut()

      expect(document.cookie).not.toContain(SESSION_COOKIE)
    })
  })

  describe('getCurrentUser', () => {
    it('should return the current user from auth', async () => {
      const result = await authController.getCurrentUser()

      expect(result).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
      })
    })

    it('should return null when no current user exists', async () => {
      const firebase = require('@/app/plugins/firebase')

      firebase.auth.currentUser = null

      const result = await authController.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('autoSignIn', () => {
    const mockUser = {
      uid: 'auto-user',
      email: 'auto@example.com',
    }

    const observeUser = (user) => {
      onAuthStateChanged.mockImplementation((auth, callback) => {
        const unsubscribe = jest.fn()

        setTimeout(() => callback(user), 0)

        return unsubscribe
      })
    }

    const signInWithoutRememberMe = async () => {
      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser })

      await authController.signIn('test@example.com', 'password123', false)
    }

    it('should call onAuthStateChanged', async () => {
      observeUser(mockUser)

      await authController.autoSignIn()

      expect(onAuthStateChanged).toHaveBeenCalled()
    })

    it('should restore a session-scoped sign-in while the browser session lasts', async () => {
      await signInWithoutRememberMe()
      observeUser(mockUser)

      // A second tab of the same browser still has the session cookie.
      await expect(authController.autoSignIn()).resolves.toEqual(mockUser)
      expect(signOut).not.toHaveBeenCalled()
    })

    it('should sign out a session-scoped user once the browser session ended', async () => {
      await signInWithoutRememberMe()

      // Closing the browser is what deletes a cookie with no expiry date,
      // while the stored auth state survives it.
      document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`

      observeUser(mockUser)
      signOut.mockResolvedValue()

      await expect(authController.autoSignIn()).resolves.toBeNull()
      expect(signOut).toHaveBeenCalled()
    })

    it('should keep a remembered user signed in without a session cookie', async () => {
      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser })

      await authController.signIn('test@example.com', 'password123', true)

      observeUser(mockUser)

      await expect(authController.autoSignIn()).resolves.toEqual(mockUser)
      expect(signOut).not.toHaveBeenCalled()
    })

    it('should resolve null when nobody is signed in', async () => {
      observeUser(null)

      await expect(authController.autoSignIn()).resolves.toBeNull()
      expect(signOut).not.toHaveBeenCalled()
    })
  })

  describe('deleteAuth', () => {
    it('should delete Google user account', async () => {
      const mockUser = {
        uid: 'google-user-id',
        email: 'google@example.com',
        providerData: [{ providerId: 'google.com' }],
        delete: jest.fn().mockResolvedValue(),
      }

      const axios = require('axios')

      axios.post.mockResolvedValue({
        data: { success: true },
      })

      await authController.deleteAuth({
        user: mockUser,
      })

      expect(mockUser.delete).toHaveBeenCalled()
      expect(axios.post).toHaveBeenCalled()
    })

    it('should delete email/password user account', async () => {
      const mockUser = {
        uid: 'email-user-id',
        email: 'email@example.com',
        providerData: [{ providerId: 'password' }],
        delete: jest.fn().mockResolvedValue(),
      }

      const axios = require('axios')

      axios.post.mockResolvedValue({
        data: { success: true },
      })

      await authController.deleteAuth({
        user: mockUser,
        password: mockUserCredentials.secret,
      })

      expect(mockUser.delete).toHaveBeenCalled()
      expect(axios.post).toHaveBeenCalled()
    })

    it('should throw and not call backend if user.delete fails', async () => {
      const mockUser = {
        uid: 'email-user-id',
        email: 'email@example.com',
        providerData: [{ providerId: 'password' }],
        delete: jest.fn().mockRejectedValue(new Error('Delete failed')),
      }

      const axios = require('axios')

      axios.post.mockResolvedValue({
        data: { success: true },
      })

      await expect(
        authController.deleteAuth({
          user: mockUser,
          password: mockUserCredentials.secret,
        }),
      ).rejects.toThrow('Delete failed')

      expect(axios.post).not.toHaveBeenCalled()
    })
  })
})
