import StudyController from '@/controllers/StudyController'
import { createControllerSpies } from './helpers/testUtils'
import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {
    callHttpsCallableFunction: jest.fn(),
  },
}))

const mockCallHttpsCallableFunction =
  FirebaseFunctionsController.callHttpsCallableFunction

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  deleteDoc: jest.fn(),
  increment: jest.fn((val) => ({ _increment: val })),
}))

jest.mock('@/app/plugins/firebase', () => ({
  db: {},
}))

jest.mock('@/shared/controllers/AnswerController', () => {
  return jest.fn().mockImplementation(() => ({
    createAnswer: jest.fn(),
    updateUserAnswer: jest.fn(),
    removeUserAnswer: jest.fn(),
  }))
})

jest.mock('@/features/auth/controllers/UserController', () => {
  return jest.fn().mockImplementation(() => ({
    removeTestFromUser: jest.fn(),
    removeNotificationsForTest: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
  }))
})

jest.mock('@/features/auth/models/UserAnswer', () => {
  return jest.fn().mockImplementation((data) => ({
    ...data,
    toFirestore: jest.fn().mockReturnValue(data),
  }))
})

jest.mock('@/shared/models/StudyAnswer', () => {
  return jest.fn().mockImplementation((data) => ({
    ...data,
    toFirestore: jest.fn().mockReturnValue(data),
  }))
})

jest.mock('@/shared/constants/methodDefinitions', () => ({
  instantiateStudyByType: jest.fn((type, data) => ({
    ...data,
    testType: type,
  })),
}))

