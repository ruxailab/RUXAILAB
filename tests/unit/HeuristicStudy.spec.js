import HeuristicStudy from '@/ux/Heuristic/models/HeuristicStudy'
import HeuristicStore, {
  getHeuristicStateForStudy,
} from '@/ux/Heuristic/store/Heuristic'
import StudyAdmin from '@/shared/models/StudyAdmin'

describe('heuristic study state', () => {
  it('uses the loaded study heuristics before the editor state is initialized', () => {
    const heuristics = [{ id: 1, title: 'Visibility' }]

    expect(
      getHeuristicStateForStudy(
        { id: 'study-1', testStructure: heuristics, testWeights: { 0: [1] } },
        HeuristicStore.state,
      ),
    ).toEqual({
      isCurrentStudy: false,
      heuristics,
      testWeights: { 0: [1] },
    })
  })

  it('keeps an intentionally empty list for the initialized study', () => {
    const state = {
      ...HeuristicStore.state,
      heuristicsStudyId: 'study-1',
      heuristicsStudyInitialized: true,
      heuristics: [],
      testWeights: {},
    }

    expect(
      getHeuristicStateForStudy(
        {
          id: 'study-1',
          testStructure: [{ id: 1, title: 'Removed heuristic' }],
        },
        state,
      ).heuristics,
    ).toEqual([])
  })

  it('does not reuse heuristics loaded for a different study', () => {
    const state = {
      ...HeuristicStore.state,
      heuristicsStudyId: 'study-previous',
      heuristicsStudyInitialized: true,
      heuristics: [{ id: 1, title: 'Previous study heuristic' }],
    }

    expect(
      getHeuristicStateForStudy(
        { id: 'study-current', testStructure: [{ id: 2, title: 'Current' }] },
        state,
      ).heuristics,
    ).toEqual([{ id: 2, title: 'Current' }])
  })
})

describe('Heuristic study AI websites', () => {
  it('keeps existing studies usable without configured websites', () => {
    expect(new HeuristicStudy().heuristicAgentWebsites).toEqual({
      url: '',
      pages: [],
      selectedUrls: [],
    })
  })

  it('preserves discovered pages and selected URLs when saving and reloading', () => {
    const websites = {
      url: 'https://example.com',
      pages: [
        { url: 'https://example.com/', depth: 0 },
        { url: 'https://example.com/about', depth: 1 },
      ],
      selectedUrls: ['https://example.com/about'],
    }
    const saved = new HeuristicStudy({
      testAdmin: new StudyAdmin({ email: 'owner@example.com', userDocId: 'owner' }),
      heuristicAgentWebsites: websites,
    }).toFirestore()
    expect(saved.heuristicAgentWebsites).toEqual(websites)
    expect(new HeuristicStudy(saved).heuristicAgentWebsites).toEqual(websites)
  })
})
