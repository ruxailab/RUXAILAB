// Utility functions for SART data processing
export const sartDimensions = [
  {
    key: 'instability',
    label: 'Instability',
    description: 'Stability of the situation',
    category: 'demand'
  },
  {
    key: 'complexity',
    label: 'Complexity',
    description: 'Complexity of the situation',
    category: 'demand'
  },
  {
    key: 'variability',
    label: 'Variability',
    description: 'Variability of the situation',
    category: 'demand'
  },
  {
    key: 'arousal',
    label: 'Arousal',
    description: 'Mental arousal level',
    category: 'supply'
  },
  {
    key: 'concentration',
    label: 'Concentration of Attention',
    description: 'Ability to concentrate',
    category: 'supply'
  },
  {
    key: 'division',
    label: 'Division of Attention',
    description: 'Division of attention',
    category: 'supply'
  },
  {
    key: 'spareCapacity',
    label: 'Spare Mental Capacity',
    description: 'Available mental capacity',
    category: 'supply'
  },
  {
    key: 'informationQuantity',
    label: 'Information Quantity',
    description: 'Quantity of information available',
    category: 'understanding'
  },
  {
    key: 'informationQuality',
    label: 'Information Quality',
    description: 'Quality of information available',
    category: 'understanding'
  },
  {
    key: 'familiarity',
    label: 'Familiarity',
    description: 'Familiarity with situation',
    category: 'understanding'
  }
];

// Calculate SART analytics from response data
export function getSARTData(sartResponses) {
  if (!sartResponses || sartResponses.length === 0) {
    return getEmptyAnalytics();
  }

  // Initialize dimension sums
  const dimensionSums = {};
  sartDimensions.forEach(dim => {
    dimensionSums[dim.key] = 0;
  });

  const processedResponses = sartResponses.map(response => {
    const answers = response.sartAnswers || {};

    // Calculate individual scores using proper formulas
    // Demand = Sum of 3 dimensions (instability, complexity, variability)
    const demand = (answers.instability || 4) + (answers.complexity || 4) + (answers.variability || 4);

    // Supply = Sum of 4 dimensions (arousal, concentration, division, spareCapacity)
    const supply = (answers.arousal || 4) + (answers.concentration || 4) +
      (answers.division || 4) + (answers.spareCapacity || 4);

    // Understanding = Sum of 3 dimensions (informationQuantity, informationQuality, familiarity)
    const understanding = (answers.informationQuantity || 4) +
      (answers.informationQuality || 4) +
      (answers.familiarity || 4);

    // SA Score = Understanding - Demand + Supply
    const saScore = understanding - demand + supply;

    // Add to dimension sums
    sartDimensions.forEach(dim => {
      dimensionSums[dim.key] += answers[dim.key] || 4; // Default to 4 if missing
    });

    return {
      ...response,
      demand,
      supply,
      understanding,
      saScore: Math.round(saScore * 10) / 10,
      originalSA: saScore
    };
  });

  // Calculate averages
  const totalRespondents = processedResponses.length;
  const dimensionAverages = {};
  sartDimensions.forEach(dim => {
    dimensionAverages[dim.key] = totalRespondents > 0
      ? Math.round((dimensionSums[dim.key] / totalRespondents) * 10) / 10
      : 4; // Default average
  });

  // Find highest and lowest SA dimensions
  const sortedDimensions = [...sartDimensions].sort((a, b) =>
    (dimensionAverages[b.key] || 0) - (dimensionAverages[a.key] || 0)
  );

  const averageSAScore = totalRespondents > 0
    ? Math.round((processedResponses.reduce((sum, r) => sum + (r.saScore || 0), 0) / totalRespondents) * 10) / 10
    : 0;

  // Calculate average demand, supply, and understanding
  const averageDemand = totalRespondents > 0
    ? Math.round((processedResponses.reduce((sum, r) => sum + (r.demand || 0), 0) / totalRespondents) * 10) / 10
    : 12; // Default (3 dimensions × 4)

  const averageSupply = totalRespondents > 0
    ? Math.round((processedResponses.reduce((sum, r) => sum + (r.supply || 0), 0) / totalRespondents) * 10) / 10
    : 16; // Default (4 dimensions × 4)

  const averageUnderstanding = totalRespondents > 0
    ? Math.round((processedResponses.reduce((sum, r) => sum + (r.understanding || 0), 0) / totalRespondents) * 10) / 10
    : 12; // Default (3 dimensions × 4)

  return {
    averageSAScore,
    averageDemand,
    averageSupply,
    averageUnderstanding,
    totalRespondents,
    highestSADimension: sortedDimensions[0]?.label || '',
    lowestSADimension: sortedDimensions.at(-1)?.label || '',
    dimensionAverages,
    responses: processedResponses
  };
}

function getEmptyAnalytics() {
  const dimensionAverages = {};
  sartDimensions.forEach(dim => {
    dimensionAverages[dim.key] = 0;
  });

  return {
    averageSAScore: 0,
    averageDemand: 0,
    averageSupply: 0,
    averageUnderstanding: 0,
    totalRespondents: 0,
    highestSADimension: '',
    lowestSADimension: '',
    dimensionAverages,
    responses: []
  };
}

// Helper function to get SA level
export function getSALevel(score) {
  if (score >= 20) return 'Excellent';
  if (score >= 10) return 'Good';
  if (score >= 0) return 'Moderate';
  if (score >= -10) return 'Poor';
  return 'Very Poor';
}

// Helper function to get color for SA score
export function getSAColor(score) {
  if (score >= 20) return 'blue-lighten-2';
  if (score >= 10) return 'blue';
  if (score >= 0) return 'blue-darken-2';
  return 'blue-darken-4';
}

// Helper function to get color for dimension score (1-7)
export function getDimensionColor(score) {
  if (score >= 6) return 'success';
  if (score >= 4) return 'info';
  if (score >= 2) return 'warning';
  return 'error';
}

// Helper to get dimension level text
export function getDimensionLevel(score) {
  if (score >= 6) return 'High';
  if (score >= 4) return 'Moderate';
  return 'Low';
}
