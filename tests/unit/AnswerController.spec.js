jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    updateDoc: jest.fn(),
    collection: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    increment: jest.fn((val) => ({ _increment: val }))
}))

jest.mock('@/app/plugins/firebase', () => ({
    db: {}
}))

jest.mock('../../src/features/auth/controllers/UserController', () => {
    return jest.fn().mockImplementation(() => ({
        getById: jest.fn(),
        update: jest.fn()
    }))
})

jest.mock('@/shared/constants/methodDefinitions', () => ({
    instantiateStudyAnswerByType: jest.fn((type, data) => data),
    STUDY_TYPES: {
        HEURISTIC: 'HEURISTIC',
        USER: 'USER'
    }
}))

jest.mock('@/ux/UserTest/models/UserStudyEvaluatorAnswer', () => {
    return jest.fn().mockImplementation((data) => ({
        ...data,
        toFirestore: jest.fn().mockReturnValue(data)
    }))
})

const AnswerController = require('@/shared/controllers/AnswerController').default

describe('AnswerController', () => {
    let answerController

    beforeEach(() => {
        jest.clearAllMocks()
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

    describe('updateTaskTranscriptionMeta', () => {
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

            expect(updateSpy).toHaveBeenCalledWith(
                'answers',
                'answer-123',
                expect.objectContaining({
                    'taskAnswers.user-456.tasks.task-1.latestTranscriptionDocId': 'transcription-789'
                })
            )

            updateSpy.mockRestore()
        })
    })
})
