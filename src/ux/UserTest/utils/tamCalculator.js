/**
 * TAM (Technology Acceptance Model) Score Calculator
 * Supports TAM-1, TAM-2, and TAM-3 versions
 */

// Define dimension mappings for each TAM version
const TAM_DIMENSION_CONFIGS = {
  'tam-1': [
    { key: 'perceivedUsefulness', name: 'Perceived Usefulness' },
    { key: 'perceivedEaseOfUse', name: 'Perceived Ease of Use' },
    { key: 'attitudeTowardUsing', name: 'Attitude Toward Using' },
    { key: 'actualSystemUse', name: 'Actual System Use', isUsage: true }
  ],
  'tam-2': [
    { key: 'intentionToUse', name: 'Intention to Use' },
    { key: 'perceivedUsefulness', name: 'Perceived Usefulness' },
    { key: 'perceivedEaseOfUse', name: 'Perceived Ease of Use' },
    { key: 'subjectiveNorm', name: 'Subjective Norm' },
    { key: 'voluntariness', name: 'Voluntariness' },
    { key: 'image', name: 'Image' },
    { key: 'jobRelevance', name: 'Job Relevance' },
    { key: 'outputQuality', name: 'Output Quality' },
    { key: 'resultDemonstrability', name: 'Result Demonstrability' }
  ],
  'tam-3': [
    { key: 'perceivedUsefulness', name: 'Perceived Usefulness' },
    { key: 'perceivedEaseOfUse', name: 'Perceived Ease of Use' },
    { key: 'behavioralIntention', name: 'Behavioral Intention' },
    { key: 'usePatterns', name: 'Use Behavior' },
    { key: 'subjectiveNorm', name: 'Subjective Norm' },
    { key: 'image', name: 'Image' },
    { key: 'jobRelevance', name: 'Job Relevance' },
    { key: 'outputQuality', name: 'Output Quality' },
    { key: 'resultDemonstrability', name: 'Result Demonstrability' },
    { key: 'computerSelfEfficacy', name: 'Computer Self-Efficacy' },
    { key: 'perceptionsOfExternalControl', name: 'Perceptions of External Control' },
    { key: 'computerAnxiety', name: 'Computer Anxiety' },
    { key: 'computerPlayfulness', name: 'Computer Playfulness' },
    { key: 'perceivedEnjoyment', name: 'Perceived Enjoyment' },
    { key: 'objectiveUsability', name: 'Objective Usability' },
    { key: 'experience', name: 'Experience' },
    { key: 'voluntariness', name: 'Voluntariness' }
  ]
}

// Scale configuration per TAM version
const SCALE_CONFIG = {
  'tam-1': 7,
  'tam-2': 7,
  'tam-3': 5
}

function processDimension(answers, config, scale) {
  if (!answers[config.key]) return null
  
  return config.isUsage 
    ? calculateUsageScore(answers[config.key], config.name)
    : calculateDimensionScore(answers[config.key], config.name, scale)
}

export function calculateTAMScore(answers, version = 'tam-1') {
  if (!answers || typeof answers !== 'object') {
    return {
      dimensions: {},
      overallScore: 0,
      version
    };
  }

  const config = TAM_DIMENSION_CONFIGS[version] || TAM_DIMENSION_CONFIGS['tam-1']
  const scale = SCALE_CONFIG[version] || 7
  
  // Process all dimensions for this version
  const dimensions = {};
  config.forEach(dimensionConfig => {
    const result = processDimension(answers, dimensionConfig, scale)
    if (result) {
      dimensions[dimensionConfig.key] = result
    }
  })

  // Calculate overall score as average of all dimension scores
  const dimensionScores = Object.values(dimensions)
    .map(d => d.score)
    .filter(s => !Number.isNaN(s));
  
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
  const validResponses = responses.filter(r => typeof r === 'number' && !Number.isNaN(r));
  
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
  if (typeof frequency !== 'number' || Number.isNaN(frequency)) {
    return {
      name: dimensionName,
      score: 0,
      count: 0,
      frequency: 0,
      hoursPerWeek: Number.parseFloat(hoursPerWeek) || 0
    };
  }

  // Normalize frequency (0-5) to 0-100 scale
  // frequency 0-5 maps to 0-100
  const normalizedScore = (frequency / 5) * 100;

  // Parse hours per week
  const hours = Number.parseFloat(hoursPerWeek) || 0;

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
