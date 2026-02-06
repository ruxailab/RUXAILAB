import AuthController from '@/features/auth/controllers/AuthController'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
} from 'firebase/auth'
import axios from 'axios'

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  reauthenticateWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn(),
  },
  sendPasswordResetEmail: jest.fn(),
  setPersistence: jest.fn(),
  browserLocalPersistence: 'local',
  browserSessionPersistence: 'session',
}))

jest.mock('@/app/plugins/firebase', () => ({
  auth: { currentUser: { uid: 'test-uid', email: 'test@example.com' } },
}))

jest.mock('@/shared/controllers/EmailController', () => {
  return jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({ success: true }),
  }))
})

jest.mock('axios')

describe('AuthController', () => {
  let authController
  let consoleErrorSpy
  let consoleWarnSpy

  beforeEach(() => {
    jest.clearAllMocks()
    authController = new AuthController()

    // Suppress expected console output during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore console methods
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
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

    it('should set session persistence when rememberMe is false', async () => {
      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockResolvedValue({ user: {} })

      await authController.signIn('test@example.com', 'password123', false)

      expect(setPersistence).toHaveBeenCalledWith(expect.anything(), 'session')
    })

    it('should throw error when signIn fails', async () => {
      const mockError = new Error('Invalid credentials')
      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockRejectedValue(mockError)

      await expect(
        authController.signIn('test@example.com', 'wrong', false),
      ).rejects.toThrow(mockError)
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
  })

  describe('getCurrentUser', () => {
    it('should return the current user from auth', async () => {
      const result = await authController.getCurrentUser()

      expect(result).toEqual({ uid: 'test-uid', email: 'test@example.com' })
    })
  })

  describe('autoSignIn', () => {
    it('should resolve with user when auth state changes', async () => {
      const mockUser = { uid: 'auto-user', email: 'auto@example.com' }
      onAuthStateChanged.mockImplementation((auth, callback) => {
        const unsubscribe = jest.fn()
        setTimeout(() => callback(mockUser), 0)
        return unsubscribe
      })

      const result = await authController.autoSignIn()

      expect(onAuthStateChanged).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('should resolve with null when no user is signed in', async () => {
      onAuthStateChanged.mockImplementation((auth, callback) => {
        const unsubscribe = jest.fn()
        setTimeout(() => callback(null), 0)
        return unsubscribe
      })

      const result = await authController.autoSignIn()

      expect(result).toBeNull()
    })

    it('should reject when auth state change fails', async () => {
      const mockError = new Error('Auth state error')
      onAuthStateChanged.mockImplementation((auth, callback, errorCallback) => {
        const unsubscribe = jest.fn()
        setTimeout(() => errorCallback(mockError), 0)
        return unsubscribe
      })

      await expect(authController.autoSignIn()).rejects.toThrow(mockError)
    })

    it('should unsubscribe after resolving', async () => {
      const unsubscribe = jest.fn()
      const mockUser = { uid: 'test-user' }

      onAuthStateChanged.mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0)
        return unsubscribe
      })

      await authController.autoSignIn()

      expect(unsubscribe).toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    let EmailController

    beforeEach(() => {
      EmailController = require('@/shared/controllers/EmailController')
    })

    it('should send password reset email', async () => {
      const mockEmail = 'test@example.com'
      const sendMock = jest.fn().mockResolvedValue({ success: true })
      EmailController.mockImplementation(() => ({
        send: sendMock,
      }))

      await authController.resetPassword(mockEmail)

      expect(sendMock).toHaveBeenCalledWith({
        to: mockEmail,
        subject: 'Password Reset',
        template: 'passwordReset',
      })
    })

    it('should throw error when email sending fails', async () => {
      const mockError = new Error('Email service unavailable')
      const sendMock = jest.fn().mockRejectedValue(mockError)
      EmailController.mockImplementation(() => ({
        send: sendMock,
      }))

      await expect(
        authController.resetPassword('test@example.com'),
      ).rejects.toThrow(mockError)
    })
  })

  describe('deleteAuth', () => {
    beforeEach(() => {
      axios.post = jest.fn().mockResolvedValue({ data: { success: true } })
    })

    it('should delete user with Google provider', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [{ providerId: 'google.com' }],
        delete: jest.fn().mockResolvedValue(),
      }

      reauthenticateWithPopup.mockResolvedValue()

      await authController.deleteAuth({ user: mockUser })

      expect(reauthenticateWithPopup).toHaveBeenCalledWith(
        mockUser,
        expect.any(Object),
      )
      expect(mockUser.delete).toHaveBeenCalled()
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/deleteAuth'),
        { data: { userId: mockUser.uid } },
      )
    })

    it('should delete user with email/password provider', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [{ providerId: 'password' }],
        delete: jest.fn().mockResolvedValue(),
      }
      const password = 'testpassword123'

      const mockCredential = { providerId: 'password' }
      EmailAuthProvider.credential.mockReturnValue(mockCredential)
      reauthenticateWithCredential.mockResolvedValue()

      await authController.deleteAuth({ user: mockUser, password })

      expect(EmailAuthProvider.credential).toHaveBeenCalledWith(
        mockUser.email,
        password,
      )
      expect(reauthenticateWithCredential).toHaveBeenCalledWith(
        mockUser,
        mockCredential,
      )
      expect(mockUser.delete).toHaveBeenCalled()
    })

    it('should throw error when no user is provided', async () => {
      await expect(authController.deleteAuth({})).rejects.toThrow(
        'No user provided',
      )
    })

    it('should throw error when password is missing for email user', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [{ providerId: 'password' }],
      }

      await expect(
        authController.deleteAuth({ user: mockUser }),
      ).rejects.toThrow('Password required')
    })

    it('should continue if backend cleanup fails', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [{ providerId: 'google.com' }],
        delete: jest.fn().mockResolvedValue(),
      }

      reauthenticateWithPopup.mockResolvedValue()
      axios.post.mockRejectedValue(new Error('Backend error'))

      // Should not throw - user deletion should succeed despite backend error
      await expect(
        authController.deleteAuth({ user: mockUser }),
      ).resolves.not.toThrow()

      expect(mockUser.delete).toHaveBeenCalled()
    })

    it('should throw error when reauthentication fails', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [{ providerId: 'google.com' }],
      }

      const authError = new Error('Reauthentication failed')
      reauthenticateWithPopup.mockRejectedValue(authError)

      await expect(
        authController.deleteAuth({ user: mockUser }),
      ).rejects.toThrow(authError)
    })

    it('should throw error when user deletion fails', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        providerData: [{ providerId: 'google.com' }],
        delete: jest.fn().mockRejectedValue(new Error('Deletion failed')),
      }

      reauthenticateWithPopup.mockResolvedValue()

      await expect(
        authController.deleteAuth({ user: mockUser }),
      ).rejects.toThrow('Deletion failed')
    })
  })

  describe('edge cases and race conditions', () => {
    it('should handle concurrent signIn calls', async () => {
      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'user-1' } })

      const promise1 = authController.signIn('test1@example.com', 'pass1', true)
      const promise2 = authController.signIn(
        'test2@example.com',
        'pass2',
        false,
      )

      const results = await Promise.all([promise1, promise2])

      expect(results).toHaveLength(2)
      expect(setPersistence).toHaveBeenCalledTimes(2)
    })

    it('should handle network timeout during signUp', async () => {
      const timeoutError = new Error('Network timeout')
      timeoutError.code = 'auth/network-request-failed'
      createUserWithEmailAndPassword.mockRejectedValue(timeoutError)

      await expect(
        authController.signUp('test@example.com', 'pass'),
      ).rejects.toThrow(timeoutError)
    })

    it('should handle expired session during autoSignIn', async () => {
      const sessionError = new Error('Session expired')
      sessionError.code = 'auth/user-token-expired'

      onAuthStateChanged.mockImplementation((auth, callback, errorCallback) => {
        const unsubscribe = jest.fn()
        setTimeout(() => errorCallback(sessionError), 0)
        return unsubscribe
      })

      await expect(authController.autoSignIn()).rejects.toThrow(sessionError)
    })

    it('should handle signOut while another operation is in progress', async () => {
      signOut.mockResolvedValue()

      const signOutPromise = authController.signOut()

      // Attempt another signOut immediately
      const concurrentSignOut = authController.signOut()

      await Promise.all([signOutPromise, concurrentSignOut])

      expect(signOut).toHaveBeenCalledTimes(2)
    })

    it('should handle popup closed by user during Google sign in', async () => {
      const popupError = new Error('Popup closed')
      popupError.code = 'auth/popup-closed-by-user'

      setPersistence.mockResolvedValue()
      signInWithPopup.mockRejectedValue(popupError)

      await expect(authController.signInWithGoogle(true)).rejects.toThrow(
        popupError,
      )
    })

    it('should handle weak password during signUp', async () => {
      const weakPasswordError = new Error('Weak password')
      weakPasswordError.code = 'auth/weak-password'
      createUserWithEmailAndPassword.mockRejectedValue(weakPasswordError)

      await expect(
        authController.signUp('test@example.com', '123'),
      ).rejects.toThrow(weakPasswordError)
    })

    it('should handle email already in use', async () => {
      const emailInUseError = new Error('Email already in use')
      emailInUseError.code = 'auth/email-already-in-use'
      createUserWithEmailAndPassword.mockRejectedValue(emailInUseError)

      await expect(
        authController.signUp('existing@example.com', 'password'),
      ).rejects.toThrow(emailInUseError)
    })

    it('should handle too many requests error', async () => {
      const tooManyRequestsError = new Error('Too many requests')
      tooManyRequestsError.code = 'auth/too-many-requests'

      setPersistence.mockResolvedValue()
      signInWithEmailAndPassword.mockRejectedValue(tooManyRequestsError)

      await expect(
        authController.signIn('test@example.com', 'password', false),
      ).rejects.toThrow(tooManyRequestsError)
    })
  })

  describe('deleteUserData', () => {
    it('should call backend API to delete user data', async () => {
      axios.post.mockResolvedValue({ data: { success: true } })

      await authController.deleteUserData('test-user-id')

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/deleteAuth'),
        { data: { userId: 'test-user-id' } },
      )
    })

    it('should throw error when backend call fails', async () => {
      const backendError = new Error('Backend error')
      axios.post.mockRejectedValue(backendError)

      await expect(
        authController.deleteUserData('test-user-id'),
      ).rejects.toThrow(backendError)
    })
  })
})
