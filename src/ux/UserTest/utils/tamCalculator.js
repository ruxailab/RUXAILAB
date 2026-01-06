/**
 * TAM (Technology Acceptance Model) Score Calculator
 * Supports TAM-1, TAM-2, and TAM-3 versions
 */

export function calculateTAMScore(answers, version = 'tam-1') {
  if (!answers || typeof answers !== 'object') {
    return {
      dimensions: {},
      overallScore: 0,
      version
    };
  }

  const dimensions = {};
  
  // TAM-1 uses 7-point scale (Davis 1985), TAM-2 uses 7-point scale (Venkatesh & Davis 2000), TAM-3 uses 5-point scale
  const tam1Scale = 7;
  const tam2Scale = 7;
  const tam3Scale = 5;
  
  // TAM-1 dimensions (7-point Likert scale per Davis 1985)
  if (version === 'tam-1') {
    if (answers.perceivedUsefulness) {
      dimensions.perceivedUsefulness = calculateDimensionScore(answers.perceivedUsefulness, 'Perceived Usefulness', tam1Scale);
    }
    if (answers.perceivedEaseOfUse) {
      dimensions.perceivedEaseOfUse = calculateDimensionScore(answers.perceivedEaseOfUse, 'Perceived Ease of Use', tam1Scale);
    }
    if (answers.attitudeTowardUsing) {
      dimensions.attitudeTowardUsing = calculateDimensionScore(answers.attitudeTowardUsing, 'Attitude Toward Using', tam1Scale);
    }
    if (answers.actualSystemUse) {
      dimensions.actualSystemUse = calculateUsageScore(answers.actualSystemUse, 'Actual System Use');
    }
  } else if (version === 'tam-2') {
    // TAM-2 dimensions (7-point scale per Venkatesh & Davis 2000)
    if (answers.intentionToUse) {
      dimensions.intentionToUse = calculateDimensionScore(answers.intentionToUse, 'Intention to Use', tam2Scale);
    }
    if (answers.perceivedUsefulness) {
      dimensions.perceivedUsefulness = calculateDimensionScore(answers.perceivedUsefulness, 'Perceived Usefulness', tam2Scale);
    }
    if (answers.perceivedEaseOfUse) {
      dimensions.perceivedEaseOfUse = calculateDimensionScore(answers.perceivedEaseOfUse, 'Perceived Ease of Use', tam2Scale);
    }
    if (answers.subjectiveNorm) {
      dimensions.subjectiveNorm = calculateDimensionScore(answers.subjectiveNorm, 'Subjective Norm', tam2Scale);
    }
    if (answers.voluntariness) {
      dimensions.voluntariness = calculateDimensionScore(answers.voluntariness, 'Voluntariness', tam2Scale);
    }
    if (answers.image) {
      dimensions.image = calculateDimensionScore(answers.image, 'Image', tam2Scale);
    }
    if (answers.jobRelevance) {
      dimensions.jobRelevance = calculateDimensionScore(answers.jobRelevance, 'Job Relevance', tam2Scale);
    }
    if (answers.outputQuality) {
      dimensions.outputQuality = calculateDimensionScore(answers.outputQuality, 'Output Quality', tam2Scale);
    }
    if (answers.resultDemonstrability) {
      dimensions.resultDemonstrability = calculateDimensionScore(answers.resultDemonstrability, 'Result Demonstrability', tam2Scale);
    }
  } else if (version === 'tam-3') {
    if (answers.perceivedUsefulness) {
      dimensions.perceivedUsefulness = calculateDimensionScore(answers.perceivedUsefulness, 'Perceived Usefulness', tam3Scale);
    }
    if (answers.perceivedEaseOfUse) {
      dimensions.perceivedEaseOfUse = calculateDimensionScore(answers.perceivedEaseOfUse, 'Perceived Ease of Use', tam3Scale);
    }
    if (answers.behavioralIntention) {
      dimensions.behavioralIntention = calculateDimensionScore(answers.behavioralIntention, 'Behavioral Intention', tam3Scale);
    }
    if (answers.usePatterns) {
      dimensions.usePatterns = calculateDimensionScore(answers.usePatterns, 'Use Behavior', tam3Scale);
    }
    if (answers.subjectiveNorm) {
      dimensions.subjectiveNorm = calculateDimensionScore(answers.subjectiveNorm, 'Subjective Norm', tam3Scale);
    }
    if (answers.image) {
      dimensions.image = calculateDimensionScore(answers.image, 'Image', tam3Scale);
    }
    if (answers.jobRelevance) {
      dimensions.jobRelevance = calculateDimensionScore(answers.jobRelevance, 'Job Relevance', tam3Scale);
    }
    if (answers.outputQuality) {
      dimensions.outputQuality = calculateDimensionScore(answers.outputQuality, 'Output Quality', tam3Scale);
    }
    if (answers.resultDemonstrability) {
      dimensions.resultDemonstrability = calculateDimensionScore(answers.resultDemonstrability, 'Result Demonstrability', tam3Scale);
    }
    if (answers.computerSelfEfficacy) {
      dimensions.computerSelfEfficacy = calculateDimensionScore(answers.computerSelfEfficacy, 'Computer Self-Efficacy', tam3Scale);
    }
    if (answers.perceptionsOfExternalControl) {
      dimensions.perceptionsOfExternalControl = calculateDimensionScore(answers.perceptionsOfExternalControl, 'Perceptions of External Control', tam3Scale);
    }
    if (answers.computerAnxiety) {
      dimensions.computerAnxiety = calculateDimensionScore(answers.computerAnxiety, 'Computer Anxiety', tam3Scale);
    }
    if (answers.computerPlayfulness) {
      dimensions.computerPlayfulness = calculateDimensionScore(answers.computerPlayfulness, 'Computer Playfulness', tam3Scale);
    }
    if (answers.perceivedEnjoyment) {
      dimensions.perceivedEnjoyment = calculateDimensionScore(answers.perceivedEnjoyment, 'Perceived Enjoyment', tam3Scale);
    }
    if (answers.objectiveUsability) {
      dimensions.objectiveUsability = calculateDimensionScore(answers.objectiveUsability, 'Objective Usability', tam3Scale);
    }
    if (answers.experience) {
      dimensions.experience = calculateDimensionScore(answers.experience, 'Experience', tam3Scale);
    }
    if (answers.voluntariness) {
      dimensions.voluntariness = calculateDimensionScore(answers.voluntariness, 'Voluntariness', tam3Scale);
    }
  }

  // Calculate overall score as average of all dimension scores
  const dimensionScores = Object.values(dimensions).map(d => d.score).filter(s => !isNaN(s));
  const overallScore = dimensionScores.length > 0 
    ? Math.round(dimensionScores.reduce((a, b) => a + b, 0) / dimensionScores.length * 10) / 10
    : 0;

  return {
    dimensions,
    overallScore: Math.min(100, Math.max(0, overallScore)), // Ensure 0-100 range
    version
  };
}

