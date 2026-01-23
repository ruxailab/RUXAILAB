import ReportController from '@/shared/controllers/ReportController'
import { createControllerSpies, createMockDoc } from './helpers/testUtils'

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    updateDoc: jest.fn(),
    collection: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    deleteField: jest.fn(() => 'DELETE_FIELD_SENTINEL')
}))

jest.mock('@/app/plugins/firebase', () => ({
    db: {}
}))

jest.mock('@/shared/constants/methodDefinitions', () => ({
    STUDY_TYPES: {
        HEURISTIC: 'HEURISTIC',
        USER: 'USER'
    }
}))

describe('ReportController', () => {
    let reportController
    let spies
    let consoleErrorSpy

    const mockReport = { userDocId: 'user-123' }
    const mockTestHeuristic = { id: 'test-456', answersDocId: 'answer-789', testType: 'HEURISTIC' }
    const mockTestUser = { id: 'test-456', answersDocId: 'answer-789', testType: 'USER' }

    beforeEach(() => {
        jest.clearAllMocks()
        reportController = new ReportController()
        spies = createControllerSpies(reportController)
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        spies.restore()
        consoleErrorSpy.mockRestore()
    })

    describe('Structure', () => {
        it('should have removeReport method', () => {
            expect(typeof reportController.removeReport).toBe('function')
        })
    })

    describe('removeReport', () => {
        const setupMocks = (userExists = true, answerExists = true) => {
            spies.mockReadOne(createMockDoc(userExists))
            spies.mockReadOne(createMockDoc(answerExists))
            spies.mockUpdate()
            spies.mockDeleteField()
        }

        it('should use heuristicAnswers for HEURISTIC test type', async () => {
            setupMocks()
            const result = await reportController.removeReport({ report: mockReport, test: mockTestHeuristic })

            expect(spies.update).toHaveBeenCalledWith('answers', 'answer-789', { 'heuristicAnswers.user-123': 'DELETE_FIELD_SENTINEL' })
            expect(result).toEqual({ success: true })
        })

        it('should use taskAnswers for USER test type', async () => {
            setupMocks()
            const result = await reportController.removeReport({ report: mockReport, test: mockTestUser })

            expect(spies.update).toHaveBeenCalledWith('answers', 'answer-789', { 'taskAnswers.user-123': 'DELETE_FIELD_SENTINEL' })
            expect(result).toEqual({ success: true })
        })

        it('should remove user reference when user document exists', async () => {
            setupMocks()
            await reportController.removeReport({ report: mockReport, test: mockTestHeuristic })

            expect(spies.update).toHaveBeenCalledWith('users', 'user-123', { 'myAnswers.test-456': 'DELETE_FIELD_SENTINEL' })
        })

        it('should not update user when user document does not exist', async () => {
            setupMocks(false, true)
            await reportController.removeReport({ report: mockReport, test: mockTestHeuristic })

            expect(spies.update).toHaveBeenCalledTimes(1)
            expect(spies.update).toHaveBeenCalledWith('answers', 'answer-789', expect.anything())
        })

        it('should not update answer when answer document does not exist', async () => {
            setupMocks(true, false)
            await reportController.removeReport({ report: mockReport, test: mockTestHeuristic })

            expect(spies.update).toHaveBeenCalledTimes(1)
            expect(spies.update).toHaveBeenCalledWith('users', 'user-123', expect.anything())
        })

        it('should return error when operation fails', async () => {
            const mockError = new Error('Firestore error')
            spies.readOne.mockRejectedValue(mockError)

            const result = await reportController.removeReport({ report: mockReport, test: mockTestHeuristic })

            expect(result).toEqual({ success: false, error: mockError })
        })
    })
})
