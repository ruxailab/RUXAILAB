/** Resolve the stored study configuration, including legacy custom-option tests. */
export const resolveHeuristicAnswerConfiguration = (test) => {
  if (test?.useWeights) return { answerMode: 'weight', options: [] }
  const options = Array.isArray(test?.testOptions) ? test.testOptions : []
  if (
    !test?.useWeights &&
    test?.useFrequency === true &&
    test?.useSeverity === true
  ) {
    return { answerMode: 'frequencySeverity', options: [] }
  }
  if (options.length) return { answerMode: 'customOptions', options }
  if (test?.useWeights) return { answerMode: null, options: [] }
  const frequency = test?.useFrequency !== false
  const severity = test?.useSeverity !== false
  return {
    answerMode:
      frequency && severity
        ? 'frequencySeverity'
        : frequency
          ? 'frequency'
          : severity
            ? 'severity'
            : null,
    options: [],
  }
}
