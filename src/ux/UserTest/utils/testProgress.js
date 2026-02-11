/**
 * Utility for calculating test progress
 */

export const calculateProgress = (localTestAnswer) => {
  try {
    if (!localTestAnswer) return 0
    const totalSteps = 4
    let completedSteps = 0

    if (localTestAnswer.preTestCompleted) completedSteps++
    if (localTestAnswer.consentCompleted) completedSteps++

    let tasksCompleted = 0
    if (
      Array.isArray(localTestAnswer.tasks) &&
      localTestAnswer.tasks.length > 0
    ) {
      for (let i = 0; i < localTestAnswer.tasks.length; i++) {
        if (
          localTestAnswer.tasks[i]?.completed ||
          localTestAnswer.tasks[i]?.attempted
        ) {
          tasksCompleted++
        }
      }
      if (tasksCompleted === localTestAnswer.tasks.length) {
        completedSteps++
      }
    }

    if (localTestAnswer.postTestCompleted) completedSteps++

    const progressPercentage = (completedSteps / totalSteps) * 100
    localTestAnswer.progress = progressPercentage
    return progressPercentage
  } catch {
    // console.error('Error calculating progress:', error)
    return 0
  }
}
