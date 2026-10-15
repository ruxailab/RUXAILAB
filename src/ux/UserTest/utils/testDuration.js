export const hasTestActivity = (answer) => {
  if (!answer || answer.submitted) return false

  if (
    Number(answer.totalTestTimeMs) > 0 ||
    answer.consentCompleted ||
    answer.preTestCompleted ||
    answer.postTestCompleted
  ) {
    return true
  }

  const tasks = Array.isArray(answer.tasks)
    ? answer.tasks
    : Object.values(answer.tasks || {})

  return tasks.some((task) => task?.completed || task?.attempted)
}

export const accumulateTotalTestTime = (
  answer,
  startedAt,
  now = Date.now(),
) => {
  if (!answer || !Number.isFinite(startedAt)) return null

  answer.totalTestTimeMs =
    Math.max(0, Number(answer.totalTestTimeMs) || 0) +
    Math.max(0, now - startedAt)

  return answer.submitted ? null : now
}

export const sumTaskTimeMs = (answer) => {
  const tasks = answer?.tasks || {}
  const list = Array.isArray(tasks) ? tasks : Object.values(tasks)
  return list.reduce((total, task) => total + Number(task?.taskTime || 0), 0)
}
