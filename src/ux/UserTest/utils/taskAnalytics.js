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
