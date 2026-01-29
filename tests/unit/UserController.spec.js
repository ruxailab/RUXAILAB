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

    describe('create', () => {
        it('should create user with default values', async () => {
            const setSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'set')
                .mockResolvedValue({ id: 'user-123' })

            const payload = {
                id: 'user-123',
                email: 'test@example.com',
                displayName: 'Test User'
            }

            await userController.create(payload)

            expect(setSpy).toHaveBeenCalledWith('users', 'user-123', expect.objectContaining({
                email: 'test@example.com',
                username: 'Test User',
                accessLevel: 1,
                myTests: {},
                myAnswers: {},
                notifications: [],
                storageUsageMB: 0
            }))

            setSpy.mockRestore()
        })

        it('should use username if displayName not provided', async () => {
            const setSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'set')
                .mockResolvedValue({ id: 'user-123' })

            const payload = {
                id: 'user-123',
                email: 'test@example.com',
                username: 'testuser'
            }

            await userController.create(payload)

            expect(setSpy).toHaveBeenCalledWith('users', 'user-123', expect.objectContaining({
                username: 'testuser'
            }))

            setSpy.mockRestore()
        })
    })

    describe('getById', () => {
        it('should fetch user by id successfully', async () => {
            const mockUserData = {
                id: 'user-123',
                email: 'test@example.com',
                username: 'testuser'
            }

            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readOne')
                .mockResolvedValue({
                    id: 'user-123',
                    data: () => mockUserData
                })

            const result = await userController.getById('user-123')

            expect(readOneSpy).toHaveBeenCalledWith('users', 'user-123')
            expect(result).toHaveProperty('id', 'user-123')
            expect(result).toHaveProperty('email', 'test@example.com')

            readOneSpy.mockRestore()
        })
    })

    describe('getUserWithStudies', () => {
        it('should fetch user with studies successfully', async () => {
            const mockUserData = {
                id: 'user-123',
                email: 'test@example.com',
                myTests: { 'test-1': {}, 'test-2': {} },
                myAnswers: { 'answer-1': {} }
            }

            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readOne')
                .mockResolvedValue({
                    id: 'user-123',
                    data: () => mockUserData
                })

            const querySpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'query')
                .mockResolvedValue({
                    docs: [
                        { id: 'test-1', data: () => ({ name: 'Test 1' }) },
                        { id: 'test-2', data: () => ({ name: 'Test 2' }) },
                        { id: 'answer-1', data: () => ({ name: 'Answer 1' }) }
                    ]
                })

            const result = await userController.getUserWithStudies('user-123')

            expect(result).toHaveProperty('myTests')
            expect(result).toHaveProperty('myAnswers')
            // Verify that tests and answers were merged correctly
            expect(result.myTests).toHaveProperty('test-1')
            expect(result.myTests).toHaveProperty('test-2')
            expect(result.myAnswers).toHaveProperty('answer-1')

            readOneSpy.mockRestore()
            querySpy.mockRestore()
        })

        it('should return empty arrays when user has no tests or answers', async () => {
            const mockUserData = {
                id: 'user-123',
                email: 'test@example.com',
                myTests: {},
                myAnswers: {}
            }

            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readOne')
                .mockResolvedValue({
                    id: 'user-123',
                    data: () => mockUserData
                })

            const result = await userController.getUserWithStudies('user-123')

            expect(result.myTests).toEqual({})
            expect(result.myAnswers).toEqual({})

            readOneSpy.mockRestore()
        })
    })

    describe('_fetchStudiesByIds', () => {
        it('should use "in" query for <= 10 IDs', async () => {
            const ids = ['test-1', 'test-2', 'test-3']
            const querySpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'query')
                .mockResolvedValue({
                    docs: [
                        { id: 'test-1', data: () => ({ name: 'Test 1' }) },
                        { id: 'test-2', data: () => ({ name: 'Test 2' }) },
                        { id: 'test-3', data: () => ({ name: 'Test 3' }) }
                    ]
                })

            const result = await userController._fetchStudiesByIds(ids)

            expect(querySpy).toHaveBeenCalledWith('tests', expect.objectContaining({
                condition: 'in',
                value: ids
            }))
            expect(result).toHaveLength(3)

            querySpy.mockRestore()
        })

        it('should use parallel reads for > 10 IDs', async () => {
            const ids = Array.from({ length: 15 }, (_, i) => `test-${i}`)
            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readOne')
                .mockResolvedValue({
                    exists: () => true,
                    id: 'test-1',
                    data: () => ({ name: 'Test' })
                })

            const result = await userController._fetchStudiesByIds(ids)

            expect(readOneSpy).toHaveBeenCalledTimes(15)
            expect(result).toHaveLength(15)

            readOneSpy.mockRestore()
        })

        it('should return empty array for empty input', async () => {
            const result = await userController._fetchStudiesByIds([])
            expect(result).toEqual([])
        })

        it('should return empty array for null input', async () => {
            const result = await userController._fetchStudiesByIds(null)
            expect(result).toEqual([])
        })
    })

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = require('firebase/auth')
            const mockUser = { email: 'test@example.com' }
            const mockCredential = { type: 'credential' }

            EmailAuthProvider.credential.mockReturnValue(mockCredential)
            reauthenticateWithCredential.mockResolvedValue()
            updatePassword.mockResolvedValue()

            await userController.changePassword(mockUser, 'oldPassword', 'newPassword')

            expect(EmailAuthProvider.credential).toHaveBeenCalledWith('test@example.com', 'oldPassword')
            expect(reauthenticateWithCredential).toHaveBeenCalledWith(mockUser, mockCredential)
            expect(updatePassword).toHaveBeenCalledWith(mockUser, 'newPassword')
        })

        it('should handle errors when changing password', async () => {
            const { EmailAuthProvider, reauthenticateWithCredential } = require('firebase/auth')
            const mockUser = { email: 'test@example.com' }
            const mockError = new Error('Wrong password')

            EmailAuthProvider.credential.mockReturnValue({})
            reauthenticateWithCredential.mockRejectedValue(mockError)

            await expect(
                userController.changePassword(mockUser, 'wrongPassword', 'newPassword')
            ).rejects.toThrow('Failed to change password: Wrong password')
        })
    })

    describe('reauthenticateUser', () => {
        it('should reauthenticate user successfully', async () => {
            const { EmailAuthProvider, reauthenticateWithCredential } = require('firebase/auth')
            const mockUser = { email: 'test@example.com' }
            const mockCredential = { type: 'credential' }

            EmailAuthProvider.credential.mockReturnValue(mockCredential)
            reauthenticateWithCredential.mockResolvedValue()

            await userController.reauthenticateUser(mockUser, 'test@example.com', 'password')

            expect(EmailAuthProvider.credential).toHaveBeenCalledWith('test@example.com', 'password')
            expect(reauthenticateWithCredential).toHaveBeenCalledWith(mockUser, mockCredential)
        })

        it('should handle errors when reauthenticating', async () => {
            const { EmailAuthProvider, reauthenticateWithCredential } = require('firebase/auth')
            const mockUser = { email: 'test@example.com' }
            const mockError = new Error('Invalid credentials')

            EmailAuthProvider.credential.mockReturnValue({})
            reauthenticateWithCredential.mockRejectedValue(mockError)

            await expect(
                userController.reauthenticateUser(mockUser, 'test@example.com', 'wrongPassword')
            ).rejects.toThrow('Invalid credentials')
        })
    })

    describe('addNotification', () => {
        it('should add notification successfully', async () => {
            const mockNotification = {
                toFirestore: jest.fn().mockReturnValue({ message: 'Test notification' })
            }
            const mockUser = {
                id: 'user-123',
                notifications: [],
                toFirestore: jest.fn().mockReturnValue({
                    id: 'user-123',
                    notifications: [{ message: 'Test notification' }]
                })
            }

            const getByIdSpy = jest.spyOn(userController, 'getById').mockResolvedValue(mockUser)
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'update')
                .mockResolvedValue()

            await userController.addNotification({
                userId: 'user-123',
                notification: mockNotification
            })

            expect(getByIdSpy).toHaveBeenCalledWith('user-123')
            expect(updateSpy).toHaveBeenCalled()

            getByIdSpy.mockRestore()
            updateSpy.mockRestore()
        })

        it('should handle errors when adding notification', async () => {
            const mockError = new Error('User not found')
            const getByIdSpy = jest.spyOn(userController, 'getById').mockRejectedValue(mockError)

            await expect(
                userController.addNotification({
                    userId: 'user-123',
                    notification: { toFirestore: jest.fn() }
                })
            ).rejects.toThrow(mockError)

            getByIdSpy.mockRestore()
        })
    })

    describe('markNotificationAsRead', () => {
        it('should mark notification as read successfully', async () => {
            const mockUser = {
                id: 'user-123',
                notifications: [
                    { createdDate: '2024-01-01', read: false },
                    { createdDate: '2024-01-02', read: false }
                ],
                toFirestore: jest.fn().mockReturnValue({
                    id: 'user-123',
                    notifications: [
                        { createdDate: '2024-01-01', read: true, readAt: expect.any(Number) },
                        { createdDate: '2024-01-02', read: false }
                    ]
                })
            }

            jest.mock('@/features/auth/models/UserModel', () => ({
                __esModule: true,
                default: jest.fn().mockImplementation((data) => ({
                    ...data,
                    toFirestore: jest.fn().mockReturnValue(data)
                }))
            }))

            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'update')
                .mockResolvedValue(mockUser)

            await userController.markNotificationAsRead({
                user: mockUser,
                notification: { createdDate: '2024-01-01' }
            })

            expect(updateSpy).toHaveBeenCalled()

            updateSpy.mockRestore()
        })

        it('should throw error when notification not found', async () => {
            const mockUser = {
                id: 'user-123',
                notifications: [
                    { createdDate: '2024-01-01', read: false }
                ]
            }

            jest.mock('@/features/auth/models/UserModel', () => ({
                __esModule: true,
                default: jest.fn().mockImplementation((data) => ({
                    ...data,
                    toFirestore: jest.fn().mockReturnValue(data)
                }))
            }))

            await expect(
                userController.markNotificationAsRead({
                    user: mockUser,
                    notification: { createdDate: '2024-01-99' }
                })
            ).rejects.toThrow('Notification not found.')
        })
    })

    describe('removeNotificationsForTest', () => {
        it('should remove notifications for test successfully', async () => {
            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readOne')
                .mockResolvedValue({
                    exists: () => true,
                    id: 'user-123',
                    data: () => ({
                        notifications: [
                            { testId: 'test-1', message: 'Notification 1' },
                            { testId: 'test-2', message: 'Notification 2' },
                            { testId: 'test-1', message: 'Notification 3' }
                        ]
                    })
                })

            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'update')
                .mockResolvedValue()

            await userController.removeNotificationsForTest('test-1', [
                { userDocId: 'user-123' }
            ])

            expect(readOneSpy).toHaveBeenCalledWith('users', 'user-123')
            expect(updateSpy).toHaveBeenCalledWith('users', 'user-123', {
                notifications: [
                    { testId: 'test-2', message: 'Notification 2' }
                ]
            })

            readOneSpy.mockRestore()
            updateSpy.mockRestore()
        })

        it('should handle user with no notifications', async () => {
            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readOne')
                .mockResolvedValue({
                    exists: () => true,
                    id: 'user-123',
                    data: () => ({
                        notifications: []
                    })
                })

            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'update')

            await userController.removeNotificationsForTest('test-1', [
                { userDocId: 'user-123' }
            ])

            expect(readOneSpy).toHaveBeenCalledWith('users', 'user-123')
            expect(updateSpy).not.toHaveBeenCalled()

            readOneSpy.mockRestore()
        })

        it('should handle user document that does not exist', async () => {
            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readOne')
                .mockResolvedValue({
                    exists: () => false,
                    id: 'user-123',
                    data: () => ({})
                })

            await userController.removeNotificationsForTest('test-1', [
                { userDocId: 'user-123' }
            ])

            expect(readOneSpy).toHaveBeenCalledWith('users', 'user-123')

            readOneSpy.mockRestore()
        })

        it('should handle errors when removing notifications', async () => {
            const mockError = new Error('Database error')
            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readOne')
                .mockRejectedValue(mockError)

            await expect(
                userController.removeNotificationsForTest('test-1', [
                    { userDocId: 'user-123' }
                ])
            ).rejects.toThrow(mockError)

            readOneSpy.mockRestore()
        })
    })

    describe('removeTestFromUser', () => {
        it('should remove test from user successfully', async () => {
            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readOne')
                .mockResolvedValue({
                    exists: () => true,
                    id: 'user-123',
                    data: () => ({
                        myTests: {
                            'test-1': {},
                            'test-2': {}
                        },
                        myAnswers: {
                            'test-1': {},
                            'test-2': {}
                        }
                    })
                })

            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'update')
                .mockResolvedValue()

            await userController.removeTestFromUser('user-123', 'test-1')

            expect(readOneSpy).toHaveBeenCalledWith('users', 'user-123')
            expect(updateSpy).toHaveBeenCalledWith('users', 'user-123', {
                myTests: {
                    'test-2': {}
                },
                myAnswers: {
                    'test-2': {}
                }
            })

            readOneSpy.mockRestore()
            updateSpy.mockRestore()
        })

        it('should handle user document that does not exist', async () => {
            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readOne')
                .mockResolvedValue({
                    exists: () => false,
                    id: 'user-123',
                    data: () => ({})
                })

            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'update')

            await userController.removeTestFromUser('user-123', 'test-1')

            expect(readOneSpy).toHaveBeenCalledWith('users', 'user-123')
            expect(updateSpy).not.toHaveBeenCalled()

            readOneSpy.mockRestore()
        })

        it('should handle test that does not exist in user', async () => {
            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readOne')
                .mockResolvedValue({
                    exists: () => true,
                    id: 'user-123',
                    data: () => ({
                        myTests: {
                            'test-2': {}
                        },
                        myAnswers: {
                            'test-2': {}
                        }
                    })
                })

            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'update')
                .mockResolvedValue()

            await userController.removeTestFromUser('user-123', 'test-1')

            expect(updateSpy).toHaveBeenCalledWith('users', 'user-123', {
                myTests: {
                    'test-2': {}
                },
                myAnswers: {
                    'test-2': {}
                }
            })

            readOneSpy.mockRestore()
            updateSpy.mockRestore()
        })

        it('should handle errors when removing test from user', async () => {
            const mockError = new Error('Database error')
            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readOne')
                .mockRejectedValue(mockError)

            await expect(
                userController.removeTestFromUser('user-123', 'test-1')
            ).rejects.toThrow(mockError)

            readOneSpy.mockRestore()
        })
    })

    describe('readAll', () => {
        it('should read all users successfully', async () => {
            const mockDocs = [
                { id: 'user-1', data: () => ({ email: 'user1@example.com' }) },
                { id: 'user-2', data: () => ({ email: 'user2@example.com' }) }
            ]

            const readAllSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'readAll')
                .mockResolvedValue(mockDocs)

            const result = await userController.readAll()

            expect(readAllSpy).toHaveBeenCalledWith('users')
            expect(result).toHaveLength(2)

            readAllSpy.mockRestore()
        })
    })

    describe('update', () => {
        it('should update user successfully', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(userController)), 'update')
                .mockResolvedValue()

            await userController.update('user-123', { username: 'newusername' })

            expect(updateSpy).toHaveBeenCalledWith('users', 'user-123', { username: 'newusername' })

            updateSpy.mockRestore()
        })
    })
})
