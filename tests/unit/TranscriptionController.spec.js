jest.mock('firebase/firestore', () => ({
  serverTimestamp: jest.fn(() => ({ __type: 'serverTimestamp' })),
  getFirestore: jest.fn(),
  connectFirestoreEmulator: jest.fn()
}))

jest.mock('@/ai/transcriptions/Transcriptions', () => {
  class MockTranscription {
    constructor(data) {
      Object.assign(this, data)
    }

    toFirestore() {
      return { ...this }
    }

    static toTranscription(data) {
      return { ...data, __from: 'toTranscription' }
    }
  }

  return {
    __esModule: true,
    default: MockTranscription
  }
})

const TranscriptionController = require('@/ai/transcriptions/TranscriptionController').default

describe('TranscriptionController', () => {
  let controller

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new TranscriptionController()
  })

  describe('create', () => {
    it('queries duplicates using taskId field', async () => {
      const querySpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(controller)), 'queryWithMultipleConditions')
        .mockResolvedValue({ docs: [] })
      const createSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(controller)), 'create')
        .mockResolvedValue({ id: 'doc-1' })

      const payload = {
        answersDocId: 'answer-1',
        userDocId: 'user-1',
        taskId: 'task-1',
        provider: 'provider',
        model: 'model',
        moderator: { language: 'en', transcript: '', segments: [] },
        evaluator: { language: 'en', transcript: '', segments: [] }
      }

      await controller.create(payload)

      expect(querySpy).toHaveBeenCalledWith(
        'transcriptions',
        expect.arrayContaining([
          expect.objectContaining({ field: 'answersDocId', value: 'answer-1' }),
          expect.objectContaining({ field: 'userDocId', value: 'user-1' }),
          expect.objectContaining({ field: 'taskId', value: 'task-1' })
        ])
      )
      expect(createSpy).toHaveBeenCalled()

      querySpy.mockRestore()
      createSpy.mockRestore()
    })

    it('throws when duplicate document exists', async () => {
      const querySpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(controller)), 'queryWithMultipleConditions')
        .mockResolvedValue({ docs: [{ id: 'existing' }] })
      const createSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(controller)), 'create')
        .mockResolvedValue({ id: 'doc-1' })

      const payload = {
        answersDocId: 'answer-1',
        userDocId: 'user-1',
        taskId: 'task-1',
        provider: 'provider',
        model: 'model',
        moderator: { language: 'en', transcript: '', segments: [] },
        evaluator: { language: 'en', transcript: '', segments: [] }
      }

      await expect(controller.create(payload)).rejects.toThrow(
        'already exists'
      )
      expect(createSpy).not.toHaveBeenCalled()

      querySpy.mockRestore()
      createSpy.mockRestore()
    })
  })
})
