export function calculateSUSScore(responses) {
  if (responses.length !== 10) {
    throw new Error('SUS requires exactly 10 responses')
  }

  let score = 0

  for (let i = 0; i < 10; i += 2) {
    score += responses[i] - 1
  }

  for (let i = 1; i < 10; i += 2) {
    score += 5 - responses[i]
  }

  return score * 2.5
}

export function getSUSRating(score) {
  if (score >= 80.3) return 'Excellent'
  if (score >= 68) return 'Good'
  if (score >= 51) return 'OK'
  return 'Poor'
}

export function getRatingColor(rating) {
  switch (rating) {
    case 'Excellent': return 'excellent'
    case 'Good': return 'good'
    case 'OK': return 'ok'
    case 'Poor': return 'poor'
    default: return 'grey'
  }
}

export function getScoreDistribution(responses) {
  const ranges = [
    { min: 0, max: 25, label: '0-25', color: '#f44336' },
    { min: 26, max: 39, label: '26-39', color: '#ff5722' },
    { min: 40, max: 51, label: '40-51', color: '#ff9800' },
    { min: 52, max: 67, label: '52-67', color: '#ffc107' },
    { min: 68, max: 80, label: '68-80', color: '#2196f3' },
    { min: 81, max: 100, label: '81-100', color: '#4caf50' }
  ]

  return ranges.map(range => ({
    range: range.label,
    count: responses.filter(score => score >= range.min && score <= range.max).length,
    color: range.color
  }))
}