describe('StudyController', () => {
  let studyController
  let spies
  let mockAnswerController
  let mockUserController

  beforeEach(() => {
    jest.clearAllMocks()

    mockCallHttpsCallableFunction.mockResolvedValue({
      data: { status: 'ok' },
    })

    const AnswerController = require('@/shared/controllers/AnswerController')
    const UserController = require('@/features/auth/controllers/UserController')

    mockAnswerController = {
      createAnswer: jest.fn().mockResolvedValue({ id: 'answer-default' }),
    }

    mockUserController = {
      removeTestFromUser: jest.fn().mockResolvedValue(),
      removeNotificationsForTest: jest.fn().mockResolvedValue(),
      update: jest.fn().mockResolvedValue(),
      getById: jest.fn().mockResolvedValue(),
    }

    AnswerController.mockImplementation(() => mockAnswerController)
    UserController.mockImplementation(() => mockUserController)

    studyController = new StudyController()
    spies = createControllerSpies(studyController)
  })

  afterEach(() => {
    spies.restore()
  })

  describe('Structure', () => {
    it('should have createStudy method', () => {
      expect(typeof studyController.createStudy).toBe('function')
    })

    it('should have duplicateStudy method', () => {
      expect(typeof studyController.duplicateStudy).toBe('function')
    })

    it('should have deleteStudy method', () => {
      expect(typeof studyController.deleteStudy).toBe('function')
    })

    it('should have updateStudy method', () => {
      expect(typeof studyController.updateStudy).toBe('function')
    })

    it('should have acceptStudyCollaboration method', () => {
      expect(typeof studyController.acceptStudyCollaboration).toBe('function')
    })

    it('should have getStudy method', () => {
      expect(typeof studyController.getStudy).toBe('function')
    })

    it('should have getPublicStudies method', () => {
      expect(typeof studyController.getPublicStudies).toBe('function')
    })

    it('should have getAllStudies method', () => {
      expect(typeof studyController.getAllStudies).toBe('function')
    })

    it('should have subscribeToStudy method', () => {
      expect(typeof studyController.subscribeToStudy).toBe('function')
    })
  })

  describe('createStudy', () => {
    it('should call create method on parent with correct collection', async () => {
      spies.create.mockResolvedValueOnce({ id: 'study-123' })

      expect(typeof studyController.createStudy).toBe('function')
    })

    it('should throw error when create fails', async () => {
      const mockError = new Error('Failed to create study')
      const mockPayload = {
        testType: 'HEURISTIC',
        toFirestore: jest.fn().mockReturnValue({}),
      }

      spies.create.mockRejectedValueOnce(mockError)

      await expect(studyController.createStudy(mockPayload)).rejects.toThrow()
    })
  })

  describe('duplicateStudy', () => {
    it('should duplicate study with new answer document', async () => {
      const mockPayload = {
        test: {
          testType: 'HEURISTIC',
          id: 'original-study-123',
          toFirestore: jest.fn().mockReturnValue({
            testType: 'HEURISTIC',
            answersDocId: 'answer-456',
          }),
        },
      }

      spies.create.mockResolvedValueOnce({
        id: 'duplicated-study-123',
      })

      await expect(
        studyController.duplicateStudy(mockPayload),
      ).rejects.toThrow()
    })

    it('should throw error when duplicateStudy fails', async () => {
      const mockPayload = {
        test: {
          testType: 'HEURISTIC',
          toFirestore: jest.fn().mockReturnValue({}),
        },
      }

      await expect(
        studyController.duplicateStudy(mockPayload),
      ).rejects.toThrow()
    })
  })

  describe('deleteStudy', () => {
    it('should delete study and remove collaborators', async () => {
      const mockPayload = {
        id: 'study-123',
        testAdmin: { userDocId: 'admin-123' },
      }

      const mockStudyData = {
        cooperators: [
          {
            userDocId: 'coop-1',
            email: 'coop1@test.com',
          },
          {
            userDocId: 'coop-2',
            email: 'coop2@test.com',
          },
        ],
      }

      const mockDoc = {
        exists: () => true,
        data: () => mockStudyData,
      }

      spies.readOne.mockResolvedValueOnce(mockDoc)
      spies.delete.mockResolvedValue()

      await studyController.deleteStudy(mockPayload)

      expect(spies.readOne).toHaveBeenCalledWith('tests', 'study-123')

      expect(spies.delete).toHaveBeenCalledWith('tests', 'study-123')
    })

    it('should return null if study does not exist', async () => {
      const mockPayload = {
        id: 'non-existent-study',
      }

      const mockDoc = {
        exists: () => false,
      }

      spies.readOne.mockResolvedValueOnce(mockDoc)

      const result = await studyController.deleteStudy(mockPayload)

      expect(result).toBeNull()
    })

    it('should handle delete error', async () => {
      const mockError = new Error('Delete failed')
      const mockPayload = {
        id: 'study-123',
      }

      spies.readOne.mockRejectedValueOnce(mockError)

      await expect(studyController.deleteStudy(mockPayload)).rejects.toThrow(
        mockError,
      )
    })
  })

  describe('updateStudy', () => {
    it('should update study with new data', async () => {
      const mockPayload = {
        id: 'study-123',
        testTitle: 'Updated Title',
        toFirestore: jest.fn().mockReturnValue({
          testTitle: 'Updated Title',
        }),
      }

      await studyController.updateStudy(mockPayload)

      expect(mockCallHttpsCallableFunction).toHaveBeenCalledWith(
        'updateStudyWithAudit',
        {
          studyId: 'study-123',
          study: {
            testTitle: 'Updated Title',
          },
        },
      )
    })

    it('should update study from a plain partial object', async () => {
      const mockPayload = {
        id: 'study-123',
        configData: {
          complianceLevel: 'AA',
        },
      }

      await studyController.updateStudy(mockPayload)

      expect(mockCallHttpsCallableFunction).toHaveBeenCalledWith(
        'updateStudyWithAudit',
        {
          studyId: 'study-123',
          study: {
            configData: {
              complianceLevel: 'AA',
            },
          },
        },
      )
    })

    it('should throw error when update fails', async () => {
      const mockError = new Error('Update failed')

      const mockPayload = {
        id: 'study-123',
        toFirestore: jest.fn().mockReturnValue({}),
      }

      mockCallHttpsCallableFunction.mockRejectedValueOnce(mockError)

      await expect(studyController.updateStudy(mockPayload)).rejects.toThrow(
        mockError,
      )
    })
  })

  describe('acceptStudyCollaboration', () => {
    it('should accept study collaboration and update both user and study', async () => {
      const mockTestPayload = {
        id: 'study-123',
        answersDocId: 'answer-123',
        testAdmin: {
          email: 'admin@test.com',
        },
        testDocId: 'study-123',
        testType: 'HEURISTIC',
        subType: 'standard',
        testTitle: 'Test Study',
        cooperators: [
          {
            email: 'coop@test.com',
            accessLevel: 5,
            accepted: false,
            userDocId: null,
          },
        ],
        toFirestore: jest.fn().mockReturnValue({
          id: 'study-123',
        }),
      }

      const mockCooperatorPayload = {
        id: 'coop-user-123',
        email: 'coop@test.com',
        accessLevel: 5,
        myAnswers: {},
        toFirestore: jest.fn().mockReturnValue({
          id: 'coop-user-123',
        }),
      }

      const mockPayload = {
        studyId: 'study-123',
        membershipType: 'cooperator',
        role: 5,
        test: mockTestPayload,
        cooperator: mockCooperatorPayload,
      }

      await expect(
        studyController.acceptStudyCollaboration(mockPayload),
      ).resolves.toEqual({
        status: 'ok',
      })

      expect(mockCallHttpsCallableFunction).toHaveBeenCalledWith(
        'manageStudyMembership',
        {
          studyId: 'study-123',
          action: 'accept',
          membershipType: 'cooperator',
          targetUserId: 'coop-user-123',
          targetEmail: 'coop@test.com',
          role: 5,
        },
      )
    })

    it('should accept study collaboration with the cooperator membership data', async () => {
      const mockPayload = {
        studyId: 'study-123',
        membershipType: 'cooperator',
        role: 5,
        cooperator: {
          id: 'coop-user-123',
          email: 'coop@test.com',
        },
      }

      await expect(
        studyController.acceptStudyCollaboration(mockPayload),
      ).resolves.toEqual({
        status: 'ok',
      })

      expect(mockCallHttpsCallableFunction).toHaveBeenCalledWith(
        'manageStudyMembership',
        {
          studyId: 'study-123',
          action: 'accept',
          membershipType: 'cooperator',
          targetUserId: 'coop-user-123',
          targetEmail: 'coop@test.com',
          role: 5,
        },
      )
    })
  })

  describe('getStudy', () => {
    it('should retrieve study by id when study exists', async () => {
      const mockParameter = {
        id: 'study-123',
      }

      const mockStudyData = {
        id: 'study-123',
        testType: 'HEURISTIC',
        testTitle: 'Test Study',
      }

      const mockDoc = {
        exists: () => true,
        id: 'study-123',
        data: () => mockStudyData,
      }

      spies.readOne.mockResolvedValueOnce(mockDoc)

      const result = await studyController.getStudy(mockParameter)

      expect(spies.readOne).toHaveBeenCalledWith('tests', 'study-123')

      if (result) {
        expect(result.testType).toBe('HEURISTIC')
      }
    })

    it('should return null if study does not exist', async () => {
      const mockParameter = {
        id: 'non-existent-study',
      }

      const mockDoc = {
        exists: () => false,
      }

      spies.readOne.mockResolvedValueOnce(mockDoc)

      const result = await studyController.getStudy(mockParameter)

      expect(result).toBeNull()
    })
  })

  describe('getPublicStudies', () => {
    it('should retrieve all public studies', async () => {
      spies.query = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(studyController)),
        'query',
      )

      spies.query.mockResolvedValueOnce({
        docs: [
          {
            id: 'public-study-1',
            data: () => ({
              testType: 'HEURISTIC',
            }),
          },
          {
            id: 'public-study-2',
            data: () => ({
              testType: 'USER',
            }),
          },
        ],
      })

      const result = await studyController.getPublicStudies()

      expect(result).toHaveLength(2)
    })

    it('should return empty array when no public studies exist', async () => {
      spies.query = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(studyController)),
        'query',
      )

      spies.query.mockResolvedValueOnce({
        docs: [],
      })

      const result = await studyController.getPublicStudies()

      expect(result).toEqual([])
    })
  })

  describe('getAllStudies', () => {
    it('should retrieve all studies', async () => {
      spies.readAll = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(studyController)),
        'readAll',
      )

      spies.readAll.mockResolvedValue([
        {
          id: 'study-1',
          testType: 'HEURISTIC',
        },
        {
          id: 'study-2',
          testType: 'USER',
        },
      ])

      const result = await studyController.getAllStudies()

      expect(result).toHaveLength(2)
    })

    it('should throw error when readAll fails', async () => {
      spies.readAll = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(studyController)),
        'readAll',
      )

      const mockError = new Error('Read failed')

      spies.readAll.mockRejectedValue(mockError)

      await expect(studyController.getAllStudies()).rejects.toThrow(mockError)
    })
  })

  describe('subscribeToStudy', () => {
    it('should subscribe to study changes', () => {
      const mockCallback = jest.fn()
      const { onSnapshot } = require('firebase/firestore')

      const unsubscribeMock = jest.fn()

      const mockStudyDoc = {
        exists: () => true,
        id: 'study-123',
        data: () => ({
          testType: 'HEURISTIC',
        }),
      }

      onSnapshot.mockImplementation((docRef, callback) => {
        callback(mockStudyDoc)
        return unsubscribeMock
      })

      const unsubscribe = studyController.subscribeToStudy(
        'study-123',
        mockCallback,
      )

      expect(onSnapshot).toHaveBeenCalled()
      expect(mockCallback).toHaveBeenCalled()
      expect(unsubscribe).toBe(unsubscribeMock)
    })

    it('should not call callback if document does not exist', () => {
      const mockCallback = jest.fn()
      const { onSnapshot } = require('firebase/firestore')

      const mockNonExistentStudy = {
        exists: () => false,
      }

      onSnapshot.mockImplementation((docRef, callback) => {
        callback(mockNonExistentStudy)
        return jest.fn()
      })

      studyController.subscribeToStudy('non-existent-study', mockCallback)

      expect(mockCallback).not.toHaveBeenCalled()
    })
  })
})
