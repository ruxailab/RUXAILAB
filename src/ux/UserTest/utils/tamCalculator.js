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
  
  // TAM-1 dimensions
  if (version === 'tam-1' || version === 'tam-2' || version === 'tam-3') {
    if (answers.perceivedUsefulness) {
      dimensions.perceivedUsefulness = calculateDimensionScore(answers.perceivedUsefulness, 'Perceived Usefulness');
    }
    if (answers.perceivedEaseOfUse) {
      dimensions.perceivedEaseOfUse = calculateDimensionScore(answers.perceivedEaseOfUse, 'Perceived Ease of Use');
    }
  }

  // TAM-2 additional dimensions
  if (version === 'tam-2' || version === 'tam-3') {
    if (answers.subjectiveNorm) {
      dimensions.subjectiveNorm = calculateDimensionScore(answers.subjectiveNorm, 'Subjective Norm');
    }
    if (answers.image) {
      dimensions.image = calculateDimensionScore(answers.image, 'Image');
    }
    if (answers.jobRelevance) {
      dimensions.jobRelevance = calculateDimensionScore(answers.jobRelevance, 'Job Relevance');
    }
    if (answers.outputQuality) {
      dimensions.outputQuality = calculateDimensionScore(answers.outputQuality, 'Output Quality');
    }
    if (answers.resultDemonstrability) {
      dimensions.resultDemonstrability = calculateDimensionScore(answers.resultDemonstrability, 'Result Demonstrability');
    }
  }

  // TAM-3 additional dimensions
  if (version === 'tam-3') {
    if (answers.computerSelfEfficacy) {
      dimensions.computerSelfEfficacy = calculateDimensionScore(answers.computerSelfEfficacy, 'Computer Self-Efficacy');
    }
    if (answers.perceptionsOfExternalControl) {
      dimensions.perceptionsOfExternalControl = calculateDimensionScore(answers.perceptionsOfExternalControl, 'Perceptions of External Control');
    }
    if (answers.computerAnxiety) {
      dimensions.computerAnxiety = calculateDimensionScore(answers.computerAnxiety, 'Computer Anxiety');
    }
    if (answers.computerPlayfulness) {
      dimensions.computerPlayfulness = calculateDimensionScore(answers.computerPlayfulness, 'Computer Playfulness');
    }
    if (answers.perceivedEnjoyment) {
      dimensions.perceivedEnjoyment = calculateDimensionScore(answers.perceivedEnjoyment, 'Perceived Enjoyment');
    }
    if (answers.objectiveUsability) {
      dimensions.objectiveUsability = calculateDimensionScore(answers.objectiveUsability, 'Objective Usability');
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
 * Dimensions use 5-point Likert scale (1-5)
 * Score is normalized to 0-100
 */
export function calculateDimensionScore(responses, dimensionName) {
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
  
  // Normalize to 0-100 scale (Likert scale is 1-5)
  const normalizedScore = ((average - 1) / 4) * 100;

  return {
    name: dimensionName,
    score: Math.round(normalizedScore * 10) / 10, // Round to 1 decimal
    count: validResponses.length,
    average: Math.round(average * 100) / 100 // Average on original scale
  };
}

/**
 * Get acceptance level based on TAM score
 */
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
