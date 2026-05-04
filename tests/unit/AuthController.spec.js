import AuthController from '@/features/auth/controllers/AuthController'
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    setPersistence,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    reauthenticateWithPopup,
    reauthenticateWithCredential,
    EmailAuthProvider
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
        credential: jest.fn()
    },
    sendPasswordResetEmail: jest.fn()
}))

jest.mock('@/app/plugins/firebase', () => ({
    auth: { currentUser: { uid: 'test-uid', email: 'test@example.com' } }
}))

jest.mock('@/shared/controllers/EmailController', () => {
    return jest.fn().mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({ success: true })
    }))
})

jest.mock('axios', () => ({
    post: jest.fn()
}))

describe('AuthController', () => {
    let authController

    beforeEach(() => {
        jest.clearAllMocks()
        authController = new AuthController()
    })

    describe('signUp', () => {
        it('should call createUserWithEmailAndPassword with correct parameters', async () => {
            const mockCredential = { user: { uid: 'new-user-id' } }
            createUserWithEmailAndPassword.mockResolvedValue(mockCredential)

            const result = await authController.signUp('test@example.com', 'password123')

            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),
                'test@example.com',
                'password123'
            )
            expect(result).toEqual(mockCredential)
        })

        it('should throw error when createUserWithEmailAndPassword fails', async () => {
            const mockError = new Error('Email already in use')
            createUserWithEmailAndPassword.mockRejectedValue(mockError)

            await expect(authController.signUp('test@example.com', 'password123'))
                .rejects.toThrow(mockError)
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
                'password123'
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

            await expect(authController.signIn('test@example.com', 'wrong', false))
                .rejects.toThrow(mockError)
        })
    })

    describe('Equivalence Classes (EC) - signIn reliability', () => {
        it('[EC][auth.signIn.credentials][valid] accepts known valid credentials', async () => {
            const mockCredential = { user: { uid: 'valid-user-id' } }
            setPersistence.mockResolvedValue()
            signInWithEmailAndPassword.mockResolvedValue(mockCredential)

            const result = await authController.signIn('valid@example.com', 'Password@123', false)

            expect(result).toEqual(mockCredential)
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),
                'valid@example.com',
                'Password@123'
            )
        })

        it('[EC][auth.signIn.credentials][invalid] rejects malformed email', async () => {
            const mockError = Object.assign(new Error('Invalid email'), {
                code: 'auth/invalid-email'
            })
            setPersistence.mockResolvedValue()
            signInWithEmailAndPassword.mockRejectedValue(mockError)

            await expect(
                authController.signIn('invalid-email-format', 'Password@123', false)
            ).rejects.toThrow('Invalid email')
        })

        it('[EC][auth.signIn.credentials][invalid] rejects empty password', async () => {
            const mockError = Object.assign(new Error('Missing password'), {
                code: 'auth/missing-password'
            })
            setPersistence.mockResolvedValue()
            signInWithEmailAndPassword.mockRejectedValue(mockError)

            await expect(
                authController.signIn('valid@example.com', '', false)
            ).rejects.toThrow('Missing password')
        })

        it('[EC][auth.signIn.rememberMe][valid] persists local session when rememberMe=true', async () => {
            setPersistence.mockResolvedValue()
            signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'local-user' } })

            await authController.signIn('valid@example.com', 'Password@123', true)

            expect(setPersistence).toHaveBeenCalledWith(expect.anything(), 'local')
        })

        it('[EC][auth.signIn.rememberMe][invalid] treats falsy rememberMe as session persistence', async () => {
            setPersistence.mockResolvedValue()
            signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'session-user' } })

            await authController.signIn('valid@example.com', 'Password@123', null)

            expect(setPersistence).toHaveBeenCalledWith(expect.anything(), 'session')
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

            await expect(authController.signInWithGoogle(true))
                .rejects.toThrow('Popup closed')
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

        it('should return null when no current user exists', async () => {
            const firebase = require('@/app/plugins/firebase')
            firebase.auth.currentUser = null

            const result = await authController.getCurrentUser()

            expect(result).toBeNull()
        })
    })

    describe('autoSignIn', () => {
        it('should call onAuthStateChanged', async () => {
            const mockUser = { uid: 'auto-user', email: 'auto@example.com' }
            onAuthStateChanged.mockImplementation((auth, callback) => {
                const unsubscribe = jest.fn()
                setTimeout(() => callback(mockUser), 0)
                return unsubscribe
            })

            const result = await authController.autoSignIn()

            expect(onAuthStateChanged).toHaveBeenCalled()
        })

    })

    describe('deleteAuth', () => {
        it('should delete Google user account with reauthentication', async () => {
            const mockUser = {
                uid: 'google-user-id',
                email: 'google@example.com',
                providerData: [{ providerId: 'google.com' }],
                delete: jest.fn().mockResolvedValue()
            }

            reauthenticateWithPopup.mockResolvedValue()

            const axios = require('axios')
            axios.post.mockResolvedValue({ data: { success: true } })

            await authController.deleteAuth({ user: mockUser })

            expect(reauthenticateWithPopup).toHaveBeenCalledWith(
                mockUser,
                expect.anything()
            )
            expect(mockUser.delete).toHaveBeenCalled()
            expect(axios.post).toHaveBeenCalled()
        })

        it('should delete email/password user with credential reauthentication', async () => {
            const mockUser = {
                uid: 'email-user-id',
                email: 'email@example.com',
                providerData: [{ providerId: 'password' }],
                delete: jest.fn().mockResolvedValue()
            }

            reauthenticateWithCredential.mockResolvedValue()
            EmailAuthProvider.credential.mockReturnValue({})

            const axios = require('axios')
            axios.post.mockResolvedValue({ data: { success: true } })

            await authController.deleteAuth({
                user: mockUser,
                password: mockUserCredentials.secret
            })

            expect(EmailAuthProvider.credential).toHaveBeenCalledWith(
                mockUser.email,
                mockUserCredentials.secret
            )
            expect(reauthenticateWithCredential).toHaveBeenCalled()
            expect(mockUser.delete).toHaveBeenCalled()
        })

        it('should throw error when password is missing for email user', async () => {
            const mockUser = {
                uid: 'email-user-id',
                email: 'email@example.com',
                providerData: [{ providerId: 'password' }]
            }

            await expect(authController.deleteAuth({ user: mockUser }))
                .rejects.toThrow('Password required')
        })

        it('should not delete user if reauthentication fails', async () => {
            const mockUser = {
                uid: 'email-user-id',
                email: 'email@example.com',
                providerData: [{ providerId: 'password' }],
                delete: jest.fn().mockResolvedValue()
            }

            EmailAuthProvider.credential.mockReturnValue({})
            reauthenticateWithCredential.mockRejectedValue(new Error('Wrong password'))

            const axios = require('axios')

            await expect(
                authController.deleteAuth({
                    user: mockUser,
                    password: mockUserCredentials.secret
                })
            ).rejects.toThrow('Wrong password')

            expect(mockUser.delete).not.toHaveBeenCalled()
            expect(axios.post).not.toHaveBeenCalled()
        })

        it('should throw and not call backend if user.delete fails', async () => {
            const mockUser = {
                uid: 'email-user-id',
                email: 'email@example.com',
                providerData: [{ providerId: 'password' }],
                delete: jest.fn().mockRejectedValue(new Error('Delete failed'))
            }

            EmailAuthProvider.credential.mockReturnValue({})
            reauthenticateWithCredential.mockResolvedValue()

            const axios = require('axios')
            axios.post.mockResolvedValue({ data: { success: true } })

            await expect(
                authController.deleteAuth({
                    user: mockUser,
                    password: mockUserCredentials.secret
                })
            ).rejects.toThrow('Delete failed')

            expect(axios.post).not.toHaveBeenCalled()
        })
    })
})
