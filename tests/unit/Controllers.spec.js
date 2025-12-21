import Controller from '@/app/plugins/firebase/FirebaseFirestoreRepository'
import StudyController from '@/controllers/StudyController'
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore'

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => {
  return {
    doc: jest.fn(),
    updateDoc: jest.fn(),
    collection: jest.fn(),
    getDoc: jest.fn(),
    addDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    deleteDoc: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    setDoc: jest.fn()
  }
})

// Mock the firebase db instance
jest.mock('@/app/plugins/firebase', () => {
  return {
    db: {}
  }
})

describe('Controller Error Handling', () => {
  let baseController
  let studyController

  beforeEach(() => {
    jest.clearAllMocks()

    baseController = new Controller()
    studyController = new StudyController()
  })

  describe('BaseController', () => {
    it('should rethrow errors in update method', async () => {
      const mockError = new Error('Update failed')
      doc.mockReturnValue('doc-ref')
      updateDoc.mockRejectedValue(mockError)

      await expect(baseController.update('collection', 'docId', {}))
        .rejects.toThrow(mockError)

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'collection/docId')
      expect(updateDoc).toHaveBeenCalledWith('doc-ref', {})
    })
  })

  describe('StudyController', () => {
    it('should rethrow errors in updateStudy method', async () => {
      const mockError = new Error('Update test failed')
      doc.mockReturnValue('doc-ref')
      updateDoc.mockRejectedValue(mockError)

      const payload = {
        id: 'test-id',
        toFirestore: jest.fn().mockReturnValue({})
      }

      await expect(studyController.updateStudy(payload))
        .rejects.toThrow(mockError)
    })

    it('should rethrow errors in getAllStudies method', async () => {
      const mockError = new Error('getAllStudies failed')

      jest.spyOn(Controller.prototype, 'readAll').mockRejectedValue(mockError)

      await expect(studyController.getAllStudies())
        .rejects.toThrow(mockError)
    })
  })
}) 
