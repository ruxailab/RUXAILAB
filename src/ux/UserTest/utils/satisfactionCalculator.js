import { calculateSUSScore } from './susCalculator'

/**
 * Calculate average satisfaction from both SUS and NASA-TLX answers
 * @param {Object} answersData - Object containing user answers with tasks
 * @returns {number} Average satisfaction score (0-100)
 */
export function getAverageSatisfaction(answersData) {
  const satisfactionScores = []

  // Get SUS satisfaction scores from all tasks
  Object.values(answersData).forEach((item) => {
    if (item.tasks) {
      Object.values(item.tasks).forEach(task => {
        if (task.susAnswers && Array.isArray(task.susAnswers) && task.susAnswers.length === 10) {
          const susScore = calculateSUSScore(task.susAnswers)
          if (susScore > 0) {
            satisfactionScores.push(susScore)
          }
        }
      })
    }
  })

  // Get NASA-TLX satisfaction scores from all tasks
  Object.values(answersData).forEach((item) => {
    if (item.tasks) {
      Object.values(item.tasks).forEach(task => {
        if (task.nasaTlxAnswers && typeof task.nasaTlxAnswers === 'object') {
          const scores = Object.values(task.nasaTlxAnswers)
          if (scores.length > 0) {
            const overallScore = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
            if (overallScore > 0) {
              satisfactionScores.push(overallScore)
            }
          }
        }
      })
    }
  })

  // Return average of all satisfaction scores
  if (satisfactionScores.length === 0) return 0
  return satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length
}