/**
 * Calculate score for a single dimension
 * Supports both 5-point and 7-point Likert scales
 * Score is normalized to 0-100
 * @param {Array} responses - Array of responses
 * @param {String} dimensionName - Name of the dimension
 * @param {Number} scale - Likert scale max value (5 or 7, default 5)
 */
export function calculateDimensionScore(responses, dimensionName, scale = 5) {
  if (!Array.isArray(responses) || responses.length === 0) {
    return {
      name: dimensionName,
      score: 0,
      count: 0,
      average: 0
    };
  }

  // Filter out undefined/null values
  const validResponses = responses.filter(r => typeof r === 'number' && !isNaN(r));
  
  if (validResponses.length === 0) {
    return {
      name: dimensionName,
      score: 0,
      count: 0,
      average: 0
    };
  }

  const sum = validResponses.reduce((a, b) => a + b, 0);
  const average = sum / validResponses.length;
  
  // Normalize to 0-100 scale based on the Likert scale used
  // For 5-point: (average - 1) / 4 * 100
  // For 7-point: (average - 1) / 6 * 100
  const denominator = scale - 1;
  const normalizedScore = ((average - 1) / denominator) * 100;

  return {
    name: dimensionName,
    score: Math.round(normalizedScore * 10) / 10, // Round to 1 decimal
    count: validResponses.length,
    average: Math.round(average * 100) / 100 // Average on original scale
  };
}

