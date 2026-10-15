// Metadata-only structured (selection, slider, questionnaire) activity shared by
// the unmoderated and moderated participant views. Values seed change
// detection in the runtime and are never sent to logging.
const structuredNasaFields = [
  'mentalDemand',
  'physicalDemand',
  'temporalDemand',
  'performance',
  'effort',
  'frustration',
]
const structuredSartFields = [
  'instability',
  'complexity',
  'variability',
  'arousal',
  'concentration',
  'division',
  'spareCapacity',
  'informationQuantity',
  'informationQuality',
  'familiarity',
]
const structuredTamSizes = {
  'tam-1': {
    perceivedUsefulness: 10,
    perceivedEaseOfUse: 10,
  },
  'tam-2': {
    intentionToUse: 2,
    perceivedUsefulness: 4,
    perceivedEaseOfUse: 4,
    subjectiveNorm: 2,
    voluntariness: 3,
    image: 3,
    jobRelevance: 2,
    outputQuality: 2,
    resultDemonstrability: 4,
  },
  'tam-3': {
    perceivedUsefulness: 3,
    perceivedEaseOfUse: 3,
    behavioralIntention: 2,
    usePatterns: 2,
    subjectiveNorm: 3,
    image: 2,
    jobRelevance: 3,
    outputQuality: 3,
    resultDemonstrability: 2,
    computerSelfEfficacy: 3,
    perceptionsOfExternalControl: 3,
    computerAnxiety: 2,
    computerPlayfulness: 2,
    perceivedEnjoyment: 3,
    objectiveUsability: 2,
    experience: 2,
    voluntariness: 2,
  },
}

export const structuredValuesForTask = (task, taskAnswer) => {
  const values = {}
  const taskType = task?.taskType

  if (taskType === 'sus') {
    for (let index = 0; index < 10; index++) {
      values[`sus:question:${index}`] = taskAnswer?.susAnswers?.[index]
    }
  }

  if (taskType === 'nasa-tlx') {
    for (const field of structuredNasaFields) {
      values[`nasa-tlx:${field}`] = taskAnswer?.nasaTlxAnswers?.[field] ?? 0
    }
  }

  if (taskType === 'sart') {
    for (const field of structuredSartFields) {
      values[`sart:${field}`] = taskAnswer?.sartAnswers?.[field] ?? 4
    }
  }

  const tamSizes = structuredTamSizes[taskType]
  if (tamSizes) {
    for (const [construct, size] of Object.entries(tamSizes)) {
      for (let index = 0; index < size; index++) {
        values[`${taskType}:${construct}:${index}`] =
          taskAnswer?.tamAnswers?.[construct]?.[index]
      }
    }
  }

  return values
}

export const structuredValuesForStage = (stage, questions, answers) => {
  const values = {}

  ;(questions || []).forEach((question, index) => {
    if (
      question?.selectionField &&
      Array.isArray(question.selectionFields) &&
      question.selectionFields.length
    ) {
      values[`${stage}:question:${index}`] = answers?.[index]?.answer
    }
  })

  return values
}

export const createStructuredActivityHandlers = (getRuntime) => {
  const seedStructuredScope = (scopeRef, values) => {
    getRuntime()?.seedStructuredScope(scopeRef, values)
  }

  const handleStructuredResponseChanged = (change) => {
    if (!change?.scopeRef || !change.itemRef) return
    getRuntime()?.structuredChoiceChanged(
      change.scopeRef,
      change.itemRef,
      change.value,
    )
  }

  const handleStructuredSelectionChanged = (change) => {
    const scopeRef = change?.itemRef?.split(':')[0]
    if (scopeRef !== 'preTest' && scopeRef !== 'postTest') return
    getRuntime()?.structuredChoiceChanged(
      scopeRef,
      change.itemRef,
      change.value,
    )
  }

  const handleStructuredSliderEvent = (phase, change) => {
    if (!change?.scopeRef || !change.itemRef) return
    const runtime = getRuntime()
    if (!runtime) return

    if (phase === 'focus') {
      runtime.structuredSliderFocus(change.scopeRef, change.itemRef)
    } else if (phase === 'start') {
      runtime.structuredSliderPointerStart(
        change.scopeRef,
        change.itemRef,
        change.value,
      )
    } else if (phase === 'change') {
      runtime.structuredSliderValueChanged(
        change.scopeRef,
        change.itemRef,
        change.value,
      )
    } else if (phase === 'end') {
      runtime.structuredSliderPointerEnd(
        change.scopeRef,
        change.itemRef,
        change.value,
      )
    } else if (phase === 'blur') {
      runtime.structuredSliderBlur(change.scopeRef, change.itemRef)
    }
  }

  return {
    seedStructuredScope,
    handleStructuredResponseChanged,
    handleStructuredSelectionChanged,
    handleStructuredSliderEvent,
  }
}
