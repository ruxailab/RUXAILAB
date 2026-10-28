import ReportController from '@/shared/controllers/ReportController'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'
import { deleteTranscriptionsByUser } from '@/app/services/transcription/TranscriptionService'
import { deleteSentimentsByUser } from '@/app/services/facialSentiment/FacialSentimentService'

jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {
    callHttpsCallableFunction: jest.fn(),
  },
}))

jest.mock('@/shared/constants/methodDefinitions', () => ({
  STUDY_TYPES: {
    HEURISTIC: 'HEURISTIC',
    USER: 'USER',
    CARD_SORTING: 'CARD_SORTING',
  },
  normalizeStudyType: (type) => {
    const normalized = String(type || '').toUpperCase()
    return normalized === 'HEURISTICS' ? 'HEURISTIC' : normalized
  },
}))

jest.mock('@/app/services/transcription/TranscriptionService', () => ({
  deleteTranscriptionsByUser: jest.fn(),
}))

jest.mock('@/app/services/facialSentiment/FacialSentimentService', () => ({
  deleteSentimentsByUser: jest.fn(),
}))

describe('ReportController', () => {
  let reportController
  let consoleErrorSpy

  const mockReport = { userDocId: 'user-123' }
  const mockTestHeuristic = {
    id: 'test-456',
    answersDocId: 'answer-789',
    testType: 'HEURISTIC',
  }
  const mockTestUser = {
    id: 'test-456',
    answersDocId: 'answer-789',
    testType: 'USER',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    reportController = new ReportController()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    FirebaseFunctionsController.callHttpsCallableFunction.mockResolvedValue({
      data: { success: true },
    })
    deleteTranscriptionsByUser.mockResolvedValue({
      deletedCount: 0,
      answersDocId: 'answer-789',
      userDocId: 'user-123',
    })
    deleteSentimentsByUser.mockResolvedValue({
      deletedCount: 0,
      answersDocId: 'answer-789',
      userDocId: 'user-123',
    })
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('Structure', () => {
    it('should have removeReport method', () => {
      expect(typeof reportController.removeReport).toBe('function')
    })

    it('should have setReportHidden method', () => {
      expect(typeof reportController.setReportHidden).toBe('function')
    })
  })

  describe('setReportHidden', () => {
    it.each([
      ['USER', 'USER'],
      ['HEURISTIC', 'HEURISTIC'],
      ['CARD_SORTING', 'CARD_SORTING'],
    ])('hides a %s report through the callable', async (testType) => {
      const result = await reportController.setReportHidden({
        report: mockReport,
        test: { ...mockTestUser, testType },
        hidden: true,
      })

      expect(
        FirebaseFunctionsController.callHttpsCallableFunction,
      ).toHaveBeenCalledWith('setStudyReportHidden', {
        answersDocId: 'answer-789',
        userDocId: 'user-123',
        studyId: 'test-456',
        answerType: testType,
        hidden: true,
      })
      expect(result).toEqual({ success: true })
    })
  })

  describe('removeReport', () => {
    it('should use heuristicAnswers for HEURISTIC test type', async () => {
      const result = await reportController.removeReport({
        report: mockReport,
        test: mockTestHeuristic,
      })

      expect(
        FirebaseFunctionsController.callHttpsCallableFunction,
      ).toHaveBeenCalledWith('removeStudyReport', {
        answersDocId: 'answer-789',
        userDocId: 'user-123',
        studyId: 'test-456',
        answerType: 'HEURISTIC',
      })
      expect(deleteTranscriptionsByUser).not.toHaveBeenCalled()
      expect(deleteSentimentsByUser).not.toHaveBeenCalled()
      expect(result).toEqual({ success: true })
    })

    it('cascades from the answers document type when test.testType is missing', async () => {
      await reportController.removeReport({
        report: mockReport,
        test: { id: 'test-456', answersDocId: 'answer-789' },
        answerType: 'USER',
      })

      expect(deleteTranscriptionsByUser).toHaveBeenCalled()
      expect(deleteSentimentsByUser).toHaveBeenCalled()
    })

    it('should use taskAnswers for USER test type and cascade transcriptions and sentiments', async () => {
      const result = await reportController.removeReport({
        report: mockReport,
        test: mockTestUser,
      })

      const cascadePayload = {
        answersDocId: 'answer-789',
        userDocId: 'user-123',
        studyId: 'test-456',
      }
      expect(
        FirebaseFunctionsController.callHttpsCallableFunction,
      ).toHaveBeenCalledWith('removeStudyReport', {
        ...cascadePayload,
        answerType: 'USER',
      })
      expect(deleteTranscriptionsByUser).toHaveBeenCalledWith(cascadePayload)
      expect(deleteSentimentsByUser).toHaveBeenCalledWith(cascadePayload)
      expect(result).toEqual({ success: true })
    })

    it('should return error when the callable fails', async () => {
      const mockError = new Error('permission-denied')
      FirebaseFunctionsController.callHttpsCallableFunction.mockRejectedValue(
        mockError,
      )

      const result = await reportController.removeReport({
        report: mockReport,
        test: mockTestHeuristic,
      })

      expect(result).toEqual({ success: false, error: mockError })
      expect(deleteTranscriptionsByUser).not.toHaveBeenCalled()
      expect(deleteSentimentsByUser).not.toHaveBeenCalled()
    })

    it('should return error when transcription cascade fails for USER study', async () => {
      const mockError = new Error('Cascade failed')
      deleteTranscriptionsByUser.mockRejectedValue(mockError)

      const result = await reportController.removeReport({
        report: mockReport,
        test: mockTestUser,
      })

      expect(result).toEqual({ success: false, error: mockError })
    })

    it('should return error when sentiment cascade fails for USER study', async () => {
      const mockError = new Error('Sentiment cascade failed')
      deleteSentimentsByUser.mockRejectedValue(mockError)

      const result = await reportController.removeReport({
        report: mockReport,
        test: mockTestUser,
      })

      expect(result).toEqual({ success: false, error: mockError })
    })
  })
})
