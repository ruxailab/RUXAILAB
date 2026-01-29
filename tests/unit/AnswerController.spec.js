const mockIncrement = jest.fn((val) => ({ _increment: val }))

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    updateDoc: jest.fn(),
    collection: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    increment: (...args) => mockIncrement(...args)
}))

jest.mock('@/app/plugins/firebase', () => ({
    db: {}
}))

const mockGetById = jest.fn()
const mockUpdate = jest.fn()

jest.mock('../../src/features/auth/controllers/UserController', () => {
    return jest.fn().mockImplementation(() => ({
        getById: mockGetById,
        update: mockUpdate
    }))
})

jest.mock('@/shared/constants/methodDefinitions', () => ({
    instantiateStudyAnswerByType: jest.fn((type, data) => data),
    STUDY_TYPES: {
        HEURISTIC: 'HEURISTIC',
        USER: 'USER'
    }
}))

const MockUserStudyEvaluatorAnswer = jest.fn().mockImplementation(function(data) {
    Object.assign(this, data)
    this.toFirestore = jest.fn(() => data)
})

jest.mock('@/ux/UserTest/models/UserStudyEvaluatorAnswer', () => {
    return MockUserStudyEvaluatorAnswer
})

const AnswerController = require('@/shared/controllers/AnswerController').default

