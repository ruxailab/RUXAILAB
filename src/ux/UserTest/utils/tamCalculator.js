import { REVERSE_CODED_ITEMS } from './tamData.js'

/**
 * Calculate construct score for a given set of responses
 * @param {Array} responses - Array of numeric responses (1-7 scale)
 * @param {Array} reverseCodedIndices - Array of indices that need reverse coding
 * @returns {number} - Average score for the construct
 */
export function calculateConstructScore(responses, reverseCodedIndices = []) {
  if (!responses || responses.length === 0) {
    throw new Error('Responses array cannot be empty')
  }

  // Check for null or undefined responses
  const validResponses = responses.filter(
    (response) => response !== null && response !== undefined,
  )
  if (validResponses.length !== responses.length) {
    throw new Error(
      'All responses must be provided (no null or undefined values)',
    )
  }

  // Validate response range (1-7 Likert scale)
  const invalidResponses = validResponses.filter(
    (response) => response < 1 || response > 7,
  )
  if (invalidResponses.length > 0) {
    throw new Error('All responses must be between 1 and 7')
  }

  // Apply reverse coding where needed
  const processedResponses = responses.map((response, index) => {
    if (reverseCodedIndices.includes(index)) {
      return 8 - response // Reverse code: 1->7, 2->6, 3->5, 4->4, 5->3, 6->2, 7->1
    }
    return response
  })

  // Calculate average
  const sum = processedResponses.reduce((acc, response) => acc + response, 0)
  return sum / processedResponses.length
}

/**
 * Calculate all TAM construct scores for a given TAM answer
 * @param {TAMAnswer} tamAnswer - TAM answer object
 * @returns {Object} - Object containing all construct scores
 */
export function calculateTAMScores(tamAnswer) {
  if (!tamAnswer || !tamAnswer.version) {
    throw new Error('Valid TAM answer object with version is required')
  }

  const scores = {}
  const reverseItems = REVERSE_CODED_ITEMS[tamAnswer.version] || {}

  // Calculate TAM-1 core constructs
  scores.perceivedUsefulness = calculateConstructScore(
    tamAnswer.perceivedUsefulness,
    reverseItems.perceivedUsefulness || [],
  )
  scores.perceivedEaseOfUse = calculateConstructScore(
    tamAnswer.perceivedEaseOfUse,
    reverseItems.perceivedEaseOfUse || [],
  )

  // Calculate TAM-2 additional constructs
  if (tamAnswer.version === 'tam-2' || tamAnswer.version === 'tam-3') {
    scores.subjectiveNorm = calculateConstructScore(
      tamAnswer.subjectiveNorm,
      reverseItems.subjectiveNorm || [],
    )
    scores.image = calculateConstructScore(
      tamAnswer.image,
      reverseItems.image || [],
    )
    scores.jobRelevance = calculateConstructScore(
      tamAnswer.jobRelevance,
      reverseItems.jobRelevance || [],
    )
    scores.outputQuality = calculateConstructScore(
      tamAnswer.outputQuality,
      reverseItems.outputQuality || [],
    )
    scores.resultDemonstrability = calculateConstructScore(
      tamAnswer.resultDemonstrability,
      reverseItems.resultDemonstrability || [],
    )
  }

  // Calculate TAM-3 additional constructs
  if (tamAnswer.version === 'tam-3') {
    scores.computerSelfEfficacy = calculateConstructScore(
      tamAnswer.computerSelfEfficacy,
      reverseItems.computerSelfEfficacy || [],
    )
    scores.perceptionOfExternalControl = calculateConstructScore(
      tamAnswer.perceptionOfExternalControl,
      reverseItems.perceptionOfExternalControl || [],
    )
    scores.computerAnxiety = calculateConstructScore(
      tamAnswer.computerAnxiety,
      reverseItems.computerAnxiety || [],
    )
    scores.computerPlayfulness = calculateConstructScore(
      tamAnswer.computerPlayfulness,
      reverseItems.computerPlayfulness || [],
    )
    scores.perceivedEnjoyment = calculateConstructScore(
      tamAnswer.perceivedEnjoyment,
      reverseItems.perceivedEnjoyment || [],
    )
    scores.objectiveUsability = calculateConstructScore(
      tamAnswer.objectiveUsability,
      reverseItems.objectiveUsability || [],
    )
  }

  return scores
}

/**
 * Get TAM score interpretation based on construct scores
 * @param {Object} scores - Object containing construct scores
 * @param {string} version - TAM version ('tam-1', 'tam-2', 'tam-3')
 * @returns {Object} - Object containing interpretation for each construct
 */
