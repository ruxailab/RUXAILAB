import {
  heuristicResponseItems,
  resolveHeuristicAnswerMode,
} from '@/ux/Heuristic/utils/heuristicAnswerMode'
import HeuristicStudy from '@/ux/Heuristic/models/HeuristicStudy'

describe('heuristic evaluation configuration', () => {
  it.each(['traditional', 'weights'])(
    'allows %s without configured questions',
    (studyMode) => {
      expect(heuristicResponseItems({ studyMode }, { id: 'h' })).toHaveLength(1)
      expect(
        resolveHeuristicAnswerMode({
          studyMode,
          useFrequency: false,
          useSeverity: false,
        }),
      ).toBe(studyMode === 'weights' ? 'weight' : 'frequencySeverity')
    },
  )
  it.each(['detailed', undefined])(
    'provides a scale for detailed studies without options (%s)',
    (studyMode) => {
      expect(
        resolveHeuristicAnswerMode({
          studyMode,
          useFrequency: false,
          useSeverity: false,
          testOptions: [],
        }),
      ).toBe('frequencySeverity')
    },
  )
  it('keeps custom options in detailed mode', () => {
    expect(
      resolveHeuristicAnswerMode({
        studyMode: 'detailed',
        useFrequency: true,
        useSeverity: true,
        testOptions: [{ text: 'Yes', value: 1 }],
      }),
    ).toBe('customOptions')
  })
  it('preserves detailed questions', () => {
    const questions = [{ id: 1 }, { id: 2 }]
    expect(
      heuristicResponseItems({ studyMode: 'detailed' }, { questions }),
    ).toBe(questions)
  })
  it('persists an explicit mode across reloads', () => {
    const study = new HeuristicStudy({
      testAdmin: { toFirestore: () => ({ userDocId: 'admin' }) },
      studyMode: 'traditional',
      testOptions: [{ text: 'Yes', value: 1 }],
    })
    const restored = new HeuristicStudy(study.toFirestore())
    expect(resolveHeuristicAnswerMode(restored)).toBe('frequencySeverity')
  })
})
