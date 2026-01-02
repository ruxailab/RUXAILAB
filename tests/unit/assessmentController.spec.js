jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'collectionRef'),
  query: jest.fn((...args) => ({ __query: args })),
  where: jest.fn((...args) => ({ __where: args })),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}))

jest.mock('@/app/plugins/firebase', () => ({
  db: {},
}))

const { getUserAssessments } = require('@/ux/accessibility/controllers/assessmentController')

describe('assessmentController', () => {
  describe('getUserAssessments', () => {
    it('returns mapped assessments for a user', async () => {
      const { collection, where, query, getDocs } = require('firebase/firestore')

      getDocs.mockResolvedValue({
        docs: [
          { id: 'doc-1', data: () => ({ userId: 'user-1', testId: 'test-1' }) },
          { id: 'doc-2', data: () => ({ userId: 'user-1', testId: 'test-2' }) },
        ],
      })

      const result = await getUserAssessments('user-1')

      expect(collection).toHaveBeenCalledWith({}, 'assessments')
      expect(where).toHaveBeenCalledWith('userId', '==', 'user-1')
      expect(query).toHaveBeenCalled()
      expect(getDocs).toHaveBeenCalled()
      expect(result).toEqual([
        { id: 'doc-1', userId: 'user-1', testId: 'test-1' },
        { id: 'doc-2', userId: 'user-1', testId: 'test-2' },
      ])
    })
  })
})
