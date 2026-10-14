export const HEURISTIC_ANSWER_MODE = Object.freeze({
  CUSTOM_OPTIONS: 'customOptions',
  WEIGHT: 'weight',
  FREQUENCY: 'frequency',
  SEVERITY: 'severity',
  FREQUENCY_SEVERITY: 'frequencySeverity',
})

export const resolveHeuristicAnswerMode = (test) => {
  // Explicit study settings take precedence over options left by a mode change.
  if (
    !test?.useWeights &&
    test?.useFrequency === true &&
    test?.useSeverity === true
  ) {
    return HEURISTIC_ANSWER_MODE.FREQUENCY_SEVERITY
  }
  if (Array.isArray(test?.testOptions) && test.testOptions.length) {
    return HEURISTIC_ANSWER_MODE.CUSTOM_OPTIONS
  }

  if (test?.useWeights) return null

  const useFrequency = test?.useFrequency !== false
  const useSeverity = test?.useSeverity !== false
  if (useFrequency && useSeverity) {
    return HEURISTIC_ANSWER_MODE.FREQUENCY_SEVERITY
  }
  if (useFrequency) return HEURISTIC_ANSWER_MODE.FREQUENCY
  if (useSeverity) return HEURISTIC_ANSWER_MODE.SEVERITY
  return null
}

export const buildCanonicalHeuristicAnswer = ({
  mode,
  option,
  frequency,
  severity,
  weight,
}) => {
  if (mode === HEURISTIC_ANSWER_MODE.WEIGHT) {
    return { mode, weight, text: String(weight), value: weight }
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
