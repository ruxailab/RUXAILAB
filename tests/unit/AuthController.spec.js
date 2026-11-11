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

jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {
    callHttpsCallableFunction: jest.fn().mockResolvedValue({
      data: 'User deleted successfully.',
    }),
  },
}))

jest.mock('@/shared/controllers/EmailController', () => {
  return jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({ success: true }),
  }))
})

describe('AuthController', () => {
  let authController

  beforeEach(() => {
    jest.clearAllMocks()
    const firebase = require('@/app/plugins/firebase')
    firebase.auth.currentUser = { uid: 'test-uid', email: 'test@example.com' }
    authController = new AuthController()
  })

  describe('signUp', () => {
    it('should call createUserWithEmailAndPassword with correct parameters', async () => {
      const mockCredential = { user: { uid: 'new-user-id' } }
      createUserWithEmailAndPassword.mockResolvedValue(mockCredential)

      const result = await authController.signUp(
        'test@example.com',
        'password123',
      )

      expect(setPersistence).toHaveBeenCalledWith(expect.anything(), 'local')
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

      await authController.signIn('test@example.com', 'password123')

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

      const result = await authController.signInWithGoogle()

      expect(setPersistence).toHaveBeenCalledWith(expect.anything(), 'local')

      expect(signInWithPopup).toHaveBeenCalled()
      expect(result).toEqual(mockCredential)
    })

    it('should set session persistence when rememberMe is false', async () => {
      setPersistence.mockResolvedValue()
      signInWithPopup.mockResolvedValue({ user: {} })

      await authController.signInWithGoogle(false)

      expect(setPersistence).toHaveBeenCalledWith(expect.anything(), 'session')
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
    it('should call onAuthStateChanged', async () => {
      const mockUser = {
        uid: 'auto-user',
        email: 'auto@example.com',
      }

      onAuthStateChanged.mockImplementation((auth, callback) => {
        const unsubscribe = jest.fn()

        setTimeout(() => callback(mockUser), 0)

        return unsubscribe
      })

      await authController.autoSignIn()

      expect(onAuthStateChanged).toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    const EmailController = require('@/shared/controllers/EmailController')

    const mockSendResult = (result) => {
      const send = jest.fn().mockResolvedValue(result)
      EmailController.mockImplementationOnce(() => ({ send }))
      return send
    }

    it('sends the password reset email', async () => {
      const send = mockSendResult({ success: true })

      await authController.resetPassword('test@example.com')

      expect(send).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Password Reset',
        template: 'passwordReset',
      })
    })

    it('throws when the email could not be sent', async () => {
      mockSendResult({ success: false, message: 'Network error' })

      await expect(
        authController.resetPassword('test@example.com'),
      ).rejects.toThrow('Network error')
    })
  })

  describe('sendVerificationEmail', () => {
    const EmailController = require('@/shared/controllers/EmailController')

    const mockSendResult = (result) => {
      const send = jest.fn().mockResolvedValue(result)
      EmailController.mockImplementationOnce(() => ({ send }))
      return send
    }

    it('sends the verification email', async () => {
      const send = mockSendResult({ success: true })

      await authController.sendVerificationEmail('test@example.com', 'Test')

      expect(send).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Verify Your Email Address',
        template: 'emailVerification',
        data: { userName: 'Test' },
      })
    })

    it('throws when the email could not be sent', async () => {
      mockSendResult({ success: false, message: 'Internal Server Error' })

      await expect(
        authController.sendVerificationEmail('test@example.com', 'Test'),
      ).rejects.toThrow('Internal Server Error')
    })

    it('throws a default message when the failure has no message', async () => {
      mockSendResult({ success: false })

      await expect(
        authController.sendVerificationEmail('test@example.com'),
      ).rejects.toThrow('Email could not be sent')
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

      const {
        FirebaseFunctionsController,
      } = require('@/app/plugins/firebase/FirebaseFunctionsService')

      await authController.deleteAuth({
        user: mockUser,
      })

      expect(mockUser.delete).toHaveBeenCalled()
      expect(
        FirebaseFunctionsController.callHttpsCallableFunction,
      ).toHaveBeenCalledWith('deleteAuth', { userId: 'google-user-id' })
    })

    it('should delete email/password user account', async () => {
      const mockUser = {
        uid: 'email-user-id',
        email: 'email@example.com',
        providerData: [{ providerId: 'password' }],
        delete: jest.fn().mockResolvedValue(),
      }

      const {
        FirebaseFunctionsController,
      } = require('@/app/plugins/firebase/FirebaseFunctionsService')

      await authController.deleteAuth({
        user: mockUser,
        password: mockUserCredentials.secret,
      })

      expect(mockUser.delete).toHaveBeenCalled()
      expect(
        FirebaseFunctionsController.callHttpsCallableFunction,
      ).toHaveBeenCalledWith('deleteAuth', { userId: 'email-user-id' })
    })

    it('should throw and not call backend if user.delete fails', async () => {
      const mockUser = {
        uid: 'email-user-id',
        email: 'email@example.com',
        providerData: [{ providerId: 'password' }],
        delete: jest.fn().mockRejectedValue(new Error('Delete failed')),
      }

      const {
        FirebaseFunctionsController,
      } = require('@/app/plugins/firebase/FirebaseFunctionsService')

      await expect(
        authController.deleteAuth({
          user: mockUser,
          password: mockUserCredentials.secret,
        }),
      ).rejects.toThrow('Delete failed')

      expect(
        FirebaseFunctionsController.callHttpsCallableFunction,
      ).not.toHaveBeenCalled()
    })
  })

  describe('deleteUserData', () => {
    it('should invoke deleteAuth callable function with userId', async () => {
      const {
        FirebaseFunctionsController,
      } = require('@/app/plugins/firebase/FirebaseFunctionsService')

      await authController.deleteUserData('user-123')

      expect(
        FirebaseFunctionsController.callHttpsCallableFunction,
      ).toHaveBeenCalledWith('deleteAuth', { userId: 'user-123' })
    })

    it('should rethrow if deleteAuth callable function fails', async () => {
      const {
        FirebaseFunctionsController,
      } = require('@/app/plugins/firebase/FirebaseFunctionsService')

      FirebaseFunctionsController.callHttpsCallableFunction.mockRejectedValueOnce(
        new Error('Callable failure'),
      )

      await expect(
        authController.deleteUserData('user-123'),
      ).rejects.toThrow('Callable failure')
    })
  })
})