/**
 * Calculate usage score for Actual System Use construct
 * Usage data contains: [frequency (0-5), hours per week (string/number)]
 * Score is based on usage frequency (0-5 scale normalized to 0-100)
 */
export function calculateUsageScore(usageData, dimensionName) {
  if (!Array.isArray(usageData) || usageData.length === 0) {
    return {
      name: dimensionName,
      score: 0,
      count: 0,
      frequency: 0,
      hoursPerWeek: 0
    };
  }

  // Extract frequency (first element, should be 0-5)
  const frequency = usageData[0];
  const hoursPerWeek = usageData[1];

  // Validate frequency is a number
  if (typeof frequency !== 'number' || isNaN(frequency)) {
    return {
      name: dimensionName,
      score: 0,
      count: 0,
      frequency: 0,
      hoursPerWeek: parseFloat(hoursPerWeek) || 0
    };
  }

  // Normalize frequency (0-5) to 0-100 scale
  // frequency 0-5 maps to 0-100
  const normalizedScore = (frequency / 5) * 100;

  // Parse hours per week
  const hours = parseFloat(hoursPerWeek) || 0;

  return {
    name: dimensionName,
    score: Math.round(normalizedScore * 10) / 10, // Round to 1 decimal
    count: 1,
    frequency: frequency,
    hoursPerWeek: Math.round(hours * 10) / 10 // Round to 1 decimal
  };
}

/**
export function getTAMAcceptanceLevel(score) {
  if (score >= 80) return 'Very High';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Low';
  return 'Very Low';
}

/**
 * Get color for acceptance level
 */
export function getAcceptanceColor(score) {
  if (score >= 80) return '#4caf50'; // Green
  if (score >= 60) return '#2196f3'; // Blue
  if (score >= 40) return '#ffc107'; // Yellow
  if (score >= 20) return '#ff5722'; // Orange
  return '#f44336'; // Red
}

/**
 * Get color for acceptance level name
 */
export function getAcceptanceColorByLevel(level) {
  const colors = {
    'Very High': '#4caf50',
    'High': '#2196f3',
    'Moderate': '#ffc107',
    'Low': '#ff5722',
    'Very Low': '#f44336'
  };
  return colors[level] || '#757575';
}

/**
 * Format dimension name for display
 */
export function formatDimensionName(key) {
  const names = {
    'perceivedUsefulness': 'Perceived Usefulness',
    'perceivedEaseOfUse': 'Perceived Ease of Use',
    'subjectiveNorm': 'Subjective Norm',
    'image': 'Image',
    'jobRelevance': 'Job Relevance',
    'outputQuality': 'Output Quality',
    'resultDemonstrability': 'Result Demonstrability',
    'computerSelfEfficacy': 'Computer Self-Efficacy',
    'perceptionsOfExternalControl': 'External Control',
    'computerAnxiety': 'Computer Anxiety',
    'computerPlayfulness': 'Computer Playfulness',
    'perceivedEnjoyment': 'Perceived Enjoyment',
    'objectiveUsability': 'Objective Usability'
  };
  return names[key] || key;
}

/**
 * Get dimensions for a specific TAM version
 */
export function getDimensionsForVersion(version) {
  const dimensions = {
    'tam-1': ['perceivedUsefulness', 'perceivedEaseOfUse'],
    'tam-2': [
      'perceivedUsefulness',
      'perceivedEaseOfUse',
      'subjectiveNorm',
      'image',
      'jobRelevance',
      'outputQuality',
      'resultDemonstrability'
    ],
    'tam-3': [
      'perceivedUsefulness',
      'perceivedEaseOfUse',
      'subjectiveNorm',
      'image',
      'jobRelevance',
      'outputQuality',
      'resultDemonstrability',
      'computerSelfEfficacy',
      'perceptionsOfExternalControl',
      'computerAnxiety',
      'computerPlayfulness',
      'perceivedEnjoyment',
      'objectiveUsability'
    ]
  };
  return dimensions[version] || [];
}
