import UserController from '@/features/auth/controllers/UserController'

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    updateDoc: jest.fn(),
    collection: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    documentId: jest.fn(() => '__name__')
}))

jest.mock('firebase/auth', () => ({
    EmailAuthProvider: {
        credential: jest.fn()
    },
    reauthenticateWithCredential: jest.fn(),
    updatePassword: jest.fn()
}))

jest.mock('@/app/plugins/firebase', () => ({
    db: {}
}))

describe('UserController', () => {
    let userController

    beforeEach(() => {
        jest.clearAllMocks()
        userController = new UserController()
    })

    describe('Structure', () => {
        it('should have create method', () => {
            expect(typeof userController.create).toBe('function')
        })

        it('should have update method', () => {
            expect(typeof userController.update).toBe('function')
        })

        it('should have readAll method', () => {
            expect(typeof userController.readAll).toBe('function')
        })

        it('should have getById method', () => {
            expect(typeof userController.getById).toBe('function')
        })

        it('should have updateProfile method', () => {
            expect(typeof userController.updateProfile).toBe('function')
        })

        it('should have deleteUser method', () => {
            expect(typeof userController.deleteUser).toBe('function')
        })

        it('should have changePassword method', () => {
            expect(typeof userController.changePassword).toBe('function')
        })

        it('should have addNotification method', () => {
            expect(typeof userController.addNotification).toBe('function')
        })

        it('should have markNotificationAsRead method', () => {
            expect(typeof userController.markNotificationAsRead).toBe('function')
        })

        it('should have removeTestFromUser method', () => {
            expect(typeof userController.removeTestFromUser).toBe('function')
        })

        it('should have updateLevel method', () => {
            expect(typeof userController.updateLevel).toBe('function')
        })
    })

    describe('updateProfile', () => {
        it('should call update with profile data', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'update')
                .mockResolvedValue()

            const payload = {
                username: 'newusername',
                contactNo: '1234567890',
                country: 'US'
            }

            await userController.updateProfile('user-123', payload)

            expect(updateSpy).toHaveBeenCalledWith('users', 'user-123', {
                username: 'newusername',
                contactNo: '1234567890',
                country: 'US'
            })

            updateSpy.mockRestore()
        })
    })

    describe('deleteUser', () => {
        it('should call delete with user id', async () => {
            const deleteSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'delete')
                .mockResolvedValue()

            await userController.deleteUser('user-123')

            expect(deleteSpy).toHaveBeenCalledWith('users', 'user-123')

            deleteSpy.mockRestore()
        })
    })

    describe('updateLevel', () => {
        it('should call update with access level', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'update')
                .mockResolvedValue()

            await userController.updateLevel('user-123', 2)

            expect(updateSpy).toHaveBeenCalledWith('users', 'user-123', { accessLevel: 2 })

            updateSpy.mockRestore()
        })

        it('should throw error when update fails', async () => {
            const mockError = new Error('Update failed')
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'update')
                .mockRejectedValue(mockError)

            await expect(userController.updateLevel('user-123', 2)).rejects.toThrow(mockError)

            updateSpy.mockRestore()
        })
    })
})
