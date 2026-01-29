import { fetchReportByTestId } from '@/ux/accessibility/controllers/AccessibilityReportController'

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}))

jest.mock('@/app/plugins/firebase', () => ({
  db: {},
}))

describe('AccessibilityReportController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchReportByTestId', () => {
    it('should fetch report successfully when report exists', async () => {
      const testId = 'test-123'
      const mockReportData = {
        ReportId: testId,
        reportData: { issues: [], summary: 'Test report' },
      }

      const { collection, query, where, getDocs } = require('firebase/firestore')
      const mockQuery = {}
      const mockSnapshot = {
        empty: false,
        docs: [
          {
            id: 'report-123',
            data: () => mockReportData,
          },
        ],
      }

      collection.mockReturnValue({})
      where.mockReturnValue(mockQuery)
      query.mockReturnValue(mockQuery)
      getDocs.mockResolvedValue(mockSnapshot)

      const result = await fetchReportByTestId(testId)

      expect(collection).toHaveBeenCalledWith({}, 'report')
      expect(where).toHaveBeenCalledWith(expect.anything(), '==', testId)
      expect(getDocs).toHaveBeenCalled()
      expect(result).toEqual({
        id: 'report-123',
        ...mockReportData,
      })
    })

    it('should return null when no report exists', async () => {
      const testId = 'test-123'
      const mockSnapshot = {
        empty: true,
        docs: [],
      }

      const { collection, query, where, getDocs } = require('firebase/firestore')
      collection.mockReturnValue({})
      where.mockReturnValue({})
      query.mockReturnValue({})
      getDocs.mockResolvedValue(mockSnapshot)

      const result = await fetchReportByTestId(testId)

      expect(result).toBeNull()
    })

    it('should handle errors when fetching report', async () => {
      const testId = 'test-123'
      const mockError = new Error('Firestore error')

      const { collection, query, where, getDocs } = require('firebase/firestore')
      collection.mockReturnValue({})
      where.mockReturnValue({})
      query.mockReturnValue({})
      getDocs.mockRejectedValue(mockError)

      await expect(fetchReportByTestId(testId)).rejects.toThrow('Firestore error')
    })

    it('should return first report when multiple reports exist', async () => {
      const testId = 'test-123'
      const mockSnapshot = {
        empty: false,
        docs: [
          {
            id: 'report-1',
            data: () => ({ ReportId: testId, data: 'first' }),
          },
          {
            id: 'report-2',
            data: () => ({ ReportId: testId, data: 'second' }),
          },
        ],
      }

      const { collection, query, where, getDocs } = require('firebase/firestore')
      collection.mockReturnValue({})
      where.mockReturnValue({})
      query.mockReturnValue({})
      getDocs.mockResolvedValue(mockSnapshot)

      const result = await fetchReportByTestId(testId)

      expect(result).toEqual({
        id: 'report-1',
        ReportId: testId,
        data: 'first',
      })
    })
  })
})
