const mockGetAnswerById = jest.fn()
const mockGetMyStudyAnswer = jest.fn()

jest.mock('@/shared/controllers/AnswerController', () => {
  return jest.fn().mockImplementation(() => ({
    getAnswerById: mockGetAnswerById,
    getMyStudyAnswer: mockGetMyStudyAnswer,
  }))
})

jest.mock('@/shared/utils/toast', () => ({
  showError: jest.fn(),
}))

jest.mock('@/ux/Heuristic/utils/statistics', () => ({
  percentage: jest.fn(),
  formatTimeSpentFromMs: jest.fn(),
}))

const AnswerStore = require('@/shared/store/Answer').default
const { showError } = require('@/shared/utils/toast')

describe('Answer store', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCurrentTestAnswerDoc', () => {
    it('falls back to getMyStudyAnswer when the full answer document is denied', async () => {
      const permissionError = new Error('Missing or insufficient permissions')
      permissionError.code = 'permission-denied'
      const ownAnswerDoc = {
        id: 'answer-1',
        type: 'USER',
        taskAnswers: {
          'user-1': { userDocId: 'user-1' },
        },
      }

      mockGetAnswerById.mockRejectedValue(permissionError)
      mockGetMyStudyAnswer.mockResolvedValue(ownAnswerDoc)

      const commit = jest.fn()

      await AnswerStore.actions.getCurrentTestAnswerDoc({
        commit,
        rootState: {
          Tests: {
            Test: {
              id: 'study-1',
              answersDocId: 'answer-1',
            },
          },
        },
      })

      expect(mockGetAnswerById).toHaveBeenCalledWith('answer-1')
      expect(mockGetMyStudyAnswer).toHaveBeenCalledWith('study-1')
      expect(commit).toHaveBeenCalledWith('SET_ANSWER_DOCUMENT', ownAnswerDoc)
      expect(showError).not.toHaveBeenCalled()
    })
  })
})
