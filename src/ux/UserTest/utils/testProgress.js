/**
 * Utility for calculating test progress
 */

export const calculateProgress = (localTestAnswer, testStructure = {}) => {
  try {
    if (!localTestAnswer) return 0

    const hasPreTest =
      Array.isArray(testStructure.preTest) && testStructure.preTest.length > 0
    const hasPostTest =
      Array.isArray(testStructure.postTest) && testStructure.postTest.length > 0
    const tasks = Array.isArray(testStructure.userTasks)
      ? testStructure.userTasks
      : []

    const totalUnits =
      1 + Number(hasPreTest) + tasks.length + Number(hasPostTest)
    let completedUnits = Number(localTestAnswer.consentCompleted === true)

    if (hasPreTest && localTestAnswer.preTestCompleted) completedUnits++

    for (let index = 0; index < tasks.length; index++) {
      const taskAnswer = localTestAnswer.tasks?.[index]
      if (taskAnswer?.completed || taskAnswer?.attempted) completedUnits++
    }

    if (hasPostTest && localTestAnswer.postTestCompleted) completedUnits++

    const progressPercentage = Math.round((completedUnits / totalUnits) * 100)
    localTestAnswer.progress = progressPercentage
    return progressPercentage
  } catch {
    // console.error('Error calculating progress:', error)
    return 0
  }
}
