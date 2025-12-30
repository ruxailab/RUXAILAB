import AuthController from '@/features/auth/controllers/AuthController'
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    setPersistence,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth'

jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    signInWithPopup: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    setPersistence: jest.fn(),
    browserLocalPersistence: 'local',
    browserSessionPersistence: 'session'
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
})
