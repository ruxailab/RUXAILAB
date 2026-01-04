import ReportController from '@/shared/controllers/ReportController'

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

    beforeEach(() => {
        jest.clearAllMocks()
        reportController = new ReportController()
    })

    describe('Structure', () => {
        it('should have removeReport method', () => {
            expect(typeof reportController.removeReport).toBe('function')
        })
    })

    describe('removeReport', () => {
        const mockReport = {
            userDocId: 'user-123'
        }

        const mockTestHeuristic = {
            id: 'test-456',
            answersDocId: 'answer-789',
            testType: 'HEURISTIC'
        }

        const mockTestUser = {
            id: 'test-456',
            answersDocId: 'answer-789',
            testType: 'USER'
        }

        it('should use heuristicAnswers for HEURISTIC test type', async () => {
            const mockUserDoc = { exists: () => true }
            const mockAnswerDoc = { exists: () => true }

            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'readOne')
                .mockResolvedValueOnce(mockUserDoc)
                .mockResolvedValueOnce(mockAnswerDoc)

            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'update')
                .mockResolvedValue()

            jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'getDeleteField')
                .mockReturnValue('DELETE_FIELD_SENTINEL')

            const result = await reportController.removeReport({
                report: mockReport,
                test: mockTestHeuristic
            })

            expect(updateSpy).toHaveBeenCalledWith(
                'answers',
                'answer-789',
                { 'heuristicAnswers.user-123': 'DELETE_FIELD_SENTINEL' }
            )
            expect(result).toEqual({ success: true })

            readOneSpy.mockRestore()
            updateSpy.mockRestore()
        })

        it('should use taskAnswers for USER test type', async () => {
            const mockUserDoc = { exists: () => true }
            const mockAnswerDoc = { exists: () => true }

            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'readOne')
                .mockResolvedValueOnce(mockUserDoc)
                .mockResolvedValueOnce(mockAnswerDoc)

            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'update')
                .mockResolvedValue()

            jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'getDeleteField')
                .mockReturnValue('DELETE_FIELD_SENTINEL')

            const result = await reportController.removeReport({
                report: mockReport,
                test: mockTestUser
            })

            expect(updateSpy).toHaveBeenCalledWith(
                'answers',
                'answer-789',
                { 'taskAnswers.user-123': 'DELETE_FIELD_SENTINEL' }
            )
            expect(result).toEqual({ success: true })

            readOneSpy.mockRestore()
            updateSpy.mockRestore()
        })

        it('should remove user reference when user document exists', async () => {
            const mockUserDoc = { exists: () => true }
            const mockAnswerDoc = { exists: () => true }

            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'readOne')
                .mockResolvedValueOnce(mockUserDoc)
                .mockResolvedValueOnce(mockAnswerDoc)

            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'update')
                .mockResolvedValue()

            jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'getDeleteField')
                .mockReturnValue('DELETE_FIELD_SENTINEL')

            await reportController.removeReport({
                report: mockReport,
                test: mockTestHeuristic
            })

            expect(updateSpy).toHaveBeenCalledWith(
                'users',
                'user-123',
                { 'myAnswers.test-456': 'DELETE_FIELD_SENTINEL' }
            )

            readOneSpy.mockRestore()
            updateSpy.mockRestore()
        })

        it('should not update user when user document does not exist', async () => {
            const mockUserDoc = { exists: () => false }
            const mockAnswerDoc = { exists: () => true }

            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'readOne')
                .mockResolvedValueOnce(mockUserDoc)
                .mockResolvedValueOnce(mockAnswerDoc)

            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'update')
                .mockResolvedValue()

            jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'getDeleteField')
                .mockReturnValue('DELETE_FIELD_SENTINEL')

            await reportController.removeReport({
                report: mockReport,
                test: mockTestHeuristic
            })

            // Should only be called once for answers, not for users
            expect(updateSpy).toHaveBeenCalledTimes(1)
            expect(updateSpy).toHaveBeenCalledWith(
                'answers',
                'answer-789',
                expect.anything()
            )

            readOneSpy.mockRestore()
            updateSpy.mockRestore()
        })

        it('should not update answer when answer document does not exist', async () => {
            const mockUserDoc = { exists: () => true }
            const mockAnswerDoc = { exists: () => false }

            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'readOne')
                .mockResolvedValueOnce(mockUserDoc)
                .mockResolvedValueOnce(mockAnswerDoc)

            const updateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'update')
                .mockResolvedValue()

            jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'getDeleteField')
                .mockReturnValue('DELETE_FIELD_SENTINEL')

            await reportController.removeReport({
                report: mockReport,
                test: mockTestHeuristic
            })

            // Should only be called once for users, not for answers
            expect(updateSpy).toHaveBeenCalledTimes(1)
            expect(updateSpy).toHaveBeenCalledWith(
                'users',
                'user-123',
                expect.anything()
            )

            readOneSpy.mockRestore()
            updateSpy.mockRestore()
        })

        it('should return error when operation fails', async () => {
            const mockError = new Error('Firestore error')

            const readOneSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(reportController)), 'readOne')
                .mockRejectedValue(mockError)

            const result = await reportController.removeReport({
                report: mockReport,
                test: mockTestHeuristic
            })

            expect(result).toEqual({
                success: false,
                error: mockError
            })

            readOneSpy.mockRestore()
        })
    })
})
