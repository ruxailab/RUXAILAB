export const firstOpenTaskIndex = (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) return 0
  return tasks.findIndex(
    (task) => task?.attempted !== true && task?.completed !== true,
  )
}

// Where Start on the welcome step leads. A participant who already consented
// skips the consent and continues at the first stage that is not done; the
// tasks stage then resumes at the first open task.
export const welcomeStartStage = ({ answer, hasPreTest, hasEyeTracking }) => {
  if (answer?.submitted || answer?.consentCompleted !== true) return 'consent'
  if (hasPreTest && answer.preTestCompleted !== true) return 'preTest'
  if (hasEyeTracking) return 'calibration'
  return 'tasks'
}

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
