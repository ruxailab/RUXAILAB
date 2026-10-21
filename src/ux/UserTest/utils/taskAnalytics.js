export function getTaskAnswerOutcome(taskAnswer) {
  if (taskAnswer?.completed && taskAnswer.success !== false) return 'success'
  if (
    taskAnswer?.attempted ||
    taskAnswer?.completed ||
    Number(taskAnswer?.taskTime) > 0
  ) {
    return 'couldNotFinish'
  }
  return 'notStarted'
}

export function getEstimateComparisonStatus(averageTime, estimatedTime) {
  if (averageTime === null) return 'noData'
  if (estimatedTime === null) return 'noEstimate'

  const difference = averageTime - estimatedTime
  if (difference < 0) return 'underEstimate'
  if (difference > 0) return 'overEstimate'
  return 'withinEstimate'
}

export function getTimeEfficiencyPercentage(averageTime, estimatedTime) {
  if (
    !Number.isFinite(averageTime) ||
    averageTime <= 0 ||
    !Number.isFinite(estimatedTime) ||
    estimatedTime <= 0
  ) {
    return null
  }

  return (estimatedTime / averageTime) * 100
}

export function getAdditionalTimePercentage(averageTime, estimatedTime) {
  if (
    !Number.isFinite(averageTime) ||
    !Number.isFinite(estimatedTime) ||
    estimatedTime <= 0
  ) {
    return null
  }

  return ((averageTime - estimatedTime) / estimatedTime) * 100
}
