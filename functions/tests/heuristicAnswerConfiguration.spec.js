import { resolveHeuristicAnswerConfiguration } from '../src/shared/models/heuristicAnswerConfiguration.js'

const options = [{ text: 'Pass', value: 1 }]
describe('heuristic agent study configuration', () => {
  it('uses traditional metrics despite options left from detailed mode', () => {
    expect(
      resolveHeuristicAnswerConfiguration({
        useFrequency: true,
        useSeverity: true,
        testOptions: options,
      }),
    ).toEqual({ answerMode: 'frequencySeverity', options: [] })
  })
  it.each([false, true])(
    'resolves the configured mode when weights=%s',
    (useWeights) => {
      expect(
        resolveHeuristicAnswerConfiguration({
          useWeights,
          useFrequency: false,
          useSeverity: false,
          testOptions: options,
        }),
      ).toEqual(
        useWeights
          ? { answerMode: 'weight', options: [] }
          : { answerMode: 'customOptions', options },
      )
    },
  )
  it('supports weighted studies without options', () => {
    expect(
      resolveHeuristicAnswerConfiguration({ useWeights: true }).answerMode,
    ).toBe('weight')
  })
  it('keeps legacy detailed and traditional tests compatible', () => {
    expect(
      resolveHeuristicAnswerConfiguration({ testOptions: options }).answerMode,
    ).toBe('customOptions')
    expect(resolveHeuristicAnswerConfiguration({}).answerMode).toBe(
      'frequencySeverity',
    )
  })
  it.each([
    [true, false, 'frequency'],
    [false, true, 'severity'],
    [false, false, null],
  ])('honors metric flags %s / %s', (useFrequency, useSeverity, answerMode) => {
    expect(
      resolveHeuristicAnswerConfiguration({ useFrequency, useSeverity })
        .answerMode,
    ).toBe(answerMode)
  })
})
