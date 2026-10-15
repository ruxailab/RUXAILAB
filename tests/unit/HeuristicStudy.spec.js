import HeuristicStudy from '@/ux/Heuristic/models/HeuristicStudy'
import StudyAdmin from '@/shared/models/StudyAdmin'

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