describe('AnswerController', () => {
    let answerController

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetById.mockClear()
        mockUpdate.mockClear()
        mockIncrement.mockClear()
        mockIncrement.mockImplementation((val) => ({ _increment: val }))
        MockUserStudyEvaluatorAnswer.mockClear()
        MockUserStudyEvaluatorAnswer.mockImplementation(function(data) {
            Object.assign(this, data)
            this.toFirestore = jest.fn(() => data)
        })
        answerController = new AnswerController()
    })

    describe('Structure', () => {
        it('should have getAnswerById method', () => {
            expect(typeof answerController.getAnswerById).toBe('function')
        })

        it('should have createAnswer method', () => {
            expect(typeof answerController.createAnswer).toBe('function')
        })

        it('should have updateUserAnswer method', () => {
            expect(typeof answerController.updateUserAnswer).toBe('function')
        })

        it('should have removeUserAnswer method', () => {
            expect(typeof answerController.removeUserAnswer).toBe('function')
        })

        it('should have saveTestAnswer method', () => {
            expect(typeof answerController.saveTestAnswer).toBe('function')
        })

        it('should have updateTaskAnswer method', () => {
            expect(typeof answerController.updateTaskAnswer).toBe('function')
        })

        it('should have updateTaskTranscriptionMeta method', () => {
            expect(typeof answerController.updateTaskTranscriptionMeta).toBe('function')
        })
    })

    describe('createAnswer', () => {
        it('should call parent create with correct collection', async () => {
            const mockPayload = {
                type: 'HEURISTIC',
                toFirestore: jest.fn().mockReturnValue({ type: 'HEURISTIC' })
            }
            const createSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'create')
                .mockResolvedValue({ id: 'new-answer-id' })

            const result = await answerController.createAnswer(mockPayload)

            expect(createSpy).toHaveBeenCalledWith('answers', { type: 'HEURISTIC' })
            expect(result).toEqual({ id: 'new-answer-id' })

            createSpy.mockRestore()
        })

        it('should throw error when create fails', async () => {
            const mockError = new Error('Create failed')
            const mockPayload = {
                toFirestore: jest.fn().mockReturnValue({})
            }
            const createSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'create')
                .mockRejectedValue(mockError)

            await expect(answerController.createAnswer(mockPayload)).rejects.toThrow(mockError)

            createSpy.mockRestore()
        })
    })

    describe('getAnswerById', () => {
        it('should fetch answer by id successfully', async () => {
            const mockAnswerData = {
                type: 'HEURISTIC',
                data: 'test data'
            }
            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'readOne')
                .mockResolvedValue({
                    id: 'answer-123',
                    data: () => mockAnswerData
                })

            const { instantiateStudyAnswerByType } = require('@/shared/constants/methodDefinitions')
            instantiateStudyAnswerByType.mockReturnValue({ id: 'answer-123', ...mockAnswerData })

            const result = await answerController.getAnswerById('answer-123')

            expect(readOneSpy).toHaveBeenCalledWith('answers', 'answer-123')
            expect(instantiateStudyAnswerByType).toHaveBeenCalledWith('HEURISTIC', {
                id: 'answer-123',
                ...mockAnswerData
            })
            expect(result).toEqual({ id: 'answer-123', ...mockAnswerData })

            readOneSpy.mockRestore()
        })

        it('should handle errors when fetching answer', async () => {
            const mockError = new Error('Answer not found')
            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'readOne')
                .mockRejectedValue(mockError)

            await expect(answerController.getAnswerById('answer-123')).rejects.toThrow(mockError)

            readOneSpy.mockRestore()
        })
    })

    describe('updateUserAnswer', () => {
        it('should update user answer successfully', async () => {
            const mockUser = {
                id: 'user-123',
                myAnswers: {
                    'test-456': { existing: 'data' }
                },
                toFirestore: jest.fn().mockReturnValue({
                    id: 'user-123',
                    myAnswers: {
                        'test-456': { existing: 'data', new: 'data' }
                    }
                })
            }
            mockGetById.mockResolvedValue(mockUser)
            mockUpdate.mockResolvedValue()

            const payload = {
                cooperatorId: 'user-123',
                testDocId: 'test-456',
                data: { new: 'data' }
            }

            await answerController.updateUserAnswer(payload)

            expect(mockGetById).toHaveBeenCalledWith('user-123')
            expect(mockUpdate).toHaveBeenCalled()
            expect(mockUser.myAnswers['test-456']).toEqual({ existing: 'data', new: 'data' })
        })

        it('should handle errors when updating user answer', async () => {
            const mockError = new Error('User not found')
            mockGetById.mockRejectedValue(mockError)

            const payload = {
                cooperatorId: 'user-123',
                testDocId: 'test-456',
                data: { new: 'data' }
            }

            await expect(answerController.updateUserAnswer(payload)).rejects.toThrow('User not found')
        })
    })

    describe('removeUserAnswer', () => {
        it('should remove user answer successfully', async () => {
            const deleteSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'delete')
                .mockResolvedValue()

            const mockUser = {
                id: 'user-123',
                myAnswers: {
                    'test-456': { testDocId: 'answer-789' }
                },
                toFirestore: jest.fn().mockReturnValue({
                    id: 'user-123',
                    myAnswers: {}
                })
            }
            mockGetById.mockResolvedValue(mockUser)
            mockUpdate.mockResolvedValue()

            const payload = {
                cooperatorId: 'user-123',
                testDocId: 'test-456'
            }

            await answerController.removeUserAnswer(payload)

            expect(mockGetById).toHaveBeenCalledWith('user-123')
            expect(deleteSpy).toHaveBeenCalledWith('answers', 'answer-789')
            expect(mockUpdate).toHaveBeenCalled()
            expect(mockUser.myAnswers).not.toHaveProperty('test-456')

            deleteSpy.mockRestore()
        })

        it('should handle errors when removing user answer', async () => {
            const mockError = new Error('User not found')
            mockGetById.mockRejectedValue(mockError)

            const payload = {
                cooperatorId: 'user-123',
                testDocId: 'test-456'
            }

            await expect(answerController.removeUserAnswer(payload)).rejects.toThrow('User not found')
        })
    })

    describe('saveTestAnswer', () => {
        it('should save heuristic test answer', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockResolvedValue()

            const { STUDY_TYPES } = require('@/shared/constants/methodDefinitions')
            const mockPayload = {
                userDocId: 'user-123',
                toFirestore: jest.fn().mockReturnValue({ answer: 'data' })
            }

            await answerController.saveTestAnswer(mockPayload, 'answer-456', STUDY_TYPES.HEURISTIC)

            expect(updateSpy).toHaveBeenCalledWith(
                'answers',
                'answer-456',
                expect.objectContaining({
                    'heuristicAnswers.user-123': { answer: 'data' }
                })
            )

            updateSpy.mockRestore()
        })

        it('should save user test answer with userDocId', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockResolvedValue()

            const { STUDY_TYPES } = require('@/shared/constants/methodDefinitions')
            const mockPayload = {
                userDocId: 'user-123',
                toFirestore: jest.fn().mockReturnValue({ answer: 'data' })
            }

            await answerController.saveTestAnswer(mockPayload, 'answer-456', STUDY_TYPES.USER)

            expect(updateSpy).toHaveBeenCalledWith(
                'answers',
                'answer-456',
                expect.objectContaining({
                    'taskAnswers.user-123': { answer: 'data' }
                })
            )

            updateSpy.mockRestore()
        })

        it('should save anonymous user test answer without userDocId', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockResolvedValue()

            const getAnswerByIdSpy = jest.spyOn(answerController, 'getAnswerById')
                .mockResolvedValue({
                    taskAnswers: {
                        'user-1': {},
                        'user-2': {}
                    }
                })

            const { STUDY_TYPES } = require('@/shared/constants/methodDefinitions')
            const mockPayload = {
                toFirestore: jest.fn().mockReturnValue({ answer: 'data' })
            }

            await answerController.saveTestAnswer(mockPayload, 'answer-456', STUDY_TYPES.USER)

            expect(getAnswerByIdSpy).toHaveBeenCalledWith('answer-456')
            expect(updateSpy).toHaveBeenCalledWith(
                'answers',
                'answer-456',
                expect.objectContaining({
                    'taskAnswers.Ev3': { answer: 'data' }
                })
            )

            updateSpy.mockRestore()
            getAnswerByIdSpy.mockRestore()
        })

        it('should handle empty taskAnswers for anonymous answer', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockResolvedValue()

            const getAnswerByIdSpy = jest.spyOn(answerController, 'getAnswerById')
                .mockResolvedValue({
                    taskAnswers: {}
                })

            const { STUDY_TYPES } = require('@/shared/constants/methodDefinitions')
            const mockPayload = {
                toFirestore: jest.fn().mockReturnValue({ answer: 'data' })
            }

            await answerController.saveTestAnswer(mockPayload, 'answer-456', STUDY_TYPES.USER)

            expect(updateSpy).toHaveBeenCalledWith(
                'answers',
                'answer-456',
                expect.objectContaining({
                    'taskAnswers.Ev1': { answer: 'data' }
                })
            )

            updateSpy.mockRestore()
            getAnswerByIdSpy.mockRestore()
        })

        it('anonymous answer when taskAnswers is null', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockResolvedValue()

            const getAnswerByIdSpy = jest.spyOn(answerController, 'getAnswerById')
                .mockResolvedValue({
                    taskAnswers: null
                })

            const { STUDY_TYPES } = require('@/shared/constants/methodDefinitions')
            const mockPayload = {
                toFirestore: jest.fn().mockReturnValue({ answer: 'data' })
            }

            await answerController.saveTestAnswer(mockPayload, 'answer-456', STUDY_TYPES.USER)

            expect(getAnswerByIdSpy).toHaveBeenCalledWith('answer-456')
            expect(updateSpy).toHaveBeenCalledWith(
                'answers',
                'answer-456',
                expect.objectContaining({
                    'taskAnswers.Ev1': { answer: 'data' }
                })
            )

            updateSpy.mockRestore()
            getAnswerByIdSpy.mockRestore()
        })

        it('anonymous answer when taskAnswers not set', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockResolvedValue()

            const getAnswerByIdSpy = jest.spyOn(answerController, 'getAnswerById')
                .mockResolvedValue({})

            const { STUDY_TYPES } = require('@/shared/constants/methodDefinitions')
            const mockPayload = {
                toFirestore: jest.fn().mockReturnValue({ answer: 'data' })
            }

            await answerController.saveTestAnswer(mockPayload, 'answer-456', STUDY_TYPES.USER)

            expect(getAnswerByIdSpy).toHaveBeenCalledWith('answer-456')
            expect(updateSpy).toHaveBeenCalledWith(
                'answers',
                'answer-456',
                expect.objectContaining({
                    'taskAnswers.Ev1': { answer: 'data' }
                })
            )

            updateSpy.mockRestore()
            getAnswerByIdSpy.mockRestore()
        })

        it('should handle errors when saving test answer', async () => {
            const mockError = new Error('Update failed')
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockRejectedValue(mockError)

            const { STUDY_TYPES } = require('@/shared/constants/methodDefinitions')
            const mockPayload = {
                userDocId: 'user-123',
                toFirestore: jest.fn().mockReturnValue({ answer: 'data' })
            }

            await expect(
                answerController.saveTestAnswer(mockPayload, 'answer-456', STUDY_TYPES.HEURISTIC)
            ).rejects.toThrow(mockError)

            updateSpy.mockRestore()
        })
    })

    describe('updateTaskAnswer', () => {
        it('should update task answer successfully', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockResolvedValue()

            const mockPayload = {
                userDocId: 'user-123',
                taskId: 'task-1',
                answer: 'test answer'
            }

            await answerController.updateTaskAnswer(mockPayload, 'answer-456')

            expect(MockUserStudyEvaluatorAnswer).toHaveBeenCalledWith(expect.objectContaining({
                userDocId: 'user-123',
                taskId: 'task-1',
                answer: 'test answer'
            }))
            expect(updateSpy).toHaveBeenCalledWith(
                'answers',
                'answer-456',
                expect.objectContaining({
                    'taskAnswers.user-123': expect.any(Object)
                })
            )

            updateSpy.mockRestore()
        })

        it('should handle errors when updating task answer', async () => {
            const mockError = new Error('Update failed')
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockRejectedValue(mockError)

            const mockPayload = {
                userDocId: 'user-123',
                taskId: 'task-1',
                answer: 'test answer'
            }

            await expect(
                answerController.updateTaskAnswer(mockPayload, 'answer-456')
            ).rejects.toThrow('Update failed')

            updateSpy.mockRestore()
        })
    })

    describe('updateTaskTranscriptionMeta', () => {
        beforeEach(() => {
            mockIncrement.mockClear()
        })

        it('should call update with correct field paths', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockResolvedValue()

            await answerController.updateTaskTranscriptionMeta({
                answersDocId: 'answer-123',
                userDocId: 'user-456',
                taskId: 'task-1',
                latestId: 'transcription-789',
                inc: 1
            })

            expect(mockIncrement).toHaveBeenCalledWith(1)
            expect(updateSpy).toHaveBeenCalled()
            const updateCall = updateSpy.mock.calls[0]
            expect(updateCall[0]).toBe('answers')
            expect(updateCall[1]).toBe('answer-123')
            const updateData = updateCall[2]
            const transcriptionKey = 'taskAnswers.user-456.tasks.task-1.latestTranscriptionDocId'
            const countKey = 'taskAnswers.user-456.tasks.task-1.transcriptionsCount'
            expect(updateData[transcriptionKey]).toBe('transcription-789')
            expect(updateData[countKey]).toBeDefined()
            expect(updateData[countKey]).toEqual({ _increment: 1 })

            updateSpy.mockRestore()
        })

        it('should use default increment value of 1', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockResolvedValue()

            await answerController.updateTaskTranscriptionMeta({
                answersDocId: 'answer-123',
                userDocId: 'user-456',
                taskId: 'task-1',
                latestId: 'transcription-789'
            })

            expect(mockIncrement).toHaveBeenCalledWith(1)
            expect(updateSpy).toHaveBeenCalled()
            const updateCall = updateSpy.mock.calls[0]
            const updateData = updateCall[2]
            const countKey = 'taskAnswers.user-456.tasks.task-1.transcriptionsCount'
            expect(updateData[countKey]).toBeDefined()
            expect(updateData[countKey]).toEqual({ _increment: 1 })

            updateSpy.mockRestore()
        })

        it('should handle custom increment value', async () => {
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockResolvedValue()

            await answerController.updateTaskTranscriptionMeta({
                answersDocId: 'answer-123',
                userDocId: 'user-456',
                taskId: 'task-1',
                latestId: 'transcription-789',
                inc: 5
            })

            expect(mockIncrement).toHaveBeenCalledWith(5)
            expect(updateSpy).toHaveBeenCalledWith('answers', 'answer-123', expect.any(Object))

            updateSpy.mockRestore()
        })

        it('should handle errors when updating transcription meta', async () => {
            const mockError = new Error('Update failed')
            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(answerController)), 'update')
                .mockRejectedValue(mockError)

            await expect(
                answerController.updateTaskTranscriptionMeta({
                    answersDocId: 'answer-123',
                    userDocId: 'user-456',
                    taskId: 'task-1',
                    latestId: 'transcription-789',
                    inc: 1
                })
            ).rejects.toThrow(mockError)

            updateSpy.mockRestore()
        })
    })
})
