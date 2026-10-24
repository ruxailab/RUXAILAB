export const taskDestination = ({
  taskIndex,
  taskCount,
  hasEyeTracking,
  hasPostTest,
  postTestCompleted,
}) => {
  if (taskIndex < taskCount - 1) {
    return { kind: 'task', taskIndex: taskIndex + 1 }
  }
  if (hasPostTest && !postTestCompleted) {
    return { kind: 'postTest', globalIndex: hasEyeTracking ? 6 : 5 }
  }
  return { kind: 'finish', globalIndex: hasEyeTracking ? 7 : 6 }
}

export const firstUnattemptedTaskIndex = (tasks, taskCount) => {
  for (let index = 0; index < taskCount; index++) {
    const task = tasks?.[index]
    if (!task?.attempted && !task?.completed) return index
  }
  return -1
}

// Where a returning participant continues. Once consent is given, it is not
// asked again: the participant goes to the first stage that is not done yet.
export const resumeDestination = ({
  answer,
  hasPreTest,
  hasEyeTracking,
  hasPostTest,
  taskCount,
}) => {
  if (!answer?.consentCompleted) {
    return { kind: 'consent', globalIndex: 1, taskIndex: 0 }
  }
  if (hasPreTest && !answer.preTestCompleted) {
    return { kind: 'preTest', globalIndex: 2, taskIndex: 0 }
  }

  const nextTask = firstUnattemptedTaskIndex(answer.tasks, taskCount)
  if (nextTask !== -1) {
    // Eye tracking must be calibrated again in every session.
    if (hasEyeTracking) {
      return { kind: 'calibration', globalIndex: 3, taskIndex: nextTask }
    }
    return { kind: 'task', globalIndex: 4, taskIndex: nextTask }
  }

  const lastTask = Math.max(taskCount - 1, 0)
  if (hasPostTest && !answer.postTestCompleted) {
    return {
      kind: 'postTest',
      globalIndex: hasEyeTracking ? 6 : 5,
      taskIndex: lastTask,
    }
  }
  return {
    kind: 'finish',
    globalIndex: hasEyeTracking ? 7 : 6,
    taskIndex: lastTask,
  }
}
