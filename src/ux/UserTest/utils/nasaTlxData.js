export function getNASATLXData(nasaTlxData) {
  // Return empty state if no data provided
  if (!nasaTlxData || nasaTlxData.length === 0) {
    return {
      averageOverallScore: 0,
      totalRespondents: 0,
      mostStressfulDimension: 'N/A',
      leastStressfulDimension: 'N/A',
      dimensionAverages: {
        mentalDemand: 0,
        physicalDemand: 0,
        temporalDemand: 0,
        performance: 0,
        effort: 0,
        frustration: 0
      },
      responses: []
    }
  }

  const dimensionTotals = {
    mentalDemand: 0,
    physicalDemand: 0,
    temporalDemand: 0,
    performance: 0,
    effort: 0,
    frustration: 0
  }

  nasaTlxData.forEach(response => {
    Object.keys(dimensionTotals).forEach(key => {
      dimensionTotals[key] += response.nasaTlxAnswers[key] || 0
    })
  })

  const dimensionAverages = Object.keys(dimensionTotals).reduce((acc, key) => {
    acc[key] = Math.round((dimensionTotals[key] / nasaTlxData.length) * 10) / 10
    return acc
  }, {})

  const dimensionEntries = Object.entries(dimensionAverages)
  const mostStressful = dimensionEntries.reduce((max, current) => current[1] > max[1] ? current : max)
  const leastStressful = dimensionEntries.reduce((min, current) => current[1] < min[1] ? current : min)

  // Calculate overall score as average of all 6 dimensions
  const overallScore = Math.round(((dimensionAverages.mentalDemand + dimensionAverages.physicalDemand + dimensionAverages.temporalDemand + dimensionAverages.performance + dimensionAverages.effort + dimensionAverages.frustration) / 6) * 10) / 10

  return {
    averageOverallScore: overallScore,
    totalRespondents: nasaTlxData.length,
    mostStressfulDimension: formatDimensionName(mostStressful[0]),
    leastStressfulDimension: formatDimensionName(leastStressful[0]),
    dimensionAverages,
    responses: nasaTlxData
  }
}

function formatDimensionName(key) {
  const names = {
    mentalDemand: 'Mental Demand',
    physicalDemand: 'Physical Demand',
    temporalDemand: 'Temporal Demand',
    performance: 'Performance',
    effort: 'Effort',
    frustration: 'Frustration'
  }
  return names[key] || key
}

export const tlxDimensions = [
  {
    key: 'mentalDemand',
    label: 'Mental Demand',
    description: 'How mentally demanding was the task?',
    color: '#e91e63'
  },
  {
    key: 'physicalDemand',
    label: 'Physical Demand',
    description: 'How physically demanding was the task?',
    color: '#ff9800'
  },
  {
    key: 'temporalDemand',
    label: 'Temporal Demand',
    description: 'How hurried or rushed was the pace of the task?',
    color: '#f44336'
  },
  {
    key: 'performance',
    label: 'Performance',
    description: 'How successful were you in accomplishing the task?',
    color: '#4caf50'
  },
  {
    key: 'effort',
    label: 'Effort',
    description: 'How hard did you have to work to accomplish it?',
    color: '#2196f3'
  },
  {
    key: 'frustration',
    label: 'Frustration',
    description: 'How stressed, annoyed, or irritated were you?',
    color: '#9c27b0'
  }
]
