import StudyController from '@/controllers/StudyController'

const mockCreateStudy = jest.fn()
const mockCreateAnswer = jest.fn()
const mockDelete = jest.fn()
const mockLink = jest.fn()
const mockBatchSet = jest.fn()
const mockBatchCommit = jest.fn()
const mockStudyRef = { id: 'study-1', path: 'tests/study-1' }
const mockAnswerRef = { id: 'answer-1', path: 'answers/answer-1' }

jest.mock('@/app/plugins/firebase/FirebaseFirestoreRepository', () => {
  return class {
    create(...args) {
      return mockCreateStudy(...args)
    }

    delete(...args) {
      return mockDelete(...args)
    }
  }
})
jest.mock('@/shared/controllers/AnswerController', () => {
  return class {
    createAnswer(...args) {
      return mockCreateAnswer(...args)
    }

    linkAnswerToStudy(...args) {
      return mockLink(...args)
    }

    delete(...args) {
      return mockDelete(...args)
    }
  }
})
jest.mock('@/features/auth/controllers/UserController', () => class {})
jest.mock('@/shared/models/Participant', () => class {})
jest.mock('@/shared/constants/methodDefinitions', () => ({
  instantiateStudyByType: jest.fn(),
}))
jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {},
}))
jest.mock('@/app/plugins/firebase', () => ({ db: {} }))
jest.mock('firebase/firestore', () => ({
  collection: (_db, name) => name,
  doc: (name) => (name === 'tests' ? mockStudyRef : mockAnswerRef),
  writeBatch: () => ({ set: mockBatchSet, commit: mockBatchCommit }),
}))
jest.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: { uid: 'owner-1' } }),
}))

describe.each(['createStudy', 'duplicateStudy'])('%s', (method) => {
  let controller
  let study
  let payload

  beforeEach(() => {
    mockCreateStudy.mockResolvedValue(mockStudyRef)
    mockCreateAnswer.mockResolvedValue(mockAnswerRef)
    mockBatchCommit.mockResolvedValue()
    controller = new StudyController()
    study = {
      testType: 'USER',
      toFirestore: jest.fn(() => ({ answersDocId: study.answersDocId })),
    }
    payload = method === 'createStudy' ? study : { test: study }
  })

  it('commits the study and already-linked answers in the same batch', async () => {
    await expect(controller[method](payload)).resolves.toBe(mockStudyRef)
    expect(mockBatchSet).toHaveBeenCalledWith(mockStudyRef, {
      answersDocId: 'answer-1',
    })
    expect(mockBatchSet).toHaveBeenCalledWith(mockAnswerRef, {
      type: 'USER',
      studyId: 'study-1',
      createdBy: 'owner-1',
      taskAnswers: {},
    })
    expect(mockBatchSet).toHaveBeenCalledTimes(2)
    expect(mockBatchCommit).toHaveBeenCalledTimes(1)
    expect(mockCreateStudy).not.toHaveBeenCalled()
    expect(mockCreateAnswer).not.toHaveBeenCalled()
    expect(mockLink).not.toHaveBeenCalled()
  })

  it('does not write an answers document when study serialization fails', async () => {
    const error = new Error('Serialization failed')
    study.toFirestore.mockImplementationOnce(() => {
      throw error
    })

    await expect(controller[method](payload)).rejects.toBe(error)
    expect(mockCreateAnswer).not.toHaveBeenCalled()
    expect(mockBatchCommit).not.toHaveBeenCalled()
  })

  it('does not commit when Firestore rejects a batch payload', async () => {
    const error = new Error('Invalid Firestore payload')
    mockBatchSet.mockImplementationOnce(() => {
      throw error
    })

    await expect(controller[method](payload)).rejects.toBe(error)
    expect(mockBatchCommit).not.toHaveBeenCalled()
  })

  it('propagates a rejected commit without attempting permission-dependent cleanup', async () => {
    const error = new Error('Permission denied')
    mockBatchCommit.mockRejectedValueOnce(error)

    await expect(controller[method](payload)).rejects.toBe(error)
    expect(mockDelete).not.toHaveBeenCalled()
    expect(mockCreateAnswer).not.toHaveBeenCalled()
  })

  it.each(['HEURISTIC', 'FOCUS_GROUP', 'CARD_SORTING'])(
    'preserves the %s study type when creating answers',
    async (type) => {
      study.testType = type

      await controller[method](payload)

      expect(mockBatchSet).toHaveBeenCalledWith(
        mockAnswerRef,
        expect.objectContaining({ type, studyId: 'study-1' }),
      )
    },
  )
})
