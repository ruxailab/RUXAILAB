/**
 * @deprecated This file is deprecated and split into:
 * - TamScoreCalculator.js (primary calculator class)
 * - timeUtils.js (time formatting functions)
 * 
 * For TAM score calculations, use TamScoreCalculator instead
 * Example:
 *   import TamScoreCalculator from './TamScoreCalculator.js'
 *   const result = TamScoreCalculator.calculateTAMScore(answers, 'tam-1')
 */

// Re-export from TamScoreCalculator for backward compatibility
export { TamScoreCalculator as default } from './TamScoreCalculator.js'

// Legacy exports for backward compatibility - use TamScoreCalculator methods instead
export const calculateTAMScore = (answers, version = 'tam-1') => {
  console.warn('calculateTAMScore() is deprecated. Use TamScoreCalculator.analyzeTAM() instead')
  // Convert old format to new
  const tamVersion = version === 'tam-1' ? 1 : version === 'tam-2' ? 2 : 3
  const analysis = TamScoreCalculator.analyzeTAM(answers, tamVersion)
  return {
    dimensions: analysis.dimensionAverages,
    overallScore: analysis.overallScore,
    version
  }
}

export const calculateDimensionScore = (responses, dimensionName, scale = 5) => {
  console.warn('calculateDimensionScore() is deprecated. Use TamScoreCalculator methods instead')
  if (!Array.isArray(responses) || responses.length === 0) {
    return { name: dimensionName, score: 0, count: 0, average: 0 }
  }

  const validResponses = responses.filter(r => typeof r === 'number' && !Number.isNaN(r))

  if (validResponses.length === 0) {
    return { name: dimensionName, score: 0, count: 0, average: 0 }
  }

  const sum = validResponses.reduce((a, b) => a + b, 0)
  const average = sum / validResponses.length
  const denominator = scale - 1

  const normalizedScore = ((average - 1) / denominator) * 100

  return {
    name: dimensionName,
    score: Math.round(normalizedScore * 10) / 10,
    count: validResponses.length,
    average: Math.round(average * 100) / 100
  }
}

export const getTAMAcceptanceLevel = (score) => {
  console.warn('getTAMAcceptanceLevel() is deprecated. Use TamScoreCalculator.interpretScore() instead')
  return TamScoreCalculator.interpretScore(score)
}

export const getAcceptanceColor = (score) => {
  console.warn('getAcceptanceColor() is deprecated. Use TamScoreCalculator.getScoreColor() instead')
  return TamScoreCalculator.getScoreColor(score)
}
