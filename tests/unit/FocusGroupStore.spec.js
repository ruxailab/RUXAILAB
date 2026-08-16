const mockGetById = jest.fn()
const mockUpdateDiscussionGuide = jest.fn()
const mockUpdateConfig = jest.fn()
const mockSaveSessionAnswer = jest.fn()

jest.mock('@/ux/FocusGroup/controllers/FocusGroupController', () => {
  return jest.fn().mockImplementation(() => ({
    getById: mockGetById,
    updateDiscussionGuide: mockUpdateDiscussionGuide,
    updateConfig: mockUpdateConfig,
    saveSessionAnswer: mockSaveSessionAnswer,
  }))
})

const FocusGroupStore = require('@/ux/FocusGroup/store/FocusGroup').default

describe('FocusGroup store', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getFocusGroup', () => {
    it('fetches the study by id and commits it', async () => {
      const study = { id: 'study-1', testType: 'FOCUS_GROUP' }
      mockGetById.mockResolvedValue(study)
      const commit = jest.fn()

      const result = await FocusGroupStore.actions.getFocusGroup(
        { commit },
        'study-1',
      )

      expect(mockGetById).toHaveBeenCalledWith('study-1')
      expect(commit).toHaveBeenCalledWith('SET_FOCUS_GROUP', study)
      expect(result).toBe(study)
    })
  })

  describe('endFocusGroupSession', () => {
    it('saves the session answer when both ids are present', async () => {
      const session = { sessionId: 'session-1' }

      await FocusGroupStore.actions.endFocusGroupSession(
        {},
        { answersDocId: 'answers-1', session },
      )

      expect(mockSaveSessionAnswer).toHaveBeenCalledWith('answers-1', session)
    })

    it('does nothing without an answersDocId', async () => {
      await FocusGroupStore.actions.endFocusGroupSession(
        {},
        { answersDocId: null, session: { sessionId: 'session-1' } },
      )

      expect(mockSaveSessionAnswer).not.toHaveBeenCalled()
    })

    it('does nothing without a session id', async () => {
      await FocusGroupStore.actions.endFocusGroupSession(
        {},
        { answersDocId: 'answers-1', session: {} },
      )

      expect(mockSaveSessionAnswer).not.toHaveBeenCalled()
    })
  })

  describe('saveFocusGroupSettings', () => {
    const context = () => ({ commit: jest.fn(), dispatch: jest.fn() })

    it('persists the discussion guide and config, then shows a success toast', async () => {
      mockUpdateDiscussionGuide.mockResolvedValue()
      mockUpdateConfig.mockResolvedValue()
      const ctx = context()
      const discussionGuide = [{ id: 'topic-1' }]
      const config = { maxParticipants: 8 }

      await FocusGroupStore.actions.saveFocusGroupSettings(ctx, {
        studyId: 'study-1',
        discussionGuide,
        config,
      })

      expect(mockUpdateDiscussionGuide).toHaveBeenCalledWith(
        'study-1',
        discussionGuide,
      )
      expect(mockUpdateConfig).toHaveBeenCalledWith('study-1', config)
      expect(ctx.commit).toHaveBeenCalledWith('setLoading', true)
      expect(ctx.commit).toHaveBeenCalledWith('setLoading', false)
      expect(ctx.commit).toHaveBeenCalledWith(
        'SET_TOAST',
        expect.objectContaining({ type: 'success' }),
      )
    })

    it('shows an error toast and rethrows when persistence fails', async () => {
      const error = new Error('boom')
      mockUpdateDiscussionGuide.mockRejectedValue(error)
      const ctx = context()

      await expect(
        FocusGroupStore.actions.saveFocusGroupSettings(ctx, {
          studyId: 'study-1',
          discussionGuide: [],
          config: {},
        }),
      ).rejects.toThrow('boom')

      expect(ctx.commit).toHaveBeenCalledWith(
        'SET_TOAST',
        expect.objectContaining({ type: 'error' }),
      )
      expect(ctx.commit).toHaveBeenCalledWith('setLoading', false)
    })
  })

  describe('getters', () => {
    it('currentFocusGroup returns state.currentFocusGroup', () => {
      const state = { currentFocusGroup: { id: 'study-1' } }
      expect(FocusGroupStore.getters.currentFocusGroup(state)).toBe(
        state.currentFocusGroup,
      )
    })
  })

  describe('mutations', () => {
    it('SET_FOCUS_GROUP sets currentFocusGroup', () => {
      const state = { currentFocusGroup: null }
      FocusGroupStore.mutations.SET_FOCUS_GROUP(state, { id: 'study-1' })
      expect(state.currentFocusGroup).toEqual({ id: 'study-1' })
    })
  })
})
