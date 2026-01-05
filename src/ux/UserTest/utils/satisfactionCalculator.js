import { calculateSUSScore } from './susCalculator'

/**
 * Calculate average satisfaction from SUS answers only
 * @param {Object} answersData - Object containing user answers with tasks
 * @returns {number} Average SUS satisfaction score (0-100)
 */
export function getAverageSUSSatisfaction(answersData) {
  const susScores = []

  // Get SUS satisfaction scores from all tasks
  Object.values(answersData).forEach((item) => {
    if (item.tasks) {
      Object.values(item.tasks).forEach(task => {
        if (task.susAnswers && Array.isArray(task.susAnswers) && task.susAnswers.length === 10) {
          const susScore = calculateSUSScore(task.susAnswers)
          if (susScore > 0) {
            susScores.push(susScore)
          }
        }
      })
    }
  })

  // Return average of SUS scores only
  if (susScores.length === 0) return 0
  return Math.round((susScores.reduce((a, b) => a + b, 0) / susScores.length) * 10) / 10
}

/**
 * Calculate average satisfaction from NASA-TLX answers only
 * @param {Object} answersData - Object containing user answers with tasks
 * @returns {number} Average NASA-TLX satisfaction score (0-100)
 */
export function getAverageNASATLXSatisfaction(answersData) {
  const nasaTlxScores = []

  // Get NASA-TLX satisfaction scores from all tasks
  Object.values(answersData).forEach((item) => {
    if (item.tasks) {
      Object.values(item.tasks).forEach(task => {
        if (task.nasaTlxAnswers && typeof task.nasaTlxAnswers === 'object') {
          const scores = Object.values(task.nasaTlxAnswers)
          if (scores.length > 0) {
            scores.forEach(score => {
              if (score > 0) {
                nasaTlxScores.push(score)
              }
            })
          }
        }
      })
    }
  })

  // Return average of all NASA-TLX dimension scores
  if (nasaTlxScores.length === 0) return 0
  return Math.round((nasaTlxScores.reduce((a, b) => a + b, 0) / nasaTlxScores.length) * 10) / 10
}

/**
 * Calculate average satisfaction based on task type
 * If tasks have SUS answers, return SUS satisfaction
 * If tasks have NASA-TLX answers, return NASA-TLX satisfaction
 * @param {Object} answersData - Object containing user answers with tasks
 * @returns {number} Average satisfaction score (0-100)
 */
export function getAverageSatisfaction(answersData) {
  // Check what type of tasks we have
  let hasSUS = false
  let hasNASATLX = false

  Object.values(answersData).forEach((item) => {
    if (item.tasks) {
      Object.values(item.tasks).forEach(task => {
        if (task.susAnswers && Array.isArray(task.susAnswers) && task.susAnswers.length === 10) {
          hasSUS = true
        }
        if (task.nasaTlxAnswers && typeof task.nasaTlxAnswers === 'object') {
          hasNASATLX = true
        }
      })
    }
  })

  // If we have SUS answers, return SUS satisfaction
  if (hasSUS && !hasNASATLX) {
    return getAverageSUSSatisfaction(answersData)
  }

  // If we have NASA-TLX answers, return NASA-TLX satisfaction
  if (hasNASATLX) {
    return getAverageNASATLXSatisfaction(answersData)
  }

  // If neither, return 0
  return 0
}