export function getTAMInterpretation(scores, version) {
  const interpretation = {}

  Object.keys(scores).forEach((construct) => {
    const score = scores[construct]
    if (score >= 6) {
      interpretation[construct] = {
        level: 'High',
        description: 'Strong positive attitude',
      }
    } else if (score >= 5) {
      interpretation[construct] = {
        level: 'Moderate-High',
        description: 'Positive attitude',
      }
    } else if (score >= 4) {
      interpretation[construct] = {
        level: 'Neutral',
        description: 'Neither positive nor negative',
      }
    } else if (score >= 3) {
      interpretation[construct] = {
        level: 'Moderate-Low',
        description: 'Somewhat negative attitude',
      }
    } else {
      interpretation[construct] = {
        level: 'Low',
        description: 'Negative attitude',
      }
    }
  })

  return interpretation
}

/**
 * Calculate overall TAM acceptance score
 * @param {Object} scores - Object containing construct scores
 * @param {string} version - TAM version ('tam-1', 'tam-2', 'tam-3')
 * @returns {number} - Overall acceptance score (1-7 scale)
 */
export function calculateOverallAcceptance(scores, version) {
  // For TAM-1, use equal weighting of PU and PEOU
  if (version === 'tam-1') {
    return (scores.perceivedUsefulness + scores.perceivedEaseOfUse) / 2
  }

  // For TAM-2 and TAM-3, use weighted average with core constructs having higher weight
  const coreWeight = 0.4 // 40% each for PU and PEOU
  const additionalWeight = 0.2 / (Object.keys(scores).length - 2) // Remaining 20% split among other constructs

  let weightedSum = 0
  let totalWeight = 0

  Object.keys(scores).forEach((construct) => {
    const weight =
      construct === 'perceivedUsefulness' || construct === 'perceivedEaseOfUse'
        ? coreWeight
        : additionalWeight

    weightedSum += scores[construct] * weight
    totalWeight += weight
  })

  return weightedSum / totalWeight
}

/**
 * Validate TAM responses completeness
 * @param {TAMAnswer} tamAnswer - TAM answer object
 * @returns {Object} - Validation result with isValid boolean and missing fields array
 */
export function validateTAMCompleteness(tamAnswer) {
  const missing = []

  // Check TAM-1 core constructs
  if (
    !tamAnswer.perceivedUsefulness ||
    tamAnswer.perceivedUsefulness.some((r) => r === null || r === undefined)
  ) {
    missing.push('perceivedUsefulness')
  }
  if (
    !tamAnswer.perceivedEaseOfUse ||
    tamAnswer.perceivedEaseOfUse.some((r) => r === null || r === undefined)
  ) {
    missing.push('perceivedEaseOfUse')
  }

  // Check TAM-2 constructs
  if (tamAnswer.version === 'tam-2' || tamAnswer.version === 'tam-3') {
    if (
      !tamAnswer.subjectiveNorm ||
      tamAnswer.subjectiveNorm.some((r) => r === null || r === undefined)
    ) {
      missing.push('subjectiveNorm')
    }
    if (
      !tamAnswer.image ||
      tamAnswer.image.some((r) => r === null || r === undefined)
    ) {
      missing.push('image')
    }
    if (
      !tamAnswer.jobRelevance ||
      tamAnswer.jobRelevance.some((r) => r === null || r === undefined)
    ) {
      missing.push('jobRelevance')
    }
    if (
      !tamAnswer.outputQuality ||
      tamAnswer.outputQuality.some((r) => r === null || r === undefined)
    ) {
      missing.push('outputQuality')
    }
    if (
      !tamAnswer.resultDemonstrability ||
      tamAnswer.resultDemonstrability.some((r) => r === null || r === undefined)
    ) {
      missing.push('resultDemonstrability')
    }
  }

  // Check TAM-3 constructs
  if (tamAnswer.version === 'tam-3') {
    if (
      !tamAnswer.computerSelfEfficacy ||
      tamAnswer.computerSelfEfficacy.some((r) => r === null || r === undefined)
    ) {
      missing.push('computerSelfEfficacy')
    }
    if (
      !tamAnswer.perceptionOfExternalControl ||
      tamAnswer.perceptionOfExternalControl.some(
        (r) => r === null || r === undefined,
      )
    ) {
      missing.push('perceptionOfExternalControl')
    }
    if (
      !tamAnswer.computerAnxiety ||
      tamAnswer.computerAnxiety.some((r) => r === null || r === undefined)
    ) {
      missing.push('computerAnxiety')
    }
    if (
      !tamAnswer.computerPlayfulness ||
      tamAnswer.computerPlayfulness.some((r) => r === null || r === undefined)
    ) {
      missing.push('computerPlayfulness')
    }
    if (
      !tamAnswer.perceivedEnjoyment ||
      tamAnswer.perceivedEnjoyment.some((r) => r === null || r === undefined)
    ) {
      missing.push('perceivedEnjoyment')
    }
    if (
      !tamAnswer.objectiveUsability ||
      tamAnswer.objectiveUsability.some((r) => r === null || r === undefined)
    ) {
      missing.push('objectiveUsability')
    }
  }

  return {
    isValid: missing.length === 0,
    missing: missing,
  }
}
