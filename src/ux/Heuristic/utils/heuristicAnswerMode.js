export const resolveHeuristicStudyMode = (test) => {
  if (['traditional', 'detailed', 'weights'].includes(test?.studyMode)) {
    return test.studyMode
  }

  if (test?.useWeights) return 'weights'

  const useFrequency = test?.useFrequency !== false
  const useSeverity = test?.useSeverity !== false
  const hasExplicitMetricSettings =
    typeof test?.useFrequency === 'boolean' ||
    typeof test?.useSeverity === 'boolean'

  // Explicitly enabled metrics take precedence over leftover options.
  if (hasExplicitMetricSettings && (useFrequency || useSeverity)) {
    return 'traditional'
  }

  if (test?.testOptions?.length) return 'detailed'

  return useFrequency && useSeverity ? 'traditional' : 'detailed'
}

export const heuristicResponseItems = (test, heuristic) =>
  resolveHeuristicStudyMode(test) === 'detailed'
    ? heuristic?.questions || []
    : [
        {
          id: heuristic?.id,
          title: heuristic?.title,
          descriptions: [
            { text: heuristic?.description || heuristic?.text || '' },
          ],
        },
      ]

export const HEURISTIC_ANSWER_MODE = Object.freeze({
  WEIGHT: 'weight',
  CUSTOM_OPTIONS: 'customOptions',
  WEIGHT: 'weight',
  FREQUENCY: 'frequency',
  SEVERITY: 'severity',
  FREQUENCY_SEVERITY: 'frequencySeverity',
})

export const resolveHeuristicAnswerMode = (test) => {
  const studyMode = resolveHeuristicStudyMode(test)

  if (studyMode === 'weights') {
    return HEURISTIC_ANSWER_MODE.WEIGHT
  }

  const useFrequency = test?.useFrequency !== false
  const useSeverity = test?.useSeverity !== false

  if (studyMode === 'traditional') {
    if (useFrequency && useSeverity) {
      return HEURISTIC_ANSWER_MODE.FREQUENCY_SEVERITY
    }

    if (useFrequency) {
      return HEURISTIC_ANSWER_MODE.FREQUENCY
    }

    if (useSeverity) {
      return HEURISTIC_ANSWER_MODE.SEVERITY
    }

    return HEURISTIC_ANSWER_MODE.FREQUENCY_SEVERITY
  }

  if (Array.isArray(test?.testOptions) && test.testOptions.length) {
    return HEURISTIC_ANSWER_MODE.CUSTOM_OPTIONS
  }

  if (test?.useWeights) return null

  if (useFrequency && useSeverity) {
    return HEURISTIC_ANSWER_MODE.FREQUENCY_SEVERITY
  }

  if (useFrequency) {
    return HEURISTIC_ANSWER_MODE.FREQUENCY
  }

  if (useSeverity) {
    return HEURISTIC_ANSWER_MODE.SEVERITY
  }

  // Detailed studies with both metrics disabled still need a response scale.
  return HEURISTIC_ANSWER_MODE.FREQUENCY_SEVERITY
}

export const buildCanonicalHeuristicAnswer = ({
  mode,
  option,
  frequency,
  severity,
  weight,
}) => {
  if (mode === HEURISTIC_ANSWER_MODE.WEIGHT) {
    return { mode, weight, text: `Weight: ${weight}`, value: weight }
  }
  if (mode === HEURISTIC_ANSWER_MODE.CUSTOM_OPTIONS) {
    const custom = option
      ? {
          text: option.text || '',
          value: option.value,
          timestamp: option.timestamp,
        }
      : null
    return {
      mode,
      custom,
      text: custom?.text || '',
      value: custom?.value ?? null,
    }
  }

  if (mode === HEURISTIC_ANSWER_MODE.FREQUENCY) {
    return {
      mode,
      frequency,
      text: `Frequency: ${frequency}`,
      value: frequency,
    }
  }

  if (mode === HEURISTIC_ANSWER_MODE.SEVERITY) {
    return {
      mode,
      severity,
      text: `Severity: ${severity}`,
      value: severity,
    }
  }

  if (mode === HEURISTIC_ANSWER_MODE.FREQUENCY_SEVERITY) {
    return {
      mode,
      frequency,
      severity,
      text: `Frequency: ${frequency} | Severity: ${severity}`,
      value: { frequency, severity },
    }
  }

  return null
}
