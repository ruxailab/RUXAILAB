const mockCallHttpsCallableFunction = jest.fn()

jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: {
    callHttpsCallableFunction: (...args) => mockCallHttpsCallableFunction(...args),
  },
}))

import FocusGroupController from '@/ux/FocusGroup/controllers/FocusGroupController'
import { createControllerSpies } from './helpers/testUtils'

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  deleteField: jest.fn(() => 'DELETE_FIELD_SENTINEL'),
}))

jest.mock('@/app/plugins/firebase', () => ({
  db: {},
}))

describe('FocusGroupController', () => {
  let controller
  let spies

  beforeEach(() => {
    jest.clearAllMocks()
    mockCallHttpsCallableFunction.mockResolvedValue({ data: { status: 'updated' } })
    controller = new FocusGroupController()
    spies = createControllerSpies(controller)
  })

  afterEach(() => {
    spies.restore()
  })

  describe('getById', () => {
    it('reads the study doc and instantiates it as a Focus Group study', async () => {
      spies.mockReadOne({
        id: 'study-1',
        data: () => ({
          testType: 'FOCUS_GROUP',
          testTitle: 'My Focus Group',
          discussionGuide: [{ id: 'topic-1', title: 'Warm-up' }],
        }),
      })

      const study = await controller.getById('study-1')

      expect(spies.readOne).toHaveBeenCalledWith('tests', 'study-1')
      expect(study.id).toBe('study-1')
      expect(study.testType).toBe('FOCUS_GROUP')
      expect(study.testTitle).toBe('My Focus Group')
      expect(study.discussionGuide).toHaveLength(1)
      expect(study.discussionGuide[0].title).toBe('Warm-up')
    })
  })

  describe('updateDiscussionGuide', () => {
    it('serializes model instances and uses the audited study-update callable', async () => {
      const topics = [{ toFirestore: () => ({ id: 't1', title: 'Topic 1' }) }]

      await controller.updateDiscussionGuide('study-1', topics)

      expect(mockCallHttpsCallableFunction).toHaveBeenCalledWith(
        'updateStudyWithAudit',
        expect.objectContaining({
          studyId: 'study-1',
          study: expect.objectContaining({
            discussionGuide: [{ id: 't1', title: 'Topic 1' }],
          }),
        }),
      )
    })

    it('passes plain topic objects through unchanged', async () => {
      const topics = [{ id: 't1', title: 'Topic 1' }]

      await controller.updateDiscussionGuide('study-1', topics)

      expect(mockCallHttpsCallableFunction.mock.calls[0][1].study).toEqual(
        expect.objectContaining({
          discussionGuide: [{ id: 't1', title: 'Topic 1' }],
        }),
      )
    })
  })

  describe('updateConfig', () => {
    it('serializes a config model instance', async () => {
      const config = { toFirestore: () => ({ maxParticipants: 8 }) }

      await controller.updateConfig('study-1', config)

      expect(mockCallHttpsCallableFunction).toHaveBeenCalledWith(
        'updateStudyWithAudit',
        expect.objectContaining({
          studyId: 'study-1',
          study: expect.objectContaining({ config: { maxParticipants: 8 } }),
        }),
      )
    })

    it('passes a plain config object through unchanged', async () => {
      const config = { maxParticipants: 8 }

      await controller.updateConfig('study-1', config)

      expect(mockCallHttpsCallableFunction.mock.calls[0][1].study).toEqual(
        expect.objectContaining({ config: { maxParticipants: 8 } }),
      )
    })
  })

  describe('saveSessionAnswer', () => {
    it('updates the session under the sessions map, keyed by session id', async () => {
      spies.mockUpdate()
      const session = { sessionId: 'session-1', startedAt: 123 }

      await controller.saveSessionAnswer('answers-1', session)

      expect(spies.update).toHaveBeenCalledWith('answers', 'answers-1', {
        'sessions.session-1': session,
      })
    })
  })
})
